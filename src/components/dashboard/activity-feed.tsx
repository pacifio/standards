"use client"

import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import {
  ActivityIcon,
  BookmarkIcon,
  CheckIcon,
  MessageSquareIcon,
  PlayIcon,
  RefreshCwIcon,
  TriangleAlertIcon,
  UserPlusIcon,
} from "lucide-react"
import { cn } from "cn"

import { ACTIVITY_POOL } from "@/mock/dashboard"
import type { ActivityEvent, ActivityKind } from "@/mock/dashboard"
import { EASE_PANEL } from "@/lib/motion"
import { CardHeader } from "@/components/dashboard/card-header"
import { Icon } from "@/components/ui/icon"
import { PersonAvatar } from "@/components/patterns/person-avatar"

/**
 * What the org is doing right now, as a stream.
 *
 * New events arrive at the top and push the rest down; the oldest falls off
 * the bottom under a fade rather than being cut. Hovering (or focusing into)
 * the box pauses the stream — nobody can read a row that moves while they
 * are reading it — and the LIVE tag says so. Under `prefers-reduced-motion`
 * it never streams at all: the seed list is shown and stays put.
 *
 * Ages are counted from mount, not from `Date.now()`, so the server render
 * and the first client render agree and hydration holds.
 */

const KIND_ICON: Record<ActivityKind, typeof PlayIcon> = {
  session_started: PlayIcon,
  checkpoint: BookmarkIcon,
  comment: MessageSquareIcon,
  session_done: CheckIcon,
  session_failed: TriangleAlertIcon,
  member_joined: UserPlusIcon,
  project_synced: RefreshCwIcon,
}

type Row = ActivityEvent & { key: string; at: number }

const MAX_ROWS = 7
const INTERVAL_MS = 3500
/** Seconds ago, for the rows already on screen at mount. */
const SEED_AGES = [8, 41, 95, 260, 610, 1380, 3100]

function age(seconds: number): string {
  if (seconds < 5) return "now"
  if (seconds < 60) return `${Math.floor(seconds)}s`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`
  return `${Math.floor(seconds / 3600)}h`
}

function ActivityFeed({ className }: { className?: string }) {
  const [rows, setRows] = useState<Array<Row>>(() =>
    ACTIVITY_POOL.slice(0, MAX_ROWS).map((e, i) => ({
      ...e,
      key: `seed-${e.id}`,
      at: -SEED_AGES[i],
    }))
  )
  const [elapsed, setElapsed] = useState(0)
  const [paused, setPaused] = useState(false)
  const cursor = useRef(MAX_ROWS)
  const clock = useRef(0)
  const pausedRef = useRef(false)

  useEffect(() => {
    pausedRef.current = paused
  }, [paused])

  // The clock: one tick a second, so ages stay honest. Mirrored in a ref so
  // the stream can stamp a row without reading state inside an updater.
  useEffect(() => {
    const id = window.setInterval(() => {
      clock.current += 1
      setElapsed(clock.current)
    }, 1000)
    return () => window.clearInterval(id)
  }, [])

  // The stream.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    let n = 0
    const id = window.setInterval(() => {
      if (pausedRef.current) return
      const next = ACTIVITY_POOL[cursor.current % ACTIVITY_POOL.length]
      cursor.current += 1
      n += 1
      const row = { ...next, key: `live-${n}-${next.id}`, at: clock.current }
      setRows((prev) => [row, ...prev].slice(0, MAX_ROWS))
    }, INTERVAL_MS)
    return () => window.clearInterval(id)
  }, [])

  return (
    <section
      className={cn(
        "flex min-h-0 flex-col overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10",
        className
      )}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <CardHeader
        icon={ActivityIcon}
        title="Activity"
        description="Sessions, checkpoints and people across the workspace"
        action={<LiveTag paused={paused} />}
      />

      <ol
        aria-live="polite"
        aria-relevant="additions"
        className="relative min-h-0 flex-1 overflow-hidden mask-b-from-80% px-2 pb-2"
      >
        <AnimatePresence initial={false}>
          {rows.map((row) => (
            <motion.li
              key={row.key}
              layout
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.32, ease: EASE_PANEL }}
            >
              <ActivityRow row={row} ago={age(elapsed - row.at)} />
            </motion.li>
          ))}
        </AnimatePresence>
      </ol>
    </section>
  )
}

function ActivityRow({ row, ago }: { row: Row; ago: string }) {
  const failed = row.kind === "session_failed"
  return (
    <div className="duration-fast flex items-start gap-2.5 rounded-lg px-2 py-2 transition-colors hover:bg-element-hover">
      <PersonAvatar
        size="sm"
        className="mt-px"
        name={row.actor}
        initials={row.initials}
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs text-secondary-foreground">
          <span className="font-medium text-foreground">{row.actor}</span>{" "}
          {row.action}
          {row.ref && (
            <span className="ml-1 mono text-2xs text-foreground">
              {row.ref}
            </span>
          )}
          {!row.ref && row.project && (
            <span className="ml-1 text-foreground">{row.project}</span>
          )}
        </p>
        <p
          className={cn(
            "mt-0.5 flex items-center gap-1 text-2xs text-muted-foreground",
            failed && "text-error"
          )}
        >
          <Icon icon={KIND_ICON[row.kind]} size="xs" />
          <span className="truncate">
            {row.agent ? `via ${row.agent}` : "Workspace"}
            {row.ref && row.project ? ` · ${row.project}` : ""}
          </span>
        </p>
      </div>
      <span className="shrink-0 pt-0.5 text-3xs text-muted-foreground tnum">
        {ago}
      </span>
    </div>
  )
}

/** The same LIVE vocabulary as the login globe's status tags. */
function LiveTag({ paused }: { paused: boolean }) {
  return (
    <span className="flex shrink-0 items-center gap-1.5 rounded-md py-1 pr-2 pl-1.5 ring-1 ring-foreground/10">
      <span
        aria-hidden="true"
        className={cn(
          "size-1.5 rounded-full",
          paused ? "bg-muted-foreground" : "animate-shimmer-row bg-success"
        )}
      />
      <span
        className={cn(
          "mono text-4xs font-medium tracking-widest uppercase",
          paused ? "text-muted-foreground" : "text-success"
        )}
      >
        {paused ? "Paused" : "Live"}
      </span>
    </span>
  )
}

export { ActivityFeed }
