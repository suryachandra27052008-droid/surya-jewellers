import { writeClient } from '@/lib/sanity/client';
import { isValidEmail, textField } from '@/lib/server/request-security';
import type { PricedCheckout } from '@/lib/server/checkout-pricing';
import type { PayPalOrder } from '@/lib/server/paypal';
import { normalizeShippingCountry } from '@/lib/shipping';
import { countryCode, countryName, postalCodeError } from '@/lib/countries';

export type PayPalCheckoutRecord = {
  _id: string;
  _rev?: string;
  status: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  paymentCurrency: string;
  paymentAmount: string;
  customer: { name: string; email: string; phone: string; address: string; country?: string };
  items: Array<{ _key: string; productId: string; name: string; price: number; quantity: number; category?: string; ringSize?: number }>;
  subtotal: number;
  discount?: PricedCheckout['discount'];
  shipping: number;
  total: number;
  needsMerchantReview?: boolean;
  orderConfirmationSentAt?: string;
  orderConfirmationEmailId?: string;
};

export function checkoutCustomer(input: Record<string, unknown> | undefined) {
  const fields = ['fullName', 'email', 'phone', 'address1', 'city', 'country'] as const;
  if (!input || fields.some(field => !textField(input[field], 500)) || !isValidEmail(input.email)) {
    throw new Error('Please complete your shipping details before paying.');
  }
  const country = countryCode(input.country);
  if (!country) throw new Error('Please enter your delivery country.');
  const postalError = postalCodeError(country, input.pincode);
  if (postalError) throw new Error(postalError);
  return {
    name: textField(input.fullName, 150),
    email: textField(input.email, 254),
    phone: textField(input.phone, 50),
    country,
    address: [...['address1', 'address2', 'city', 'state', 'pincode']
      .map(field => textField(input[field], 500)), countryName(country)].filter(Boolean).join(', '),
  };
}

export function recoverPayPalCustomer(input: Record<string, unknown> | undefined, provider: PayPalOrder) {
  const shipping = provider.purchase_units?.[0]?.shipping;
  const address = input?.address1
    ? ['address1', 'address2', 'city', 'state', 'pincode'].map(field => textField(input[field], 500)).filter(Boolean).join(', ')
    : Object.values(shipping?.address || {}).filter(Boolean).join(', ');
  const customer = {
    name: textField(input?.fullName, 150) || shipping?.name?.full_name ||
      [provider.payer?.name?.given_name, provider.payer?.name?.surname].filter(Boolean).join(' '),
    email: isValidEmail(input?.email) ? textField(input?.email, 254) : provider.payer?.email_address || '',
    phone: textField(input?.phone, 50) || provider.payer?.phone?.phone_number?.national_number || '',
    address,
    country: normalizeShippingCountry(input?.country || shipping?.address?.country_code),
  };
  const addressComplete = input?.address1
    ? Boolean(textField(input.city, 500) && textField(input.pincode, 50))
    : Boolean(shipping?.address?.address_line_1 && shipping.address.country_code &&
      (shipping.address.admin_area_2 || shipping.address.admin_area_1));
  return { customer, needsMerchantReview: !addressComplete || Object.values(customer).some(value => !value) };
}

export async function findPayPalCheckout(orderId: string) {
  return writeClient.fetch<PayPalCheckoutRecord | null>(
    '*[_type == "order" && paymentMethod == "paypal" && razorpayOrderId == $orderId][0]',
    { orderId },
  );
}

export async function recordPayPalCheckout(
  orderId: string,
  pricing: PricedCheckout,
  customer: PayPalCheckoutRecord['customer'],
  payment: { currency: string; displayValue: string },
) {
  if (!/^[A-Z0-9]+$/i.test(orderId)) throw new Error('Invalid PayPal order reference.');
  const doc = {
    _id: `orders.paypal-order-${orderId}`,
    _type: 'order',
    paymentMethod: 'paypal',
    razorpayOrderId: orderId,
    paymentCurrency: payment.currency,
    paymentAmount: payment.displayValue,
    paymentStatus: 'CREATED',
    status: 'pending',
    customer,
    items: pricing.items.map((item, i) => ({
      _key: `item-${i}`, productId: item._id, name: item.name,
      price: item.price, quantity: item.quantity,
      ...(item.category ? { category: item.category } : {}),
      ...(item.ringSize !== undefined ? { ringSize: item.ringSize } : {}),
    })),
    subtotal: pricing.subtotal,
    discount: pricing.discount || undefined,
    shipping: pricing.shipping,
    total: pricing.total,
  };
  await writeClient.createIfNotExists(doc);
  return doc;
}
