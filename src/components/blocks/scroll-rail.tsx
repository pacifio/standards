"use client"

import {
  motion,
  useMotionTemplate,
  useScroll,
  useTransform,
} from "motion/react"
import { cn } from "cn"

/**
 * Reading progress as a ruler: a column of hairline ticks that fill in top
 * to bottom as you scroll, with a longer marker riding the fill line and
 * the percentage beside it.
 *
 * It measures a scroll CONTAINER, not the window, so it works inside a
 * page whose body does not scroll. Ticks are drawn with a repeating
 * gradient — one hairline every 5px — in the foreground ink: faint for the
 * whole ruler, full strength for the part already read, clipped to the
 * progress from below.
 */

const TICKS =
  "repeating-linear-gradient(to bottom, var(--foreground) 0, var(--foreground) 1px, transparent 1px, transparent 5px)"

function ScrollRail({
  container,
  className,
}: {
  container: React.RefObject<HTMLElement | null>
  className?: string
}) {
  const { scrollYProgress } = useScroll({ container })

  const hidden = useTransform(scrollYProgress, [0, 1], [100, 0])
  const clipPath = useMotionTemplate`inset(0 0 ${hidden}% 0)`
  // The marker rides from the first tick to the LAST one — which sits 1px
  // above the bottom edge, since the rail is a whole number of 5px steps
  // plus one — not to the edge itself, or at 100% it hangs below the ruler.
  const top = useMotionTemplate`calc((100% - 1px) * ${scrollYProgress})`
  const pct = useTransform(scrollYProgress, (v) =>
    Math.max(1, Math.round(v * 100))
  )

  return (
    <div
      aria-hidden="true"
      data-slot="scroll-rail"
      // 38 steps of 5px plus the last hairline: the last tick lands on the
      // rail's final pixel. Not rem, so UI scale cannot break the fit.
      style={{ height: 191 }}
      className={cn("pointer-events-none relative w-2.5", className)}
    >
      <div
        className="absolute inset-0 opacity-15"
        style={{ backgroundImage: TICKS }}
      />
      <motion.div
        className="absolute inset-0"
        style={{ clipPath, backgroundImage: TICKS }}
      />
      {/* The marker: a longer tick at the fill line, with the number. */}
      <motion.div
        style={{ top }}
        className="absolute left-0 h-px w-5 bg-foreground"
      >
        <motion.span className="absolute top-1/2 -right-1 translate-x-full -translate-y-1/2 text-2xs font-medium text-foreground tnum">
          {pct}
        </motion.span>
      </motion.div>
    </div>
  )
}

export { ScrollRail }
