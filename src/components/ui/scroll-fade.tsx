import { cn } from "cn"

/**
 * The progressive-blur fade at the edge of a scroll area.
 *
 * Three stacked bands, each blurrier and shorter than the last, so content
 * dissolves into the edge rather than being sliced by a hard mask. One band
 * reads as a smear; three staged ones read as depth of field. The CSS is in
 * `utilities.css`; this is just the markup, because `backdrop-filter` needs
 * three real elements to stack.
 *
 * These must be SIBLINGS of the scrolling content — `backdrop-filter` only
 * samples what is painted behind an element, so a band nested inside the
 * scroller would scroll away with it and sample nothing.
 */
function ScrollFade({
  edge,
  className,
  ...props
}: React.ComponentProps<"div"> & { edge: "top" | "bottom" }) {
  return (
    <div
      aria-hidden="true"
      data-slot="scroll-fade"
      className={cn(
        "scroll-blur",
        edge === "top" ? "scroll-blur-t" : "scroll-blur-b",
        className
      )}
      {...props}
    >
      <i />
      <i />
      <i />
    </div>
  )
}

export { ScrollFade }
