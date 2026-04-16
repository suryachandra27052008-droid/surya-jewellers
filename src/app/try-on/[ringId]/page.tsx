'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function TryOnPage() {
  const params = useParams();
  const sku = decodeURIComponent(params.ringId as string);

  const [state, setState] = useState<'start' | 'processing' | 'result'>('start');
  const [result, setResult] = useState<string | null>(null);
  const [product, setProduct] = useState<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/admin/products')
      .then(r => r.json())
      .then(({ products }) => {
        const found = products.find((p: any) => String(p.sku) === String(sku));
        if (found) setProduct(found);
      })
      .catch(() => {});
  }, [sku]);

  // products API returns images array; normalise to a single image url
  const ringImage: string = product?.images?.[0] || '';

  const handlePhotoInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const handDataUrl = reader.result as string;
      setState('processing');
      compositeImages(handDataUrl);
    };
    reader.readAsDataURL(file);
  };

  const compositeImages = (handDataUrl: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const handImg = new Image();
    handImg.onload = () => {
      canvas.width = handImg.width;
      canvas.height = handImg.height;
      ctx.drawImage(handImg, 0, 0);

      if (ringImage) {
        const ringImg = new Image();
        ringImg.crossOrigin = 'anonymous';
        ringImg.onload = () => {
          const ringSize = canvas.width * 0.35;
          const x = (canvas.width - ringSize) / 2;
          const y = canvas.height * 0.55;
          ctx.globalAlpha = 0.92;
          ctx.drawImage(ringImg, x, y, ringSize, ringSize);
          ctx.globalAlpha = 1.0;
          setResult(canvas.toDataURL('image/jpeg', 0.9));
          setState('result');
        };
        ringImg.onerror = () => {
          setResult(canvas.toDataURL('image/jpeg', 0.9));
          setState('result');
        };
        ringImg.src = ringImage;
      } else {
        setResult(canvas.toDataURL('image/jpeg', 0.9));
        setState('result');
      }
    };
    handImg.src = handDataUrl;
  };

  const savePhoto = () => {
    if (!result) return;
    const a = document.createElement('a');
    a.href = result;
    a.download = `surya-jewellers-tryon-${sku}.jpg`;
    a.click();
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#000',
      color: '#c9a84c',
      fontFamily: 'Cinzel, serif',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {state === 'start' && (
        <div style={{ textAlign: 'center', width: '100%', maxWidth: '400px' }}>
          <p style={{ letterSpacing: '3px', fontSize: '12px', marginBottom: '8px' }}>
            SURYA JEWELLERS
          </p>
          <h1 style={{ fontSize: '22px', marginBottom: '20px' }}>
            ✦ VIRTUAL TRY ON
          </h1>
          {ringImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={ringImage}
              alt="ring"
              style={{
                width: '160px', height: '160px',
                objectFit: 'cover', borderRadius: '8px',
                border: '1px solid #c9a84c',
                marginBottom: '24px',
              }}
            />
          )}
          <p style={{ fontSize: '13px', color: '#888', marginBottom: '32px', lineHeight: '1.6' }}>
            Take a photo of your hand flat on a surface with fingers spread
          </p>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handlePhotoInput}
            style={{ display: 'none' }}
          />
          <button
            onClick={() => inputRef.current?.click()}
            style={{
              background: '#c9a84c', color: '#000',
              border: 'none', padding: '16px 32px',
              fontSize: '14px', letterSpacing: '2px',
              fontFamily: 'Cinzel, serif',
              cursor: 'pointer', borderRadius: '4px',
              width: '100%',
            }}
          >
            📸 TAKE PHOTO OF YOUR HAND
          </button>
        </div>
      )}

      {state === 'processing' && (
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px', height: '48px',
            border: '2px solid #c9a84c',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px',
          }} />
          <p style={{ letterSpacing: '3px', fontSize: '13px' }}>
            ✦ PLACING YOUR RING...
          </p>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      )}

      {state === 'result' && (
        <div style={{ textAlign: 'center', width: '100%', maxWidth: '400px' }}>
          <p style={{ letterSpacing: '2px', fontSize: '11px', marginBottom: '16px', color: '#888' }}>
            ✦ YOUR LOOK
          </p>
          {result && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={result}
              alt="try on result"
              style={{
                width: '100%', borderRadius: '8px',
                border: '1px solid #c9a84c',
                marginBottom: '20px',
              }}
            />
          )}
          <button
            onClick={savePhoto}
            style={{
              background: '#c9a84c', color: '#000',
              border: 'none', padding: '14px',
              fontSize: '13px', letterSpacing: '2px',
              fontFamily: 'Cinzel, serif',
              cursor: 'pointer', borderRadius: '4px',
              width: '100%', marginBottom: '12px',
            }}
          >
            💾 SAVE PHOTO
          </button>
          <button
            onClick={() => {
              setState('start');
              setResult(null);
              if (inputRef.current) inputRef.current.value = '';
            }}
            style={{
              background: 'transparent', color: '#c9a84c',
              border: '1px solid #c9a84c', padding: '14px',
              fontSize: '13px', letterSpacing: '2px',
              fontFamily: 'Cinzel, serif',
              cursor: 'pointer', borderRadius: '4px',
              width: '100%',
            }}
          >
            ↺ TRY AGAIN
          </button>
        </div>
      )}
    </div>
  );
}
