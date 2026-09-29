"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { CheckIcon, GitBranchIcon, XIcon } from "lucide-react"

import type { SessionDetailApi } from "@/mock/sessions-api"
import { ago } from "@/mock/time"
import { Icon } from "@/components/ui/icon"
import { ModelMark, agentFamily } from "@/components/ui/model-badge"
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
import { SessionStats } from "./session-stats"

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
        <div className="mx-auto w-full max-w-230 px-4 pt-6 pb-24 @3xl:px-10 @3xl:pt-8">
          <Masthead detail={detail} />
          <div className="mt-7">
            <EntryRail groups={groups} agent={s.agent} />
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

  return (
    <div data-slot="session-masthead" data-entry={s.id}>
      <div className="flex items-start gap-3">
        <h1 className="min-w-0 flex-1 text-lg leading-snug font-medium tracking-tight text-balance">
          {s.title ?? "Untitled session"}
        </h1>
        <CommentButton
          anchorKind="session"
          anchorId={s.id}
          className="mt-1 opacity-100"
        />
      </div>

      <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
        {s.agent && (
          <Chip>
            {agentFamily(s.agent) && (
              <ModelMark family={agentFamily(s.agent)!} className="size-3" />
            )}
            {s.agent}
          </Chip>
        )}
        {s.branches[0] && (
          <Chip>
            <Icon icon={GitBranchIcon} size="xs" />
            {s.branches[0]}
          </Chip>
        )}
        <time
          dateTime={s.lastActivityAt}
          className="ml-auto text-2xs text-muted-foreground"
        >
          {ago(s.lastActivityAt)}
        </time>
      </div>

      {/* Cells split by 1px gaps over a hairline backing, so the rules
          survive the 4 → 2×2 wrap at compact width. */}
      <div className="mt-3.5">
        <SessionStats detail={detail} />
      </div>
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
