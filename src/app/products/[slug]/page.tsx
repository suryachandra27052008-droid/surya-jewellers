'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'motion/react';
import { useCartStore } from '@/stores/cart-store';
import { useCurrencyStore, formatPrice } from '@/stores/currency-store';
import AnimatedSection from '@/components/ui/AnimatedSection';

// Same demo data - in production this would come from Sanity


// Category emoji map
const categoryEmojis: Record<string, string> = {
  Rings: '💍',
  Necklaces: '📿',
  Earrings: '✨',
  Bracelets: '⭐',
};

// Stone color map
const stoneColors: Record<string, string> = {
  Diamond: '#E8E8E8',
  Ruby: '#E0115F',
  Emerald: '#50C878',
  Sapphire: '#0F52BA',
};

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [dynamicProduct, setDynamicProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const product = dynamicProduct;
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const currency = useCurrencyStore((s) => s.currency);

  useEffect(() => {
    async function fetchDynamic() {
      try {
        const res = await fetch('/api/admin/products');
        if (res.ok) {
          const data = await res.json();
          const found = data.products.find((p: any) => 
            p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === slug
          );
          if (found) {
            setDynamicProduct({
              _id: found._id,
              name: found.name,
              slug: slug,
              sku: found.sku,
              price: found.price,
              category: found.category || 'Rings',
              silverWeight: found.silverWeight || 0,
              mainStoneType: found.mainStoneType || 'None',
              totalCaratWeight: found.totalCaratWeight || 0,
              diamondColorClarity: found.diamondColorClarity || '',
              description: found.description || '',
              inStock: found.inStock,
              images: found.images || [],
            });
          }
        }
      } catch (err) {
        console.error('Failed to fetch dynamic product', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchDynamic();
  }, [slug]);

  if (isLoading) {
    return <div className="pt-32 pb-16 text-center text-charcoal-muted">Loading piece...</div>;
  }

  if (!product) {
    return (
      <div className="pt-32 pb-16 text-center">
        <h1 className="font-serif text-3xl text-charcoal mb-4">Product Not Found</h1>
        <p className="text-charcoal-muted mb-8">The piece you are looking for does not exist.</p>
        <Link href="/products" className="btn-gold">
          Back to Collections
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    addItem({
      _id: product._id,
      name: product.name,
      price: product.price,
      image: product.images?.[0] || '',
      slug: product.slug,
      silverWeight: product.silverWeight,
      mainStoneType: product.mainStoneType,
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
        <nav className="flex items-center gap-2 text-xs text-charcoal-muted mb-8">
          <Link href="/" className="hover:text-gold transition-colors">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-gold transition-colors">Collections</Link>
          <span>/</span>
          <span className="text-charcoal">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <AnimatedSection>
            <div className="space-y-4">
              {/* Main Image */}
              <div className="aspect-square bg-gradient-to-br from-cream-dark to-cream rounded overflow-hidden relative border border-cream-dark shadow-inner">
                {product.images && product.images.length > 0 ? (
                  <Image
                    src={product.images[selectedImageIndex]}
                    alt={product.name}
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
                {/* Stone color indicator */}
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

              {/* Thumbnail strip */}
              {product.images && product.images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                  {product.images.map((img: string, i: number) => (
                    <button
                        key={i}
                        onClick={() => setSelectedImageIndex(i)}
                        className={`relative w-20 h-20 rounded overflow-hidden border-2 flex-shrink-0 transition-all ${
                        selectedImageIndex === i ? 'border-gold ring-2 ring-gold/10' : 'border-cream-dark hover:border-gold/40'
                        }`}
                    >
                        <Image
                            src={img}
                            alt={`${product.name} preview ${i + 1}`}
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
              {/* Category */}
              <span className="text-gold text-xs tracking-[0.3em] uppercase">
                {product.category}
              </span>

              {/* Name */}
              <h1 className="font-serif text-3xl sm:text-4xl text-charcoal">
                {product.name}
              </h1>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-semibold text-charcoal">
                  {formatPrice(product.price, currency)}
                </span>
                <span className="text-xs text-charcoal-muted">(Incl. of taxes)</span>
              </div>

              {/* Gold divider */}
              <div className="h-[1px] bg-gradient-to-r from-gold/40 via-gold/20 to-transparent" />

              {/* Description */}
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
                whileTap={{ scale: 0.97 }}
                className={`w-full py-4 text-center font-semibold tracking-[0.15em] uppercase text-sm transition-all duration-300 ${
                  addedToCart
                    ? 'bg-green-600 text-white'
                    : 'btn-gold'
                }`}
              >
                {addedToCart ? '✓ Added to Bag' : 'Add to Bag'}
              </motion.button>

              {/* Trust indicators */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                {[
                  { icon: '🛡️', text: 'BIS Hallmarked Silver' },
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
