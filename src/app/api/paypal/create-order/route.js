export async function POST(request) {
  try {
    const { amount, currency } = await request.json();

    const auth = Buffer.from(
      `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`
    ).toString('base64');

    const tokenRes = await fetch('https://api-m.paypal.com/v1/oauth2/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });
    const tokenData = await tokenRes.json();
    const access_token = tokenData.access_token;

    if (!access_token) {
      console.error('PayPal token error:', tokenData);
      return Response.json({ error: 'Failed to get PayPal access token' }, { status: 500 });
    }

    const orderRes = await fetch('https://api-m.paypal.com/v2/checkout/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: { currency_code: currency || 'USD', value: String(amount) },
          description: 'Surya Jewellers — Sterling Silver Jewelry',
        }],
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

    return Response.json({ id: order.id, links: order.links });
  } catch (err) {
    console.error('PayPal create-order exception:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
