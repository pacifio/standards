"use client"

import { useMemo, useState } from "react"
import {
  GitBranchIcon,
  ListFilterIcon,
  MessageSquareIcon,
  SearchIcon,
  XIcon,
} from "lucide-react"
import { cn } from "cn"

import { estCost } from "@/mock/sessions-api"
import type {
  ApiTimelineEntry,
  EntryKind,
  SessionDetailApi,
} from "@/mock/sessions-api"
import { ago, formatDuration, formatTokens, hm } from "@/mock/time"
import { Icon } from "@/components/ui/icon"
import { IconButton } from "@/components/ui/icon-button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { StatusIcon } from "@/components/ui/status-icon"
import { Switch } from "@/components/ui/switch"
import { CommentButton, CommentsProvider, useComments } from "./comments"
import { EntryRail, groupEntries } from "./entry-rail"

/**
 * A captured session, read top to bottom — the Atlas desktop app's session
 * detail, on this system's tokens.
 *
 * Masthead (title, chips, four stats), then the entries on a rail, then a
 * floating bar: filters on the left, "Search this session…" in the middle,
 * the comment count on the right. The reader fills whatever it is given —
 * the dock at any of its three sizes — and tightens at compact width via
 * its container.
 */

const STATUS_LABEL = {
  live: "Live",
  queued: "Queued",
  failed: "Failed",
  done: "Done",
} as const

type Filters = {
  kinds: Record<EntryKind, boolean>
  failedOnly: boolean
  expandCalls: boolean
}

const DEFAULT_FILTERS: Filters = {
  // Thinking is off by default, as in the product: it is the agent talking
  // to itself, and it doubles the length of a session.
  kinds: {
    prompt: true,
    response: true,
    thinking: false,
    tool_call: true,
    checkpoint: true,
  },
  failedOnly: false,
  expandCalls: false,
}

function SessionReader({
  detail,
  highlight,
  toolbar,
  onClose,
}: {
  detail: SessionDetailApi
  /** A comment id to open and mark. */
  highlight?: string
  /** Controls for the panel's header, e.g. its size toggle. */
  toolbar?: React.ReactNode
  onClose: () => void
}) {
  return (
    <CommentsProvider
      key={detail.summary.id}
      sessionId={detail.summary.id}
      initial={detail.comments}
      highlight={highlight}
    >
      <Reader detail={detail} toolbar={toolbar} onClose={onClose} />
    </CommentsProvider>
  )
}

function Reader({
  detail,
  toolbar,
  onClose,
}: {
  detail: SessionDetailApi
  toolbar?: React.ReactNode
  onClose: () => void
}) {
  const { summary: s, entries } = detail
  const [query, setQuery] = useState("")
  const [filters, setFilters] = useState(DEFAULT_FILTERS)

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase()
    const hit = (e: ApiTimelineEntry) =>
      !q ||
      [
        e.text,
        e.toolTitle,
        e.toolName,
        e.result,
        e.commitSubject,
        ...(e.paths ?? []),
      ]
        .filter(Boolean)
        .some((t) => t!.toLowerCase().includes(q))
    const kept = entries.filter(
      (e) =>
        filters.kinds[e.kind] &&
        (!filters.failedOnly ||
          e.kind !== "tool_call" ||
          e.toolStatus === "failed") &&
        hit(e)
    )
    return groupEntries(kept)
  }, [entries, filters, query])

  return (
    <div
      data-slot="session-reader"
      className="relative flex min-h-0 flex-1 flex-col"
    >
      <header className="flex h-11 shrink-0 items-center gap-2 border-b border-hairline px-3">
        <StatusIcon status={s.status} />
        <span className="text-xs font-medium">{STATUS_LABEL[s.status]}</span>
        <span className="mono text-2xs text-muted-foreground">{s.ref}</span>
        <span className="flex-1" />
        {toolbar}
        <IconButton icon={XIcon} label="Close" size="sm" onClick={onClose} />
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-230 px-5 pt-8 pb-32 @3xl:px-14 @3xl:pt-12">
          <Masthead detail={detail} />
          <div className="mt-10">
            {groups.length ? (
              <EntryRail groups={groups} expandCalls={filters.expandCalls} />
            ) : (
              <p className="py-12 text-center text-xs text-muted-foreground">
                Nothing in this session matches.
              </p>
            )}
          </div>
        </div>
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-linear-to-b from-transparent to-card"
      />
      <BottomBar
        query={query}
        onQuery={setQuery}
        filters={filters}
        onFilters={setFilters}
      />
    </div>
  )
}

function Masthead({ detail }: { detail: SessionDetailApi }) {
  const { summary: s } = detail
  const cost = estCost(s)
  const mix = [
    { label: "read", n: s.cacheReadTokens, cls: "bg-foreground/20" },
    { label: "write", n: s.cacheCreationTokens, cls: "bg-foreground/40" },
    { label: "in", n: s.inputTokens, cls: "bg-foreground/65" },
    { label: "out", n: s.outputTokens, cls: "bg-foreground/95" },
  ]
  const mixTotal = mix.reduce((a, m) => a + m.n, 0)
  const top = [...mix]
    .sort((a, b) => b.n - a.n)
    .slice(0, 2)
    .filter((m) => m.n > 0)

  return (
    <div data-slot="session-masthead">
      <div className="flex items-start gap-3">
        <h1 className="min-w-0 flex-1 text-xl leading-tight font-medium tracking-tight text-balance">
          {s.title ?? "Untitled session"}
        </h1>
        <CommentButton
          anchorKind="session"
          anchorId={s.id}
          className="mt-1 opacity-100"
        />
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        {s.agent && <Chip>{s.agent.toLowerCase()}</Chip>}
        {s.branches[0] && (
          <Chip>
            <Icon icon={GitBranchIcon} size="xs" />
            {s.branches[0]}
          </Chip>
        )}
        <span className="mono text-2xs text-muted-foreground">
          {ago(s.lastActivityAt)} · {formatDuration(s.activeSeconds)}
        </span>
      </div>

      {/* Cells split by 1px gaps over a hairline backing, so the rules
          survive the 4 → 2×2 wrap at compact width. */}
      <dl className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-border bg-hairline @2xl:grid-cols-4">
        <Stat
          label="Active"
          value={formatDuration(s.activeSeconds)}
          sub={`${hm(s.startedAt)} → ${hm(s.lastActivityAt)} · ${formatDuration(s.wallSeconds)} span`}
        />
        <Stat
          label="Tokens"
          value={`${formatTokens(s.totalTokens)} tok`}
          sub={`${formatTokens(s.inputTokens)} in + ${formatTokens(s.outputTokens)} out`}
        />
        <div className="bg-card px-3.5 py-3">
          <dt className="micro">Token mix</dt>
          <dd>
            <div className="mt-3.5 flex h-1.5 overflow-hidden rounded-full bg-element-hover">
              {mixTotal > 0 &&
                mix.map((m) => (
                  <span
                    key={m.label}
                    className={m.cls}
                    style={{ width: `${(m.n / mixTotal) * 100}%` }}
                  />
                ))}
            </div>
            <p className="mt-2 mono text-3xs text-disabled">
              {top.length
                ? top
                    .map(
                      (m) => `${m.label} ${Math.round((m.n / mixTotal) * 100)}%`
                    )
                    .join(" · ")
                : "—"}
            </p>
          </dd>
        </div>
        <Stat
          label="Est. cost"
          value={cost === null ? "—" : `$${cost.toFixed(2)}`}
          sub={s.model ?? "unknown model"}
        />
      </dl>
    </div>
  )
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex h-5.5 items-center gap-1.5 rounded-full border border-border bg-card px-2.5 mono text-2xs text-muted-foreground">
      {children}
    </span>
  )
}

function Stat({
  label,
  value,
  sub,
}: {
  label: string
  value: string
  sub: string
}) {
  return (
    <div className="min-w-0 bg-card px-3.5 py-3">
      <dt className="micro">{label}</dt>
      <dd>
        <p className="mt-1.5 truncate mono text-md font-medium tracking-tight">
          {value}
        </p>
        <p className="mt-0.5 truncate mono text-3xs text-disabled">{sub}</p>
      </dd>
    </div>
  )
}

function BottomBar({
  query,
  onQuery,
  filters,
  onFilters,
}: {
  query: string
  onQuery: (q: string) => void
  filters: Filters
  onFilters: (f: Filters) => void
}) {
  const { comments } = useComments()
  const count = comments.filter((c) => !c.deletedAt).length
  const changed = JSON.stringify(filters) !== JSON.stringify(DEFAULT_FILTERS)

  return (
    <div className="absolute inset-x-0 bottom-0 flex items-center gap-3 px-4 pb-3.5">
      <FilterPopover
        filters={filters}
        onFilters={onFilters}
        changed={changed}
      />

      <label className="mx-auto flex h-10 max-w-155 min-w-0 flex-1 items-center gap-2.5 rounded-full border border-border bg-card/80 px-4 shadow-md backdrop-blur-xl">
        <Icon icon={SearchIcon} size="sm" className="text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="Search this session…"
          aria-label="Search this session"
          className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-disabled"
        />
        {query && (
          <IconButton
            icon={XIcon}
            label="Clear search"
            size="xs"
            onClick={() => onQuery("")}
          />
        )}
      </label>

      <span
        className="relative flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-card/80 text-muted-foreground shadow-md backdrop-blur-xl"
        aria-label={`${count} comments`}
        role="img"
      >
        <Icon icon={MessageSquareIcon} size="sm" />
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-primary px-0.5 text-4xs font-medium text-primary-foreground tnum">
            {count}
          </span>
        )}
      </span>
    </div>
  )
}

const KIND_LABELS: Array<[EntryKind, string]> = [
  ["prompt", "Prompts"],
  ["response", "Responses"],
  ["thinking", "Thinking"],
  ["tool_call", "Tool calls"],
  ["checkpoint", "Checkpoints"],
]

function FilterPopover({
  filters,
  onFilters,
  changed,
}: {
  filters: Filters
  onFilters: (f: Filters) => void
  changed: boolean
}) {
  return (
    <Popover>
      <PopoverTrigger
        render={
          <button
            type="button"
            aria-label="Filter entries"
            className={cn(
              "duration-fast relative flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-card/80 text-muted-foreground shadow-md backdrop-blur-xl transition-colors hover:text-foreground",
              changed && "text-foreground"
            )}
          >
            <Icon icon={ListFilterIcon} size="sm" />
            {changed && (
              <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-foreground ring-2 ring-card" />
            )}
          </button>
        }
      />
      <PopoverContent side="top" align="start" className="w-64 gap-3">
        <div className="flex flex-col gap-2">
          <span className="micro">Show</span>
          {KIND_LABELS.map(([kind, label]) => (
            <Toggle
              key={kind}
              label={label}
              checked={filters.kinds[kind]}
              onChange={(v) =>
                onFilters({
                  ...filters,
                  kinds: { ...filters.kinds, [kind]: v },
                })
              }
            />
          ))}
        </div>
        <div className="flex flex-col gap-2 border-t border-hairline pt-3">
          <Toggle
            label="Failed tool calls only"
            checked={filters.failedOnly}
            onChange={(v) => onFilters({ ...filters, failedOnly: v })}
          />
          <Toggle
            label="Expand tool calls"
            checked={filters.expandCalls}
            onChange={(v) => onFilters({ ...filters, expandCalls: v })}
          />
        </div>
        {changed && (
          <button
            type="button"
            onClick={() => onFilters(DEFAULT_FILTERS)}
            className="self-start text-2xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
          >
            Reset filters
          </button>
        )}
      </PopoverContent>
    </Popover>
  )
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 text-xs text-secondary-foreground">
      {label}
      <Switch size="sm" checked={checked} onCheckedChange={onChange} />
    </label>
  )
}

export { SessionReader }
