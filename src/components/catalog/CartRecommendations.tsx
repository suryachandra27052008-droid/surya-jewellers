'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus } from 'lucide-react';
import { useCartStore } from '@/stores/cart-store';
import { useCurrencyStore, formatPrice } from '@/stores/currency-store';
import { useSeasonalSale, getSalePrice } from '@/hooks/use-seasonal-sale';
import { catalogImageLoader } from '@/lib/sanity/catalog-image-loader';
import { getProductCanonicalSlug, getProductDisplayName } from '@/lib/seo/product';
import { isRingCategory } from '@/lib/ring-size';
import { cartRecommendations, type RecommendedProduct } from '@/lib/cart-recommendations';

export default function CartRecommendations() {
  const [products, setProducts] = useState<RecommendedProduct[]>([]);
  const items = useCartStore(state => state.items);
  const addItem = useCartStore(state => state.addItem);
  const closeCart = useCartStore(state => state.closeCart);
  const currency = useCurrencyStore(state => state.currency);
  const { sale } = useSeasonalSale();
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/catalog/recommendations', { signal: controller.signal })
      .then(async response => response.ok ? response.json() : { products: [] })
      .then(data => { if (!controller.signal.aborted && Array.isArray(data.products)) setProducts(data.products); })
      .catch(() => {});
    return () => controller.abort();
  }, []);
  const suggested = cartRecommendations(products, items);
  if (!suggested.length) return null;
  return <section className="mt-5 border-t border-cream-dark pt-4" aria-label="Complete the look">
    <h3 className="mb-3 font-serif text-lg">Complete the Look</h3>
    <div className="space-y-3">{suggested.map(product => {
      const name = getProductDisplayName(product);
      const slug = getProductCanonicalSlug(product);
      const ring = isRingCategory(product.category);
      return <div key={product._id} className="flex items-center gap-3">
        <Link href={`/products/${slug}`} onClick={closeCart} className="relative h-16 w-16 shrink-0 overflow-hidden rounded-sm bg-cream-dark">
          <Image src={product.images[0]} loader={catalogImageLoader} alt={name} fill sizes="64px" className="object-cover" />
        </Link>
        <div className="min-w-0 flex-1"><Link href={`/products/${slug}`} onClick={closeCart} className="line-clamp-2 text-sm leading-5">{name}</Link>
          <p className="text-sm font-semibold text-gold-ink">{formatPrice(getSalePrice(product.price, sale) ?? product.price, currency)}</p></div>
        {ring ? <Link href={`/products/${slug}`} onClick={closeCart} className="flex min-h-11 shrink-0 items-center px-2 text-xs underline">Choose size</Link>
          : <button type="button" aria-label={`Add ${name} to bag`} title={`Add ${name} to bag`} className="flex h-11 w-11 shrink-0 items-center justify-center rounded border border-gold/40 hover:bg-gold/10"
            onClick={() => addItem({ ...product, name, slug, image: product.images[0] })}><Plus size={18} /></button>}
      </div>;
    })}</div>
  </section>;
}
