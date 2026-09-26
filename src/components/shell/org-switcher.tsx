"use client"

import { Link } from "@tanstack/react-router"
import {
  CheckIcon,
  ChevronsUpDownIcon,
  LogOutIcon,
  PlusIcon,
  SettingsIcon,
  UserPlusIcon,
} from "lucide-react"
import { cn } from "cn"

import { useOrg } from "@/lib/org-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Icon } from "@/components/ui/icon"

/**
 * The workspace switcher, top-left of the rail.
 *
 * This is the single worst thing about the current Atlas web app: to change
 * org you navigate to /dashboard, land on the Organisation tab, and use a
 * `<select>` that sets better-auth's active org — which three other screens
 * then ignore, because they read the org from the URL instead.
 *
 * Linear's answer, which this copies:
 *
 *  - The switcher is the FIRST thing in the rail, so the answer to "which
 *    workspace am I in" is in the same place on every screen.
 *  - The parent menu carries the things you reach for while thinking about
 *    the workspace as a whole — Settings, Invite people, Log out — because
 *    that is what you are already looking at.
 *  - Switching is a SUBMENU, not the menu. It is the rarest of the four
 *    actions, and putting five workspaces inline would push Log out off the
 *    bottom the moment someone joins a sixth.
 *  - The submenu is headed by the account email. With several accounts, "which
 *    login is this list for" is the question immediately before "which
 *    workspace", so it is answered first.
 *  - Each workspace carries a numeric shortcut. The check marks the active
 *    one — the number is how you get there without the menu at all.
 */

function OrgMark({
  initials,
  className,
}: {
  initials: string
  className?: string
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex size-4 shrink-0 items-center justify-center rounded-sm",
        "bg-element-emphasis text-3xs font-semibold text-foreground",
        className
      )}
    >
      {initials}
    </span>
  )
}

function OrgSwitcher({ className }: { className?: string }) {
  const { org, orgs, user, setOrg } = useOrg()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "flex h-control-md min-w-0 flex-1 items-center gap-1.5 rounded-md px-1.5",
          "text-xs font-semibold text-foreground select-none",
          "duration-fast transition-colors ease-out-strong",
          "hover:bg-element-hover data-popup-open:bg-element-active",
          className
        )}
      >
        <OrgMark initials={org.initials} />
        <span className="truncate">{org.name}</span>
        <Icon
          icon={ChevronsUpDownIcon}
          size="xs"
          className="text-muted-foreground"
        />
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-60" sideOffset={4}>
        <DropdownMenuItem render={<Link to="/mock/settings/organisation" />}>
          <Icon icon={SettingsIcon} size="sm" />
          Settings
          <DropdownMenuShortcut>G then S</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link to="/mock/settings/organisation" />}>
          <Icon icon={UserPlusIcon} size="sm" />
          Invite and manage members
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            Switch workspace
            <DropdownMenuShortcut>O then W</DropdownMenuShortcut>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-64">
            {/* Which login this list belongs to, before which workspace. */}
            <DropdownMenuLabel className="tracking-normal normal-case">
              {user.email}
            </DropdownMenuLabel>
            {orgs.map((o, i) => (
              <DropdownMenuItem key={o.id} onClick={() => setOrg(o.id)}>
                <OrgMark initials={o.initials} />
                <span className="flex-1 truncate">{o.name}</span>
                {o.id === org.id && (
                  <Icon
                    icon={CheckIcon}
                    size="sm"
                    className="text-foreground"
                  />
                )}
                <span className="w-3 text-right text-2xs text-disabled tnum">
                  {i + 1}
                </span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Account</DropdownMenuLabel>
            <DropdownMenuItem>
              <Icon icon={PlusIcon} size="sm" />
              Create or join a workspace…
            </DropdownMenuItem>
            <DropdownMenuItem>Add an account…</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator />

        <DropdownMenuItem variant="destructive">
          <Icon icon={LogOutIcon} size="sm" />
          Log out
          <DropdownMenuShortcut>⌥ ⇧ Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export { OrgMark, OrgSwitcher }
