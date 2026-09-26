import { cn } from "cn"

/**
 * The session status glyph.
 *
 * This is the single most load-bearing 14px in a Linear issue row, and the
 * previous build of this system did not have it at all — status was rendered
 * as a grey text label, which is why a board of 200 rows read as undifferen-
 * tiated prose. The glyph is scannable at a glance in a way a word is not:
 * you read the ring, not the label.
 *
 * Drawn rather than pulled from Lucide because the states are a progression —
 * empty ring, partial wedge, full check — and Lucide has no set where those
 * three share a silhouette. A circle that fills is a progress bar you can read
 * peripherally.
 *
 * `queued` is deliberately the same grey as tertiary text. Nothing is
 * happening, so nothing should catch the eye.
 */

export type SessionStatusKind = "queued" | "live" | "done" | "failed"

/**
 * Monochrome first. `done` is a filled check in the FOREGROUND ink, not a
 * colour — a finished session is the resting state and should not glow.
 * Only the states that need attention carry chroma.
 */
const TONE: Record<SessionStatusKind, string> = {
  queued: "text-muted-foreground",
  live: "text-success",
  done: "text-foreground",
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
  ...props
}: Omit<React.ComponentProps<"svg">, "ref"> & { status: SessionStatusKind }) {
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
      className={cn("shrink-0", TONE[status], className)}
      {...props}
    >
      {/* The ring is common to every state, so the glyph keeps one
          silhouette and only its fill changes. */}
      <circle
        cx="7"
        cy="7"
        r="5.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray={status === "queued" ? "1.6 1.8" : undefined}
        opacity={status === "queued" ? 0.9 : 1}
      />

      {/* Running: a wedge, not a spinner. A session that has been going for
          forty minutes should not animate forever in the corner of the eye. */}
      {status === "live" && (
        <path d="M7 7 V 2.4 A 4.6 4.6 0 0 1 11.6 7 Z" fill="currentColor" />
      )}

      {status === "done" && (
        <>
          <circle cx="7" cy="7" r="5.5" fill="currentColor" />
          <path
            d="M4.6 7.1 L6.3 8.8 L9.5 5.4"
            stroke="var(--background)"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      )}

      {status === "failed" && (
        <>
          <circle cx="7" cy="7" r="5.5" fill="currentColor" />
          <path
            d="M5.1 5.1 L8.9 8.9 M8.9 5.1 L5.1 8.9"
            stroke="var(--background)"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </>
      )}
    </svg>
  )
}

/**
 * Priority, as four stepped bars.
 *
 * Borrowed from Linear because it solves a real problem: priority needs to be
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
