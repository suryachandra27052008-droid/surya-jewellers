'use client'
import { useState, useEffect } from 'react'

const images = [
  '/hero-bg.jpg',
  '/hero-bg-2.jpg',
  '/hero-bg-3.jpg'
]

export default function HeroSlideshow({ children }) {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % images.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}>
      {images.map((img, i) => (
        <div
          key={img}
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${img})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: i === current ? 1 : 0,
            transition: 'opacity 1.5s ease-in-out',
            zIndex: i === current ? 1 : 0
          }}
        />
      ))}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(0,0,0,0.45)',
        zIndex: 2
      }}/>
      <div style={{ position: 'relative', zIndex: 3, height: '100%' }}>
        {children}
      </div>
      <div style={{
        position: 'absolute',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '10px',
        zIndex: 4
      }}>
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              border: '1px solid #c9a84c',
              background: i === current ? '#c9a84c' : 'transparent',
              cursor: 'pointer',
              padding: 0
            }}
          />
        ))}
      </div>
    </div>
  )
}
