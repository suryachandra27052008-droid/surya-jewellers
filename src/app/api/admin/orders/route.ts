import { NextResponse } from 'next/server';
import { writeClient } from '@/lib/sanity/client';
import { sendOrderStatusEmail } from '@/lib/email';
import { isPaidOrder } from '@/lib/order-status';

interface AdminOrder {
  total?: number;
  status?: string;
  customer?: {
    email?: string;
  };
}

export async function GET() {
  try {
    const orders = await writeClient.fetch(
      `*[_type == "order"] | order(coalesce(paidAt, _createdAt) desc) {
        _id,
        razorpayOrderId,
        razorpayPaymentId,
        paymentMethod,
        paymentStatus,
        paymentPendingReason,
        paymentCurrency,
        paymentAmount,
        needsMerchantReview,
        customer,
        items,
        subtotal,
        discount,
        shipping,
        total,
        status,
        paidAt,
        _createdAt
      }`,
      {},
      { cache: 'no-store' }
    );

    const paidOrders = (orders as AdminOrder[]).filter(isPaidOrder);
    const totalRevenue = paidOrders.reduce((sum: number, o) => sum + (o.total || 0), 0);
    const avgOrderValue = paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0;

    return NextResponse.json({ orders, totalRevenue, avgOrderValue, count: orders.length, paidCount: paidOrders.length }, {
      headers: { 'Cache-Control': 'private, no-store' },
    });
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

    const exists = await writeClient.fetch<boolean>(
      `count(*[_type == "order" && _id == $id]) == 1`, { id },
    );
    if (!exists) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

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
            discount,
            shipping,
            total
          }`,
          { id }
        );

        if (order?.customer?.email) {
          await sendOrderStatusEmail(order, status);
          console.log(`[orders] status email (${status}) sent to`, order.customer.email);
        }
      } catch (emailErr: unknown) {
        // Log but never fail the status update because of email errors
        console.error('[orders] status email error:', (emailErr as Error)?.message);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update order status:', error);
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }
}
