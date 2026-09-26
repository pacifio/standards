import { cn } from "cn"

/**
 * The stat strip Cursor puts above a table: Total / Successful / Failed /
 * Run History.
 *
 * Numbers are `tnum` so a counter that ticks does not shift the label under
 * it. The delta is a caption, never a coloured arrow — green-up/red-down on a
 * usage figure implies a judgement the app has no business making about
 * someone's spend.
 */

function MetricRow({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="metric-row"
      className={cn(
        "grid grid-cols-2 divide-x divide-border-subtle overflow-hidden rounded-md border border-border bg-card sm:grid-cols-4",
        className
      )}
      {...props}
    />
  )
}

function MetricTile({
  className,
  label,
  value,
  detail,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  label: React.ReactNode
  value?: React.ReactNode
  detail?: React.ReactNode
}) {
  return (
    <div
      data-slot="metric-tile"
      className={cn("flex flex-col gap-1 px-3 py-2.5", className)}
      {...props}
    >
      <span className="caption">{label}</span>
      {value !== undefined && (
        <span className="text-md font-semibold tnum">{value}</span>
      )}
      {detail && <span className="caption">{detail}</span>}
      {children}
    </div>
  )
}

/**
 * A bar sparkline. Inline SVG rather than a charting dependency: this draws
 * ~30 rects and a library would be 40kb to do the same.
 *
 * `currentColor` so the caller decides the ink, and `preserveAspectRatio=none`
 * so the bars stretch to whatever width the tile gives them.
 */
function Sparkline({
  values,
  className,
  ...props
}: Omit<React.ComponentProps<"svg">, "values"> & { values: Array<number> }) {
  const max = Math.max(...values, 1)
  const gap = 0.25
  const width = values.length
  return (
    <svg
      data-slot="sparkline"
      viewBox={`0 0 ${width} 10`}
      preserveAspectRatio="none"
      aria-hidden="true"
      className={cn("h-5 w-full text-muted-foreground", className)}
      {...props}
    >
      {values.map((v, i) => {
        // A zero-value bar still gets 0.5 units so the baseline reads as a
        // series rather than a gap.
        const h = Math.max((v / max) * 10, 0.5)
        return (
          <rect
            key={i}
            x={i + gap / 2}
            y={10 - h}
            width={1 - gap}
            height={h}
            fill="currentColor"
          />
        )
      })}
    </svg>
  )
}

export { MetricRow, MetricTile, Sparkline }
