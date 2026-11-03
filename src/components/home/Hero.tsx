'use client';

import Link from 'next/link';
import HeroSlideshow from '@/components/HeroSlideshow';
import { useStorefrontSettings } from '@/hooks/use-storefront-settings';
import { useCurrencyStore, formatPrice } from '@/stores/currency-store';
import { formatShippingOfferDate } from '@/lib/shipping-promotion';

export default function Hero() {
  const { promotion } = useStorefrontSettings();
  const currency = useCurrencyStore(state => state.currency);
  return (
    <HeroSlideshow compact={Boolean(promotion)}>
      <div className="min-h-full flex items-center justify-center" style={promotion ? { minHeight: 'min(620px, calc(100svh - 296px))' } : undefined}>
        <div className={`text-center px-4 max-w-4xl mx-auto ${promotion ? 'py-6 sm:py-10' : 'py-20'}`}>
          <div className={`flex items-center justify-center gap-4 ${promotion ? 'mb-4 sm:mb-6' : 'mb-8'}`}>
            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#c9a84c]" />
            <span
              className="text-sm sm:text-base font-semibold tracking-[4px] uppercase"
              style={{ color: '#c9a84c', fontVariant: 'small-caps' }}
            >
              Jewellery by Surya Jewellers
            </span>
            <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#c9a84c]" />
          </div>

          {promotion && <p className="mb-4 text-sm font-semibold uppercase text-gold-light">{promotion.name}</p>}
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-white leading-tight mb-6">
            Crafted in Pure
            <br />
            <span className="bg-gradient-to-r from-gold-light via-gold to-gold-dark bg-clip-text text-transparent">
              92.5 Sterling Silver
            </span>
          </h1>

          <p className={`text-white/80 text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed ${promotion ? 'mb-6' : 'mb-10'}`}>
            {promotion ? <>Celebrate Diwali with jewellery from Jaipur. Free standard worldwide shipping on orders above {formatPrice(promotion.minimum, currency)} after product discounts.</> : <>Exquisite jewelry adorned with natural diamonds and precious stones.
            <br className="hidden sm:block" />
            Each piece, a testament to timeless artistry and uncompromising quality.</>}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/products" className="btn-gold text-sm">
              {promotion ? 'Shop Diwali Jewellery' : 'Shop Jewellery'}
            </Link>
          </div>

          {promotion && <p className="mx-auto mt-4 max-w-xl text-xs leading-5 text-white/80">Ends {formatShippingOfferDate(promotion.endDate)}. Customs duties and import taxes remain payable by the customer. <Link href="/shipping#shipping-offer" className="underline">Offer terms</Link>.</p>}
          <div className={`${promotion ? 'mt-6 hidden sm:flex' : 'mt-10 flex'} flex-wrap justify-center gap-8 text-white/40 text-xs tracking-[0.15em] uppercase`}>
            <span className="flex items-center gap-2">
              <span className="text-gold text-sm">+</span> Certificate of Authenticity
            </span>
            <span className="flex items-center gap-2">
              <span className="text-gold text-sm">+</span> Natural Diamonds
            </span>
            <span className="flex items-center gap-2">
              <span className="text-gold text-sm">+</span> Certified
            </span>
          </div>
        </div>
      </div>
    </HeroSlideshow>
  );
}
