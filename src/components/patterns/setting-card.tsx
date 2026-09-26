import { ChevronRightIcon } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { cn } from "cn"

import { Icon } from "@/components/ui/icon"

/**
 * The atom every Cursor settings surface is built from.
 *
 * A bordered card containing divided rows. Each row is a label with an
 * optional description on the left, and exactly one control hard-right: a
 * switch, a select, a button, a badge, or a chevron.
 *
 * Why it is a component and not a div with two children: the alignment is the
 * whole point. Every row in a card shares one baseline for its label and one
 * right edge for its control, and the moment a screen hand-rolls one row the
 * column breaks. Six screens in this app show settings; they all use this.
 *
 * Rows are `min-h`, not `h` — a two-line description grows the row rather
 * than clipping.
 */

function SettingCard({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="setting-card"
      className={cn(
        "divide-y divide-hairline overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10",
        className
      )}
      {...props}
    />
  )
}

type SettingRowProps = React.ComponentProps<"div"> & {
  label: React.ReactNode
  description?: React.ReactNode
  /** The control. Goes hard-right, vertically centred against the label. */
  control?: React.ReactNode
  icon?: LucideIcon
}

function SettingRow({
  className,
  label,
  description,
  control,
  icon,
  children,
  ...props
}: SettingRowProps) {
  return (
    <div
      data-slot="setting-row"
      className={cn("flex min-h-9 items-center gap-3 px-3 py-2", className)}
      {...props}
    >
      {icon && <Icon icon={icon} size="sm" className="text-muted-foreground" />}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="label">{label}</span>
        {description && <span className="caption">{description}</span>}
      </div>
      {control && <div className="shrink-0">{control}</div>}
      {children}
    </div>
  )
}

/**
 * A row that navigates rather than sets. The whole row is the target, so the
 * chevron is decoration — it must not be the only thing that is clickable.
 */
function DrillInRow({
  className,
  label,
  description,
  icon,
  value,
  ...props
}: Omit<React.ComponentProps<"button">, "value"> & {
  label: React.ReactNode
  description?: React.ReactNode
  icon?: LucideIcon
  value?: React.ReactNode
}) {
  return (
    <button
      type="button"
      data-slot="drill-in-row"
      className={cn(
        "flex min-h-9 w-full items-center gap-3 px-3 py-2 text-left",
        "duration-fast transition-colors ease-out-strong hover:bg-element-hover",
        className
      )}
      {...props}
    >
      {icon && <Icon icon={icon} size="sm" className="text-muted-foreground" />}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="label">{label}</span>
        {description && <span className="caption">{description}</span>}
      </div>
      {value && <span className="shrink-0 caption">{value}</span>}
      <Icon
        icon={ChevronRightIcon}
        size="sm"
        className="shrink-0 text-muted-foreground"
      />
    </button>
  )
}

export { DrillInRow, SettingCard, SettingRow }
