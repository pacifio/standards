import { cn } from "cn"

/**
 * The gallery's own furniture.
 *
 * Deliberately built from the same primitives it is displaying, so a
 * regression in Badge or Separator shows up in the page that documents it.
 */

function Specimen({
  className,
  title,
  note,
  children,
  ...props
}: React.ComponentProps<"section"> & {
  title: string
  note?: React.ReactNode
}) {
  return (
    <section
      data-slot="specimen"
      className={cn("flex flex-col gap-3 py-6", className)}
      {...props}
    >
      <div className="flex flex-col gap-1">
        <h3 className="label font-semibold">{title}</h3>
        {note && <p className="max-w-prose caption text-balance">{note}</p>}
      </div>
      <div className="flex flex-wrap items-center gap-3 rounded-md border border-border bg-card p-4">
        {children}
      </div>
    </section>
  )
}

/** A labelled cell inside a specimen — one variant, one state. */
function Sample({
  label,
  children,
  className,
}: {
  label: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex min-w-20 flex-col items-start gap-2", className)}>
      <div className="min-h-control-lg flex items-center">{children}</div>
      <span className="caption">{label}</span>
    </div>
  )
}

/** A token row: the swatch or specimen, its name, and its resolved value. */
function TokenRow({
  name,
  value,
  children,
}: {
  name: string
  value?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-3 border-b border-border-subtle py-2 last:border-0">
      <div className="flex w-32 shrink-0 items-center">{children}</div>
      <code className="w-56 shrink-0 code text-secondary-foreground">
        {name}
      </code>
      {value && <span className="truncate mono caption">{value}</span>}
    </div>
  )
}

export { Sample, Specimen, TokenRow }
