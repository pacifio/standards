import { cn } from "cn"

/**
 * Dashed vertical rails, positioned by `clamp()` so they sit inside
 * the gutter at every width — or at a fixed `offset` from the parent's edges
 * when they should frame a column rather than a viewport. Dashed, never solid: they are drafting marks,
 * not walls. The optional mask lets them fade before they hit the next
 * section.
 */
function DashedRails({
  fade = false,
  offset = "clamp(0.5rem, 5vw, 5rem)",
  className,
}: {
  fade?: boolean
  /** Distance of each rail from the parent's left and right edges. */
  offset?: string
  className?: string
}) {
  const rail = cn(
    "pointer-events-none absolute inset-y-0 border-l border-dashed border-foreground/10",
    fade && "mask-y-from-85%"
  )
  return (
    <div
      aria-hidden="true"
      data-slot="dashed-rails"
      className={cn("pointer-events-none absolute inset-0", className)}
    >
      <div className={rail} style={{ left: offset }} />
      <div className={rail} style={{ right: offset }} />
    </div>
  )
}

export { DashedRails }
