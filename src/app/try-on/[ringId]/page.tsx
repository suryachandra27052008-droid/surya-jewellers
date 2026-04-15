'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ARTryOnPage() {
  const params = useParams();
  const sku = decodeURIComponent(params.ringId as string);

  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin/products');
        if (!res.ok) throw new Error('Could not load product data');
        const { products } = await res.json();
        const product = products.find((p: any) => p.sku === sku);
        if (!product) throw new Error('Ring not found. Please scan the QR code again.');

        const imgUrl = product.images?.[0] || '';
        window.location.replace(`/tryon.html?img=${encodeURIComponent(imgUrl)}`);
      } catch (err: any) {
        setError(err.message || 'Failed to load ring details.');
      }
    })();
  }, [sku]);

  if (error) {
    return (
      <div style={{
        position: 'fixed', inset: 0,
        background: '#0a0a0a',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: '20px', padding: '32px',
        fontFamily: 'system-ui, sans-serif',
      }}>
        <span style={{ fontSize: '48px' }}>💍</span>
        <p style={{ color: '#ef4444', fontSize: '14px', textAlign: 'center', lineHeight: 1.6, maxWidth: 320 }}>
          {error}
        </p>
        <Link href="/products" style={{
          padding: '14px 28px',
          background: 'transparent', color: '#c9a84c',
          border: '1px solid #c9a84c',
          fontFamily: 'Cinzel, serif', fontSize: '12px', letterSpacing: '2px',
          textDecoration: 'none',
        }}>
          BACK TO COLLECTIONS
        </Link>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: '#0a0a0a',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: '20px',
      fontFamily: 'system-ui, sans-serif',
    }}>
      <div style={{
        width: 44, height: 44,
        border: '2px solid #c9a84c33',
        borderTop: '2px solid #c9a84c',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
      }} />
      <p style={{ color: '#c9a84c', fontSize: '13px', letterSpacing: '3px', fontFamily: 'Cinzel, serif' }}>
        ✦ Preparing your try-on experience...
      </p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
