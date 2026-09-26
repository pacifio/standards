import { createFileRoute } from "@tanstack/react-router"

import { PageHeader } from "@/components/patterns/section-header"
import { Specimen, TokenRow } from "@/components/gallery/specimen"
import { Callout } from "@/components/ui/callout"

export const Route = createFileRoute("/ds/foundations/type")({
  component: TypeFoundations,
})

const SCALE = [
  ["text-3xs", "10 / 13", "a count badge, a keyboard hint"],
  ["text-2xs", "11 / 14", "captions, eyebrows, metadata"],
  ["text-xs", "12 / 16", "the workhorse — controls, rows, menus"],
  ["text-sm", "13 / 18", "a larger control, running prose"],
  ["text-base", "14 / 20", "body copy, the document default"],
  ["text-md", "16 / 22", "a panel or dialog title"],
  ["text-lg", "18 / 26", "a page title"],
  ["text-xl", "22 / 30", "a section head on a marketing page"],
  ["text-2xl", "28 / 36", "a hero number"],
] as const

const STYLES = [
  [
    "eyebrow",
    "A group label. The one place uppercase and tracking are allowed.",
  ],
  ["label", "Text on or beside a control."],
  ["body", "Running prose."],
  ["caption", "The dimmed line under something."],
  ["code", "Any monospace run. Slashed zero on."],
  ["heading", "A panel or dialog title."],
] as const

function TypeFoundations() {
  return (
    <>
      <PageHeader
        title="Type"
        description="Geist, nine px steps, explicit line-heights, and exactly two weights."
      />

      <Callout tone="info">
        The typeface is{" "}
        <strong className="font-semibold text-foreground">Geist</strong>, loaded
        as a variable font — one file for the whole weight range — with{" "}
        <code className="code">Geist Mono</code> for code, numerals and
        identifiers. An earlier version of this system loaded no web font at all
        and rode the platform stack, so the app rendered in SF Pro on a Mac and
        something else everywhere else; a shared typeface across the product is
        worth more than a shared fallback.
      </Callout>

      <Callout tone="warning">
        Only 500 and 600 exist. 400 disappears against a dense monochrome UI and
        700 shouts; if something needs more emphasis than 600, the answer is a
        size step or a colour step, not a heavier weight.
      </Callout>

      <Specimen
        title="Scale"
        note="Root is 14px — one step up from the desktop app's 13px, because a browser window is read further away and on a larger surface. Half-pixel sizes round UP to the next step; there is no tenth step."
      >
        <div className="w-full">
          {SCALE.map(([cls, size, use]) => (
            <TokenRow key={cls} name={cls} value={use}>
              <span className={cls}>
                <span className="caption tnum">{size}</span>
              </span>
            </TokenRow>
          ))}
        </div>
      </Specimen>

      <Specimen
        title="Named styles"
        note="Reach for one of these before composing size + weight + colour by hand. Six names cover essentially every text run in the app, and they are what keeps a caption in one screen the same as a caption in the next."
      >
        <div className="flex w-full flex-col gap-4">
          {STYLES.map(([cls, note]) => (
            <div key={cls} className="flex flex-col gap-1">
              <span className={cls}>The quick brown fox · 0123456789</span>
              <span className="caption">
                <code className="code">.{cls}</code> — {note}
              </span>
            </div>
          ))}
        </div>
      </Specimen>

      <Specimen
        title="Numerals"
        note="Any figure that changes in place gets tabular numerals, or the column jitters as it ticks."
      >
        <div className="flex flex-col gap-1">
          <span className="text-sm tnum">184,200 · 11:03:41 · $71.90</span>
          <span className="caption">.tnum — tabular</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-sm">184,200 · 11:03:41 · $71.90</span>
          <span className="caption">proportional — wrong for counters</span>
        </div>
      </Specimen>
    </>
  )
}
