"use client"

import { useEffect, useRef, useState } from "react"
import createGlobe from "cobe"
import { cn } from "cn"

import { resolveToken } from "@/lib/resolved-color"
import { useTheme } from "@/lib/theme"

/**
 * A dotted WebGL globe that turns slowly and can be dragged. The login aside
 * uses it as an interactive backdrop, parked off the top-right corner so only
 * the upper hemisphere shows.
 *
 * cobe draws the sphere; the markers are DOM. cobe v2 publishes a CSS anchor
 * (`--cobe-<id>`) for every marker with an id, plus `--cobe-visible-<id>`
 * while that point faces the camera, so the pulse rings and status tags are
 * plain elements positioned with anchor positioning and faded out on the far
 * side. Where anchor positioning is unsupported they simply do not show; the
 * globe is unaffected.
 *
 * A marker with a `status` carries a LIVE tag above it: what is happening
 * there right now, with a count that drifts a few percent either side of its
 * base so the globe reads as realtime rather than as a map. Live is the
 * `success` ink, as it is on `StatusIcon` — in this system red means failed,
 * so a red LIVE would announce an outage. The count is `tabular-nums` so the
 * tag does not change width as the number ticks.
 *
 * WebGL takes numbers, not custom properties, so the dot, marker and glow
 * colours are resolved from the token layer on mount. `useTheme()` is a
 * dependency so switching appearance rebuilds the globe in the new ink.
 * Under `prefers-reduced-motion` it stops turning on its own but can still
 * be dragged.
 */

export type GlobeMarker = {
  id: string
  location: [number, number]
  /** Seconds before this marker's first pulse, so they do not beat in sync. */
  delay: number
  /** A LIVE tag: a count that drifts around `count`, then what it counts. */
  status?: { count: number; unit: string }
}

const DEFAULT_MARKERS: Array<GlobeMarker> = [
  {
    id: "san-francisco",
    location: [37.77, -122.42],
    delay: 1.25,
    status: { count: 1284, unit: "agents running" },
  },
  {
    id: "new-york",
    location: [40.71, -74.01],
    delay: 0.5,
    status: { count: 862, unit: "sessions syncing" },
  },
  {
    id: "london",
    location: [51.51, -0.13],
    delay: 0,
    status: { count: 614, unit: "agents running" },
  },
  {
    id: "tokyo",
    location: [35.68, 139.65],
    delay: 1,
    status: { count: 438, unit: "changes streaming" },
  },
  {
    id: "sao-paulo",
    location: [-23.55, -46.63],
    delay: 0.75,
    status: { count: 347, unit: "agents running" },
  },
  {
    id: "bengaluru",
    location: [12.97, 77.59],
    delay: 1.5,
    status: { count: 529, unit: "changes streaming" },
  },
  {
    id: "dhaka",
    location: [23.81, 90.41],
    delay: 1.75,
    status: { count: 211, unit: "sessions syncing" },
  },
]

/** How far a live count may wander from its base, as a fraction. */
const DRIFT = 0.06
const TICK_MS = 1200

/**
 * Base tilt, in radians. The login aside shows only the upper-left of the
 * disc, so this leans the pole toward the reader far enough that the 25–50°N
 * band — where most markers live — sits in the visible face, not the cropped
 * rim.
 */
const THETA = 0.55

type Rgb = [number, number, number]

function tokenRgb(name: string, fallback: Rgb): Rgb {
  const rgb = resolveToken(name)
  return rgb ? [rgb.r / 255, rgb.g / 255, rgb.b / 255] : fallback
}

function Globe({
  markers = DEFAULT_MARKERS,
  speed = 0.003,
  className,
}: {
  markers?: Array<GlobeMarker>
  /** Radians of spin per frame. */
  speed?: number
  className?: string
}) {
  const { appearance } = useTheme()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drag = useRef<{ x: number; y: number } | null>(null)
  const dragDelta = useRef({ phi: 0, theta: 0 })
  const offset = useRef({ phi: 0, theta: 0 })
  const [counts, setCounts] = useState(() =>
    markers.map((m) => m.status?.count ?? 0)
  )

  // A bounded random walk around each base count. Parked under reduced
  // motion: a number that never stops changing is motion too.
  useEffect(() => {
    setCounts(markers.map((m) => m.status?.count ?? 0))
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const id = window.setInterval(() => {
      setCounts((prev) =>
        markers.map((m, i) => {
          const base = m.status?.count ?? 0
          if (!base) return 0
          const step = Math.round(base * 0.01 * (Math.random() * 2 - 1)) || 1
          const lo = Math.round(base * (1 - DRIFT))
          const hi = Math.round(base * (1 + DRIFT))
          return Math.min(hi, Math.max(lo, (prev[i] ?? base) + step))
        })
      )
    }, TICK_MS)
    return () => window.clearInterval(id)
  }, [markers])

  // Drag is tracked on the window so releasing outside the canvas still ends
  // it; the delta commits into `offset` on release.
  useEffect(() => {
    function move(e: PointerEvent) {
      if (!drag.current) return
      dragDelta.current = {
        phi: (e.clientX - drag.current.x) / 300,
        theta: (e.clientY - drag.current.y) / 1000,
      }
    }
    function up() {
      if (!drag.current) return
      offset.current.phi += dragDelta.current.phi
      offset.current.theta += dragDelta.current.theta
      dragDelta.current = { phi: 0, theta: 0 }
      drag.current = null
      canvasRef.current?.removeAttribute("data-dragging")
    }
    window.addEventListener("pointermove", move, { passive: true })
    window.addEventListener("pointerup", up, { passive: true })
    return () => {
      window.removeEventListener("pointermove", move)
      window.removeEventListener("pointerup", up)
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const dark = appearance === "dark"
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    let globe: ReturnType<typeof createGlobe> | null = null
    let frame = 0
    let phi = 0

    function init(width: number) {
      if (!canvas || globe) return
      globe = createGlobe(canvas, {
        devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
        width,
        height: width,
        phi: 0,
        theta: THETA,
        dark: dark ? 1 : 0,
        diffuse: dark ? 1.5 : 1.2,
        mapSamples: 16000,
        mapBrightness: dark ? 8 : 4,
        baseColor: dark
          ? tokenRgb("--muted-foreground", [0.5, 0.5, 0.5])
          : tokenRgb("--card", [1, 1, 1]),
        markerColor: tokenRgb("--success", [0.3, 0.8, 0.5]),
        glowColor: tokenRgb("--surface", [0.05, 0.05, 0.05]),
        markerElevation: 0,
        markers: markers.map((m) => ({
          id: m.id,
          location: m.location,
          size: 0.025,
        })),
        opacity: dark ? 0.75 : 0.9,
      })

      const tick = () => {
        if (!drag.current && !still) phi += speed
        globe?.update({
          phi: phi + offset.current.phi + dragDelta.current.phi,
          theta: THETA + offset.current.theta + dragDelta.current.theta,
        })
        frame = requestAnimationFrame(tick)
      }
      tick()
      canvas.dataset.ready = ""
    }

    // Created at the canvas's first real size, then resized in place.
    const ro = new ResizeObserver(([entry]) => {
      const width = entry.contentRect.width
      if (width === 0) return
      if (globe) globe.update({ width, height: width })
      else init(width)
    })
    ro.observe(canvas)

    return () => {
      ro.disconnect()
      cancelAnimationFrame(frame)
      globe?.destroy()
      delete canvas.dataset.ready
    }
  }, [appearance, markers, speed])

  return (
    <div
      data-slot="globe"
      className={cn("relative aspect-square select-none", className)}
    >
      <canvas
        ref={canvasRef}
        onPointerDown={(e) => {
          drag.current = { x: e.clientX, y: e.clientY }
          e.currentTarget.dataset.dragging = ""
        }}
        className={cn(
          "size-full cursor-grab touch-none rounded-full opacity-0",
          "transition-opacity duration-1000 ease-out-strong",
          "data-dragging:cursor-grabbing data-ready:opacity-100"
        )}
      />
      {markers.map((m) => (
        <div
          key={m.id}
          aria-hidden="true"
          className="duration-slow pointer-events-none absolute flex size-10 items-center justify-center transition-[opacity,filter]"
          style={{
            positionAnchor: `--cobe-${m.id}`,
            bottom: "anchor(center)",
            left: "anchor(center)",
            translate: "-50% 50%",
            opacity: `var(--cobe-visible-${m.id}, 0)`,
            filter: `blur(calc((1 - var(--cobe-visible-${m.id}, 0)) * 8px))`,
          }}
        >
          {[0, 0.5].map((lag) => (
            <span
              key={lag}
              className="absolute inset-0 animate-pulse-ring rounded-full border-2 border-success/60 opacity-0"
              style={{ animationDelay: `${m.delay + lag}s` }}
            />
          ))}
          <span className="size-2 rounded-full bg-success ring-2 ring-success/30 ring-offset-2 ring-offset-surface" />
        </div>
      ))}
      {markers.map(
        (m, i) =>
          m.status && (
            <div
              key={`${m.id}-status`}
              data-slot="globe-status"
              className="duration-slow pointer-events-none absolute mb-3 flex items-center gap-1.5 rounded-md bg-popover py-1 pr-2 pl-1.5 whitespace-nowrap ring-1 ring-foreground/10 transition-[opacity,filter]"
              style={{
                positionAnchor: `--cobe-${m.id}`,
                bottom: "anchor(top)",
                left: "anchor(center)",
                translate: "-50% 0",
                opacity: `var(--cobe-visible-${m.id}, 0)`,
                filter: `blur(calc((1 - var(--cobe-visible-${m.id}, 0)) * 8px))`,
              }}
            >
              <span
                aria-hidden="true"
                className="size-1.5 animate-shimmer-row rounded-full bg-success"
              />
              <span className="font-mono text-4xs font-medium tracking-widest text-success uppercase">
                Live
              </span>
              <span aria-hidden="true" className="h-3 w-px bg-border" />
              <span className="text-3xs text-secondary-foreground tabular-nums">
                {counts[i].toLocaleString("en-US")} {m.status.unit}
              </span>
            </div>
          )
      )}
    </div>
  )
}

export { Globe }
