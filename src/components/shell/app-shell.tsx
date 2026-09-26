"use client"

import { useEffect, useState } from "react"
import {
  BoxIcon,
  FolderGitIcon,
  GaugeIcon,
  InboxIcon,
  LayersIcon,
  MessageSquareIcon,
  MoonIcon,
  PanelLeftIcon,
  PenSquareIcon,
  SearchIcon,
  ShieldIcon,
  SparklesIcon,
  SunIcon,
  UserIcon,
  WavesIcon,
} from "lucide-react"
import { cn } from "cn"

import { useOrg } from "@/lib/org-context"
import { useTheme } from "@/lib/theme"
import { NOTIFICATIONS, PROJECTS, SESSIONS } from "@/mock/data"
import { StatusIcon } from "@/components/ui/status-icon"
import { IconButton } from "@/components/ui/icon-button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { CommandMenu, useCommandMenu } from "./command-menu"
import type { CommandAction } from "./command-menu"
import { OrgSwitcher } from "./org-switcher"
import {
  Sidebar,
  SidebarBody,
  SidebarFooter,
  SidebarItem,
  SidebarSection,
} from "./sidebar"

/**
 * The application chrome.
 *
 * Two planes, not two columns: the rail sits on `--sidebar` and the content
 * sits on `--background` inside a rounded, bordered card. There is no divider
 * between them — the step in surface colour plus the card's own edge does the
 * separating, which is why the content appears to float in front of the rail
 * rather than sit next to it.
 *
 * What this replaces: a 56px top bar carrying four links, with /inbox and
 * /admin unreachable from it and no navigation at all below the `sm`
 * breakpoint.
 */

function ThemeToggle() {
  const { appearance, toggle } = useTheme()
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <IconButton
            icon={appearance === "dark" ? SunIcon : MoonIcon}
            label={`Switch to ${appearance === "dark" ? "light" : "dark"} theme`}
            size="sm"
            onClick={toggle}
          />
        }
      />
      <TooltipContent>
        Switch to {appearance === "dark" ? "light" : "dark"}
      </TooltipContent>
    </Tooltip>
  )
}

function AppShell({ children }: { children: React.ReactNode }) {
  const { org } = useOrg()
  const { open, setOpen } = useCommandMenu()
  // Two states, because the rail is two different things at two sizes.
  // Docked, it either occupies a column or it does not. As a drawer, it
  // floats over the content and starts closed — a 240px rail on a 390px
  // screen leaves 150px for the app.
  const [railDocked, setRailDocked] = useState(true)
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "." && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setRailDocked((v) => !v)
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [])

  const unread = NOTIFICATIONS.filter((n) => !n.read).length
  const liveSessions = SESSIONS.filter((s) => s.status === "live").length

  const actions: Array<CommandAction> = [
    {
      id: "inbox",
      label: "Go to Inbox",
      group: "Navigation",
      icon: InboxIcon,
      to: "/mock/inbox",
      shortcut: "G I",
    },
    {
      id: "timeline",
      label: "Go to Timeline",
      group: "Navigation",
      icon: LayersIcon,
      to: "/mock/timeline",
      shortcut: "G T",
    },
    {
      id: "projects",
      label: "Go to Projects",
      group: "Navigation",
      icon: FolderGitIcon,
      to: "/mock/projects",
      shortcut: "G P",
    },
    {
      id: "chat",
      label: "Go to Chat",
      group: "Navigation",
      icon: MessageSquareIcon,
      to: "/mock/chat",
      shortcut: "G C",
    },
    {
      id: "settings",
      label: "Open workspace settings",
      group: "Navigation",
      icon: GaugeIcon,
      to: "/mock/settings/organisation",
      shortcut: "G S",
    },
    ...SESSIONS.slice(0, 5).map((s) => ({
      id: s.id,
      label: `${s.ref} ${s.title}`,
      group: "Sessions",
      icon: BoxIcon,
      to: "/mock/timeline",
    })),
    ...PROJECTS.slice(0, 4).map((p) => ({
      id: p.id,
      label: p.name,
      group: "Projects",
      icon: FolderGitIcon,
      to: "/mock/projects",
    })),
  ]

  return (
    <div className="flex h-svh overflow-hidden bg-sidebar">
      {/* The drawer scrim. An earlier sibling on the same layer as the rail,
          so document order puts the rail above its own dim. */}
      {drawerOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setDrawerOpen(false)}
          className="fixed inset-0 z-drawer scrim-soft backdrop-blur-sm lg:hidden"
        />
      )}

      {railDocked && (
        <Sidebar
          className={cn(
            "max-lg:fixed max-lg:inset-y-0 max-lg:left-0 max-lg:z-drawer",
            "max-lg:border-r max-lg:border-border max-lg:shadow-lg",
            "max-lg:duration-slow max-lg:transition-transform max-lg:ease-drawer",
            !drawerOpen && "max-lg:-translate-x-full"
          )}
        >
          {/* The switcher is the first thing in the rail, on every screen. */}
          <div className="flex h-topbar shrink-0 items-center gap-0.5 px-2">
            <OrgSwitcher />
            <IconButton
              icon={SearchIcon}
              label="Search"
              size="sm"
              onClick={() => setOpen(true)}
            />
            <IconButton icon={PenSquareIcon} label="New session" size="sm" />
          </div>

          {/*
            Delegation, not an interactive container: every target inside is a
            real link. Tapping one on mobile has to dismiss the drawer, or the
            new screen opens underneath it.
          */}
          <SidebarBody onClickCapture={() => setDrawerOpen(false)}>
            <div className="flex flex-col gap-px">
              <SidebarItem
                icon={InboxIcon}
                label="Inbox"
                to="/mock/inbox"
                count={unread}
              />
              {/*
                These are filtered views of the same route, so they carry a
                `view` search param and match on it. Without `includeSearch`
                all three would satisfy `/mock/timeline` and light up at once.
              */}
              <SidebarItem
                icon={UserIcon}
                label="My sessions"
                to="/mock/timeline"
                search={{ view: "mine" }}
              />
              <SidebarItem
                icon={SparklesIcon}
                label="Agents"
                to="/mock/timeline"
                search={{ view: "agents" }}
                count={liveSessions}
              />
            </div>

            <SidebarSection title="Workspace">
              <SidebarItem
                icon={LayersIcon}
                label="Timeline"
                to="/mock/timeline"
                search={{ view: "all" }}
              />
              <SidebarItem
                icon={FolderGitIcon}
                label="Projects"
                to="/mock/projects"
              />
              <SidebarItem
                icon={MessageSquareIcon}
                label="Chat"
                to="/mock/chat"
              />
              <SidebarItem icon={WavesIcon} label="Spaces" />
            </SidebarSection>

            {/*
              Recent timelines per org — the thing the current app has nowhere
              to put, because a top bar has no vertical space to spend.
            */}
            <SidebarSection title="Recent">
              {SESSIONS.slice(0, 4).map((s) => (
                <SidebarItem
                  key={s.id}
                  to="/mock/timeline"
                  search={{ view: "all" }}
                  label={`${s.ref} ${s.title}`}
                  mark={<StatusIcon status={s.status} className="size-3.5" />}
                />
              ))}
            </SidebarSection>

            <SidebarSection title="Projects" defaultOpen={false}>
              {PROJECTS.map((p) => (
                <SidebarItem
                  key={p.id}
                  icon={FolderGitIcon}
                  label={p.name}
                  to="/mock/projects"
                  count={p.sessionCount}
                />
              ))}
            </SidebarSection>

            <SidebarSection title="Administration" defaultOpen={false}>
              <SidebarItem
                icon={GaugeIcon}
                label="Usage"
                to="/mock/settings/usage"
              />
              <SidebarItem
                icon={ShieldIcon}
                label="Platform admin"
                to="/mock/admin"
              />
            </SidebarSection>
          </SidebarBody>

          <SidebarFooter>
            <div className="flex items-center justify-between gap-1 rounded-md border border-border-subtle bg-card px-2 py-1.5">
              <div className="flex min-w-0 flex-col">
                <span className="caption">What&apos;s new</span>
                <span className="truncate text-2xs font-medium text-foreground">
                  Session boards per org
                </span>
              </div>
              <ThemeToggle />
            </div>
          </SidebarFooter>
        </Sidebar>
      )}

      {/*
        The content card. `m-2 ml-0` when the rail is open so the rail's plane
        shows as a margin on three sides — that gap is what reads as depth.
      */}
      <main
        className={cn(
          "flex min-w-0 flex-1 flex-col overflow-hidden rounded-lg border border-border bg-background",
          // The rail's plane shows as a margin on three sides; that gap is
          // what reads as depth. Under lg the rail floats, so the content
          // keeps all four margins.
          railDocked ? "m-2 max-lg:ml-2 lg:ml-0" : "m-2"
        )}
      >
        <div className="flex h-topbar shrink-0 items-center gap-1 border-b border-border-subtle px-2 lg:hidden">
          <IconButton
            icon={PanelLeftIcon}
            label="Open navigation"
            size="sm"
            onClick={() => setDrawerOpen(true)}
          />
          <span className="truncate text-xs font-medium">{org.name}</span>
          <div className="flex-1" />
          <IconButton
            icon={SearchIcon}
            label="Search"
            size="sm"
            onClick={() => setOpen(true)}
          />
        </div>
        {children}
      </main>

      <CommandMenu open={open} onOpenChange={setOpen} actions={actions} />
    </div>
  )
}

export { AppShell, ThemeToggle }
