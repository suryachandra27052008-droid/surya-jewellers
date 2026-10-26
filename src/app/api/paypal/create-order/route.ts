import { priceCheckout, toPaymentAmount, type CheckoutCurrency } from '@/lib/server/checkout-pricing';
import { checkoutCustomer } from '@/lib/server/paypal-checkout';
import { reserveStock, releaseStock } from '@/lib/server/inventory-reservations';
import { recordCommerceCheckout } from '@/lib/server/commerce-orders';
import { checkoutOwner } from '@/lib/server/customer-orders';
import { analyticsContext } from '@/lib/server/shopping-analytics';
import { checkoutCancellationToken } from '@/lib/server/checkout-cancellation';
import { isRateLimited } from '@/lib/server/request-security';

export async function POST(request: Request) {
  if (isRateLimited(request, 'checkout-start', 8, 60_000)) return Response.json({ error: 'Please wait before starting another checkout.' }, { status: 429 });
  let reservation: Awaited<ReturnType<typeof reserveStock>> | undefined;
  let stockLines: { _id: string; quantity: number }[] = [];
  try {
    const body = await request.json();
    const customer = checkoutCustomer(body.customer);
    const currency: CheckoutCurrency = body.currency ?? 'USD';
    const pricing = await priceCheckout(body.items, {
      couponCode: body.couponCode,
      customerEmail: customer.email,
      country: customer.country,
    });
    const paymentAmount = toPaymentAmount(pricing.total, currency);
    stockLines = pricing.items.map(item => ({ _id: item._id, quantity: item.quantity }));
    reservation = await reserveStock(stockLines);

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
      throw new Error('PayPal is temporarily unavailable.');
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
            shipping: {
              name: { full_name: customer.name },
              address: { address_line_1: String(body.customer.address1).trim(),
                ...(body.customer.address2 ? { address_line_2: String(body.customer.address2).trim() } : {}),
                admin_area_2: String(body.customer.city).trim(),
                ...(body.customer.state ? { admin_area_1: String(body.customer.state).trim() } : {}),
                ...(body.customer.pincode ? { postal_code: String(body.customer.pincode).trim() } : {}),
                country_code: customer.country },
            },
          },
        ],
        application_context: {
          return_url: 'https://www.suryajewellers.com/order-success?payment=paypal',
          cancel_url: 'https://www.suryajewellers.com/checkout?payment=cancelled',
          brand_name: 'Surya Jewellers',
          user_action: 'PAY_NOW',
          shipping_preference: 'SET_PROVIDED_ADDRESS',
        },
      }),
    });
    const order = await orderRes.json();

    if (!order.id) {
      console.error('PayPal create-order error:', order);
      throw new Error('PayPal could not prepare this order.');
    }

    // Do not send the buyer to PayPal unless their items are safely recorded.
    await recordCommerceCheckout('paypal', order.id, pricing, customer, paymentAmount, reservation, await checkoutOwner(), analyticsContext(body.analyticsSessionId, request.headers));
    return Response.json({ id: order.id, links: order.links, pricing, cancellationToken: checkoutCancellationToken(order.id, reservation.id) });
  } catch (err) {
    if (reservation) await releaseStock(stockLines, reservation.id).catch(() => {});
    console.error('PayPal create-order exception:', err);
    return Response.json({ error: err instanceof Error ? err.message : 'Unable to prepare your PayPal checkout.' }, { status: 400 });
  }
}
