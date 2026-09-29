import { useMemo, useRef } from "react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { ChevronDownIcon, GitBranchIcon, LayersIcon } from "lucide-react"
import { cn } from "cn"

import { MEMBERS } from "@/mock/data"
import { SESSION_SUMMARIES, sessionDetail } from "@/mock/sessions-api"
import type { SessionSummaryApi } from "@/mock/sessions-api"
import { dayKey, dayLabel, formatDuration, formatTokens } from "@/mock/time"
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
  // `view` stays a real filter — the sidebar's "My sessions" link uses it —
  // but it is no longer surfaced as pills on the page.
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
 * A row is what the server's board shows: the state on the rail, the title,
 * then branch · tokens · author · workspace · checkpoints · diff, with the
 * agent, model and active time on the right when there is room. Opening a
 * row puts the session in the side panel — the captured-session reader —
 * at whichever of its three sizes you last chose.
 */
function TimelineScreen() {
  const { view, session, comment } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const scroller = useRef<HTMLDivElement>(null)

  const detail = useMemo(
    () => (session ? sessionDetail(session) : null),
    [session]
  )

  const rows = SESSION_SUMMARIES.filter((s) => {
    if (view === "mine") return s.authorId === SELF
    if (view === "agents") return s.live || s.status === "queued"
    return true
  })

  const live = rows.filter((s) => s.live).length

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

      <div ref={scroller} className="@container min-h-0 flex-1 overflow-y-auto">
        <div className="flex min-h-full flex-col px-4 @5xl:px-12">
          <div className="relative mx-auto flex w-full max-w-212 flex-1 flex-col gap-6 px-8 pt-8 pb-24">
            <DashedRails offset="-3rem" className="hidden @5xl:block" />

            <header className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <h1 className="flex items-center gap-2.5 text-xl font-medium tracking-tight">
                  <Icon icon={LayersIcon} size="lg" />
                  {VIEW_TITLE[view]}
                </h1>
                <p className="mt-0.5 text-2xs text-muted-foreground tnum">
                  {live > 0 && `${live} live · `}
                  {rows.length} sessions
                </p>
              </div>
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
                No sessions here yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

/** "4 sessions · 2h 11m · 486.3K tok", then who worked that day. */
function DayMeta({ sessions }: { sessions: Array<SessionSummaryApi> }) {
  const active = sessions.reduce((a, s) => a + s.activeSeconds, 0)
  const tokens = sessions.reduce((a, s) => a + s.totalTokens, 0)
  const people = [...new Set(sessions.map((s) => s.authorId))]
  return (
    <span className="flex shrink-0 items-center gap-3 pb-0.5">
      <span className="hidden text-2xs text-muted-foreground tnum @2xl:inline">
        {sessions.length} {sessions.length === 1 ? "session" : "sessions"}
        {active > 0 && ` · ${formatDuration(active)}`}
        {tokens > 0 && ` · ${formatTokens(tokens)} tok`}
      </span>
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
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-pressed={selected}
      className={cn(
        "-mx-3 flex w-[calc(100%+1.5rem)] items-start gap-3 rounded-lg px-3 py-3.5 text-left",
        "duration-fast transition-colors ease-out-strong hover:bg-element-hover",
        selected && "bg-element-selected hover:bg-element-selected"
      )}
    >
      <span className="flex size-7 shrink-0 items-center justify-center">
        <StatusIcon status={s.status} />
      </span>

      <span className="flex min-w-0 flex-1 flex-col gap-1.5">
        <span className="line-clamp-2 text-sm font-medium text-foreground">
          {s.title ?? "Untitled session"}
        </span>
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-2xs text-muted-foreground">
          {s.branches[0] && (
            <span className="flex items-center gap-1 mono">
              <Icon icon={GitBranchIcon} size="xs" />
              {s.branches[0]}
            </span>
          )}
          {s.totalTokens > 0 && (
            <>
              <Dot />
              <span className="mono">{formatTokens(s.totalTokens)} tok</span>
            </>
          )}
          <Dot />
          <span className="flex items-center gap-1.5 text-secondary-foreground">
            <PersonAvatar
              size="xs"
              name={who.name}
              email={who.email}
              image={who.image}
              className="size-4"
            />
            {who.name}
          </span>
          <Dot />
          <LabelMark hue={hueFor(s.workspaceSlug)}>{s.workspaceSlug}</LabelMark>
          {s.checkpointCount > 0 && (
            <>
              <Dot />
              <span>
                {s.checkpointCount}{" "}
                {s.checkpointCount === 1 ? "checkpoint" : "checkpoints"}
              </span>
            </>
          )}
          {s.insertions + s.deletions > 0 && (
            <>
              <Dot />
              <DiffStat added={s.insertions} removed={s.deletions} />
            </>
          )}
          {/* Narrow: the right-hand column folds into this line. */}
          <span className="flex items-center gap-2 @3xl:hidden">
            <Dot />
            {s.agent}
            <Dot />
            <span className={cn("mono", s.live && "text-success")}>
              {formatDuration(s.activeSeconds)}
            </span>
          </span>
        </span>
      </span>

      <span className="hidden shrink-0 items-center gap-4 pt-0.5 text-2xs @3xl:flex">
        <span className="text-secondary-foreground">{s.agent}</span>
        <span className="w-28 truncate mono text-muted-foreground">
          {s.model}
        </span>
        <span
          className={cn(
            "w-14 text-right mono tnum",
            s.live ? "text-success" : "text-muted-foreground"
          )}
        >
          {formatDuration(s.activeSeconds)}
        </span>
      </span>
    </button>
  )
}

function Dot() {
  return (
    <span aria-hidden="true" className="text-disabled">
      ·
    </span>
  )
}
