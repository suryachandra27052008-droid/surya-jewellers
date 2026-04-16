'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const BYLO_URL = 'https://bylo.ai/features/jewelry-ai-filter';

const gold = '#c9a84c';

const styles = {
  wrap: {
    minHeight: '100vh',
    background: '#0a0a0a',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    padding: '32px 20px 48px',
    gap: '0',
    fontFamily: 'system-ui, sans-serif',
  },
  goldText: {
    color: gold,
    fontFamily: 'Cinzel, serif',
    letterSpacing: '3px',
    fontSize: '12px',
  },
  divider: {
    height: 1,
    width: '100%',
    maxWidth: 480,
    background: `linear-gradient(90deg,transparent,${gold}55,transparent)`,
    margin: '24px 0',
  },
  goldBtn: {
    padding: '16px 32px',
    background: gold,
    color: '#000',
    border: 'none',
    borderRadius: '2px',
    fontFamily: 'Cinzel, serif',
    fontSize: '13px',
    letterSpacing: '2px',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    textDecoration: 'none',
  } as React.CSSProperties,
  outlineBtn: {
    padding: '14px 28px',
    background: 'transparent',
    color: gold,
    border: `1px solid ${gold}`,
    borderRadius: '2px',
    fontFamily: 'Cinzel, serif',
    fontSize: '13px',
    letterSpacing: '2px',
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
  } as React.CSSProperties,
};

export default function TryOnPage() {
  const params = useParams();
  const sku = decodeURIComponent(params.ringId as string);

  const [product, setProduct] = useState<any>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetch('/api/admin/products')
      .then(r => r.json())
      .then(({ products }) => {
        const found = products.find((p: any) => p.sku === sku);
        if (found) setProduct(found);
      })
      .catch(() => {});
  }, [sku]);

  const ringImageUrl: string = product?.images?.[0] || '';

  const downloadRingImage = async () => {
    if (!ringImageUrl) return;
    setDownloading(true);
    try {
      const res = await fetch(ringImageUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `surya-jewellers-ring-${sku}.jpg`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // fallback: open in new tab
      window.open(ringImageUrl, '_blank');
    } finally {
      setDownloading(false);
    }
  };

  const steps = [
    { num: '1', text: 'Download the ring image using the button below' },
    { num: '2', text: 'Click "Open Bylo.ai Try-On" to go to the AI filter page' },
    { num: '3', text: 'Upload a photo of your hand' },
    { num: '4', text: 'Upload the ring image you just downloaded' },
    { num: '5', text: 'Click Generate and see the magic!' },
  ];

  return (
    <div style={styles.wrap}>
      {/* Back link */}
      <div style={{ width: '100%', maxWidth: 480, marginBottom: 32 }}>
        <Link
          href="/products"
          style={{ color: gold, textDecoration: 'none', fontFamily: 'Cinzel, serif', fontSize: '12px', letterSpacing: '1px' }}
        >
          ← Back to Collections
        </Link>
      </div>

      {/* Header */}
      <p style={styles.goldText}>✦ VIRTUAL TRY ON</p>
      <div style={{ height: 12 }} />

      {product?.name && (
        <h1 style={{
          color: '#fff',
          fontFamily: 'Cormorant Garamond, Georgia, serif',
          fontSize: '26px',
          fontWeight: 400,
          textAlign: 'center',
          margin: '0 0 4px',
        }}>
          {product.name}
        </h1>
      )}

      <p style={{ color: '#ffffff55', fontSize: '13px', margin: '4px 0 0', letterSpacing: '1px' }}>
        Powered by Bylo.ai
      </p>

      <div style={styles.divider} />

      {/* Ring image */}
      {ringImageUrl ? (
        <div style={{
          width: 220, height: 220,
          borderRadius: '4px',
          overflow: 'hidden',
          border: `1px solid ${gold}44`,
          flexShrink: 0,
          background: '#111',
        }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={ringImageUrl}
            alt={product?.name || 'Ring'}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      ) : (
        <div style={{
          width: 220, height: 220,
          borderRadius: '4px',
          border: `1px solid ${gold}22`,
          background: '#111',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <span style={{ color: '#ffffff22', fontSize: '48px' }}>💍</span>
        </div>
      )}

      <div style={styles.divider} />

      {/* Instructions card */}
      <div style={{
        width: '100%',
        maxWidth: 480,
        background: '#111',
        border: `1px solid ${gold}22`,
        borderRadius: '4px',
        padding: '28px 24px',
        marginBottom: 32,
      }}>
        <p style={{ ...styles.goldText, marginBottom: 20, display: 'block' }}>
          HOW TO TRY ON
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {steps.map(s => (
            <div key={s.num} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <span style={{
                width: 28, height: 28,
                border: `1px solid ${gold}66`,
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: gold,
                fontFamily: 'Cinzel, serif',
                fontSize: '12px',
                flexShrink: 0,
              }}>
                {s.num}
              </span>
              <p style={{ color: '#ffffffcc', fontSize: '14px', lineHeight: 1.6, margin: 0 }}>
                {s.text}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: '100%', maxWidth: 480 }}>
        {ringImageUrl && (
          <button style={styles.goldBtn} onClick={downloadRingImage}>
            {downloading ? '⏳ Downloading...' : '⬇ Download Ring Image'}
          </button>
        )}

        <a
          href={BYLO_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={styles.outlineBtn}
        >
          ✦ Open Bylo.ai Try-On →
        </a>
      </div>

      <div style={styles.divider} />

      <p style={{ color: '#ffffff22', fontSize: '11px', letterSpacing: '1px', textAlign: 'center', maxWidth: 400 }}>
        Bylo.ai uses advanced AI to place jewellery on your hand photo for a realistic preview.
        Images are processed on Bylo.ai's servers.
      </p>
    </div>
  );
}
