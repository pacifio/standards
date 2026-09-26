import { useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { AnimatePresence, motion } from "motion/react"

import { PageHeader } from "@/components/patterns/section-header"
import { Panel } from "@/components/patterns/panel"
import { SegmentedPills } from "@/components/patterns/segmented"
import { Specimen, TokenRow } from "@/components/gallery/specimen"
import { Button } from "@/components/ui/button"
import { Callout } from "@/components/ui/callout"
import {
  EASE_PANEL,
  PANEL_STAGGER,
  SPRING_DOCK,
  SPRING_INDICATOR,
  SPRING_PILL,
  SPRING_RAIL,
} from "@/lib/motion"

export const Route = createFileRoute("/ds/foundations/motion")({
  component: MotionFoundations,
})

const SPRINGS = [
  ["SPRING_RAIL", SPRING_RAIL, "the sidebar's width, the dock"],
  ["SPRING_DOCK", SPRING_DOCK, "the dock sliding in from the right"],
  ["SPRING_INDICATOR", SPRING_INDICATOR, "an underline or segment indicator"],
  ["SPRING_PILL", SPRING_PILL, "the active pill sliding between nav rows"],
] as const

const DURATIONS = [
  ["--duration-instant", "80ms", "a state flip you should not read as motion"],
  ["--duration-fast", "120ms", "hover and focus"],
  ["--duration-base", "180ms", "menus, popovers, tabs"],
  ["--duration-slow", "260ms", "a panel travelling a long way"],
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
  const [tab, setTab] = useState<"a" | "b" | "c">("a")
  const [wide, setWide] = useState(true)
  const [replay, setReplay] = useState(0)

  return (
    <>
      <PageHeader
        title="Motion & depth"
        description="Four springs for things that move, one ease for things that appear, and CSS durations for everything that merely changes."
      />

      <Callout tone="info">
        Springs are critically damped or close to it — stiffness in the 400s,
        damping around 40 — so nothing overshoots. They exist because a
        shared-layout pill that <em>slides</em> between rows tells you the rows
        are one list; a pill that appears in a new place tells you nothing.
      </Callout>

      <Specimen
        title="Springs"
        note="Named constants in src/lib/motion.ts, not numbers in components. Click the segments and toggle the rail to feel the two that carry the shell."
      >
        <div className="flex w-full flex-col gap-4">
          <div className="w-full">
            {SPRINGS.map(([name, spring, use]) => (
              <TokenRow key={name} name={name} value={use}>
                <span className="mono text-3xs text-muted-foreground tnum">
                  {spring.stiffness} / {spring.damping}
                </span>
              </TokenRow>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <SegmentedPills
              value={tab}
              onChange={setTab}
              options={[
                { value: "a", label: "Inbox" },
                { value: "b", label: "Timeline" },
                { value: "c", label: "Projects" },
              ]}
            />
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ width: wide ? "10rem" : "3rem" }}
                transition={SPRING_RAIL}
                className="h-7 rounded-md bg-sidebar ring-1 ring-foreground/10"
              />
              <Button
                variant="outline"
                size="xs"
                onClick={() => setWide((w) => !w)}
              >
                Toggle rail
              </Button>
            </div>
          </div>
        </div>
      </Specimen>

      <Specimen
        title="Panels stagger in"
        note="Every Panel enters with an 8px rise over 280ms on EASE_PANEL, delayed by its position on the page — PANEL_STAGGER is 0 · 50 · 100 · 150 · 200 · 250ms. The page assembles top to bottom instead of popping in whole."
      >
        <div className="flex w-full flex-col gap-3">
          <Button
            variant="outline"
            size="xs"
            onClick={() => setReplay((n) => n + 1)}
          >
            Replay
          </Button>
          <AnimatePresence mode="wait">
            <motion.div
              key={replay}
              className="grid gap-3 sm:grid-cols-3"
              initial="hidden"
              animate="show"
            >
              {PANEL_STAGGER.slice(0, 3).map((delay, i) => (
                <Panel
                  key={i}
                  delay={delay}
                  title={`Panel ${i + 1}`}
                  subtitle={`delay ${Math.round(delay * 1000)}ms`}
                >
                  <span className="caption">
                    ease {EASE_PANEL.map((n) => n.toFixed(2)).join(", ")}
                  </span>
                </Panel>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </Specimen>

      <Specimen
        title="Durations"
        note="For CSS transitions that are not layout — hover, focus, a menu opening. Hover transitions background-color and nothing else; transitioning opacity on an element containing an icon re-rasterises the glyph."
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
        title="Elevation"
        note="Rings, not shadows. A raised surface is a ring on a lighter step of the ramp. Only two things cast — a menu and a dialog — because they float over content they are not part of. The ratchet fails any other shadow step in a component."
      >
        <div className="flex gap-4">
          <div className="flex flex-col items-center gap-2">
            <div className="size-20 rounded-xl bg-card ring-1 ring-foreground/10" />
            <span className="caption">ring · raised</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="size-20 rounded-lg bg-popover shadow-md ring-1 ring-foreground/10" />
            <span className="caption">shadow-md · menus</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="size-20 rounded-xl bg-popover shadow-lg ring-1 ring-foreground/10" />
            <span className="caption">shadow-lg · dialogs</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="size-20 rounded-xl ring-1 ring-foreground/10 glass" />
            <span className="caption">.glass · the topbar</span>
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
                style={{ width: `${(Number(value) / 500) * 100}%` }}
              />
            </TokenRow>
          ))}
        </div>
      </Specimen>
    </>
  )
}
