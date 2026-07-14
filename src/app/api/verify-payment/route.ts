import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { writeClient } from '@/lib/sanity/client';
import { sendOrderConfirmation } from '@/lib/email';
import { priceCheckout, toPaymentAmount } from '@/lib/server/checkout-pricing';

interface OrderItem {
  _id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CustomerInfo {
  fullName: string;
  email: string;
  phone: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  pincode: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      items,
      customer,
      couponCode,
    }: {
      razorpay_payment_id: string;
      razorpay_order_id: string;
      razorpay_signature: string;
      items?: OrderItem[];
      customer?: CustomerInfo;
      couponCode?: string;
    } = body;

    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keySecret || keySecret === 'placeholder_secret') {
      return NextResponse.json({ success: false, error: 'Payment verification is unavailable.' }, { status: 503 });
    }

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json(
        { success: false, error: 'Invalid signature' },
        { status: 400 }
      );
    }

    const pricing = await priceCheckout(items, {
      couponCode,
      customerEmail: customer?.email,
      requireInStock: false,
    });

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    if (!keyId) {
      return NextResponse.json({ success: false, error: 'Payment verification is unavailable.' }, { status: 503 });
    }
    const Razorpay = (await import('razorpay')).default;
    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const [payment, paymentOrder] = await Promise.all([
      razorpay.payments.fetch(razorpay_payment_id),
      razorpay.orders.fetch(razorpay_order_id),
    ]);
    const expectedAmount = toPaymentAmount(pricing.total, paymentOrder.currency).subunits;
    if (
      payment.order_id !== razorpay_order_id ||
      !['authorized', 'captured'].includes(payment.status) ||
      Number(payment.amount) !== expectedAmount ||
      Number(paymentOrder.amount) !== expectedAmount
    ) {
      return NextResponse.json({ success: false, error: 'Payment details do not match this order.' }, { status: 400 });
    }

    const existingOrder = await writeClient.fetch<string | null>(
      `*[_type == "order" && razorpayPaymentId == $paymentId][0]._id`,
      { paymentId: razorpay_payment_id }
    );
    if (existingOrder) {
      return NextResponse.json({ success: true, paymentId: razorpay_payment_id, duplicate: true });
    }

    // Save order to Sanity and mark products as sold out
    const addressParts = [
      customer?.address1,
      customer?.address2,
      customer?.city,
      customer?.state,
      customer?.pincode,
    ].filter(Boolean);

    const orderDoc = {
      _id: `order-razorpay-${razorpay_payment_id.replace(/[^a-zA-Z0-9_-]/g, '')}`,
      _type: 'order',
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      customer: {
        name: customer?.fullName || '',
        email: customer?.email || '',
        phone: customer?.phone || '',
        address: addressParts.join(', '),
      },
      items: pricing.items.map((item, i) => ({
        _key: `item-${i}`,
        productId: item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      subtotal: pricing.subtotal,
      discount: pricing.discount || undefined,
      shipping: pricing.shipping,
      total: pricing.total,
      status: 'paid',
      paidAt: new Date().toISOString(),
    };

    await writeClient.createIfNotExists(orderDoc);

    // Mark each purchased product as sold out
    if (pricing.items.length > 0) {
      await Promise.all(
        pricing.items.map((item) =>
          writeClient
            .patch(item._id)
            .set({ inStock: false, stockQuantity: 0 })
            .commit()
        )
      );
    }

    // Send order confirmation email to customer
    if (customer?.email) {
      try {
        // Fetch product images for the email (best-effort)
        const productIds = pricing.items.map((i) => i._id).filter(Boolean);
        const imageMap: Record<string, string> = {};
        if (productIds.length > 0) {
          const withImages = await writeClient.fetch(
            `*[_type == "product" && _id in $ids]{ _id, "img": images[0].asset->url }`,
            { ids: productIds }
          );
          for (const p of withImages) {
            if (p.img) imageMap[p._id] = p.img;
          }
        }

        await sendOrderConfirmation({
          orderId: razorpay_order_id,
          paymentId: razorpay_payment_id,
          customer: {
            name: customer.fullName,
            email: customer.email,
            phone: customer.phone || '',
            address: addressParts.join(', '),
          },
          items: pricing.items.map((item) => ({
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: imageMap[item._id] || '',
          })),
          subtotal: pricing.subtotal,
          discount: pricing.discount || undefined,
          shipping: pricing.shipping,
          total: pricing.total,
        });
        console.log('[verify-payment] confirmation email sent to', customer.email);
      } catch (emailErr: unknown) {
        // Never fail the payment response because of email errors
        console.error('[verify-payment] email error:', (emailErr as Error)?.message);
      }
    }

    return NextResponse.json({ success: true, paymentId: razorpay_payment_id });
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Verification failed' },
      { status: 500 }
    );
  }
}
