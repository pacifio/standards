"use client"

import { useLayoutEffect, useRef, useState } from "react"
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react"
import { cn } from "cn"

import { Icon } from "@/components/ui/icon"

/**
 * "Show more" for a long entry — the Atlas desktop app's `Clamp`.
 *
 * Content taller than 400px collapses to 340px under a fade into the page,
 * with a pill hanging half over the bottom edge. The 60px of slack means a
 * block only a little over the limit is shown whole rather than clipped by
 * a sliver. Expanded, the pill becomes "Show less" below the content.
 */
const MAX = 340
const SLACK = 60

function Clamp({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [tall, setTall] = useState(false)
  const [open, setOpen] = useState(false)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () => setTall(el.scrollHeight > MAX + SLACK)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const clamped = tall && !open

  return (
    <div data-slot="clamp" className={cn("relative", className)}>
      <div
        ref={ref}
        className={cn(clamped && "overflow-hidden")}
        style={clamped ? { maxHeight: MAX } : undefined}
      >
        {children}
      </div>
      {clamped && (
        <>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-linear-to-b from-transparent to-card"
          />
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="duration-fast absolute bottom-0 left-1/2 flex h-7 -translate-x-1/2 translate-y-1/2 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-xs text-secondary-foreground shadow-md transition-colors hover:text-foreground"
          >
            <Icon icon={ChevronDownIcon} size="xs" />
            Show more
          </button>
        </>
      )}
      {tall && open && (
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="duration-fast mx-auto mt-2 flex h-7 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-xs text-secondary-foreground transition-colors hover:text-foreground"
        >
          <Icon icon={ChevronUpIcon} size="xs" />
          Show less
        </button>
      )}
    </div>
  )
}

export { Clamp }
