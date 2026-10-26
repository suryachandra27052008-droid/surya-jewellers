'use client';

import { useEffect, useRef } from 'react';

const TRAIL_LENGTH = 25;

export default function CursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId = 0;
    let lastMove = 0;
    // Ring buffer of the last TRAIL_LENGTH cursor positions
    const trail: { x: number; y: number }[] = [];
    let mouse = { x: -9999, y: -9999 };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const onMouseMove = (e: MouseEvent) => {
      mouse = { x: e.clientX, y: e.clientY };
      lastMove = performance.now();
      if (!animationId && !document.hidden) animationId = requestAnimationFrame(draw);
    };
    window.addEventListener('mousemove', onMouseMove);

    const draw = () => {
      animationId = 0;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (document.hidden || performance.now() - lastMove > 450) {
        trail.length = 0;
        return;
      }

      // Push current position to trail
      trail.push({ x: mouse.x, y: mouse.y });
      if (trail.length > TRAIL_LENGTH) trail.shift();

      const len = trail.length;
      for (let i = 0; i < len; i++) {
        // i=0 is oldest (tail), i=len-1 is newest (head)
        const t = i / (TRAIL_LENGTH - 1);   // 0 → tail, 1 → head
        const alpha = t * 0.85;              // fades toward tail
        const radius = 1.5 + t * 4.5;       // shrinks toward tail

        const { x, y } = trail[i];

        ctx.save();
        ctx.globalAlpha = alpha;

        // Glow halo
        const glow = ctx.createRadialGradient(x, y, 0, x, y, radius * 2.8);
        glow.addColorStop(0, 'rgba(201,168,76,0.7)');
        glow.addColorStop(1, 'rgba(201,168,76,0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x, y, radius * 2.8, 0, Math.PI * 2);
        ctx.fill();

        // Bright core dot
        ctx.fillStyle = '#c9a84c';
        ctx.beginPath();
        ctx.arc(x, y, radius * 0.55, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      animationId = requestAnimationFrame(draw);
    };

    const pause = () => {
      if (!document.hidden) return;
      cancelAnimationFrame(animationId);
      animationId = 0;
      trail.length = 0;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
    document.addEventListener('visibilitychange', pause);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', pause);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 9999 }}
    />
  );
}
