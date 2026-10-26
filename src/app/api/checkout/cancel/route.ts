import { cancelCheckout } from '@/lib/server/checkout-cancellation';

export async function POST(request: Request) {
  try {
    const { provider, orderId, token } = await request.json();
    if (!['paypal', 'razorpay'].includes(provider) || typeof orderId !== 'string' || typeof token !== 'string') return new Response(null, { status: 400 });
    await cancelCheckout(provider, orderId, token);
    return Response.json({ success: true });
  } catch {
    return Response.json({ error: 'The checkout could not be cancelled safely. Check your order before paying again.' }, { status: 409 });
  }
}
