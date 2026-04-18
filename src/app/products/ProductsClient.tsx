'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { useCartStore } from '@/stores/cart-store';
import { useCurrencyStore, formatPrice } from '@/stores/currency-store';
import AnimatedSection from '@/components/ui/AnimatedSection';

const PRICE_MIN = 4000;
const PRICE_MAX = 400000;

const categories = ['All', 'Rings', 'Necklaces', 'Earrings', 'Bracelets', 'Pendants', 'Studs'];
const stoneTypes = [
  'All', 'Diamond', 'Ruby', 'Emerald', 'Sapphire',
  'Opal', 'Moonstone', 'Blue Topaz', 'Amethyst', 'Black Opal', 'Coloured Opal',
  'Tourmaline', 'Yellow Sapphire', 'Aquamarine', 'Turquoise', 'Tanzanite',
  'Coral', 'Morganite', 'Peridot', 'Tsavorite', 'Alexandrite', 'Spinel',
];
const sortOptions = [
  { label: 'Featured', value: 'featured' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Newest', value: 'newest' },
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

function formatINR(val: number) {
  return '₹' + val.toLocaleString('en-IN');
}

function PriceRangeSlider({
  minVal,
  maxVal,
  onChange,
}: {
  minVal: number;
  maxVal: number;
  onChange: (min: number, max: number) => void;
}) {
  const range = PRICE_MAX - PRICE_MIN;
  const leftPct = ((minVal - PRICE_MIN) / range) * 100;
  const rightPct = ((maxVal - PRICE_MIN) / range) * 100;

  const handleMin = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = Math.min(Number(e.target.value), maxVal - 1000);
      onChange(v, maxVal);
    },
    [maxVal, onChange]
  );

  const handleMax = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = Math.max(Number(e.target.value), minVal + 1000);
      onChange(minVal, v);
    },
    [minVal, onChange]
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span style={{ color: '#c9a84c', fontFamily: 'var(--font-cinzel), serif', fontSize: '0.72rem', letterSpacing: '0.04em' }}>
          {formatINR(minVal)}
        </span>
        <span style={{ color: '#6b6b6b', fontSize: '0.65rem' }}>—</span>
        <span style={{ color: '#c9a84c', fontFamily: 'var(--font-cinzel), serif', fontSize: '0.72rem', letterSpacing: '0.04em' }}>
          {formatINR(maxVal)}
        </span>
      </div>
      <div className="price-range-slider">
        {/* Dark track */}
        <div className="price-range-track" />
        {/* Gold fill */}
        <div
          className="price-range-fill"
          style={{ left: `${leftPct}%`, width: `${rightPct - leftPct}%` }}
        />
        {/* Min handle */}
        <input
          type="range"
          min={PRICE_MIN}
          max={PRICE_MAX}
          step={1000}
          value={minVal}
          onChange={handleMin}
          className="price-range-input"
          style={{ zIndex: minVal > PRICE_MAX - 10000 ? 5 : 3 }}
        />
        {/* Max handle */}
        <input
          type="range"
          min={PRICE_MIN}
          max={PRICE_MAX}
          step={1000}
          value={maxVal}
          onChange={handleMax}
          className="price-range-input"
          style={{ zIndex: 4 }}
        />
      </div>
    </div>
  );
}

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

export default function ProductsClient() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStone, setSelectedStone] = useState('All');
  const [sortBy, setSortBy] = useState('featured');
  const [priceRange, setPriceRange] = useState<[number, number]>([PRICE_MIN, PRICE_MAX]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [stonesExpanded, setStonesExpanded] = useState(false);
  const STONE_PREVIEW_COUNT = 5;
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem, items: cartItems } = useCartStore();
  const currency = useCurrencyStore((s) => s.currency);
  const [mounted, setMounted] = useState(false);

  const handlePriceChange = useCallback((min: number, max: number) => {
    setPriceRange([min, max]);
  }, []);

  useEffect(() => {
    setMounted(true);
    const controller = new AbortController();
    async function loadProducts() {
      try {
        const res = await fetch('/api/admin/products', {
          signal: controller.signal,
          // @ts-ignore
          priority: 'high',
        });
        if (res.ok) {
          const data = await res.json();
          const buildUniqueSlug = (p: any) => {
            const stone = (p.mainStoneType && p.mainStoneType !== 'None' ? p.mainStoneType : 'silver').toLowerCase().replace(/[^a-z0-9]+/g, '-');
            const cat = (p.category || 'jewellery').toLowerCase().replace(/[^a-z0-9]+/g, '-');
            const sku = String(p.sku || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || p._id.slice(-6);
            return `${stone}-${cat}-${sku}`.replace(/-+/g, '-');
          };
          const apiProducts = data.products.map((p: any) => ({
            _id: p._id,
            name: p.name,
            sku: p.sku,
            slug: { current: buildUniqueSlug(p) },
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

  const isPriceFiltered = priceRange[0] > PRICE_MIN || priceRange[1] < PRICE_MAX;

  const filteredProducts = useMemo(() => {
    let result = allProducts.filter((p) => p.inStock !== false);
    if (selectedCategory !== 'All') result = result.filter((p) => p.category.name === selectedCategory);
    if (selectedStone !== 'All') result = result.filter((p) => p.mainStoneType === selectedStone);
    result = result.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1]);
    if (sortBy === 'price-asc') result.sort((a, b) => a.price - b.price);
    else if (sortBy === 'price-desc') result.sort((a, b) => b.price - a.price);
    return result;
  }, [selectedCategory, selectedStone, sortBy, priceRange, allProducts]);

  const clearAll = () => {
    setSelectedCategory('All');
    setSelectedStone('All');
    setSortBy('featured');
    setPriceRange([PRICE_MIN, PRICE_MAX]);
  };

  const hasActiveFilters = selectedCategory !== 'All' || selectedStone !== 'All' || isPriceFiltered;

  return (
    <div className="pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

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
                <div
                  className="sticky top-28 space-y-7 p-6 rounded"
                  style={{
                    background: 'linear-gradient(160deg, #161616 0%, #1e1a10 100%)',
                    border: '1px solid rgba(201,168,76,0.25)',
                    boxShadow: '0 4px 32px rgba(0,0,0,0.35)',
                  }}
                >
                  {/* Category */}
                  <div>
                    <h3
                      className="mb-1 uppercase tracking-[0.18em] text-[0.68rem]"
                      style={{ fontFamily: 'var(--font-cinzel), serif', color: '#c9a84c' }}
                    >
                      Category
                    </h3>
                    <div
                      className="mb-4"
                      style={{ height: '1px', background: 'linear-gradient(90deg, #c9a84c55, transparent)' }}
                    />
                    <div className="space-y-1">
                      {categories.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          className="block w-full text-left text-sm px-3 py-2 rounded transition-all duration-200"
                          style={{
                            color: selectedCategory === cat ? '#c9a84c' : '#a0a0a0',
                            background: selectedCategory === cat ? 'rgba(201,168,76,0.1)' : 'transparent',
                            fontWeight: selectedCategory === cat ? 500 : 400,
                          }}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div>
                    <h3
                      className="mb-1 uppercase tracking-[0.18em] text-[0.68rem]"
                      style={{ fontFamily: 'var(--font-cinzel), serif', color: '#c9a84c' }}
                    >
                      Price Range
                    </h3>
                    <div
                      className="mb-4"
                      style={{ height: '1px', background: 'linear-gradient(90deg, #c9a84c55, transparent)' }}
                    />
                    <PriceRangeSlider
                      minVal={priceRange[0]}
                      maxVal={priceRange[1]}
                      onChange={handlePriceChange}
                    />
                  </div>

                  {/* Stone Type */}
                  <div>
                    <h3
                      className="mb-1 uppercase tracking-[0.18em] text-[0.68rem]"
                      style={{ fontFamily: 'var(--font-cinzel), serif', color: '#c9a84c' }}
                    >
                      Stone Type
                    </h3>
                    <div
                      className="mb-4"
                      style={{ height: '1px', background: 'linear-gradient(90deg, #c9a84c55, transparent)' }}
                    />
                    <div className="space-y-1">
                      {(stonesExpanded ? stoneTypes : stoneTypes.slice(0, STONE_PREVIEW_COUNT)).map((stone) => (
                        <button
                          key={stone}
                          onClick={() => setSelectedStone(stone)}
                          className="flex items-center gap-2 w-full text-left text-sm px-3 py-2 rounded transition-all duration-200"
                          style={{
                            color: selectedStone === stone ? '#c9a84c' : '#a0a0a0',
                            background: selectedStone === stone ? 'rgba(201,168,76,0.1)' : 'transparent',
                            fontWeight: selectedStone === stone ? 500 : 400,
                          }}
                        >
                          {stone !== 'All' && (
                            <span
                              className="w-3 h-3 rounded-full flex-shrink-0"
                              style={{
                                backgroundColor: stoneColors[stone],
                                border: '1px solid rgba(255,255,255,0.15)',
                              }}
                            />
                          )}
                          {stone}
                        </button>
                      ))}
                    </div>
                    {stoneTypes.length > STONE_PREVIEW_COUNT && (
                      <button
                        onClick={() => setStonesExpanded(!stonesExpanded)}
                        className="mt-2 flex items-center gap-1 text-xs transition-colors"
                        style={{ color: '#6b6b6b' }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#c9a84c')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = '#6b6b6b')}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
                          className={`w-3 h-3 transition-transform duration-200 ${stonesExpanded ? 'rotate-180' : ''}`}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                        </svg>
                        {stonesExpanded ? 'Show Less' : `Show ${stoneTypes.length - STONE_PREVIEW_COUNT} More`}
                      </button>
                    )}
                  </div>

                  {/* Sort By */}
                  <div>
                    <h3
                      className="mb-1 uppercase tracking-[0.18em] text-[0.68rem]"
                      style={{ fontFamily: 'var(--font-cinzel), serif', color: '#c9a84c' }}
                    >
                      Sort By
                    </h3>
                    <div
                      className="mb-4"
                      style={{ height: '1px', background: 'linear-gradient(90deg, #c9a84c55, transparent)' }}
                    />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="gold-select"
                    >
                      {sortOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Active Filters */}
                  {hasActiveFilters && (
                    <div>
                      <div className="flex flex-wrap gap-2">
                        {selectedCategory !== 'All' && (
                          <span
                            className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded"
                            style={{ background: 'rgba(201,168,76,0.12)', color: '#c9a84c', border: '1px solid rgba(201,168,76,0.25)' }}
                          >
                            {selectedCategory}
                            <button onClick={() => setSelectedCategory('All')} className="hover:opacity-70">×</button>
                          </span>
                        )}
                        {selectedStone !== 'All' && (
                          <span
                            className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded"
                            style={{ background: 'rgba(201,168,76,0.12)', color: '#c9a84c', border: '1px solid rgba(201,168,76,0.25)' }}
                          >
                            {selectedStone}
                            <button onClick={() => setSelectedStone('All')} className="hover:opacity-70">×</button>
                          </span>
                        )}
                        {isPriceFiltered && (
                          <span
                            className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded"
                            style={{ background: 'rgba(201,168,76,0.12)', color: '#c9a84c', border: '1px solid rgba(201,168,76,0.25)' }}
                          >
                            {formatINR(priceRange[0])}–{formatINR(priceRange[1])}
                            <button onClick={() => setPriceRange([PRICE_MIN, PRICE_MAX])} className="hover:opacity-70">×</button>
                          </span>
                        )}
                      </div>
                      <button
                        onClick={clearAll}
                        className="text-xs mt-2 underline transition-colors"
                        style={{ color: '#6b6b6b' }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#c9a84c')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = '#6b6b6b')}
                      >
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

            {loading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            )}

            {!loading && filteredProducts.length === 0 && (
              <div className="text-center py-20">
                <p className="text-charcoal-muted font-serif text-xl mb-2">No pieces found</p>
                <p className="text-sm text-charcoal-muted/60">Try adjusting your filters</p>
              </div>
            )}

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
                          <div className="absolute top-3 left-3">
                            <span className="text-[0.65rem] tracking-[0.15em] uppercase bg-white/90 px-2 py-1 rounded text-charcoal-muted">
                              {product.category.name}
                            </span>
                          </div>
                          {product.mainStoneType && product.mainStoneType !== 'None' && (
                            <div className="absolute top-3 right-3">
                              <span
                                className="w-4 h-4 rounded-full block border-2 border-white shadow-sm"
                                style={{ backgroundColor: stoneColors[product.mainStoneType] || '#ccc' }}
                                title={product.mainStoneType}
                              />
                            </div>
                          )}
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
