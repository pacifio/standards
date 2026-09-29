"use client"

import { cn } from "cn"

import { useMeasure } from "@/lib/use-measure"

import { estCost } from "@/mock/sessions-api"
import type { SessionDetailApi } from "@/mock/sessions-api"
import { formatDuration, formatTokens, hm } from "@/mock/time"

/**
 * A session's numbers as four compact cells — active time, tokens, context,
 * estimated cost — split by hairlines, 2×2 in the compact panel and four
 * across when there is room.
 *
 * Context is the one cell drawn as a bar: the model's window as segmented
 * ticks (the Atlas desktop app's usage indicator, at cell size), green
 * while there is room, amber past 75% of the window and red past 90% — by
 * position, so a bar that reaches 92% shows where it crossed — with a
 * cursor at the fill line and the unused window faint behind it.
 */

function SessionStats({ detail }: { detail: SessionDetailApi }) {
  const s = detail.summary
  const cost = estCost(s)
  return (
    // Cells split by 1px gaps over a hairline backing, so the rules survive
    // the 4 → 2×2 wrap at compact width.
    <dl
      data-slot="session-stats"
      className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-border bg-hairline @2xl:grid-cols-4"
    >
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
      <ContextCell used={s.contextUsed} size={s.contextSize} />
      <Stat
        label="Est. cost"
        value={cost === null ? "—" : `$${cost.toFixed(2)}`}
        sub={s.model ?? "unknown model"}
      />
    </dl>
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
    <div className="min-w-0 bg-card px-3 py-2.5">
      <dt className="micro">{label}</dt>
      <dd>
        <p className="mt-1 truncate mono text-md font-medium tracking-tight">
          {value}
        </p>
        <p className="mt-0.5 truncate mono text-3xs text-disabled">{sub}</p>
      </dd>
    </div>
  )
}

/**
 * One tick per ~7px of bar, so ticks keep the dashboard meter's slim pill
 * shape (≈5px wide, 12px tall) at any cell width instead of fattening
 * into sausages in a wide panel. Until the bar is measured, 24.
 */
const TICK_PITCH = 7

function ContextCell({
  used,
  size,
}: {
  used: number | null
  size: number | null
}) {
  const [bar, { width }] = useMeasure<HTMLDivElement>()
  const SEGMENTS = width
    ? Math.min(60, Math.max(12, Math.round((width + 2) / TICK_PITCH)))
    : 24

  if (used === null || size === null) {
    return <Stat label="Context" value="—" sub="not reported" />
  }
  const share = Math.min(used / size, 1)
  const pct = Math.round(share * 100)
  const lit = share > 0 ? Math.max(1, Math.round(share * SEGMENTS)) : 0
  const warnAt = Math.round(SEGMENTS * 0.75)
  const hotAt = Math.round(SEGMENTS * 0.9)
  const level = share >= 0.9 ? "high" : share >= 0.75 ? "warn" : "ok"
  const tone = (i: number) =>
    i >= hotAt ? "bg-error" : i >= warnAt ? "bg-warning" : "bg-success"

  const ticks = Array.from({ length: SEGMENTS }, (_, i) => (
    <span
      key={i}
      className={cn(
        "min-w-0 flex-1 rounded-full",
        tone(i),
        i >= lit && "opacity-20"
      )}
    />
  ))

  return (
    <div className="min-w-0 bg-card px-3 py-2.5">
      <dt className="micro">Context</dt>
      <dd>
        <p className="mt-1 flex items-center gap-1.5">
          <span className="mono text-md font-medium tracking-tight">
            {pct}%
          </span>
          {level !== "ok" && (
            <span
              className={cn(
                "rounded-full px-1.5 text-4xs font-medium tracking-wider uppercase ring-1",
                level === "high"
                  ? "bg-error-muted text-error ring-error/40"
                  : "bg-warning-muted text-warning ring-warning/40"
              )}
            >
              Warn
            </span>
          )}
        </p>
        <div
          ref={bar}
          role="meter"
          aria-label="Context used"
          aria-valuemin={0}
          aria-valuemax={size}
          aria-valuenow={used}
          className="mt-2 flex h-3 items-stretch gap-0.5"
        >
          {ticks.slice(0, lit)}
          <span
            aria-hidden="true"
            className="-my-0.5 w-0.5 shrink-0 rounded-full bg-foreground"
          />
          {ticks.slice(lit)}
        </div>
        <p className="mt-1 truncate mono text-3xs text-disabled">
          {formatTokens(used)} / {formatTokens(size)}
        </p>
      </dd>
    </div>
  )
}

export { SessionStats }
