import { ClientOnly, createFileRoute } from "@tanstack/react-router"
import { lazy, Suspense } from "react"

import { SESSIONS, TIMELINE_ENTRIES } from "@/mock/data"
import { PageHeader } from "@/components/patterns/section-header"
import { Specimen } from "@/components/gallery/specimen"
import { DashedRails } from "@/components/blocks/dashed-rails"
import { GhostCards } from "@/components/blocks/ghost-cards"
import { Globe } from "@/components/blocks/globe"
import { Glow } from "@/components/blocks/glow"
import { InfiniteSlider } from "@/components/blocks/infinite-slider"
import { PlusCorners } from "@/components/blocks/plus-decorator"
import { ProgressiveBlur } from "@/components/blocks/progressive-blur"
import { SessionPipeline } from "@/components/blocks/session-pipeline"
import { SessionTimeline } from "@/components/blocks/session-timeline"
import { SpinningBorderPill } from "@/components/blocks/spinning-border-pill"
import { Callout } from "@/components/ui/callout"
import { DitherField } from "@/components/ui/dither-field"
import { ScrollFade } from "@/components/ui/scroll-fade"
import { StatusIcon } from "@/components/ui/status-icon"

export const Route = createFileRoute("/ds/blocks")({ component: BlocksGallery })

// three + fiber only load for whoever opens this page or the login screen.
const RevealWaveImage = lazy(() =>
  import("@/components/blocks/reveal-wave-image").then((m) => ({
    default: m.RevealWaveImage,
  }))
)

const LIVE = SESSIONS.find((s) => s.status === "live") ?? SESSIONS[0]
const PIPELINE_ENTRIES = TIMELINE_ENTRIES.map((e, i) =>
  e.kind === "tool_call" && i === 6
    ? { ...e, toolStatus: "running" as const }
    : e
)

function BlocksGallery() {
  return (
    <>
      <PageHeader
        title="Blocks"
        description="The illustration and effect primitives, ported from natai and Auberge."
      />

      <Callout tone="info">
        A block is a decorative or illustrative object, not a control. Each one
        here is self-contained and reads through the token layer, so it inverts
        with the theme and grows with the interface scale.
      </Callout>

      <Specimen
        title="Globe"
        note="cobe's dotted WebGL globe in the theme's own ink, turning slowly and draggable. Markers are DOM, pinned with CSS anchor positioning and faded on the far side. The sign-in aside parks it off the top-right corner so only the northern hemisphere shows."
      >
        <div className="relative h-64 w-full overflow-hidden rounded-xl bg-surface ring-1 ring-foreground/10">
          <Globe className="absolute -top-1/4 left-1/2 w-96 -translate-x-1/2" />
        </div>
      </Specimen>

      <Specimen
        title="Reveal wave image"
        note="A GLSL shader: sine-wave UV distortion, greyscale, a 4×4 Bayer ordered dither quantised to three levels in the theme's own ink and paper — and a cursor spotlight that mixes the full-colour texture back in. Move the pointer over it."
      >
        <div className="h-64 w-full overflow-hidden rounded-xl ring-1 ring-foreground/10">
          <ClientOnly fallback={<DitherField mode="glyphs" />}>
            <Suspense fallback={<DitherField mode="glyphs" />}>
              <RevealWaveImage
                src="/login/abstract.avif"
                pixelSize={2}
                waveSpeed={0.2}
                waveFrequency={0.7}
                waveAmplitude={0.5}
                revealRadius={0.5}
                revealSoftness={1}
                mouseRadius={0.4}
              />
            </Suspense>
          </ClientOnly>
        </div>
      </Specimen>

      <Specimen
        title="Session pipeline"
        note="natai's agent-pipeline illustration on real session data. Three states read by silhouette before colour: done is struck through and dimmed, the running step is the one ringed row with a slow dashed spinner, everything after sits at 40%."
      >
        <div className="w-full max-w-sm">
          <SessionPipeline session={LIVE} entries={PIPELINE_ENTRIES} />
        </div>
      </Specimen>

      <Specimen
        title="Session timeline"
        note="natai's workflow illustration: entries hang off a dashed rail on quarter-round elbows. The head card carries the session's status glyph so the rail reads as one story with a conclusion."
      >
        <div className="w-full max-w-sm">
          <SessionTimeline
            status={LIVE.status}
            entries={TIMELINE_ENTRIES.slice(0, 5)}
          />
        </div>
      </Specimen>

      <Specimen
        title="Progressive blur"
        note="Eight stacked backdrop-filter layers of increasing radius, each masked to a band, so blur ramps rather than steps. Put it as a sibling over a scroller — a filter nested inside would scroll away with the content."
      >
        <div className="relative h-40 w-full overflow-hidden rounded-xl bg-surface ring-1 ring-foreground/10">
          <div className="absolute inset-0 grid-lines bg-size-[24px_24px] opacity-60" />
          <div className="absolute inset-x-0 top-0 p-4 text-xs">
            {Array.from({ length: 6 }).map((_, i) => (
              <p key={i} className="py-1 text-muted-foreground">
                Line {i + 1} — the blur below dissolves this edge into depth of
                field.
              </p>
            ))}
          </div>
          <ProgressiveBlur
            direction="bottom"
            className="absolute inset-x-0 bottom-0 h-24"
          />
        </div>
      </Specimen>

      <Specimen
        title="Infinite slider"
        note="Children render twice and the track translates by exactly half its measured width. Hover slows it smoothly by animating the remaining distance rather than jumping speeds."
      >
        <div className="w-full">
          <InfiniteSlider gap={24} speed={40} speedOnHover={10}>
            {SESSIONS.map((s) => (
              <span
                key={s.id}
                className="flex h-7 items-center gap-2 rounded-full bg-card px-3 text-2xs whitespace-nowrap ring-1 ring-foreground/10"
              >
                <StatusIcon status={s.status} className="size-3" />
                {s.ref}
              </span>
            ))}
          </InfiniteSlider>
        </div>
      </Specimen>

      <Specimen
        title="Scroll fade"
        note="The scroll container itself. It measures scrollTop against `fade` and writes two registered custom properties the mask reads — registered, so the change transitions instead of snapping. Only the edge with more content fades."
      >
        <ScrollFade className="h-40 w-full max-w-xs rounded-xl bg-card ring-1 ring-foreground/10">
          {SESSIONS.map((s) => (
            <div
              key={s.id}
              className="flex items-center gap-2 border-b border-hairline px-3 py-2 text-xs last:border-0"
            >
              <StatusIcon status={s.status} />
              <span className="truncate">{s.title}</span>
            </div>
          ))}
        </ScrollFade>
      </Specimen>

      <Specimen
        title="Plus corners and dashed rails"
        note="natai's drafting marks. A cross-hair at each corner turns a bordered panel into a technical drawing; dashed rails in the gutters make a page read as a sheet."
      >
        <div className="relative w-full py-8">
          <DashedRails />
          <div className="relative mx-auto max-w-md rounded-xl border border-foreground/10 bg-card p-6">
            <PlusCorners />
            <p className="text-xs text-muted-foreground">
              Four `PlusDecorator`s at the corners, two `DashedRails` in the
              gutters.
            </p>
          </div>
        </div>
      </Specimen>

      <Specimen
        title="Ghost cards"
        note="Stacked paper: two sheets peeking out behind the real one, done with pseudo-elements so it costs no DOM. Fades at the bottom so it reads as depth rather than three cards."
      >
        <div className="w-full max-w-xs pt-2">
          <GhostCards>
            <div className="rounded-2xl bg-card p-4 ring-1 ring-foreground/10">
              <p className="text-xs font-medium">ATL-273</p>
              <p className="text-2xs text-muted-foreground">
                CareExpand · 10 engineering sessions
              </p>
            </div>
          </GhostCards>
        </div>
      </Specimen>

      <Specimen
        title="Glow and spinning border"
        note="A blurred duplicate behind an object; achromatic by default, and the one place chroma is allowed to move when `hue animated`. The spinning border is a conic ring on a registered angle — a live indicator that says 'something is happening' without a spinner in the content."
      >
        <div className="relative">
          <Glow />
          <div className="relative rounded-xl bg-card px-4 py-3 text-xs ring-1 ring-foreground/10">
            Quiet glow
          </div>
        </div>
        <div className="relative">
          <Glow hue animated />
          <div className="relative rounded-xl bg-card px-4 py-3 text-xs ring-1 ring-foreground/10">
            Hue glow
          </div>
        </div>
        <SpinningBorderPill>
          <StatusIcon status="live" className="size-3" />
          Live session
        </SpinningBorderPill>
      </Specimen>
    </>
  )
}
