'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/stores/cart-store';
import {
  getProductCanonicalSlug,
  getProductDisplayName,
  getProductImageAlt,
} from '@/lib/seo/product';
import type { LandingProduct } from './CategoryLanding';

export default function CategoryProductCard({ p }: { p: LandingProduct }) {
  const { addItem, items: cartItems } = useCartStore();

  const slug = getProductCanonicalSlug(p);
  const img = p.images[0];
  const name = getProductDisplayName(p);
  const altText = getProductImageAlt(p);

  const cartItem = cartItems.find((i) => i._id === p._id);
  const atMax = !!cartItem;

  return (
    <div className="group flex flex-col">
      <Link href={`/products/${slug}`} className="block">
        <div className="aspect-square relative overflow-hidden rounded-sm bg-gray-100">
          {img ? (
            <Image
              src={img}
              alt={altText}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-charcoal-muted text-xs text-center px-2">
              {name}
            </div>
          )}
        </div>
      </Link>

      <div className="pt-2 pb-1 flex flex-col flex-1">
        <Link href={`/products/${slug}`}>
          <p className="text-charcoal text-xs sm:text-sm font-medium line-clamp-2 leading-snug">
            {name}
          </p>
        </Link>
        <p className="text-gold text-xs sm:text-sm mt-0.5 mb-2 font-semibold">
          ₹{p.price.toLocaleString('en-IN')}
        </p>
        <button
          onClick={() => {
            if (atMax) return;
            addItem({
              _id: p._id,
              name: p.name,
              price: p.price,
              image: img || '',
              slug,
              mainStoneType: p.mainStoneType,
              stockQuantity: 1,
            });
          }}
          disabled={atMax}
          aria-label={atMax ? `${name} already in bag` : `Add ${name} to bag`}
          className={`w-full text-center text-[0.65rem] sm:text-xs py-2.5 min-h-[40px] uppercase font-semibold tracking-wider rounded transition-all mt-auto ${
            atMax
              ? 'bg-charcoal/10 text-charcoal/40 cursor-not-allowed'
              : 'btn-gold'
          }`}
        >
          {atMax ? '✓ In Bag' : 'Add to Bag'}
        </button>
      </div>
    </div>
  );
}
