import type { LucideIcon } from "lucide-react"
import { cn } from "cn"

import { Icon } from "@/components/ui/icon"

/**
 * The header of a dashboard card: an icon, a title and a muted line under
 * it, with an optional control on the right.
 *
 * The title stays at the Panel's `text-xs font-medium` so the page greeting
 * above leads and the cards follow. The icon sits on the title's line, in
 * muted ink at the same size as the text, so it names the card without
 * competing with the title.
 */
function CardHeader({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon
  title: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
  className?: string
}) {
  return (
    <header
      className={cn(
        "flex items-center justify-between gap-3 px-4 pt-3.5 pb-2",
        className
      )}
    >
      <div className="min-w-0">
        <h2 className="flex items-center gap-1.5 text-xs font-medium">
          <Icon icon={icon} size="sm" className="text-muted-foreground" />
          <span className="truncate">{title}</span>
        </h2>
        {description && (
          <p className="mt-0.5 truncate text-2xs text-muted-foreground tnum">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  )
}

export { CardHeader }
