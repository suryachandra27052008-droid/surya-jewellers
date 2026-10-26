const PAYPAL_API = 'https://api-m.paypal.com';

export type PayPalOrder = {
  id: string;
  status: string;
  payer?: {
    name?: { given_name?: string; surname?: string };
    email_address?: string;
    phone?: { phone_number?: { national_number?: string } };
  };
  purchase_units?: Array<{
    custom_id?: string;
    amount?: { currency_code?: string; value?: string };
    shipping?: {
      name?: { full_name?: string };
      address?: { address_line_1?: string; address_line_2?: string; admin_area_1?: string;
        admin_area_2?: string; postal_code?: string; country_code?: string };
    };
    payments?: {
      captures?: Array<{
        id?: string;
        status?: string;
        status_details?: { reason?: string };
        amount?: { currency_code?: string; value?: string };
      }>;
    };
  }>;
};

export async function capturePayPalOrder(orderId: string): Promise<PayPalOrder> {
  const existing = await getPayPalOrder(orderId);
  // A capture can remain pending while PayPal reviews or releases the funds.
  if (existing.purchase_units?.some(unit => unit.payments?.captures?.length)) return existing;
  if (existing.status !== 'APPROVED') throw new Error('PayPal payment has not been approved.');
  const accessToken = await getPayPalAccessToken();
  const response = await fetch(`${PAYPAL_API}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'PayPal-Request-Id': `capture-${orderId}`,
    },
    cache: 'no-store',
  });
  if (!response.ok) {
    const latest = await getPayPalOrder(orderId);
    if (latest.purchase_units?.some(unit => unit.payments?.captures?.length)) return latest;
    throw new Error('PayPal payment could not be confirmed.');
  }
  return response.json();
}

export async function getPayPalAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_SECRET;
  if (!clientId || !secret) throw new Error('PayPal is not configured.');

  const response = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${secret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
    cache: 'no-store',
  });
  const data = await response.json() as { access_token?: string };
  if (!response.ok || !data.access_token) throw new Error('PayPal authentication failed.');
  return data.access_token;
}

export async function getPayPalOrder(orderId: string): Promise<PayPalOrder> {
  const accessToken = await getPayPalAccessToken();
  const response = await fetch(`${PAYPAL_API}/v2/checkout/orders/${encodeURIComponent(orderId)}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });
  const data = await response.json() as PayPalOrder;
  if (!response.ok || !data.id) throw new Error('PayPal order could not be verified.');
  return data;
}
