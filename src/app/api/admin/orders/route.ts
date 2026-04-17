import { NextResponse } from 'next/server';
import { client, writeClient } from '@/lib/sanity/client';
import { sendOrderStatusEmail } from '@/lib/email';

export async function GET() {
  try {
    const orders = await client.fetch(
      `*[_type == "order"] | order(paidAt desc) {
        _id,
        razorpayOrderId,
        razorpayPaymentId,
        customer,
        items,
        subtotal,
        shipping,
        total,
        status,
        paidAt,
        _createdAt
      }`,
      {},
      { cache: 'no-store' }
    );

    const totalRevenue = orders.reduce((sum: number, o: any) => sum + (o.total || 0), 0);
    const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

    return NextResponse.json({ orders, totalRevenue, avgOrderValue, count: orders.length });
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, status } = await request.json();
    const validStatuses = ['paid', 'confirmed', 'shipped', 'delivered', 'pending', 'failed', 'cancelled'];
    if (!id || !validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid id or status' }, { status: 400 });
    }

    await writeClient.patch(id).set({ status }).commit();

    // Send customer email for actionable status changes
    const emailStatuses = ['shipped', 'delivered', 'cancelled', 'failed'];
    if (emailStatuses.includes(status)) {
      try {
        const order = await writeClient.fetch(
          `*[_type == "order" && _id == $id][0]{
            _id,
            razorpayOrderId,
            customer,
            items,
            subtotal,
            shipping,
            total
          }`,
          { id }
        );

        if (order?.customer?.email) {
          await sendOrderStatusEmail(order, status);
          console.log(`[orders] status email (${status}) sent to`, order.customer.email);
        }
      } catch (emailErr: any) {
        // Log but never fail the status update because of email errors
        console.error('[orders] status email error:', emailErr?.message);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update order status:', error);
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }
}
