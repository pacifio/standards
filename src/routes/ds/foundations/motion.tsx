import { createFileRoute } from "@tanstack/react-router"

import { PageHeader } from "@/components/patterns/section-header"
import { Specimen, TokenRow } from "@/components/gallery/specimen"
import { Callout } from "@/components/ui/callout"

export const Route = createFileRoute("/ds/foundations/motion")({
  component: MotionFoundations,
})

const DURATIONS = [
  ["--duration-instant", "80ms", "a state flip you should not read as motion"],
  ["--duration-fast", "120ms", "hover and focus"],
  ["--duration-base", "180ms", "menus, popovers, tabs"],
  ["--duration-slow", "260ms", "a panel travelling a long way"],
] as const

const EASINGS = [
  [
    "--ease-out-strong",
    "cubic-bezier(.23, 1, .32, 1)",
    "entrances — the default",
  ],
  [
    "--ease-in-out-strong",
    "cubic-bezier(.77, 0, .175, 1)",
    "two-way state changes",
  ],
  ["--ease-drawer", "cubic-bezier(.32, .72, 0, 1)", "panels and drawers"],
] as const

const LAYERS = [
  ["--z-panel", "10"],
  ["--z-titlebar", "40"],
  ["--z-drawer", "60"],
  ["--z-overlay", "100"],
  ["--z-modal", "110"],
  ["--z-popover", "200"],
  ["--z-toast", "300"],
  ["--z-tooltip", "400"],
  ["--z-drag", "500"],
] as const

function MotionFoundations() {
  return (
    <>
      <PageHeader
        title="Motion & depth"
        description="Three curves, four durations, three elevation rungs, nine named layers."
      />

      <Callout tone="info">
        No springs and no overshoot. A bounce reads as personality the first
        time and as latency the two-hundredth, and this is a tool people have
        open all day.
      </Callout>

      <Specimen
        title="Durations"
        note="Hover transitions background-color and nothing else. Transitioning colour or opacity on an element containing an icon makes the glyph re-rasterise, which reads as a flicker."
      >
        <div className="w-full">
          {DURATIONS.map(([token, ms, use]) => (
            <TokenRow key={token} name={token} value={use}>
              <span className="text-xs tnum">{ms}</span>
            </TokenRow>
          ))}
        </div>
      </Specimen>

      <Specimen
        title="Easings"
        note="These are the only three curves allowed. Hover one of the cards below to see the default entrance curve on a background-colour change."
      >
        <div className="w-full">
          {EASINGS.map(([token, curve, use]) => (
            <TokenRow key={token} name={token} value={use}>
              <span className="mono text-3xs text-muted-foreground">
                {curve}
              </span>
            </TokenRow>
          ))}
        </div>
      </Specimen>

      <Specimen
        title="Elevation"
        note="Three rungs, and they must read as three. A shadow means the surface is floating above the page; everything anchored to the page is separated by a border instead."
      >
        <div className="flex gap-4">
          <div className="flex flex-col items-center gap-2">
            <div className="size-20 rounded-md border border-border bg-card shadow-sm" />
            <span className="caption">shadow-sm · raised</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="size-20 rounded-lg border border-border bg-popover shadow-md" />
            <span className="caption">shadow-md · menus</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="size-20 rounded-xl border border-border bg-card shadow-lg" />
            <span className="caption">shadow-lg · dialogs</span>
          </div>
        </div>
      </Specimen>

      <Specimen
        title="Z-layers"
        note="Nothing outside the token layer writes a z-index. `popover` sits above `modal` on purpose — a menu opened inside a dialog must escape it, or it renders clipped behind the surface that opened it."
      >
        <div className="w-full">
          {LAYERS.map(([token, value]) => (
            <TokenRow key={token} name={token} value={value}>
              <span
                className="h-1.5 rounded-full bg-element-emphasis"
                style={{ width: `${(Number(value) / 500) * 100}px` }}
              />
            </TokenRow>
          ))}
        </div>
      </Specimen>
    </>
  )
}
