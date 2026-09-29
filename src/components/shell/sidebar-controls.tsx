"use client"

import { Link } from "@tanstack/react-router"
import {
  BookOpenIcon,
  CircleHelpIcon,
  GlobeIcon,
  KeyboardIcon,
  LogOutIcon,
  MessageCircleIcon,
  SettingsIcon,
  ShieldIcon,
  UserIcon,
} from "lucide-react"

import { useOrg } from "@/lib/org-context"
import { PersonAvatar } from "@/components/patterns/person-avatar"
import { DiscordMark, GitHubMark, XMark } from "@/components/ui/brand-marks"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Icon } from "@/components/ui/icon"
import { IconButton } from "@/components/ui/icon-button"

/**
 * The sidebar footer's two menus.
 *
 * `ProfileMenu` is YOU — your face on the trigger, your account inside. The
 * workspace switcher at the top of the rail is US; keeping the two apart is
 * why "Account settings" lives here and not there.
 *
 * `InfoMenu` is the Atlas desktop app's (?) menu: help, the community, and
 * the way out to settings and the website. External destinations open in a
 * new tab; the mock points them at "#".
 */

function ProfileMenu() {
  const { user } = useOrg()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            aria-label={`Account — ${user.name}`}
            className="duration-fast rounded-full outline-offset-2 transition-opacity hover:opacity-85"
          >
            <PersonAvatar size="sm" name={user.name} email={user.email} />
          </button>
        }
      />
      <DropdownMenuContent side="top" align="start" className="w-60">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex items-center gap-2 py-2 tracking-normal normal-case">
            <PersonAvatar size="md" name={user.name} email={user.email} />
            <span className="flex min-w-0 flex-col">
              <span className="truncate text-xs font-medium text-foreground">
                {user.name}
              </span>
              <span className="truncate text-2xs text-muted-foreground">
                {user.email}
              </span>
            </span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link to="/mock/settings/account" />}>
          <Icon icon={UserIcon} size="sm" />
          Account settings
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link to="/mock/settings/privacy" />}>
          <Icon icon={ShieldIcon} size="sm" />
          Privacy
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          render={<Link to="/mock/login" />}
        >
          <Icon icon={LogOutIcon} size="sm" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/** An external destination: a real anchor, opened in a new tab. */
function external(href: string) {
  return <a href={href} target="_blank" rel="noreferrer" />
}

function InfoMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <IconButton icon={CircleHelpIcon} label="Help and links" size="sm" />
        }
      />
      <DropdownMenuContent side="top" align="end" className="w-56">
        <DropdownMenuItem render={external("#")}>
          <Icon icon={BookOpenIcon} size="sm" />
          Docs
        </DropdownMenuItem>
        <DropdownMenuItem render={external("#")}>
          <Icon icon={MessageCircleIcon} size="sm" />
          Send feedback
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Icon icon={KeyboardIcon} size="sm" />
          Keyboard shortcuts
          <DropdownMenuShortcut>⌘ /</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={external("#")}>
          <GitHubMark className="size-3.5" />
          GitHub repo
        </DropdownMenuItem>
        <DropdownMenuItem render={external("#")}>
          <DiscordMark className="size-3.5" />
          Discord community
        </DropdownMenuItem>
        <DropdownMenuItem render={external("#")}>
          <XMark className="size-3.5" />
          Follow on X
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link to="/mock/settings/organisation" />}>
          <Icon icon={SettingsIcon} size="sm" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuItem render={external("#")}>
          <Icon icon={GlobeIcon} size="sm" />
          Our website
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export { InfoMenu, ProfileMenu }
