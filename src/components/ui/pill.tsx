import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cn } from "cn"

/**
 * A rounded-full chip: a filter token, a breadcrumb crumb, an agent tag.
 *
 * Distinct from <Badge> by shape and by job. A badge states a fact about a row
 * ("Admin", "Live"). A pill is usually interactive or removable, and its full
 * radius is what says so.
 */
function Pill({
  className,
  render,
  ...props
}: useRender.ComponentProps<"span">) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(
          "inline-flex h-control-xs w-fit shrink-0 items-center gap-1.5",
          "rounded-full border border-border bg-card px-2 text-2xs font-medium",
          "whitespace-nowrap text-secondary-foreground select-none",
          "[&>svg]:pointer-events-none [&>svg]:size-3",
          className
        ),
      },
      props
    ),
    render,
    state: { slot: "pill" },
  })
}

/** The 6px status dot that leads a pill, a row, or a legend entry. */
function StatusDot({
  className,
  tone = "neutral",
  ...props
}: React.ComponentProps<"span"> & {
  tone?: "neutral" | "success" | "warning" | "error" | "info"
}) {
  return (
    <span
      data-slot="status-dot"
      data-tone={tone}
      className={cn(
        "inline-block size-1.5 shrink-0 rounded-full bg-current",
        tone === "neutral" && "text-muted-foreground",
        tone === "success" && "text-success",
        tone === "warning" && "text-warning",
        tone === "error" && "text-error",
        tone === "info" && "text-info",
        className
      )}
      {...props}
    />
  )
}

export { Pill, StatusDot }
