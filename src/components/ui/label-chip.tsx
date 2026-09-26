import { cn } from "cn"

/**
 * A label: a coloured dot and a word.
 *
 * Linear's, and the reason it is a dot rather than a tinted pill is density.
 * A row carrying three tinted pills has three competing backgrounds in it and
 * the title stops being the thing you read first. A 6px dot gives the label an
 * identity while leaving the row's ink hierarchy intact.
 *
 * The hue is an identity, not a status — `purple` means "the Design label",
 * not "informational". That is why these read from the label palette and not
 * from the status roles.
 */

export type LabelTone =
  "grey" | "indigo" | "purple" | "cyan" | "green" | "amber" | "orange" | "red"

const DOT: Record<LabelTone, string> = {
  grey: "bg-label-grey",
  indigo: "bg-label-indigo",
  purple: "bg-label-purple",
  cyan: "bg-label-cyan",
  green: "bg-label-green",
  amber: "bg-label-amber",
  orange: "bg-label-orange",
  red: "bg-label-red",
}

function LabelChip({
  tone = "grey",
  children,
  className,
  ...props
}: React.ComponentProps<"span"> & { tone?: LabelTone }) {
  return (
    <span
      data-slot="label-chip"
      data-tone={tone}
      className={cn(
        "inline-flex h-control-xs w-fit shrink-0 items-center gap-1.5",
        "rounded-full border border-border px-2",
        "text-2xs font-medium whitespace-nowrap text-secondary-foreground select-none",
        className
      )}
      {...props}
    >
      <span
        aria-hidden="true"
        className={cn("size-1.5 shrink-0 rounded-full", DOT[tone])}
      />
      {children}
    </span>
  )
}

/** The bare dot, for a rail item or a legend where the word is already there. */
function LabelDot({
  tone = "grey",
  className,
  ...props
}: React.ComponentProps<"span"> & { tone?: LabelTone }) {
  return (
    <span
      data-slot="label-dot"
      aria-hidden="true"
      className={cn("size-1.5 shrink-0 rounded-full", DOT[tone], className)}
      {...props}
    />
  )
}

export { LabelChip, LabelDot }
