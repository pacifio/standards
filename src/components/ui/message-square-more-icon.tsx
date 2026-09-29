"use client"

import { forwardRef, useImperativeHandle } from "react"
import { motion, useAnimationControls } from "motion/react"
import type { Variants } from "motion/react"
import { cn } from "cn"

import { ICON_STROKE_WIDTH } from "@/components/ui/icon"

/**
 * A speech bubble whose three dots blink in turn — someone typing.
 *
 * Animates on hover by itself, or through a ref (`startAnimation` /
 * `stopAnimation`) so a whole button can drive it. `currentColor`, at the
 * system's icon stroke so it sits beside Lucide glyphs.
 */

export type MessageSquareMoreIconHandle = {
  startAnimation: () => void
  stopAnimation: () => void
}

const DOT: Variants = {
  normal: { opacity: 1 },
  // Each dot drops out and returns one step after the last, twice over.
  animate: (i: number) => ({
    opacity: [1, 0, 0, 1, 1, 0, 0, 1],
    transition: {
      opacity: {
        times: [
          0,
          0.1,
          0.1 + i * 0.1,
          0.2 + i * 0.1,
          0.5,
          0.6,
          0.6 + i * 0.1,
          0.7 + i * 0.1,
        ],
        duration: 1.5,
      },
    },
  }),
}

const DOTS = ["M8 10h.01", "M12 10h.01", "M16 10h.01"]

const MessageSquareMoreIcon = forwardRef<
  MessageSquareMoreIconHandle,
  Omit<React.ComponentProps<"span">, "ref"> & {
    size?: number
    strokeWidth?: number
    /** When true, hover on the icon itself does nothing; the parent drives it. */
    controlled?: boolean
  }
>(function MessageSquareMoreIcon(
  {
    size = 14,
    strokeWidth = ICON_STROKE_WIDTH,
    controlled = false,
    className,
    onMouseEnter,
    onMouseLeave,
    ...props
  },
  ref
) {
  const controls = useAnimationControls()

  useImperativeHandle(
    ref,
    () => ({
      startAnimation: () => void controls.start("animate"),
      stopAnimation: () => void controls.start("normal"),
    }),
    [controls]
  )

  return (
    <span
      data-slot="message-square-more-icon"
      aria-hidden="true"
      className={cn("inline-flex shrink-0", className)}
      onMouseEnter={(e) => {
        if (!controlled) void controls.start("animate")
        onMouseEnter?.(e)
      }}
      onMouseLeave={(e) => {
        if (!controlled) void controls.start("normal")
        onMouseLeave?.(e)
      }}
      {...props}
    >
      <svg
        fill="none"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        {DOTS.map((d, i) => (
          <motion.path
            key={d}
            d={d}
            custom={i}
            initial="normal"
            animate={controls}
            variants={DOT}
          />
        ))}
      </svg>
    </span>
  )
})

export { MessageSquareMoreIcon }
