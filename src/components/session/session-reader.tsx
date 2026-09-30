"use client"

import { useEffect, useMemo, useRef } from "react"
import { ExternalLinkIcon, GitBranchIcon, XIcon } from "lucide-react"
import { cn } from "cn"

import type { SessionDetailApi } from "@/mock/sessions-api"
import { ago } from "@/mock/time"
import { DashedRails } from "@/components/blocks/dashed-rails"
import { ScrollRail } from "@/components/blocks/scroll-rail"
import { Icon } from "@/components/ui/icon"
import { ModelMark, agentFamily } from "@/components/ui/model-badge"
import { IconButton } from "@/components/ui/icon-button"
import { StatusIcon } from "@/components/ui/status-icon"
import { CommentButton, CommentsProvider, useComments } from "./comments"
import type { Viewer } from "./comments"
import { CommentsMorph } from "./comments-morph"
import { ShareMorph } from "./share-morph"
import { EntryRail, groupEntries } from "./entry-rail"
import { SessionStats } from "./session-stats"

/**
 * A captured session, read top to bottom — the Atlas desktop app's session
 * detail, on this system's tokens.
 *
 * Masthead (title, chips, four stats), then the entries on a rail, then a
 * floating bar: share on the left, the comment count on the right. In the
 * dock it fills whatever it is given and tightens at compact width via its
 * container; on the public page (`variant="page"`) it is a column between
 * dashed rails, and the page brings its own chrome.
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
  variant = "panel",
  viewer,
}: {
  detail: SessionDetailApi
  /** A comment id to open and mark. */
  highlight?: string
  /** Controls for the panel's header, e.g. its size toggle. */
  toolbar?: React.ReactNode
  onClose?: () => void
  /**
   * `panel`: inside the dock, with its own header. `page`: the public link,
   * where the page supplies the chrome and the column sits between rails.
   */
  variant?: "panel" | "page"
  /** Who is reading; defaults to the signed-in member. */
  viewer?: Viewer
}) {
  return (
    <CommentsProvider
      key={detail.summary.id}
      sessionId={detail.summary.id}
      initial={detail.comments}
      highlight={highlight}
      viewer={viewer}
    >
      <Reader
        detail={detail}
        toolbar={toolbar}
        onClose={onClose}
        variant={variant}
      />
    </CommentsProvider>
  )
}

/** The public, standalone link for a session. */
const publicPath = (id: string) => `/mock/s/${id}`

function Reader({
  detail,
  toolbar,
  onClose,
  variant,
}: {
  detail: SessionDetailApi
  toolbar?: React.ReactNode
  onClose?: () => void
  variant: "panel" | "page"
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
      {variant === "panel" && (
        <header className="flex h-11 shrink-0 items-center gap-2 border-b border-hairline px-3">
          <StatusIcon status={s.status} />
          <span className="text-xs font-medium">{STATUS_LABEL[s.status]}</span>
          <span className="mono text-2xs text-muted-foreground">{s.ref}</span>
          {/* The session on its own page — the link a share hands out. */}
          <IconButton
            icon={ExternalLinkIcon}
            label="Open in a new tab"
            size="xs"
            onClick={() =>
              window.open(publicPath(s.id), "_blank", "noopener,noreferrer")
            }
          />
          <span className="flex-1" />
          {toolbar}
          {onClose && (
            <IconButton
              icon={XIcon}
              label="Close"
              size="sm"
              onClick={onClose}
            />
          )}
        </header>
      )}

      {variant === "panel" ? (
        <div ref={scroller} className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-230 px-4 pt-6 pb-24 @3xl:px-10 @3xl:pt-8">
            <Masthead detail={detail} />
            <div className="mt-7">
              <EntryRail groups={groups} agent={s.agent} />
            </div>
          </div>
        </div>
      ) : (
        // The page: a container, so the rails answer to its width, and a
        // column framed by dashed rails, like the inbox.
        <div
          ref={scroller}
          className="@container min-h-0 flex-1 overflow-y-auto"
        >
          <div className="flex min-h-full flex-col px-2 @5xl:px-10">
            <div className="relative mx-auto w-full max-w-232 flex-1 px-5 pt-10 pb-28">
              {/* Well clear of the column — 9.75rem off the content, three
                  times the inbox's — and only where the page is wide
                  enough to hold them there. */}
              <DashedRails offset="-8.5rem" className="hidden @7xl:block" />
              <Masthead detail={detail} />
              <div className="mt-8">
                <EntryRail groups={groups} agent={s.agent} />
              </div>
            </div>
          </div>
        </div>
      )}

      {variant === "page" && (
        // Reading progress, parked in the left gutter at mid-height. Only
        // where the gutter is wide enough to hold it clear of the column.
        <ScrollRail
          container={scroller}
          className="absolute top-1/2 left-8 hidden -translate-y-1/2 xl:block"
        />
      )}

      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-linear-to-b from-transparent",
          variant === "panel" ? "to-card" : "to-background"
        )}
      />
      {variant === "panel" ? (
        <BottomBar detail={detail} entries={entries} />
      ) : (
        // On the page the bar keeps to the column, not the window's edges.
        <div className="@container pointer-events-none absolute inset-x-0 bottom-0 px-2 @5xl:px-10">
          <div className="relative mx-auto max-w-232">
            <BottomBar detail={detail} entries={entries} />
          </div>
        </div>
      )}
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
  detail,
  entries,
}: {
  detail: SessionDetailApi
  entries: SessionDetailApi["entries"]
}) {
  // `items-end`: each button grows up out of its corner into its panel, so
  // the bar must hold its items to the bottom edge while they do.
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 px-4 pb-3.5 *:pointer-events-auto">
      <ShareMorph detail={detail} />
      <CommentsMorph entries={entries} />
    </div>
  )
}

export { SessionReader }
