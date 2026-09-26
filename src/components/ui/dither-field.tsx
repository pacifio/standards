"use client"

import { useEffect, useRef } from "react"
import { cn } from "cn"

import { resolveToken, rgbString } from "@/lib/resolved-color"
import { useTheme } from "@/lib/theme"

/**
 * A retro ordered-dither noise field that drifts like slow cloud cover.
 *
 * Ported from the Atlas desktop app's `src/ui/dither-field.tsx`, which the
 * landing site's hero backdrop was in turn ported from — so the login pane,
 * the marketing hero and the app's own empty states all print the same
 * field. The constants below are the landing page's, kept to the value:
 * alpha 0.3 for glyphs and 0.16 for dots, a 12px cell, ~12fps.
 *
 * Two modes over one field. `glyphs` prints a character per 12px cell whose
 * weight tracks the intensity — the ASCII variant the hero uses. `dots`
 * prints 1.5px dots on a 4px grid.
 *
 * Canvas, not DOM: the field is tens of thousands of cells, and that many
 * elements would cost more to lay out than the page they decorate.
 *
 * Stepped at ~12fps on purpose. Ordered dither reads as retro precisely
 * because it snaps; tweened at 60fps it is just noise, and a backdrop does
 * not get a 60fps budget. The loop parks while the tab is hidden, while the
 * element is off screen, and entirely under `prefers-reduced-motion` — which
 * still paints one frame, because the texture is the point and only the
 * drift is the accessibility problem.
 *
 * A 4×4 Bayer matrix turns intensity into density, and a radial hollow keeps
 * the middle calm so copy can sit on the quiet part.
 *
 * The ink is the theme's resolved `--foreground`, read from computed style
 * rather than passed as `var(--foreground)`: a canvas cannot resolve a custom
 * property. `useTheme()` is a dependency so flipping the appearance tears the
 * loop down and repaints in the new ink instead of leaving white glyphs on a
 * white page.
 */

const GLYPHS = " .·:-=+*#"

const BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
]

/** ~12fps. See the note above about why this is not 60. */
const FRAME_MS = 80

type DitherFieldProps = {
  mode?: "dots" | "glyphs"
  /**
   * `[start, span]` of the radial hollow as fractions of the half-diagonal:
   * nothing prints inside `start`, full density from `start + span` out.
   */
  hollow?: [number, number]
  /** Multiplier on the ink alpha. `1` is the landing page's own value. */
  ink?: number
  className?: string
}

/**
 * `ctx.fillStyle` takes a colour STRING and cannot read a custom property,
 * so the ink is resolved off computed style through the canvas probe in
 * lib/resolved-color — which understands oklch(), unlike a hex regex.
 */
function inkAt(alpha: number): string {
  const rgb = resolveToken("--foreground")
  return rgb ? rgbString(rgb, alpha) : `rgb(255 255 255 / ${alpha})` // ratchet-allow: SSR fallback before computed style exists on the client
}

function DitherField({
  mode = "glyphs",
  hollow,
  ink = 1,
  className,
}: DitherFieldProps) {
  const ref = useRef<HTMLCanvasElement>(null)
  const hollowStart = hollow?.[0]
  const hollowSpan = hollow?.[1]
  const { appearance } = useTheme()

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches
    const CELL = mode === "glyphs" ? 12 : 4
    const [h0, h1] =
      hollowStart != null && hollowSpan != null
        ? [hollowStart, hollowSpan]
        : mode === "glyphs"
          ? [0.34, 0.5]
          : [0.22, 0.55]

    let raf = 0
    let last = 0
    let visible = document.visibilityState === "visible"
    let onScreen = true

    // Two octaves of value noise plus a slow third, so shapes morph rather
    // than only translate.
    const noiseAt = (x: number, y: number, phase: number) => {
      const a = Math.sin(x * 0.012 + Math.sin(y * 0.009 + phase) * 2.1)
      const b = Math.sin(y * 0.011 - Math.cos(x * 0.007 - phase) * 1.7)
      const c = Math.sin((x + y) * 0.004 + 1.3 + phase * 2)
      return (a + b + c) / 3 // -1..1
    }

    const draw = (t: number) => {
      const parent = canvas.parentElement
      if (!parent) return
      const w = parent.clientWidth
      const h = parent.clientHeight
      if (!w || !h) return

      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const bw = Math.ceil(w * dpr)
      const bh = Math.ceil(h * dpr)
      if (canvas.width !== bw || canvas.height !== bh) {
        canvas.width = bw
        canvas.height = bh
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)

      // Wind: mostly sideways, a little lift, plus a slow phase evolution.
      const wx = t * 0.012
      const wy = t * 0.003
      const phase = t * 0.0004
      const cx = w / 2
      const cy = h / 2
      const maxR = Math.hypot(cx, cy)

      const alpha = Math.min(1, (mode === "glyphs" ? 0.3 : 0.16) * ink)
      ctx.fillStyle = inkAt(alpha)
      if (mode === "glyphs") {
        ctx.font = "11px ui-monospace, SFMono-Regular, Menlo, monospace"
        ctx.textBaseline = "top"
      }

      for (let gy = 0; gy < h / CELL; gy++) {
        for (let gx = 0; gx < w / CELL; gx++) {
          const x = gx * CELL
          const y = gy * CELL
          let v = (noiseAt(x + wx, y + wy, phase) + 1) / 2
          const r = Math.hypot(x - cx, y - cy) / maxR
          v *= Math.min(1, Math.max(0, (r - h0) / h1))
          if (mode === "glyphs") {
            const i = Math.min(
              GLYPHS.length - 1,
              Math.floor(v * v * GLYPHS.length)
            )
            if (i > 0 && v * 16 > BAYER[gy % 4][gx % 4] * 0.6) {
              ctx.fillText(GLYPHS[i], x, y)
            }
          } else if (v * 16 > BAYER[gy % 4][gx % 4]) {
            ctx.fillRect(x, y, 1.5, 1.5)
          }
        }
      }
    }

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick)
      // Step gate: repaint only once a frame's worth of drift has accrued.
      if (now - last < FRAME_MS) return
      last = now
      draw(now)
    }
    const start = () => {
      if (!raf && visible && onScreen && !reduced)
        raf = requestAnimationFrame(tick)
    }
    const stop = () => {
      if (raf) cancelAnimationFrame(raf)
      raf = 0
    }
    const onVisibility = () => {
      visible = document.visibilityState === "visible"
      if (visible) start()
      else stop()
    }

    // One frame always paints, including under reduced motion: the texture is
    // the design, only the drift is the accessibility problem.
    draw(0)
    document.addEventListener("visibilitychange", onVisibility)
    const io = new IntersectionObserver(
      (entries) => {
        onScreen = entries.some((e) => e.isIntersecting)
        if (onScreen) start()
        else stop()
      },
      { rootMargin: "80px" }
    )
    io.observe(canvas)
    const parent = canvas.parentElement
    const ro = new ResizeObserver(() => draw(last))
    if (parent) ro.observe(parent)
    start()

    return () => {
      stop()
      document.removeEventListener("visibilitychange", onVisibility)
      io.disconnect()
      ro.disconnect()
    }
  }, [mode, hollowStart, hollowSpan, ink, appearance])

  return (
    <canvas
      data-slot="dither-field"
      ref={ref}
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full",
        className
      )}
    />
  )
}

export { DitherField }
