import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { amount } = await request.json();

    // Check if Razorpay credentials are configured
    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || keyId === 'rzp_test_placeholder' || !keySecret || keySecret === 'placeholder_secret') {
      // Return a demo order when Razorpay is not configured
      return NextResponse.json({
        id: null,
        amount: amount * 100,
        currency: 'INR',
        demo: true,
        message: 'Razorpay not configured. Running in demo mode.',
      });
    }

    // Dynamic import to avoid errors when razorpay is not properly configured
    const Razorpay = (await import('razorpay')).default;

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const order = await razorpay.orders.create({
      amount: amount * 100, // Amount in paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        website: 'https://suryajewellers.shop',
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create order', details: String(error) },
      { status: 500 }
    );
  }
}
