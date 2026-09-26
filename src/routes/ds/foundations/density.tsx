import { createFileRoute } from "@tanstack/react-router"

import { PageHeader } from "@/components/patterns/section-header"
import { Sample, Specimen, TokenRow } from "@/components/gallery/specimen"
import { Panel } from "@/components/patterns/panel"
import { Button } from "@/components/ui/button"
import { Callout } from "@/components/ui/callout"
import { Input } from "@/components/ui/input"
import { Kbd } from "@/components/ui/kbd"
import { Tag } from "@/components/ui/tag"
import { UI_SCALE_MAX, UI_SCALE_MIN, useUiScale } from "@/lib/ui-scale"

export const Route = createFileRoute("/ds/foundations/density")({
  component: DensityFoundations,
})

const CONTROLS = [
  ["--control-xs", "h-5", "20px", "a pill, a keycap, an inline chip"],
  ["--control-sm", "h-6", "24px", "a control inside a row or a cell"],
  ["--control-md", "h-7", "28px", "the default — toolbars, rows, menus"],
  ["--control-lg", "h-8", "32px", "a form field with its own label"],
  ["--control-xl", "h-9", "36px", "a primary action on an empty page"],
] as const

const RADII = [
  ["rounded-sm", "0.25rem", "a kbd, a swatch"],
  ["rounded-md", "0.375rem", "nav rows, menu items"],
  ["rounded-lg", "0.5rem", "the target box inside a block"],
  ["rounded-xl", "0.75rem", "Panel, KpiStrip, DataTable, dialogs"],
  ["rounded-2xl", "1rem", "an illustration card"],
  ["rounded-full", "∞", "every button, pill, tag and filter"],
] as const

const LAYOUT = [
  ["--sidebar-width", "14rem", "224px"],
  ["--sidebar-width-collapsed", "3.25rem", "52px"],
  ["--topbar-height", "2.75rem", "44px"],
  ["--dock-width", "23.75rem", "380px"],
] as const

function DensityFoundations() {
  const { scale, setScale, reset } = useUiScale()

  return (
    <>
      <PageHeader
        title="Density"
        description="A rem grid on a 16px root, five control heights, six radii — and one multiplier that grows all of it."
      />

      <Callout tone="info">
        The root is <code className="code">calc(16px * var(--ui-scale))</code>{" "}
        and <code className="code">--spacing</code> is Tailwind&apos;s{" "}
        <code className="code">0.25rem</code>. At scale 1 every value below is
        an integer; at 1.15 the layout goes fractional while hairlines stay 1px,
        which is the same trade the reference ships. The alternative —{" "}
        <code className="code">zoom</code> on the root — breaks shared-layout
        measurements and popover positioning.
      </Callout>

      <Specimen
        title="Interface scale"
        note="This is the answer to 'the rows are too tight'. Drag it and watch every specimen on this page, the sidebar and the topbar grow together. Persisted per browser; ⌘⌥= / ⌘⌥- / ⌘⌥0 from anywhere in the app."
      >
        <div className="flex w-full flex-col gap-3">
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={UI_SCALE_MIN}
              max={UI_SCALE_MAX}
              step={0.05}
              value={scale}
              onChange={(e) => setScale(Number(e.target.value))}
              aria-label="Interface scale"
              className="w-56 accent-foreground"
            />
            <span className="w-12 text-xs tnum">
              {Math.round(scale * 100)}%
            </span>
            <Button variant="ghost" size="xs" onClick={reset}>
              Reset
            </Button>
          </div>
          <Panel
            title="A panel at the current scale"
            subtitle="Everything in here is rem"
            bodyClassName="flex items-center gap-2 pt-2"
          >
            <Button size="sm">Action</Button>
            <Input size="sm" placeholder="Search" className="w-32" />
            <Tag hue="indigo">Design</Tag>
            <Kbd>⌘K</Kbd>
          </Panel>
        </div>
      </Specimen>

      <Specimen
        title="Control heights"
        note="md — 28px — is the default: a nav row, a toolbar pill, a menu item and a table row all share it. Anything that is not a control is a named layout constant, not a step on this ladder."
      >
        <div className="w-full">
          {CONTROLS.map(([token, cls, px, use]) => (
            <TokenRow key={token} name={token} value={use}>
              <span className={`w-12 rounded-sm bg-element-emphasis ${cls}`} />
              <span className="pl-2 caption tnum">{px}</span>
            </TokenRow>
          ))}
        </div>
      </Specimen>

      <Specimen title="Buttons at every size">
        {(["xs", "sm", "md", "lg", "xl"] as const).map((size) => (
          <Sample key={size} label={size}>
            <Button size={size}>Action</Button>
          </Sample>
        ))}
      </Specimen>

      <Specimen title="Inputs at every size">
        {(["xs", "sm", "md", "lg"] as const).map((size) => (
          <Sample key={size} label={size}>
            <Input size={size} placeholder="Search" className="w-32" />
          </Sample>
        ))}
      </Specimen>

      <Specimen
        title="Radius"
        note="Size-ordered: the bigger the surface, the rounder its corner. Controls are the exception — everything you press is a full pill, which is what separates an action from a container at a glance."
      >
        <div className="w-full">
          {RADII.map(([cls, rem, use]) => (
            <TokenRow key={cls} name={cls} value={use}>
              <span
                className={`size-8 bg-card ring-1 ring-foreground/15 ${cls}`}
              />
              <span className="pl-2 caption tnum">{rem}</span>
            </TokenRow>
          ))}
        </div>
      </Specimen>

      <Specimen
        title="Layout constants"
        note="The four widths the shell is built from. Rem, so the rail and the dock grow with the type they hold."
      >
        <div className="w-full">
          {LAYOUT.map(([token, rem, px]) => (
            <TokenRow key={token} name={token} value={`${px} at scale 1`}>
              <span className="mono text-xs tnum">{rem}</span>
            </TokenRow>
          ))}
        </div>
      </Specimen>
    </>
  )
}
