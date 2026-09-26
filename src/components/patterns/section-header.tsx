import { cn } from "cn"

/**
 * The small-caps label above a group of rows or cards.
 *
 * `micro` rather than a heading: this labels a GROUP, and uppercase with
 * tracking is the one place this system allows it. A heading here would
 * compete with the page title.
 */
function SectionHeader({
  className,
  title,
  description,
  action,
  ...props
}: React.ComponentProps<"div"> & {
  title: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <div
      data-slot="section-header"
      className={cn("flex items-end justify-between gap-3 pb-2", className)}
      {...props}
    >
      <div className="flex flex-col gap-0.5">
        <span className="micro">{title}</span>
        {description && <span className="caption">{description}</span>}
      </div>
      {action && <div className="shrink-0 pb-0.5">{action}</div>}
    </div>
  )
}

/**
 * The title block at the top of a page: name, one line of what it is, and at
 * most one primary action.
 */
function PageHeader({
  className,
  title,
  description,
  action,
  ...props
}: React.ComponentProps<"div"> & {
  title: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <div
      data-slot="page-header"
      className={cn(
        "flex flex-wrap items-end justify-between gap-3 pb-4",
        className
      )}
      {...props}
    >
      <div className="min-w-0">
        <h1 className="truncate text-xl font-medium tracking-tight">{title}</h1>
        {description && (
          <p className="mt-0.5 truncate text-2xs text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

export { PageHeader, SectionHeader }
