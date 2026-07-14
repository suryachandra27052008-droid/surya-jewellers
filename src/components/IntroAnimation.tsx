'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'

// Split Three.js shader out of the main bundle; only loads when the intro appears.
const ShaderAnimation = dynamic(
  () => import('./ui/shader-lines').then((m) => ({ default: m.ShaderAnimation })),
  { ssr: false }
)

export default function IntroAnimation() {
  const [visible, setVisible] = useState(true)
  const [fading, setFading] = useState(false)
  const [mobileIntro, setMobileIntro] = useState(false)
  const [fadeMs, setFadeMs] = useState(1200)
  const doneRef = useRef(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const fadeMsRef = useRef(1200)

  const startFade = useCallback(() => {
    if (doneRef.current) return
    doneRef.current = true
    setFading(true)
    setTimeout(() => {
      setVisible(false)
      sessionStorage.setItem('introShown', 'true')
    }, fadeMsRef.current)
  }, [])

  useEffect(() => {
    const shown = sessionStorage.getItem('introShown')
    if (shown) {
      const hideTimer = window.setTimeout(() => setVisible(false), 0)
      return () => window.clearTimeout(hideTimer)
    }

    const isMobile = window.matchMedia('(max-width: 768px), (pointer: coarse)').matches
    const mobileFadeMs = isMobile ? 700 : 1200
    const setupTimer = window.setTimeout(() => {
      setMobileIntro(isMobile)
      setFadeMs(mobileFadeMs)
    }, 0)
    fadeMsRef.current = mobileFadeMs

    timerRef.current = setTimeout(startFade, isMobile ? 2600 : 4500)
    window.addEventListener('keydown', startFade)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      clearTimeout(setupTimer)
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
        transition: `opacity ${fadeMs}ms ease-in-out`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
        cursor: 'pointer'
      }}
    >
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <ShaderAnimation />
      </div>

      <div style={{
        position: 'relative', zIndex: 10,
        textAlign: 'center',
        animation: `${mobileIntro ? 'introFadeIn 0.6s' : 'introFadeIn 1.5s'} ease forwards`,
        animationDelay: mobileIntro ? '0.15s' : '0.5s',
        opacity: 0,
        pointerEvents: 'none'
      }}>
        <p style={{
          fontFamily: 'Cinzel, serif',
          fontSize: '11px',
          letterSpacing: mobileIntro ? '4px' : '8px',
          color: '#c9a84c',
          marginBottom: mobileIntro ? '16px' : '24px',
          opacity: 0.8
        }}>
          EST. 2003 - JAIPUR, INDIA
        </p>

        <div aria-hidden="true" style={{
          fontFamily: 'Cinzel, serif',
          fontSize: mobileIntro ? 'clamp(42px, 15vw, 72px)' : 'clamp(60px, 12vw, 140px)',
          fontWeight: '300',
          letterSpacing: mobileIntro ? 'clamp(10px, 4vw, 20px)' : 'clamp(20px, 5vw, 60px)',
          color: '#ffffff',
          lineHeight: 1,
          marginBottom: '8px',
          textShadow: '0 0 80px rgba(201,168,76,0.4)'
        }}>
          SURYA
        </div>

        <div aria-hidden="true" style={{
          fontFamily: 'Cinzel, serif',
          fontSize: mobileIntro ? 'clamp(12px, 4vw, 16px)' : 'clamp(14px, 2.5vw, 22px)',
          fontWeight: '400',
          letterSpacing: mobileIntro ? 'clamp(5px, 2.6vw, 10px)' : 'clamp(10px, 3vw, 24px)',
          color: '#c9a84c',
          marginBottom: '20px',
          textIndent: mobileIntro ? 'clamp(5px, 2.6vw, 10px)' : 'clamp(10px, 3vw, 24px)'
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
          letterSpacing: mobileIntro ? '1.5px' : '3px',
          color: 'rgba(255,255,255,0.7)'
        }}>
          Crafted in 92.5 Sterling Silver
        </p>
      </div>

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
        SKIP
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
