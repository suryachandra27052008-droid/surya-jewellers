'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Heart } from 'lucide-react';
import { getSalePrice, useSeasonalSale } from '@/hooks/use-seasonal-sale';
import { useCartStore } from '@/stores/cart-store';
import { useCurrencyStore, formatPrice } from '@/stores/currency-store';
import { useWishlistStore } from '@/stores/wishlist-store';
import {
  getProductCanonicalSlug,
  getProductDisplayName,
  getProductImageAlt,
  type ProductSeoInput,
} from '@/lib/seo/product';

const PRICE_MIN = 0;
const PRICE_MAX = 800000;
const STONE_PREVIEW_COUNT = 8;

const INVALID_STONES = new Set(['', 'None', 'N/A', 'none', 'n/a', 'null', 'undefined']);

const sortOptions = [
  { label: 'Featured', value: 'featured' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Newest', value: 'newest' },
];

// Minimal shape fetched server-side and passed as prop.
// Exported so page.tsx can type the fetch result.
export type InitialProduct = {
  _id: string;
  name: string;
  slug: string;
  sku?: string;
  price: number;
  category: string;
  silverWeight: number;
  mainStoneType: string;
  secondaryStoneType: string;
  images: string[];
  inStock?: boolean;
  stockQuantity?: number;
  _createdAt?: string;
};

type ProductListItem = {
  _id: string;
  name: string;
  sku?: string | number;
  displayName: string;
  imageAlt: string;
  slug: { current: string };
  price: number;
  category: { name: string; slug: { current: string } };
  mainStoneType: string;
  secondaryStoneType: string;
  silverWeight: number;
  images: string[];
  inStock?: boolean;
  stockQuantity?: number;
  createdAt: string | null;
  _idx: number;
};

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
  'Blue Sapphire': '#0F52BA',
  'Pink Sapphire': '#FF69B4',
  'Star Ruby': '#C0135A',
  'Rose Quartz': '#F4C2C2',
  Garnet: '#7B1818',
  Citrine: '#E4A00E',
  Amethist: '#9C27B0',
  Pearl: '#F5F5DC',
  'Lemon Topaz': '#FFF44F',
  'London Topaz': '#2C5A8F',
  'Green Topaz': '#00A86B',
  Larimar: '#ADD8E6',
  'Moon Stone': '#D6E4F0',
  Kunzait: '#FF91AF',
  Rhodolite: '#A23B72',
};

function formatINR(val: number) {
  return '₹' + val.toLocaleString('en-IN');
}

function mapProduct(p: InitialProduct, idx: number): ProductListItem {
  const seoInput: ProductSeoInput = {
    _id: p._id,
    name: p.name,
    slug: p.slug,
    sku: p.sku,
    mainStoneType: p.mainStoneType,
    category: p.category,
  };
  return {
    _id: p._id,
    name: p.name || 'Silver Jewellery',
    sku: p.sku,
    displayName: getProductDisplayName(seoInput),
    imageAlt: getProductImageAlt(seoInput),
    slug: { current: getProductCanonicalSlug(seoInput) },
    price: Number(p.price) || 0,
    category: {
      name: p.category || 'Rings',
      slug: { current: (p.category || 'rings').toLowerCase() },
    },
    mainStoneType: p.mainStoneType || 'None',
    secondaryStoneType: p.secondaryStoneType || '',
    silverWeight: p.silverWeight || 0,
    images: p.images ?? [],
    inStock: p.inStock,
    stockQuantity: p.stockQuantity,
    createdAt: p._createdAt || null,
    _idx: idx,
  };
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
        <div className="price-range-track" />
        <div
          className="price-range-fill"
          style={{ left: `${leftPct}%`, width: `${rightPct - leftPct}%` }}
        />
        <input
          type="range"
          min={PRICE_MIN}
          max={PRICE_MAX}
          step={1000}
          value={minVal}
          onChange={handleMin}
          className="price-range-input"
          aria-label="Minimum price"
          aria-valuetext={formatINR(minVal)}
          style={{ zIndex: minVal > PRICE_MAX - 10000 ? 5 : 3 }}
        />
        <input
          type="range"
          min={PRICE_MIN}
          max={PRICE_MAX}
          step={1000}
          value={maxVal}
          onChange={handleMax}
          className="price-range-input"
          aria-label="Maximum price"
          aria-valuetext={formatINR(maxVal)}
          style={{ zIndex: 4 }}
        />
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded overflow-hidden border border-cream-dark flex flex-col">
      <div className="aspect-square bg-cream-dark animate-pulse" />
      <div className="p-2 sm:p-4 flex flex-col flex-1">
        <div className="h-3 bg-cream-dark rounded animate-pulse w-4/5 mb-1" />
        <div className="h-3 bg-cream-dark rounded animate-pulse w-3/5 mb-auto" />
        <div className="h-3 bg-cream-dark rounded animate-pulse w-2/5 mt-1.5 mb-2 sm:mb-3" />
        <div className="h-[40px] bg-cream-dark rounded animate-pulse w-full" />
      </div>
    </div>
  );
}

export default function ProductsClient({
  initialProducts = [],
}: {
  initialProducts?: InitialProduct[];
}) {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || 'All');
  const [selectedStone, setSelectedStone] = useState('All');
  const [sortBy, setSortBy] = useState('featured');
  const [priceRange, setPriceRange] = useState<[number, number]>([PRICE_MIN, PRICE_MAX]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [stonesExpanded, setStonesExpanded] = useState(false);

  const [allProducts, setAllProducts] = useState<ProductListItem[]>(() =>
    initialProducts.map(mapProduct)
  );
  const [loading, setLoading] = useState(initialProducts.length === 0);

  const { addItem, items: cartItems } = useCartStore();
  const currency = useCurrencyStore((s) => s.currency);
  const { sale } = useSeasonalSale();
  const toggleWishlist = useWishlistStore((s) => s.toggleItem);
  const isWishlisted = useWishlistStore((s) => s.isWishlisted);
  const [gridView, setGridView] = useState<'compact' | 'comfortable'>('compact');

  const handlePriceChange = useCallback((min: number, max: number) => {
    setPriceRange([min, max]);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('surya-grid-view');
    if (saved === 'comfortable' || saved === 'compact') setGridView(saved);
  }, []);

  const handleViewChange = useCallback((view: 'compact' | 'comfortable') => {
    setGridView(view);
    localStorage.setItem('surya-grid-view', view);
  }, []);

  // Lock body scroll when mobile filter drawer is open
  useEffect(() => {
    if (filtersOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [filtersOpen]);

  // Fallback fetch: only runs when the server didn't provide initial data
  useEffect(() => {
    if (initialProducts.length > 0) return;
    let cancelled = false;
    async function fetchFallback() {
      try {
        const res = await fetch('/api/admin/products');
        if (!res.ok || cancelled) return;
        const data = await res.json() as { products?: InitialProduct[] };
        const products = (data.products ?? []).map(mapProduct);
        if (!cancelled) setAllProducts(products);
      } catch { /* ignore */ } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchFallback();
    return () => { cancelled = true; };
  }, [initialProducts.length]);

  // Dynamic categories derived from actual uploaded products
  const availableCategories = useMemo(() => {
    const counts: Record<string, number> = {};
    allProducts.filter(p => p.inStock !== false).forEach(p => {
      const cat = p.category.name;
      if (cat) counts[cat] = (counts[cat] || 0) + 1;
    });
    const total = allProducts.filter(p => p.inStock !== false).length;
    return [
      { name: 'All', count: total },
      ...Object.entries(counts)
        .filter(([, c]) => c > 0)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([name, count]) => ({ name, count })),
    ];
  }, [allProducts]);

  // Dynamic stone types from both mainStoneType and secondaryStoneType
  const availableStones = useMemo(() => {
    const counts: Record<string, number> = {};
    allProducts.filter(p => p.inStock !== false).forEach(p => {
      if (p.mainStoneType && !INVALID_STONES.has(p.mainStoneType)) {
        counts[p.mainStoneType] = (counts[p.mainStoneType] || 0) + 1;
      }
      if (p.secondaryStoneType && !INVALID_STONES.has(p.secondaryStoneType)) {
        counts[p.secondaryStoneType] = (counts[p.secondaryStoneType] || 0) + 1;
      }
    });
    const total = allProducts.filter(p => p.inStock !== false).length;
    return [
      { name: 'All', count: total },
      ...Object.entries(counts)
        .filter(([, c]) => c > 0)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([name, count]) => ({ name, count })),
    ];
  }, [allProducts]);

  const isPriceFiltered = priceRange[0] > PRICE_MIN || priceRange[1] < PRICE_MAX;

  const filteredProducts = useMemo(() => {
    let result = allProducts.filter((p) => p.inStock !== false);
    if (selectedCategory !== 'All') result = result.filter((p) => p.category.name === selectedCategory);
    if (selectedStone !== 'All') result = result.filter((p) => p.mainStoneType === selectedStone || p.secondaryStoneType === selectedStone);
    result = result.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1]);
    if (sortBy === 'price-asc') result = [...result].sort((a, b) => a.price - b.price);
    else if (sortBy === 'price-desc') result = [...result].sort((a, b) => b.price - a.price);
    else if (sortBy === 'newest') result = [...result].sort((a, b) => {
      if (a.createdAt && b.createdAt) return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return a._idx - b._idx;
    });
    return result;
  }, [selectedCategory, selectedStone, sortBy, priceRange, allProducts]);

  const clearAll = () => {
    setSelectedCategory('All');
    setSelectedStone('All');
    setSortBy('featured');
    setPriceRange([PRICE_MIN, PRICE_MAX]);
  };

  const hasActiveFilters = selectedCategory !== 'All' || selectedStone !== 'All' || isPriceFiltered;

  const gridClass =
    gridView === 'comfortable'
      ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6'
      : 'grid grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-6';

  // Stone options excluding 'All' (shown separately as first item)
  const stoneOptions = availableStones.slice(1);
  const visibleStoneOptions = stonesExpanded ? stoneOptions : stoneOptions.slice(0, STONE_PREVIEW_COUNT);
  const hasMoreStones = stoneOptions.length > STONE_PREVIEW_COUNT;

  // Shared filter panel content — used in both mobile drawer and desktop sidebar
  const filterContent = (
    <div className="space-y-7">
      {/* Category */}
      <div>
        <h3
          className="mb-1 uppercase tracking-[0.18em] text-[0.68rem]"
          style={{ fontFamily: 'var(--font-cinzel), serif', color: '#c9a84c' }}
        >
          Category
        </h3>
        <div className="mb-4" style={{ height: '1px', background: 'linear-gradient(90deg, #c9a84c55, transparent)' }} />
        <div className="space-y-0.5">
          {availableCategories.map(({ name, count }) => (
            <button
              key={name}
              onClick={() => setSelectedCategory(name)}
              className="flex items-center justify-between w-full text-left text-sm px-3 py-2 rounded transition-all duration-200"
              style={{
                color: selectedCategory === name ? '#c9a84c' : '#a0a0a0',
                background: selectedCategory === name ? 'rgba(201,168,76,0.1)' : 'transparent',
                fontWeight: selectedCategory === name ? 500 : 400,
              }}
            >
              <span>{name}</span>
              {name !== 'All' && (
                <span className="text-[0.65rem] tabular-nums" style={{ color: '#555' }}>{count}</span>
              )}
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
        <div className="mb-4" style={{ height: '1px', background: 'linear-gradient(90deg, #c9a84c55, transparent)' }} />
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
        <div className="mb-4" style={{ height: '1px', background: 'linear-gradient(90deg, #c9a84c55, transparent)' }} />
        <div className="space-y-0.5">
          {/* All stones option */}
          <button
            onClick={() => setSelectedStone('All')}
            className="flex items-center justify-between w-full text-left text-sm px-3 py-2 rounded transition-all duration-200"
            style={{
              color: selectedStone === 'All' ? '#c9a84c' : '#a0a0a0',
              background: selectedStone === 'All' ? 'rgba(201,168,76,0.1)' : 'transparent',
              fontWeight: selectedStone === 'All' ? 500 : 400,
            }}
          >
            <span>All</span>
          </button>
          {visibleStoneOptions.map(({ name, count }) => (
            <button
              key={name}
              onClick={() => setSelectedStone(name)}
              className="flex items-center gap-2 w-full text-left text-sm px-3 py-2 rounded transition-all duration-200"
              style={{
                color: selectedStone === name ? '#c9a84c' : '#a0a0a0',
                background: selectedStone === name ? 'rgba(201,168,76,0.1)' : 'transparent',
                fontWeight: selectedStone === name ? 500 : 400,
              }}
            >
              <span
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{
                  backgroundColor: stoneColors[name] || '#888',
                  border: '1px solid rgba(255,255,255,0.15)',
                }}
              />
              <span className="flex-1 text-left">{name}</span>
              <span className="text-[0.65rem] tabular-nums" style={{ color: '#555' }}>{count}</span>
            </button>
          ))}
        </div>
        {hasMoreStones && (
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
            {stonesExpanded ? 'Show Less' : `Show ${stoneOptions.length - STONE_PREVIEW_COUNT} More`}
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
        <div className="mb-4" style={{ height: '1px', background: 'linear-gradient(90deg, #c9a84c55, transparent)' }} />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="gold-select"
          aria-label="Sort products by"
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div>
          <div className="flex flex-wrap gap-2">
            {selectedCategory !== 'All' && (
              <span
                className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded"
                style={{ background: 'rgba(201,168,76,0.12)', color: '#c9a84c', border: '1px solid rgba(201,168,76,0.25)' }}
              >
                {selectedCategory}
                <button onClick={() => setSelectedCategory('All')} className="hover:opacity-70 ml-0.5">×</button>
              </span>
            )}
            {selectedStone !== 'All' && (
              <span
                className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded"
                style={{ background: 'rgba(201,168,76,0.12)', color: '#c9a84c', border: '1px solid rgba(201,168,76,0.25)' }}
              >
                {selectedStone}
                <button onClick={() => setSelectedStone('All')} className="hover:opacity-70 ml-0.5">×</button>
              </span>
            )}
            {isPriceFiltered && (
              <span
                className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded"
                style={{ background: 'rgba(201,168,76,0.12)', color: '#c9a84c', border: '1px solid rgba(201,168,76,0.25)' }}
              >
                {formatINR(priceRange[0])}–{formatINR(priceRange[1])}
                <button onClick={() => setPriceRange([PRICE_MIN, PRICE_MAX])} className="hover:opacity-70 ml-0.5">×</button>
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
  );

  const sidebarStyle = {
    background: 'linear-gradient(160deg, #161616 0%, #1e1a10 100%)',
    border: '1px solid rgba(201,168,76,0.25)',
    boxShadow: '0 4px 32px rgba(0,0,0,0.35)',
  };

  return (
    <div className="pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Mobile top bar: filter toggle + view switcher */}
        <div className="lg:hidden mb-4 flex items-center justify-between gap-3">
          <button
            onClick={() => setFiltersOpen(true)}
            className="flex items-center gap-2 text-sm text-charcoal border border-cream-dark px-4 py-2 hover:border-gold transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
            </svg>
            Filters & Sort
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-gold flex-shrink-0" />
            )}
          </button>

          {/* Grid view toggle */}
          <div className="flex items-center border border-cream-dark rounded overflow-hidden" role="group" aria-label="Grid view">
            <button
              onClick={() => handleViewChange('compact')}
              aria-label="Compact 2-column grid"
              aria-pressed={gridView === 'compact'}
              className={`p-2 transition-colors ${gridView === 'compact' ? 'bg-charcoal text-white' : 'text-charcoal-muted hover:text-charcoal'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
                <path d="M1 2.5A1.5 1.5 0 012.5 1h3A1.5 1.5 0 017 2.5v3A1.5 1.5 0 015.5 7h-3A1.5 1.5 0 011 5.5v-3zM9 2.5A1.5 1.5 0 0110.5 1h3A1.5 1.5 0 0115 2.5v3A1.5 1.5 0 0113.5 7h-3A1.5 1.5 0 019 5.5v-3zM1 10.5A1.5 1.5 0 012.5 9h3A1.5 1.5 0 017 10.5v3A1.5 1.5 0 015.5 15h-3A1.5 1.5 0 011 13.5v-3zM9 10.5A1.5 1.5 0 0110.5 9h3A1.5 1.5 0 0115 10.5v3A1.5 1.5 0 0113.5 15h-3A1.5 1.5 0 019 13.5v-3z" />
              </svg>
            </button>
            <button
              onClick={() => handleViewChange('comfortable')}
              aria-label="Single column comfortable view"
              aria-pressed={gridView === 'comfortable'}
              className={`p-2 transition-colors border-l border-cream-dark ${gridView === 'comfortable' ? 'bg-charcoal text-white' : 'text-charcoal-muted hover:text-charcoal'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M2 4.75A.75.75 0 012.75 4h10.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zM2 8a.75.75 0 01.75-.75h10.5a.75.75 0 010 1.5H2.75A.75.75 0 012 8zm0 3.25a.75.75 0 01.75-.75h10.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile filter drawer — fixed overlay */}
        {filtersOpen && (
          <div
            className="fixed inset-0 z-[200] lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Product filters"
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/60"
              onClick={() => setFiltersOpen(false)}
            />
            {/* Drawer panel */}
            <div
              className="absolute left-0 top-0 h-full w-[85vw] max-w-xs flex flex-col"
              style={sidebarStyle}
            >
              {/* Drawer header */}
              <div
                className="flex items-center justify-between px-4 py-3 flex-shrink-0"
                style={{ borderBottom: '1px solid rgba(201,168,76,0.2)', background: '#161616' }}
              >
                <span
                  className="uppercase tracking-[0.2em] text-[0.7rem]"
                  style={{ fontFamily: 'var(--font-cinzel), serif', color: '#c9a84c' }}
                >
                  Filters
                </span>
                <button
                  onClick={() => setFiltersOpen(false)}
                  className="p-1 rounded transition-colors"
                  aria-label="Close filters"
                  style={{ color: '#c9a84c' }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto p-4">
                {filterContent}
              </div>
              {/* Footer: apply / close */}
              <div
                className="flex-shrink-0 p-4"
                style={{ borderTop: '1px solid rgba(201,168,76,0.2)', background: '#161616' }}
              >
                <button
                  onClick={() => setFiltersOpen(false)}
                  className="w-full py-3 text-xs uppercase tracking-[0.2em] font-semibold rounded transition-colors"
                  style={{ background: 'rgba(201,168,76,0.15)', color: '#c9a84c', border: '1px solid rgba(201,168,76,0.3)' }}
                >
                  Show {filteredProducts.length} result{filteredProducts.length !== 1 ? 's' : ''}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop sidebar — hidden on mobile */}
          <aside className="hidden lg:block lg:w-64 flex-shrink-0">
            <div
              className="sticky top-20 space-y-7 p-6 rounded"
              style={sidebarStyle}
            >
              {filterContent}
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-charcoal-muted">
                {loading ? 'Loading…' : `${filteredProducts.length} piece${filteredProducts.length !== 1 ? 's' : ''}`}
              </p>
            </div>

            {loading && (
              <div className="grid grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-6">
                {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            )}

            {!loading && filteredProducts.length === 0 && (
              <div className="text-center py-20">
                <p className="text-charcoal-muted font-serif text-xl mb-2">No pieces found</p>
                <p className="text-sm text-charcoal-muted/60">Try adjusting your filters</p>
              </div>
            )}

            {!loading && filteredProducts.length > 0 && (
              <div className={gridClass}>
                {filteredProducts.map((product, index) => {
                  const cartItem = cartItems.find((i) => i._id === product._id);
                  const atMax = cartItem ? cartItem.quantity >= (product.stockQuantity ?? 1) : false;
                  const aboveFold = index < 4;
                  const salePrice = getSalePrice(product.price, sale);
                  const wished = isWishlisted(product._id);
                  return (
                    <div
                      key={product._id}
                      className="product-card group h-full bg-white rounded overflow-hidden border border-cream-dark hover:border-gold/20 flex flex-col"
                    >
                      {/* Image — full area tappable link */}
                      <Link href={`/products/${product.slug.current}`}>
                        <div className="aspect-square bg-gradient-to-br from-cream-dark to-cream relative overflow-hidden">
                          {product.images && product.images.length > 0 ? (
                            <Image
                              src={product.images[0]}
                              alt={product.imageAlt || product.displayName || product.name}
                              fill
                              priority={aboveFold}
                              loading={aboveFold ? 'eager' : 'lazy'}
                              placeholder="blur"
                              blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2YwZWNlMyIvPjwvc3ZnPg=="
                              className="object-cover product-image transition-transform duration-500 group-hover:scale-105"
                              sizes="(max-width: 640px) 50vw, (max-width: 1280px) 50vw, 33vw"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-4xl opacity-20">
                                {product.category.name === 'Rings' ? '💍' :
                                 product.category.name === 'Necklaces' ? '📿' :
                                 product.category.name === 'Earrings' ? '✨' :
                                 product.category.name === 'Bracelets' ? '⭐' :
                                 product.category.name === 'Pendants' ? '🔮' :
                                 product.category.name === 'Studs' ? '🌟' : '⭐'}
                              </span>
                            </div>
                          )}
                          <div className="absolute top-2 left-2 sm:top-3 sm:left-3">
                            <span className="text-[0.6rem] sm:text-[0.65rem] tracking-[0.12em] uppercase bg-white/90 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-charcoal-muted">
                              {product.category.name}
                            </span>
                          </div>
                          {sale && product.price > 0 && (
                            <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3">
                              <span className="text-[0.58rem] sm:text-[0.62rem] tracking-[0.12em] uppercase bg-gold text-white px-2 py-1 rounded shadow-sm font-semibold">
                                {sale.percent}% off
                              </span>
                            </div>
                          )}
                          {((product.mainStoneType && product.mainStoneType !== 'None') || product.secondaryStoneType) && (
                            <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex flex-col gap-1">
                              {product.mainStoneType && product.mainStoneType !== 'None' && (
                                <span
                                  className="w-3 h-3 sm:w-4 sm:h-4 rounded-full block border-2 border-white shadow-sm"
                                  style={{ backgroundColor: stoneColors[product.mainStoneType] || '#ccc' }}
                                  title={product.mainStoneType}
                                />
                              )}
                              {product.secondaryStoneType && (
                                <span
                                  className="w-3 h-3 sm:w-4 sm:h-4 rounded-full block border-2 border-white shadow-sm"
                                  style={{ backgroundColor: stoneColors[product.secondaryStoneType] || '#aaa' }}
                                  title={product.secondaryStoneType}
                                />
                              )}
                            </div>
                          )}
                        </div>
                      </Link>

                      {/* Card info — separate from image link */}
                      <div className="p-2 sm:p-4 flex flex-col flex-1">
                        <div className="flex items-start gap-2 min-h-[2.25rem] sm:min-h-[3rem]">
                          <Link href={`/products/${product.slug.current}`} className="min-w-0 flex-1">
                            <h3 className="font-serif text-xs sm:text-base text-charcoal hover:text-gold transition-colors line-clamp-2 leading-snug">
                              {product.displayName || product.name}
                            </h3>
                          </Link>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleWishlist({
                                _id: product._id,
                                name: product.displayName || product.name,
                                price: product.price,
                                image: product.images?.[0] || '',
                                slug: product.slug.current,
                                category: product.category.name,
                                mainStoneType: product.mainStoneType,
                                silverWeight: product.silverWeight,
                                stockQuantity: product.stockQuantity ?? 1,
                              });
                            }}
                            aria-label={wished ? `Remove ${product.displayName || product.name} from wishlist` : `Save ${product.displayName || product.name} to wishlist`}
                            className={`shrink-0 rounded-full p-1 transition-colors ${
                              wished ? 'text-gold bg-gold/10' : 'text-charcoal-muted hover:text-gold hover:bg-gold/10'
                            }`}
                          >
                            <Heart className="h-4 w-4" fill={wished ? 'currentColor' : 'none'} strokeWidth={1.8} />
                          </button>
                        </div>
                        <div className="flex gap-1 mt-1 flex-wrap min-h-[1.45rem] sm:min-h-[1.75rem] content-start">
                          {product.mainStoneType && product.mainStoneType !== 'None' && (
                            <span
                              className="text-[0.55rem] sm:text-[0.6rem] px-1 sm:px-1.5 py-0.5 rounded"
                              style={{
                                background: `${stoneColors[product.mainStoneType] || '#ccc'}22`,
                                color: stoneColors[product.mainStoneType] || '#666',
                                border: `1px solid ${stoneColors[product.mainStoneType] || '#ccc'}55`,
                              }}
                            >
                              {product.mainStoneType}
                            </span>
                          )}
                          {product.secondaryStoneType && (
                            <span
                              className="text-[0.55rem] sm:text-[0.6rem] px-1 sm:px-1.5 py-0.5 rounded"
                              style={{
                                background: `${stoneColors[product.secondaryStoneType] || '#aaa'}22`,
                                color: stoneColors[product.secondaryStoneType] || '#666',
                                border: `1px solid ${stoneColors[product.secondaryStoneType] || '#aaa'}55`,
                              }}
                            >
                              {product.secondaryStoneType}
                            </span>
                          )}
                        </div>
                        <div className="flex items-end justify-between mt-1.5 sm:mt-2 min-h-[2.4rem]">
                          <div>
                            {salePrice ? (
                              <>
                                <p className="text-gold font-semibold tracking-wide text-xs sm:text-base">
                                  {formatPrice(salePrice, currency)}
                                </p>
                                <p className="text-[0.6rem] sm:text-[0.65rem] text-charcoal-muted line-through">
                                  {formatPrice(product.price, currency)}
                                </p>
                              </>
                            ) : (
                              <p className="text-gold font-semibold tracking-wide text-xs sm:text-base">
                                {product.price ? formatPrice(product.price, currency) : 'Contact'}
                              </p>
                            )}
                          </div>
                          <span className="text-[0.6rem] sm:text-[0.65rem] text-charcoal-muted whitespace-nowrap ml-1">
                            {product.silverWeight}g
                          </span>
                        </div>
                        {/* Always-visible Add to Bag */}
                        <div className="mt-auto pt-2 sm:pt-3">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
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
                            aria-label={
                              atMax
                                ? `In bag — ${product.displayName || product.name}`
                                : `Add to bag — ${product.displayName || product.name}`
                            }
                            className={`w-full text-center py-2.5 min-h-[44px] rounded transition-all ${
                              atMax
                                ? 'bg-charcoal/10 text-charcoal/40 cursor-not-allowed text-xs uppercase tracking-wider font-semibold'
                                : 'btn-gold'
                            }`}
                          >
                            {atMax ? '✓ In Bag' : 'Add to Bag'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
