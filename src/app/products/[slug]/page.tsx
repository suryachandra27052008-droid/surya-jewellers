'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'motion/react';
import { useCartStore } from '@/stores/cart-store';
import { useCurrencyStore, formatPrice } from '@/stores/currency-store';
import AnimatedSection from '@/components/ui/AnimatedSection';

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

const buildUniqueSlug = (p: any) => {
  const stone = (p.mainStoneType && p.mainStoneType !== 'None' ? p.mainStoneType : 'silver').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const cat = (p.category || 'jewellery').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const sku = String(p.sku || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || p._id.slice(-6);
  return `${stone}-${cat}-${sku}`.replace(/-+/g, '-');
};

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [dynamicProduct, setDynamicProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const product = dynamicProduct;
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);
  const [showTryOn, setShowTryOn] = useState(false);
  const [cameraStatus, setCameraStatus] = useState<'idle' | 'loading' | 'active' | 'error'>('idle');
  const { addItem, items } = useCartStore();
  const currency = useCurrencyStore((s) => s.currency);

  // Camera / canvas refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number>(0);
  const overlayImgRef = useRef<HTMLImageElement | null>(null);

  // Overlay position / size
  const overlayPosRef = useRef({ x: 0, y: 0 });
  const overlaySizeRef = useRef(150);

  // Drag state
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ mx: 0, my: 0, ox: 0, oy: 0 });

  // Pinch state
  const pinchStartRef = useRef<{ dist: number; size: number } | null>(null);

  useEffect(() => {
    async function fetchDynamic() {
      try {
        const res = await fetch('/api/admin/products');
        if (res.ok) {
          const data = await res.json();
          const toSlug = (name: string) =>
            name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
          // Match priority: unique slug → sanity slug → name-derived
          const found = data.products.find((p: any) => buildUniqueSlug(p) === slug)
            ?? data.products.find((p: any) => p.slug === slug)
            ?? data.products.find((p: any) => toSlug(p.name) === slug);
          if (found) {
            document.title = `${found.name} | Surya Jewellers`;
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

  // Load overlay image when product loads
  useEffect(() => {
    if (!product?.images?.[0]) return;
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.src = product.images[0];
    img.onload = () => { overlayImgRef.current = img; };
  }, [product]);

  // Start / stop camera when showTryOn changes
  useEffect(() => {
    if (!showTryOn) {
      stopCamera();
      return;
    }
    startCamera();
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showTryOn]);

  const startCamera = async () => {
    setCameraStatus('loading');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraStatus('active');
    } catch {
      setCameraStatus('error');
    }
  };

  const stopCamera = () => {
    cancelAnimationFrame(animFrameRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraStatus('idle');
  };

  // Draw loop
  useEffect(() => {
    if (cameraStatus !== 'active') return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    // Init overlay position to canvas center
    const rect = canvas.getBoundingClientRect();
    overlayPosRef.current = { x: rect.width / 2 - overlaySizeRef.current / 2, y: rect.height / 2 - overlaySizeRef.current / 2 };

    const draw = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx || !video) return;
      canvas.width = video.videoWidth || canvas.clientWidth;
      canvas.height = video.videoHeight || canvas.clientHeight;

      // Draw mirrored video
      ctx.save();
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      ctx.restore();

      // Scale pos to canvas coords (canvas may differ from display size)
      const scaleX = canvas.width / canvas.clientWidth;
      const scaleY = canvas.height / canvas.clientHeight;
      const ox = overlayPosRef.current.x * scaleX;
      const oy = overlayPosRef.current.y * scaleY;
      const os = overlaySizeRef.current * Math.min(scaleX, scaleY);

      if (overlayImgRef.current) {
        ctx.drawImage(overlayImgRef.current, ox, oy, os, os);
      } else {
        // Placeholder ring emoji if image not loaded
        ctx.font = `${os * 0.8}px serif`;
        ctx.textAlign = 'left';
        ctx.fillText('💍', ox, oy + os * 0.8);
      }

      animFrameRef.current = requestAnimationFrame(draw);
    };
    animFrameRef.current = requestAnimationFrame(draw);

    return () => cancelAnimationFrame(animFrameRef.current);
  }, [cameraStatus]);

  // ── Mouse drag ──────────────────────────────────────────────────────────────
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    dragStartRef.current = {
      mx: e.clientX,
      my: e.clientY,
      ox: overlayPosRef.current.x,
      oy: overlayPosRef.current.y,
    };
  };
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) return;
    overlayPosRef.current = {
      x: dragStartRef.current.ox + (e.clientX - dragStartRef.current.mx),
      y: dragStartRef.current.oy + (e.clientY - dragStartRef.current.my),
    };
  };
  const handleMouseUp = () => { isDraggingRef.current = false; };

  // ── Touch drag + pinch ──────────────────────────────────────────────────────
  const handleTouchStart = useCallback((e: TouchEvent) => {
    e.preventDefault();
    if (e.touches.length === 1) {
      isDraggingRef.current = true;
      dragStartRef.current = {
        mx: e.touches[0].clientX,
        my: e.touches[0].clientY,
        ox: overlayPosRef.current.x,
        oy: overlayPosRef.current.y,
      };
    } else if (e.touches.length === 2) {
      isDraggingRef.current = false;
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      pinchStartRef.current = { dist: Math.hypot(dx, dy), size: overlaySizeRef.current };
    }
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    e.preventDefault();
    if (e.touches.length === 1 && isDraggingRef.current) {
      overlayPosRef.current = {
        x: dragStartRef.current.ox + (e.touches[0].clientX - dragStartRef.current.mx),
        y: dragStartRef.current.oy + (e.touches[0].clientY - dragStartRef.current.my),
      };
    } else if (e.touches.length === 2 && pinchStartRef.current) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      const newSize = Math.max(60, Math.min(400, pinchStartRef.current.size * (dist / pinchStartRef.current.dist)));
      overlaySizeRef.current = newSize;
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    isDraggingRef.current = false;
    pinchStartRef.current = null;
  }, []);

  // Attach passive:false touch listeners to canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || cameraStatus !== 'active') return;
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd);
    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  }, [cameraStatus, handleTouchStart, handleTouchMove, handleTouchEnd]);

  const savePhoto = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/jpeg', 0.92);
    const a = document.createElement('a');
    a.href = url;
    a.download = `try-on-${product?.name?.replace(/\s+/g, '-') || 'jewellery'}.jpg`;
    a.click();
  };

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

                {/* Virtual Try-On */}
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

      {/* ── Virtual Try-On Modal ─────────────────────────────────────────────── */}
      {showTryOn && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: '#000',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 20px',
              borderBottom: '1px solid #c9a84c33',
            }}
          >
            <span
              style={{ fontFamily: 'Cinzel, serif', color: '#c9a84c', fontSize: '14px', letterSpacing: '3px' }}
            >
              ✦ VIRTUAL TRY ON
            </span>
            <button
              onClick={() => setShowTryOn(false)}
              style={{ color: '#c9a84c', background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', lineHeight: 1 }}
              aria-label="Close"
            >
              ×
            </button>
          </div>

          {/* Camera / Canvas area */}
          <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
            {/* Hidden video element */}
            <video
              ref={videoRef}
              playsInline
              muted
              style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 1, height: 1 }}
            />

            {cameraStatus === 'loading' && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c9a84c', fontFamily: 'Cinzel, serif', letterSpacing: '2px', fontSize: '13px' }}>
                Opening camera…
              </div>
            )}

            {cameraStatus === 'error' && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 }}>
                <span style={{ color: '#c9a84c', fontSize: '40px' }}>📷</span>
                <p style={{ color: '#aaa', textAlign: 'center', fontSize: '14px' }}>
                  Camera access denied or unavailable.
                </p>
                <button
                  onClick={startCamera}
                  style={{ marginTop: 8, padding: '10px 24px', border: '1px solid #c9a84c', color: '#c9a84c', background: 'none', fontFamily: 'Cinzel, serif', fontSize: '12px', letterSpacing: '2px', cursor: 'pointer' }}
                >
                  RETRY
                </button>
              </div>
            )}

            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              style={{
                width: '100%',
                height: '100%',
                display: cameraStatus === 'active' ? 'block' : 'none',
                cursor: 'grab',
                touchAction: 'none',
              }}
            />
          </div>

          {/* Controls */}
          {cameraStatus === 'active' && (
            <div
              style={{
                padding: '14px 20px',
                borderTop: '1px solid #c9a84c33',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
              }}
            >
              {/* Resize buttons */}
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => { overlaySizeRef.current = Math.max(60, overlaySizeRef.current - 20); }}
                  style={{ width: 36, height: 36, border: '1px solid #c9a84c44', color: '#c9a84c', background: 'none', fontSize: '18px', cursor: 'pointer', borderRadius: 4 }}
                >
                  −
                </button>
                <button
                  onClick={() => { overlaySizeRef.current = Math.min(400, overlaySizeRef.current + 20); }}
                  style={{ width: 36, height: 36, border: '1px solid #c9a84c44', color: '#c9a84c', background: 'none', fontSize: '18px', cursor: 'pointer', borderRadius: 4 }}
                >
                  +
                </button>
              </div>

              <p style={{ color: '#666', fontSize: '11px', textAlign: 'center', flex: 1 }}>
                Drag to position · Pinch to resize
              </p>

              {/* Save Photo */}
              <button
                onClick={savePhoto}
                style={{
                  padding: '8px 18px',
                  background: '#c9a84c',
                  color: '#000',
                  border: 'none',
                  fontFamily: 'Cinzel, serif',
                  fontSize: '11px',
                  letterSpacing: '2px',
                  cursor: 'pointer',
                  borderRadius: 2,
                  whiteSpace: 'nowrap',
                }}
              >
                SAVE PHOTO
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
