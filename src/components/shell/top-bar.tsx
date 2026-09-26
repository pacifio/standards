import { cn } from "cn"

/**
 * The 40px bar above a pane: where you are on the left, what you can do on
 * the right.
 *
 * It is a border-bottom and nothing else — no fill, no shadow. The bar is not
 * a surface, it is a rule with content on it. Giving it its own background
 * makes every screen look like it has two headers stacked.
 *
 * Actions are icon-only. A row of labelled buttons here competes with the
 * breadcrumb for the same horizontal space, and the breadcrumb is the thing
 * that tells you where you are.
 */
function TopBar({
  className,
  children,
  actions,
  ...props
}: React.ComponentProps<"header"> & { actions?: React.ReactNode }) {
  return (
    <header
      data-slot="top-bar"
      className={cn(
        "flex h-topbar min-h-topbar shrink-0 items-center gap-2 border-b border-border-subtle px-3",
        className
      )}
      {...props}
    >
      <div className="flex min-w-0 flex-1 items-center gap-1.5">{children}</div>
      {actions && (
        <div className="flex shrink-0 items-center gap-0.5">{actions}</div>
      )}
    </header>
  )
}

/** A crumb. The last one is the current page and is not a link. */
function Crumb({
  className,
  current,
  ...props
}: React.ComponentProps<"span"> & { current?: boolean }) {
  return (
    <span
      data-slot="crumb"
      className={cn(
        "flex items-center gap-1.5 truncate text-xs",
        current ? "font-medium text-foreground" : "text-secondary-foreground",
        className
      )}
      {...props}
    />
  )
}

function CrumbSeparator() {
  return (
    <span aria-hidden="true" className="text-disabled">
      /
    </span>
  )
}

export { Crumb, CrumbSeparator, TopBar }
