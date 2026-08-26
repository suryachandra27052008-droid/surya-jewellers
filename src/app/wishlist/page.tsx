'use client';

import Image from 'next/image';
import { catalogImageLoader } from '@/lib/sanity/catalog-image-loader';
import Link from 'next/link';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { useCartStore } from '@/stores/cart-store';
import { useCurrencyStore, formatPrice } from '@/stores/currency-store';
import { useWishlistStore } from '@/stores/wishlist-store';
import { getSalePrice, useSeasonalSale } from '@/hooks/use-seasonal-sale';

export default function WishlistPage() {
  const items = useWishlistStore((s) => s.items);
  const removeItem = useWishlistStore((s) => s.removeItem);
  const addToCart = useCartStore((s) => s.addItem);
  const cartItems = useCartStore((s) => s.items);
  const currency = useCurrencyStore((s) => s.currency);
  const { sale } = useSeasonalSale();

  return (
    <main className="min-h-screen bg-cream py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 sm:mb-10">
          <span className="text-gold text-xs tracking-[0.35em] uppercase">Saved Pieces</span>
          <h1 className="font-serif text-3xl sm:text-5xl text-charcoal mt-3">Wishlist</h1>
        </div>

        {items.length === 0 ? (
          <section className="bg-white border border-cream-dark rounded p-8 sm:p-12 text-center">
            <div className="mx-auto mb-5 h-14 w-14 rounded-full bg-gold/10 flex items-center justify-center text-gold">
              <Heart className="h-7 w-7" strokeWidth={1.6} />
            </div>
            <h2 className="font-serif text-2xl text-charcoal mb-2">No saved pieces yet</h2>
            <p className="text-sm text-charcoal-muted mb-6">
              Tap the heart on any product to keep it here for later.
            </p>
            <Link href="/products" className="inline-flex items-center justify-center btn-gold min-h-[44px] px-6 rounded">
              Explore Collections
            </Link>
          </section>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {items.map((item) => {
              const salePrice = getSalePrice(item.price, sale);
              const cartItem = cartItems.find((cart) => cart._id === item._id);
              const atMax = cartItem ? cartItem.quantity >= (item.stockQuantity ?? 1) : false;

              return (
                <article
                  key={item._id}
                  className="bg-white rounded overflow-hidden border border-cream-dark hover:border-gold/20 flex flex-col"
                >
                  <Link href={`/products/${item.slug}`} className="block">
                    <div className="aspect-square relative bg-cream-dark overflow-hidden">
                      {item.image ? (
                        <Image
                          src={item.image}
                          loader={catalogImageLoader}
                          alt={item.name}
                          fill
                          sizes="(max-width: 640px) 50vw, 25vw"
                          className="object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-charcoal-muted text-xs px-3 text-center">
                          {item.name}
                        </div>
                      )}
                      {sale && (
                        <span className="absolute left-2 top-2 rounded bg-gold px-2 py-1 text-[0.58rem] font-semibold uppercase tracking-[0.12em] text-white shadow-sm">
                          {sale.percent}% off
                        </span>
                      )}
                    </div>
                  </Link>

                  <div className="p-3 sm:p-4 flex flex-col flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <Link href={`/products/${item.slug}`} className="min-w-0">
                        <h2 className="font-serif text-sm sm:text-base text-charcoal line-clamp-2 leading-snug">
                          {item.name}
                        </h2>
                      </Link>
                      <button
                        type="button"
                        onClick={() => removeItem(item._id)}
                        aria-label={`Remove ${item.name} from wishlist`}
                        className="shrink-0 text-charcoal-muted hover:text-gold transition-colors"
                      >
                        <Trash2 className="h-4 w-4" strokeWidth={1.8} />
                      </button>
                    </div>

                    <div className="mt-2 min-h-[2.4rem]">
                      {salePrice ? (
                        <>
                          <p className="text-gold font-semibold text-sm sm:text-base">
                            {formatPrice(salePrice, currency)}
                          </p>
                          <p className="text-[0.65rem] text-charcoal-muted line-through">
                            {formatPrice(item.price, currency)}
                          </p>
                        </>
                      ) : (
                        <p className="text-gold font-semibold text-sm sm:text-base">
                          {item.price ? formatPrice(item.price, currency) : 'Contact'}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (atMax) return;
                        addToCart({
                          _id: item._id,
                          name: item.name,
                          price: item.price,
                          image: item.image,
                          slug: item.slug,
                          silverWeight: item.silverWeight,
                          mainStoneType: item.mainStoneType,
                          stockQuantity: item.stockQuantity ?? 1,
                        });
                      }}
                      disabled={atMax}
                      className={`mt-auto inline-flex min-h-[44px] items-center justify-center gap-2 rounded px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition-all ${
                        atMax ? 'bg-charcoal/10 text-charcoal/40 cursor-not-allowed' : 'btn-gold'
                      }`}
                    >
                      <ShoppingBag className="h-4 w-4" strokeWidth={1.7} />
                      {atMax ? 'In Bag' : 'Add'}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
