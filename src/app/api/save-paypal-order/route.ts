import { NextResponse } from 'next/server';
import { writeClient } from '@/lib/sanity/client';
import { sendOrderConfirmation } from '@/lib/email';
import { priceCheckout } from '@/lib/server/checkout-pricing';

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

    const pricing = await priceCheckout(items, {
      couponCode,
      customerEmail: customer?.email,
      requireInStock: false,
    });

    const addressParts = [
      customer?.address1,
      customer?.address2,
      customer?.city,
      customer?.state,
      customer?.pincode,
    ].filter(Boolean);

    const orderDoc = {
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

    await writeClient.create(orderDoc);

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
