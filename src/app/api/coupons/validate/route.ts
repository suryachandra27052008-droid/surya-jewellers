import { NextResponse } from 'next/server';
import { writeClient } from '@/lib/sanity/client';
import { calculateCouponTotals, getActiveCoupon, normalizeCouponCode } from '@/lib/coupon';

const DOC_ID = 'siteSettings';

export async function POST(request: Request) {
  const body = await request.json();
  const code = normalizeCouponCode(body.code);
  const email = String(body.email || '').trim().toLowerCase();
  const subtotal = Math.max(0, Number(body.subtotal) || 0);

  if (!code) {
    return NextResponse.json({ success: false, error: 'Enter a coupon code.' }, { status: 400 });
  }

  const settings = await writeClient.fetch(
    `*[_type == "siteSettings" && _id == $id][0]{
      couponEnabled,
      couponCode,
      couponName,
      couponDiscountPercent,
      couponCustomerEmail,
      couponStartDate,
      couponEndDate
    }`,
    { id: DOC_ID }
  );

  const expectedEmail = String(settings?.couponCustomerEmail || '').trim().toLowerCase();
  if (expectedEmail && !email) {
    return NextResponse.json(
      { success: false, error: 'Enter your email before applying this coupon.' },
      { status: 400 }
    );
  }

  const coupon = getActiveCoupon(settings, code, email);
  if (!coupon) {
    return NextResponse.json(
      { success: false, error: 'This coupon is invalid, expired, or not assigned to this email.' },
      { status: 404 }
    );
  }

  const totals = calculateCouponTotals(subtotal, settings, code, email);
  return NextResponse.json({
    success: true,
    coupon,
    discountAmount: totals.discountAmount,
    discountedSubtotal: totals.discountedSubtotal,
  });
}
