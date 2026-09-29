"use client"

import { Children, useRef } from "react"
import { cn } from "cn"

/**
 * Overlapping faces that spring when you move across them, on the
 * `--avatar-*` tokens.
 *
 * On entering a face, every face gets a lift of `lift × falloff^distance`
 * and the hovered one a small scale, so the row ripples outward from the
 * pointer. The timing function is written BEFORE the variables, so the lift
 * uses `--avatar-ease-in` (clean) and the return `--avatar-ease-out` (a
 * bouncy spring). The numbers live in tokens.css and the transition in the
 * `avatar-spring` utility; this component only writes per-item variables,
 * straight to the DOM, so hovering costs no React render.
 *
 * Bring your own faces: pass `<Avatar>`s (and a trailing count) as
 * children. Each is wrapped, and the wrapper — not the avatar — carries the
 * ring that separates overlapping faces.
 */
function AvatarStack({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  const root = useRef<HTMLDivElement>(null)

  function spring(active: number | null) {
    const el = root.current
    if (!el) return
    const cs = getComputedStyle(document.documentElement)
    const num = (name: string, fallback: number) => {
      const v = parseFloat(cs.getPropertyValue(name))
      return Number.isFinite(v) ? v : fallback
    }
    const lift = num("--avatar-lift", -4)
    const falloff = num("--avatar-falloff", 0.45)
    const scale = num("--avatar-scale", 1.05)
    const ease =
      cs
        .getPropertyValue(
          active === null ? "--avatar-ease-out" : "--avatar-ease-in"
        )
        .trim() || "ease-out"

    el.querySelectorAll<HTMLElement>("[data-avatar-spring]").forEach(
      (item, i) => {
        item.style.transitionTimingFunction = ease
        if (active === null) {
          item.style.setProperty("--shift", "0px")
          item.style.setProperty("--scale-active", "1")
          return
        }
        const d = Math.abs(i - active)
        item.style.setProperty(
          "--shift",
          `${(lift * Math.pow(falloff, d)).toFixed(3)}px`
        )
        item.style.setProperty(
          "--scale-active",
          i === active ? `${scale}` : "1"
        )
      }
    )
  }

  return (
    <div
      ref={root}
      data-slot="avatar-stack"
      onMouseLeave={() => spring(null)}
      className={cn("flex items-center -space-x-2", className)}
    >
      {Children.toArray(children).map((child, i) => (
        <div
          key={i}
          data-avatar-spring=""
          onMouseEnter={() => spring(i)}
          className="relative avatar-spring rounded-full ring-2 ring-card"
        >
          {child}
        </div>
      ))}
    </div>
  )
}

export { AvatarStack }
