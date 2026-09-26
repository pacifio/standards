import { LoaderCircleIcon } from "lucide-react"
import { cn } from "cn"

import { ICON_SIZES, ICON_STROKE_WIDTH } from "@/components/ui/icon"
import type { IconSize } from "@/components/ui/icon"

/** An indeterminate progress indicator. Sized off the icon ladder. */
function Spinner({
  className,
  size = "md",
  label = "Loading",
  ...props
}: Omit<React.ComponentProps<"svg">, "ref"> & {
  size?: IconSize
  /** Accessible name. Set to "" inside a control that already has one. */
  label?: string
}) {
  return (
    <LoaderCircleIcon
      data-slot="spinner"
      role={label ? "status" : undefined}
      aria-label={label || undefined}
      aria-hidden={label ? undefined : "true"}
      size={ICON_SIZES[size]}
      strokeWidth={ICON_STROKE_WIDTH}
      className={cn("shrink-0 animate-spin text-muted-foreground", className)}
      {...props}
    />
  )
}

export { Spinner }
