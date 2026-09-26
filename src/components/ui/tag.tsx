import { cn } from "cn"

import { TAG_CLASS, HUE_VAR } from "@/lib/hue"
import type { LabelTone } from "@/mock/types"

/**
 * The hue-coded identity pill. Auberge's `.tag`.
 *
 * A hue is an IDENTITY, not a status — `purple` means "the Design label",
 * not "informational". The fill and edge are the hue mixed at per-theme
 * ratios (`--tag-bg-mix`, `--tag-border-mix`), so one tone reads as a tint
 * on light and a glow on dark without a second set of colours. For status
 * use `<Badge>`; for a stable hue for any entity use `hueFor(id)`.
 */
function Tag({
  hue = "grey",
  dot = false,
  className,
  children,
  ...props
}: React.ComponentProps<"span"> & { hue?: LabelTone; dot?: boolean }) {
  return (
    <span
      data-slot="tag"
      data-hue={hue}
      className={cn("tag", TAG_CLASS[hue], className)}
      {...props}
    >
      {dot && <span className="size-1 rounded-full bg-current opacity-80" />}
      {children}
    </span>
  )
}

/** The bare dot, for a rail item or a legend where the word is already there. */
function HueDot({
  hue,
  className,
  ...props
}: React.ComponentProps<"span"> & { hue: LabelTone }) {
  return (
    <span
      data-slot="hue-dot"
      aria-hidden="true"
      className={cn("size-1.5 shrink-0 rounded-full", className)}
      style={{ background: HUE_VAR[hue] }}
      {...props}
    />
  )
}

export { HueDot, Tag }
