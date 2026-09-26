"use client"

import { useId } from "react"
import { motion } from "motion/react"
import { cn } from "cn"

import { SPRING_INDICATOR } from "@/lib/motion"

/**
 * Three sliding-indicator controls. Auberge's `segmented.tsx`.
 *
 * In all three the active state is ONE shared-`layoutId` element that
 * physically slides between options rather than two backgrounds
 * cross-fading. It is the house style; nothing in this system cross-fades
 * when it could slide.
 */

export type SegmentOption<T extends string> = {
  value: T
  label: React.ReactNode
  count?: React.ReactNode
  icon?: React.ReactNode
}

/** The chip rail: a local switch between renderings of the same data. */
function SegmentedPills<T extends string>({
  options,
  value,
  onChange,
  className,
  size = "md",
}: {
  options: Array<SegmentOption<T>>
  value: T
  onChange: (value: T) => void
  className?: string
  size?: "sm" | "md"
}) {
  const layoutId = useId()
  return (
    <div
      data-slot="segmented-pills"
      role="tablist"
      className={cn("flex items-center gap-1 overflow-x-auto", className)}
    >
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "relative shrink-0 rounded-full font-medium whitespace-nowrap transition-colors outline-none",
              size === "sm" ? "h-6 px-2.5 text-2xs" : "h-7 px-3 text-xs",
              active
                ? "text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                transition={SPRING_INDICATOR}
                className="absolute inset-0 rounded-full bg-primary"
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              {option.icon}
              {option.label}
              {option.count !== undefined && (
                <span
                  className={cn(
                    "rounded-full px-1 text-3xs tnum",
                    active
                      ? "bg-primary-foreground/20"
                      : "bg-element-emphasis text-muted-foreground"
                  )}
                >
                  {option.count}
                </span>
              )}
            </span>
          </button>
        )
      })}
    </div>
  )
}

/** Page-level tabs with a sliding underline. */
function UnderlineTabs<T extends string>({
  options,
  value,
  onChange,
  className,
}: {
  options: Array<SegmentOption<T>>
  value: T
  onChange: (value: T) => void
  className?: string
}) {
  const layoutId = useId()
  return (
    <div
      data-slot="underline-tabs"
      role="tablist"
      className={cn(
        "flex items-center gap-4 border-b border-hairline",
        className
      )}
    >
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "relative flex items-center gap-1.5 pb-2 text-xs font-medium transition-colors outline-none",
              active
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {option.icon}
            {option.label}
            {option.count !== undefined && (
              <span className="rounded-full bg-muted px-1.5 text-3xs text-muted-foreground tnum">
                {option.count}
              </span>
            )}
            {active && (
              <motion.span
                layoutId={layoutId}
                transition={SPRING_INDICATOR}
                className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-foreground"
              />
            )}
          </button>
        )
      })}
    </div>
  )
}

/** The `grey label │ value ⌄` toolbar pill. */
function CompoundFilter({
  label,
  children,
  className,
  onClick,
}: {
  label: React.ReactNode
  children: React.ReactNode
  className?: string
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      data-slot="compound-filter"
      onClick={onClick}
      className={cn(
        "group inline-flex h-7 shrink-0 items-center overflow-hidden rounded-full border border-border bg-card text-xs transition-colors outline-none hover:bg-muted",
        className
      )}
    >
      <span className="border-r border-border/70 px-2.5 text-muted-foreground">
        {label}
      </span>
      <span className="flex items-center gap-1 px-2.5 font-medium">
        {children}
      </span>
    </button>
  )
}

export { CompoundFilter, SegmentedPills, UnderlineTabs }
