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
  SunIcon,
  UserIcon,
  UsersIcon,
  WavesIcon,
} from "lucide-react"
import { cn } from "cn"

import { SPRING_DOCK } from "@/lib/motion"
import { useOrg } from "@/lib/org-context"
import { useTheme } from "@/lib/theme"
import { PROJECTS, SESSIONS } from "@/mock/data"
import { INBOX } from "@/mock/inbox"
import { SegmentedIconGroup } from "@/components/patterns/segmented"
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
  SidebarPanel,
  SidebarSearch,
} from "./sidebar"
import { InfoMenu, ProfileMenu } from "./sidebar-controls"
import { UiScaleControl } from "./ui-scale"

/**
 * The application frame: curved panels on a canvas, as the Atlas desktop app
 * and Linear draw it.
 *
 *   ┌ canvas ─────────────────────────────────────────────────────┐
 *   │ workspace ▾   ┌──────────────────────────────┐ ┌─ dock ───┐ │
 *   │ ┌─ nav ─────┐ │                              │ │          │ │
 *   │ │           │ │            page              │ │ (raised) │ │
 *   │ └───────────┘ └──────────────────────────────┘ └──────────┘ │
 *   └─────────────────────────────────────────────────────────────┘
 *
 * The canvas is `shell-canvas`, a step DARKER than the page; every panel is
 * a `rounded-xl` segment on the page `background` with an opaque
 * `shell-edge` rule, so the panels read as sheets set into the frame — which
 * is where the depth comes from. The dock is the one panel
 * on `card`, a step up, so a selected record beside the page is visibly the
 * thing in focus.
 *
 * There is no page header bar and no footer strip. Where you are is the lit
 * sidebar row; what a page can do lives in the page's own header.
 *
 * `h-svh overflow-hidden` on the outer frame: the PAGE never scrolls. Scroll
 * lives inside `ScrollFade` regions within each panel.
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
          className="relative z-panel ml-2 flex h-full shrink-0 flex-col overflow-hidden rounded-xl border border-shell-edge bg-card max-lg:hidden"
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

  const unread = INBOX.filter((e) => !e.readAt).length

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
      <div className="flex h-svh w-full flex-col overflow-hidden bg-shell-canvas">
        {drawerOpen && (
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setDrawerOpen(false)}
            className="fixed inset-0 z-drawer scrim-soft backdrop-blur-sm lg:hidden"
          />
        )}

        {/* Below lg the rail is a drawer, so something has to open it. */}
        <div className="flex h-10 shrink-0 items-center gap-1 px-2 lg:hidden">
          <IconButton
            icon={PanelLeftIcon}
            label="Open navigation"
            size="sm"
            onClick={() => setDrawerOpen(true)}
          />
          <span className="truncate text-xs font-medium">{org.name}</span>
        </div>

        <div className="flex min-h-0 flex-1 p-2 max-lg:pt-0">
          <Sidebar
            collapsed={collapsed}
            className={cn(
              "lg:mr-2",
              "max-lg:fixed max-lg:inset-y-0 max-lg:left-0 max-lg:z-drawer max-lg:bg-shell-canvas max-lg:p-2 max-lg:shadow-lg",
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

            <SidebarPanel>
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
                    icon={UsersIcon}
                    label="Members"
                    to="/mock/settings/organisation"
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
                      search: { project: p.slug },
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
                      mark={
                        <StatusIcon status={s.status} className="size-3.5" />
                      }
                      match={() => false}
                    />
                  ))}
                </SidebarGroup>

                <SidebarGroup label="Administration">
                  <SidebarItem
                    icon={ShieldIcon}
                    label="Administration"
                    defaultOpen
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

              {/* You on the left; the rail's tools, grouped, on the right.
                  Collapsed, the same pieces stack in the 52px rail. */}
              <SidebarFooter className="justify-between">
                <ProfileMenu />
                <SegmentedIconGroup
                  orientation={collapsed ? "vertical" : "horizontal"}
                >
                  <ThemeToggle />
                  <UiScaleControl iconOnly />
                  <InfoMenu />
                </SegmentedIconGroup>
                {collapsed && (
                  <IconButton
                    icon={PanelLeftIcon}
                    label="Expand sidebar"
                    size="sm"
                    onClick={() => setCollapsed(false)}
                  />
                )}
              </SidebarFooter>
            </SidebarPanel>
          </Sidebar>

          <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-shell-edge bg-background">
            {children}
          </main>

          <div ref={setDockSlot} className="contents" />
        </div>

        <CommandMenu open={open} onOpenChange={setOpen} actions={actions} />
      </div>
    </DockContext.Provider>
  )
}

export { AppShell, Dock, ThemeToggle }
