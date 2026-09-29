"use client"

import { forwardRef, useImperativeHandle } from "react"
import { motion, useAnimationControls } from "motion/react"
import type { Variants } from "motion/react"
import { cn } from "cn"

/**
 * A mailbox whose flag springs up — the Inbox's own mark.
 *
 * It animates on hover by itself, or on command through a ref
 * (`startAnimation` / `stopAnimation`) so a larger target — the whole page
 * title — can drive it. The flag is a spring with a little overshoot: this
 * is an illustrative glyph, not chrome, and the lift is the point.
 *
 * `currentColor`, like every icon in the system.
 */

export type MailboxIconHandle = {
  startAnimation: () => void
  stopAnimation: () => void
}

const FLAG: Variants = {
  normal: {
    rotate: 0,
    transition: { type: "spring", stiffness: 300, damping: 18 },
  },
  animate: {
    rotate: -90,
    transition: { type: "spring", stiffness: 280, damping: 12, mass: 1 },
  },
}

const MailboxIcon = forwardRef<
  MailboxIconHandle,
  Omit<React.ComponentProps<"span">, "ref"> & {
    /** Pixel size of the glyph. */
    size?: number
    /**
     * Line weight. 1.5 — lighter than the system's 1.75 because this glyph
     * is drawn larger, beside a title, where a heavier line reads as bold.
     */
    strokeWidth?: number
    /** When true, hover on the icon itself does nothing; the parent drives it. */
    controlled?: boolean
  }
>(function MailboxIcon(
  {
    size = 20,
    strokeWidth = 1.5,
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
      data-slot="mailbox-icon"
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
        className="overflow-visible"
        fill="none"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M22 17a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9.5C2 7 4 5 6.5 5H18c2.2 0 4 1.8 4 4v8Z" />
        <motion.path
          d="M18 11V9H15"
          initial="normal"
          animate={controls}
          variants={FLAG}
          style={{ transformOrigin: "18px 11px" }}
        />
        <path d="M6.5 5C9 5 11 7 11 9.5V17a2 2 0 0 1-2 2" />
        <line x1="6" x2="7" y1="10" y2="10" />
      </svg>
    </span>
  )
})

export { MailboxIcon }
