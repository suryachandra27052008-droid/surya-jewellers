import { NextResponse } from 'next/server';
import { writeClient } from '@/lib/sanity/client';
import { normalizeCouponCode, type CouponSettings } from '@/lib/coupon';

const DOC_ID = 'siteSettings';

function cleanCoupon(body: CouponSettings): CouponSettings {
  const percent = Number(body.couponDiscountPercent);

  return {
    couponEnabled: Boolean(body.couponEnabled),
    couponCode: normalizeCouponCode(body.couponCode),
    couponName: String(body.couponName || 'Personal Coupon').trim() || 'Personal Coupon',
    couponDiscountPercent: Number.isFinite(percent) ? Math.max(0, Math.min(90, percent)) : 0,
    couponCustomerEmail: String(body.couponCustomerEmail || '').trim().toLowerCase(),
    couponStartDate: String(body.couponStartDate || '').trim(),
    couponEndDate: String(body.couponEndDate || '').trim(),
  };
}

export async function GET() {
  const doc = await writeClient.fetch(
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

  return NextResponse.json({
    couponEnabled: doc?.couponEnabled ?? false,
    couponCode: doc?.couponCode ?? '',
    couponName: doc?.couponName ?? 'Personal Coupon',
    couponDiscountPercent: doc?.couponDiscountPercent ?? 10,
    couponCustomerEmail: doc?.couponCustomerEmail ?? '',
    couponStartDate: doc?.couponStartDate ?? '',
    couponEndDate: doc?.couponEndDate ?? '',
  });
}

export async function POST(request: Request) {
  const coupon = cleanCoupon(await request.json());

  await writeClient
    .transaction()
    .createIfNotExists({ _id: DOC_ID, _type: 'siteSettings' })
    .patch(DOC_ID, { set: coupon })
    .commit();

  return NextResponse.json({ success: true, coupon });
}
