import { cn } from "cn"

/**
 * A loading placeholder.
 *
 * Animates opacity only. A shimmer that moves a gradient repaints the whole
 * list on every frame, which on a 200-row board costs more than the request
 * it is standing in for.
 */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "animate-shimmer-row rounded-sm bg-element-selected",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
