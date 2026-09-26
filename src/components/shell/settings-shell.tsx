"use client"

import { Link } from "@tanstack/react-router"
import {
  ArrowLeftIcon,
  BrainIcon,
  BuildingIcon,
  GaugeIcon,
  ShieldIcon,
  UserIcon,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { cn } from "cn"

import { useOrg } from "@/lib/org-context"
import { Icon } from "@/components/ui/icon"
import { OrgMark } from "./org-switcher"

/**
 * Settings gets its own chrome.
 *
 * The current app renders all five settings panels as `<Tabs>` on
 * `/dashboard`, with `defaultValue="org"` and no URL binding — so a tab cannot
 * be linked to, bookmarked, or returned to after a reload, and the five panels
 * fight for one page's worth of width.
 *
 * Linear's answer is that settings is a MODE, not a page: you leave the app,
 * with an explicit way back. That buys a grouped nav on the left, real URLs
 * per section, and a narrow measured column for the content — settings is
 * mostly prose and single controls, and prose at 1200px is unreadable.
 */

export type SettingsNavItem = {
  label: string
  to: string
  icon: LucideIcon
}

const WORKSPACE_NAV: Array<SettingsNavItem> = [
  {
    label: "Organisation",
    to: "/mock/settings/organisation",
    icon: BuildingIcon,
  },
  { label: "Usage", to: "/mock/settings/usage", icon: GaugeIcon },
  { label: "AI", to: "/mock/settings/ai", icon: BrainIcon },
]

const ACCOUNT_NAV: Array<SettingsNavItem> = [
  { label: "Account", to: "/mock/settings/account", icon: UserIcon },
  { label: "Privacy", to: "/mock/settings/privacy", icon: ShieldIcon },
]

function NavGroup({
  title,
  items,
}: {
  title: string
  items: Array<SettingsNavItem>
}) {
  return (
    <div className="flex flex-col gap-px pt-4 first:pt-0">
      <p className="px-2 pb-1 eyebrow">{title}</p>
      {items.map((item) => (
        <Link
          key={item.to}
          to={item.to as never}
          className={cn(
            "group/item flex h-control-md items-center gap-2 rounded-md px-2",
            "text-xs font-medium text-secondary-foreground",
            "duration-fast transition-colors ease-out-strong",
            "hover:bg-element-hover hover:text-foreground",
            "aria-[current=page]:bg-element-selected aria-[current=page]:text-foreground"
          )}
        >
          <Icon
            icon={item.icon}
            size="sm"
            className="text-muted-foreground group-aria-[current=page]/item:text-foreground"
          />
          {item.label}
        </Link>
      ))}
    </div>
  )
}

function SettingsShell({ children }: { children: React.ReactNode }) {
  const { org } = useOrg()

  return (
    <div className="flex h-svh overflow-hidden bg-sidebar">
      <nav
        aria-label="Settings"
        data-panel=""
        className="flex w-settings-nav shrink-0 flex-col gap-1 overflow-y-auto p-2"
      >
        {/* The way back. Settings is a mode you are inside of, so leaving it
            has to be the first thing in the rail, not a browser-back gamble. */}
        <Link
          to="/mock/inbox"
          className={cn(
            "flex h-control-md items-center gap-2 rounded-md px-2",
            "text-xs font-medium text-secondary-foreground",
            "duration-fast transition-colors ease-out-strong hover:bg-element-hover hover:text-foreground"
          )}
        >
          <Icon icon={ArrowLeftIcon} size="sm" />
          Back to app
        </Link>

        <div className="flex items-center gap-2 px-2 py-3">
          <OrgMark initials={org.initials} />
          <span className="truncate text-xs font-semibold">{org.name}</span>
        </div>

        <NavGroup title="Workspace" items={WORKSPACE_NAV} />
        <NavGroup title="Account" items={ACCOUNT_NAV} />
      </nav>

      <main className="m-2 ml-0 flex min-w-0 flex-1 flex-col overflow-y-auto rounded-lg border border-border bg-background">
        <div className="mx-auto w-full max-w-settings px-6 py-10">
          {children}
        </div>
      </main>
    </div>
  )
}

export { SettingsShell }
