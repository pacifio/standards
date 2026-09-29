"use client"

import { motion } from "motion/react"
import { cn } from "cn"

import { EASE_PANEL } from "@/lib/motion"
import { DotMatrix, SegmentMeter } from "@/components/patterns/dot-matrix"
import { DeltaPill } from "@/components/patterns/kpi-strip"
import type { LabelTone } from "@/mock/types"

/**
 * The dashboard's number cells, and the strip that holds them.
 *
 * `StatGrid` is the KPI strip's material — one `rounded-xl bg-card` block
 * ringed at `foreground/10` — with the cells split by hairlines rather than
 * floated as separate cards, so a row of five figures reads as one reading
 * of the workspace. The hairlines are the 1px gaps of a grid laid over a
 * hairline-coloured backing, which (unlike `divide-x`) survives the strip
 * wrapping to two columns on a narrow screen.
 *
 * `StatCard` is a headline figure with its trend and a dot-matrix of the
 * period; `MeterCard` is one part of a whole — its figure, its share, and a
 * segment meter.
 *
 * The trend is the KPI strip's `DeltaPill` — green up, red down — so a
 * figure reads the same on the dashboard as it does anywhere else a KPI is
 * shown.
 */

/** The rise every card enters with, staggered by position. */
function enter(index: number) {
  return {
    initial: { opacity: 0, y: 6 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.28, delay: index * 0.05, ease: EASE_PANEL },
  }
}

function StatCard({
  label,
  badge,
  value,
  trend,
  series,
  index = 0,
  className,
}: {
  label: string
  /** A qualifier beside the label, e.g. "est." on a cost. */
  badge?: string
  value: React.ReactNode
  trend?: number
  series?: Array<number>
  index?: number
  className?: string
}) {
  return (
    // The fill is static and only the contents rise in, so the hairline
    // backing never shows through a half-faded cell.
    <div className={cn("min-w-0 bg-card", className)}>
      <motion.div
        {...enter(index)}
        className="flex h-full flex-col gap-3 px-4 pt-3.5 pb-4"
      >
        {/* Fixed height, so a badge beside one label does not push that
            card's figure out of line with its neighbours. */}
        <div className="flex h-4 items-center gap-1.5">
          <span className="truncate micro">{label}</span>
          {badge && (
            <span className="rounded-full px-1.5 text-4xs tracking-wider text-muted-foreground uppercase ring-1 ring-foreground/15">
              {badge}
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-2xl leading-none figure">{value}</span>
          {trend !== undefined && <DeltaPill value={trend} />}
        </div>
        {series && <DotMatrix values={series} className="mt-auto" />}
      </motion.div>
    </div>
  )
}

function MeterCard({
  label,
  value,
  share,
  hue,
  index = 0,
  className,
}: {
  label: string
  value: React.ReactNode
  /** 0–1: this part's share of the whole. */
  share: number
  /** The identity hue of the thing measured. */
  hue?: LabelTone
  index?: number
  className?: string
}) {
  return (
    // The fill is static and only the contents rise in, so the hairline
    // backing never shows through a half-faded cell.
    <div className={cn("min-w-0 bg-card", className)}>
      <motion.div
        {...enter(index)}
        className="flex h-full flex-col gap-3 px-4 pt-3.5 pb-4"
      >
        <div className="flex items-center justify-between gap-2">
          <span className="truncate micro">{label}</span>
          <span className="text-3xs text-muted-foreground tnum">
            {Math.round(share * 100)}%
          </span>
        </div>
        <span className="text-xl leading-none figure">{value}</span>
        <SegmentMeter value={share} hue={hue} className="mt-auto" />
      </motion.div>
    </div>
  )
}

function StatGrid({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="stat-grid"
      className={cn(
        "grid gap-px overflow-hidden rounded-xl bg-hairline ring-1 ring-foreground/10",
        className
      )}
      {...props}
    />
  )
}

export { MeterCard, StatCard, StatGrid }
