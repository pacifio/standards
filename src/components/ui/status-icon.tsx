import { ThinkingOrb } from "thinking-orbs"
import { cn } from "cn"

/**
 * The session status glyph.
 *
 * Circles, because a status dot is a circle everywhere else a person has
 * seen one — and one thing that is not a circle: a running session is a
 * ThinkingOrb, a dotted sphere in constant motion. "Running" is the only
 * state where something is actually happening, so it is the only one that
 * moves; everything at rest is a still dot.
 *
 *   queued   a hollow ring in muted ink — nothing has happened yet
 *   live     the `composing` ThinkingOrb — work in progress
 *   done     a solid dot in muted ink — history, and it should recede
 *   failed   a solid dot in the error ink
 *
 * The orb is monochrome and follows `data-theme` on its own; it renders a
 * still frame under `prefers-reduced-motion`. It is drawn at its 20px inline
 * preset and fitted to the glyph box, so it sits on the same 14px footprint
 * as the dots (or whatever `size-*` the caller passes).
 */

export type SessionStatusKind = "queued" | "live" | "done" | "failed"

const TONE: Record<SessionStatusKind, string> = {
  queued: "text-muted-foreground",
  live: "text-foreground",
  done: "text-muted-foreground",
  failed: "text-error",
}

const LABEL: Record<SessionStatusKind, string> = {
  queued: "Queued",
  live: "Running",
  done: "Done",
  failed: "Failed",
}

function StatusIcon({
  status,
  className,
}: {
  status: SessionStatusKind
  className?: string
}) {
  if (status === "live") {
    return (
      <span
        data-slot="status-icon"
        data-status={status}
        role="img"
        aria-label={LABEL[status]}
        className={cn("inline-block size-3.5 shrink-0", className)}
      >
        <ThinkingOrb
          state="composing"
          size={20}
          // Drawn at the 20px preset and scaled down to 14, so the dots
          // are thickened to keep the same weight as the solid dots.
          dotSize={1.4}
          aria-hidden="true"
          style={{ width: "100%", height: "100%" }}
        />
      </span>
    )
  }

  return (
    <svg
      data-slot="status-icon"
      data-status={status}
      viewBox="0 0 14 14"
      width="14"
      height="14"
      fill="none"
      role="img"
      aria-label={LABEL[status]}
      className={cn("size-3.5 shrink-0", TONE[status], className)}
    >
      {status === "queued" ? (
        <circle
          cx="7"
          cy="7"
          r="3.75"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      ) : (
        <circle cx="7" cy="7" r="4.25" fill="currentColor" />
      )}
    </svg>
  )
}

/**
 * Priority, as four stepped bars.
 *
 * Bars, because they solve a real problem: priority needs to be
 * comparable down a column at a glance, and a coloured chip per level turns
 * the list into a traffic light that competes with status. Bars encode
 * magnitude in height, which the eye reads without decoding a colour key.
 */
export type Priority = "none" | "low" | "medium" | "high" | "urgent"

const FILLED: Record<Priority, number> = {
  none: 0,
  low: 1,
  medium: 2,
  high: 3,
  urgent: 3,
}

function PriorityIcon({
  priority,
  className,
  ...props
}: Omit<React.ComponentProps<"svg">, "ref"> & { priority: Priority }) {
  const filled = FILLED[priority]
  return (
    <svg
      data-slot="priority-icon"
      data-priority={priority}
      viewBox="0 0 14 14"
      width="14"
      height="14"
      role="img"
      aria-label={`Priority: ${priority}`}
      className={cn(
        "shrink-0",
        // Urgent is the one priority that earns colour — it is an exception,
        // and an exception that is always on stops being one.
        priority === "urgent" ? "text-error" : "text-muted-foreground",
        className
      )}
      {...props}
    >
      {priority === "urgent" ? (
        <>
          <rect
            x="1.5"
            y="1.5"
            width="11"
            height="11"
            rx="2.5"
            fill="currentColor"
          />
          <path
            d="M7 4.2 V 7.9"
            stroke="var(--background)"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <circle cx="7" cy="10" r="0.9" fill="var(--background)" />
        </>
      ) : (
        [0, 1, 2].map((i) => (
          <rect
            key={i}
            x={2 + i * 4}
            y={9 - i * 2.5}
            width="2.6"
            height={3 + i * 2.5}
            rx="0.8"
            fill="currentColor"
            opacity={i < filled ? 1 : 0.28}
          />
        ))
      )}
    </svg>
  )
}

export { PriorityIcon, StatusIcon }
