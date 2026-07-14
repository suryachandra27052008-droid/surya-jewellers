import { NextResponse } from 'next/server';
import { writeClient } from '@/lib/sanity/client';
import { sendOrderConfirmation } from '@/lib/email';
import { priceCheckout, toPaymentAmount } from '@/lib/server/checkout-pricing';
import { getPayPalOrder } from '@/lib/server/paypal';

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
      paypalOrderId,
      paypalCaptureId,
      items,
      customer,
      couponCode,
    }: {
      paypalOrderId: string;
      paypalCaptureId: string;
      items?: OrderItem[];
      customer?: CustomerInfo;
      couponCode?: string;
    } = body;

    if (!paypalOrderId || !paypalCaptureId) {
      return NextResponse.json({ success: false, error: 'Missing PayPal payment reference.' }, { status: 400 });
    }

    const paypalOrder = await getPayPalOrder(paypalOrderId);
    const purchaseUnit = paypalOrder.purchase_units?.[0];
    const capture = purchaseUnit?.payments?.captures?.find((entry) => entry.id === paypalCaptureId);
    if (paypalOrder.status !== 'COMPLETED' || capture?.status !== 'COMPLETED') {
      return NextResponse.json({ success: false, error: 'PayPal payment is not completed.' }, { status: 400 });
    }

    const pricing = await priceCheckout(items, {
      couponCode,
      customerEmail: customer?.email,
      requireInStock: false,
    });

    const currency = capture.amount?.currency_code ?? purchaseUnit?.amount?.currency_code;
    const expected = toPaymentAmount(pricing.total, currency);
    const paidValue = capture.amount?.value ?? purchaseUnit?.amount?.value;
    if (
      currency !== expected.currency ||
      paidValue !== expected.displayValue ||
      purchaseUnit?.custom_id !== `server_total_inr_${pricing.total}`
    ) {
      return NextResponse.json({ success: false, error: 'PayPal amount verification failed.' }, { status: 400 });
    }

    const existingOrder = await writeClient.fetch<string | null>(
      `*[_type == "order" && razorpayPaymentId == $paymentId][0]._id`,
      { paymentId: paypalCaptureId }
    );
    if (existingOrder) {
      return NextResponse.json({ success: true, paymentId: paypalCaptureId, duplicate: true });
    }

    const addressParts = [
      customer?.address1,
      customer?.address2,
      customer?.city,
      customer?.state,
      customer?.pincode,
    ].filter(Boolean);

    const orderDoc = {
      _id: `order-paypal-${paypalCaptureId.replace(/[^a-zA-Z0-9_-]/g, '')}`,
      _type: 'order',
      razorpayOrderId: paypalOrderId,
      razorpayPaymentId: paypalCaptureId,
      paymentMethod: 'paypal',
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

    if (customer?.email) {
      try {
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
          orderId: paypalOrderId,
          paymentId: paypalCaptureId,
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
      } catch (emailErr: unknown) {
        console.error('[save-paypal-order] email error:', (emailErr as Error)?.message);
      }
    }

    return NextResponse.json({ success: true, paymentId: paypalCaptureId });
  } catch (error) {
    console.error('PayPal order save error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save order' },
      { status: 500 }
    );
  }
}
