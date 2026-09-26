import { cn } from "cn"

/**
 * The three-pane reading layout: list, detail, properties.
 *
 * Linear's shape, and the reason it works for Atlas is that a session board is
 * the same problem as an issue list — a long list of short rows where you want
 * to move through them without losing your place. The current `/timeline`
 * already puts a board beside a detail pane; this names the layout so
 * `/inbox`, `/chat` and `/timeline` stop inventing it separately.
 *
 * The list pane is a fixed 320px. Fluid list panes re-wrap every row title on
 * every window resize, which makes scanning feel unstable.
 */

function ListDetail({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="list-detail"
      className={cn("flex min-h-0 flex-1", className)}
      {...props}
    />
  )
}

/**
 * `narrow` is the Inbox shape: a 320px index beside a read pane, where each
 * row is an avatar, a title and a line of preview.
 *
 * `wide` is the Issues shape: the list IS the screen, and the detail is the
 * narrower companion. A Linear-style row carries priority, id, status, title,
 * labels, a diff and an assignee — roughly 700px of content — so putting it in
 * a 320px column truncates the title to nothing while the metadata keeps its
 * space. Which is exactly what happened here the first time.
 */
function ListPane({
  className,
  width = "narrow",
  ...props
}: React.ComponentProps<"div"> & { width?: "narrow" | "wide" }) {
  return (
    <div
      data-slot="list-pane"
      data-panel=""
      data-width={width}
      className={cn(
        "flex flex-col border-r border-border-subtle",
        width === "narrow" && "w-list-pane shrink-0",
        width === "wide" && "min-w-0 flex-1",
        // Below lg the detail pane takes the whole width and the list is a
        // separate screen; the mock shows the list.
        "max-lg:w-full max-lg:flex-1 max-lg:border-r-0",
        className
      )}
      {...props}
    />
  )
}

/** `companion` pairs with a wide list: fixed, and narrower than the list. */
function DetailPane({
  className,
  width = "fill",
  ...props
}: React.ComponentProps<"div"> & { width?: "fill" | "companion" }) {
  return (
    <div
      data-slot="detail-pane"
      data-panel=""
      data-width={width}
      className={cn(
        "flex flex-col max-lg:hidden",
        width === "fill" && "min-w-0 flex-1",
        width === "companion" &&
          "w-companion shrink-0 border-l border-border-subtle",
        className
      )}
      {...props}
    />
  )
}

/** The right rail of attributes on a detail view. Hidden under xl. */
function PropertiesPane({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <aside
      data-slot="properties-pane"
      data-panel=""
      className={cn(
        "flex w-properties shrink-0 flex-col gap-4 overflow-y-auto border-l border-border-subtle p-3 max-xl:hidden",
        className
      )}
      {...props}
    />
  )
}

/** One attribute: dim label on the left, value on the right. */
function PropertyRow({
  className,
  label,
  children,
  ...props
}: React.ComponentProps<"div"> & { label: React.ReactNode }) {
  return (
    <div
      data-slot="property-row"
      className={cn("min-h-control-sm flex items-center gap-2", className)}
      {...props}
    >
      <span className="w-20 shrink-0 caption">{label}</span>
      <div className="flex min-w-0 flex-1 items-center gap-1.5 text-xs">
        {children}
      </div>
    </div>
  )
}

export { DetailPane, ListDetail, ListPane, PropertiesPane, PropertyRow }
