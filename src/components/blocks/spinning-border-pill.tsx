import { cn } from "cn"

/**
 * A pill with a slowly rotating conic border. natai's `notes-2` "library
 * synced" chip. For a LIVE indicator: the motion says "something is
 * happening" without a spinner in the content.
 *
 * The ring is a `before:` painted with `spin-border` (utilities.css) — a
 * conic gradient driven by a registered `--spin-angle`, so the angle itself
 * animates and the gradient never re-rasterises.
 */
function SpinningBorderPill({
  className,
  children,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="spinning-border-pill"
      className={cn(
        "relative inline-flex h-7 items-center gap-1.5 rounded-full px-3 text-xs font-medium",
        "isolate before:absolute before:-inset-px before:-z-10 before:animate-spin-border before:rounded-full before:spin-border",
        "bg-background/95",
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}

export { SpinningBorderPill }
