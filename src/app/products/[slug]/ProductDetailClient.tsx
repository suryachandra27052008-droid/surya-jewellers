'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'motion/react';
import { useCartStore } from '@/stores/cart-store';
import { useCurrencyStore, formatPrice } from '@/stores/currency-store';
import AnimatedSection from '@/components/ui/AnimatedSection';

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

export default function ProductDetailClient({ product }: { product: ProductData }) {
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

              <p className="text-sm text-charcoal-muted leading-relaxed">
                {product.description}
              </p>

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
      </div>
    </div>
  );
}
