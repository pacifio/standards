import { cn } from "cn"

/**
 * A monospace run.
 *
 * `inline` for a path or a flag inside a sentence; `block` for a snippet.
 * Both use the `code` text style, which turns on the `zero` and `ss02` font
 * features — slashed zero and disambiguated glyphs, so `0`/`O` and `1`/`l`
 * are distinguishable in a session ID.
 */
function Code({
  className,
  variant = "inline",
  ...props
}: React.ComponentProps<"code"> & { variant?: "inline" | "block" }) {
  return (
    <code
      data-slot="code"
      data-variant={variant}
      className={cn(
        "code",
        variant === "inline" &&
          "rounded-sm border border-border-subtle bg-card px-1 py-px text-secondary-foreground",
        variant === "block" &&
          "block overflow-x-auto rounded-md border border-border bg-panel p-3 text-secondary-foreground",
        className
      )}
      {...props}
    />
  )
}

/** A +/- pair, as shown on a session row. Tabular so columns do not jitter. */
function DiffStat({
  added,
  removed,
  className,
  ...props
}: React.ComponentProps<"span"> & { added: number; removed: number }) {
  return (
    <span
      data-slot="diff-stat"
      className={cn(
        "inline-flex items-center gap-1.5 text-2xs tnum",
        className
      )}
      {...props}
    >
      <span className="text-diff-added-foreground">+{added}</span>
      <span className="text-diff-removed-foreground">−{removed}</span>
    </span>
  )
}

export { Code, DiffStat }
