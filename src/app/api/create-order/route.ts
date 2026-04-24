import { NextResponse } from 'next/server';

type SupportedCurrency = 'INR' | 'USD' | 'GBP' | 'JPY' | 'CNY';

// Approximate INR → target currency rates
const RATES: Record<SupportedCurrency, number> = {
  INR: 1,
  USD: 1 / 84,
  GBP: 1 / 106,
  JPY: 1.8,
  CNY: 1 / 12,
};

// JPY has no decimal subunits; all others use paise/cents/pence × 100
const SUBUNIT_MULTIPLIER: Record<SupportedCurrency, number> = {
  INR: 100,
  USD: 100,
  GBP: 100,
  JPY: 1,
  CNY: 100,
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const amountInr: number = body.amount;
    const currency: SupportedCurrency = body.currency ?? 'INR';

    const rate = RATES[currency] ?? 1;
    const multiplier = SUBUNIT_MULTIPLIER[currency] ?? 100;
    const razorpayAmount = Math.round(amountInr * rate * multiplier);

    // Check if Razorpay credentials are configured
    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || keyId === 'rzp_test_placeholder' || !keySecret || keySecret === 'placeholder_secret') {
      return NextResponse.json({
        id: null,
        amount: razorpayAmount,
        currency,
        demo: true,
        message: 'Razorpay not configured. Running in demo mode.',
      });
    }

    const Razorpay = (await import('razorpay')).default;

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const order = await razorpay.orders.create({
      amount: razorpayAmount,
      currency,
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
