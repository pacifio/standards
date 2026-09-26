"use client"

import { Link } from "@tanstack/react-router"
import { ChevronRightIcon } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { cn } from "cn"

import { Collapsible } from "@base-ui/react/collapsible"
import { Icon } from "@/components/ui/icon"

/**
 * The left rail.
 *
 * Linear's structure, because it solves the problem the current Atlas web app
 * has: a top bar with four links has nowhere to put Inbox, nowhere to put
 * Admin, nowhere to put per-org favourites, and no room to grow. A rail has
 * vertical space, which is the axis lists are cheap in.
 *
 * The rail sits on `--sidebar` (#0a0a0a dark, #fafafa light) while the content
 * sits on `--background`. That one-step difference is what makes the rail read
 * as a plane BEHIND the content rather than a column beside it — which is why
 * there is no border between them in the shell.
 *
 * Sections are collapsible and remember nothing on purpose: this is a mock,
 * and in the real app the open set belongs in user preferences, not
 * localStorage.
 */

function Sidebar({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      data-slot="sidebar"
      data-panel=""
      aria-label="Main"
      className={cn(
        "flex h-full w-sidebar shrink-0 flex-col gap-px overflow-hidden bg-sidebar",
        className
      )}
      {...props}
    />
  )
}

/** The scrolling middle of the rail, between the switcher and the footer. */
function SidebarBody({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-body"
      className={cn("flex-1 overflow-y-auto px-2 pb-2", className)}
      {...props}
    />
  )
}

function SidebarFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-footer"
      className={cn("shrink-0 p-2", className)}
      {...props}
    />
  )
}

/**
 * A collapsible group: Workspace, Favorites, Your teams.
 *
 * The chevron rotates rather than swapping glyph, and the heading itself is
 * the trigger — a 90px-wide label with a 14px hit target on the arrow is the
 * kind of thing that tests fine and feels broken.
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
  return (
    <Collapsible.Root defaultOpen={defaultOpen}>
      <div
        data-slot="sidebar-section"
        className={cn("pt-4 first:pt-2", className)}
        {...props}
      >
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
              // The open state lives on the trigger, so the group is the
              // trigger — not the section wrapper, which never gets the attr.
              className="duration-fast transition-transform ease-out-strong group-data-[panel-open]/trigger:rotate-90"
            />
          </Collapsible.Trigger>
          {action && (
            <span className="duration-fast opacity-0 transition-opacity group-hover/section:opacity-100">
              {action}
            </span>
          )}
        </div>
        <Collapsible.Panel className="flex flex-col gap-px pt-0.5">
          {children}
        </Collapsible.Panel>
      </div>
    </Collapsible.Root>
  )
}

type SidebarItemProps = {
  icon?: LucideIcon
  /** A coloured dot or tiny mark, for favourites that have no icon. */
  mark?: React.ReactNode
  label: React.ReactNode
  to?: string
  search?: Record<string, unknown>
  /** The right-aligned count. Hidden when 0 — a badge reading "0" is noise. */
  count?: number
  /** Nested one level, for a team's Issues/Projects/Views. */
  indent?: boolean
  className?: string
}

const itemClasses = [
  "group/item flex h-control-md items-center gap-2 rounded-md px-2",
  "text-xs font-medium text-secondary-foreground select-none",
  "transition-colors duration-fast ease-out-strong",
  "hover:bg-element-hover hover:text-foreground",
  // TanStack Router sets aria-current on the active link. The active row is
  // the element-selected wash AND full-strength ink — on a rail this dim, the
  // wash alone is a 3% luminance step and is genuinely hard to find.
  "aria-[current=page]:bg-element-selected aria-[current=page]:text-foreground",
].join(" ")

function SidebarItem({
  icon,
  mark,
  label,
  to,
  search,
  count,
  indent,
  className,
}: SidebarItemProps) {
  const content = (
    <>
      {icon && (
        <Icon
          icon={icon}
          size="sm"
          className="text-muted-foreground group-hover/item:text-secondary-foreground group-aria-[current=page]/item:text-foreground"
        />
      )}
      {mark}
      <span className="flex-1 truncate">{label}</span>
      {count !== undefined && count > 0 && (
        <span className="shrink-0 text-2xs text-muted-foreground tnum">
          {count}
        </span>
      )}
    </>
  )

  const classes = cn(itemClasses, indent && "pl-7", className)

  if (!to) {
    return (
      <span data-slot="sidebar-item" className={classes}>
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
    >
      {content}
    </Link>
  )
}

export { Sidebar, SidebarBody, SidebarFooter, SidebarItem, SidebarSection }
