import type { LucideIcon } from "lucide-react"
import { cn } from "cn"

import { Icon } from "@/components/ui/icon"

/**
 * What a pane says when it has nothing to show.
 *
 * Deliberately quiet: a large illustration in an empty inbox is a reward for
 * having no work, which is the wrong emphasis in a tool people live in. One
 * dim glyph, one sentence, and — only when there is a real next step — one
 * action.
 *
 * The copy rule: say what would be here, not that there is nothing here.
 * "No sessions in the last 7 days" beats "Nothing found".
 */
function EmptyState({
  className,
  icon,
  title,
  description,
  action,
  ...props
}: React.ComponentProps<"div"> & {
  icon?: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div
      data-slot="empty-state"
      className={cn(
        "flex flex-col items-center justify-center gap-2 px-6 py-12 text-center",
        className
      )}
      {...props}
    >
      {icon && <Icon icon={icon} size="xl" className="text-disabled" />}
      <div className="flex flex-col gap-1">
        <p className="label">{title}</p>
        {description && (
          <p className="max-w-xs caption text-balance">{description}</p>
        )}
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  )
}

export { EmptyState }
