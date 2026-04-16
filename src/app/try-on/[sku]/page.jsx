'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function TryOnPage() {
  const { sku: rawSku } = useParams();
  const sku = decodeURIComponent(rawSku);

  const [product, setProduct] = useState(null);

  useEffect(() => {
    fetch('/api/admin/products')
      .then(r => r.json())
      .then(({ products }) => {
        const found = products.find(p => String(p.sku) === String(sku));
        if (found) setProduct(found);
      })
      .catch(() => {});
  }, [sku]);

  const ringImage = product?.images?.[0] || '';
  const ringName = product?.name || sku;

  const downloadRingImage = async () => {
    if (!ringImage) return;
    try {
      const res = await fetch(ringImage);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${sku}-ring.jpg`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      window.open(ringImage, '_blank');
    }
  };

  const gold = '#c9a84c';
  const base = {
    minHeight: '100vh',
    background: '#000',
    color: gold,
    fontFamily: 'Cinzel, serif',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '40px 20px',
    gap: '0',
  };

  const btnGold = {
    background: gold,
    color: '#000',
    border: 'none',
    padding: '16px',
    fontSize: '14px',
    letterSpacing: '2px',
    fontFamily: 'Cinzel, serif',
    cursor: 'pointer',
    borderRadius: '4px',
    width: '100%',
  };

  const btnOutline = {
    background: 'transparent',
    color: gold,
    border: `1px solid ${gold}`,
    padding: '14px',
    fontSize: '13px',
    letterSpacing: '2px',
    fontFamily: 'Cinzel, serif',
    cursor: 'pointer',
    borderRadius: '4px',
    width: '100%',
  };

  return (
    <div style={base}>
      <div style={{ width: '100%', maxWidth: '420px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>

        <p style={{ letterSpacing: '3px', fontSize: '11px', color: '#888', margin: 0 }}>SURYA JEWELLERS</p>
        <h1 style={{ fontSize: '20px', margin: 0, textAlign: 'center' }}>✦ VIRTUAL TRY ON</h1>

        {ringImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={ringImage}
            alt={ringName}
            style={{ width: '180px', height: '180px', objectFit: 'cover', borderRadius: '8px', border: `1px solid ${gold}` }}
          />
        )}

        <p style={{ fontSize: '16px', margin: 0, textAlign: 'center', lineHeight: '1.5' }}>{ringName}</p>

        <p style={{ fontSize: '13px', color: '#aaa', margin: 0, textAlign: 'center', lineHeight: '1.7' }}>
          Try this ring on your hand using Bylo.ai — Free AI Try On
        </p>

        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button onClick={downloadRingImage} style={btnOutline} disabled={!ringImage}>
            ↓ DOWNLOAD RING IMAGE
          </button>

          <button
            onClick={() => window.open('https://bylo.ai/features/jewelry-ai-filter', '_blank')}
            style={btnGold}
          >
            ✦ OPEN FREE AI TRY ON
          </button>
        </div>

        <div style={{
          width: '100%',
          border: `1px solid #333`,
          borderRadius: '8px',
          padding: '24px',
          boxSizing: 'border-box',
        }}>
          <p style={{ fontSize: '11px', letterSpacing: '2px', color: '#888', margin: '0 0 16px 0' }}>HOW TO TRY ON</p>
          {[
            'Download the ring image using the button above',
            'Click Open Free AI Try On',
            'Upload a photo of your hand',
            'Upload the ring image you downloaded',
            'Click Generate — see the ring on your hand!',
          ].map((step, i) => (
            <div key={i} style={{ display: 'flex', gap: '12px', marginBottom: i < 4 ? '14px' : 0, alignItems: 'flex-start' }}>
              <span style={{
                minWidth: '24px', height: '24px',
                background: gold, color: '#000',
                borderRadius: '50%', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: '11px', fontFamily: 'Cinzel, serif', flexShrink: 0,
              }}>{i + 1}</span>
              <p style={{ fontSize: '13px', color: '#ccc', margin: 0, lineHeight: '1.6' }}>{step}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
