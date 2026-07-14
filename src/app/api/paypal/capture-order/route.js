export async function POST(request) {
  try {
    const { orderID } = await request.json();
    if (!orderID || !/^[A-Z0-9]+$/i.test(orderID)) {
      return Response.json({ error: 'Invalid PayPal order ID' }, { status: 400 });
    }

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

    const captureRes = await fetch(
      `https://api-m.paypal.com/v2/checkout/orders/${orderID}/capture`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    const capture = await captureRes.json();
    if (!captureRes.ok) {
      console.error('PayPal capture error:', capture);
      return Response.json({ error: 'PayPal payment could not be captured.' }, { status: captureRes.status });
    }
    return Response.json(capture);
  } catch (err) {
    console.error('PayPal capture-order exception:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
