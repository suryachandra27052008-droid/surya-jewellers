import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
      await request.json();

    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keySecret || keySecret === 'placeholder_secret') {
      // Demo mode - accept any payment
      return NextResponse.json({
        success: true,
        demo: true,
        paymentId: razorpay_payment_id || 'demo_payment',
      });
    }

    // Generate expected signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(body)
      .digest('hex');

    // Verify signature
    if (expectedSignature === razorpay_signature) {
      return NextResponse.json({
        success: true,
        paymentId: razorpay_payment_id,
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid signature' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Verification failed' },
      { status: 500 }
    );
  }
}
