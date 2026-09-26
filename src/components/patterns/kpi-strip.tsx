"use client"

import { motion } from "motion/react"
import { ArrowDownRightIcon, ArrowUpRightIcon } from "lucide-react"
import { cn } from "cn"

import { Icon } from "@/components/ui/icon"

/**
 * KPI cells split by vertical hairlines, not individual cards. Auberge's
 * `dashboard.jpg` strip: oversized, LIGHT-weight tabular figures with the
 * delta riding beside the label.
 */

export type KpiCell = {
  id: string
  label: string
  value: React.ReactNode
  delta?: number
  spark?: Array<number>
  /** A neutral note under the figure, for spend and other unjudged figures. */
  detail?: React.ReactNode
}

function DeltaPill({
  value,
  className,
}: {
  value: number
  className?: string
}) {
  const up = value >= 0
  return (
    <span
      data-slot="delta-pill"
      className={cn(
        "inline-flex h-4.5 items-center gap-0.5 rounded-full px-1.5 text-3xs font-medium tnum",
        up ? "bg-success-muted text-success" : "bg-error-muted text-error",
        className
      )}
    >
      <Icon
        icon={up ? ArrowUpRightIcon : ArrowDownRightIcon}
        size="xs"
        className="size-2.5"
      />
      {up ? "+" : ""}
      {value.toFixed(1)}%
    </span>
  )
}

/**
 * A bar sparkline. Inline SVG — ~30 rects; a library would be 40kb to do the
 * same. `currentColor`, so the cell decides the ink.
 */
function Sparkline({
  values,
  className,
  ...props
}: Omit<React.ComponentProps<"svg">, "values"> & { values: Array<number> }) {
  const max = Math.max(...values, 1)
  return (
    <svg
      viewBox={`0 0 ${values.length} 10`}
      preserveAspectRatio="none"
      aria-hidden="true"
      className={cn("h-5 w-full text-muted-foreground", className)}
      {...props}
    >
      {values.map((v, i) => {
        const h = Math.max((v / max) * 10, 0.5)
        return (
          <rect
            key={i}
            x={i + 0.125}
            y={10 - h}
            width={0.75}
            height={h}
            fill="currentColor"
          />
        )
      })}
    </svg>
  )
}

function KpiStrip({
  cells,
  className,
}: {
  cells: Array<KpiCell>
  className?: string
}) {
  return (
    <div
      data-slot="kpi-strip"
      className={cn(
        "grid divide-x divide-hairline rounded-xl bg-card ring-1 ring-foreground/10",
        className
      )}
      style={{ gridTemplateColumns: `repeat(${cells.length}, minmax(0, 1fr))` }}
    >
      {cells.map((cell, index) => (
        <motion.div
          key={cell.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: index * 0.05 }}
          className="flex min-w-0 flex-col gap-2 px-4 py-3.5"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-2xs text-muted-foreground">
              {cell.label}
            </span>
            {cell.delta !== undefined && <DeltaPill value={cell.delta} />}
          </div>
          <div className="truncate text-2xl leading-none figure">
            {cell.value}
          </div>
          {cell.spark && (
            <Sparkline values={cell.spark} className="mt-0.5 opacity-70" />
          )}
          {cell.detail && <span className="caption">{cell.detail}</span>}
        </motion.div>
      ))}
    </div>
  )
}

export { DeltaPill, KpiStrip, Sparkline }
