"use client"

import { useEffect, useState } from "react"
import { animate, motion, useMotionValue } from "motion/react"
import type { AnimationPlaybackControls } from "motion/react"
import { cn } from "cn"

import { useMeasure } from "@/lib/use-measure"

/**
 * A seamless marquee.
 *
 * Children render twice and the track translates by exactly half its
 * measured width, so the second copy lands where the first began. Width is
 * measured, not assumed, so it survives font loading and scale changes.
 *
 * `speedOnHover` does not jump speeds: it animates the REMAINING distance at
 * the new speed, then re-keys the loop. A marquee that lurches when you
 * hover it is one you cannot read.
 */

export type InfiniteSliderProps = {
  children: React.ReactNode
  gap?: number
  speed?: number
  speedOnHover?: number
  direction?: "horizontal" | "vertical"
  reverse?: boolean
  className?: string
}

function InfiniteSlider({
  children,
  gap = 16,
  speed = 100,
  speedOnHover,
  direction = "horizontal",
  reverse = false,
  className,
}: InfiniteSliderProps) {
  const [currentSpeed, setCurrentSpeed] = useState(speed)
  const [ref, { width, height }] = useMeasure<HTMLDivElement>()
  const translation = useMotionValue(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [key, setKey] = useState(0)

  useEffect(() => {
    let controls: AnimationPlaybackControls | undefined
    const size = direction === "horizontal" ? width : height
    if (!size) return
    const contentSize = size + gap
    const from = reverse ? -contentSize / 2 : 0
    const to = reverse ? 0 : -contentSize / 2
    const duration = Math.abs(to - from) / currentSpeed

    if (isTransitioning) {
      const remaining = Math.abs(translation.get() - to)
      controls = animate(translation, [translation.get(), to], {
        ease: "linear",
        duration: remaining / currentSpeed,
        onComplete: () => {
          setIsTransitioning(false)
          setKey((k) => k + 1)
        },
      })
    } else {
      controls = animate(translation, [from, to], {
        ease: "linear",
        duration,
        repeat: Infinity,
        repeatType: "loop",
        repeatDelay: 0,
        onRepeat: () => translation.set(from),
      })
    }
    return () => controls.stop()
  }, [
    key,
    translation,
    currentSpeed,
    width,
    height,
    gap,
    isTransitioning,
    direction,
    reverse,
  ])

  const hoverProps = speedOnHover
    ? {
        onHoverStart: () => {
          setIsTransitioning(true)
          setCurrentSpeed(speedOnHover)
        },
        onHoverEnd: () => {
          setIsTransitioning(true)
          setCurrentSpeed(speed)
        },
      }
    : {}

  return (
    <div className={cn("overflow-hidden", className)}>
      <motion.div
        ref={ref}
        className="flex w-max"
        style={{
          ...(direction === "horizontal"
            ? { x: translation }
            : { y: translation }),
          gap: `${gap}px`,
          flexDirection: direction === "horizontal" ? "row" : "column",
        }}
        {...hoverProps}
      >
        {children}
        {children}
      </motion.div>
    </div>
  )
}

export { InfiniteSlider }
