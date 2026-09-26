import { useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import {
  BrainIcon,
  CalendarIcon,
  CheckIcon,
  ChevronRightIcon,
  CircleDotIcon,
  LayersIcon,
  MessageSquareIcon,
  SearchIcon,
  SlidersHorizontalIcon,
  TerminalIcon,
  WrenchIcon,
  XIcon,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { cn } from "cn"

import { SESSIONS, TIMELINE_ENTRIES } from "@/mock/data"
import type { Session, SessionStatus, TimelineEntryKind } from "@/mock/types"
import { AppShell } from "@/components/shell/app-shell"
import { Crumb, TopBar } from "@/components/shell/top-bar"
import {
  DetailPane,
  ListDetail,
  ListPane,
  PropertyRow,
} from "@/components/shell/list-detail"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Code, DiffStat } from "@/components/ui/code-block"
import { Icon } from "@/components/ui/icon"
import { IconButton } from "@/components/ui/icon-button"
import { Input } from "@/components/ui/input"
import { LabelChip } from "@/components/ui/label-chip"
import { Pill } from "@/components/ui/pill"
import { PriorityIcon, StatusIcon } from "@/components/ui/status-icon"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

type BoardView = "all" | "mine" | "agents"

export const Route = createFileRoute("/mock/timeline")({
  component: TimelineScreen,
  // `view` is a real filter, not decoration: it is what makes "My sessions"
  // and "Agents" distinct destinations rather than three links to one page.
  validateSearch: (search: Record<string, unknown>): { view: BoardView } => {
    const view = search.view
    return {
      view: view === "mine" || view === "agents" ? view : "all",
    }
  },
})

const STATUS_LABEL: Record<SessionStatus, string> = {
  live: "Live",
  queued: "Queued",
  failed: "Failed",
  done: "Done",
}

const ENTRY_ICON: Record<TimelineEntryKind, LucideIcon> = {
  prompt: MessageSquareIcon,
  thinking: BrainIcon,
  tool_call: WrenchIcon,
  response: TerminalIcon,
  checkpoint: CircleDotIcon,
}

/**
 * The session board.
 *
 * The current /timeline is a 747-line route that renders its own org
 * `<select>`, its own project `<select>`, its own search box and its own
 * facet selects above a board and a detail pane. Everything above the board
 * here is the shared FilterBar shape; everything below it is the ListDetail
 * layout. The route's job is to supply rows.
 *
 * Sessions are grouped by status rather than listed flat, because "what is
 * running right now" is the question this screen is opened to answer, and a
 * flat list sorted by time buries a live session under yesterday's finished
 * ones.
 */
function TimelineScreen() {
  const { view } = Route.useSearch()
  const [selectedId, setSelectedId] = useState(SESSIONS[0].id)
  const selected = SESSIONS.find((s) => s.id === selectedId)!

  const visible = SESSIONS.filter((s) => {
    if (view === "mine") return s.author === "Adib Mohsin"
    if (view === "agents") return s.status === "live" || s.status === "queued"
    return true
  })

  const groups: Array<[SessionStatus, Array<Session>]> = (
    ["live", "queued", "failed", "done"] as const
  )
    .map(
      (status) => [status, visible.filter((s) => s.status === status)] as const
    )
    .filter(([, rows]) => rows.length > 0)
    .map(([status, rows]) => [status, [...rows]])

  return (
    <AppShell>
      <TopBar
        actions={
          <IconButton
            icon={SlidersHorizontalIcon}
            label="Display options"
            size="sm"
          />
        }
      >
        <Icon icon={LayersIcon} size="sm" className="text-muted-foreground" />
        <Crumb current>
          {view === "mine"
            ? "My sessions"
            : view === "agents"
              ? "Agents"
              : "Timeline"}
        </Crumb>
      </TopBar>

      {/* The filter bar. One row, search first, view toggle hard-right. */}
      <div className="flex shrink-0 items-center gap-2 border-b border-border-subtle px-3 py-2">
        <div className="relative max-w-xs flex-1">
          <Icon
            icon={SearchIcon}
            size="sm"
            className="pointer-events-none absolute top-1/2 left-2 -translate-y-1/2 text-muted-foreground"
          />
          <Input placeholder="Search sessions" className="pl-7" />
        </div>

        <Select
          defaultValue="all"
          items={{
            all: "All projects",
            atlas: "atlas",
            server: "server",
            standards: "standards",
          }}
        >
          <SelectTrigger variant="ghost" size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All projects</SelectItem>
            <SelectItem value="atlas">atlas</SelectItem>
            <SelectItem value="server">server</SelectItem>
            <SelectItem value="standards">standards</SelectItem>
          </SelectContent>
        </Select>

        <Select
          defaultValue="any"
          items={{
            any: "Any agent",
            claude: "Claude Code",
            codex: "Codex",
          }}
        >
          <SelectTrigger variant="ghost" size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any agent</SelectItem>
            <SelectItem value="claude">Claude Code</SelectItem>
            <SelectItem value="codex">Codex</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex-1" />

        <Tabs defaultValue="timeline">
          <TabsList className="h-control-md">
            <TabsTrigger value="timeline">
              <LayersIcon />
              Board
            </TabsTrigger>
            <TabsTrigger value="calendar">
              <CalendarIcon />
              Calendar
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <ListDetail>
        <ListPane width="wide" className="overflow-y-auto">
          {groups.map(([status, rows]) => (
            <div key={status}>
              {/* Linear's group header: the same glyph the rows carry, so
                  the section and its contents read as one thing. */}
              <div className="sticky top-0 z-panel flex h-control-md items-center gap-2 bg-background px-3">
                <StatusIcon status={status} />
                <span className="text-xs font-medium text-foreground">
                  {STATUS_LABEL[status]}
                </span>
                <span className="text-xs text-muted-foreground tnum">
                  {rows.length}
                </span>
              </div>
              {rows.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSelectedId(s.id)}
                  aria-current={s.id === selectedId ? "true" : undefined}
                  className={cn(
                    // One line, 36px, everything on a shared baseline. The old
                    // two-line row doubled the height of the board, which made
                    // scanning down the title column impossible.
                    "flex h-9 w-full items-center gap-2 border-b border-border-subtle px-3 text-left",
                    "duration-fast transition-colors ease-out-strong",
                    "hover:bg-element-hover aria-[current=true]:bg-element-selected"
                  )}
                >
                  <PriorityIcon priority={s.priority} />
                  <span className="w-14 shrink-0 mono text-2xs text-muted-foreground">
                    {s.ref}
                  </span>
                  <StatusIcon status={s.status} />
                  <span className="min-w-0 flex-1 truncate text-xs">
                    {s.title}
                  </span>
                  {/* Trailing metadata drops out as the pane narrows, in order
                      of how little it is worth. The title never truncates for
                      it. */}
                  <span className="hidden shrink-0 items-center gap-1 xl:flex">
                    {s.labels.map((l) => (
                      <LabelChip key={l.name} tone={l.tone}>
                        {l.name}
                      </LabelChip>
                    ))}
                  </span>
                  {(s.added > 0 || s.removed > 0) && (
                    <span className="hidden shrink-0 lg:block">
                      <DiffStat added={s.added} removed={s.removed} />
                    </span>
                  )}
                  <span className="w-12 shrink-0 text-right caption tnum">
                    {s.startedAt}
                  </span>
                  <Avatar size="xs">
                    <AvatarFallback>{s.authorInitials}</AvatarFallback>
                  </Avatar>
                </button>
              ))}
            </div>
          ))}
        </ListPane>

        <DetailPane width="companion">
          {/* One column, not two. At 440px there is no room for a properties
              rail beside the entry stream, so properties become a compact
              block under the masthead — which is also where a reader looks
              for them first. */}
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
            <div className="flex flex-col gap-3 p-4">
              <div className="flex items-center gap-2">
                <StatusIcon status={selected.status} />
                <span className="text-xs font-medium">
                  {STATUS_LABEL[selected.status]}
                </span>
                <span className="mono text-2xs text-muted-foreground">
                  {selected.ref}
                </span>
              </div>
              <h2 className="text-md font-semibold tracking-tight text-balance">
                {selected.title}
              </h2>
              <div className="flex flex-wrap items-center gap-1.5">
                <Pill>
                  <Avatar size="xs">
                    <AvatarFallback>{selected.authorInitials}</AvatarFallback>
                  </Avatar>
                  {selected.author}
                </Pill>
                {selected.labels.map((l) => (
                  <LabelChip key={l.name} tone={l.tone}>
                    {l.name}
                  </LabelChip>
                ))}
              </div>
            </div>

            <Separator />

            <div className="flex flex-col gap-0.5 p-4">
              <PropertyRow label="Priority">
                <PriorityIcon priority={selected.priority} />
                <span className="capitalize">{selected.priority}</span>
              </PropertyRow>
              <PropertyRow label="Agent">{selected.agent}</PropertyRow>
              <PropertyRow label="Model">
                <Code className="truncate">{selected.model}</Code>
              </PropertyRow>
              <PropertyRow label="Project">
                <Badge variant="outline">{selected.project}</Badge>
              </PropertyRow>
              <PropertyRow label="Branch">
                <Code className="truncate">{selected.branch}</Code>
              </PropertyRow>
              <PropertyRow label="Tokens">
                <span className="tnum">{selected.tokens.toLocaleString()}</span>
              </PropertyRow>
              <PropertyRow label="Duration">
                <span className="tnum">{selected.durationMinutes} min</span>
              </PropertyRow>
              <PropertyRow label="Changes">
                <DiffStat added={selected.added} removed={selected.removed} />
              </PropertyRow>
            </div>

            <Separator />

            {/* The entry stream. A 1px rail with a marker per entry — the same
                reading shape as the desktop app's session view. */}
            <ol className="flex flex-col p-4">
              {TIMELINE_ENTRIES.map((e, i) => (
                <li key={e.id} className="flex gap-3">
                  <div className="flex w-4 shrink-0 flex-col items-center">
                    <span
                      className={cn(
                        "mt-1.5 flex size-4 shrink-0 items-center justify-center rounded-full border",
                        e.toolStatus === "error"
                          ? "border-error text-error"
                          : "border-border-strong text-muted-foreground"
                      )}
                    >
                      <Icon icon={ENTRY_ICON[e.kind]} size="xs" />
                    </span>
                    {i < TIMELINE_ENTRIES.length - 1 && (
                      <span className="w-px flex-1 bg-border-subtle" />
                    )}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5 pb-4">
                    <span className="flex items-baseline gap-2">
                      <span className="text-xs font-medium">{e.title}</span>
                      <span className="shrink-0 caption tnum">{e.at}</span>
                      {e.toolStatus === "error" && (
                        <Icon icon={XIcon} size="xs" className="text-error" />
                      )}
                      {e.toolStatus === "ok" && (
                        <Icon
                          icon={CheckIcon}
                          size="xs"
                          className="text-success"
                        />
                      )}
                    </span>
                    {e.detail && (
                      <span className="caption text-balance">{e.detail}</span>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="shrink-0 border-t border-border-subtle p-2">
            <button
              type="button"
              className="duration-fast flex h-control-md w-full items-center gap-2 rounded-md px-2 text-xs text-secondary-foreground transition-colors hover:bg-element-hover hover:text-foreground"
            >
              <Icon icon={MessageSquareIcon} size="sm" />
              <span className="flex-1 text-left">
                {selected.commentCount} comments
              </span>
              <Icon icon={ChevronRightIcon} size="sm" />
            </button>
          </div>
        </DetailPane>
      </ListDetail>
    </AppShell>
  )
}
