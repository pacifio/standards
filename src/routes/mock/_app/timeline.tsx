import { useMemo, useRef, useState } from "react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { ChevronDownIcon, GitBranchIcon, SearchIcon, XIcon } from "lucide-react"
import { cn } from "cn"

import { MEMBERS } from "@/mock/data"
import { SESSION_SUMMARIES, sessionDetail } from "@/mock/sessions-api"
import type { SessionSummaryApi } from "@/mock/sessions-api"
import { dayKey, dayLabel, formatTokens } from "@/mock/time"
import { hueFor } from "@/lib/hue"
import { Dock, DockSizeToggle } from "@/components/shell/app-shell"
import { DashedRails } from "@/components/blocks/dashed-rails"
import { TimelineCalendar } from "@/components/blocks/timeline-calendar"
import type { CalendarDay } from "@/components/blocks/timeline-calendar"
import { PersonAvatar } from "@/components/patterns/person-avatar"
import { CompoundFilter } from "@/components/patterns/segmented"
import { SessionReader } from "@/components/session/session-reader"
import { AvatarStack } from "@/components/ui/avatar-stack"
import { DiffStat } from "@/components/ui/code-block"
import { Icon } from "@/components/ui/icon"
import { IconButton } from "@/components/ui/icon-button"
import { ModelBadge } from "@/components/ui/model-badge"
import { StatusIcon } from "@/components/ui/status-icon"
import { LabelMark } from "@/components/ui/tag"

type BoardView = "all" | "mine" | "agents"

type TimelineSearch = {
  view: BoardView
  /** The session open in the side panel. */
  session?: string
  /** A comment to open and mark, from an inbox deep link. */
  comment?: string
}

export const Route = createFileRoute("/mock/_app/timeline")({
  component: TimelineScreen,
  // `view` stays a real filter for deep links (`?view=mine`), but nothing
  // on the page or in the sidebar surfaces it any more.
  validateSearch: (search: Record<string, unknown>): TimelineSearch => ({
    view:
      search.view === "mine" || search.view === "agents" ? search.view : "all",
    ...(typeof search.session === "string" ? { session: search.session } : {}),
    ...(typeof search.comment === "string" ? { comment: search.comment } : {}),
  }),
})

const VIEW_TITLE: Record<BoardView, string> = {
  all: "Timeline",
  mine: "My sessions",
  agents: "Agents",
}

const SELF = "m1"

function author(id: string) {
  const m = MEMBERS.find((x) => x.id === id)
  return m
    ? { name: m.name || m.email, email: m.email, image: m.image }
    : { name: "Former member" }
}

/**
 * The timeline: every captured session, by day.
 *
 * The same frame as the inbox — a centred column between dashed rails, one
 * sticky date that changes as you scroll into the next day — because it is
 * the same act: reading down a record of what happened. Each day header
 * carries the server's own day summary (sessions · active time · tokens)
 * and the faces of who worked that day.
 *
 * A row is three short lines, each with a left and a right:
 *
 *   title                                   model (family mark)
 *   branch · tokens · project
 *   author                                   checkpoints · diff
 *
 * The state sits on the rail beside it. Opening a row puts the session in
 * the side panel — the captured-session reader — at the size you last
 * chose. A floating search bar at the foot filters the list, the same bar
 * the reader has.
 */
function TimelineScreen() {
  const { view, session, comment } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const scroller = useRef<HTMLDivElement>(null)
  const [query, setQuery] = useState("")

  const detail = useMemo(
    () => (session ? sessionDetail(session) : null),
    [session]
  )

  const q = query.trim().toLowerCase()
  const rows = SESSION_SUMMARIES.filter((s) => {
    if (view === "mine" && s.authorId !== SELF) return false
    if (view === "agents" && !(s.live || s.status === "queued")) return false
    if (!q) return true
    return [s.title, s.branches[0], s.workspaceSlug, s.model, s.agent, s.ref]
      .filter(Boolean)
      .some((t) => t!.toLowerCase().includes(q))
  })

  const byDay = new Map<string, Array<SessionSummaryApi>>()
  for (const s of rows) {
    const key = dayKey(s.lastActivityAt)
    byDay.set(key, [...(byDay.get(key) ?? []), s])
  }

  const open = (id: string | undefined) =>
    navigate({
      search: (prev) => ({ view: prev.view, ...(id ? { session: id } : {}) }),
    })

  const days: Array<CalendarDay> = [...byDay.entries()].map(([key, list]) => ({
    id: key,
    ...dayLabel(list[0].lastActivityAt),
    meta: <DayMeta sessions={list} />,
    children: (
      <ul className="divide-y divide-hairline">
        {list.map((s) => (
          <li key={s.id}>
            <SessionRow
              session={s}
              selected={s.id === session}
              onOpen={() => open(s.id === session ? undefined : s.id)}
            />
          </li>
        ))}
      </ul>
    ),
  }))

  return (
    <>
      <Dock>
        {detail && (
          <SessionReader
            detail={detail}
            highlight={comment}
            toolbar={<DockSizeToggle />}
            onClose={() => open(undefined)}
          />
        )}
      </Dock>

      <div className="relative flex min-h-0 flex-1 flex-col">
        <div
          ref={scroller}
          className="@container min-h-0 flex-1 overflow-y-auto"
        >
          <div className="flex min-h-full flex-col px-2 @5xl:px-10">
            <div className="relative mx-auto flex w-full max-w-232 flex-1 flex-col gap-6 px-5 pt-8 pb-32">
              <DashedRails offset="-2rem" className="hidden @5xl:block" />

              <header className="flex flex-wrap items-center justify-between gap-3">
                <h1 className="text-xl font-medium tracking-tight">
                  {VIEW_TITLE[view]}
                </h1>
                <div className="flex flex-wrap items-center gap-2">
                  <CompoundFilter label="Project">
                    All
                    <Icon icon={ChevronDownIcon} size="xs" />
                  </CompoundFilter>
                  <CompoundFilter label="Agent">
                    Any
                    <Icon icon={ChevronDownIcon} size="xs" />
                  </CompoundFilter>
                </div>
              </header>

              {days.length ? (
                <TimelineCalendar days={days} root={scroller} />
              ) : (
                <p className="py-20 text-center text-xs text-muted-foreground">
                  {q ? "No sessions match." : "No sessions here yet."}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* The reader's floating search, at the foot of the list: a fade
            so rows sink under it, then the bar. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-linear-to-b from-transparent to-background"
        />
        <div className="absolute inset-x-0 bottom-0 flex justify-center px-4 pb-3.5">
          <label className="flex h-10 w-full max-w-155 items-center gap-2.5 rounded-full border border-border bg-card/80 px-4 shadow-md backdrop-blur-xl">
            <Icon
              icon={SearchIcon}
              size="sm"
              className="text-muted-foreground"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search sessions…"
              aria-label="Search sessions"
              className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-disabled"
            />
            {query && (
              <IconButton
                icon={XIcon}
                label="Clear search"
                size="xs"
                onClick={() => setQuery("")}
              />
            )}
          </label>
        </div>
      </div>
    </>
  )
}

/** The day's tokens, a hairline, then who worked that day. */
function DayMeta({ sessions }: { sessions: Array<SessionSummaryApi> }) {
  const tokens = sessions.reduce((a, s) => a + s.totalTokens, 0)
  const people = [...new Set(sessions.map((s) => s.authorId))]
  return (
    <span className="flex shrink-0 items-center gap-2.5 pb-0.5">
      {tokens > 0 && (
        <>
          <span className="mono text-2xs text-muted-foreground">
            {formatTokens(tokens)} tok
          </span>
          <span aria-hidden="true" className="h-3 w-px bg-border" />
        </>
      )}
      <AvatarStack>
        {people.slice(0, 4).map((id) => {
          const p = author(id)
          return (
            <PersonAvatar
              key={id}
              size="xs"
              name={p.name}
              email={p.email}
              image={p.image}
            />
          )
        })}
      </AvatarStack>
    </span>
  )
}

function SessionRow({
  session: s,
  selected,
  onOpen,
}: {
  session: SessionSummaryApi
  selected: boolean
  onOpen: () => void
}) {
  const who = author(s.authorId)
  const checkpoints =
    s.checkpointCount === 0
      ? "No checkpoints"
      : `${s.checkpointCount} ${s.checkpointCount === 1 ? "checkpoint" : "checkpoints"}`

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-pressed={selected}
      className={cn(
        "-mx-2 flex w-[calc(100%+1rem)] items-start gap-2.5 rounded-lg px-2 py-2.5 text-left",
        "duration-fast transition-colors ease-out-strong hover:bg-element-hover",
        selected && "bg-element-selected hover:bg-element-selected"
      )}
    >
      <span className="flex h-5.5 w-5 shrink-0 items-center justify-center">
        <StatusIcon status={s.status} />
      </span>

      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <Line
          left={
            <span className="truncate text-sm font-medium text-foreground">
              {s.title ?? "Untitled session"}
            </span>
          }
          right={s.model && <ModelBadge model={s.model} />}
        />
        <Line
          left={
            <>
              {s.branches[0] && (
                <span className="flex min-w-0 items-center gap-1 mono">
                  <Icon icon={GitBranchIcon} size="xs" />
                  <span className="truncate">{s.branches[0]}</span>
                </span>
              )}
              {s.totalTokens > 0 && (
                <>
                  <Dot />
                  <span className="shrink-0 mono">
                    {formatTokens(s.totalTokens)} tok
                  </span>
                </>
              )}
              <Dot />
              <LabelMark hue={hueFor(s.workspaceSlug)} className="shrink-0">
                {s.workspaceSlug}
              </LabelMark>
            </>
          }
        />
        <Line
          left={
            <span className="flex min-w-0 items-center gap-1.5 text-secondary-foreground">
              <PersonAvatar
                size="xs"
                name={who.name}
                email={who.email}
                image={who.image}
                className="size-4"
              />
              <span className="truncate">{who.name}</span>
            </span>
          }
          right={
            <span className="flex items-center gap-2">
              <span>{checkpoints}</span>
              {s.insertions + s.deletions > 0 && (
                <>
                  <Dot />
                  <DiffStat added={s.insertions} removed={s.deletions} />
                </>
              )}
            </span>
          }
        />
      </span>
    </button>
  )
}

/** One row line: content on the left, one item pinned right. */
function Line({
  left,
  right,
}: {
  left: React.ReactNode
  right?: React.ReactNode
}) {
  return (
    <span className="flex min-w-0 items-center justify-between gap-3 text-2xs text-muted-foreground">
      <span className="flex min-w-0 items-center gap-2">{left}</span>
      {right && <span className="flex shrink-0 items-center">{right}</span>}
    </span>
  )
}

function Dot() {
  return (
    <span aria-hidden="true" className="text-disabled">
      ·
    </span>
  )
}
