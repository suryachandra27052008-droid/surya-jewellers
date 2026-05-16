import { priceCheckout, toPaymentAmount, type CheckoutCurrency } from '@/lib/server/checkout-pricing';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const currency: CheckoutCurrency = body.currency ?? 'USD';
    const pricing = await priceCheckout(body.items, {
      couponCode: body.couponCode,
      customerEmail: body.customerEmail,
    });
    const paymentAmount = toPaymentAmount(pricing.total, currency);

    const auth = Buffer.from(
      `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`
    ).toString('base64');

    const tokenRes = await fetch('https://api-m.paypal.com/v1/oauth2/token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });
    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      console.error('PayPal token error:', tokenData);
      return Response.json({ error: 'Failed to get PayPal access token' }, { status: 500 });
    }

    const orderRes = await fetch('https://api-m.paypal.com/v2/checkout/orders', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: paymentAmount.currency,
              value: paymentAmount.displayValue,
            },
            description: 'Surya Jewellers - Sterling Silver Jewelry',
            custom_id: `server_total_inr_${pricing.total}`,
          },
        ],
        application_context: {
          return_url: 'https://www.suryajewellers.com/order-success?payment=paypal',
          cancel_url: 'https://www.suryajewellers.com/checkout',
          brand_name: 'Surya Jewellers',
          user_action: 'PAY_NOW',
        },
      }),
    });
    const order = await orderRes.json();

    if (!order.id) {
      console.error('PayPal create-order error:', order);
      return Response.json({ error: 'Failed to create PayPal order' }, { status: 500 });
    }

    return Response.json({ id: order.id, links: order.links, pricing });
  } catch (err) {
    console.error('PayPal create-order exception:', err);
    return Response.json({ error: String(err) }, { status: 400 });
  }
}
