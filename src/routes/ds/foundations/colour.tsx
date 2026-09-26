import { createFileRoute } from "@tanstack/react-router"

import { PageHeader } from "@/components/patterns/section-header"
import { Specimen, TokenRow } from "@/components/gallery/specimen"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Callout } from "@/components/ui/callout"
import { HueDot, Tag } from "@/components/ui/tag"
import { PriorityIcon, StatusIcon } from "@/components/ui/status-icon"
import { HUES, hueFor } from "@/lib/hue"

export const Route = createFileRoute("/ds/foundations/colour")({
  component: ColourFoundations,
})

function Swatch({ className }: { className: string }) {
  return (
    <span
      className={`size-8 rounded-md ring-1 ring-foreground/10 ${className}`}
    />
  )
}

// Dark lightness first, light second. Chroma is 0 on every step.
const SURFACES = [
  ["--background", "bg-background", "0.08 · 0.985", "the page"],
  ["--surface", "bg-surface", "0.10 · 0.975", "sidebar, dock, input wells"],
  ["--card", "bg-card", "0.12 · 1.00", "Panel, KpiStrip, DataTable"],
  ["--illustration", "bg-illustration", "0.13 · 1.00", "a card inside a card"],
  ["--muted", "bg-muted", "0.15 · 0.962", "hover on a card, a kbd"],
  ["--popover", "bg-popover", "0.17 · 1.00", "menus, dialogs, tooltips"],
] as const

const OVERLAYS = [
  ["--element-hover", "bg-element-hover", "foreground at 5%"],
  ["--element-selected", "bg-element-selected", "foreground at 8%"],
  ["--element-active", "bg-element-active", "foreground at 11%"],
  ["--element-emphasis", "bg-element-emphasis", "foreground at 16%"],
] as const

const BORDERS = [
  ["--hairline", "bg-hairline", "6% · 7% — a rule INSIDE content"],
  ["--border", "bg-border", "8% · 9% — the edge of a thing"],
  ["--border-strong", "bg-border-strong", "16% · 18% — a focused input"],
  ["ring-foreground/10", "bg-foreground/10", "the ring on every raised block"],
] as const

const STATUS = [
  ["--success", "bg-success", "bg-success-muted", "live, synced"],
  ["--warning", "bg-warning", "bg-warning-muted", "restricted, preview rate"],
  ["--error", "bg-error", "bg-error-muted", "failed, destructive"],
  ["--info", "bg-info", "bg-info-muted", "a note, nothing more"],
] as const

function ColourFoundations() {
  return (
    <>
      <PageHeader
        title="Colour"
        description="Achromatic OKLCH. Six surface steps, one inverted primary, chroma only where something has an identity or a state."
      />

      <Callout tone="info">
        Every colour is OKLCH with zero chroma unless it is a status or a hue.
        The token layer is the only place a colour literal may appear — the
        ratchet fails the build on an OKLCH, a colour-mix or a hex value in a
        component.
      </Callout>

      <Specimen
        title="Surfaces"
        note="A monotonic ramp: every step 'up' is lighter in dark mode. The sidebar sits one step BELOW the page and the card one step above, so the content is a lit plane between a recessed rail and floating menus. In light the ramp saturates at white after the card, and hierarchy is carried by the ring and the two shadow rungs instead."
      >
        <div className="w-full">
          {SURFACES.map(([token, cls, l, note]) => (
            <TokenRow key={token} name={token} value={note}>
              <Swatch className={cls} />
              <span className="pl-2 mono text-3xs text-muted-foreground tnum">
                L {l}
              </span>
            </TokenRow>
          ))}
        </div>
      </Specimen>

      <Specimen
        title="The primary is the foreground, inverted"
        note="There is no brand hue in the chrome. The one thing to click is the one thing printed in the opposite colour — white on dark, black on light — which is louder than any accent could be against an achromatic field. Focus is the foreground at 40%; selection at 22%."
      >
        <div className="flex flex-wrap items-center gap-3">
          <Swatch className="bg-primary" />
          <Button variant="default">Primary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="secondary">Secondary</Button>
          <span className="rounded-sm px-1 text-xs ring-1 ring-ring">
            focus
          </span>
          <span className="bg-selection rounded-sm px-1 text-xs">
            selection
          </span>
        </div>
      </Specimen>

      <Specimen
        title="Element states"
        note="The appearance's own foreground at an alpha, so they invert for free and stack correctly on any surface step."
      >
        <div className="w-full">
          {OVERLAYS.map(([token, cls, note]) => (
            <TokenRow key={token} name={token} value={note}>
              <span className="flex size-8 items-center justify-center rounded-md bg-card ring-1 ring-foreground/10">
                <span className={`size-6 rounded-sm ${cls}`} />
              </span>
            </TokenRow>
          ))}
        </div>
      </Specimen>

      <Specimen
        title="Rules and rings"
        note="Two border tokens, because a rule inside a card must read lighter than the edge of the card. Elevation is a ring, never a shadow: only a menu and a dialog cast, because they float over content they are not part of."
      >
        <div className="w-full">
          {BORDERS.map(([token, cls, note]) => (
            <TokenRow key={token} name={token} value={note}>
              <span className={`h-px w-full ${cls}`} />
            </TokenRow>
          ))}
        </div>
      </Specimen>

      <Specimen
        title="Status"
        note="The only chroma that means something. Four inks, each with a `-muted` fill mixed into transparent for badges and pills. Done is NOT a status colour — a finished session is an achromatic filled check, because finishing is the normal case and should not glow."
      >
        <div className="flex w-full flex-col gap-4">
          <div className="w-full">
            {STATUS.map(([token, ink, muted, note]) => (
              <TokenRow key={token} name={token} value={note}>
                <Swatch className={ink} />
                <Swatch className={muted} />
              </TokenRow>
            ))}
          </div>
          <div className="flex items-center gap-4">
            {(["queued", "live", "done", "failed"] as const).map((s) => (
              <span key={s} className="flex items-center gap-1.5">
                <StatusIcon status={s} />
                <span className="text-xs capitalize">{s}</span>
              </span>
            ))}
          </div>
          <div className="flex items-center gap-4">
            {(["none", "low", "medium", "high", "urgent"] as const).map((p) => (
              <span key={p} className="flex items-center gap-1.5">
                <PriorityIcon priority={p} />
                <span className="text-xs capitalize">{p}</span>
              </span>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="success">Synced</Badge>
            <Badge variant="warning">Preview rate</Badge>
            <Badge variant="error">Failed</Badge>
            <Badge variant="info">Beta</Badge>
            <Badge>Admin</Badge>
            <Badge variant="secondary">Developer</Badge>
            <Badge variant="outline">atlas</Badge>
          </div>
        </div>
      </Specimen>

      <Specimen
        title="Hues"
        note="Eight hues for IDENTITY — labels, projects, agents, roles. `purple` means 'the Design label', never 'informational'. A tag is the hue mixed into transparent at --tag-bg-mix for the fill and --tag-border-mix for the edge, so the same eight numbers produce both themes. `hueFor(id)` hashes any key onto the ring so an entity keeps its colour across screens."
      >
        <div className="flex w-full flex-col gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {HUES.map((hue) => (
              <Tag key={hue} hue={hue}>
                {hue}
              </Tag>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {HUES.map((hue) => (
              <Tag key={hue} hue={hue} dot>
                {hue}
              </Tag>
            ))}
          </div>
          <div className="w-full">
            {HUES.map((hue) => (
              <TokenRow key={hue} name={`--hue-${hue}`} value={`.tag-${hue}`}>
                <HueDot hue={hue} />
              </TokenRow>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {["atlas", "server", "standards", "atlas-theme", "docs"].map(
              (k) => (
                <Tag key={k} hue={hueFor(k)} dot>
                  hueFor(&quot;{k}&quot;)
                </Tag>
              )
            )}
          </div>
        </div>
      </Specimen>

      <Specimen
        title="Diff"
        note="The one place green and red carry no judgement — they are the convention, and breaking it to stay on-palette would make a diff unreadable."
      >
        <span className="rounded-sm bg-diff-added px-2 py-1 code text-diff-added-foreground">
          + facets.sort()
        </span>
        <span className="rounded-sm bg-diff-removed px-2 py-1 code text-diff-removed-foreground">
          − facets.reverse()
        </span>
      </Specimen>
    </>
  )
}
