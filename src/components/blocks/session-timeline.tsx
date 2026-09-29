"use client"

import { motion } from "motion/react"
import { cn } from "cn"

import { ENTRY_ICON } from "@/lib/timeline-icons"
import type { SessionStatus, TimelineEntry } from "@/mock/types"
import { Icon } from "@/components/ui/icon"
import { StatusIcon } from "@/components/ui/status-icon"

/**
 * A session's entries on a dashed rail with elbow connectors,
 * drawn from real timeline data.
 *
 * The rail is a dashed hairline; each entry hangs off it on a quarter-round
 * elbow (`rounded-bl-full` on a bordered box, which is the whole trick). The
 * head card carries the session's status glyph so the rail reads as one
 * story with a conclusion, not a list.
 */
function SessionTimeline({
  status,
  entries,
  className,
}: {
  status: SessionStatus
  entries: Array<TimelineEntry>
  className?: string
}) {
  const heading =
    status === "live"
      ? "Session running"
      : status === "failed"
        ? "Session failed"
        : status === "queued"
          ? "Session queued"
          : "Session complete"

  return (
    <div data-slot="session-timeline" className={cn("min-w-0", className)}>
      <div className="flex items-center gap-2 rounded-xl bg-illustration p-3 ring-1 ring-border-illustration">
        <StatusIcon status={status} />
        <span className="text-sm font-medium">{heading}</span>
      </div>

      <div className="relative space-y-3 pt-4 pl-6">
        <div className="absolute top-0 bottom-6 left-6 border-l border-dashed border-foreground/15" />
        {entries.map((entry, i) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.22 }}
            className="relative pl-6"
          >
            <div className="absolute top-0 bottom-1/2 left-0 w-6 rounded-bl-full border-b border-l border-dashed border-foreground/15" />
            <div className="flex items-center gap-2 rounded-xl bg-card p-3 ring-1 ring-border-illustration">
              <Icon
                icon={ENTRY_ICON[entry.kind]}
                size="sm"
                className={cn(
                  entry.toolStatus === "error"
                    ? "text-error"
                    : "text-muted-foreground"
                )}
              />
              <span className="min-w-0 flex-1 truncate text-xs font-medium text-muted-foreground">
                <span
                  className={cn(entry.toolStatus === "error" && "text-error")}
                >
                  {entry.title}
                </span>
                <span className="pl-1.5 text-xs text-foreground/50 tnum">
                  {entry.at}
                </span>
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export { SessionTimeline }
