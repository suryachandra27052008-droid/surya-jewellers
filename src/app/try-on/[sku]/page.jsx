'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

// pixa.com try-on
const G = '#c9a84c';

export default function TryOnPage() {
  const { sku: rawSku } = useParams();
  const router = useRouter();
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

  const steps = [
    'Save the ring image above',
    'Click Try On Free With AI',
    'Upload a photo of your hand',
    'Upload the saved ring image',
    'Type: "Place this ring on my ring finger"',
    'Click Generate — done!',
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: '#000',
      color: G,
      fontFamily: 'Cinzel, serif',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '36px 20px 48px',
    }}>
      <div style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>

        <p style={{ margin: 0, fontSize: '11px', letterSpacing: '3px', color: '#999' }}>
          SURYA JEWELLERS ✦ VIRTUAL TRY ON
        </p>

        {ringImage
          ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={ringImage}
              alt={ringName}
              style={{ width: 150, height: 150, objectFit: 'cover', borderRadius: '8px', border: `1px solid ${G}` }}
            />
          )
          : <div style={{ width: 150, height: 150, border: `1px solid ${G}33`, borderRadius: '8px' }} />
        }

        <p style={{ margin: 0, fontSize: '15px', textAlign: 'center', lineHeight: 1.5 }}>
          {ringName}
        </p>

        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            onClick={() => ringImage && window.open(ringImage, '_blank')}
            disabled={!ringImage}
            style={{
              width: '100%', padding: '15px',
              background: G, color: '#000',
              border: 'none', borderRadius: '4px',
              fontFamily: 'Cinzel, serif', fontSize: '13px',
              letterSpacing: '2px', cursor: ringImage ? 'pointer' : 'default',
              opacity: ringImage ? 1 : 0.4,
            }}
          >
            ⬇ SAVE RING IMAGE
          </button>

          <button
            onClick={() => window.open('https://www.pixa.com/create/virtual-ring-try-on', '_blank')}
            style={{
              width: '100%', padding: '15px',
              background: 'transparent', color: G,
              border: `1px solid ${G}`, borderRadius: '4px',
              fontFamily: 'Cinzel, serif', fontSize: '13px',
              letterSpacing: '2px', cursor: 'pointer',
            }}
          >
            ✦ TRY ON FREE WITH AI →
          </button>
        </div>

        <div style={{ width: '100%', marginTop: '8px' }}>
          {steps.map((step, i) => (
            <div
              key={i}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: '10px',
                marginBottom: i < steps.length - 1 ? '10px' : 0,
              }}
            >
              <span style={{
                minWidth: '20px', height: '20px',
                background: G, color: '#000',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '10px', flexShrink: 0, marginTop: '1px',
              }}>
                {i + 1}
              </span>
              <p style={{ margin: 0, fontSize: '12px', color: '#bbb', lineHeight: 1.6 }}>{step}</p>
            </div>
          ))}
        </div>

        <p style={{ margin: '8px 0 0', fontSize: '11px', color: '#555', textAlign: 'center', letterSpacing: '0.5px' }}>
          Powered by Pixa.com — Free, no subscription needed
        </p>

        <button
          onClick={() => router.back()}
          style={{
            background: 'none', border: 'none',
            color: G, fontFamily: 'Cinzel, serif',
            fontSize: '12px', letterSpacing: '2px',
            cursor: 'pointer', padding: '6px 0',
          }}
        >
          ← BACK
        </button>

      </div>
    </div>
  );
}
