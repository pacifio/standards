import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva } from "class-variance-authority"
import type { VariantProps } from "class-variance-authority"
import { cn } from "cn"

/**
 * A status chip.
 *
 * Sentence case, not uppercase. The desktop app's badges read `Admin`, and the
 * server web app's read `ADMIN` with 0.08em tracking — the second is louder
 * than the member's own name beside it, which is backwards. Uppercase with
 * tracking belongs to `eyebrow`, which labels a GROUP of things, not one row.
 *
 * `rounded-sm` for a status badge, `<Pill>` for the rounded-full variety.
 */

const badgeVariants = cva(
  [
    "inline-flex w-fit shrink-0 items-center justify-center gap-1",
    "rounded-sm border px-1.5 py-px font-medium whitespace-nowrap select-none",
    "[&>svg]:pointer-events-none [&>svg]:size-3",
  ],
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        /**
         * The workhorse. A quiet chip that does not compete with the row.
         * It keeps a hairline because its most common home is a table on
         * `bg-card` — a transparent-bordered chip filled with `card` is
         * invisible there, which is exactly what happened on the members
         * table before this edge existed.
         */
        secondary: "border-border-subtle bg-muted text-secondary-foreground",
        outline: "border-border bg-transparent text-secondary-foreground",
        success: "border-transparent bg-success-muted text-success",
        warning: "border-transparent bg-warning-muted text-warning",
        error: "border-transparent bg-error-muted text-error",
        info: "border-transparent bg-info-muted text-info",
      },
      size: {
        sm: "h-4 text-3xs",
        md: "h-5 text-2xs",
      },
    },
    defaultVariants: { variant: "secondary", size: "md" },
  }
)

function Badge({
  className,
  variant,
  size,
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      { className: cn(badgeVariants({ variant, size }), className) },
      props
    ),
    render,
    state: { slot: "badge", variant },
  })
}

export { Badge, badgeVariants }
