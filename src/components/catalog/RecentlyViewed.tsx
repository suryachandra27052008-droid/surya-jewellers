'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, Trash2 } from 'lucide-react';
import { useRecentlyViewedStore } from '@/stores/recently-viewed-store';
import { useCurrencyStore, formatPrice } from '@/stores/currency-store';
import { getSalePrice, useSeasonalSale } from '@/hooks/use-seasonal-sale';
import { getProductCanonicalSlug, getProductDisplayName } from '@/lib/seo/product';
import { catalogImageLoader } from '@/lib/sanity/catalog-image-loader';

type ViewedCatalogProduct = { _id: string; name: string; slug: string; sku?: string; category?: string;
  price: number; images: string[]; inStock?: boolean; stockQuantity?: number };

export default function RecentlyViewed({ currentId, returnTo = '/products' }: { currentId?: string; returnTo?: string }) {
  const entries = useRecentlyViewedStore(state => state.entries);
  const clear = useRecentlyViewedStore(state => state.clear);
  const idsKey = entries.filter(entry => entry.id !== currentId).map(entry => entry.id).join(',');
  const [loaded, setLoaded] = useState<{ key: string; products: ViewedCatalogProduct[] }>({ key: '', products: [] });
  const track = useRef<HTMLDivElement>(null);
  const currency = useCurrencyStore(state => state.currency);
  const { sale } = useSeasonalSale();

  useEffect(() => {
    if (!idsKey) return;
    const controller = new AbortController();
    fetch(`/api/catalog?${new URLSearchParams({ ids: idsKey })}`, { signal: controller.signal })
      .then(async response => { if (!response.ok) throw new Error('Catalogue unavailable'); return response.json(); })
      .then((data: { products: ViewedCatalogProduct[] }) => {
        if (!controller.signal.aborted && Array.isArray(data.products)) setLoaded({ key: idsKey, products: data.products });
      }).catch(() => { /* History is optional; never fall back to stored prices. */ });
    return () => controller.abort();
  }, [idsKey]);

  if (!idsKey || loaded.key !== idsKey) return null;
  const products = idsKey.split(',').map(id => loaded.products.find(product => product._id === id))
    .filter((product): product is ViewedCatalogProduct => Boolean(product));
  if (!products.length) return null;
  const move = (direction: number) => track.current?.scrollBy({ left: direction * track.current.clientWidth * 0.8,
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });

  return (
    <section className="mt-12 border-t border-cream-dark pt-6" aria-label="Recently viewed jewellery">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-serif text-xl text-charcoal">Recently Viewed</h2>
        <div className="flex shrink-0 items-center gap-1">
          <button type="button" aria-label="Previous recently viewed products" title="Previous products" onClick={() => move(-1)} className="flex h-11 w-11 items-center justify-center rounded border border-cream-dark text-charcoal hover:border-gold"><ArrowLeft size={17} /></button>
          <button type="button" aria-label="Next recently viewed products" title="Next products" onClick={() => move(1)} className="flex h-11 w-11 items-center justify-center rounded border border-cream-dark text-charcoal hover:border-gold"><ArrowRight size={17} /></button>
          <button type="button" aria-label="Clear recently viewed history" title="Clear history" onClick={clear} className="flex h-11 w-11 items-center justify-center rounded text-charcoal-muted hover:text-charcoal"><Trash2 size={17} /></button>
        </div>
      </div>
      <div ref={track} tabIndex={0} aria-label="Recently viewed products" className="flex snap-x gap-3 overflow-x-auto pb-3 focus-visible:outline-gold sm:gap-4">
        {products.map(product => {
          const name = getProductDisplayName(product);
          const price = getSalePrice(product.price, sale);
          const soldOut = product.inStock === false || product.stockQuantity === 0;
          return <Link key={product._id} prefetch={false} href={`/products/${getProductCanonicalSlug(product)}?${new URLSearchParams({ returnTo })}`}
            className="w-[146px] shrink-0 snap-start sm:w-[190px]">
            <div className="relative aspect-square overflow-hidden rounded-sm bg-cream-dark">
              {product.images?.[0] && <Image src={product.images[0]} loader={catalogImageLoader} alt={name} fill sizes="(max-width: 640px) 146px, 190px" quality={60} className="object-cover" />}
              {soldOut && <span className="absolute bottom-2 left-2 rounded-sm bg-white/95 px-2 py-1 text-[10px] text-charcoal">Sold out</span>}
            </div>
            <h3 className="mt-2 line-clamp-2 min-h-[2.5rem] text-sm leading-5 text-charcoal">{name}</h3>
            <p className="mt-1 text-sm font-semibold text-gold-ink">{formatPrice(price ?? product.price, currency)}</p>
            {price !== null && <p className="text-xs text-charcoal-muted line-through">{formatPrice(product.price, currency)}</p>}
          </Link>;
        })}
      </div>
    </section>
  );
}
