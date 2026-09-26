import { createFileRoute } from "@tanstack/react-router"

import { PageHeader } from "@/components/patterns/section-header"
import { Specimen, TokenRow } from "@/components/gallery/specimen"
import { Badge } from "@/components/ui/badge"
import { Callout } from "@/components/ui/callout"
import { LabelChip } from "@/components/ui/label-chip"
import { CURSOR_LIGHT, LINEAR_DARK } from "@/components/gallery/measured"
import { PriorityIcon, StatusIcon } from "@/components/ui/status-icon"

export const Route = createFileRoute("/ds/foundations/colour")({
  component: ColourFoundations,
})

function Swatch({ className }: { className: string }) {
  return (
    <span
      className={`size-8 rounded-md border border-border-subtle ${className}`}
    />
  )
}

const SURFACES = [
  ["--sidebar", "bg-sidebar", "the navigation plane, behind everything"],
  ["--background", "bg-background", "the page"],
  ["--card", "bg-card", "a raised block: a row card, a settings card"],
  ["--popover", "bg-popover", "floating: menus, dialogs, tooltips"],
  [
    "--atlas-panel-input-background",
    "bg-panel-input",
    "a recessed well: an input",
  ],
] as const

const OVERLAYS = [
  ["--atlas-element-hover", "bg-element-hover", "foreground at 5%"],
  ["--atlas-element-selected", "bg-element-selected", "foreground at 8%"],
  ["--atlas-element-active", "bg-element-active", "foreground at 11%"],
  ["--atlas-element-emphasis", "bg-element-emphasis", "foreground at 16%"],
] as const

const BORDERS = [
  ["--atlas-border-subtle", "bg-border-subtle", "inside a card"],
  ["--border", "bg-border", "the edge of a card"],
  ["--atlas-border-strong", "bg-border-strong", "a focused input"],
] as const

const LABELS = [
  ["grey", "bg-label-grey"],
  ["indigo", "bg-label-indigo"],
  ["purple", "bg-label-purple"],
  ["cyan", "bg-label-cyan"],
  ["green", "bg-label-green"],
  ["amber", "bg-label-amber"],
  ["orange", "bg-label-orange"],
  ["red", "bg-label-red"],
] as const

function ColourFoundations() {
  return (
    <>
      <PageHeader
        title="Colour"
        description="Measured from Linear's dark chrome and Cursor's light neutrals."
      />

      <Callout tone="info">
        Every value here was sampled from screenshots of the reference apps, not
        recalled — a colour histogram plus scanlines to find the column edges
        and hairlines. The raw measurements are listed at the bottom of this
        page.
      </Callout>

      <Specimen
        title="Surfaces"
        note="The rail is DARKER than the canvas. The content is a lit plane in front of a recessed rail — inverting that, a lighter rail beside a black canvas, is what makes an app read as a terminal rather than a product. Note also that neither reference uses a true black canvas: with nothing below it to recess into, the ramp runs out after two steps."
      >
        <div className="w-full">
          {SURFACES.map(([token, cls, note]) => (
            <TokenRow key={token} name={token} value={note}>
              <Swatch className={cls} />
            </TokenRow>
          ))}
        </div>
      </Specimen>

      <Specimen
        title="Element states"
        note="Derived as the appearance's own foreground at an alpha, which is why they invert for free: white at 5% over the dark canvas becomes black at 5% over the light one, with no second set of values to keep in sync."
      >
        <div className="w-full">
          {OVERLAYS.map(([token, cls, note]) => (
            <TokenRow key={token} name={token} value={note}>
              <span className="flex size-8 items-center justify-center rounded-md bg-card">
                <span className={`size-6 rounded-sm ${cls}`} />
              </span>
            </TokenRow>
          ))}
        </div>
      </Specimen>

      <Specimen
        title="Borders"
        note="Three strengths, one hairline weight. The system is border-defined: if two things need separating, the answer is almost always a 1px rule, not a shadow and not a gap."
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
        title="The action colour"
        note="A real accent — primary buttons, focus rings, selection and the Done glyph all use it. An earlier version of this system set --primary to pure white and wrote a no-brand-hue rule into the token layer; that is not what either reference does, and it left the app with no way to say which thing to click."
      >
        <div className="flex items-center gap-3">
          <Swatch className="bg-primary" />
          <div className="flex flex-col gap-0.5">
            <code className="code">--primary</code>
            <span className="caption">
              buttons, focus, selection · hover --atlas-primary-hover
            </span>
          </div>
        </div>
      </Specimen>

      <Specimen
        title="Status"
        note="Saturated on purpose. These render as 14px glyphs, and a desaturated sage green simply disappears at that size. Status is a state that changes: queued, running, done, failed."
      >
        <div className="flex w-full flex-col gap-3">
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
        title="Labels"
        note="A separate palette from status, because a label is an IDENTITY, not a state. `purple` means 'the Design label', not 'informational'. Keeping the two vocabularies apart is what stops a label inheriting a meaning it does not have the moment someone renames it. Eight hues, each still distinguishable as a 6px dot."
      >
        <div className="flex w-full flex-col gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {LABELS.map(([tone]) => (
              <LabelChip key={tone} tone={tone}>
                {tone}
              </LabelChip>
            ))}
          </div>
          <div className="w-full">
            {LABELS.map(([tone, cls]) => (
              <TokenRow key={tone} name={`--atlas-label-${tone}`}>
                <span className={`size-4 rounded-full ${cls}`} />
              </TokenRow>
            ))}
          </div>
        </div>
      </Specimen>

      <Specimen
        title="Provenance"
        note="The sampled values themes.css was derived from. Everything above is a token; this is the evidence behind it."
      >
        <div className="grid w-full gap-6 sm:grid-cols-2">
          {[
            ["Linear · dark", LINEAR_DARK],
            ["Cursor · light", CURSOR_LIGHT],
          ].map(([title, rows]) => (
            <div key={title as string} className="flex flex-col gap-1">
              <p className="pb-1 eyebrow">{title as string}</p>
              {(rows as typeof LINEAR_DARK).map((m) => (
                <div key={m.role} className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="size-3.5 shrink-0 rounded-sm border border-border-subtle"
                    style={{ background: m.value }}
                  />
                  <code className="w-20 shrink-0 code">{m.value}</code>
                  <span className="text-2xs text-secondary-foreground">
                    {m.role}
                  </span>
                  <span className="ml-auto truncate caption">{m.note}</span>
                </div>
              ))}
            </div>
          ))}
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
