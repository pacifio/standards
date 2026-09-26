"use client"

import { motion } from "motion/react"
import type { HTMLMotionProps } from "motion/react"
import { cn } from "cn"

/**
 * A graduated blur at one edge, iOS-style. natai's `motion-primitives`.
 *
 * Stacks N masked `backdrop-filter` layers of increasing radius, each
 * masked to a band that slides along the edge, so blur ramps smoothly
 * rather than stepping. Eight layers at 0.25px increments is the sweet
 * spot; fewer bands read as bands.
 *
 * Put it as an absolutely-positioned SIBLING over the content — a backdrop
 * filter samples what is painted behind it, so a layer nested inside a
 * scroller would travel with the content and sample nothing.
 */

const GRADIENT_ANGLES = { top: 0, right: 90, bottom: 180, left: 270 } as const

export type ProgressiveBlurProps = {
  direction?: keyof typeof GRADIENT_ANGLES
  blurLayers?: number
  blurIntensity?: number
  className?: string
} & HTMLMotionProps<"div">

function ProgressiveBlur({
  direction = "bottom",
  blurLayers = 8,
  blurIntensity = 0.25,
  className,
  ...props
}: ProgressiveBlurProps) {
  const layers = Math.max(blurLayers, 2)
  const segment = 1 / (blurLayers + 1)
  const angle = GRADIENT_ANGLES[direction]

  return (
    <div className={cn("pointer-events-none relative", className)}>
      {Array.from({ length: layers }).map((_, index) => {
        // A mask reads alpha only, so keyword colours are all it needs.
        const stops = [index, index + 1, index + 2, index + 3]
          .map((i) => i * segment * 100)
          .map(
            (pos, i) =>
              `${i === 1 || i === 2 ? "black" : "transparent"} ${pos}%`
          )
        const gradient = `linear-gradient(${angle}deg, ${stops.join(", ")})`
        const blur = `blur(${index * blurIntensity}px)`
        return (
          <motion.div
            key={index}
            className="pointer-events-none absolute inset-0 rounded-[inherit]"
            style={{
              maskImage: gradient,
              WebkitMaskImage: gradient,
              backdropFilter: blur,
              WebkitBackdropFilter: blur,
            }}
            {...props}
          />
        )
      })}
    </div>
  )
}

export { ProgressiveBlur }
