"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { CheckIcon, GitBranchIcon, XIcon } from "lucide-react"

import { estCost } from "@/mock/sessions-api"
import type { SessionDetailApi } from "@/mock/sessions-api"
import { ago, formatDuration, formatTokens, hm } from "@/mock/time"
import { Icon } from "@/components/ui/icon"
import { IconButton } from "@/components/ui/icon-button"
import { StatusIcon } from "@/components/ui/status-icon"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { UploadIcon } from "@/components/ui/upload-icon"
import type { UploadIconHandle } from "@/components/ui/upload-icon"
import { CommentButton, CommentsProvider, useComments } from "./comments"
import { CommentsMorph } from "./comments-morph"
import { EntryRail, groupEntries } from "./entry-rail"

/**
 * A captured session, read top to bottom — the Atlas desktop app's session
 * detail, on this system's tokens.
 *
 * Masthead (title, chips, four stats), then the entries on a rail, then a
 * floating bar: share on the left, the comment count on the right. The reader fills whatever it is given —
 * the dock at any of its three sizes — and tightens at compact width via
 * its container.
 */

const STATUS_LABEL = {
  live: "Live",
  queued: "Queued",
  failed: "Failed",
  done: "Done",
} as const

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

  // Thinking stays out, as in the product: it is the agent talking to
  // itself, and it doubles the length of a session.
  const scroller = useRef<HTMLDivElement>(null)
  const { focus } = useComments()

  // A jump from the comments panel: bring the entry the comment lives on to
  // the middle of the reader and mark it for a moment. A folded tool-call
  // group has to open before its row exists, so look for a few frames.
  useEffect(() => {
    if (!focus) return
    let tries = 0
    let clear = 0
    let raf = 0
    const find = () => {
      const el = scroller.current?.querySelector<HTMLElement>(
        `[data-entry="${CSS.escape(focus.anchorId)}"]`
      )
      if (!el) {
        if (++tries < 10) raf = requestAnimationFrame(find)
        return
      }
      el.scrollIntoView({ behavior: "smooth", block: "center" })
      el.dataset.focus = ""
      clear = window.setTimeout(() => delete el.dataset.focus, 1800)
    }
    raf = requestAnimationFrame(find)
    return () => {
      cancelAnimationFrame(raf)
      window.clearTimeout(clear)
    }
  }, [focus])

  const groups = useMemo(
    () => groupEntries(entries.filter((e) => e.kind !== "thinking")),
    [entries]
  )

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

      <div ref={scroller} className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-230 px-5 pt-8 pb-32 @3xl:px-14 @3xl:pt-12">
          <Masthead detail={detail} />
          <div className="mt-10">
            <EntryRail groups={groups} />
          </div>
        </div>
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-linear-to-b from-transparent to-card"
      />
      <BottomBar sessionId={s.id} entries={entries} />
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
    <div data-slot="session-masthead" data-entry={s.id}>
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
  sessionId,
  entries,
}: {
  sessionId: string
  entries: SessionDetailApi["entries"]
}) {
  // `items-end`: the comments button grows up and left into its panel, so
  // the bar must hold its items to the bottom edge while it does.
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 px-4 pb-3.5 *:pointer-events-auto">
      <ShareButton sessionId={sessionId} />
      <CommentsMorph entries={entries} />
    </div>
  )
}

/**
 * Copies a link to this session. The arrow lifts out of its tray while the
 * button is hovered; after a press the glyph turns to a check for a moment,
 * and the tooltip says what happened.
 */
function ShareButton({ sessionId }: { sessionId: string }) {
  const upload = useRef<UploadIconHandle>(null)
  const [copied, setCopied] = useState(false)

  async function share() {
    const url = new URL(window.location.href)
    url.searchParams.set("session", sessionId)
    try {
      await navigator.clipboard.writeText(url.toString())
    } catch {
      // Clipboard can be refused; the button still acknowledges the press.
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            type="button"
            aria-label={copied ? "Link copied" : "Share session"}
            onClick={share}
            onMouseEnter={() => upload.current?.startAnimation()}
            onMouseLeave={() => upload.current?.stopAnimation()}
            className="duration-fast relative flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border bg-card/80 text-muted-foreground shadow-md backdrop-blur-xl transition-colors hover:text-foreground"
          >
            {copied ? (
              <Icon icon={CheckIcon} size="sm" className="text-success" />
            ) : (
              <UploadIcon ref={upload} controlled />
            )}
          </button>
        }
      />
      <TooltipContent side="top">
        {copied ? "Link copied" : "Share"}
      </TooltipContent>
    </Tooltip>
  )
}

export { SessionReader }
