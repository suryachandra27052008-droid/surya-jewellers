'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

type State = 'start' | 'processing' | 'result';

export default function TryOnPage() {
  const params = useParams();
  const sku = decodeURIComponent(params.ringId as string);

  const [uiState, setUiState]       = useState<State>('start');
  const [product, setProduct]       = useState<any>(null);
  const [resultUrl, setResultUrl]   = useState('');
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef    = useRef<HTMLCanvasElement>(null);

  /* ── fetch product ── */
  useEffect(() => {
    fetch('/api/admin/products')
      .then(r => r.json())
      .then(({ products }) => {
        const found = products.find((p: any) => p.sku === sku);
        if (found) setProduct(found);
      })
      .catch(() => {});
  }, [sku]);

  /* ── open camera ── */
  const openCamera = () => fileInputRef.current?.click();

  /* ── composite images on canvas ── */
  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setUiState('processing');

    try {
      const handUrl = URL.createObjectURL(file);
      const ringUrl = product?.images?.[0] || '';

      const [handImg, ringImg] = await Promise.all([
        loadImg(handUrl),
        ringUrl ? loadImg(ringUrl) : Promise.resolve(null),
      ]);

      const canvas = canvasRef.current!;
      const W = handImg.naturalWidth  || handImg.width;
      const H = handImg.naturalHeight || handImg.height;
      canvas.width  = W;
      canvas.height = H;

      const ctx = canvas.getContext('2d')!;

      /* 1. hand photo */
      ctx.drawImage(handImg, 0, 0, W, H);
      URL.revokeObjectURL(handUrl);

      /* 2. ring overlay — 30% wide, centred, bottom quarter */
      if (ringImg) {
        const rW = W * 0.30;
        const rH = rW * (ringImg.naturalHeight / ringImg.naturalWidth);
        const rX = (W - rW) / 2;
        const rY = H - rH - H * 0.08;   // sits near the bottom

        ctx.globalAlpha = 0.92;
        ctx.drawImage(ringImg, rX, rY, rW, rH);
        ctx.globalAlpha = 1.0;
      }

      canvas.toBlob(
        blob => {
          if (!blob) { setUiState('start'); return; }
          setResultBlob(blob);
          setResultUrl(URL.createObjectURL(blob));
          setUiState('result');
        },
        'image/jpeg',
        0.92,
      );
    } catch {
      setUiState('start');
    }
  };

  /* ── save photo ── */
  const savePhoto = () => {
    if (!resultBlob) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(resultBlob);
    a.download = `surya-jewellers-tryon-${sku}.jpg`;
    a.click();
  };

  /* ── try again ── */
  const tryAgain = () => {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setResultUrl('');
    setResultBlob(null);
    setUiState('start');
  };

  /* ── styles ── */
  const gold  = '#c9a84c';
  const wrap: React.CSSProperties = {
    position: 'fixed', inset: 0,
    background: '#0a0a0a',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    padding: '24px 20px', gap: '20px',
    fontFamily: 'system-ui, sans-serif',
    overflowY: 'auto',
  };
  const goldBtn: React.CSSProperties = {
    padding: '16px 32px',
    background: gold, color: '#000',
    border: 'none', borderRadius: '2px',
    fontFamily: 'Cinzel, serif', fontSize: '14px',
    letterSpacing: '2px', cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', gap: '10px',
  };
  const outlineBtn: React.CSSProperties = {
    padding: '14px 28px',
    background: 'transparent', color: gold,
    border: `1px solid ${gold}`, borderRadius: '2px',
    fontFamily: 'Cinzel, serif', fontSize: '13px',
    letterSpacing: '2px', cursor: 'pointer',
  };

  /* ─────────────────────────────────────────── */
  return (
    <>
      {/* hidden canvas for compositing */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
        onChange={onFileChange}
      />

      {/* ── STATE 1 — START ── */}
      {uiState === 'start' && (
        <div style={wrap}>
          <Link href="/products" style={{
            position: 'absolute', top: 16, left: 16,
            color: gold, textDecoration: 'none',
            fontFamily: 'Cinzel, serif', fontSize: '12px', letterSpacing: '1px',
          }}>
            ← Back
          </Link>

          {/* ring preview */}
          {product?.images?.[0] && (
            <div style={{
              width: 160, height: 160, borderRadius: '8px',
              overflow: 'hidden', border: `1px solid ${gold}44`,
              flexShrink: 0,
            }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={product.images[0]}
                alt={product.name || 'Ring'}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          )}

          <div style={{ height: 1, width: 200, background: `linear-gradient(90deg,transparent,${gold}66,transparent)` }} />

          <p style={{ color: gold, fontFamily: 'Cinzel, serif', fontSize: '13px', letterSpacing: '3px' }}>
            ✦ VIRTUAL TRY ON
          </p>

          {product?.name && (
            <h1 style={{
              color: '#fff', fontFamily: 'Cormorant Garamond, Georgia, serif',
              fontSize: '22px', fontWeight: 400, textAlign: 'center', margin: 0,
            }}>
              {product.name}
            </h1>
          )}

          <p style={{ color: '#ffffff66', fontSize: '14px', textAlign: 'center', lineHeight: 1.6, margin: 0 }}>
            See how this ring looks on your hand
          </p>

          <button style={goldBtn} onClick={openCamera}>
            📸 Take Photo of Your Hand
          </button>

          <p style={{ color: '#ffffff33', fontSize: '11px', letterSpacing: '1px', textAlign: 'center' }}>
            Tip: For best results, lay your hand flat on a surface
          </p>
        </div>
      )}

      {/* ── STATE 2 — PROCESSING ── */}
      {uiState === 'processing' && (
        <div style={wrap}>
          <div style={{
            width: 44, height: 44,
            border: `2px solid ${gold}33`,
            borderTop: `2px solid ${gold}`,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }} />
          <p style={{ color: gold, fontFamily: 'Cinzel, serif', fontSize: '13px', letterSpacing: '3px' }}>
            ✦ Placing your ring...
          </p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* ── STATE 3 — RESULT ── */}
      {uiState === 'result' && resultUrl && (
        <div style={{ ...wrap, justifyContent: 'flex-start', paddingTop: 40 }}>
          <Link href="/products" style={{
            position: 'absolute', top: 16, left: 16,
            color: gold, textDecoration: 'none',
            fontFamily: 'Cinzel, serif', fontSize: '12px', letterSpacing: '1px',
          }}>
            ← Back
          </Link>

          <p style={{ color: gold, fontFamily: 'Cinzel, serif', fontSize: '12px', letterSpacing: '3px' }}>
            ✦ YOUR LOOK
          </p>

          {/* composite result image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={resultUrl}
            alt="Try-on result"
            style={{
              width: '100%', maxWidth: 480,
              borderRadius: '4px', border: `1px solid ${gold}33`,
            }}
          />

          <p style={{ color: '#ffffff44', fontSize: '11px', textAlign: 'center', letterSpacing: '1px' }}>
            Tip: For best results, take photo with hand flat on a surface
          </p>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button style={goldBtn} onClick={savePhoto}>
              💾 Save Photo
            </button>
            <button style={outlineBtn} onClick={tryAgain}>
              ↺ Try Again
            </button>
          </div>
        </div>
      )}
    </>
  );
}

/* ── helper ── */
function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload  = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
