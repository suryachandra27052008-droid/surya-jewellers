import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Surya Jewellers — 92.5 Sterling Silver Jewellery, Jaipur';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1208 50%, #0a0a0a 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'serif',
          position: 'relative',
        }}
      >
        {/* Gold border frame */}
        <div
          style={{
            position: 'absolute',
            inset: 24,
            border: '1px solid rgba(201,168,76,0.4)',
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 30,
            border: '1px solid rgba(201,168,76,0.15)',
            display: 'flex',
          }}
        />

        {/* Decorative corners */}
        <div style={{ position: 'absolute', top: 40, left: 40, width: 40, height: 40, borderTop: '2px solid #c9a84c', borderLeft: '2px solid #c9a84c', display: 'flex' }} />
        <div style={{ position: 'absolute', top: 40, right: 40, width: 40, height: 40, borderTop: '2px solid #c9a84c', borderRight: '2px solid #c9a84c', display: 'flex' }} />
        <div style={{ position: 'absolute', bottom: 40, left: 40, width: 40, height: 40, borderBottom: '2px solid #c9a84c', borderLeft: '2px solid #c9a84c', display: 'flex' }} />
        <div style={{ position: 'absolute', bottom: 40, right: 40, width: 40, height: 40, borderBottom: '2px solid #c9a84c', borderRight: '2px solid #c9a84c', display: 'flex' }} />

        {/* Content */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '0 80px', textAlign: 'center' }}>
          {/* Tagline */}
          <div style={{ color: 'rgba(201,168,76,0.7)', fontSize: 14, letterSpacing: '0.4em', textTransform: 'uppercase' }}>
            ✦  Jaipur, India  ✦
          </div>

          {/* Brand name */}
          <div style={{ color: '#ffffff', fontSize: 72, fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
            Surya Jewellers
          </div>

          {/* Gold divider */}
          <div style={{ width: 80, height: 2, background: 'linear-gradient(90deg, transparent, #c9a84c, transparent)' }} />

          {/* Subtitle */}
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 24, fontWeight: 300, letterSpacing: '0.05em' }}>
            92.5 Sterling Silver Jewellery
          </div>

          {/* Description */}
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 18, fontWeight: 300, maxWidth: 700, lineHeight: 1.5, marginTop: 8 }}>
            Handcrafted rings, necklaces, earrings & bracelets set with natural diamonds and precious gemstones. Established 2003.
          </div>

          {/* URL */}
          <div style={{ color: '#c9a84c', fontSize: 16, letterSpacing: '0.1em', marginTop: 16 }}>
            suryajewellers.shop
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
