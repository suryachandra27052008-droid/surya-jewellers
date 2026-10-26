"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"

const vertexShader = `
  void main() {
    gl_Position = vec4(position, 1.0);
  }
`

const fragmentShader = `
  #define TWO_PI 6.2831853072
  #define PI 3.14159265359

  precision highp float;
  uniform vec2 resolution;
  uniform float time;

  float random(in float x) {
    return fract(sin(x) * 1e4);
  }

  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
  }

  void main(void) {
    vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);
    vec2 mosaicScale = vec2(4.0, 2.0);
    vec2 screenSize = vec2(256.0, 256.0);
    uv.x = floor(uv.x * screenSize.x / mosaicScale.x) / (screenSize.x / mosaicScale.x);
    uv.y = floor(uv.y * screenSize.y / mosaicScale.y) / (screenSize.y / mosaicScale.y);

    float t = time * 0.06 + random(uv.x) * 0.4;
    float lineWidth = 0.0008;
    vec3 color = vec3(0.0);

    for (int line = 0; line < 5; line++) {
      float strength = lineWidth * float(line * line);
      float offset = float(line) * 0.01;
      color.r += strength / abs(fract(t + offset) - length(uv));
      color.g += strength / abs(fract(t - 0.01 + offset) - length(uv));
      color.b += strength / abs(fract(t - 0.02 + offset) - length(uv));
    }

    gl_FragColor = vec4(color[2], color[1], color[0], 1.0);
  }
`

export function ShaderAnimation() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const camera = new THREE.Camera()
    camera.position.z = 1

    const scene = new THREE.Scene()
    const geometry = new THREE.PlaneGeometry(2, 2)
    const uniforms = {
      time: { value: 1.0 },
      resolution: { value: new THREE.Vector2() },
    }
    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
    })
    scene.add(new THREE.Mesh(geometry, material))

    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false })
    const mobile = window.matchMedia('(max-width: 768px), (pointer: coarse)').matches
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1 : 1.5))
    container.replaceChildren(renderer.domElement)

    const resize = () => {
      const { width, height } = container.getBoundingClientRect()
      renderer.setSize(width, height, false)
      uniforms.resolution.value.set(renderer.domElement.width, renderer.domElement.height)
    }

    let animationId = 0
    let lastFrame = 0
    const frameInterval = 1000 / (mobile ? 30 : 60)
    const animate = (now: number) => {
      if (document.hidden) return
      if (now - lastFrame >= frameInterval) {
        uniforms.time.value += Math.min(now - lastFrame, 100) * 0.003
        lastFrame = now
        renderer.render(scene, camera)
      }
      animationId = window.requestAnimationFrame(animate)
    }
    const onVisibilityChange = () => {
      window.cancelAnimationFrame(animationId)
      lastFrame = performance.now()
      if (!document.hidden) animationId = window.requestAnimationFrame(animate)
    }

    resize()
    animationId = window.requestAnimationFrame(animate)
    window.addEventListener("resize", resize, { passive: true })
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      window.cancelAnimationFrame(animationId)
      window.removeEventListener("resize", resize)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      geometry.dispose()
      material.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [])

  return <div ref={containerRef} className="absolute h-full w-full" />
}
