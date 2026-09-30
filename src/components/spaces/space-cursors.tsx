"use client"

import { useEffect, useRef } from "react"
import { MousePointer2 } from "lucide-react"
import { cn } from "cn"

import type { LabelTone } from "@/mock/types"
import { HUES, hueFor } from "@/lib/hue"
import type { Viewport } from "@/components/spaces/space-canvas"

/**
 * The people on a Space besides you, and the cursors they leave on it.
 *
 * In the desktop app a peer's cursor arrives over the wire at ~20Hz and is
 * interpolated toward each new target. The mock has no wire, so each peer
 * rides a slow Lissajous loop around the page's content instead — smooth by
 * construction, and it never settles, which is what a room with somebody in
 * it looks like.
 */

export type SpacePeer = {
  id: string
  name: string
  image?: string
  hue: LabelTone
}

/**
 * Per-hue classes, spelled out so Tailwind can see them. A peer's colour is
 * an identity (the `--hue-*` ramp), never a status ink.
 */
export const PEER_INK: Record<
  LabelTone,
  { text: string; bg: string; ring: string }
> = {
  grey: { text: "text-hue-grey", bg: "bg-hue-grey", ring: "ring-hue-grey" },
  indigo: {
    text: "text-hue-indigo",
    bg: "bg-hue-indigo",
    ring: "ring-hue-indigo",
  },
  purple: {
    text: "text-hue-purple",
    bg: "bg-hue-purple",
    ring: "ring-hue-purple",
  },
  cyan: { text: "text-hue-cyan", bg: "bg-hue-cyan", ring: "ring-hue-cyan" },
  green: {
    text: "text-hue-green",
    bg: "bg-hue-green",
    ring: "ring-hue-green",
  },
  amber: {
    text: "text-hue-amber",
    bg: "bg-hue-amber",
    ring: "ring-hue-amber",
  },
  orange: {
    text: "text-hue-orange",
    bg: "bg-hue-orange",
    ring: "ring-hue-orange",
  },
  red: { text: "text-hue-red", bg: "bg-hue-red", ring: "ring-hue-red" },
}

/**
 * Hues for a list of peers. The first keeps its stable `hueFor` colour;
 * the rest step three places round the wheel from it, so two people in one
 * room never get neighbours like amber and orange. Grey is skipped — on a
 * cursor it reads as "disabled", not as a person.
 */
export function peerHues(ids: ReadonlyArray<string>): Array<LabelTone> {
  const wheel: Array<LabelTone> = HUES.filter((h) => h !== "grey")
  if (ids.length === 0) return []
  const start = Math.max(0, wheel.indexOf(hueFor(ids[0])))
  return ids.map((_, i) => wheel[(start + i * 3) % wheel.length])
}

/** The content's box in canvas px; peers loop around inside it. */
export type Bounds = { x: number; y: number; w: number; h: number }

/**
 * Where peer `i` is at time `t` (seconds), in canvas px. Two incommensurate
 * frequencies per axis make a loop that takes minutes to repeat visibly.
 */
function pathAt(i: number, t: number, b: Bounds) {
  const cx = b.x + b.w / 2
  const cy = b.y + b.h / 2
  const rx = Math.max(b.w / 2, 160) * 0.9
  const ry = Math.max(b.h / 2, 120) * 0.9
  const s = 0.11 + i * 0.037
  return {
    x: cx + rx * Math.sin(t * s * 1.7 + i * 2.1) * Math.cos(t * s * 0.6),
    y: cy + ry * Math.sin(t * s * 1.1 + i * 1.3 + 0.8),
  }
}

/**
 * The cursors layer, over the canvas but outside its scaled layer: a peer's
 * position is in canvas coordinates, projected through the live viewport
 * every frame, so it pans and zooms with the content while the arrow and
 * name pill stay the same size at any zoom.
 *
 * Position is written imperatively from one rAF loop — React owns which
 * cursors exist, never where they are. A 60Hz setState per cursor would
 * re-render the canvas for nothing.
 */
function SpaceCursors({
  peers,
  viewportRef,
  boundsRef,
}: {
  peers: ReadonlyArray<SpacePeer>
  viewportRef: React.RefObject<Viewport>
  boundsRef: React.RefObject<Bounds>
}) {
  const els = useRef<Array<HTMLDivElement | null>>([])

  useEffect(() => {
    let raf = 0
    const tick = (now: number) => {
      const v = viewportRef.current
      const b = boundsRef.current
      els.current.forEach((el, i) => {
        if (!el) return
        const p = pathAt(i, now / 1000, b)
        el.style.transform = `translate3d(${v.x + p.x * v.zoom}px, ${v.y + p.y * v.zoom}px, 0)`
        el.style.visibility = "visible"
      })
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [viewportRef, boundsRef])

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {peers.map((peer, i) => (
        <div
          key={peer.id}
          ref={(el) => {
            els.current[i] = el
          }}
          // Hidden until the first frame has placed it, so it never flashes
          // at the layer's origin (and the server render draws nothing).
          className="invisible absolute top-0 left-0 will-change-transform"
        >
          <MousePointer2
            className={cn("size-4", PEER_INK[peer.hue].text)}
            fill="currentColor"
            strokeWidth={1.5}
          />
          <span
            className={cn(
              "mt-0.5 ml-3 block max-w-36 truncate rounded-full px-1.5 py-0.5",
              "text-3xs leading-none font-medium text-background",
              PEER_INK[peer.hue].bg
            )}
          >
            {peer.name.split(" ")[0]}
          </span>
        </div>
      ))}
    </div>
  )
}

export { SpaceCursors }
