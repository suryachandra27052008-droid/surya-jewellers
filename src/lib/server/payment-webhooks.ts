import { createHmac, timingSafeEqual } from 'node:crypto';
import { getPayPalAccessToken } from './paypal';

export function validRazorpayWebhook(raw: string, signature: string | null, secret: string | undefined) {
  if (!secret || !signature || !/^[a-f0-9]{64}$/i.test(signature)) return false;
  const expected = createHmac('sha256', secret).update(raw).digest();
  return timingSafeEqual(expected, Buffer.from(signature, 'hex'));
}

export async function validPayPalWebhook(request: Request, event: unknown) {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) return false;
  const names = ['paypal-auth-algo', 'paypal-cert-url', 'paypal-transmission-id', 'paypal-transmission-sig', 'paypal-transmission-time'];
  if (names.some(name => !request.headers.get(name))) return false;
  const response = await fetch('https://api-m.paypal.com/v1/notifications/verify-webhook-signature', {
    method: 'POST', headers: { Authorization: `Bearer ${await getPayPalAccessToken()}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ auth_algo: request.headers.get(names[0]), cert_url: request.headers.get(names[1]),
      transmission_id: request.headers.get(names[2]), transmission_sig: request.headers.get(names[3]),
      transmission_time: request.headers.get(names[4]), webhook_id: webhookId, webhook_event: event }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error('Webhook verification provider unavailable.');
  return (await response.json()).verification_status === 'SUCCESS';
}
