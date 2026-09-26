import { cn } from "cn"

/**
 * A blurred glow behind an object. natai's `token-counter` progress bar and
 * `integrations` card use the same trick: duplicate the shape, blur it, put
 * it behind at low opacity.
 *
 * The parent must be `relative`. `hue` is the one place chroma is allowed
 * to appear as decoration — and `animated` the one place it is allowed to
 * move, via a slow hue-rotate. Off by default: the achromatic version reads
 * as a soft shadow and is right for almost everything.
 */
function Glow({
  hue = false,
  animated = false,
  className,
}: {
  hue?: boolean
  animated?: boolean
  className?: string
}) {
  return (
    <div
      aria-hidden="true"
      data-slot="glow"
      className={cn(
        "pointer-events-none absolute inset-0 -z-10 blur-lg",
        hue
          ? cn(
              "bg-linear-to-r/increasing from-hue-purple to-hue-cyan opacity-35",
              animated && "animate-hue-rotate"
            )
          : "bg-foreground/10 opacity-60",
        className
      )}
    />
  )
}

export { Glow }
