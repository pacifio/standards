import { createFileRoute } from "@tanstack/react-router"

import { PageHeader } from "@/components/patterns/section-header"
import { Specimen, TokenRow } from "@/components/gallery/specimen"
import { Callout } from "@/components/ui/callout"

export const Route = createFileRoute("/ds/foundations/type")({
  component: TypeFoundations,
})

// rem at a 16px root, so px is what you see at scale 1.
const SCALE = [
  ["text-4xs", "9 / 12", "a nav count, a kbd inside a pill"],
  ["text-3xs", "10 / 14", ".micro, .tag, table heads, a delta pill"],
  ["text-2xs", "11 / 16", "nav rows, crumbs, subtitles, captions"],
  ["text-xs", "12 / 16", "the BODY DEFAULT — controls, cells, menus"],
  ["text-sm", "14 / 20", "settings prose, dialog body"],
  ["text-md", "16 / 22", "a dialog title"],
  ["text-lg", "18 / 24", "a section title"],
  ["text-xl", "20 / 26", "a page title"],
  ["text-2xl", "28 / 32", ".figure — a hero number"],
] as const

const STYLES = [
  [
    "micro",
    "A group label. 10px, uppercase, 0.07em. The one place tracking is allowed.",
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
        description="Geist, nine rem steps from 9 to 28px, explicit line-heights, and exactly three weights — one of them for figures only."
      />

      <Callout tone="info">
        The typeface is{" "}
        <strong className="font-medium text-foreground">Geist</strong>, a
        variable font, with <code className="code">Geist Mono</code> for code,
        refs and identifiers. The scale is in rem so the whole interface grows
        with <code className="code">--ui-scale</code>; the pixel figures below
        are what you get at the default.
      </Callout>

      <Callout tone="warning">
        Weights are 400 for text, 500 for emphasis, and 300 for{" "}
        <code className="code">.figure</code> only. 600 and above do not exist:
        if something needs more than 500, the answer is a size step or a colour
        step, not a heavier weight.
      </Callout>

      <Specimen
        title="Scale"
        note="The body default is 12px, not 14 — every control, cell and menu row sits at text-xs and the two steps below it carry the chrome. The root is 16px times --ui-scale, so p-2 is still exactly 8px and h-7 exactly 28px at the default; the root's only job is to be the scale multiplier."
      >
        <div className="w-full">
          {SCALE.map(([cls, size, use]) => (
            <TokenRow key={cls} name={cls} value={use}>
              <span className={cls}>Ag</span>
              <span className="pl-2 caption tnum">{size}</span>
            </TokenRow>
          ))}
        </div>
      </Specimen>

      <Specimen
        title="Figure"
        note="Weight 300 with -0.03em tracking and tabular numerals. Big numbers set light read as measurement rather than headline — the KPI strip is the only place a 28px glyph appears, and it should not shout."
      >
        <div className="flex items-end gap-8">
          <div className="flex flex-col gap-1">
            <span className="text-2xl leading-none figure">184,200</span>
            <span className="caption">.figure text-2xl</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-2xl leading-none font-medium">184,200</span>
            <span className="caption">font-medium — too loud</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-lg leading-none figure">$41,208</span>
            <span className="caption">.figure text-lg</span>
          </div>
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
