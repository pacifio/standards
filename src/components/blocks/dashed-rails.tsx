import { cn } from "cn"

/**
 * natai's dashed vertical rails, positioned by `clamp()` so they sit inside
 * the gutter at every width. Dashed, never solid: they are drafting marks,
 * not walls. The optional mask lets them fade before they hit the next
 * section.
 */
function DashedRails({
  fade = false,
  className,
}: {
  fade?: boolean
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
      <div className={rail} style={{ left: "clamp(0.5rem, 5vw, 5rem)" }} />
      <div className={rail} style={{ right: "clamp(0.5rem, 5vw, 5rem)" }} />
    </div>
  )
}

export { DashedRails }
