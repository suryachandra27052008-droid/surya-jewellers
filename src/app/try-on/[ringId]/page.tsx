'use client';

import { useParams } from 'next/navigation';
import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';

type CameraStatus = 'idle' | 'requesting' | 'active' | 'denied' | 'unsupported';

export default function TryOnPage() {
  const params = useParams();
  const ringId = decodeURIComponent(params.ringId as string);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number>(0);

  const [status, setStatus] = useState<CameraStatus>('idle');
  const [ringName, setRingName] = useState<string>('');
  const [ringImage, setRingImage] = useState<string>('');
  const [overlayPos, setOverlayPos] = useState({ x: 0.5, y: 0.6 });
  const [overlayScale, setOverlayScale] = useState(1);

  // Fetch ring info
  useEffect(() => {
    async function fetchRing() {
      try {
        const res = await fetch('/api/admin/products');
        if (!res.ok) return;
        const data = await res.json();
        const ring =
          data.products?.find((p: any) => p._id === ringId) ||
          data.products?.find(
            (p: any) =>
              p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === ringId
          );
        if (ring) {
          setRingName(ring.name);
          setRingImage(ring.images?.[0] || '');
        }
      } catch {
        // silently fail — still show camera
      }
    }
    fetchRing();
  }, [ringId]);

  const startCamera = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus('unsupported');
      return;
    }
    setStatus('requesting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setStatus('active');
    } catch {
      setStatus('denied');
    }
  }, []);

  // Draw loop: video → canvas + ring overlay
  useEffect(() => {
    if (status !== 'active') return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const ringImg = new Image();
    ringImg.crossOrigin = 'anonymous';
    if (ringImage) ringImg.src = ringImage;

    let loaded = false;
    ringImg.onload = () => { loaded = true; };

    function draw() {
      if (!video || !canvas || !ctx) return;
      if (video.readyState >= 2) {
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;

        // Mirror for front camera feel, but keep environment camera normal
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Overlay ring
        const size = Math.min(canvas.width, canvas.height) * 0.25 * overlayScale;
        const cx = canvas.width * overlayPos.x;
        const cy = canvas.height * overlayPos.y;

        if (loaded && ringImage) {
          ctx.globalAlpha = 0.85;
          ctx.drawImage(ringImg, cx - size / 2, cy - size / 2, size, size);
          ctx.globalAlpha = 1;
        } else {
          // Placeholder ring SVG drawn as path
          ctx.save();
          ctx.strokeStyle = '#C9A84C';
          ctx.lineWidth = 6;
          ctx.shadowColor = '#C9A84C';
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.arc(cx, cy, size / 2, 0, Math.PI * 2);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(cx, cy, size / 2 - 10, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }

        // Guide label
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.roundRect(canvas.width / 2 - 130, canvas.height - 52, 260, 36, 8);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Position ring over your finger', canvas.width / 2, canvas.height - 28);
      }
      animFrameRef.current = requestAnimationFrame(draw);
    }

    animFrameRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [status, ringImage, overlayPos, overlayScale]);

  // Cleanup stream on unmount
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  const handleCanvasTouch = useCallback(
    (e: React.TouchEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      setOverlayPos({
        x: (touch.clientX - rect.left) / rect.width,
        y: (touch.clientY - rect.top) / rect.height,
      });
    },
    []
  );

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/80">
        <Link href="/products" className="text-gold text-sm">
          ← Back
        </Link>
        <h1 className="font-serif text-white text-base truncate max-w-[200px]">
          {ringName || 'Virtual Try-On'}
        </h1>
        <div className="w-12" />
      </div>

      {/* Camera / canvas */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        {/* Hidden video element */}
        <video
          ref={videoRef}
          className="hidden"
          playsInline
          muted
          autoPlay
        />

        {status === 'active' ? (
          <canvas
            ref={canvasRef}
            className="w-full h-full object-contain"
            onTouchMove={handleCanvasTouch}
            onTouchStart={handleCanvasTouch}
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-6 px-8 text-center">
            {status === 'idle' && (
              <>
                <div className="text-6xl">💍</div>
                <p className="text-white text-lg font-serif">
                  {ringName ? `Try on "${ringName}"` : 'Virtual Ring Try-On'}
                </p>
                <p className="text-white/60 text-sm">
                  Hold your hand up to the camera and position the ring overlay on your finger.
                </p>
                <button
                  onClick={startCamera}
                  className="px-8 py-3 bg-gold text-white font-semibold tracking-widest uppercase text-sm rounded"
                >
                  Start Camera
                </button>
              </>
            )}

            {status === 'requesting' && (
              <p className="text-white/70 text-sm animate-pulse">Requesting camera access…</p>
            )}

            {status === 'denied' && (
              <>
                <p className="text-red-400 text-sm">Camera access was denied.</p>
                <p className="text-white/60 text-xs">
                  Please allow camera permissions in your browser settings, then reload.
                </p>
                <button
                  onClick={startCamera}
                  className="mt-4 px-6 py-2 border border-gold text-gold text-sm rounded"
                >
                  Try Again
                </button>
              </>
            )}

            {status === 'unsupported' && (
              <p className="text-white/60 text-sm">
                Camera is not supported on this device or browser.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Controls (scale slider) */}
      {status === 'active' && (
        <div className="bg-black/80 px-6 py-4 flex flex-col gap-2">
          <label className="text-white/60 text-xs text-center">Ring Size</label>
          <input
            type="range"
            min={0.4}
            max={2.5}
            step={0.05}
            value={overlayScale}
            onChange={(e) => setOverlayScale(parseFloat(e.target.value))}
            className="w-full accent-gold"
          />
          <p className="text-white/40 text-xs text-center">
            Touch the camera to reposition the ring
          </p>
        </div>
      )}
    </div>
  );
}
