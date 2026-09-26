import { createFileRoute } from "@tanstack/react-router"

import { PageHeader } from "@/components/patterns/section-header"
import { Sample, Specimen, TokenRow } from "@/components/gallery/specimen"
import { Button } from "@/components/ui/button"
import { Callout } from "@/components/ui/callout"
import { Input } from "@/components/ui/input"

export const Route = createFileRoute("/ds/foundations/density")({
  component: DensityFoundations,
})

const CONTROLS = [
  ["--control-xs", "22px", "a pill, a keycap, an inline chip"],
  ["--control-sm", "24px", "a control inside a row or a table cell"],
  ["--control-md", "28px", "the default — toolbars, forms, menu items"],
  ["--control-lg", "32px", "a form field with its own label"],
  ["--control-xl", "36px", "a primary action on an empty page"],
] as const

const RADII = [
  ["rounded-sm", "4px", "controls: buttons, inputs, badges"],
  ["rounded-md", "6px", "cards and rows"],
  ["rounded-lg", "8px", "popovers and menus"],
  ["rounded-xl", "12px", "dialogs"],
] as const

function DensityFoundations() {
  return (
    <>
      <PageHeader
        title="Density"
        description="A 4px grid, five control heights, four radii."
      />

      <Callout tone="warning">
        The spacing multiplier is pinned to <code className="code">4px</code>,
        not Tailwind&apos;s <code className="code">0.25rem</code>. At a 14px
        root a rem-based multiplier makes every spacing utility 12.5% smaller
        than its name implies — <code className="code">p-2</code> lands on 7px
        and <code className="code">size-4</code> on 14px — which puts hairlines
        on half-pixel boundaries where they render as two grey lines.
      </Callout>

      <Specimen
        title="Control heights"
        note="md is the default. Anything that is not a control — a top bar, a rail — is a named layout constant, not a step on this ladder."
      >
        <div className="w-full">
          {CONTROLS.map(([token, px, use]) => (
            <TokenRow key={token} name={token} value={use}>
              <span
                className="rounded-sm bg-element-emphasis"
                style={{ height: px, width: "48px" }}
              />
              <span className="pl-2 caption tnum">{px}</span>
            </TokenRow>
          ))}
        </div>
      </Specimen>

      <Specimen title="Buttons at every size">
        <Sample label="xs">
          <Button size="xs">Action</Button>
        </Sample>
        <Sample label="sm">
          <Button size="sm">Action</Button>
        </Sample>
        <Sample label="md">
          <Button size="md">Action</Button>
        </Sample>
        <Sample label="lg">
          <Button size="lg">Action</Button>
        </Sample>
        <Sample label="xl">
          <Button size="xl">Action</Button>
        </Sample>
      </Specimen>

      <Specimen title="Inputs at every size">
        <Sample label="xs">
          <Input size="xs" placeholder="Search" className="w-32" />
        </Sample>
        <Sample label="sm">
          <Input size="sm" placeholder="Search" className="w-32" />
        </Sample>
        <Sample label="md">
          <Input size="md" placeholder="Search" className="w-32" />
        </Sample>
        <Sample label="lg">
          <Input size="lg" placeholder="Search" className="w-32" />
        </Sample>
      </Specimen>

      <Specimen
        title="Radius"
        note="Four steps derived from one theme value, so a theme that wants a rounder look moves all four at once. The rule is size-ordered: the bigger the surface, the rounder its corner."
      >
        <div className="w-full">
          {RADII.map(([cls, px, use]) => (
            <TokenRow key={cls} name={cls} value={use}>
              <span
                className={`size-8 border border-border-strong bg-card ${cls}`}
              />
              <span className="pl-2 caption tnum">{px}</span>
            </TokenRow>
          ))}
        </div>
      </Specimen>
    </>
  )
}
