'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { useCartStore } from '@/stores/cart-store';
import { useCurrencyStore, formatPrice } from '@/stores/currency-store';
import AnimatedSection from '@/components/ui/AnimatedSection';

const categories = ['All', 'Rings', 'Necklaces', 'Earrings', 'Bracelets', 'Pendants', 'Studs'];
const stoneTypes = [
  'All', 'Diamond', 'Ruby', 'Emerald', 'Sapphire',
  'Opal', 'Moonstone', 'Blue Topaz', 'Amethyst', 'Black Opal', 'Coloured Opal',
  'Tourmaline', 'Yellow Sapphire', 'Aquamarine', 'Turquoise', 'Tanzanite',
  'Coral', 'Morganite', 'Peridot', 'Tsavorite', 'Alexandrite', 'Spinel',
];
const sortOptions = [
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low → High', value: 'price-asc' },
  { label: 'Price: High → Low', value: 'price-desc' },
];

const stoneColors: Record<string, string> = {
  Diamond: '#E8E8E8',
  Ruby: '#E0115F',
  Emerald: '#50C878',
  Sapphire: '#0F52BA',
  Opal: '#A8D8EA',
  Moonstone: '#D6E4F0',
  'Blue Topaz': '#4FC3F7',
  Amethyst: '#9C27B0',
  'Black Opal': '#212121',
  'Coloured Opal': '#FF7043',
  Tourmaline: '#E91E63',
  'Yellow Sapphire': '#FDD835',
  Aquamarine: '#00BCD4',
  Turquoise: '#26C6DA',
  Tanzanite: '#5C35B5',
  Coral: '#FF6B6B',
  Morganite: '#FFAB91',
  Peridot: '#8BC34A',
  Tsavorite: '#2E7D32',
  Alexandrite: '#6A1B9A',
  Spinel: '#C62828',
};

// Skeleton card shown while loading
function SkeletonCard() {
  return (
    <div className="bg-white rounded overflow-hidden border border-cream-dark">
      <div className="aspect-square bg-cream-dark animate-pulse" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-cream-dark rounded animate-pulse w-3/4" />
        <div className="h-3 bg-cream-dark rounded animate-pulse w-1/2" />
      </div>
    </div>
  );
}

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStone, setSelectedStone] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [stonesExpanded, setStonesExpanded] = useState(false);
  const STONE_PREVIEW_COUNT = 5;
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem, items: cartItems } = useCartStore();
  const currency = useCurrencyStore((s) => s.currency);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Prefetch: kick off the fetch immediately without waiting for mount delay
    const controller = new AbortController();
    async function loadProducts() {
      try {
        const res = await fetch('/api/admin/products', {
          signal: controller.signal,
          // hint the browser this is a high-priority navigation resource
          // @ts-ignore
          priority: 'high',
        });
        if (res.ok) {
          const data = await res.json();
          const apiProducts = data.products.map((p: any) => ({
            _id: p._id,
            name: p.name,
            slug: { current: p.slug || p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') },
            price: p.price,
            category: { name: p.category || 'Rings', slug: { current: (p.category || 'rings').toLowerCase() } },
            mainStoneType: p.mainStoneType || 'None',
            silverWeight: p.silverWeight || 0,
            totalCaratWeight: p.totalCaratWeight || 0,
            diamondColorClarity: p.diamondColorClarity || '',
            images: p.images && p.images.length > 0 ? p.images : [],
            inStock: p.inStock,
            description: p.description || '',
          }));
          setAllProducts(apiProducts.reverse());
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') console.error('Failed to fetch products', err);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
    return () => controller.abort();
  }, []);

  const filteredProducts = useMemo(() => {
    let result = allProducts.filter((p) => p.inStock !== false);
    if (selectedCategory !== 'All') result = result.filter((p) => p.category.name === selectedCategory);
    if (selectedStone !== 'All') result = result.filter((p) => p.mainStoneType === selectedStone);
    if (sortBy === 'price-asc') result.sort((a, b) => a.price - b.price);
    else if (sortBy === 'price-desc') result.sort((a, b) => b.price - a.price);
    return result;
  }, [selectedCategory, selectedStone, sortBy, allProducts]);

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <AnimatedSection className="text-center mb-12">
          <span className="text-gold text-xs tracking-[0.4em] uppercase">Our Catalog</span>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl mt-4 text-charcoal gold-underline">
            Collections
          </h1>
          <p className="text-charcoal-muted text-sm mt-6 max-w-lg mx-auto">
            Browse our complete range of handcrafted sterling silver jewelry
          </p>
        </AnimatedSection>

        {/* Mobile Filter Toggle */}
        <div className="lg:hidden mb-6">
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="flex items-center gap-2 text-sm text-charcoal border border-cream-dark px-4 py-2 hover:border-gold transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
            </svg>
            Filters & Sort
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <AnimatePresence>
            {(filtersOpen || mounted) && (
              <motion.aside
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className={`lg:w-64 flex-shrink-0 ${filtersOpen ? 'block' : 'hidden lg:block'}`}
              >
                <div className="sticky top-28 space-y-8 bg-white p-6 rounded border border-cream-dark">
                  {/* Category */}
                  <div>
                    <h3 className="text-xs tracking-[0.2em] uppercase text-charcoal-muted mb-4 font-semibold">Category</h3>
                    <div className="space-y-2">
                      {categories.map((cat) => (
                        <button key={cat} onClick={() => setSelectedCategory(cat)}
                          className={`block w-full text-left text-sm px-3 py-2 rounded transition-all duration-200 ${selectedCategory === cat ? 'bg-gold/10 text-gold font-medium' : 'text-charcoal-muted hover:bg-cream hover:text-charcoal'}`}>
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Stone Type */}
                  <div>
                    <h3 className="text-xs tracking-[0.2em] uppercase text-charcoal-muted mb-4 font-semibold">Stone Type</h3>
                    <div className="space-y-2">
                      {(stonesExpanded ? stoneTypes : stoneTypes.slice(0, STONE_PREVIEW_COUNT)).map((stone) => (
                        <button key={stone} onClick={() => setSelectedStone(stone)}
                          className={`flex items-center gap-2 w-full text-left text-sm px-3 py-2 rounded transition-all duration-200 ${selectedStone === stone ? 'bg-gold/10 text-gold font-medium' : 'text-charcoal-muted hover:bg-cream hover:text-charcoal'}`}>
                          {stone !== 'All' && (
                            <span className="w-3 h-3 rounded-full border border-black/10" style={{ backgroundColor: stoneColors[stone] }} />
                          )}
                          {stone}
                        </button>
                      ))}
                    </div>
                    {stoneTypes.length > STONE_PREVIEW_COUNT && (
                      <button
                        onClick={() => setStonesExpanded(!stonesExpanded)}
                        className="mt-2 flex items-center gap-1 text-xs text-charcoal-muted hover:text-gold transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
                          className={`w-3 h-3 transition-transform duration-200 ${stonesExpanded ? 'rotate-180' : ''}`}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                        </svg>
                        {stonesExpanded ? 'Show Less' : `Show ${stoneTypes.length - STONE_PREVIEW_COUNT} More`}
                      </button>
                    )}
                  </div>

                  {/* Sort */}
                  <div>
                    <h3 className="text-xs tracking-[0.2em] uppercase text-charcoal-muted mb-4 font-semibold">Sort By</h3>
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                      className="w-full text-sm px-3 py-2 border border-cream-dark rounded bg-white text-charcoal focus:border-gold focus:outline-none transition-colors">
                      {sortOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Active Filters */}
                  {(selectedCategory !== 'All' || selectedStone !== 'All') && (
                    <div>
                      <div className="flex flex-wrap gap-2">
                        {selectedCategory !== 'All' && (
                          <span className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-gold/10 text-gold rounded">
                            {selectedCategory}
                            <button onClick={() => setSelectedCategory('All')} className="hover:text-gold-dark">×</button>
                          </span>
                        )}
                        {selectedStone !== 'All' && (
                          <span className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-gold/10 text-gold rounded">
                            {selectedStone}
                            <button onClick={() => setSelectedStone('All')} className="hover:text-gold-dark">×</button>
                          </span>
                        )}
                      </div>
                      <button onClick={() => { setSelectedCategory('All'); setSelectedStone('All'); setSortBy('newest'); }}
                        className="text-xs text-charcoal-muted hover:text-gold mt-2 underline">
                        Clear all filters
                      </button>
                    </div>
                  )}
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Product Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-charcoal-muted">
                {loading ? 'Loading…' : `${filteredProducts.length} piece${filteredProducts.length !== 1 ? 's' : ''}`}
              </p>
            </div>

            {/* Skeleton grid while loading */}
            {loading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            )}

            {/* Empty state (only after load completes) */}
            {!loading && filteredProducts.length === 0 && (
              <div className="text-center py-20">
                <p className="text-charcoal-muted font-serif text-xl mb-2">No pieces found</p>
                <p className="text-sm text-charcoal-muted/60">Try adjusting your filters</p>
              </div>
            )}

            {/* Product cards with staggered fade-in */}
            {!loading && filteredProducts.length > 0 && (
              <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                  {filteredProducts.map((product, index) => (
                    <motion.div
                      key={product._id}
                      layout
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.35, delay: Math.min(index * 0.06, 0.4), ease: 'easeOut' }}
                      className="product-card group bg-white rounded overflow-hidden border border-cream-dark hover:border-gold/20"
                    >
                      {/* Image */}
                      <Link href={`/products/${product.slug.current}`}>
                        <div className="aspect-square bg-gradient-to-br from-cream-dark to-cream relative overflow-hidden">
                          {product.images && product.images.length > 0 ? (
                            <Image
                              src={product.images[0]}
                              alt={product.name}
                              fill
                              loading="lazy"
                              placeholder="blur"
                              blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2YwZWNlMyIvPjwvc3ZnPg=="
                              className="object-cover product-image transition-transform duration-500 group-hover:scale-105"
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-5xl opacity-20">
                                {product.category.name === 'Rings' ? '💍' :
                                 product.category.name === 'Necklaces' ? '📿' :
                                 product.category.name === 'Earrings' ? '✨' :
                                 product.category.name === 'Bracelets' ? '⭐' :
                                 product.category.name === 'Pendants' ? '🔮' :
                                 product.category.name === 'Studs' ? '🌟' : '⭐'}
                              </span>
                            </div>
                          )}
                          {/* Category badge */}
                          <div className="absolute top-3 left-3">
                            <span className="text-[0.65rem] tracking-[0.15em] uppercase bg-white/90 px-2 py-1 rounded text-charcoal-muted">
                              {product.category.name}
                            </span>
                          </div>
                          {/* Stone indicator */}
                          {product.mainStoneType && product.mainStoneType !== 'None' && (
                            <div className="absolute top-3 right-3">
                              <span
                                className="w-4 h-4 rounded-full block border-2 border-white shadow-sm"
                                style={{ backgroundColor: stoneColors[product.mainStoneType] || '#ccc' }}
                                title={product.mainStoneType}
                              />
                            </div>
                          )}
                          {/* Quick Add */}
                          <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 p-3">
                            {(() => {
                              const cartItem = cartItems.find((i) => i._id === product._id);
                              const atMax = cartItem ? cartItem.quantity >= (product.stockQuantity ?? 1) : false;
                              return (
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    if (atMax) return;
                                    addItem({
                                      _id: product._id,
                                      name: product.name,
                                      price: product.price,
                                      image: product.images?.[0] || '',
                                      slug: product.slug.current,
                                      silverWeight: product.silverWeight,
                                      mainStoneType: product.mainStoneType,
                                      stockQuantity: product.stockQuantity ?? 1,
                                    });
                                  }}
                                  disabled={atMax}
                                  className={`w-full text-center text-xs py-2 ${atMax ? 'bg-charcoal/10 text-charcoal/40 cursor-not-allowed rounded' : 'btn-gold'}`}
                                >
                                  {atMax ? '✓ In Bag' : 'Add to Bag'}
                                </button>
                              );
                            })()}
                          </div>
                        </div>
                      </Link>

                      {/* Info */}
                      <div className="p-4">
                        <Link href={`/products/${product.slug.current}`}>
                          <h3 className="font-serif text-base text-charcoal hover:text-gold transition-colors line-clamp-1">
                            {product.name}
                          </h3>
                        </Link>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-gold font-semibold tracking-wide">
                            {formatPrice(product.price, currency)}
                          </p>
                          <span className="text-[0.65rem] text-charcoal-muted">
                            {product.silverWeight}g Silver
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
