'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';

const SCRIPTS = [
  'https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/dist/mindar-image.prod.js',
  'https://cdn.jsdelivr.net/npm/aframe@1.4.2/dist/aframe.min.js',
  'https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/dist/mindar-image-aframe.prod.js',
];

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const s = document.createElement('script');
    s.src = src;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(s);
  });
}

type Status = 'loading' | 'ready' | 'error';

export default function ARTryOnPage() {
  const params = useParams();
  const sku = decodeURIComponent(params.ringId as string);

  const [status, setStatus]         = useState<Status>('loading');
  const [ringImageUrl, setRingImageUrl] = useState('');
  const [errorMsg, setErrorMsg]     = useState('');

  const sceneContainerRef = useRef<HTMLDivElement>(null);

  /* ── 1. Load product + scripts sequentially ── */
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        // Fetch product
        const res = await fetch('/api/admin/products');
        if (!res.ok) throw new Error('Could not load product data');
        const { products } = await res.json();
        const product = products.find((p: any) => p.sku === sku);
        if (!product) throw new Error('Ring not found. Please scan the QR code again.');

        const imgUrl = product.images?.[0] || '';

        // Load MindAR scripts in strict order
        for (const src of SCRIPTS) {
          await loadScript(src);
        }

        if (cancelled) return;
        setRingImageUrl(imgUrl);
        setStatus('ready');
      } catch (err: any) {
        if (!cancelled) {
          setErrorMsg(err.message || 'Failed to start AR experience.');
          setStatus('error');
        }
      }
    })();

    return () => { cancelled = true; };
  }, [sku]);

  /* ── 2. Inject A-Frame scene after scripts are loaded ── */
  useEffect(() => {
    if (status !== 'ready' || !sceneContainerRef.current) return;

    sceneContainerRef.current.innerHTML = `
      <a-scene
        mindar-image="imageTargetSrc: /targets.mind; autoStart: true; uiLoading: no; uiError: no; uiScanning: no;"
        renderer="preserveDrawingBuffer: true; colorManagement: true;"
        embedded
        vr-mode-ui="enabled: false"
        device-orientation-permission-ui="enabled: false"
        style="width:100vw;height:100vh;position:fixed;top:0;left:0;"
      >
        <a-assets>
          <img id="ring-img" src="${ringImageUrl}" crossorigin="anonymous"/>
        </a-assets>
        <a-camera></a-camera>
        <a-entity mindar-image-target="targetIndex: 0">
          <a-image
            src="#ring-img"
            position="0 0 0"
            width="0.5"
            height="0.5">
          </a-image>
        </a-entity>
      </a-scene>
    `;
  }, [status, ringImageUrl]);

  /* ── 3. Capture screenshot ── */
  const captureScreenshot = useCallback(() => {
    const canvas = document.querySelector<HTMLCanvasElement>('canvas');
    if (!canvas) return;
    requestAnimationFrame(() => {
      try {
        const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
        const a = document.createElement('a');
        a.download = 'surya-jewellers-try-on.jpg';
        a.href = dataUrl;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } catch (e) {
        console.warn('Canvas capture failed', e);
      }
    });
  }, []);

  /* ── Loading screen ── */
  if (status === 'loading') {
    return (
      <div style={{
        position: 'fixed', inset: 0,
        background: '#0a0a0a',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: '20px', fontFamily: 'system-ui, sans-serif',
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

  /* ── Error screen ── */
  if (status === 'error') {
    return (
      <div style={{
        position: 'fixed', inset: 0,
        background: '#0a0a0a',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: '20px', padding: '32px', fontFamily: 'system-ui, sans-serif',
      }}>
        <span style={{ fontSize: '48px' }}>💍</span>
        <p style={{ color: '#ef4444', fontSize: '14px', textAlign: 'center', lineHeight: 1.6, maxWidth: 320 }}>
          {errorMsg}
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

  /* ── AR screen ── */
  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000' }}>
      {/* A-Frame scene injected here */}
      <div ref={sceneContainerRef} style={{ position: 'fixed', inset: 0 }} />

      {/* ── Overlay UI ── */}

      {/* Instruction banner — top center */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        display: 'flex', justifyContent: 'center',
        padding: '20px 16px 40px',
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.6), transparent)',
        pointerEvents: 'none', zIndex: 50,
      }}>
        <p style={{
          color: '#fff',
          fontSize: '14px', letterSpacing: '1px',
          textShadow: '0 1px 4px rgba(0,0,0,0.8)',
        }}>
          Point camera at your hand
        </p>
      </div>

      {/* Close button — top left */}
      <Link
        href="/products"
        style={{
          position: 'fixed', top: 16, left: 16, zIndex: 60,
          width: 44, height: 44, borderRadius: '50%',
          background: 'rgba(0,0,0,0.55)',
          border: '1px solid #c9a84c',
          color: '#c9a84c',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '20px', textDecoration: 'none', lineHeight: 1,
        }}
        aria-label="Close"
      >
        ✕
      </Link>

      {/* Capture button — bottom center */}
      <button
        onClick={captureScreenshot}
        aria-label="Capture photo"
        style={{
          position: 'fixed', bottom: 48, left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 60,
          width: 72, height: 72, borderRadius: '50%',
          background: '#c9a84c',
          border: '3px solid #fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '28px', cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
        }}
      >
        📸
      </button>
    </div>
  );
}
