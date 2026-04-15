'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ARTryOnPage() {
  const params = useParams();
  const sku = decodeURIComponent(params.ringId as string);

  const [arUrl, setArUrl] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch('/api/admin/products');
        if (!res.ok) throw new Error('fetch failed');
        const { products } = await res.json();
        const product = products.find((p: any) => p.sku === sku);
        if (!product) {
          setError('Ring not found. Please scan the QR code again.');
          return;
        }

        const imgUrl  = encodeURIComponent(product.images?.[0] || '');
        const name    = encodeURIComponent(product.name || 'Surya Jewellers Ring');
        const backUrl = encodeURIComponent('/products');

        setArUrl(`/ar-try-on.html?img=${imgUrl}&name=${name}&back=${backUrl}`);
      } catch {
        setError('Could not load ring details. Please check your connection.');
      }
    }
    fetchProduct();
  }, [sku]);

  /* ── Error state ── */
  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0a0a0a',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '20px',
        fontFamily: 'system-ui, sans-serif',
        padding: '32px',
      }}>
        <span style={{ fontSize: '48px' }}>💍</span>
        <p style={{ color: '#ef4444', fontSize: '14px', textAlign: 'center', lineHeight: 1.6, maxWidth: 300 }}>
          {error}
        </p>
        <Link
          href="/products"
          style={{
            padding: '14px 28px',
            background: 'transparent',
            color: '#c9a84c',
            border: '1px solid #c9a84c',
            fontFamily: 'Cinzel, serif',
            fontSize: '12px',
            letterSpacing: '2px',
            textDecoration: 'none',
          }}
        >
          BACK TO COLLECTIONS
        </Link>
      </div>
    );
  }

  /* ── Loading state ── */
  if (!arUrl) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0a0a0a',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '20px',
        fontFamily: 'system-ui, sans-serif',
      }}>
        <div style={{
          width: 44,
          height: 44,
          border: '2px solid #c9a84c33',
          borderTop: '2px solid #c9a84c',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
        <p style={{
          color: '#c9a84c',
          fontFamily: 'Cinzel, serif',
          fontSize: '13px',
          letterSpacing: '3px',
        }}>
          ✦ Preparing your try-on experience...
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  /* ── AR iframe — full screen ── */
  return (
    <iframe
      src={arUrl}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        border: 'none',
        background: '#000',
      }}
      allow="camera; microphone; accelerometer; gyroscope; magnetometer"
      allowFullScreen
    />
  );
}
