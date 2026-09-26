"use client"

import { memo, useEffect, useMemo, useRef } from "react"
import type { RefObject } from "react"
import * as THREE from "three"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { useTexture } from "@react-three/drei"

import { resolveToken } from "@/lib/resolved-color"
import { useTheme } from "@/lib/theme"

/**
 * A full-bleed image rendered through a shader that FORCES it monochrome.
 * natai's `reveal-wave-image`, typed and made theme-aware.
 *
 * Per fragment: a sine-wave UV distortion plus a mouse-following ripple,
 * then greyscale, then a 4×4 Bayer ordered dither quantised to exactly
 * three levels. The base state is a halftone, near-1-bit image in the
 * theme's own ink and paper. Inside a soft circular spotlight that follows
 * the cursor, the full-colour texture mixes back in.
 *
 * Mouse state lives in a ref and is eased in `useFrame`, so the pointer
 * never causes a React render. The canvas has pointer events disabled so it
 * never steals them from the page. `uInk`/`uPaper` are resolved from the
 * theme tokens through the canvas probe, and re-resolved on theme change;
 * `uInk` is always the darker of the two so brightness reads the same way
 * in both appearances.
 */

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = /* glsl */ `
  precision highp float;

  uniform sampler2D uTexture;
  uniform sampler2D uHoverTexture;
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uRevealRadius;
  uniform float uRevealSoftness;
  uniform float uPixelSize;
  uniform float uMouseActive;
  uniform float uWaveSpeed;
  uniform float uWaveFrequency;
  uniform float uWaveAmplitude;
  uniform float uMouseRadius;
  uniform vec2 uUvScale;
  uniform vec2 uUvOffset;
  uniform vec3 uInk;
  uniform vec3 uPaper;

  varying vec2 vUv;

  float bayer4x4(vec2 pos) {
    int x = int(mod(pos.x, 4.0));
    int y = int(mod(pos.y, 4.0));
    int index = x + y * 4;
    float pattern[16];
    pattern[0]  = 0.0;  pattern[1]  = 8.0;  pattern[2]  = 2.0;  pattern[3]  = 10.0;
    pattern[4]  = 12.0; pattern[5]  = 4.0;  pattern[6]  = 14.0; pattern[7]  = 6.0;
    pattern[8]  = 3.0;  pattern[9]  = 11.0; pattern[10] = 1.0;  pattern[11] = 9.0;
    pattern[12] = 15.0; pattern[13] = 7.0;  pattern[14] = 13.0; pattern[15] = 5.0;
    for (int i = 0; i < 16; i++) {
      if (i == index) return pattern[i] / 16.0;
    }
    return 0.0;
  }

  void main() {
    vec2 uv = vUv;
    vec2 texUv = vUv * uUvScale + uUvOffset;

    float waveStrength = uWaveAmplitude * 0.1;
    float wave1 = sin(texUv.y * uWaveFrequency + uTime * uWaveSpeed) * waveStrength;
    float wave2 = sin(texUv.x * uWaveFrequency * 0.7 + uTime * uWaveSpeed * 0.8) * waveStrength * 0.5;

    vec2 distortedUv = texUv;
    distortedUv.x += wave1;
    distortedUv.y += wave2;

    if (uMouseActive > 0.01) {
      float dist = distance(uv, uMouse);
      float mouseInfluence = smoothstep(uMouseRadius, 0.0, dist);
      float ripple = sin(dist * uWaveFrequency * 5.0 - uTime * uWaveSpeed)
                     * uWaveAmplitude * 0.05 * mouseInfluence * uMouseActive;
      distortedUv.x += ripple;
      distortedUv.y += ripple;
    }

    vec4 color      = texture2D(uTexture,      distortedUv);
    vec4 hoverColor = texture2D(uHoverTexture, distortedUv);

    float gray       = dot(color.rgb, vec3(0.299, 0.587, 0.114));
    vec2  pixelCoord = floor(gl_FragCoord.xy / uPixelSize);
    float dither     = bayer4x4(pixelCoord);
    float adjusted   = gray + (dither - 0.5) * 0.5;

    float quantized;
    if      (adjusted < 0.33) quantized = 0.0;
    else if (adjusted < 0.66) quantized = 0.5;
    else                      quantized = 1.0;

    float revealDist   = distance(uv, uMouse);
    float innerRadius  = uRevealRadius * (1.0 - uRevealSoftness);
    float revealAmount = (1.0 - smoothstep(innerRadius, uRevealRadius, revealDist)) * uMouseActive;

    // Three levels from the theme's darker token toward its lighter one.
    // On dark that is natai's black-to-mid-grey; on light it is the same
    // image printed dark-on-paper rather than a negative.
    vec3 mono = mix(uInk, uPaper, 0.5 + quantized * 0.5);
    vec3 finalColor = mix(mono, hoverColor.rgb, revealAmount);
    gl_FragColor = vec4(finalColor, color.a);
  }
`

type MouseState = { x: number; y: number; active: number }

function tokenToColor(name: string, fallback: THREE.Color): THREE.Color {
  const rgb = resolveToken(name)
  return rgb ? new THREE.Color(rgb.r / 255, rgb.g / 255, rgb.b / 255) : fallback
}

type ImagePlaneProps = {
  src: string
  hoverSrc: string
  mouseRef: RefObject<MouseState>
  revealRadius: number
  revealSoftness: number
  pixelSize: number
  waveSpeed: number
  waveFrequency: number
  waveAmplitude: number
  mouseRadius: number
  themeKey: string
}

const ImagePlane = memo(function ImagePlane({
  src,
  hoverSrc,
  mouseRef,
  revealRadius,
  revealSoftness,
  pixelSize,
  waveSpeed,
  waveFrequency,
  waveAmplitude,
  mouseRadius,
  themeKey,
}: ImagePlaneProps) {
  const texture = useTexture(src)
  const hoverTexture = useTexture(hoverSrc)
  const { viewport, size } = useThree()
  const meshRef = useRef<THREE.Mesh>(null)
  const activeRef = useRef(0)

  useEffect(() => {
    for (const t of [texture, hoverTexture]) {
      t.minFilter = THREE.LinearFilter
      t.magFilter = THREE.LinearFilter
    }
  }, [texture, hoverTexture])

  const uniforms = useMemo(
    () => ({
      uTexture: { value: texture },
      uHoverTexture: { value: hoverTexture },
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(-10, -10) },
      uRevealRadius: { value: revealRadius },
      uRevealSoftness: { value: revealSoftness },
      uPixelSize: { value: pixelSize },
      uMouseActive: { value: 0 },
      uWaveSpeed: { value: waveSpeed },
      uWaveFrequency: { value: waveFrequency },
      uWaveAmplitude: { value: waveAmplitude },
      uMouseRadius: { value: mouseRadius },
      uUvScale: { value: new THREE.Vector2(1, 1) },
      uUvOffset: { value: new THREE.Vector2(0, 0) },
      uInk: { value: new THREE.Color(1, 1, 1) },
      uPaper: { value: new THREE.Color(0, 0, 0) },
    }),
    // Uniforms are created once; live values are written in useFrame/effects.
    []
  )

  // Ink and paper follow the theme. Re-resolved whenever the appearance
  // flips, which is what `themeKey` is for.
  useEffect(() => {
    const fg = tokenToColor("--foreground", new THREE.Color(1, 1, 1))
    const bg = tokenToColor("--background", new THREE.Color(0, 0, 0))
    const lum = (c: THREE.Color) => 0.299 * c.r + 0.587 * c.g + 0.114 * c.b
    const [dark, light] = lum(fg) < lum(bg) ? [fg, bg] : [bg, fg]
    uniforms.uInk.value.copy(dark)
    uniforms.uPaper.value.copy(light)
  }, [uniforms, themeKey])

  // Aspect-fit the texture like `object-fit: cover`.
  useEffect(() => {
    const img = texture.image as { width: number; height: number } | undefined
    if (!img) return
    const imageAspect = img.width / img.height
    const containerAspect = size.width / size.height
    let scaleX = 1
    let scaleY = 1
    if (containerAspect > imageAspect) scaleY = imageAspect / containerAspect
    else scaleX = containerAspect / imageAspect
    uniforms.uUvScale.value.set(scaleX, scaleY)
    uniforms.uUvOffset.value.set((1 - scaleX) / 2, (1 - scaleY) / 2)
  }, [texture, size.width, size.height, uniforms])

  const scale = useMemo<[number, number, number]>(
    () => [viewport.width, viewport.height, 1],
    [viewport.width, viewport.height]
  )

  useFrame((state) => {
    const mesh = meshRef.current
    if (!mesh) return
    const mat = mesh.material as THREE.ShaderMaterial
    mat.uniforms.uTime.value = state.clock.elapsedTime
    activeRef.current += (mouseRef.current.active - activeRef.current) * 0.08
    mat.uniforms.uMouseActive.value = activeRef.current
    mat.uniforms.uMouse.value.set(mouseRef.current.x, mouseRef.current.y)
  })

  return (
    <mesh ref={meshRef} scale={scale}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  )
})

export type RevealWaveImageProps = {
  src: string
  hoverSrc?: string
  revealRadius?: number
  revealSoftness?: number
  pixelSize?: number
  waveSpeed?: number
  waveFrequency?: number
  waveAmplitude?: number
  mouseRadius?: number
  className?: string
}

const RevealWaveImage = memo(function RevealWaveImage({
  src,
  hoverSrc,
  revealRadius = 0.2,
  revealSoftness = 0.5,
  pixelSize = 3,
  waveSpeed = 0.5,
  waveFrequency = 3.0,
  waveAmplitude = 0.2,
  mouseRadius = 0.2,
  className = "h-full w-full",
}: RevealWaveImageProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mouseRef = useRef<MouseState>({ x: -10, y: -10, active: 0 })
  const { appearance } = useTheme()

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const updatePos = (e: MouseEvent | PointerEvent) => {
      const rect = el.getBoundingClientRect()
      mouseRef.current.x = (e.clientX - rect.left) / rect.width
      mouseRef.current.y = 1 - (e.clientY - rect.top) / rect.height
    }
    const onMove = (e: MouseEvent) => updatePos(e)
    const onEnter = (e: MouseEvent) => {
      updatePos(e)
      mouseRef.current.active = 1
    }
    const onLeave = () => {
      mouseRef.current.active = 0
      mouseRef.current.x = -10
      mouseRef.current.y = -10
    }
    // If the pointer is already over us when we mount, pick it up without
    // waiting for it to leave and re-enter.
    const captureInitial = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect()
      const inside =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      if (inside) {
        updatePos(e)
        mouseRef.current.active = 1
      }
    }

    el.addEventListener("mousemove", onMove, { passive: true })
    el.addEventListener("mouseenter", onEnter, { passive: true })
    el.addEventListener("mouseleave", onLeave, { passive: true })
    window.addEventListener("pointermove", captureInitial, {
      passive: true,
      once: true,
    })
    return () => {
      el.removeEventListener("mousemove", onMove)
      el.removeEventListener("mouseenter", onEnter)
      el.removeEventListener("mouseleave", onLeave)
      window.removeEventListener("pointermove", captureInitial)
    }
  }, [])

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <Canvas
        style={{ width: "100%", height: "100%", display: "block" }}
        gl={{ antialias: false, powerPreference: "high-performance" }}
        camera={{ position: [0, 0, 1], near: 0.1, far: 10 }}
        frameloop="always"
        // No handlers on the mesh, so the canvas never has to own pointer
        // events; the DOM listeners above do the tracking.
        eventSource={undefined}
      >
        <ImagePlane
          src={src}
          hoverSrc={hoverSrc ?? src}
          mouseRef={mouseRef}
          revealRadius={revealRadius}
          revealSoftness={revealSoftness}
          pixelSize={pixelSize}
          waveSpeed={waveSpeed}
          waveFrequency={waveFrequency}
          waveAmplitude={waveAmplitude}
          mouseRadius={mouseRadius}
          themeKey={appearance}
        />
      </Canvas>
    </div>
  )
})

export { RevealWaveImage }
