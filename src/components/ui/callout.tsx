import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  InfoIcon,
  XCircleIcon,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { cva } from "class-variance-authority"
import type { VariantProps } from "class-variance-authority"
import { cn } from "cn"

import { Icon } from "@/components/ui/icon"

/**
 * An inline notice: the strip Cursor puts above a settings page ("You have
 * limited free Bugbot reviews. Upgrade for unlimited.").
 *
 * This is the one place a tinted fill is correct, because the whole block IS
 * the status. Everywhere else, status colour belongs on a badge or a dot, not
 * on a surface.
 *
 * A callout that a user can dismiss and never see again should not be a
 * callout — that is a toast.
 */

const calloutVariants = cva(
  "flex items-start gap-2 rounded-md border px-3 py-2 text-xs",
  {
    variants: {
      tone: {
        neutral: "border-border bg-card text-secondary-foreground",
        info: "border-transparent bg-info-muted text-info",
        success: "border-transparent bg-success-muted text-success",
        warning: "border-transparent bg-warning-muted text-warning",
        error: "border-transparent bg-error-muted text-error",
      },
    },
    defaultVariants: { tone: "neutral" },
  }
)

const TONE_ICON: Record<string, LucideIcon> = {
  neutral: InfoIcon,
  info: InfoIcon,
  success: CheckCircle2Icon,
  warning: AlertTriangleIcon,
  error: XCircleIcon,
}

function Callout({
  className,
  tone = "neutral",
  icon,
  children,
  action,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof calloutVariants> & {
    icon?: LucideIcon | false
    action?: React.ReactNode
  }) {
  const Glyph = icon === false ? null : (icon ?? TONE_ICON[tone ?? "neutral"])
  return (
    <div
      data-slot="callout"
      role="status"
      className={cn(calloutVariants({ tone }), className)}
      {...props}
    >
      {Glyph && <Icon icon={Glyph} size="sm" className="mt-px" />}
      <div className="flex-1 text-balance">{children}</div>
      {action}
    </div>
  )
}

export { Callout, calloutVariants }
