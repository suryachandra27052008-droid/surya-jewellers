import { retryCommerceOrders } from '@/lib/server/commerce-orders';

export async function POST() {
  try { return Response.json(await retryCommerceOrders()); }
  catch { return Response.json({ error: 'Order reconciliation failed.' }, { status: 503 }); }
}
