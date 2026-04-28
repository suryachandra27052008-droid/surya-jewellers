import { NextResponse } from 'next/server';
import crypto from 'crypto';
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
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      items,
      customer,
      subtotal,
      discount,
      shipping,
      total,
    }: {
      razorpay_payment_id: string;
      razorpay_order_id: string;
      razorpay_signature: string;
      items?: OrderItem[];
      customer?: CustomerInfo;
      subtotal?: number;
      discount?: DiscountSnapshot | null;
      shipping?: number;
      total?: number;
    } = body;

    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keySecret || keySecret === 'placeholder_secret') {
      return NextResponse.json({
        success: true,
        demo: true,
        paymentId: razorpay_payment_id || 'demo_payment',
      });
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

    // Save order to Sanity and mark products as sold out
    const addressParts = [
      customer?.address1,
      customer?.address2,
      customer?.city,
      customer?.state,
      customer?.pincode,
    ].filter(Boolean);

    const orderDoc = {
      _type: 'order',
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
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

    // Mark each purchased product as sold out
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

    // Send order confirmation email to customer
    if (customer?.email) {
      try {
        // Fetch product images for the email (best-effort)
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
          orderId: razorpay_order_id,
          paymentId: razorpay_payment_id,
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
        console.log('[verify-payment] confirmation email sent to', customer.email);
      } catch (emailErr: any) {
        // Never fail the payment response because of email errors
        console.error('[verify-payment] email error:', emailErr?.message);
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
