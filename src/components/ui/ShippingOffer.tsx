'use client';

import Link from 'next/link';
import { Check, Truck } from 'lucide-react';
import { useStorefrontSettings } from '@/hooks/use-storefront-settings';
import { formatShippingOfferDate, qualifiesForShippingOffer } from '@/lib/shipping-promotion';
import { useCurrencyStore, formatPrice } from '@/stores/currency-store';
import { normalizeShippingCountry, FREE_SHIPPING_THRESHOLD } from '@/lib/shipping';

export default function ShippingOffer({ subtotal, country }: { subtotal?: number; country?: string }) {
  const { promotion } = useStorefrontSettings();
  const currency = useCurrencyStore(state => state.currency);
  if (!promotion) return null;
  const qualifies = subtotal !== undefined && qualifiesForShippingOffer(subtotal, promotion.minimum);
  const domesticFree = country && normalizeShippingCountry(country) === 'IN' && subtotal !== undefined && subtotal >= FREE_SHIPPING_THRESHOLD;
  const gap = subtotal === undefined ? 0 : Math.max(0, promotion.minimum - subtotal);
  const gapLabel = formatPrice(gap, currency);
  const nearThreshold = gap <= 0 || /^\D*0(?:\.00)?$/.test(gapLabel);
  const progress = subtotal === undefined ? 0 : qualifies ? 100 : Math.min(99.9, Math.max(0, subtotal / promotion.minimum * 100));
  return <div className="border-y border-gold/25 py-3 text-sm" data-testid="shipping-offer">
    <div className="flex items-start gap-2">
      {qualifies || domesticFree ? <Check size={17} className="mt-0.5 shrink-0 text-green-700" /> : <Truck size={17} className="mt-0.5 shrink-0 text-gold-ink" />}
      <p role="status" aria-live="polite" className="min-w-0 leading-5 text-charcoal">
        {domesticFree ? 'Your order qualifies for free standard shipping in India.'
          : qualifies ? 'Your order qualifies for free standard worldwide shipping.'
          : subtotal === undefined ? <>{promotion.name}: free standard worldwide shipping above {formatPrice(promotion.minimum, currency)}.</>
          : nearThreshold ? 'Add another item to exceed the free-shipping threshold.'
          : <>Add more than {gapLabel} to unlock free worldwide shipping.</>}
      </p>
    </div>
    {subtotal !== undefined && !domesticFree && <div role="progressbar" aria-label="Progress towards free worldwide shipping"
      aria-valuemin={0} aria-valuemax={100} aria-valuenow={Number(progress.toFixed(1))}
      aria-valuetext={qualifies ? 'Free shipping unlocked' : 'Subtotal must exceed the threshold'}
      className="mt-2 h-1.5 overflow-hidden rounded-sm bg-cream-dark"><div className="h-full bg-gold" style={{ width: `${progress}%` }} /></div>}
    <p className="mt-2 text-xs leading-5 text-charcoal-muted">
      After product discounts. {currency !== 'INR' && 'Eligibility uses the INR-equivalent subtotal. '}
      Customs duties and import taxes extra. <Link href="/shipping#shipping-offer" className="underline underline-offset-2">Ends {formatShippingOfferDate(promotion.endDate)}</Link>.
    </p>
  </div>;
}
