import { useState } from "react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import {
  ChevronDownIcon,
  LayersIcon,
  MessageSquareIcon,
  SlidersHorizontalIcon,
  XIcon,
} from "lucide-react"

import { SESSIONS, TIMELINE_ENTRIES } from "@/mock/data"
import type { Session, SessionStatus } from "@/mock/types"
import { Dock } from "@/components/shell/app-shell"
import { Crumb, TopBar } from "@/components/shell/top-bar"
import { PropertyRow } from "@/components/shell/list-detail"
import { SessionPipeline } from "@/components/blocks/session-pipeline"
import { SessionTimeline } from "@/components/blocks/session-timeline"
import { DataTable, TableSearch } from "@/components/patterns/data-table"
import type { Column } from "@/components/patterns/data-table"
import { KpiStrip } from "@/components/patterns/kpi-strip"
import { PageHeader } from "@/components/patterns/section-header"
import { CompoundFilter, SegmentedPills } from "@/components/patterns/segmented"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Code, DiffStat } from "@/components/ui/code-block"
import { Icon } from "@/components/ui/icon"
import { IconButton } from "@/components/ui/icon-button"
import { ScrollFade } from "@/components/ui/scroll-fade"
import { Tag } from "@/components/ui/tag"
import { PriorityIcon, StatusIcon } from "@/components/ui/status-icon"

type BoardView = "all" | "mine" | "agents"

export const Route = createFileRoute("/mock/_app/timeline")({
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

// Board order: what is running first, then what is waiting, then what broke,
// then history. A flat sort by time buries a live session under yesterday.
const STATUS_ORDER: Record<SessionStatus, number> = {
  live: 0,
  queued: 1,
  failed: 2,
  done: 3,
}

const VIEW_TITLE: Record<BoardView, string> = {
  all: "Timeline",
  mine: "My sessions",
  agents: "Agents",
}

// Seven days of activity per status, for the strip's sparklines. Fixtures,
// like everything else on this screen.
const SPARK: Record<SessionStatus, Array<number>> = {
  live: [1, 2, 1, 3, 2, 2, 2],
  queued: [3, 2, 4, 2, 1, 2, 1],
  failed: [0, 1, 0, 0, 1, 0, 1],
  done: [4, 6, 5, 8, 7, 9, 5],
}

/**
 * The session board.
 *
 * Three bands down the page — a strip of counts, the table, and the selected
 * session in the shell's dock — instead of a two-pane list-detail. The
 * table is the board: sortable by any column, grouped by status through the
 * default sort rather than through section headers, so a live session is
 * always the first row and the status glyph carries the grouping.
 */
function TimelineScreen() {
  const { view } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const [selectedId, setSelectedId] = useState<string | null>(SESSIONS[0].id)
  const [query, setQuery] = useState("")
  const selected = SESSIONS.find((s) => s.id === selectedId) ?? null

  const visible = SESSIONS.filter((s) => {
    if (view === "mine" && s.author !== "Adib Mohsin") return false
    if (view === "agents" && s.status !== "live" && s.status !== "queued")
      return false
    if (!query) return true
    const q = query.toLowerCase()
    return (
      s.title.toLowerCase().includes(q) ||
      s.ref.toLowerCase().includes(q) ||
      s.labels.some((l) => l.name.toLowerCase().includes(q))
    )
  }).sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status])

  const count = (status: SessionStatus) =>
    SESSIONS.filter((s) => s.status === status).length

  const columns: Array<Column<Session>> = [
    {
      id: "priority",
      header: <span className="sr-only">Priority</span>,
      cell: (s) => <PriorityIcon priority={s.priority} />,
      className: "w-8 pr-0",
    },
    {
      id: "ref",
      header: "Ref",
      cell: (s) => (
        <span className="mono text-2xs whitespace-nowrap text-muted-foreground">
          {s.ref}
        </span>
      ),
      sortValue: (s) => Number(s.ref.replace(/\D/g, "")),
      className: "w-18",
    },
    {
      id: "status",
      header: "Status",
      cell: (s) => (
        <span className="flex items-center gap-1.5">
          <StatusIcon status={s.status} />
          <span className="text-2xs">{STATUS_LABEL[s.status]}</span>
        </span>
      ),
      sortValue: (s) => STATUS_ORDER[s.status],
      className: "w-22",
    },
    {
      id: "title",
      header: "Session",
      cell: (s) => (
        <span className="flex min-w-0 items-center gap-2 overflow-hidden">
          <span className="truncate font-medium text-foreground">
            {s.title}
          </span>
          {/* Labels drop out before the title truncates; identity is worth
              less than the name of the thing. */}
          <span className="hidden shrink-0 items-center gap-1 @4xl:flex">
            {s.labels.map((l) => (
              <Tag key={l.name} hue={l.tone}>
                {l.name}
              </Tag>
            ))}
          </span>
        </span>
      ),
      sortValue: (s) => s.title,
      // min-w keeps the title column from collapsing when the fixed columns
      // and the dock squeeze the table at a large interface scale.
      className: "w-full max-w-0 min-w-36",
    },
    {
      id: "agent",
      header: "Agent",
      cell: (s) => (
        <span className="text-2xs whitespace-nowrap">{s.agent}</span>
      ),
      sortValue: (s) => s.agent,
      className: "hidden @3xl:table-cell",
    },
    {
      id: "changes",
      header: "Changes",
      cell: (s) =>
        s.added > 0 || s.removed > 0 ? (
          <DiffStat added={s.added} removed={s.removed} />
        ) : (
          <span className="text-disabled">—</span>
        ),
      sortValue: (s) => s.added + s.removed,
      align: "right",
      className: "hidden @2xl:table-cell",
    },
    {
      id: "started",
      header: "Started",
      cell: (s) => <span className="caption">{s.startedAt}</span>,
      align: "right",
      className: "hidden w-20 @md:table-cell",
    },
    {
      id: "author",
      header: <span className="sr-only">Author</span>,
      cell: (s) => (
        <Avatar size="xs">
          <AvatarFallback>{s.authorInitials}</AvatarFallback>
        </Avatar>
      ),
      className: "w-10",
    },
  ]

  return (
    <>
      <Dock>
        {selected && (
          <SessionDock session={selected} onClose={() => setSelectedId(null)} />
        )}
      </Dock>

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
        <Crumb current>{VIEW_TITLE[view]}</Crumb>
      </TopBar>

      <ScrollFade className="min-h-0 flex-1">
        <div className="flex flex-col gap-4 px-5 pt-4 pb-6">
          <PageHeader
            className="pb-0"
            title={VIEW_TITLE[view]}
            description={`${count("live")} live · ${count("queued")} queued · ${SESSIONS.length} this week`}
            action={
              <div className="flex flex-wrap items-center gap-2">
                <SegmentedPills<BoardView>
                  value={view}
                  onChange={(next) => navigate({ search: { view: next } })}
                  options={[
                    { value: "all", label: "All" },
                    { value: "mine", label: "Mine" },
                    { value: "agents", label: "Agents" },
                  ]}
                />
                <CompoundFilter label="Project">
                  All
                  <Icon icon={ChevronDownIcon} size="xs" />
                </CompoundFilter>
                <CompoundFilter label="Agent">
                  Any
                  <Icon icon={ChevronDownIcon} size="xs" />
                </CompoundFilter>
                <TableSearch
                  placeholder="Search sessions"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
            }
          />

          <KpiStrip
            cells={(["live", "queued", "failed", "done"] as const).map(
              (status) => ({
                id: status,
                label: STATUS_LABEL[status],
                value: count(status),
                spark: SPARK[status],
                delta:
                  status === "done"
                    ? 12
                    : status === "failed"
                      ? -50
                      : undefined,
              })
            )}
          />

          <DataTable
            rows={visible}
            columns={columns}
            rowId={(s) => s.id}
            selectedId={selectedId ?? undefined}
            onRowClick={(s) => setSelectedId(s.id)}
            footer={
              <>
                <span className="tnum">
                  {visible.length} of {SESSIONS.length} sessions
                </span>
                <span className="ml-auto">Sorted by status</span>
              </>
            }
          />
        </div>
      </ScrollFade>
    </>
  )
}

/**
 * The selected session, in the dock.
 *
 * One column: masthead, a compact property block, then the entry stream.
 * A live session gets the pipeline illustration in place of the stream,
 * because "what is it doing now" is the question, not "what did it do".
 */
function SessionDock({
  session,
  onClose,
}: {
  session: Session
  onClose: () => void
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex h-topbar shrink-0 items-center gap-2 border-b border-hairline px-3">
        <StatusIcon status={session.status} />
        <span className="text-xs font-medium">
          {STATUS_LABEL[session.status]}
        </span>
        <span className="mono text-2xs text-muted-foreground">
          {session.ref}
        </span>
        <IconButton
          icon={XIcon}
          label="Close"
          size="sm"
          className="ml-auto"
          onClick={onClose}
        />
      </div>

      <ScrollFade className="min-h-0 flex-1">
        <div className="flex flex-col gap-4 p-4">
          <div className="flex flex-col gap-2">
            <h2 className="text-md font-medium tracking-tight text-balance">
              {session.title}
            </h2>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="flex items-center gap-1.5 text-2xs text-secondary-foreground">
                <Avatar size="xs">
                  <AvatarFallback>{session.authorInitials}</AvatarFallback>
                </Avatar>
                {session.author}
              </span>
              {session.labels.map((l) => (
                <Tag key={l.name} hue={l.tone} dot>
                  {l.name}
                </Tag>
              ))}
            </div>
          </div>

          <div className="flex flex-col rounded-xl bg-card px-3 py-1.5 ring-1 ring-foreground/10">
            <PropertyRow label="Priority">
              <PriorityIcon priority={session.priority} />
              <span className="capitalize">{session.priority}</span>
            </PropertyRow>
            <PropertyRow label="Agent">{session.agent}</PropertyRow>
            <PropertyRow label="Model">
              <Code className="truncate">{session.model}</Code>
            </PropertyRow>
            <PropertyRow label="Project">
              <Tag hue="grey">{session.project}</Tag>
            </PropertyRow>
            <PropertyRow label="Branch">
              <Code className="truncate">{session.branch}</Code>
            </PropertyRow>
            <PropertyRow label="Tokens">
              <span className="tnum">{session.tokens.toLocaleString()}</span>
            </PropertyRow>
            <PropertyRow label="Duration">
              <span className="tnum">{session.durationMinutes} min</span>
            </PropertyRow>
            <PropertyRow label="Changes">
              <DiffStat added={session.added} removed={session.removed} />
            </PropertyRow>
          </div>

          {session.status === "live" ? (
            <SessionPipeline session={session} entries={TIMELINE_ENTRIES} />
          ) : (
            <SessionTimeline
              status={session.status}
              entries={TIMELINE_ENTRIES}
            />
          )}
        </div>
      </ScrollFade>

      <div className="shrink-0 border-t border-hairline p-2">
        <Button variant="ghost" size="sm" className="w-full justify-start">
          <Icon icon={MessageSquareIcon} size="sm" />
          <span className="flex-1 text-left">
            {session.commentCount} comments
          </span>
        </Button>
      </div>
    </div>
  )
}
