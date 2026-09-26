import { cn } from "cn"

/**
 * The Atlas mark: three rising strokes.
 *
 * `currentColor`, so it takes the ink of whatever it sits in — a rail item,
 * a login header, a workspace switcher trigger. Our own mark, unlike the
 * third-party ones in `brand-marks.tsx`, has no fixed colour.
 */
function AtlasMark({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="currentColor"
      aria-hidden="true"
      className={cn("shrink-0", className)}
      {...props}
    >
      <path d="M7.4 4h3.1L6.6 20H3.5zM13.2 4h3.1l-3.9 16H9.3zM19 4h3.1l-3.9 16h-3.1z" />
    </svg>
  )
}

/** The mark in its rounded container, as it appears above an auth form. */
function AtlasBadge({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex size-8 items-center justify-center rounded-lg bg-foreground text-background",
        className
      )}
      {...props}
    >
      <AtlasMark className="size-4" />
    </div>
  )
}

/** Mark plus name, for a footer or a nav. */
function AtlasWordmark({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex items-center gap-1.5 text-foreground", className)}
      {...props}
    >
      <AtlasMark className="size-3.5" />
      <span className="text-xs font-semibold tracking-tight">Atlas</span>
    </div>
  )
}

export { AtlasBadge, AtlasMark, AtlasWordmark }
