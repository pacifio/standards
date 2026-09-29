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
import { ScrollFade } from "@/components/ui/scroll-fade"
import { OrgMark } from "./org-switcher"

/**
 * Settings is a MODE, not a page: you leave the app, with an explicit way
 * back. Same frame as the app shell — curved nav panel on the canvas,
 * `.micro` group labels, 28px rows — so it reads as the same product with
 * a different table of contents.
 */

export type SettingsNavItem = { label: string; to: string; icon: LucideIcon }

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

/** A 28px rail row. Shared with the gallery nav. */
function RailLink({
  to,
  icon: Glyph,
  children,
}: {
  to: string
  icon?: LucideIcon
  children: React.ReactNode
}) {
  return (
    <Link
      to={to as never}
      className={cn(
        "group/item flex h-7 items-center gap-2 rounded-md px-2 text-2xs",
        "duration-fast transition-colors ease-out-strong",
        "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
        "aria-[current=page]:bg-sidebar-accent aria-[current=page]:font-medium aria-[current=page]:text-foreground"
      )}
    >
      {Glyph && <Icon icon={Glyph} size="sm" />}
      <span className="truncate">{children}</span>
    </Link>
  )
}

function RailGroup({
  label,
  items,
}: {
  label: string
  items: Array<SettingsNavItem>
}) {
  return (
    <div className="mb-3">
      <div className="px-2 pb-1.5 micro">{label}</div>
      <ul className="space-y-px">
        {items.map((item) => (
          <li key={item.to}>
            <RailLink to={item.to} icon={item.icon}>
              {item.label}
            </RailLink>
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * Settings, in the same frame as the app: the back link and the workspace sit
 * on the canvas, the section list is a curved nav panel, and the page is a
 * curved panel beside it — so leaving the app for settings changes what is
 * in the panels, not the shape of the window.
 */
function SettingsShell({ children }: { children: React.ReactNode }) {
  const { org } = useOrg()
  return (
    <div className="flex h-svh w-full flex-col overflow-hidden bg-shell-canvas">
      <div className="flex min-h-0 flex-1 gap-2 p-2">
        <nav
          aria-label="Settings"
          data-panel=""
          className="flex w-settings-nav shrink-0 flex-col"
        >
          <div className="flex h-10 shrink-0 items-center pb-2">
            <RailLink to="/mock/dashboard" icon={ArrowLeftIcon}>
              Back to app
            </RailLink>
          </div>
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-shell-edge bg-background">
            <div className="flex items-center gap-2 px-3 pt-3 pb-3">
              <OrgMark
                initials={org.initials}
                className="size-6 rounded-md text-3xs"
              />
              <span className="truncate text-xs font-medium">{org.name}</span>
            </div>
            <ScrollFade fade={24} className="min-h-0 flex-1 px-2 pb-2">
              <RailGroup label="Workspace" items={WORKSPACE_NAV} />
              <RailGroup label="Account" items={ACCOUNT_NAV} />
            </ScrollFade>
          </div>
        </nav>

        {/* The ring is on a plain wrapper: ScrollFade masks its own box for
            the edge fades, which would clip a ring drawn on it. */}
        <div className="min-h-0 min-w-0 flex-1 overflow-hidden rounded-xl border border-shell-edge bg-background">
          <ScrollFade className="h-full">
            <div className="mx-auto w-full max-w-settings px-5 py-6">
              {children}
            </div>
          </ScrollFade>
        </div>
      </div>
    </div>
  )
}

export { RailGroup, RailLink, SettingsShell }
