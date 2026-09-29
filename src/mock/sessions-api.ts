/**
 * Captured sessions, shaped exactly as the server's session API returns
 * them (`packages/contracts/src/sessions.ts` and `comments.ts` in the server
 * repo): `SessionSummary` for a list row, `TimelineEntry` for each thing that
 * happened in a session, `ArtifactComment` for a comment anchored on one.
 *
 * Derived from the board's `SESSIONS` so the dashboard, sidebar and timeline
 * agree on titles, authors and status. Everything is deterministic — the
 * same session id always yields the same transcript — so the server and
 * client renders match.
 *
 * Two fields the server does not send are added for the mock and marked:
 * `ref` and `status` (the board's own vocabulary), and `estCost`, which the
 * Atlas desktop app computes from a price table exactly like this one.
 */

import { MEMBERS, SESSIONS } from "./data"
import { ageMinutes } from "./age"
import { minutesBefore } from "./time"
import type { Session, SessionStatus } from "./types"

/* --- Contract types ---------------------------------------------------- */

export type EntryKind =
  "prompt" | "response" | "thinking" | "tool_call" | "checkpoint"

export type ToolStatus = "pending" | "running" | "completed" | "failed"

export type CommentAnchorKindApi =
  "session" | "message" | "tool_call" | "checkpoint"

export type SessionSummaryApi = {
  id: string
  workspaceId: string
  workspaceSlug: string
  authorId: string
  title: string | null
  agent: string | null
  model: string | null
  source: "acp" | "cersei" | "external_jsonl" | null
  startedAt: string
  updatedAt: string
  lastActivityAt: string
  wallSeconds: number
  activeSeconds: number
  messageCount: number
  toolCallCount: number
  checkpointCount: number
  branches: Array<string>
  insertions: number
  deletions: number
  filesTouched: number
  /** input + output. */
  totalTokens: number
  inputTokens: number
  outputTokens: number
  cacheCreationTokens: number
  cacheReadTokens: number
  /** Tokens in the model's context at the last turn, and its window. */
  contextUsed: number | null
  contextSize: number | null
  live: boolean
  incomplete: boolean
  /** Mock only: the board's ref and status. */
  ref: string
  status: SessionStatus
}

export type ApiTimelineEntry = {
  id: string
  kind: EntryKind
  /** ISO. */
  at: string
  turnSeq: number
  text?: string
  toolName?: string
  toolTitle?: string
  toolStatus?: ToolStatus
  paths?: Array<string>
  /** JSON, as the agent sent it. */
  arguments?: string
  result?: string
  commitSha?: string
  /** Mock only: the server stores the sha; Atlas reads the subject from git. */
  commitSubject?: string
  branch?: string
  linkState?: "linked" | "orphaned"
  insertions?: number
  deletions?: number
  files?: Array<string>
}

export type ArtifactComment = {
  id: string
  sessionId: string
  anchorKind: CommentAnchorKindApi
  /** The session id when the anchor is the session itself. */
  anchorId: string
  /** Replies are one level deep. */
  parentId: string | null
  authorId: string
  guestName: string | null
  body: string | null
  mentions: Array<string>
  createdAt: string
  editedAt: string | null
  deletedAt: string | null
  resolvedAt: string | null
  resolvedBy: string | null
}

export type SessionDetailApi = {
  summary: SessionSummaryApi
  entries: Array<ApiTimelineEntry>
  comments: Array<ArtifactComment>
}

/* --- Summaries --------------------------------------------------------- */

const AUTHOR_ID = new Map(
  MEMBERS.filter((m) => m.name).map((m) => [m.name, m.id])
)

/** A small stable hash, so each session gets its own but fixed numbers. */
function seed(id: string): number {
  let h = 0
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return h
}

/** Context window per model, in tokens. */
const CONTEXT_WINDOW: Record<string, number> = {
  "claude-opus-5": 1_000_000,
  "claude-sonnet-5": 1_000_000,
  "gpt-5.4-high": 400_000,
  "gemini-3-pro": 1_000_000,
}

function toSummary(s: Session): SessionSummaryApi {
  const h = seed(s.id)
  const active = s.durationMinutes * 60
  const wall = Math.round(active * (1.4 + (h % 7) / 10))
  const lastMin = ageMinutes(s.startedAt)
  const last = minutesBefore(Number.isFinite(lastMin) ? lastMin : 60)
  const started = new Date(Date.parse(last) - wall * 1000).toISOString()
  const input = Math.round(s.tokens * 0.86)
  const checkpoints = s.added + s.removed > 0 ? 1 + (h % 3) : 0
  return {
    id: s.id,
    workspaceId: `ws_${s.project}`,
    workspaceSlug: s.project,
    authorId: AUTHOR_ID.get(s.author) ?? "m1",
    title: s.title,
    agent: s.agent,
    model: s.model,
    source: "acp",
    startedAt: started,
    updatedAt: last,
    lastActivityAt: last,
    wallSeconds: wall,
    activeSeconds: active,
    messageCount: s.tokens ? 4 + (h % 9) : 0,
    toolCallCount: s.tokens ? 6 + (h % 23) : 0,
    checkpointCount: checkpoints,
    branches: [s.branch],
    insertions: s.added,
    deletions: s.removed,
    filesTouched: s.added + s.removed > 0 ? 2 + (h % 9) : 0,
    totalTokens: s.tokens,
    inputTokens: input,
    outputTokens: s.tokens - input,
    cacheCreationTokens: Math.round(s.tokens * 0.22),
    cacheReadTokens: s.tokens * (5 + (h % 4)),
    contextSize: s.tokens ? (CONTEXT_WINDOW[s.model] ?? 200_000) : null,
    // Between 30% and 96% of the window, fixed per session.
    contextUsed: s.tokens
      ? Math.round(
          (CONTEXT_WINDOW[s.model] ?? 200_000) * (0.3 + (h % 67) / 100)
        )
      : null,
    live: s.status === "live",
    incomplete: s.status === "failed",
    ref: s.ref,
    status: s.status,
  }
}

export const SESSION_SUMMARIES: Array<SessionSummaryApi> = SESSIONS.map(
  toSummary
).sort((a, b) => Date.parse(b.lastActivityAt) - Date.parse(a.lastActivityAt))

/* --- Cost -------------------------------------------------------------- */

/** USD per million tokens: input, output, cache read, cache write. */
const PRICE: Record<string, [number, number, number, number]> = {
  "claude-opus-5": [15, 75, 1.5, 18.75],
  "claude-sonnet-5": [3, 15, 0.3, 3.75],
  "gpt-5.4-high": [2.5, 10, 0.25, 0],
  "gemini-3-pro": [2, 12, 0.2, 0],
}

/** An estimate, as Atlas shows it: `null` when the model is not priced. */
export function estCost(s: SessionSummaryApi): number | null {
  const p = s.model ? PRICE[s.model] : undefined
  if (!p) return null
  return (
    (s.inputTokens * p[0] +
      s.outputTokens * p[1] +
      s.cacheReadTokens * p[2] +
      s.cacheCreationTokens * p[3]) /
    1_000_000
  )
}

/* --- Transcripts ------------------------------------------------------- */

type Step = Omit<ApiTimelineEntry, "id" | "at" | "turnSeq"> & {
  /** Seconds after the session started. */
  t: number
  turn: number
  /** A stable handle for comments to anchor on. */
  key?: string
}

const RESPONSE_BOARD = `The board query already grouped rows by project, so the agent facet rides on the same join — no second round trip.

**What changed**

- \`apps/web/src/lib/board.ts\` — \`facetOf()\` now resolves on the server and returns facets **sorted and de-duplicated**, so every client sees one order.
- \`apps/ingest/src/workspace-reads.ts\` — the board read selects \`agent\` alongside \`workspace_id\`, and the facet counts come back in the same page.
- \`board.test.ts\` — two fixtures assumed unsorted facets. They were testing the bug, so they now assert the stable order instead.

**Why server-side**

Resolving facets in the client meant every tab re-derived them from whatever page it had loaded. A long board would show *different* agent counts depending on how far you had scrolled. Now the count is the count.

**Follow-ups**

1. The facet select still renders as a raw \`<select>\`; the design system's \`Select\` is a drop-in.
2. \`agentLabel()\` duplicates the server's label map. It should read the label off the facet.
3. Imported sessions have \`agent: null\`; they currently count under "Unknown". Worth a filter of their own.

All 20 tests pass, and the change is checkpointed on \`feat/board-facets\`.`

const RESPONSE_SHORT = `Done — the retry now resets its backoff after every **successful** chunk rather than only on a fresh socket, so one slow write no longer poisons the rest of the upload.

\`\`\`ts
if (ok) backoff.reset()
\`\`\`

I left the 30s ceiling as it was. The failing test was the one that covered this, so it passes now.`

const BOARD: Array<Step> = [
  {
    t: 0,
    turn: 1,
    kind: "prompt",
    key: "prompt",
    text: "Read the board API and add a facet for agent, so the timeline can filter by it. Keep it to one round trip.",
  },
  {
    t: 4,
    turn: 1,
    kind: "thinking",
    text: "The board query already groups by project; agent can join the same way without a second round trip. Check where facets are resolved first.",
  },
  {
    t: 6,
    turn: 1,
    kind: "tool_call",
    toolName: "Read",
    toolTitle: "apps/web/src/lib/board.ts",
    toolStatus: "completed",
    paths: ["apps/web/src/lib/board.ts"],
    arguments: '{\n  "path": "apps/web/src/lib/board.ts"\n}',
    result:
      "export function facetOf(rows: Array<SessionSummary>, key: FacetKey) {\n  const seen = new Map<string, number>()\n  for (const r of rows) {\n    const v = r[key] ?? 'unknown'\n    seen.set(v, (seen.get(v) ?? 0) + 1)\n  }\n  return [...seen]\n}",
  },
  {
    t: 8,
    turn: 1,
    kind: "tool_call",
    toolName: "Search",
    toolTitle: "facetOf\\(",
    toolStatus: "completed",
    paths: ["apps/web/src"],
    arguments: '{\n  "pattern": "facetOf\\\\(",\n  "path": "apps/web/src"\n}',
    result:
      "apps/web/src/lib/board.ts:212\napps/web/src/routes/timeline.tsx:361\napps/web/src/routes/timeline.tsx:377\napps/web/src/components/artifacts/facets.tsx:18\n… 6 matches across 3 files",
  },
  {
    t: 10,
    turn: 1,
    kind: "tool_call",
    toolName: "Read",
    toolTitle: "apps/ingest/src/workspace-reads.ts",
    toolStatus: "completed",
    paths: ["apps/ingest/src/workspace-reads.ts"],
    arguments:
      '{\n  "path": "apps/ingest/src/workspace-reads.ts",\n  "offset": 220\n}',
    result:
      "const rows = await db\n  .select({ id: sessions.id, workspace: sessions.workspace_id })\n  .from(sessions)\n  .where(eq(sessions.org_id, org))",
  },
  {
    t: 31,
    turn: 1,
    kind: "tool_call",
    key: "edit",
    toolName: "Edit",
    toolTitle: "apps/ingest/src/workspace-reads.ts",
    toolStatus: "completed",
    paths: ["apps/ingest/src/workspace-reads.ts"],
    arguments:
      '{\n  "path": "apps/ingest/src/workspace-reads.ts",\n  "old": "workspace: sessions.workspace_id })",\n  "new": "workspace: sessions.workspace_id, agent: sessions.agent })"\n}',
    result: "Applied 1 edit · +38 −4",
  },
  {
    t: 50,
    turn: 1,
    kind: "tool_call",
    key: "tests",
    toolName: "Bash",
    toolTitle: "bun test board",
    toolStatus: "failed",
    arguments: '{\n  "command": "bun test board"\n}',
    result:
      "board.test.ts:\n✗ facets arrive in insertion order\n✗ unknown agent sorts last\n\n18 pass · 2 fail",
  },
  {
    t: 53,
    turn: 1,
    kind: "thinking",
    text: "Both failures assume facets arrive unsorted. Sorting is now stable, so the fixture is what is wrong, not the code.",
  },
  {
    t: 61,
    turn: 1,
    kind: "tool_call",
    toolName: "Edit",
    toolTitle: "apps/web/src/lib/board.test.ts",
    toolStatus: "completed",
    paths: ["apps/web/src/lib/board.test.ts"],
    arguments:
      '{\n  "path": "apps/web/src/lib/board.test.ts",\n  "old": "expect(facets).toEqual(unsorted)",\n  "new": "expect(facets).toEqual(sorted)"\n}',
    result: "Applied 2 edits · +6 −6",
  },
  {
    t: 70,
    turn: 1,
    kind: "tool_call",
    toolName: "Bash",
    toolTitle: "bun test board",
    toolStatus: "completed",
    arguments: '{\n  "command": "bun test board"\n}',
    result: "board.test.ts:\n20 pass · 0 fail",
  },
  {
    t: 84,
    turn: 1,
    kind: "response",
    key: "response",
    text: RESPONSE_BOARD,
  },
  {
    t: 88,
    turn: 1,
    kind: "checkpoint",
    key: "checkpoint",
    commitSha: "9f3c21ab4e",
    commitSubject: "facets resolve server-side",
    branch: "feat/board-facets",
    linkState: "linked",
    insertions: 44,
    deletions: 10,
    files: [
      "apps/ingest/src/workspace-reads.ts",
      "apps/web/src/lib/board.ts",
      "apps/web/src/lib/board.test.ts",
    ],
  },
  {
    t: 140,
    turn: 2,
    kind: "prompt",
    text: "Now make the retry reset its backoff after a successful chunk — it's poisoning the rest of the upload.",
  },
  {
    t: 146,
    turn: 2,
    kind: "tool_call",
    toolName: "Read",
    toolTitle: "apps/ingest/src/upload.ts",
    toolStatus: "completed",
    paths: ["apps/ingest/src/upload.ts"],
    arguments: '{\n  "path": "apps/ingest/src/upload.ts"\n}',
    result: "const backoff = createBackoff({ base: 250, max: 30_000 })",
  },
  {
    t: 158,
    turn: 2,
    kind: "tool_call",
    toolName: "Edit",
    toolTitle: "apps/ingest/src/upload.ts",
    toolStatus: "completed",
    paths: ["apps/ingest/src/upload.ts"],
    arguments:
      '{\n  "path": "apps/ingest/src/upload.ts",\n  "new": "if (ok) backoff.reset()"\n}',
    result: "Applied 1 edit · +3 −1",
  },
  {
    t: 175,
    turn: 2,
    kind: "response",
    text: RESPONSE_SHORT,
  },
]

/** A session that has not run yet: the prompt, and nothing after it. */
const QUEUED: Array<Step> = [
  {
    t: 0,
    turn: 1,
    kind: "prompt",
    key: "prompt",
    text: "Queued — waiting for the org's spend cap to reset before the agent starts.",
  },
]

/** What happened, in order: turn, then the server's `ENTRY_RANK`. */
function transcriptFor(s: SessionSummaryApi): Array<Step> {
  return s.status === "queued" ? QUEUED : BOARD
}

/* --- Comments ---------------------------------------------------------- */

type CommentSeed = {
  on: string
  author: string
  body: string
  /** Minutes after the entry. */
  after: number
  reply?: { author: string; body: string; after: number }
  resolved?: boolean
}

const COMMENTS: Array<CommentSeed> = [
  {
    on: "response",
    author: "m3",
    body: "Server-side facets is the right call. Can we get the same for model?",
    after: 12,
    reply: {
      author: "m1",
      body: "Yes — same join. I'll add it next.",
      after: 30,
    },
  },
  {
    on: "tests",
    author: "m4",
    body: "These two fixtures were asserting the bug. Good catch.",
    after: 20,
    resolved: true,
  },
  {
    on: "checkpoint",
    author: "m2",
    body: "Shipping this to the pilot tomorrow.",
    after: 45,
  },
  {
    on: "session",
    author: "m5",
    body: "Linking this from the board RFC.",
    after: 90,
  },
]

/* --- Detail ------------------------------------------------------------ */

export function sessionDetail(id: string): SessionDetailApi | null {
  const summary = SESSION_SUMMARIES.find((s) => s.id === id)
  if (!summary) return null
  const t0 = Date.parse(summary.startedAt)
  const steps = transcriptFor(summary)
  // Stretch the script over the session's own active time.
  const span = Math.max(steps[steps.length - 1].t, 1)
  const scale = Math.max(summary.activeSeconds, 60) / span
  const keyToId = new Map<string, string>()

  const entries: Array<ApiTimelineEntry> = steps.map((step, i) => {
    const { t, turn, key, ...rest } = step
    const entryId = `${id}_e${i + 1}`
    if (key) keyToId.set(key, entryId)
    return {
      ...rest,
      id: entryId,
      at: new Date(t0 + Math.round(t * scale) * 1000).toISOString(),
      turnSeq: turn,
      ...(rest.kind === "checkpoint"
        ? { branch: summary.branches[0] ?? rest.branch }
        : {}),
    }
  })

  const byId = new Map(entries.map((e) => [e.id, e]))
  const comments: Array<ArtifactComment> = []
  let n = 0
  for (const c of COMMENTS) {
    const anchorEntry =
      c.on === "session" ? null : byId.get(keyToId.get(c.on) ?? "")
    if (c.on !== "session" && !anchorEntry) continue
    const base = anchorEntry ? Date.parse(anchorEntry.at) : t0
    const anchorKind: CommentAnchorKindApi = !anchorEntry
      ? "session"
      : anchorEntry.kind === "tool_call"
        ? "tool_call"
        : anchorEntry.kind === "checkpoint"
          ? "checkpoint"
          : "message"
    const rootId = `${id}_c${++n}`
    const at = new Date(base + c.after * 60_000).toISOString()
    comments.push({
      id: rootId,
      sessionId: id,
      anchorKind,
      anchorId: anchorEntry ? anchorEntry.id : id,
      parentId: null,
      authorId: c.author,
      guestName: null,
      body: c.body,
      mentions: [],
      createdAt: at,
      editedAt: null,
      deletedAt: null,
      resolvedAt: c.resolved ? at : null,
      resolvedBy: c.resolved ? "m1" : null,
    })
    if (c.reply) {
      comments.push({
        id: `${id}_c${++n}`,
        sessionId: id,
        anchorKind,
        anchorId: anchorEntry ? anchorEntry.id : id,
        parentId: rootId,
        authorId: c.reply.author,
        guestName: null,
        body: c.reply.body,
        mentions: [],
        createdAt: new Date(base + c.reply.after * 60_000).toISOString(),
        editedAt: null,
        deletedAt: null,
        resolvedAt: null,
        resolvedBy: null,
      })
    }
  }

  return { summary, entries, comments }
}
