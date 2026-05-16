'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Heart } from 'lucide-react';
import { getSalePrice, useSeasonalSale } from '@/hooks/use-seasonal-sale';
import { useCartStore } from '@/stores/cart-store';
import { useCurrencyStore, formatPrice } from '@/stores/currency-store';
import { useWishlistStore } from '@/stores/wishlist-store';
import AnimatedSection from '@/components/ui/AnimatedSection';

export interface RelatedProduct {
  _id: string;
  name: string;
  slug: string;
  price: number;
  images: string[];
  mainStoneType: string;
  category: string;
}

function generateDescription(product: ProductData): string {
  if (product.description) return product.description;
  const stone = product.mainStoneType !== 'None' ? product.mainStoneType : null;
  const caratText = product.totalCaratWeight > 0 ? ` (${product.totalCaratWeight} ct)` : '';
  const clarityText = product.diamondColorClarity ? `, graded ${product.diamondColorClarity}` : '';
  const stonePhrase = stone
    ? `, set with ${stone.toLowerCase()} gemstone details listed in the specifications${caratText}${clarityText}`
    : '';
  const weightText = product.silverWeight > 0 ? ` Weighing ${product.silverWeight}g` : '';
  return `This ${product.name} is handcrafted in hallmarked 92.5 sterling silver${stonePhrase}.${weightText ? ' ' + weightText + ', it' : ' It'} is part of our ${product.category} collection, made at our Jaipur workshop by skilled artisans who carry forward generations of traditional silversmithing technique.

The product specifications below show the available source details for this piece, including SKU, silver weight, gemstone fields, barcode, and category wherever they are present in the catalogue data. Founded in 2003, Surya Jewellers has been crafting fine silver jewellery from the gemstone capital of India for over two decades.`;
}

const categoryEmojis: Record<string, string> = {
  Rings: '💍',
  Necklaces: '📿',
  Earrings: '✨',
  Bracelets: '⭐',
};

const stoneColors: Record<string, string> = {
  Diamond: '#E8E8E8',
  Ruby: '#E0115F',
  Emerald: '#50C878',
  Sapphire: '#0F52BA',
};

export interface ProductData {
  _id: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  category: string;
  silverWeight: number;
  grossWeight?: number;
  mainStoneType: string;
  totalCaratWeight: number;
  diamondColorClarity: string;
  secondaryStoneType?: string;
  csWeight?: number;
  diamondWeight?: number;
  barcode?: string;
  description: string;
  inStock: boolean;
  stockQuantity: number;
  images: string[];
}

export default function ProductDetailClient({
  product,
  relatedProducts = [],
}: {
  product: ProductData;
  relatedProducts?: RelatedProduct[];
}) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [sizeError, setSizeError] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  const { addItem, items } = useCartStore();
  const currency = useCurrencyStore((s) => s.currency);
  const { sale } = useSeasonalSale();
  const toggleWishlist = useWishlistStore((s) => s.toggleItem);
  const wishlistItems = useWishlistStore((s) => s.items);
  const wished = wishlistItems.some((item) => item._id === product._id);
  const salePrice = getSalePrice(product.price, sale);

  const cartItem = items.find((i) => i._id === product._id);
  const atMaxQty = cartItem ? cartItem.quantity >= (product.stockQuantity ?? 1) : false;

  const handleAddToCart = () => {
    if (atMaxQty) return;
    if (/^rings?$/i.test(product.category) && !selectedSize) {
      setSizeError(true);
      return;
    }
    setSizeError(false);
    addItem({
      _id: product._id,
      name: product.name,
      price: product.price,
      image: product.images?.[0] || '',
      slug: product.slug,
      silverWeight: product.silverWeight,
      mainStoneType: product.mainStoneType,
      stockQuantity: product.stockQuantity ?? 1,
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const specs = [
    { label: 'SKU', value: product.sku },
    { label: 'Silver Purity', value: '92.5% Sterling Silver' },
    { label: 'Silver Weight', value: `${product.silverWeight}g` },
    ...(product.grossWeight && product.grossWeight > 0
      ? [{ label: 'Gross Weight', value: `${product.grossWeight}g` }]
      : []),
    ...(product.mainStoneType && product.mainStoneType !== 'None'
      ? [{ label: 'Main Stone', value: product.mainStoneType }]
      : []),
    ...(product.secondaryStoneType
      ? [{ label: 'Secondary Stone', value: product.secondaryStoneType }]
      : []),
    ...(product.diamondWeight && Number(product.diamondWeight) > 0
      ? [{ label: 'Diamond Weight', value: `${product.diamondWeight} ct` }]
      : []),
    ...(product.csWeight && product.csWeight > 0 && product.csWeight <= 500
      && (product.mainStoneType !== 'None' || !!product.secondaryStoneType)
      ? [{ label: 'Colored Stone Wt (ct)', value: `${product.csWeight} ct` }]
      : []),
    ...(product.diamondColorClarity
      ? [{ label: 'Color & Clarity', value: product.diamondColorClarity }]
      : []),
    { label: 'Category', value: product.category },
    ...(product.barcode ? [{ label: 'Barcode', value: product.barcode }] : []),
  ];
  const trustItems = [
    ...(product.sku ? [{ text: `SKU ${product.sku}` }] : []),
    ...(product.silverWeight > 0 ? [{ text: `${product.silverWeight}g silver weight listed` }] : []),
    ...(product.mainStoneType && product.mainStoneType !== 'None'
      ? [{ text: `${product.mainStoneType} stone details listed` }]
      : []),
    ...(product.barcode ? [{ text: `Barcode ${product.barcode}` }] : []),
  ];

  return (
    <div className="pt-8 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-charcoal-muted mb-8" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-gold transition-colors">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-gold transition-colors">Collections</Link>
          <span>/</span>
          <span className="text-charcoal">{product.name || product.category}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <AnimatedSection>
            <div className="space-y-4">
              <div className="aspect-square bg-gradient-to-br from-cream-dark to-cream rounded overflow-hidden relative border border-cream-dark shadow-inner">
                {product.images && product.images.length > 0 ? (
                  <Image
                    key={product.images[selectedImageIndex]}
                    src={product.images[selectedImageIndex]}
                    alt={`${product.mainStoneType !== 'None' ? product.mainStoneType + ' ' : ''}${product.name} in 92.5 Sterling Silver — Surya Jewellers Jaipur`}
                    fill
                    className="object-cover transition-transform duration-700 hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-8xl opacity-20">
                      {categoryEmojis[product.category] || '💎'}
                    </span>
                  </div>
                )}
                {product.mainStoneType && product.mainStoneType !== 'None' && (
                  <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-white/90 px-3 py-1.5 rounded shadow-sm">
                    <span
                      className="w-3 h-3 rounded-full border border-black/10"
                      style={{ backgroundColor: stoneColors[product.mainStoneType] || '#ccc' }}
                    />
                    <span className="text-xs text-charcoal font-medium">{product.mainStoneType}</span>
                  </div>
                )}
                {sale && product.price > 0 && (
                  <div className="absolute top-4 left-4 rounded bg-gold px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-white shadow-sm">
                    {sale.percent}% off
                  </div>
                )}
              </div>

              {product.images && product.images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                  {product.images.map((img: string, i: number) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImageIndex(i)}
                      className={`relative w-20 h-20 rounded overflow-hidden border-2 flex-shrink-0 transition-all ${
                        selectedImageIndex === i
                          ? 'border-gold ring-2 ring-gold/10'
                          : 'border-cream-dark hover:border-gold/40'
                      }`}
                    >
                      <Image
                        key={img}
                        src={img}
                        alt={`${product.name} view ${i + 1} — ${product.category} in 92.5 Sterling Silver`}
                        fill
                        className="object-cover"
                        sizes="80px"
                        unoptimized
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </AnimatedSection>

          {/* Product Details */}
          <AnimatedSection delay={0.2}>
            <div className="space-y-6">
              <span className="text-gold text-xs tracking-[0.3em] uppercase">
                {product.category}
              </span>

              <div className="flex items-start gap-4">
                <h1 className="font-serif text-3xl sm:text-4xl text-charcoal flex-1">
                  {product.name ||
                    `${product.mainStoneType !== 'None' ? product.mainStoneType + ' ' : ''}${product.category} Piece`}
                </h1>
                <button
                  type="button"
                  onClick={() =>
                    toggleWishlist({
                      _id: product._id,
                      name: product.name,
                      price: product.price,
                      image: product.images?.[0] || '',
                      slug: product.slug,
                      category: product.category,
                      mainStoneType: product.mainStoneType,
                      silverWeight: product.silverWeight,
                      stockQuantity: product.stockQuantity ?? 1,
                    })
                  }
                  aria-label={wished ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
                  className={`mt-1 rounded-full border p-3 transition-colors ${
                    wished
                      ? 'border-gold bg-gold/10 text-gold'
                      : 'border-charcoal/15 text-charcoal-muted hover:border-gold/40 hover:text-gold'
                  }`}
                >
                  <Heart className="h-5 w-5" fill={wished ? 'currentColor' : 'none'} strokeWidth={1.8} />
                </button>
              </div>

              <div className="flex items-baseline gap-3">
                {product.price ? (
                  <>
                    {salePrice ? (
                      <span className="flex items-baseline gap-3">
                        <span className="text-2xl font-semibold text-gold">
                          {formatPrice(salePrice, currency)}
                        </span>
                        <span className="text-base text-charcoal-muted line-through">
                          {formatPrice(product.price, currency)}
                        </span>
                      </span>
                    ) : (
                      <span className="text-2xl font-semibold text-charcoal">
                        {formatPrice(product.price, currency)}
                      </span>
                    )}
                    <span className="text-xs text-charcoal-muted">(Incl. of taxes)</span>
                  </>
                ) : (
                  <span className="text-2xl font-semibold text-charcoal">Contact for Price</span>
                )}
              </div>

              <div className="h-[1px] bg-gradient-to-r from-gold/40 via-gold/20 to-transparent" />

              {/* Ring Size Selector — shown for all Ring/Rings category products */}
              {/^rings?$/i.test(product.category) && (
                <div>
                  <p
                    className="mb-3"
                    style={{
                      fontFamily: 'var(--font-cinzel), serif',
                      color: '#c9a84c',
                      fontSize: '0.7rem',
                      letterSpacing: '3px',
                      textTransform: 'uppercase',
                    }}
                  >
                    Ring Size
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {[5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20].map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => { setSelectedSize(size); setSizeError(false); }}
                        style={{
                          width: '40px',
                          height: '40px',
                          fontSize: '0.8rem',
                          fontWeight: 500,
                          border: '1.5px solid #c9a84c',
                          backgroundColor: selectedSize === size ? '#c9a84c' : 'transparent',
                          color: selectedSize === size ? '#111' : '#c9a84c',
                          cursor: 'pointer',
                          transition: 'all 0.18s',
                          boxShadow: selectedSize === size ? '0 0 8px rgba(201,168,76,0.45)' : 'none',
                        }}
                        onMouseEnter={(e) => {
                          if (selectedSize !== size) {
                            e.currentTarget.style.boxShadow = '0 0 8px rgba(201,168,76,0.35)';
                            e.currentTarget.style.backgroundColor = 'rgba(201,168,76,0.12)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (selectedSize !== size) {
                            e.currentTarget.style.boxShadow = 'none';
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }
                        }}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowSizeGuide(true)}
                    className="mt-2 text-xs hover:underline transition-all"
                    style={{ color: '#a08040' }}
                  >
                    Not sure of your size? View Size Guide
                  </button>
                  {sizeError && (
                    <p className="mt-2 text-xs font-medium" style={{ color: '#c9a84c' }}>
                      ⚠ Please select a ring size to continue
                    </p>
                  )}
                </div>
              )}

              <div className="text-sm text-charcoal-muted leading-relaxed space-y-3">
                {generateDescription(product).split('\n\n').map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>

              {/* Specifications Table */}
              <div className="bg-cream rounded p-6">
                <h3 className="text-xs tracking-[0.2em] uppercase text-charcoal-muted mb-4 font-semibold">
                  Specifications
                </h3>
                <div className="space-y-3">
                  {specs.map((spec) => (
                    <div key={spec.label} className="flex items-center justify-between text-sm">
                      <span className="text-charcoal-muted">{spec.label}</span>
                      <span className="text-charcoal font-medium">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add to Cart */}
              <motion.button
                onClick={handleAddToCart}
                whileTap={atMaxQty ? {} : { scale: 0.97 }}
                disabled={atMaxQty}
                className={`w-full py-4 text-center font-semibold tracking-[0.15em] uppercase text-sm transition-all duration-300 ${
                  atMaxQty
                    ? 'bg-charcoal/10 text-charcoal/40 cursor-not-allowed'
                    : addedToCart
                    ? 'bg-green-600 text-white'
                    : 'btn-gold'
                }`}
              >
                {atMaxQty ? '✓ In Your Bag' : addedToCart ? '✓ Added to Bag' : 'Add to Bag'}
              </motion.button>
              {trustItems.length > 0 && (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  {trustItems.map((item) => (
                    <div key={item.text} className="flex items-center gap-2 text-xs text-charcoal-muted">
                      <span className="text-gold">+</span>
                      {item.text}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </AnimatedSection>
        </div>

        {/* You may also like */}
        {relatedProducts.length > 0 && (
          <section className="mt-20 pt-16 border-t border-cream-dark">
            <div className="text-center mb-10">
              <span className="text-gold text-xs tracking-[0.4em] uppercase">From Our Collection</span>
              <h2 className="font-serif text-2xl sm:text-3xl mt-3 text-charcoal">You May Also Like</h2>
              <div className="h-[1px] w-16 bg-gradient-to-r from-transparent via-gold to-transparent mx-auto mt-4" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {relatedProducts.map((rp) => (
                <Link key={rp._id} href={`/products/${rp.slug}`} className="group block">
                  <div className="aspect-square bg-gradient-to-br from-cream-dark to-cream rounded overflow-hidden relative border border-cream-dark mb-3">
                    {rp.images[0] ? (
                      <Image
                        src={rp.images[0]}
                        alt={`${rp.mainStoneType !== 'None' ? rp.mainStoneType + ' ' : ''}${rp.name} — 92.5 Sterling Silver`}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-6xl opacity-20">💎</div>
                    )}
                  </div>
                  <p className="text-xs text-charcoal-muted tracking-wide uppercase">{rp.category}</p>
                  <p className="font-serif text-charcoal text-sm mt-0.5 group-hover:text-gold transition-colors">{rp.name}</p>
                  <p className="text-sm font-medium text-charcoal mt-1">
                    {rp.price ? formatPrice(rp.price, currency) : 'Contact for Price'}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Size Guide Modal */}
      {showSizeGuide && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.65)' }}
          onClick={() => setShowSizeGuide(false)}
        >
          <div
            className="bg-white rounded-lg max-w-md w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-serif text-xl text-charcoal">Ring Size Guide</h3>
              <button
                onClick={() => setShowSizeGuide(false)}
                className="text-charcoal-muted hover:text-charcoal text-lg leading-none"
              >
                ✕
              </button>
            </div>

            <div className="mb-6">
              <h4 className="text-sm font-semibold text-charcoal mb-3">How to Measure at Home</h4>
              <ol className="text-sm text-charcoal-muted space-y-2 list-decimal list-inside leading-relaxed">
                <li>Cut a thin strip of paper or use a string.</li>
                <li>Wrap it snugly around the base of your finger.</li>
                <li>Mark where the strip meets or overlaps.</li>
                <li>Measure that length in millimetres — this is your finger circumference.</li>
                <li>Match to the table below to find your Indian ring size.</li>
              </ol>
              <p className="text-xs text-charcoal-muted mt-3 italic">
                Tip: Measure in the evening when fingers are slightly larger.
              </p>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-charcoal mb-3">Indian Size Conversion</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr style={{ background: '#f5f0e8' }}>
                      <th className="border border-cream-dark px-3 py-2 text-left text-charcoal font-semibold">Indian Size</th>
                      <th className="border border-cream-dark px-3 py-2 text-left text-charcoal font-semibold">Circumference (mm)</th>
                      <th className="border border-cream-dark px-3 py-2 text-left text-charcoal font-semibold">Diameter (mm)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {([
                      [5, 49.3, 15.7], [6, 51.9, 16.5], [7, 54.4, 17.3], [8, 57.0, 18.1],
                      [9, 59.5, 18.9], [10, 62.1, 19.8], [11, 64.6, 20.6], [12, 67.2, 21.4],
                      [13, 69.7, 22.2], [14, 72.3, 23.0], [15, 74.8, 23.8], [16, 77.4, 24.6],
                      [17, 79.9, 25.4], [18, 82.5, 26.3], [19, 85.0, 27.0], [20, 87.6, 27.9],
                    ] as [number, number, number][]).map(([indian, circ, diam]) => (
                      <tr
                        key={indian}
                        style={{
                          background: selectedSize === indian ? 'rgba(201,168,76,0.12)' : 'transparent',
                        }}
                      >
                        <td className="border border-cream-dark px-3 py-2 font-medium text-charcoal">
                          {indian}
                          {selectedSize === indian && (
                            <span className="ml-1.5 text-[0.6rem] font-normal" style={{ color: '#c9a84c' }}>← your size</span>
                          )}
                        </td>
                        <td className="border border-cream-dark px-3 py-2 text-charcoal-muted">{circ}</td>
                        <td className="border border-cream-dark px-3 py-2 text-charcoal-muted">{diam}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
