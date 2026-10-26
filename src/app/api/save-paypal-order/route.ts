import { NextResponse } from 'next/server';
import { writeClient } from '@/lib/sanity/client';
import { sendOrderConfirmation } from '@/lib/email';
import { priceCheckout, toPaymentAmount } from '@/lib/server/checkout-pricing';
import { getPayPalOrder } from '@/lib/server/paypal';
import { findPayPalCheckout, recoverPayPalCustomer } from '@/lib/server/paypal-checkout';

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
    // Only the authenticated admin recovery route can defer its automatic email.
    const requestUrl = new URL(request.url);
    const manualReceipt = requestUrl.pathname === '/api/admin/paypal-order' &&
      requestUrl.searchParams.get('receipt') === 'manual';
    const body = await request.json();
    const {
      paypalOrderId,
      paypalCaptureId: requestedCaptureId,
      items,
      customer,
      couponCode,
    }: {
      paypalOrderId: string;
      paypalCaptureId?: string;
      items?: OrderItem[];
      customer?: CustomerInfo;
      couponCode?: string;
    } = body;

    if (typeof paypalOrderId !== 'string' || !/^[A-Z0-9]{1,80}$/i.test(paypalOrderId)) {
      return NextResponse.json({ success: false, error: 'Missing PayPal payment reference.' }, { status: 400 });
    }

    const paypalOrder = await getPayPalOrder(paypalOrderId);
    const purchaseUnit = paypalOrder.purchase_units?.[0];
    const captures = purchaseUnit?.payments?.captures || [];
    const capture = requestedCaptureId
      ? captures.find(entry => entry.id === requestedCaptureId)
      : captures.length === 1 ? captures[0] : undefined;
    if (!capture?.id || !['COMPLETED', 'PENDING'].includes(capture.status || '')) {
      return NextResponse.json({ success: false, error: 'PayPal payment is not completed.' }, { status: 400 });
    }
    const paypalCaptureId = capture.id;
    const pending = capture.status === 'PENDING';
    const saved = await findPayPalCheckout(paypalOrderId);

    const pricing = saved ? {
      items: saved.items.map(item => ({ _id: item.productId, name: item.name, price: item.price, quantity: item.quantity })),
      subtotal: saved.subtotal, discount: saved.discount, shipping: saved.shipping, total: saved.total,
    } : await priceCheckout(items, {
      // Older checkouts predate country-based shipping; verify their original total.
      couponCode,
      customerEmail: customer?.email,
      requireInStock: false,
    });

    const currency = capture.amount?.currency_code ?? purchaseUnit?.amount?.currency_code;
    const expected = toPaymentAmount(pricing.total, currency);
    const expectedCurrency = saved?.paymentCurrency || expected.currency;
    const expectedValue = saved?.paymentAmount || expected.displayValue;
    const paidValue = capture.amount?.value ?? purchaseUnit?.amount?.value;
    if (
      currency !== expectedCurrency ||
      paidValue !== expectedValue ||
      purchaseUnit?.custom_id !== `server_total_inr_${pricing.total}`
    ) {
      return NextResponse.json({ success: false, error: 'PayPal amount verification failed.' }, { status: 400 });
    }

    const existingOrder = await writeClient.fetch<string | null>(
      `*[_type == "order" && razorpayPaymentId == $paymentId][0]._id`,
      { paymentId: paypalCaptureId }
    );
    if (existingOrder && (!saved || saved.status !== 'pending' || pending)) {
      return NextResponse.json({ success: true, paymentId: paypalCaptureId, pending, duplicate: true });
    }

    const addressParts = [
      customer?.address1,
      customer?.address2,
      customer?.city,
      customer?.state,
      customer?.pincode,
    ].filter(Boolean);
    const recovered = saved ? null : recoverPayPalCustomer(customer as unknown as Record<string, unknown>, paypalOrder);
    const orderCustomer = saved?.customer || recovered!.customer;

    const orderDoc = {
      _id: saved?._id || `orders.paypal-${paypalCaptureId.replace(/[^a-zA-Z0-9_-]/g, '')}`,
      _type: 'order',
      razorpayOrderId: paypalOrderId,
      razorpayPaymentId: paypalCaptureId,
      paymentMethod: 'paypal',
      paymentCurrency: currency,
      paymentAmount: paidValue,
      paymentStatus: capture.status,
      paymentPendingReason: capture.status_details?.reason || '',
      customer: orderCustomer,
      needsMerchantReview: saved?.needsMerchantReview || recovered?.needsMerchantReview || false,
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
      status: pending ? 'pending' : 'paid',
      ...(!pending ? { paidAt: new Date().toISOString() } : {}),
    };

    if (saved) {
      const { _id, _type, ...fields } = orderDoc;
      void _type;
      const patch = writeClient.patch(_id).set(fields);
      if (saved._rev) patch.ifRevisionId(saved._rev);
      await patch.commit();
    } else {
      await writeClient.createIfNotExists(orderDoc);
    }

    if (pending) return NextResponse.json({ success: true, pending: true, paymentId: paypalCaptureId });

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

    if (orderCustomer.email && !manualReceipt && !saved?.orderConfirmationSentAt) {
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
            name: orderCustomer.name,
            email: orderCustomer.email,
            phone: orderCustomer.phone,
            address: orderCustomer.address || addressParts.join(', '),
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
