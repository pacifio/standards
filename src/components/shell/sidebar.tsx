"use client"

import { createContext, useContext } from "react"
import { Link } from "@tanstack/react-router"
import { AnimatePresence, motion } from "motion/react"
import { ChevronRightIcon } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { cn } from "cn"

import { Collapsible } from "@base-ui/react/collapsible"
import { Icon } from "@/components/ui/icon"
import { ScrollFade } from "@/components/ui/scroll-fade"

/**
 * The left rail.
 *
 * Structure is the Atlas desktop app's: a header carrying the workspace
 * switcher and its actions, a scrolling body of ungrouped top-level
 * destinations followed by collapsible groups, and a footer. The rows are
 * the desktop app's too — 34px for a single line, 44px when a row carries a
 * subtitle (a branch name under a repo), with a trailing slot for a count or
 * a diff badge.
 *
 * DENSITY. An earlier version of this ran 28px rows with 2px between them,
 * which packed ~20 destinations into a screen and made none of them findable.
 * A navigation rail is not a data table: it is read by shape, not scanned by
 * row, and shape needs air. 34px rows, 2px within a group, 24px between
 * groups.
 *
 * COLLAPSE. The rail animates between full width and an icon rail. Width is
 * animated by `motion` rather than a CSS transition because the labels have
 * to fade on a different curve to the width — a label that fades linearly
 * while the rail eases looks like it is sliding out of a letterbox — and
 * because `AnimatePresence` gives the labels a real exit rather than
 * snapping them off at the end.
 */

const SIDEBAR_WIDTH = 240
const SIDEBAR_WIDTH_COLLAPSED = 56

/** Our named curve, in the array form motion wants. */
const EASE_DRAWER = [0.32, 0.72, 0, 1] as const

type SidebarState = { collapsed: boolean }
const SidebarContext = createContext<SidebarState>({ collapsed: false })

function useSidebar() {
  return useContext(SidebarContext)
}

function Sidebar({
  collapsed = false,
  className,
  children,
  ...props
}: React.ComponentProps<typeof motion.nav> & { collapsed?: boolean }) {
  return (
    <SidebarContext.Provider value={{ collapsed }}>
      <motion.nav
        data-slot="sidebar"
        data-panel=""
        data-collapsed={collapsed || undefined}
        aria-label="Main"
        initial={false}
        animate={{ width: collapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH }}
        transition={{ duration: 0.26, ease: EASE_DRAWER }}
        className={cn(
          "flex h-full shrink-0 flex-col overflow-hidden bg-sidebar",
          className
        )}
        {...props}
      >
        {children}
      </motion.nav>
    </SidebarContext.Provider>
  )
}

function SidebarHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-header"
      className={cn(
        "flex h-topbar shrink-0 items-center gap-0.5 px-2",
        className
      )}
      {...props}
    />
  )
}

/**
 * The scrolling middle.
 *
 * The fades are siblings of the scroller, not children — `backdrop-filter`
 * samples what is painted behind an element, so a band inside the scroll
 * container would travel with the content and sample nothing.
 */
function SidebarBody({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className="relative min-h-0 flex-1">
      <div
        data-slot="sidebar-body"
        className={cn(
          "hide-scrollbar h-full overflow-y-auto px-2 pt-2 pb-6",
          className
        )}
        {...props}
      >
        {children}
      </div>
      <ScrollFade edge="top" />
      <ScrollFade edge="bottom" />
    </div>
  )
}

function SidebarFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-footer"
      className={cn(
        "flex h-control-xl shrink-0 items-center justify-between gap-2 px-3",
        className
      )}
      {...props}
    />
  )
}

/** A run of items with no heading — the top-level destinations. */
function SidebarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-group"
      className={cn("flex flex-col gap-0.5", className)}
      {...props}
    />
  )
}

/**
 * A collapsible group: Workspace, Recent, Projects.
 *
 * The heading itself is the trigger. A 90px label with a 14px hit target on
 * its chevron is the kind of thing that tests fine and feels broken.
 *
 * Collapsed, the heading is replaced by a hairline: the group boundary still
 * matters when only icons are showing, but the word cannot fit.
 */
function SidebarSection({
  className,
  title,
  action,
  defaultOpen = true,
  children,
  ...props
}: Omit<React.ComponentProps<"div">, "title"> & {
  title: React.ReactNode
  action?: React.ReactNode
  defaultOpen?: boolean
}) {
  const { collapsed } = useSidebar()

  /*
    One Collapsible instance across both rail states, deliberately.

    The first version swapped in a different tree when the rail collapsed and
    rendered `children` directly — which bypassed the panel and so revealed
    every item belonging to a CLOSED group. Collapsing the rail silently grew
    the nav from 11 items to 18. Keeping the same Collapsible mounted means
    the open/closed state survives the transition and the nav contains the
    same things at both widths; only the heading is swapped for a rule.
  */
  return (
    <Collapsible.Root defaultOpen={defaultOpen}>
      <div
        data-slot="sidebar-section"
        className={cn(collapsed ? "pt-4" : "pt-6", className)}
        {...props}
      >
        {collapsed ? (
          // The group boundary still matters when only icons are showing,
          // but the word cannot fit.
          <div aria-hidden="true" className="mx-2 mb-2 h-px bg-border-subtle" />
        ) : (
          <div className="group/section flex h-control-sm items-center gap-1 px-2">
            <Collapsible.Trigger
              className={cn(
                "group/trigger flex flex-1 items-center gap-1 rounded-sm text-left",
                "text-2xs font-medium text-muted-foreground",
                "duration-fast transition-colors ease-out-strong hover:text-secondary-foreground"
              )}
            >
              {title}
              <Icon
                icon={ChevronRightIcon}
                size="xs"
                className="duration-fast transition-transform ease-out-strong group-data-[panel-open]/trigger:rotate-90"
              />
            </Collapsible.Trigger>
            {action && (
              <span className="duration-fast opacity-0 transition-opacity group-hover/section:opacity-100">
                {action}
              </span>
            )}
          </div>
        )}
        <Collapsible.Panel className="flex flex-col gap-0.5 pt-1">
          {children}
        </Collapsible.Panel>
      </div>
    </Collapsible.Root>
  )
}

type SidebarItemProps = {
  icon?: LucideIcon
  /** A status glyph or coloured dot, for rows with no icon. */
  mark?: React.ReactNode
  label: React.ReactNode
  /** The second line: a branch, a slug, a state. Makes the row 44px. */
  subtitle?: React.ReactNode
  to?: string
  search?: Record<string, unknown>
  /** Right-aligned count. Hidden at 0 — a badge reading "0" is noise. */
  count?: number
  /** Right-aligned slot for a diff stat or a pin. */
  trailing?: React.ReactNode
  /** Nested one level, for a repo under a project folder. */
  indent?: boolean
  disabled?: boolean
  className?: string
}

function SidebarItem({
  icon,
  mark,
  label,
  subtitle,
  to,
  search,
  count,
  trailing,
  indent,
  disabled,
  className,
}: SidebarItemProps) {
  const { collapsed } = useSidebar()

  const classes = cn(
    "group/item flex items-center gap-2.5 rounded-md px-2",
    subtitle ? "h-nav-row-tall" : "h-nav-row",
    "text-sm font-medium text-secondary-foreground select-none",
    "duration-fast transition-colors ease-out-strong",
    "hover:bg-element-hover hover:text-foreground",
    "aria-[current=page]:bg-element-selected aria-[current=page]:text-foreground",
    disabled && "pointer-events-none opacity-40",
    indent && !collapsed && "ml-2",
    collapsed && "justify-center px-0",
    className
  )

  const glyph = icon ? (
    <Icon
      icon={icon}
      size="md"
      className="text-muted-foreground group-hover/item:text-secondary-foreground group-aria-[current=page]/item:text-foreground"
    />
  ) : (
    mark
  )

  const content = (
    <>
      {glyph}
      {/*
        Labels get their own transition. Opacity on a shorter, later curve
        than the width, so text is gone before the rail is narrow enough to
        clip it — fading them in lockstep looks like a letterbox closing.
      */}
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12, ease: "easeOut" }}
            className="flex min-w-0 flex-1 flex-col"
          >
            <span className="truncate">{label}</span>
            {subtitle && (
              <span className="truncate text-2xs font-normal text-muted-foreground">
                {subtitle}
              </span>
            )}
          </motion.span>
        )}
      </AnimatePresence>
      {!collapsed && trailing}
      {!collapsed && count !== undefined && count > 0 && (
        <span className="shrink-0 text-xs text-muted-foreground tnum">
          {count}
        </span>
      )}
    </>
  )

  if (!to || disabled) {
    return (
      <span
        data-slot="sidebar-item"
        className={classes}
        title={collapsed ? String(label) : undefined}
      >
        {content}
      </span>
    )
  }

  return (
    <Link
      data-slot="sidebar-item"
      to={to}
      search={search as never}
      // Several items point at the same route with different filters, so the
      // active one is decided by the search params, not the path alone.
      activeOptions={{ includeSearch: true, exact: true }}
      className={classes}
      title={collapsed ? String(label) : undefined}
    >
      {content}
    </Link>
  )
}

export {
  Sidebar,
  SidebarBody,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarItem,
  SidebarSection,
  useSidebar,
  SIDEBAR_WIDTH,
  SIDEBAR_WIDTH_COLLAPSED,
}
