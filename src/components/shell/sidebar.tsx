"use client"

import { createContext, useContext, useId, useState } from "react"
import { Link, useRouterState } from "@tanstack/react-router"
import { AnimatePresence, motion } from "motion/react"
import { ChevronRightIcon, SearchIcon } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { cn } from "cn"

import { SPRING_PILL, SPRING_RAIL } from "@/lib/motion"
import { Icon } from "@/components/ui/icon"
import { ScrollFade } from "@/components/ui/scroll-fade"

/**
 * The left rail, on TanStack Router.
 *
 * Three things make it feel like one object rather than a list of links:
 *
 * 1. THE ACTIVE STATE IS ONE ELEMENT. A single `motion.span` with a shared
 *    `layoutId` renders behind whichever row is current, so navigating
 *    makes it physically slide to the new row rather than cross-fading two
 *    backgrounds. The `railId` comes from `useId` at the rail level so every
 *    row agrees on it.
 *
 * 2. WIDTH IS A SPRING. `motion.aside` animates between `14rem` and
 *    `3.25rem` — rem strings, so the rail follows the interface scale with
 *    no JS multiplication. Labels fade on their own, faster curve so text is
 *    gone before the rail is narrow enough to clip it.
 *
 * 3. CHILDREN HANG OFF A RAIL. A parent with children is a disclosure, not
 *    a destination; its children drop in on a hairline with L-connectors,
 *    and the connector turns to ink on the active one.
 */

const RAIL_WIDTH = "14rem"
const RAIL_WIDTH_COLLAPSED = "3.25rem"

type RailContext = {
  collapsed: boolean
  railId: string
  pathname: string
  search: Record<string, unknown>
}
const SidebarContext = createContext<RailContext>({
  collapsed: false,
  railId: "",
  pathname: "",
  search: {},
})

function useSidebar() {
  return useContext(SidebarContext)
}

function Sidebar({
  collapsed = false,
  className,
  children,
  ...props
}: Omit<React.ComponentProps<typeof motion.nav>, "children"> & {
  collapsed?: boolean
  children: React.ReactNode
}) {
  const railId = useId()
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const search = useRouterState({
    select: (s) => s.location.search as Record<string, unknown>,
  })

  return (
    <SidebarContext.Provider value={{ collapsed, railId, pathname, search }}>
      <motion.nav
        data-slot="sidebar"
        data-panel=""
        data-collapsed={collapsed || undefined}
        aria-label="Main"
        initial={false}
        animate={{ width: collapsed ? RAIL_WIDTH_COLLAPSED : RAIL_WIDTH }}
        transition={SPRING_RAIL}
        className={cn(
          "relative z-panel flex h-full shrink-0 flex-col",
          className
        )}
        {...props}
      >
        {children}
      </motion.nav>
    </SidebarContext.Provider>
  )
}

/**
 * The workspace row. It sits on the shell's canvas ABOVE the curved panel,
 * as the Atlas desktop app does — the switcher is the frame's, the panel
 * below is the navigation's.
 */
function SidebarHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-header"
      className={cn("flex h-10 shrink-0 items-center gap-1 pb-2", className)}
      {...props}
    />
  )
}

/**
 * The curved segment the navigation lives in: search, groups and footer
 * inside one ringed panel on the page's own background, so the rail reads as
 * a surface with depth rather than a strip of links along the window edge.
 */
function SidebarPanel({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-panel"
      className={cn(
        // The same panel expanded and collapsed: it only changes width, so
        // the rail's spring animates one shape rather than swapping two.
        "flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-shell-edge bg-background pt-2",
        className
      )}
      {...props}
    />
  )
}

/** The ⌘K affordance. Collapsed, it is just the glyph. */
function SidebarSearch({ onOpen }: { onOpen: () => void }) {
  const { collapsed } = useSidebar()
  return (
    <div className="px-2 pb-2">
      {/* The Atlas desktop app's search field (comms-home.tsx): a recessed
          well at the panel's own radius, a quiet glyph and a quiet prompt.
          It opens the command menu rather than filtering in place, so ⌘K
          is announced to assistive tech instead of printed as a chip. */}
      <button
        type="button"
        onClick={onOpen}
        aria-keyshortcuts="Meta+K"
        className={cn(
          "flex h-7 w-full items-center gap-1.5 rounded-xl border border-border bg-surface px-2.5 text-xs text-disabled",
          "duration-fast transition-colors ease-out-strong hover:border-border-strong hover:text-muted-foreground",
          collapsed && "justify-center px-0"
        )}
      >
        <Icon icon={SearchIcon} size="xs" />
        {!collapsed && (
          <span className="flex-1 truncate text-left">Jump to anything…</span>
        )}
      </button>
    </div>
  )
}

function SidebarBody({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <ScrollFade
      data-slot="sidebar-body"
      fade={24}
      className={cn("min-h-0 flex-1 px-2 pb-2", className)}
      {...props}
    />
  )
}

function SidebarFooter({ className, ...props }: React.ComponentProps<"div">) {
  const { collapsed } = useSidebar()
  return (
    <div
      data-slot="sidebar-footer"
      className={cn(
        "flex items-center gap-1 border-t border-sidebar-border p-2",
        collapsed && "flex-col",
        className
      )}
      {...props}
    />
  )
}

/** A labelled run of rows. Collapsed, the label becomes a short rule. */
function SidebarGroup({
  label,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & { label?: React.ReactNode }) {
  const { collapsed } = useSidebar()
  return (
    // Generous air between groups, as the Atlas app spaces its sections:
    // the gap is what makes a group read as a group.
    <div
      data-slot="sidebar-group"
      className={cn(collapsed ? "mb-3" : "mb-6", className)}
      {...props}
    >
      {label &&
        (collapsed ? (
          <div
            aria-hidden="true"
            className="mx-auto mb-1.5 h-px w-5 bg-sidebar-border"
          />
        ) : (
          <div className="px-2 pb-2 text-xs font-medium text-muted-foreground">
            {label}
          </div>
        ))}
      <ul className="space-y-px">{children}</ul>
    </div>
  )
}

export type SidebarChild = {
  label: string
  to: string
  search?: Record<string, unknown>
  icon: LucideIcon
}

type SidebarItemProps = {
  icon?: LucideIcon
  /** A rendered glyph — a status icon — where a Lucide icon does not fit. */
  mark?: React.ReactNode
  label: string
  to?: string
  search?: Record<string, unknown>
  /** Right-aligned count. Hidden at 0. */
  count?: number
  /** A one-glyph marker: "AI", a live dot, a beta mark. */
  badge?: "ai" | "live" | "beta"
  /** Makes the row a disclosure. */
  children?: Array<SidebarChild>
  /** A disclosure that starts open. It still opens itself for an active child. */
  defaultOpen?: boolean
  /** Considered active when the pathname matches — defaults to `to`. */
  match?: (pathname: string) => boolean
  className?: string
}

function SidebarItem({
  icon,
  mark,
  label,
  to,
  search,
  count,
  badge,
  children,
  defaultOpen = false,
  match,
  className,
}: SidebarItemProps) {
  const { collapsed, railId, pathname, search: current } = useSidebar()
  const hasChildren = !!children?.length
  // A child is active on its path AND its own search params, so five
  // projects that share /projects are not all lit at once.
  const isChildActive = (c: SidebarChild) =>
    pathname === c.to &&
    Object.entries(c.search ?? {}).every(([k, v]) => current[k] === v)
  const childActive = hasChildren && children.some(isChildActive)
  const [open, setOpen] = useState(defaultOpen || childActive)

  const selfActive = match
    ? match(pathname)
    : to !== undefined && pathname === to
  // Parents are disclosures, not destinations. Only light the branch when it
  // is closed, so the parent and its child never highlight together.
  const highlighted = hasChildren
    ? (childActive || selfActive) && (!open || collapsed)
    : selfActive

  const row = (
    <span
      className={cn(
        "relative flex h-7 w-full items-center gap-2 rounded-md px-2 text-2xs",
        "duration-fast transition-colors ease-out-strong",
        collapsed && "justify-center px-0",
        highlighted
          ? "font-medium text-foreground"
          : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
        className
      )}
    >
      {highlighted && (
        <motion.span
          data-slot="sidebar-pill"
          layoutId={railId}
          transition={SPRING_PILL}
          className="absolute inset-0 rounded-md bg-sidebar-accent"
        />
      )}
      {icon ? (
        <Icon icon={icon} size="sm" className="relative z-10" />
      ) : (
        <span className="relative z-10 flex size-3.5 shrink-0 items-center justify-center">
          {mark}
        </span>
      )}
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12, ease: "easeOut" }}
            className="relative z-10 flex min-w-0 flex-1 items-center gap-2"
          >
            <span className="flex-1 truncate text-left">{label}</span>
            {badge && (
              <span
                className={cn(
                  "rounded-full px-1 text-4xs font-medium",
                  badge === "ai" && "bg-primary-muted text-foreground",
                  badge === "live" && "bg-success-muted text-success",
                  badge === "beta" && "bg-muted text-muted-foreground"
                )}
              >
                {badge === "ai" ? "AI" : badge === "live" ? "●" : "β"}
              </span>
            )}
            {/* Unread is the one number in the rail that asks for you, so it
                is a solid red pill — like a notification badge — not a grey
                whisper. */}
            {count !== undefined && count > 0 && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-3xs font-semibold text-destructive-foreground tnum">
                {count}
              </span>
            )}
            {hasChildren && (
              <motion.span
                animate={{ rotate: open ? 90 : 0 }}
                transition={{ duration: 0.18 }}
                className="text-muted-foreground"
              >
                <Icon icon={ChevronRightIcon} size="xs" />
              </motion.span>
            )}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  )

  return (
    <li>
      {hasChildren && !collapsed ? (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="w-full text-left outline-none"
        >
          {row}
        </button>
      ) : to ? (
        <Link
          to={to}
          search={search as never}
          title={collapsed ? label : undefined}
          className="block outline-none"
        >
          {row}
        </Link>
      ) : (
        row
      )}

      {/* Children hang off an animated rail with L-connectors. */}
      <AnimatePresence initial={false}>
        {hasChildren && open && !collapsed && (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="relative overflow-hidden pl-3.75"
          >
            <span className="absolute top-0 bottom-3 left-3.75 w-px bg-sidebar-border" />
            {children.map((child, index) => {
              const active = isChildActive(child)
              return (
                <motion.li
                  key={`${child.to}#${child.label}`}
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03, duration: 0.18 }}
                  className="relative"
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute top-1/2 left-0 h-px w-2.5 transition-colors",
                      active ? "bg-foreground" : "bg-sidebar-border"
                    )}
                  />
                  {active && (
                    <span className="absolute top-1 bottom-1 left-0 w-px bg-foreground" />
                  )}
                  <Link
                    to={child.to}
                    search={child.search as never}
                    className={cn(
                      "ml-3.5 flex h-7 items-center gap-2 rounded-md px-2 text-2xs",
                      "duration-fast transition-colors ease-out-strong",
                      active
                        ? "bg-sidebar-accent font-medium text-foreground"
                        : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
                    )}
                  >
                    <Icon icon={child.icon} size="sm" />
                    <span className="truncate">{child.label}</span>
                  </Link>
                </motion.li>
              )
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </li>
  )
}

export {
  Sidebar,
  SidebarBody,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarItem,
  SidebarPanel,
  SidebarSearch,
  useSidebar,
}
