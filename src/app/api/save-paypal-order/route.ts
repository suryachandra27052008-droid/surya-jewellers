import { NextResponse } from 'next/server';
import { writeClient } from '@/lib/sanity/client';
import { sendOrderConfirmation } from '@/lib/email';

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

interface DiscountSnapshot {
  name: string;
  percent: number;
  amount: number;
  subtotalBeforeDiscount: number;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      paypalOrderId,
      paypalCaptureId,
      items,
      customer,
      subtotal,
      discount,
      shipping,
      total,
    }: {
      paypalOrderId: string;
      paypalCaptureId: string;
      items?: OrderItem[];
      customer?: CustomerInfo;
      subtotal?: number;
      discount?: DiscountSnapshot | null;
      shipping?: number;
      total?: number;
    } = body;

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
      items: (items || []).map((item, i) => ({
        _key: `item-${i}`,
        productId: item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      subtotal: subtotal || 0,
      discount: discount || undefined,
      shipping: shipping || 0,
      total: total || 0,
      status: 'paid',
      paidAt: new Date().toISOString(),
    };

    await writeClient.create(orderDoc);

    if (items && items.length > 0) {
      await Promise.all(
        items.map((item) =>
          writeClient
            .patch(item._id)
            .set({ inStock: false, stockQuantity: 0 })
            .commit()
        )
      );
    }

    if (customer?.email) {
      try {
        const productIds = (items || []).map((i) => i._id).filter(Boolean);
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
          items: (items || []).map((item) => ({
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: imageMap[item._id] || '',
          })),
          subtotal: subtotal || 0,
          discount: discount || undefined,
          shipping: shipping || 0,
          total: total || 0,
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
