'use client'
import { useEffect, useState } from 'react'

const lineData = [
  { left: '3%',   delay: '0.0s', duration: '2.8s' },
  { left: '8%',   delay: '0.4s', duration: '3.4s' },
  { left: '13%',  delay: '1.1s', duration: '2.5s' },
  { left: '18%',  delay: '0.7s', duration: '3.8s' },
  { left: '23%',  delay: '1.8s', duration: '2.2s' },
  { left: '28%',  delay: '0.2s', duration: '3.1s' },
  { left: '33%',  delay: '2.3s', duration: '2.7s' },
  { left: '38%',  delay: '0.9s', duration: '3.5s' },
  { left: '43%',  delay: '1.5s', duration: '2.4s' },
  { left: '48%',  delay: '2.7s', duration: '3.9s' },
  { left: '53%',  delay: '0.6s', duration: '2.6s' },
  { left: '58%',  delay: '1.3s', duration: '3.2s' },
  { left: '62%',  delay: '2.1s', duration: '2.9s' },
  { left: '67%',  delay: '0.3s', duration: '3.6s' },
  { left: '72%',  delay: '1.7s', duration: '2.3s' },
  { left: '77%',  delay: '2.5s', duration: '3.0s' },
  { left: '82%',  delay: '0.8s', duration: '4.0s' },
  { left: '87%',  delay: '1.4s', duration: '2.1s' },
  { left: '92%',  delay: '2.0s', duration: '3.3s' },
  { left: '97%',  delay: '0.5s', duration: '2.8s' },
]

export default function IntroAnimation() {
  const [visible, setVisible] = useState(false)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem('introShown')) return
    setVisible(true)

    const fadeId = setTimeout(() => {
      setFading(true)
      sessionStorage.setItem('introShown', 'true')
      setTimeout(() => setVisible(false), 1000)
    }, 4000)

    return () => clearTimeout(fadeId)
  }, [])

  function dismiss() {
    if (fading) return
    setFading(true)
    sessionStorage.setItem('introShown', 'true')
    setTimeout(() => setVisible(false), 1000)
  }

  if (!visible) return null

  return (
    <>
      <style>{`
        @keyframes shimmerLine {
          0%   { opacity: 0; transform: translateY(-100%); }
          20%  { opacity: 1; }
          80%  { opacity: 1; }
          100% { opacity: 0; transform: translateY(100%); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          background: '#000',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: fading ? 0 : 1,
          transition: 'opacity 1s ease',
          pointerEvents: fading ? 'none' : 'auto',
        }}
      >
        {/* Vertical shimmer lines */}
        {lineData.map((l, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: 0,
              left: l.left,
              width: i % 3 === 0 ? '2px' : '1px',
              height: '100vh',
              background: 'linear-gradient(to bottom, transparent, #c9a84c 40%, #8B6914 60%, transparent)',
              animation: `shimmerLine ${l.duration} ${l.delay} infinite ease-in-out`,
              opacity: 0,
            }}
          />
        ))}

        {/* Center content */}
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
            userSelect: 'none',
          }}
        >
          <p
            style={{
              color: '#c9a84c',
              fontSize: '11px',
              letterSpacing: '6px',
              fontFamily: 'var(--font-cinzel), serif',
              margin: 0,
              opacity: 0,
              animation: 'fadeInUp 0.8s ease 0.5s forwards',
            }}
          >
            — EST. 2003 · JAIPUR, INDIA —
          </p>

          <h1
            style={{
              color: '#fff',
              fontSize: '120px',
              letterSpacing: '40px',
              fontFamily: 'var(--font-cinzel), serif',
              fontWeight: 700,
              lineHeight: 1,
              margin: 0,
              textShadow: '0 0 80px rgba(201,168,76,0.4)',
              opacity: 0,
              animation: 'fadeInUp 0.8s ease 0.7s forwards',
            }}
          >
            SURYA
          </h1>

          <h2
            style={{
              color: '#c9a84c',
              fontSize: '24px',
              letterSpacing: '20px',
              fontFamily: 'var(--font-cinzel), serif',
              fontWeight: 400,
              margin: 0,
              opacity: 0,
              animation: 'fadeInUp 0.8s ease 0.9s forwards',
            }}
          >
            JEWELLERS
          </h2>

          <p
            style={{
              color: 'rgba(255,255,255,0.65)',
              fontSize: '18px',
              letterSpacing: '1px',
              fontFamily: '"Cormorant Garamond", var(--font-playfair), serif',
              fontStyle: 'italic',
              margin: '8px 0 0',
              opacity: 0,
              animation: 'fadeInUp 0.8s ease 1.1s forwards',
            }}
          >
            Crafted in 92.5 Sterling Silver
          </p>
        </div>

        {/* Skip button */}
        <button
          onClick={dismiss}
          style={{
            position: 'absolute',
            bottom: '36px',
            right: '40px',
            background: 'transparent',
            border: 'none',
            color: 'rgba(255,255,255,0.6)',
            fontSize: '12px',
            letterSpacing: '3px',
            fontFamily: 'var(--font-cinzel), serif',
            cursor: 'pointer',
            padding: '8px 4px',
            transition: 'color 0.2s',
            opacity: 0,
            animation: 'fadeInUp 0.6s ease 1.4s forwards',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = '#c9a84c')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
        >
          SKIP →
        </button>
      </div>
    </>
  )
}
