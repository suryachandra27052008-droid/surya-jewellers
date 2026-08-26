'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'

const images = [
  { src: '/hero-bg.webp',   alt: 'Surya Jewellers showroom — handcrafted silver jewellery, Jaipur' },
  { src: '/hero-bg-2.webp', alt: 'Surya Jewellers jewellery collection — 92.5 sterling silver' },
  { src: '/hero-bg-3.webp', alt: 'Surya Jewellers gold and silver jewellery' },
]

export default function HeroSlideshow({ children }) {
  const [current, setCurrent] = useState(0)
  // Defer non-first images: absolutely-positioned images overlap the viewport,
  // so loading="lazy" is ignored by the browser — mount them after first paint.
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const mountTimer = window.setTimeout(() => setMounted(true), 0)
    return () => window.clearTimeout(mountTimer)
  }, [])

  useEffect(() => {
    if (!mounted) return
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % images.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [mounted])

  return (
    <div
      role="region"
      aria-label="Hero slideshow"
      style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}
    >
      {images.map(({ src, alt }, i) => {
        // Only render the first image before mount to avoid loading all 3 on first paint
        if (i > 0 && !mounted) return null
        return (
          <div
            key={src}
            aria-hidden={i !== current}
            style={{
              position: 'absolute',
              inset: 0,
              opacity: i === current ? 1 : 0,
              transition: 'opacity 1.5s ease-in-out',
              zIndex: i === current ? 1 : 0
            }}
          >
            <Image
              src={src}
              alt={alt}
              fill
              sizes="100vw"
              quality={60}
              style={{ objectFit: 'cover', objectPosition: 'center' }}
              {...(i === 0
                ? { priority: true, fetchPriority: 'high' }
                : { loading: 'lazy' }
              )}
            />
          </div>
        )
      })}

      {/* Overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(0,0,0,0.45)',
        zIndex: 2
      }}/>

      {/* Slot for Hero content */}
      <div style={{ position: 'relative', zIndex: 3, height: '100%' }}>
        {children}
      </div>

      {/* Carousel dot navigation */}
      <div
        role="tablist"
        aria-label="Slide navigation"
        style={{
          position: 'absolute',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '4px',
          zIndex: 4
        }}
      >
        {images.map((img, i) => (
          <button
            key={i}
            role="tab"
            aria-selected={i === current}
            aria-label={`Slide ${i + 1}: ${img.alt}`}
            onClick={() => setCurrent(i)}
            style={{
              /* 24×24 touch target, visual dot is 10×10 via inner span */
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            <span
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                border: '1px solid #c9a84c',
                background: i === current ? '#c9a84c' : 'transparent',
                display: 'block',
                pointerEvents: 'none',
              }}
            />
          </button>
        ))}
      </div>
    </div>
  )
}
