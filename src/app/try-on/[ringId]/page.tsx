'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

type Stage = 'loading' | 'ready' | 'analyzing' | 'result' | 'error';

// ── Helpers ────────────────────────────────────────────────────────────────

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function fetchImageAsBase64(url: string): Promise<{ base64: string; mimeType: string }> {
  const res = await fetch(url);
  const blob = await res.blob();
  const mimeType = blob.type || 'image/jpeg';
  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      resolve(dataUrl.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
  return { base64, mimeType };
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): number {
  const paragraphs = text.split('\n');
  let currentY = y;
  for (const para of paragraphs) {
    const words = para.trim().split(' ');
    let line = '';
    for (const word of words) {
      const test = line + (line ? ' ' : '') + word;
      if (ctx.measureText(test).width > maxWidth && line) {
        ctx.fillText(line, x, currentY);
        line = word;
        currentY += lineHeight;
      } else {
        line = test;
      }
    }
    if (line) {
      ctx.fillText(line, x, currentY);
      currentY += lineHeight;
    }
    currentY += lineHeight * 0.3; // paragraph spacing
  }
  return currentY;
}

// ── Component ──────────────────────────────────────────────────────────────

export default function GeminiTryOnPage() {
  const params = useParams();
  const sku = decodeURIComponent(params.ringId as string);

  const [stage, setStage] = useState<Stage>('loading');
  const [product, setProduct] = useState<any>(null);
  const [handPhotoUrl, setHandPhotoUrl] = useState('');
  const [aiText, setAiText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  // Keep hand + ring data for save-card use
  const handBase64Ref = useRef('');
  const handMimeRef = useRef('image/jpeg');

  // ── Fetch product by SKU ───────────────────────────────────────────────
  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch('/api/admin/products');
        if (!res.ok) throw new Error('fetch failed');
        const { products } = await res.json();
        const found = products.find((p: any) => p.sku === sku);
        if (found) {
          setProduct(found);
          setStage('ready');
        } else {
          setErrorMsg('Ring not found. Please scan the QR code again.');
          setStage('error');
        }
      } catch {
        setErrorMsg('Could not load ring details. Please check your connection.');
        setStage('error');
      }
    }
    fetchProduct();
  }, [sku]);

  // ── File input change ──────────────────────────────────────────────────
  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Reset so the same file can be selected again
    e.target.value = '';

    const mime = file.type || 'image/jpeg';
    handMimeRef.current = mime;

    const dataUrl = await readFileAsDataURL(file);
    setHandPhotoUrl(dataUrl);
    handBase64Ref.current = dataUrl.split(',')[1];

    await runGemini(handBase64Ref.current, mime);
  };

  // ── Gemini API call ────────────────────────────────────────────────────
  const runGemini = async (handB64: string, handMimeType: string) => {
    setStage('analyzing');
    setAiText('');

    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey || apiKey === 'your_gemini_api_key_here') {
        throw new Error('Gemini API key not configured. Add NEXT_PUBLIC_GEMINI_API_KEY to your environment variables.');
      }

      // Strip data URL prefix if present
      const handPhotoBase64 = handB64.includes(',') ? handB64.split(',')[1] : handB64;

      // Fetch ring image as base64
      let ringImageBase64 = '';
      const ringImageUrl = product?.images?.[0];
      if (ringImageUrl) {
        try {
          const { base64 } = await fetchImageAsBase64(ringImageUrl);
          ringImageBase64 = base64;
        } catch {
          // Continue without ring image if cross-origin fetch fails
        }
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `You are a luxury jewelry consultant for Surya Jewellers.
              A customer is trying on a ring virtually.
              Look at their hand photo and the ring image.
              Describe in 3 elegant sentences how this ring would look on their hand —
              which finger suits it best, how the gemstone catches light,
              how it complements their hand. Make it sound luxurious.`
                  },
                  {
                    inline_data: {
                      mime_type: "image/jpeg",
                      data: handPhotoBase64
                    }
                  },
                  ...(ringImageBase64 ? [{
                    inline_data: {
                      mime_type: "image/jpeg",
                      data: ringImageBase64
                    }
                  }] : [])
                ]
              }
            ]
          })
        }
      );

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData?.error?.message || `Gemini API error (${response.status})`);
      }

      const data = await response.json();
      const description = data.candidates[0].content.parts[0].text;
      if (!description) throw new Error('No response received from Gemini. Please try again.');

      setAiText(description);
      setStage('result');
    } catch (err: any) {
      setErrorMsg(err.message || 'Analysis failed. Please try again.');
      setStage('error');
    }
  };

  // ── Save result card as image ──────────────────────────────────────────
  const saveCard = async () => {
    const W = 800;
    const PADDING = 40;
    const PHOTO_H = 360;
    const TEXT_START = PHOTO_H + 120;

    const canvas = document.createElement('canvas');
    canvas.width = W;
    // Height calculated after text wrap, set later
    const ctxTemp = canvas.getContext('2d')!;
    ctxTemp.font = 'italic 16px Georgia, serif';
    let textLines = 0;
    const words = aiText.split(' ');
    let line = '';
    for (const word of words) {
      const test = line + (line ? ' ' : '') + word;
      if (ctxTemp.measureText(test).width > W - PADDING * 2 && line) {
        textLines++;
        line = word;
      } else {
        line = test;
      }
    }
    if (line) textLines++;
    const H = TEXT_START + textLines * 28 + 100;
    canvas.height = H;

    const ctx = canvas.getContext('2d')!;

    // Background
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, W, H);

    // Top gold border
    ctx.strokeStyle = '#c9a84c';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(PADDING, 24); ctx.lineTo(W - PADDING, 24); ctx.stroke();

    // Title
    ctx.fillStyle = '#c9a84c';
    ctx.font = '14px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.letterSpacing = '3px';
    ctx.fillText('✦  VIRTUAL TRY ON  —  SURYA JEWELLERS  ✦', W / 2, 50);

    // Photos: hand on left, ring on right
    const PHOTO_W = (W - PADDING * 3) / 2;
    const PHOTO_Y = 70;

    if (handPhotoUrl) {
      try {
        const handImg = await loadImage(handPhotoUrl);
        ctx.drawImage(handImg, PADDING, PHOTO_Y, PHOTO_W, PHOTO_H);
      } catch { /* skip */ }
    }

    if (product?.images?.[0]) {
      try {
        const ringImg = await loadImage(product.images[0]);
        ctx.drawImage(ringImg, PADDING * 2 + PHOTO_W, PHOTO_Y, PHOTO_W, PHOTO_H);
      } catch { /* skip */ }
    }

    // Ring name below photos
    ctx.fillStyle = '#c9a84c';
    ctx.font = 'bold 14px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText(product?.name || 'Surya Jewellers Ring', W / 2, PHOTO_Y + PHOTO_H + 30);

    // Gold divider
    ctx.strokeStyle = '#c9a84c55';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(PADDING, PHOTO_Y + PHOTO_H + 50); ctx.lineTo(W - PADDING, PHOTO_Y + PHOTO_H + 50); ctx.stroke();

    // AI description
    ctx.fillStyle = '#f0ece3';
    ctx.font = 'italic 16px Georgia, serif';
    ctx.textAlign = 'left';
    wrapText(ctx, aiText, PADDING, TEXT_START, W - PADDING * 2, 28);

    // Bottom gold border
    ctx.strokeStyle = '#c9a84c';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(PADDING, H - 24); ctx.lineTo(W - PADDING, H - 24); ctx.stroke();

    // Download
    const a = document.createElement('a');
    a.download = `surya-jewellers-try-on-${product?.name?.replace(/\s+/g, '-') || 'ring'}.jpg`;
    a.href = canvas.toDataURL('image/jpeg', 0.93);
    a.click();
  };

  // ── Render helpers ─────────────────────────────────────────────────────

  const goldBtn = {
    padding: '16px 32px',
    background: '#c9a84c',
    color: '#000',
    border: 'none',
    fontFamily: 'Cinzel, serif',
    fontSize: '13px',
    letterSpacing: '2px',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
  } as const;

  const outlineBtn = {
    padding: '12px 24px',
    background: 'transparent',
    color: '#c9a84c',
    border: '1px solid #c9a84c',
    fontFamily: 'Cinzel, serif',
    fontSize: '12px',
    letterSpacing: '2px',
    cursor: 'pointer',
  } as const;

  // ── Main render ────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', flexDirection: 'column', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #c9a84c22' }}>
        <Link href="/products" style={{ color: '#c9a84c', textDecoration: 'none', fontSize: '13px', letterSpacing: '1px', fontFamily: 'Cinzel, serif' }}>
          ← Back
        </Link>
        <span style={{ color: '#c9a84c', fontFamily: 'Cinzel, serif', fontSize: '12px', letterSpacing: '3px' }}>
          SURYA JEWELLERS
        </span>
        <div style={{ width: 60 }} />
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 20px', gap: '32px' }}>

        {/* ── LOADING ── */}
        {stage === 'loading' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 40, height: 40, border: '2px solid #c9a84c33', borderTop: '2px solid #c9a84c', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
            <p style={{ color: '#c9a84c99', fontFamily: 'Cinzel, serif', fontSize: '13px', letterSpacing: '2px' }}>
              Loading ring...
            </p>
          </div>
        )}

        {/* ── ERROR ── */}
        {stage === 'error' && (
          <div style={{ textAlign: 'center', maxWidth: 360 }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>💍</div>
            <p style={{ color: '#ef4444', fontSize: '14px', marginBottom: '24px', lineHeight: 1.6 }}>{errorMsg}</p>
            <button
              onClick={() => { setStage('ready'); setErrorMsg(''); }}
              style={outlineBtn}
            >
              TRY AGAIN
            </button>
          </div>
        )}

        {/* ── READY ── */}
        {stage === 'ready' && product && (
          <div style={{ width: '100%', maxWidth: 480, textAlign: 'center' }}>
            {/* Ring image */}
            {product.images?.[0] && (
              <div style={{ width: 200, height: 200, margin: '0 auto 24px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #c9a84c33' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={product.images[0]}
                  alt={product.name || 'Ring'}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            )}

            {/* Gold divider */}
            <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, #c9a84c66, transparent)', margin: '0 auto 20px', maxWidth: 300 }} />

            <p style={{ color: '#c9a84c', fontFamily: 'Cinzel, serif', fontSize: '11px', letterSpacing: '3px', marginBottom: '8px' }}>
              {product.category?.toUpperCase() || 'RING'}
            </p>
            <h1 style={{ color: '#fff', fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '24px', fontWeight: 400, marginBottom: '8px' }}>
              {product.name || 'Surya Jewellers Ring'}
            </h1>
            <p style={{ color: '#ffffff55', fontSize: '13px', marginBottom: '32px' }}>
              {product.mainStoneType && product.mainStoneType !== 'None' ? product.mainStoneType + ' · ' : ''}
              Sterling Silver
            </p>

            {/* Gold divider */}
            <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, #c9a84c66, transparent)', margin: '0 auto 32px', maxWidth: 300 }} />

            <p style={{ color: '#ffffff88', fontSize: '14px', lineHeight: 1.7, marginBottom: '32px' }}>
              Take a photo of your hand and our AI stylist will describe how this ring would look on you.
            </p>

            <button style={goldBtn} onClick={() => fileInputRef.current?.click()}>
              📸 Take Photo of Your Hand
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              style={{ display: 'none' }}
              onChange={onFileChange}
            />
          </div>
        )}

        {/* ── ANALYZING ── */}
        {stage === 'analyzing' && (
          <div style={{ textAlign: 'center', maxWidth: 360 }}>
            {/* Hand photo preview */}
            {handPhotoUrl && (
              <div style={{ width: 200, height: 200, margin: '0 auto 24px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #c9a84c33' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={handPhotoUrl} alt="Your hand" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ width: 20, height: 20, border: '2px solid #c9a84c33', borderTop: '2px solid #c9a84c', borderRadius: '50%', animation: 'spin 1s linear infinite', flexShrink: 0 }} />
              <p style={{ color: '#c9a84c', fontFamily: 'Cinzel, serif', fontSize: '13px', letterSpacing: '2px' }}>
                ✦ Styling your ring...
              </p>
            </div>
            <p style={{ color: '#ffffff44', fontSize: '12px' }}>
              Our AI stylist is analyzing your hand
            </p>
          </div>
        )}

        {/* ── RESULT ── */}
        {stage === 'result' && (
          <div style={{ width: '100%', maxWidth: 520, textAlign: 'center' }}>
            {/* Photos side by side */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
              {handPhotoUrl && (
                <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid #c9a84c33', aspectRatio: '1' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={handPhotoUrl} alt="Your hand" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
              {product?.images?.[0] && (
                <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid #c9a84c33', aspectRatio: '1' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={product.images[0]} alt={product.name || 'Ring'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
            </div>

            {/* Top gold divider */}
            <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, #c9a84c, transparent)', marginBottom: '20px' }} />

            {/* Ring name */}
            <p style={{ color: '#c9a84c', fontFamily: 'Cinzel, serif', fontSize: '11px', letterSpacing: '3px', marginBottom: '6px' }}>
              {product?.category?.toUpperCase() || 'RING'}
            </p>
            <h2 style={{ color: '#fff', fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '20px', fontWeight: 400, marginBottom: '16px' }}>
              {product?.name}
            </h2>

            {/* AI Description */}
            <p style={{
              color: '#f0ece3',
              fontFamily: 'Cormorant Garamond, Georgia, serif',
              fontSize: '17px',
              fontStyle: 'italic',
              lineHeight: 1.8,
              textAlign: 'left',
              padding: '20px 0',
            }}>
              {aiText}
            </p>

            {/* Bottom gold divider */}
            <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, #c9a84c, transparent)', marginBottom: '24px' }} />

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button style={goldBtn} onClick={saveCard}>
                📸 Save
              </button>
              <button
                style={outlineBtn}
                onClick={() => {
                  setStage('ready');
                  setHandPhotoUrl('');
                  setAiText('');
                  handBase64Ref.current = '';
                }}
              >
                ↺ Try Again
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Spin keyframe */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
