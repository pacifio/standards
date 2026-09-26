"use client"

import { motion } from "motion/react"
import { ArrowUpRightIcon, SlidersHorizontalIcon } from "lucide-react"
import { cn } from "cn"

import { EASE_PANEL } from "@/lib/motion"
import { Icon } from "@/components/ui/icon"

/**
 * The card of this system. Auberge's `Panel`, from `dashboard.jpg`.
 *
 * `rounded-xl bg-card ring-1 ring-foreground/10` — a ring on a lighter step
 * of the ramp, never a shadow. Every panel carries a top-right action
 * cluster: a neutral circular secondary (filter) and an inverted circular
 * primary with an ↗ (expand). Panels enter with a small rise, and a page
 * staggers them down with `delay` so the eye is led rather than presented.
 */
function Panel({
  title,
  subtitle,
  actions,
  onExpand,
  onFilter,
  className,
  bodyClassName,
  children,
  delay = 0,
}: {
  title?: React.ReactNode
  subtitle?: React.ReactNode
  actions?: React.ReactNode
  onExpand?: () => void
  onFilter?: () => void
  className?: string
  bodyClassName?: string
  children: React.ReactNode
  delay?: number
}) {
  return (
    <motion.section
      data-slot="panel"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay, ease: EASE_PANEL }}
      className={cn(
        "flex min-w-0 flex-col overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10",
        className
      )}
    >
      {(title || actions || onExpand || onFilter) && (
        <header className="flex items-start justify-between gap-3 px-4 pt-3.5 pb-2">
          <div className="min-w-0">
            {title && <h3 className="truncate text-xs font-medium">{title}</h3>}
            {subtitle && (
              <p className="mt-0.5 truncate text-2xs text-muted-foreground">
                {subtitle}
              </p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            {actions}
            {onFilter && (
              <button
                type="button"
                onClick={onFilter}
                aria-label="Filter"
                className="flex size-6 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <Icon icon={SlidersHorizontalIcon} size="xs" />
              </button>
            )}
            {onExpand && (
              <button
                type="button"
                onClick={onExpand}
                aria-label="Open"
                className="flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-105"
              >
                <Icon icon={ArrowUpRightIcon} size="xs" />
              </button>
            )}
          </div>
        </header>
      )}
      <div className={cn("min-h-0 flex-1 px-4 pt-1 pb-4", bodyClassName)}>
        {children}
      </div>
    </motion.section>
  )
}

export { Panel }
