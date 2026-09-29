"use client"

import {
  BellIcon,
  ChevronRightIcon,
  LogOutIcon,
  SettingsIcon,
} from "lucide-react"
import { Link } from "@tanstack/react-router"
import { cn } from "cn"

import { useOrg } from "@/lib/org-context"
import { NOTIFICATIONS } from "@/mock/data"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Icon } from "@/components/ui/icon"
import { IconButton } from "@/components/ui/icon-button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollFade } from "@/components/ui/scroll-fade"
import { UiScaleControl } from "./ui-scale"
import { PersonAvatar } from "@/components/patterns/person-avatar"

/**
 * The 44px glass bar above a page.
 *
 * Glass, because it is the one piece of chrome content scrolls UNDER — the
 * blur is what tells you it is a layer and not a header. It is also the only
 * glass in the app besides the command palette; a second blurred bar would
 * make the first one ordinary.
 *
 * Left is where you are; right is the shared cluster — notifications,
 * interface scale, account — plus whatever the screen adds before them.
 */
function TopBar({
  className,
  children,
  actions,
  cluster = true,
  ...props
}: React.ComponentProps<"header"> & {
  actions?: React.ReactNode
  cluster?: boolean
}) {
  return (
    <header
      data-slot="top-bar"
      className={cn(
        "sticky top-0 z-titlebar flex h-topbar shrink-0 items-center gap-2 border-b border-hairline px-4 glass",
        className
      )}
      {...props}
    >
      <nav
        aria-label="Breadcrumb"
        className="flex min-w-0 flex-1 items-center gap-1 text-2xs text-muted-foreground"
      >
        {children}
      </nav>
      <div className="ml-auto flex shrink-0 items-center gap-1.5">
        {actions}
        {cluster && <TopBarCluster />}
      </div>
    </header>
  )
}

function TopBarCluster() {
  const { user } = useOrg()
  const unread = NOTIFICATIONS.filter((n) => !n.read).length

  return (
    <>
      <Popover>
        <span className="relative">
          <PopoverTrigger
            render={
              <IconButton icon={BellIcon} label="Notifications" size="sm" />
            }
          />
          {unread > 0 && (
            <span className="pointer-events-none absolute -top-0.5 -right-0.5 flex size-3.5 items-center justify-center rounded-full bg-primary text-4xs font-medium text-primary-foreground tnum">
              {unread}
            </span>
          )}
        </span>
        <PopoverContent align="end" className="w-75 gap-0 p-0">
          <div className="flex h-9 items-center justify-between px-3">
            <span className="text-xs font-medium">Notifications</span>
            <span className="caption">{unread} unread</span>
          </div>
          <ScrollFade className="max-h-75 border-t border-hairline">
            {NOTIFICATIONS.map((n) => (
              <Link
                key={n.id}
                to="/mock/inbox"
                className="flex gap-2.5 border-b border-hairline px-3 py-2 last:border-0 hover:bg-element-hover"
              >
                <span className="flex w-1.5 shrink-0 justify-center pt-1.5">
                  {!n.read && (
                    <span className="size-1.5 rounded-full bg-foreground" />
                  )}
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="truncate text-2xs font-medium">
                    {n.title}
                  </span>
                  <span className="truncate text-3xs text-muted-foreground">
                    {n.actor} · {n.at}
                  </span>
                </span>
              </Link>
            ))}
          </ScrollFade>
        </PopoverContent>
      </Popover>

      <UiScaleControl />

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button
              type="button"
              aria-label="Account"
              className="rounded-full outline-none focus-visible:outline-1"
            >
              <PersonAvatar
                size="sm"
                name={user.name}
                email={user.email}
                initials={user.initials}
              />
            </button>
          }
        />
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="tracking-normal normal-case">
              {user.email}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem render={<Link to="/mock/settings/account" />}>
              <Icon icon={SettingsIcon} size="sm" />
              Account settings
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              render={<Link to="/mock/login" />}
            >
              <Icon icon={LogOutIcon} size="sm" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
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
        "flex items-center gap-1.5 truncate",
        current ? "font-medium text-foreground" : "text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

function CrumbSeparator() {
  return <Icon icon={ChevronRightIcon} size="xs" className="opacity-50" />
}

export { Crumb, CrumbSeparator, TopBar }
