import { NextResponse } from 'next/server';
import { client, writeClient } from '@/lib/sanity/client';

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
    const validStatuses = ['paid', 'confirmed', 'shipped', 'delivered', 'pending', 'failed'];
    if (!id || !validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid id or status' }, { status: 400 });
    }
    await writeClient.patch(id).set({ status }).commit();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update order status:', error);
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }
}
