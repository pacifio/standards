"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { AnimatePresence, motion } from "motion/react"
import {
  BoxIcon,
  FolderGitIcon,
  GaugeIcon,
  InboxIcon,
  LayoutDashboardIcon,
  LayersIcon,
  MessageSquareIcon,
  MoonIcon,
  PanelLeftIcon,
  ShieldIcon,
  SparklesIcon,
  SunIcon,
  UserIcon,
  WavesIcon,
} from "lucide-react"
import { cn } from "cn"

import { SPRING_DOCK } from "@/lib/motion"
import { useOrg } from "@/lib/org-context"
import { useTheme } from "@/lib/theme"
import { NOTIFICATIONS, PROJECTS, SESSIONS } from "@/mock/data"
import { IconButton } from "@/components/ui/icon-button"
import { StatusIcon } from "@/components/ui/status-icon"
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
  SidebarGroup,
  SidebarHeader,
  SidebarItem,
  SidebarSearch,
} from "./sidebar"
import { UiScaleControl } from "./ui-scale"

/**
 * The application chrome. Auberge's three columns:
 *
 *   sidebar · (topbar + main) · optional dock
 *
 * `h-svh overflow-hidden` on the outer frame: the PAGE never scrolls. Scroll
 * lives inside `ScrollFade` regions, which is what gives the app its
 * native, non-document feel and keeps the topbar and rail pinned without
 * `position: sticky` fighting a scrolling body.
 *
 * No floating content card. An earlier version wrapped `main` in a rounded,
 * ringed card; the panels INSIDE a page are the rounded, ringed things now,
 * and a card around cards is two radii fighting at one corner. The seam
 * between rail and page is a hairline plus one step of the surface ramp.
 */

const STORAGE_KEY = "atlas-sidebar"

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

/**
 * The dock's mount point. The shell owns the column; a screen fills it by
 * rendering `<Dock>` anywhere in its tree, which portals into this slot. A
 * portal rather than a prop because the shell lives in the layout route and
 * the dock's contents are the screen's own state.
 */
const DockContext = createContext<HTMLElement | null>(null)

function Dock({ children }: { children?: React.ReactNode }) {
  const slot = useContext(DockContext)
  if (!slot) return null
  return createPortal(
    <AnimatePresence initial={false}>
      {children && (
        <motion.aside
          key="dock"
          data-slot="dock"
          data-panel=""
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: "var(--dock-width)", opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={SPRING_DOCK}
          className="relative z-panel flex h-svh shrink-0 flex-col overflow-hidden border-l border-hairline bg-surface max-lg:hidden"
        >
          <div className="flex w-dock min-w-dock flex-1 flex-col">
            {children}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>,
    slot
  )
}

function AppShell({ children }: { children: React.ReactNode }) {
  const [dockSlot, setDockSlot] = useState<HTMLElement | null>(null)
  const { org } = useOrg()
  const { open, setOpen } = useCommandMenu()
  const [railCollapsed, setRailCollapsed] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    try {
      setRailCollapsed(localStorage.getItem(STORAGE_KEY) === "collapsed")
    } catch {
      // ignore
    }
  }, [])

  const setCollapsed = (next: boolean) => {
    setRailCollapsed(next)
    try {
      localStorage.setItem(STORAGE_KEY, next ? "collapsed" : "open")
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "." && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setCollapsed(!railCollapsed)
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  })

  const unread = NOTIFICATIONS.filter((n) => !n.read).length
  const liveSessions = SESSIONS.filter((s) => s.status === "live").length

  const actions: Array<CommandAction> = [
    {
      id: "dashboard",
      label: "Go to Dashboard",
      group: "Navigation",
      icon: LayoutDashboardIcon,
      to: "/mock/dashboard",
      shortcut: "G D",
    },
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

  const collapsed = railCollapsed && !drawerOpen

  return (
    <DockContext.Provider value={dockSlot}>
      <div className="flex h-svh w-full overflow-hidden bg-background">
        {drawerOpen && (
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setDrawerOpen(false)}
            className="fixed inset-0 z-drawer scrim-soft backdrop-blur-sm lg:hidden"
          />
        )}

        <Sidebar
          collapsed={collapsed}
          className={cn(
            "max-lg:fixed max-lg:inset-y-0 max-lg:left-0 max-lg:z-drawer max-lg:shadow-lg",
            "max-lg:duration-slow max-lg:transition-transform max-lg:ease-drawer",
            !drawerOpen && "max-lg:-translate-x-full"
          )}
        >
          <SidebarHeader>
            <div className="min-w-0 flex-1">
              <OrgSwitcher collapsed={collapsed} />
            </div>
            {!collapsed && (
              <IconButton
                icon={PanelLeftIcon}
                label="Collapse sidebar"
                size="sm"
                onClick={() => setCollapsed(true)}
              />
            )}
          </SidebarHeader>

          <SidebarSearch onOpen={() => setOpen(true)} />

          {/*
          Delegation, not an interactive container: every target inside is a
          real link. Tapping one on mobile has to dismiss the drawer, or the
          new screen opens underneath it.
        */}
          <SidebarBody onClickCapture={() => setDrawerOpen(false)}>
            <SidebarGroup>
              <SidebarItem
                icon={LayoutDashboardIcon}
                label="Dashboard"
                to="/mock/dashboard"
              />
              <SidebarItem
                icon={InboxIcon}
                label="Inbox"
                to="/mock/inbox"
                count={unread}
              />
              <SidebarItem
                icon={UserIcon}
                label="My sessions"
                to="/mock/timeline"
                search={{ view: "mine" }}
                match={() => false}
              />
              <SidebarItem
                icon={SparklesIcon}
                label="Agents"
                to="/mock/timeline"
                search={{ view: "agents" }}
                count={liveSessions}
                badge="live"
                match={() => false}
              />
            </SidebarGroup>

            <SidebarGroup label="Workspace">
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
                children={PROJECTS.map((p) => ({
                  label: p.name,
                  to: "/mock/projects",
                  icon: FolderGitIcon,
                }))}
              />
              <SidebarItem
                icon={MessageSquareIcon}
                label="Chat"
                to="/mock/chat"
              />
              <SidebarItem icon={WavesIcon} label="Spaces" badge="beta" />
            </SidebarGroup>

            <SidebarGroup label="Recent">
              {SESSIONS.slice(0, 4).map((s) => (
                <SidebarItem
                  key={s.id}
                  to="/mock/timeline"
                  search={{ view: "all" }}
                  label={`${s.ref} ${s.title}`}
                  mark={<StatusIcon status={s.status} className="size-3.5" />}
                  match={() => false}
                />
              ))}
            </SidebarGroup>

            <SidebarGroup label="Administration">
              <SidebarItem
                icon={ShieldIcon}
                label="Administration"
                children={[
                  {
                    label: "Usage",
                    to: "/mock/settings/usage",
                    icon: GaugeIcon,
                  },
                  {
                    label: "Platform admin",
                    to: "/mock/admin",
                    icon: ShieldIcon,
                  },
                ]}
              />
            </SidebarGroup>
          </SidebarBody>

          <SidebarFooter>
            <ThemeToggle />
            {collapsed ? (
              <IconButton
                icon={PanelLeftIcon}
                label="Expand sidebar"
                size="sm"
                onClick={() => setCollapsed(false)}
              />
            ) : (
              <>
                <UiScaleControl />
                <span className="ml-auto px-1.5 mono text-3xs text-disabled">
                  v0.4.2
                </span>
              </>
            )}
          </SidebarFooter>
        </Sidebar>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex h-topbar shrink-0 items-center gap-1 border-b border-hairline px-2 lg:hidden">
            <IconButton
              icon={PanelLeftIcon}
              label="Open navigation"
              size="sm"
              onClick={() => setDrawerOpen(true)}
            />
            <span className="truncate text-xs font-medium">{org.name}</span>
          </div>
          <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
            {children}
          </main>
        </div>

        <div ref={setDockSlot} className="contents" />

        <CommandMenu open={open} onOpenChange={setOpen} actions={actions} />
      </div>
    </DockContext.Provider>
  )
}

export { AppShell, Dock, ThemeToggle }
