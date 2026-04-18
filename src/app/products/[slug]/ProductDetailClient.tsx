'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'motion/react';
import { useCartStore } from '@/stores/cart-store';
import { useCurrencyStore, formatPrice } from '@/stores/currency-store';
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
    ? `, set with a natural certified ${stone.toLowerCase()} gemstone${caratText}${clarityText}`
    : '';
  const weightText = product.silverWeight > 0 ? ` Weighing ${product.silverWeight}g` : '';
  return `This ${product.name} is handcrafted in hallmarked 92.5 sterling silver${stonePhrase}.${weightText ? ' ' + weightText + ', it' : ' It'} is part of our ${product.category} collection, made at our Jaipur workshop by skilled artisans who carry forward generations of traditional silversmithing technique.

The natural gemstone${stone ? 's are' : 's are'} ethically sourced and their type and carat weight are documented in the Certificate of Authenticity that accompanies every Surya Jewellers piece. You receive a piece of jewellery that is not only beautiful but also fully verified — 92.5 sterling silver purity, natural stone origin, and exact weight, all in writing.

Whether worn daily or kept for special occasions, this ${product.category.toLowerCase().replace(/s$/, '')} is built to last. Surya Jewellers provides complimentary lifetime maintenance: bring your piece to our Jaipur showroom anytime for professional cleaning and polishing, free of charge. Founded in 2003, Surya Jewellers has been crafting fine silver jewellery from the gemstone capital of India for over two decades.`;
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
  mainStoneType: string;
  totalCaratWeight: number;
  diamondColorClarity: string;
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

  const { addItem, items } = useCartStore();
  const currency = useCurrencyStore((s) => s.currency);

  const cartItem = items.find((i) => i._id === product._id);
  const atMaxQty = cartItem ? cartItem.quantity >= (product.stockQuantity ?? 1) : false;

  const handleAddToCart = () => {
    if (atMaxQty) return;
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
    { label: 'Main Stone', value: product.mainStoneType },
    { label: 'Total Carat Weight', value: `${product.totalCaratWeight} ct` },
    ...(product.diamondColorClarity
      ? [{ label: 'Color & Clarity', value: product.diamondColorClarity }]
      : []),
    { label: 'Category', value: product.category },
  ];

  return (
    <div className="pt-28 pb-20">
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
                    src={product.images[selectedImageIndex]}
                    alt={`${product.mainStoneType !== 'None' ? product.mainStoneType + ' ' : ''}${product.name} in 92.5 Sterling Silver — Surya Jewellers Jaipur`}
                    fill
                    className="object-cover transition-transform duration-700 hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
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
                        src={img}
                        alt={`${product.name} view ${i + 1} — ${product.category} in 92.5 Sterling Silver`}
                        fill
                        className="object-cover"
                        sizes="80px"
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

              <h1 className="font-serif text-3xl sm:text-4xl text-charcoal">
                {product.name ||
                  `${product.mainStoneType !== 'None' ? product.mainStoneType + ' ' : ''}${product.category} Piece`}
              </h1>

              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-semibold text-charcoal">
                  {formatPrice(product.price, currency)}
                </span>
                <span className="text-xs text-charcoal-muted">(Incl. of taxes)</span>
              </div>

              <div className="h-[1px] bg-gradient-to-r from-gold/40 via-gold/20 to-transparent" />

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

              {/* Trust indicators */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                {[
                  { icon: '🛡️', text: 'Certificate of Authenticity' },
                  { icon: '📜', text: 'Certificate Included' },
                  { icon: '🔄', text: 'Easy Returns' },
                  { icon: '💎', text: 'Natural Stones' },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-2 text-xs text-charcoal-muted">
                    <span>{item.icon}</span>
                    {item.text}
                  </div>
                ))}
              </div>
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
                    {formatPrice(rp.price, currency)}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
