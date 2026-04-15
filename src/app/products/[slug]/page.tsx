'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';
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

const buildUniqueSlug = (p: any) => {
  const stone = (p.mainStoneType && p.mainStoneType !== 'None' ? p.mainStoneType : 'silver')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const cat = (p.category || 'jewellery').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const sku = String(p.sku || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || p._id.slice(-6);
  return `${stone}-${cat}-${sku}`.replace(/-+/g, '-');
};

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [dynamicProduct, setDynamicProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);
  const [showTryOn, setShowTryOn] = useState(false);
  const [tryOnUrl, setTryOnUrl] = useState('');

  const { addItem, items } = useCartStore();
  const currency = useCurrencyStore((s) => s.currency);
  const product = dynamicProduct;

  useEffect(() => {
    async function fetchDynamic() {
      try {
        const res = await fetch('/api/admin/products');
        if (res.ok) {
          const data = await res.json();
          const toSlug = (name: string) =>
            name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
          const found =
            data.products.find((p: any) => buildUniqueSlug(p) === slug) ??
            data.products.find((p: any) => p.slug === slug) ??
            data.products.find((p: any) => toSlug(p.name) === slug);
          if (found) {
            document.title = `${found.name || found.category || 'Product'} | Surya Jewellers`;
            setDynamicProduct({
              _id: found._id,
              name: found.name,
              slug: buildUniqueSlug(found),
              sku: found.sku,
              price: found.price,
              category: found.category || 'Rings',
              silverWeight: found.silverWeight || 0,
              mainStoneType: found.mainStoneType || 'None',
              totalCaratWeight: found.totalCaratWeight || 0,
              diamondColorClarity: found.diamondColorClarity || '',
              description: found.description || '',
              inStock: found.inStock,
              stockQuantity: found.stockQuantity ?? 1,
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

  // Build try-on URL once product + sku are known
  useEffect(() => {
    if (product?.sku) {
      setTryOnUrl(`${window.location.origin}/try-on/${encodeURIComponent(product.sku)}`);
    }
  }, [product]);

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

  const cartItem = items.find((i) => i._id === product._id);
  const atMaxQty = cartItem ? cartItem.quantity >= (product.stockQuantity ?? 1) : false;
  const isRing = product.category?.toLowerCase().includes('ring');

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
    <>
      <div className="pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-charcoal-muted mb-8">
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
                      alt={product.name || product.category}
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
                          alt={`${product.name || product.category} preview ${i + 1}`}
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

                {/* Virtual Try-On — rings only */}
                {isRing && (
                  <button
                    onClick={() => setShowTryOn(true)}
                    style={{
                      width: '100%',
                      padding: '16px',
                      marginTop: '12px',
                      background: 'transparent',
                      border: '1px solid #c9a84c',
                      color: '#c9a84c',
                      fontFamily: 'Cinzel, serif',
                      fontSize: '14px',
                      letterSpacing: '2px',
                      cursor: 'pointer',
                    }}
                  >
                    ✦ VIRTUAL TRY ON
                  </button>
                )}

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

      {/* ── QR Code Try-On Modal ─────────────────────────────────────────── */}
      {showTryOn && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setShowTryOn(false)}
        >
          <div
            className="max-w-sm w-full rounded-lg p-8 text-center"
            style={{ background: '#0a0a0a', border: '1px solid #c9a84c44' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div />
              <span
                style={{
                  fontFamily: 'Cinzel, serif',
                  color: '#c9a84c',
                  fontSize: '13px',
                  letterSpacing: '3px',
                }}
              >
                ✦ VIRTUAL TRY ON
              </span>
              <button
                onClick={() => setShowTryOn(false)}
                style={{ color: '#c9a84c', background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}
              >
                ×
              </button>
            </div>

            <p style={{ color: '#ffffff99', fontSize: '13px', marginBottom: '8px' }}>
              Scan with your phone to try on
            </p>
            <p
              style={{
                color: '#fff',
                fontFamily: 'Cormorant Garamond, Georgia, serif',
                fontSize: '18px',
                fontStyle: 'italic',
                marginBottom: '24px',
              }}
            >
              {product.name}
            </p>

            {/* Gold divider */}
            <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, #c9a84c66, transparent)', marginBottom: '24px' }} />

            {/* QR Code */}
            <div
              style={{
                display: 'inline-flex',
                padding: '16px',
                background: '#fff',
                borderRadius: '8px',
                marginBottom: '16px',
              }}
            >
              {tryOnUrl ? (
                <QRCodeSVG
                  value={tryOnUrl}
                  size={200}
                  fgColor="#0a0a0a"
                  bgColor="#ffffff"
                  level="M"
                />
              ) : (
                <div style={{ width: 200, height: 200, background: '#f5f5f5' }} />
              )}
            </div>

            {/* Gold divider */}
            <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, #c9a84c66, transparent)', marginBottom: '16px' }} />

            <p style={{ color: '#c9a84c66', fontSize: '11px', marginBottom: '12px', wordBreak: 'break-all' }}>
              {tryOnUrl}
            </p>

            <a
              href={tryOnUrl}
              style={{ color: '#c9a84c', fontSize: '13px', textDecoration: 'none', letterSpacing: '1px' }}
            >
              Open on this device →
            </a>
          </div>
        </div>
      )}
    </>
  );
}
