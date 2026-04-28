'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Heart } from 'lucide-react';
import { getSalePrice, useSeasonalSale } from '@/hooks/use-seasonal-sale';
import { useCartStore } from '@/stores/cart-store';
import { useWishlistStore } from '@/stores/wishlist-store';
import {
  getProductCanonicalSlug,
  getProductDisplayName,
  getProductImageAlt,
} from '@/lib/seo/product';
import type { LandingProduct } from './CategoryLanding';

export default function CategoryProductCard({ p, priority = false }: { p: LandingProduct; priority?: boolean }) {
  const { addItem, items: cartItems } = useCartStore();
  const { sale } = useSeasonalSale();
  const toggleWishlist = useWishlistStore((s) => s.toggleItem);
  const isWishlisted = useWishlistStore((s) => s.isWishlisted);

  const slug = getProductCanonicalSlug(p);
  const img = p.images[0];
  const name = getProductDisplayName(p);
  const altText = getProductImageAlt(p);
  const salePrice = getSalePrice(p.price, sale);
  const wished = isWishlisted(p._id);

  const cartItem = cartItems.find((i) => i._id === p._id);
  const atMax = !!cartItem;

  return (
    <div className="group h-full flex flex-col">
      <Link href={`/products/${slug}`} className="block">
        <div className="aspect-square relative overflow-hidden rounded-sm bg-gray-100">
          {img ? (
            <Image
              src={img}
              alt={altText}
              fill
              priority={priority}
              fetchPriority={priority ? 'high' : 'auto'}
              loading={priority ? 'eager' : 'lazy'}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-charcoal-muted text-xs text-center px-2">
              {name}
            </div>
          )}
          {sale && p.price > 0 && (
            <span className="absolute bottom-2 left-2 rounded bg-gold px-2 py-1 text-[0.58rem] font-semibold uppercase tracking-[0.12em] text-white shadow-sm">
              {sale.percent}% off
            </span>
          )}
        </div>
      </Link>

      <div className="pt-2 pb-1 flex flex-col flex-1">
        <div className="flex items-start gap-2 min-h-[2.25rem] sm:min-h-[2.75rem]">
          <Link href={`/products/${slug}`} className="min-w-0 flex-1">
            <p className="text-charcoal text-xs sm:text-sm font-medium line-clamp-2 leading-snug">
              {name}
            </p>
          </Link>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWishlist({
                _id: p._id,
                name,
                price: p.price,
                image: img || '',
                slug,
                category: p.category,
                mainStoneType: p.mainStoneType,
                stockQuantity: 1,
              });
            }}
            aria-label={wished ? `Remove ${name} from wishlist` : `Save ${name} to wishlist`}
            className={`shrink-0 rounded-full p-1 transition-colors ${
              wished ? 'text-gold bg-gold/10' : 'text-charcoal-muted hover:text-gold hover:bg-gold/10'
            }`}
          >
            <Heart className="h-4 w-4" fill={wished ? 'currentColor' : 'none'} strokeWidth={1.8} />
          </button>
        </div>
        <div className="mt-0.5 mb-2 min-h-[2rem]">
          {salePrice ? (
            <>
              <p className="text-gold text-xs sm:text-sm font-semibold">
                ₹{salePrice.toLocaleString('en-IN')}
              </p>
              <p className="text-[0.65rem] text-charcoal-muted line-through">
                ₹{p.price.toLocaleString('en-IN')}
              </p>
            </>
          ) : (
            <p className="text-gold text-xs sm:text-sm font-semibold">
              ₹{p.price.toLocaleString('en-IN')}
            </p>
          )}
        </div>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
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
          aria-label={atMax ? `In bag — ${name}` : `Add to bag — ${name}`}
          className={`w-full text-center text-[0.65rem] sm:text-xs py-2.5 min-h-[44px] uppercase font-semibold tracking-wider rounded transition-all mt-auto ${
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
