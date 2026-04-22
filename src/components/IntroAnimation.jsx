'use client'
import { useEffect, useRef, useState } from 'react'

const VERT = `
  attribute vec2 position;
  void main() { gl_Position = vec4(position, 0.0, 1.0); }
`

const FRAG = `
  precision mediump float;
  uniform float time;
  uniform vec2 resolution;

  float rng(float x) { return fract(sin(x * 127.1) * 43758.5453); }

  void main() {
    vec2 uv = gl_FragCoord.xy / resolution;

    float cols = 48.0;
    float xi = floor(uv.x * cols);
    float xf = fract(uv.x * cols);

    float speed   = 0.25 + rng(xi) * 0.55;
    float phase   = rng(xi + 17.3);
    float lineW   = 0.04 + rng(xi + 5.1) * 0.12;
    float tailLen = 0.18 + rng(xi + 3.7) * 0.22;

    float t  = mod(time * speed + phase, 1.6) / 1.6;
    float dy = uv.y - t;

    float colMask  = 1.0 - smoothstep(0.0, lineW, abs(xf - 0.5));
    float headGlow = (1.0 - smoothstep(0.0, 0.04, abs(dy))) * step(0.0, dy);
    float tail     = (1.0 - smoothstep(0.0, tailLen, -dy)) * step(dy, 0.0);
    float alpha    = colMask * (headGlow + tail * 0.45);

    vec3 goldBright = vec3(0.80, 0.66, 0.30);
    vec3 goldDark   = vec3(0.55, 0.41, 0.08);
    vec3 bg         = vec3(0.018, 0.012, 0.005);
    vec3 col        = mix(goldDark, goldBright, clamp(alpha * 2.0, 0.0, 1.0));

    gl_FragColor = vec4(mix(bg, col, clamp(alpha, 0.0, 1.0)), 1.0);
  }
`

function ShaderCanvas() {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const gl = canvas.getContext('webgl')
    if (!gl) return

    const compile = (type, src) => {
      const s = gl.createShader(type)
      gl.shaderSource(s, src)
      gl.compileShader(s)
      return s
    }

    const prog = gl.createProgram()
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT))
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG))
    gl.linkProgram(prog)
    gl.useProgram(prog)

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW)

    const loc = gl.getAttribLocation(prog, 'position')
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)

    const timeLoc = gl.getUniformLocation(prog, 'time')
    const resLoc  = gl.getUniformLocation(prog, 'resolution')

    let raf
    const t0 = performance.now()

    const resize = () => {
      canvas.width  = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      gl.viewport(0, 0, canvas.width, canvas.height)
    }
    resize()
    window.addEventListener('resize', resize)

    const tick = () => {
      gl.uniform1f(timeLoc, (performance.now() - t0) / 1000)
      gl.uniform2f(resLoc, canvas.width, canvas.height)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      raf = requestAnimationFrame(tick)
    }
    tick()

    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])

  return (
    <canvas
      ref={ref}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
    />
  )
}

export default function IntroAnimation() {
  const [visible, setVisible] = useState(false)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem('introShown')) return
    setVisible(true)
    const id = setTimeout(dismiss, 4000)
    return () => clearTimeout(id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function dismiss() {
    setFading(true)
    sessionStorage.setItem('introShown', 'true')
    setTimeout(() => setVisible(false), 850)
  }

  if (!visible) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: fading ? 0 : 1,
        transition: 'opacity 0.85s ease',
        pointerEvents: fading ? 'none' : 'auto',
      }}
    >
      <ShaderCanvas />

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '14px',
          userSelect: 'none',
        }}
      >
        <p
          style={{
            color: '#c9a84c',
            fontSize: '11px',
            letterSpacing: '0.45em',
            fontFamily: 'var(--font-cinzel), serif',
            opacity: 0.85,
            margin: 0,
          }}
        >
          — EST. 2003 · JAIPUR, INDIA —
        </p>

        <h1
          style={{
            color: '#ffffff',
            fontSize: 'clamp(56px, 13vw, 136px)',
            letterSpacing: '0.38em',
            fontFamily: 'var(--font-cinzel), serif',
            fontWeight: 700,
            lineHeight: 1,
            margin: 0,
            textShadow: '0 0 60px rgba(201,168,76,0.35)',
          }}
        >
          S U R Y A
        </h1>

        <h2
          style={{
            color: '#c9a84c',
            fontSize: 'clamp(16px, 3.5vw, 34px)',
            letterSpacing: '0.65em',
            fontFamily: 'var(--font-cinzel), serif',
            fontWeight: 400,
            margin: 0,
          }}
        >
          J E W E L L E R S
        </h2>

        <p
          style={{
            color: 'rgba(255,255,255,0.6)',
            fontSize: '14px',
            letterSpacing: '0.12em',
            fontFamily: '"Cormorant Garamond", var(--font-playfair), serif',
            fontStyle: 'italic',
            marginTop: '6px',
            margin: '6px 0 0',
          }}
        >
          Crafted in 92.5 Sterling Silver
        </p>
      </div>

      <button
        onClick={dismiss}
        style={{
          position: 'absolute',
          bottom: '36px',
          right: '40px',
          background: 'transparent',
          border: 'none',
          color: 'rgba(255,255,255,0.65)',
          fontSize: '11px',
          letterSpacing: '0.3em',
          fontFamily: 'var(--font-cinzel), serif',
          cursor: 'pointer',
          padding: '8px 4px',
          transition: 'color 0.2s',
        }}
        onMouseEnter={e => (e.currentTarget.style.color = '#c9a84c')}
        onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.65)')}
      >
        SKIP →
      </button>
    </div>
  )
}
