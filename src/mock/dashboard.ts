/**
 * Fixtures for the org dashboard.
 *
 * Series are generated, not hand-written, but from a fixed seed — the server
 * render and the client render must produce identical numbers or hydration
 * fails. `mulberry32` is a tiny deterministic PRNG; the same seed always
 * yields the same sequence.
 */

import type { LabelTone } from "@/mock/types"

export type DashboardRange = "24h" | "7d" | "30d"

export const RANGE_LABEL: Record<DashboardRange, string> = {
  "24h": "Last 24 hours",
  "7d": "Last 7 days",
  "30d": "Last 30 days",
}

/** Columns per range: hours, days, days. */
const POINTS: Record<DashboardRange, number> = {
  "24h": 24,
  "7d": 28,
  "30d": 30,
}

function mulberry32(seed: number) {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Bursty activity: mostly quiet, with the occasional spike — which is what
 * agent usage actually looks like (a long session, then nothing), and what
 * makes a dot-matrix readable.
 */
function series(seed: number, n: number, burst: number): Array<number> {
  const rand = mulberry32(seed)
  return Array.from({ length: n }, () => {
    const r = rand()
    if (r > 1 - burst) return 4 + rand() * 6
    if (r > 0.45) return rand() * 2.5
    return rand() < 0.5 ? 0 : 0.4
  })
}

export type StatFigure = {
  id: string
  label: string
  badge?: string
  value: string
  trend: number
  series: Array<number>
}

export type TokenPart = {
  id: string
  label: string
  value: string
  share: number
  /** Identity hue — the same for a part in every range. */
  hue: LabelTone
}

const SEED: Record<DashboardRange, number> = { "24h": 11, "7d": 29, "30d": 47 }

const FIGURES: Record<
  DashboardRange,
  Array<Omit<StatFigure, "series"> & { burst: number }>
> = {
  "24h": [
    { id: "tokens", label: "Tokens", value: "2.4M", trend: 18, burst: 0.12 },
    {
      id: "cost",
      label: "Cost",
      badge: "est.",
      value: "$41.80",
      trend: 22,
      burst: 0.12,
    },
    { id: "sessions", label: "Sessions", value: "12", trend: -8, burst: 0.2 },
    { id: "messages", label: "Messages", value: "486", trend: 11, burst: 0.25 },
    {
      id: "cache",
      label: "Cache hit rate",
      value: "94%",
      trend: 3,
      burst: 0.5,
    },
  ],
  "7d": [
    { id: "tokens", label: "Tokens", value: "19.1M", trend: 406, burst: 0.1 },
    {
      id: "cost",
      label: "Cost",
      badge: "est.",
      value: "$322.25",
      trend: 86,
      burst: 0.1,
    },
    { id: "sessions", label: "Sessions", value: "73", trend: 52, burst: 0.25 },
    {
      id: "messages",
      label: "Messages",
      value: "3,060",
      trend: 30,
      burst: 0.3,
    },
    {
      id: "cache",
      label: "Cache hit rate",
      value: "96%",
      trend: 15,
      burst: 0.55,
    },
  ],
  "30d": [
    { id: "tokens", label: "Tokens", value: "68.7M", trend: 212, burst: 0.14 },
    {
      id: "cost",
      label: "Cost",
      badge: "est.",
      value: "$1,184.60",
      trend: 64,
      burst: 0.14,
    },
    { id: "sessions", label: "Sessions", value: "281", trend: 37, burst: 0.3 },
    {
      id: "messages",
      label: "Messages",
      value: "11,942",
      trend: 24,
      burst: 0.35,
    },
    {
      id: "cache",
      label: "Cache hit rate",
      value: "95%",
      trend: 9,
      burst: 0.5,
    },
  ],
}

export function statFigures(range: DashboardRange): Array<StatFigure> {
  return FIGURES[range].map(({ burst, ...f }, i) => ({
    ...f,
    series: series(SEED[range] * 100 + i, POINTS[range], burst),
  }))
}

const PARTS: Record<DashboardRange, Array<TokenPart>> = {
  "24h": [
    { id: "input", hue: "cyan", label: "Input", value: "2.1M", share: 0.02 },
    {
      id: "output",
      hue: "purple",
      label: "Output",
      value: "318K",
      share: 0.004,
    },
    {
      id: "cache-read",
      hue: "green",
      label: "Cache read",
      value: "142M",
      share: 0.95,
    },
    {
      id: "cache-write",
      hue: "amber",
      label: "Cache write",
      value: "3.2M",
      share: 0.026,
    },
  ],
  "7d": [
    { id: "input", hue: "cyan", label: "Input", value: "16.5M", share: 0.01 },
    {
      id: "output",
      hue: "purple",
      label: "Output",
      value: "2.6M",
      share: 0.002,
    },
    {
      id: "cache-read",
      hue: "green",
      label: "Cache read",
      value: "1.1B",
      share: 0.96,
    },
    {
      id: "cache-write",
      hue: "amber",
      label: "Cache write",
      value: "25.4M",
      share: 0.02,
    },
  ],
  "30d": [
    { id: "input", hue: "cyan", label: "Input", value: "59.2M", share: 0.012 },
    {
      id: "output",
      hue: "purple",
      label: "Output",
      value: "9.5M",
      share: 0.002,
    },
    {
      id: "cache-read",
      hue: "green",
      label: "Cache read",
      value: "4.3B",
      share: 0.95,
    },
    {
      id: "cache-write",
      hue: "amber",
      label: "Cache write",
      value: "118M",
      share: 0.03,
    },
  ],
}

export function tokenParts(range: DashboardRange): Array<TokenPart> {
  return PARTS[range]
}

/* --- Activity --------------------------------------------------------- */

export type ActivityKind =
  | "session_started"
  | "checkpoint"
  | "comment"
  | "session_done"
  | "session_failed"
  | "member_joined"
  | "project_synced"

export type ActivityEvent = {
  id: string
  kind: ActivityKind
  actor: string
  initials: string
  /** Set when an agent, not a person, did the thing. */
  agent?: string
  /** The sentence after the actor's name. */
  action: string
  ref?: string
  project?: string
}

/**
 * The pool the live feed draws from. It cycles, so the feed never runs dry;
 * every drawn event gets a fresh id so React treats a repeat as new.
 */
export const ACTIVITY_POOL: Array<ActivityEvent> = [
  {
    id: "a1",
    kind: "session_started",
    actor: "Uzayer Masud",
    initials: "UM",
    agent: "Claude Code",
    action: "started a session on",
    ref: "ATL-281",
    project: "atlas",
  },
  {
    id: "a2",
    kind: "checkpoint",
    actor: "Azraf Al Monzim",
    initials: "AA",
    agent: "Codex",
    action: "saved checkpoint 4 on",
    ref: "ATL-273",
    project: "atlas",
  },
  {
    id: "a3",
    kind: "comment",
    actor: "Talha Razz",
    initials: "TR",
    action: "commented on",
    ref: "ATL-109",
    project: "atlas",
  },
  {
    id: "a4",
    kind: "session_done",
    actor: "Adib Mohsin",
    initials: "AM",
    agent: "Claude Code",
    action: "finished",
    ref: "ATL-124",
    project: "server",
  },
  {
    id: "a5",
    kind: "project_synced",
    actor: "Atlas",
    initials: "AT",
    action: "synced 14 sessions from",
    project: "standards",
  },
  {
    id: "a6",
    kind: "session_failed",
    actor: "Ahammad Nafiz",
    initials: "AN",
    agent: "Gemini CLI",
    action: "hit an error in",
    ref: "ATL-97",
    project: "server",
  },
  {
    id: "a7",
    kind: "member_joined",
    actor: "jsmith@example.com",
    initials: "JS",
    action: "accepted an invite as Developer",
  },
  {
    id: "a8",
    kind: "checkpoint",
    actor: "Uzayer Masud",
    initials: "UM",
    agent: "Claude Code",
    action: "saved checkpoint 2 on",
    ref: "ATL-281",
    project: "atlas",
  },
  {
    id: "a9",
    kind: "comment",
    actor: "Azraf Al Monzim",
    initials: "AA",
    action: "replied on",
    ref: "ATL-273",
    project: "atlas",
  },
  {
    id: "a10",
    kind: "session_started",
    actor: "Adib Mohsin",
    initials: "AM",
    agent: "Codex",
    action: "started a session on",
    ref: "ATL-284",
    project: "standards",
  },
  {
    id: "a11",
    kind: "session_done",
    actor: "Azraf Al Monzim",
    initials: "AA",
    agent: "Codex",
    action: "finished",
    ref: "ATL-273",
    project: "atlas",
  },
  {
    id: "a12",
    kind: "project_synced",
    actor: "Atlas",
    initials: "AT",
    action: "synced 3 sessions from",
    project: "server",
  },
]
