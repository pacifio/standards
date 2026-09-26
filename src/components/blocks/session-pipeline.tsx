"use client"

import {
  CheckCircle2Icon,
  CircleDashedIcon,
  PlayIcon,
  XCircleIcon,
} from "lucide-react"
import { cn } from "cn"

import type { Session, TimelineEntry } from "@/mock/types"
import { Icon } from "@/components/ui/icon"
import { Tag } from "@/components/ui/tag"

/**
 * A session as a pipeline of steps. natai's `agent-task-planning`
 * illustration, reworked onto real session data.
 *
 * Three visual states, and they are read by silhouette before colour: done
 * is a filled check with the title struck through and dimmed; the running
 * step is the one highlighted row with a slow dashed spinner; everything
 * after it sits at 40%. Only the running row gets the ring, so the eye
 * lands there first.
 */
function SessionPipeline({
  session,
  entries,
  className,
}: {
  session: Session
  entries: Array<TimelineEntry>
  className?: string
}) {
  const steps = entries.filter((e) => e.kind === "tool_call")
  const runningIndex = steps.findIndex((s) => s.toolStatus === "running")
  const done = steps.filter((s) => s.toolStatus === "ok").length

  return (
    <div
      data-slot="session-pipeline"
      className={cn(
        "rounded-2xl bg-card/95 p-6 ring-1 ring-border-illustration",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <div className="text-sm font-medium">{session.ref}</div>
        <Tag
          hue={session.status === "live" ? "green" : "grey"}
          dot
          className="ml-auto"
        >
          {session.status === "live"
            ? `${session.agent} running`
            : session.agent}
        </Tag>
      </div>

      <div className="mt-4 rounded-lg bg-illustration p-2.5 ring-1 ring-border-illustration">
        <div className="text-3xs text-muted-foreground">Target</div>
        <div className="mt-1 text-xs">
          {session.project} · <span className="mono">{session.branch}</span> ·{" "}
          {session.title}
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {steps.map((step, i) => {
          const running = step.toolStatus === "running"
          const failed = step.toolStatus === "error"
          const ok = step.toolStatus === "ok"
          const pending = runningIndex !== -1 && i > runningIndex
          return (
            <div
              key={step.id}
              className={cn(
                "flex items-start gap-2",
                running &&
                  "-mx-2 rounded-lg bg-primary-muted p-2 ring-1 ring-foreground/20",
                pending && "opacity-40"
              )}
            >
              <div className="relative mt-0.5 shrink-0">
                {ok && (
                  <Icon
                    icon={CheckCircle2Icon}
                    size="md"
                    className="text-foreground"
                  />
                )}
                {failed && (
                  <Icon icon={XCircleIcon} size="md" className="text-error" />
                )}
                {running && (
                  <>
                    <Icon
                      icon={CircleDashedIcon}
                      size="md"
                      className="animate-spin text-foreground [animation-duration:3s]"
                    />
                    <PlayIcon className="absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 fill-current text-foreground" />
                  </>
                )}
                {!ok && !failed && !running && (
                  <Icon
                    icon={CircleDashedIcon}
                    size="md"
                    className="text-muted-foreground"
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div
                  className={cn(
                    "truncate text-xs font-medium",
                    ok && "line-through opacity-50",
                    running && "font-semibold",
                    failed && "text-error"
                  )}
                >
                  {step.title}
                </div>
                {step.detail && (
                  <div className="truncate text-3xs text-muted-foreground">
                    {step.detail}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-3 flex items-center justify-between text-3xs text-muted-foreground">
        <span className="tnum">
          {done}/{steps.length} tool calls
        </span>
        <span className="tnum">{session.durationMinutes} min</span>
      </div>
    </div>
  )
}

export { SessionPipeline }
