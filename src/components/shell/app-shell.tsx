"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react"
import { createPortal } from "react-dom"
import { AnimatePresence, motion } from "motion/react"
import {
  BoxIcon,
  FolderGitIcon,
  GaugeIcon,
  InboxIcon,
  Columns2Icon,
  LayoutDashboardIcon,
  PanelRightIcon,
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
import type { LucideIcon } from "lucide-react"
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
 * draws it.
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
 * The dock: a panel beside the page that a screen fills by rendering
 * `<Dock>` anywhere in its tree, which portals into the shell's slot. A
 * portal rather than a prop because the shell lives in the layout route and
 * the dock's contents are the screen's own state.
 *
 * Two sizes, owned by the shell so they persist across screens:
 *
 *   compact  the reading width (`--dock-width`) beside the page
 *   half     half the work area — the page and the dock share it
 *
 * Widths are measured, not percentages: the work area is the space right of
 * the sidebar, which changes as the rail collapses, so a ResizeObserver
 * feeds the spring its target in pixels.
 */
export type DockMode = "compact" | "half"

const DOCK_MODE_KEY = "atlas-dock"
/** The gap between the page and the dock — the shell's `ml-2`. */
const DOCK_GAP = 8

type DockContextValue = {
  slot: HTMLElement | null
  mode: DockMode
  setMode: (mode: DockMode) => void
  /** Width of the work area (page + dock), in px. */
  work: number
}

const DockContext = createContext<DockContextValue>({
  slot: null,
  mode: "compact",
  setMode: () => {},
  work: 0,
})

const useDock = () => useContext(DockContext)

function Dock({ children }: { children?: React.ReactNode }) {
  const { slot, mode, work } = useDock()

  if (!slot) return null
  const width =
    mode === "half" ? Math.round((work - DOCK_GAP) / 2) : "var(--dock-width)"

  return createPortal(
    <AnimatePresence initial={false}>
      {children && (
        <motion.aside
          key="dock"
          data-slot="dock"
          data-mode={mode}
          data-panel=""
          initial={{ width: 0, opacity: 0 }}
          animate={{
            width: work ? width : "var(--dock-width)",
            marginLeft: DOCK_GAP,
            opacity: 1,
          }}
          exit={{ width: 0, opacity: 0 }}
          transition={SPRING_DOCK}
          className="relative z-panel flex h-full shrink-0 flex-col overflow-hidden rounded-xl border border-shell-edge bg-card max-lg:hidden"
        >
          <div className="@container flex min-h-0 w-full min-w-dock flex-1 flex-col">
            {children}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>,
    slot
  )
}

const DOCK_SIZES: Array<{ mode: DockMode; icon: LucideIcon; label: string }> = [
  { mode: "compact", icon: PanelRightIcon, label: "Compact panel" },
  { mode: "half", icon: Columns2Icon, label: "Half-width panel" },
]

/** The three dock sizes as one segmented control, for a dock's header. */
function DockSizeToggle({ className }: { className?: string }) {
  const { mode, setMode } = useDock()
  return (
    <SegmentedIconGroup className={className}>
      {DOCK_SIZES.map((s) => (
        <IconButton
          key={s.mode}
          icon={s.icon}
          label={s.label}
          size="xs"
          aria-pressed={mode === s.mode}
          onClick={() => setMode(s.mode)}
          className="aria-pressed:bg-segment-thumb aria-pressed:text-foreground"
        />
      ))}
    </SegmentedIconGroup>
  )
}

function AppShell({ children }: { children: React.ReactNode }) {
  const [dockSlot, setDockSlot] = useState<HTMLElement | null>(null)
  const [dockMode, setDockModeState] = useState<DockMode>("compact")
  const [work, setWork] = useState(0)
  const workRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(DOCK_MODE_KEY)
      if (saved === "half") setDockModeState(saved)
    } catch {
      // ignore
    }
  }, [])

  const setDockMode = useCallback((next: DockMode) => {
    setDockModeState(next)
    try {
      localStorage.setItem(DOCK_MODE_KEY, next)
    } catch {
      // ignore
    }
  }, [])

  // The work area is the page + dock row; the dock's half width
  // are fractions of it.
  useEffect(() => {
    const el = workRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) =>
      setWork(Math.round(entry.contentRect.width))
    )
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

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
    <DockContext.Provider
      value={{
        slot: dockSlot,
        mode: dockMode,
        setMode: setDockMode,
        work,
      }}
    >
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

          {/* The work area: the page and the dock share it. */}
          <div ref={workRef} className="flex min-h-0 min-w-0 flex-1">
            <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-shell-edge bg-background">
              {children}
            </main>

            <div ref={setDockSlot} className="contents" />
          </div>
        </div>

        <CommandMenu open={open} onOpenChange={setOpen} actions={actions} />
      </div>
    </DockContext.Provider>
  )
}

export { AppShell, Dock, DockSizeToggle, ThemeToggle, useDock }
