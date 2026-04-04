'use client';

import { isPromoActive } from '@/lib/shipping';

export default function ShippingBanner() {
  if (!isPromoActive()) return null;

  return (
    <div
      className="w-full text-center py-2.5 px-4"
      style={{ backgroundColor: '#c9a84c' }}
    >
      <p className="text-white text-xs font-semibold tracking-[0.25em] uppercase">
        ✦ &nbsp; Free Shipping — Limited Time Offer! Valid till 4th May 2026 &nbsp; ✦
      </p>
    </div>
  );
}
