'use client';

import Link from 'next/link';
import { useStorefrontSettings } from '@/hooks/use-storefront-settings';
import { useCurrencyStore, formatPrice } from '@/stores/currency-store';
import { campaignDate, formatShippingOfferDate } from '@/lib/shipping-promotion';

export default function ShippingBanner() {
  const { promotion, sale, settings, now } = useStorefrontSettings();
  const currency = useCurrencyStore(state => state.currency);
  const legacyBanner = settings?.showFreeShippingBanner && Number.isFinite(campaignDate(settings.freeShippingEndDate, true)) && now <= campaignDate(settings.freeShippingEndDate, true);
  const showSale = sale && settings?.showSaleBanner;
  if (!promotion && !showSale && !legacyBanner) return null;
  return <div className="w-full bg-charcoal px-4 py-2.5 text-center text-gold-light">
    <Link href={promotion ? '/shipping#shipping-offer' : '/products'} className="text-xs font-semibold uppercase leading-5">
      {promotion ? <>{promotion.name} - Free worldwide shipping above {formatPrice(promotion.minimum, currency)}. Ends {formatShippingOfferDate(promotion.endDate)}.</>
        : showSale ? <>{sale.name} - {sale.percent}% off jewellery</>
        : <>Free shipping within India - Valid till {formatShippingOfferDate(settings!.freeShippingEndDate!)}</>}
    </Link>
  </div>;
}
