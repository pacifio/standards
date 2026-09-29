import { cn } from "cn"

import { HUE_VAR } from "@/lib/hue"
import type { LabelTone } from "@/mock/types"

/**
 * The dashboard's two chart primitives, from the Atlas desktop app's usage
 * view: a dot-matrix sparkline and a segmented meter.
 *
 * The dot-matrix is achromatic: a chart of spend or tokens is a quantity,
 * not a status. The meter may take a `hue` — an IDENTITY, the colour of the
 * thing being measured (input, output, cache…), so four meters in a row can
 * be told apart at a glance. Magnitude is always carried by how many ticks
 * are lit, never by the colour.
 */

/**
 * A column of pixels per value, lit from the bottom. Unlit pixels stay on
 * the grid at low ink so the empty headroom reads as part of the chart
 * rather than as blank card. The last column — "now" — is drawn at full ink.
 *
 * SVG with a uniform-scale viewBox, so pixels stay square at any width; the
 * height follows from the column count, capped so a card that spans a whole
 * row does not blow the pixels up — past the cap the matrix keeps its size
 * and sits at the bottom-left, where the figure above it starts.
 */
function DotMatrix({
  values,
  rows = 7,
  className,
  ...props
}: Omit<React.ComponentProps<"svg">, "values"> & {
  values: Array<number>
  rows?: number
}) {
  const max = Math.max(...values, 1)
  const cell = 4
  const dot = 2.4
  const inset = (cell - dot) / 2
  return (
    <svg
      data-slot="dot-matrix"
      viewBox={`0 0 ${values.length * cell} ${rows * cell}`}
      preserveAspectRatio="xMinYMax meet"
      aria-hidden="true"
      className={cn("block h-auto max-h-16 w-full text-foreground", className)}
      {...props}
    >
      {values.map((v, col) => {
        const lit = v > 0 ? Math.max(1, Math.round((v / max) * rows)) : 0
        const last = col === values.length - 1
        return Array.from({ length: rows }, (_, r) => {
          const fromBottom = rows - 1 - r
          const on = fromBottom < lit
          return (
            <rect
              key={`${col}-${r}`}
              x={col * cell + inset}
              y={r * cell + inset}
              width={dot}
              height={dot}
              rx={0.6}
              fill="currentColor"
              opacity={on ? (last ? 1 : 0.5) : 0.1}
            />
          )
        })
      })}
    </svg>
  )
}

/**
 * A share of a whole as a row of ticks. Every tick is present; the share is
 * how many are lit, and a thin cursor stands where the value lands. Reads at
 * a glance down a row of four, where four bars of different lengths would
 * make the eye compare end-points.
 *
 * With a `hue`, lit ticks are the hue and unlit ones the same hue faint, so
 * the track still says whose meter it is when almost nothing is lit.
 * Without one it is foreground ink.
 */
function SegmentMeter({
  value,
  hue,
  segments = 36,
  className,
}: {
  /** 0–1. */
  value: number
  hue?: LabelTone
  segments?: number
  className?: string
}) {
  const lit =
    value > 0 ? Math.max(1, Math.round(Math.min(value, 1) * segments)) : 0
  const ink = hue ? { background: HUE_VAR[hue] } : undefined
  const ticks = Array.from({ length: segments }, (_, i) => (
    <span
      key={i}
      style={ink}
      className={cn(
        "min-w-0 flex-1 rounded-full",
        !hue && "bg-foreground",
        i >= lit && "opacity-20"
      )}
    />
  ))
  return (
    <div
      data-slot="segment-meter"
      role="meter"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(value * 100)}
      className={cn("flex h-3 items-stretch gap-0.5", className)}
    >
      {ticks.slice(0, lit)}
      <span
        aria-hidden="true"
        className="-my-0.5 w-0.5 shrink-0 rounded-full bg-foreground"
      />
      {ticks.slice(lit)}
    </div>
  )
}

export { DotMatrix, SegmentMeter }
