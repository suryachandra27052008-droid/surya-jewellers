'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'

// Split Three.js shader out of the main bundle — only loads on first visit
const ShaderAnimation = dynamic(
  () => import('./ui/shader-lines').then((m) => ({ default: m.ShaderAnimation })),
  { ssr: false }
)

export default function IntroAnimation() {
  const [visible, setVisible] = useState(true)
  const [fading, setFading] = useState(false)
  const doneRef = useRef(false)

  const startFade = useCallback(() => {
    if (doneRef.current) return
    doneRef.current = true
    setFading(true)
    setTimeout(() => {
      setVisible(false)
      sessionStorage.setItem('introShown', 'true')
    }, 1200)
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const shown = sessionStorage.getItem('introShown')
      if (shown) { setVisible(false); return }
      // Skip intro on mobile — avoids blocking hero LCP by 5+ seconds
      if (window.matchMedia('(max-width: 768px)').matches) {
        setVisible(false)
        return
      }
    }
    const timer = setTimeout(startFade, 4500)
    window.addEventListener('keydown', startFade)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('keydown', startFade)
    }
  }, [startFade])

  if (!visible) return null

  return (
    <div
      onClick={startFade}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: '#000',
        opacity: fading ? 0 : 1,
        transition: 'opacity 1.2s ease-in-out',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
        cursor: 'pointer'
      }}
    >
      {/* Shader sits behind everything and doesn't intercept pointer events */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <ShaderAnimation />
      </div>

      {/* Center content */}
      <div style={{
        position: 'relative', zIndex: 10,
        textAlign: 'center',
        animation: 'introFadeIn 1.5s ease forwards',
        animationDelay: '0.5s',
        opacity: 0,
        pointerEvents: 'none'
      }}>
        <p style={{
          fontFamily: 'Cinzel, serif',
          fontSize: '11px',
          letterSpacing: '8px',
          color: '#c9a84c',
          marginBottom: '24px',
          opacity: 0.8
        }}>
          — EST. 2003 · JAIPUR, INDIA —
        </p>

        <div aria-hidden="true" style={{
          fontFamily: 'Cinzel, serif',
          fontSize: 'clamp(60px, 12vw, 140px)',
          fontWeight: '300',
          letterSpacing: 'clamp(20px, 5vw, 60px)',
          color: '#ffffff',
          lineHeight: 1,
          marginBottom: '8px',
          textShadow: '0 0 80px rgba(201,168,76,0.4)'
        }}>
          SURYA
        </div>

        <div aria-hidden="true" style={{
          fontFamily: 'Cinzel, serif',
          fontSize: 'clamp(14px, 2.5vw, 22px)',
          fontWeight: '400',
          letterSpacing: 'clamp(10px, 3vw, 24px)',
          color: '#c9a84c',
          marginBottom: '20px',
          textIndent: 'clamp(10px, 3vw, 24px)'
        }}>
          JEWELLERS
        </div>

        <div style={{
          width: '80px', height: '1px',
          background: 'linear-gradient(to right, transparent, #c9a84c, transparent)',
          margin: '0 auto 20px'
        }} />

        <p style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: 'clamp(14px, 1.8vw, 20px)',
          fontStyle: 'italic',
          fontWeight: '300',
          letterSpacing: '3px',
          color: 'rgba(255,255,255,0.7)'
        }}>
          Crafted in 92.5 Sterling Silver
        </p>
      </div>

      {/* Skip button */}
      <button
        onClick={startFade}
        style={{
          position: 'absolute', bottom: '32px', right: '40px',
          background: 'transparent', border: 'none',
          color: 'rgba(255,255,255,0.5)',
          fontFamily: 'Cinzel, serif',
          fontSize: '11px', letterSpacing: '4px',
          cursor: 'pointer', zIndex: 20,
          transition: 'color 0.3s',
          pointerEvents: 'auto'
        }}
        onMouseEnter={e => (e.currentTarget.style.color = '#c9a84c')}
        onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
      >
        SKIP →
      </button>

      <style>{`
        @keyframes introFadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
