"use client"

import { useMemo, useState } from "react"
import { motion } from "motion/react"
import { ArrowDownIcon, ArrowUpIcon, SearchIcon } from "lucide-react"
import { cn } from "cn"

import { Icon } from "@/components/ui/icon"
import { ScrollFade } from "@/components/ui/scroll-fade"

/**
 * The data table. Auberge's `data-table.tsx`, without the TanStack
 * dependency — a mock with a dozen rows needs sort-by-column and a search
 * box, and both are twenty lines of state.
 *
 * Shape: a ringed container; a 40px toolbar band; a sticky, blurred header
 * row in `.micro`; hairline-divided rows that fade in with a capped
 * stagger; and a 36px footer band. Rows highlight on hover and take the
 * `element-selected` wash when chosen. Right-aligned cells are tabular.
 */

export type Column<T> = {
  id: string
  header: React.ReactNode
  cell: (row: T) => React.ReactNode
  /** Enables the sort toggle. Return a comparable value. */
  sortValue?: (row: T) => string | number
  align?: "left" | "right"
  className?: string
}

type Sort = { id: string; dir: "asc" | "desc" } | null

function DataTable<T>({
  rows,
  columns,
  rowId,
  selectedId,
  onRowClick,
  toolbar,
  footer,
  className,
}: {
  rows: Array<T>
  columns: Array<Column<T>>
  rowId: (row: T) => string
  selectedId?: string
  onRowClick?: (row: T) => void
  toolbar?: React.ReactNode
  footer?: React.ReactNode
  className?: string
}) {
  const [sort, setSort] = useState<Sort>(null)

  const sorted = useMemo(() => {
    if (!sort) return rows
    const col = columns.find((c) => c.id === sort.id)
    if (!col?.sortValue) return rows
    const get = col.sortValue
    return [...rows].sort((a, b) => {
      const av = get(a)
      const bv = get(b)
      const r = av < bv ? -1 : av > bv ? 1 : 0
      return sort.dir === "asc" ? r : -r
    })
  }, [rows, columns, sort])

  function toggle(id: string) {
    setSort((s) =>
      s?.id === id
        ? s.dir === "asc"
          ? { id, dir: "desc" }
          : null
        : { id, dir: "asc" }
    )
  }

  return (
    <div
      data-slot="data-table"
      className={cn(
        // A container, so columns can hide by the TABLE's width rather than
        // the viewport's — the dock and the interface scale both change one
        // without the other.
        "@container flex min-h-0 flex-col overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10",
        className
      )}
    >
      {toolbar && (
        <div className="flex h-10 shrink-0 items-center gap-2 border-b border-hairline px-3">
          {toolbar}
        </div>
      )}

      {/* Both axes: when the fixed columns outgrow the container the table
          scrolls sideways (scrollbars are hidden, so it reads as a pan)
          rather than clipping under the ring. */}
      <ScrollFade className="min-h-0 flex-1 overflow-x-auto">
        <table className="w-full border-separate border-spacing-0 text-xs">
          <thead className="sticky top-0 z-panel">
            <tr>
              {columns.map((col) => {
                const active = sort?.id === col.id
                const sortable = !!col.sortValue
                return (
                  <th
                    key={col.id}
                    scope="col"
                    className={cn(
                      "border-b border-hairline bg-surface/95 px-3 py-2 text-left micro whitespace-nowrap backdrop-blur-xl",
                      col.align === "right" && "text-right",
                      sortable &&
                        "cursor-pointer select-none hover:text-foreground",
                      col.className
                    )}
                    onClick={sortable ? () => toggle(col.id) : undefined}
                    aria-sort={
                      active
                        ? sort.dir === "asc"
                          ? "ascending"
                          : "descending"
                        : undefined
                    }
                  >
                    <span
                      className={cn(
                        "inline-flex items-center gap-1",
                        col.align === "right" && "flex-row-reverse"
                      )}
                    >
                      {col.header}
                      {active && (
                        <Icon
                          icon={
                            sort.dir === "asc" ? ArrowUpIcon : ArrowDownIcon
                          }
                          size="xs"
                          className="size-2.5"
                        />
                      )}
                    </span>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, index) => {
              const id = rowId(row)
              const selected = id === selectedId
              return (
                <motion.tr
                  key={id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: Math.min(index, 18) * 0.012 }}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  aria-selected={selected || undefined}
                  className={cn(
                    "group/row transition-colors",
                    selected ? "bg-element-selected" : "hover:bg-element-hover",
                    onRowClick && "cursor-pointer"
                  )}
                >
                  {columns.map((col) => (
                    <td
                      key={col.id}
                      className={cn(
                        "border-b border-hairline px-3 py-2 align-middle",
                        col.align === "right" && "text-right tnum",
                        col.className
                      )}
                    >
                      {col.cell(row)}
                    </td>
                  ))}
                </motion.tr>
              )
            })}
          </tbody>
        </table>
      </ScrollFade>

      {footer && (
        <div className="flex h-9 shrink-0 items-center gap-2 border-t border-hairline px-3 text-2xs text-muted-foreground">
          {footer}
        </div>
      )}
    </div>
  )
}

/** The toolbar search — a pill, like every filter control. */
function TableSearch({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <div className={cn("relative", className)}>
      <Icon
        icon={SearchIcon}
        size="xs"
        className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground"
      />
      <input
        type="search"
        className="h-7 w-45 rounded-full border border-border bg-card pr-2.5 pl-7 text-2xs outline-none placeholder:text-muted-foreground focus-visible:border-border-strong"
        {...props}
      />
    </div>
  )
}

export { DataTable, TableSearch }
