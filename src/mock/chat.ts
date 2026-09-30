/**
 * Chat fixtures, shaped like the Atlas comms contracts: conversations
 * (channels, group DMs, DMs), messages with reactions and attachments,
 * read state, prompt drafts, and the files a conversation has collected.
 *
 * Times are ISO strings on the pinned mock clock (`MOCK_NOW`), so the list's
 * "2h" and the transcript's day dividers agree with the rest of the mock.
 * Authors are member ids from `data.ts`; the reader resolves them.
 */

export type ConversationKind = "channel" | "group" | "dm"

export type ChatConversation = {
  id: string
  kind: ConversationKind
  /** Channel slug, or the display name of a DM / group DM. */
  name: string
  /** Channels only. */
  topic?: string
  private?: boolean
  memberIds: Array<string>
  unread: number
  mentions: number
  /** ISO time of the last message, for ordering. */
  lastActivityAt: string
}

export type ChatReaction = { emoji: string; userIds: Array<string> }

export type ChatAttachment =
  | { kind: "file"; name: string; bytes: number }
  | {
      kind: "image"
      name: string
      bytes: number
      width: number
      height: number
    }

export type ChatMessage = {
  id: string
  convId: string
  authorId: string
  body: string
  createdAt: string
  editedAt?: string
  pinned?: boolean
  replyToId?: string
  reactions?: Array<ChatReaction>
  attachments?: Array<ChatAttachment>
  /** A session pulled into the thread. */
  sessionRef?: { ref: string; title: string }
}

export type PromptDraft = {
  id: string
  convId: string
  title: string
  createdBy: string
  createdAt: string
  updatedAt: string
  body: string
}

export type ChatFile = {
  id: string
  convId: string
  name: string
  bytes: number
  kind: "image" | "audio" | "file"
  authorId: string
  createdAt: string
}

/** You. */
export const SELF_ID = "m1"

/** Who is online right now — the list's green dots and the Active row. */
export const ONLINE = new Set(["m1", "m2", "m3", "m5"])

export const CHANNELS: Array<ChatConversation> = [
  {
    id: "ch-engineering",
    kind: "channel",
    name: "engineering",
    topic: "Timeline, ingest and the board API",
    memberIds: ["m1", "m2", "m3", "m4", "m5"],
    unread: 3,
    mentions: 1,
    lastActivityAt: "2026-09-29T17:33:00+06:00",
  },
  {
    id: "ch-design",
    kind: "channel",
    name: "design-review",
    topic: "Crits for the web app and the standards",
    memberIds: ["m1", "m2", "m4"],
    unread: 1,
    mentions: 0,
    lastActivityAt: "2026-09-29T16:40:00+06:00",
  },
  {
    id: "ch-general",
    kind: "channel",
    name: "general",
    topic: "Company-wide",
    memberIds: ["m1", "m2", "m3", "m4", "m5", "m6"],
    unread: 0,
    mentions: 0,
    lastActivityAt: "2026-09-29T12:05:00+06:00",
  },
  {
    id: "ch-security",
    kind: "channel",
    name: "security-review",
    topic: "Private — auth, keys and access",
    private: true,
    memberIds: ["m1", "m3"],
    unread: 0,
    mentions: 0,
    lastActivityAt: "2026-09-28T19:10:00+06:00",
  },
  {
    id: "ch-releases",
    kind: "channel",
    name: "releases",
    topic: "Desktop and web release notes",
    memberIds: ["m1", "m2", "m3", "m4", "m5", "m6"],
    unread: 0,
    mentions: 0,
    lastActivityAt: "2026-09-27T11:00:00+06:00",
  },
  {
    id: "ch-random",
    kind: "channel",
    name: "random",
    memberIds: ["m1", "m2", "m3", "m4", "m5"],
    unread: 0,
    mentions: 0,
    lastActivityAt: "2026-09-26T21:30:00+06:00",
  },
]

export const DIRECT: Array<ChatConversation> = [
  {
    id: "g-ship",
    kind: "group",
    name: "Talha, Azraf",
    memberIds: ["m1", "m2", "m4"],
    unread: 2,
    mentions: 0,
    lastActivityAt: "2026-09-29T15:20:00+06:00",
  },
  {
    id: "g-ingest",
    kind: "group",
    name: "Uzayer, Azraf, Nafiz",
    memberIds: ["m1", "m3", "m4", "m5"],
    unread: 0,
    mentions: 0,
    lastActivityAt: "2026-09-28T13:00:00+06:00",
  },
  {
    id: "dm-m3",
    kind: "dm",
    name: "Uzayer Masud",
    memberIds: ["m1", "m3"],
    unread: 1,
    mentions: 1,
    lastActivityAt: "2026-09-29T15:45:00+06:00",
  },
  {
    id: "dm-m2",
    kind: "dm",
    name: "Talha Razz",
    memberIds: ["m1", "m2"],
    unread: 0,
    mentions: 0,
    lastActivityAt: "2026-09-29T10:12:00+06:00",
  },
]

/** Org members you have not messaged yet: one click opens a DM. */
export const CONTACT_IDS = ["m4", "m5", "m6"]

/** Public channels you have not joined. */
export const DISCOVERABLE: Array<ChatConversation> = [
  {
    id: "ch-hiring",
    kind: "channel",
    name: "hiring",
    topic: "Roles, loops and debriefs",
    memberIds: ["m2", "m6"],
    unread: 0,
    mentions: 0,
    lastActivityAt: "2026-09-25T10:00:00+06:00",
  },
  {
    id: "ch-critique",
    kind: "channel",
    name: "design-critique",
    topic: "Open crits, anyone welcome",
    memberIds: ["m2", "m4"],
    unread: 0,
    mentions: 0,
    lastActivityAt: "2026-09-24T16:00:00+06:00",
  },
  {
    id: "ch-feedback",
    kind: "channel",
    name: "customer-feedback",
    memberIds: ["m2", "m5"],
    unread: 0,
    mentions: 0,
    lastActivityAt: "2026-09-23T09:00:00+06:00",
  },
]

export const CONVERSATIONS = [...CHANNELS, ...DIRECT]

/** The sidebar's quick chats: every conversation, most recent first. */
export const RECENT_CHATS = [...CONVERSATIONS].sort(
  (a, b) => Date.parse(b.lastActivityAt) - Date.parse(a.lastActivityAt)
)

export const MESSAGES: Array<ChatMessage> = [
  // #engineering — yesterday
  {
    id: "e1",
    convId: "ch-engineering",
    authorId: "m2",
    body: "Pilot is booked for Thursday. Anything on the board API that could still move before then?",
    createdAt: "2026-09-28T16:02:00+06:00",
  },
  {
    id: "e2",
    convId: "ch-engineering",
    authorId: "m3",
    body: "Only the facet sort. I'd like it deterministic so the client stops re-sorting defensively.",
    createdAt: "2026-09-28T16:05:00+06:00",
  },
  {
    id: "e3",
    convId: "ch-engineering",
    authorId: "m3",
    body: "Draft is in the side panel — *Board facets sort order*.",
    createdAt: "2026-09-28T16:06:00+06:00",
  },
  // #engineering — today
  {
    id: "e4",
    convId: "ch-engineering",
    authorId: "m3",
    body: "The board query groups by project already, so I added the agent facet on the **same join** rather than a second round trip.",
    createdAt: "2026-09-29T13:58:00+06:00",
    pinned: true,
    sessionRef: {
      ref: "ATL-57",
      title: "API for Timeline board filters and facets",
    },
    reactions: [
      { emoji: "🚀", userIds: ["m1", "m2"] },
      { emoji: "👀", userIds: ["m4"] },
    ],
  },
  {
    id: "e5",
    convId: "ch-engineering",
    authorId: "m2",
    body: "Does that change the response shape for anyone on the old client?",
    createdAt: "2026-09-29T14:01:00+06:00",
  },
  {
    id: "e6",
    convId: "ch-engineering",
    authorId: "m3",
    body: "No — `facets` was already an array, it is just sorted and deduplicated now:\n\n```ts\nfacets.sort((a, b) => b.count - a.count || a.key.localeCompare(b.key))\n```",
    createdAt: "2026-09-29T14:03:00+06:00",
    replyToId: "e5",
    reactions: [{ emoji: "✅", userIds: ["m2"] }],
  },
  {
    id: "e7",
    convId: "ch-engineering",
    authorId: "m1",
    body: "Good. Let's get the sort into the spec so the next client does not re-sort it defensively.",
    createdAt: "2026-09-29T14:09:00+06:00",
  },
  {
    id: "e8",
    convId: "ch-engineering",
    authorId: "m4",
    body: "I'll add it to the checkpoint spec section this afternoon. Trace from the failing run attached.",
    createdAt: "2026-09-29T14:11:00+06:00",
    attachments: [
      { kind: "file", name: "board-facets-trace.json", bytes: 48_213 },
    ],
  },
  {
    id: "e9",
    convId: "ch-engineering",
    authorId: "m5",
    body: "Heads up @Adib — the ingest worker is at 92% context on the long CareExpand session. Might want to split it.",
    createdAt: "2026-09-29T17:33:00+06:00",
  },

  // #design-review
  {
    id: "d1",
    convId: "ch-design",
    authorId: "m4",
    body: "Pushed the share panel morph. The sheet fans out on hover now.",
    createdAt: "2026-09-29T16:31:00+06:00",
    attachments: [
      {
        kind: "image",
        name: "share-panel.png",
        bytes: 312_004,
        width: 1600,
        height: 1000,
      },
    ],
  },
  {
    id: "d2",
    convId: "ch-design",
    authorId: "m2",
    body: "Love it. Can the orbit dashes come up a touch? They disappear on the light theme.",
    createdAt: "2026-09-29T16:40:00+06:00",
    reactions: [{ emoji: "👍", userIds: ["m1", "m4"] }],
  },

  // #general
  {
    id: "gn1",
    convId: "ch-general",
    authorId: "m2",
    body: "Reminder: all-hands at 4. Agenda is pinned in #releases.",
    createdAt: "2026-09-29T12:05:00+06:00",
  },

  // #security-review
  {
    id: "s1",
    convId: "ch-security",
    authorId: "m3",
    body: "Rotated the ingest signing key. Old one stays valid for 24h.",
    createdAt: "2026-09-28T19:10:00+06:00",
  },

  // #releases
  {
    id: "r1",
    convId: "ch-releases",
    authorId: "m6",
    body: "**Atlas 0.4.2** is out — session capture control, faster timeline, and the new share panel.",
    createdAt: "2026-09-27T11:00:00+06:00",
    reactions: [{ emoji: "🎉", userIds: ["m1", "m2", "m3", "m4"] }],
  },

  // #random
  {
    id: "rd1",
    convId: "ch-random",
    authorId: "m5",
    body: "Who took the last cold brew",
    createdAt: "2026-09-26T21:30:00+06:00",
    reactions: [{ emoji: "😂", userIds: ["m2", "m3"] }],
  },

  // Talha, Azraf
  {
    id: "g1",
    convId: "g-ship",
    authorId: "m2",
    body: "Shipping the settings shell tomorrow — can one of you sanity-check the org switcher?",
    createdAt: "2026-09-29T15:12:00+06:00",
  },
  {
    id: "g2",
    convId: "g-ship",
    authorId: "m4",
    body: "On it after lunch.",
    createdAt: "2026-09-29T15:20:00+06:00",
  },

  // Uzayer, Azraf, Nafiz
  {
    id: "gi1",
    convId: "g-ingest",
    authorId: "m5",
    body: "Backfill finished. 14k sessions, zero drops.",
    createdAt: "2026-09-28T13:00:00+06:00",
    reactions: [{ emoji: "🔥", userIds: ["m1", "m3"] }],
  },

  // Uzayer
  {
    id: "u1",
    convId: "dm-m3",
    authorId: "m3",
    body: "Can you look at ATL-273 before standup?",
    createdAt: "2026-09-29T15:44:00+06:00",
  },
  {
    id: "u2",
    convId: "dm-m3",
    authorId: "m3",
    body: "The capture is stuck on the last checkpoint.",
    createdAt: "2026-09-29T15:45:00+06:00",
  },

  // Talha
  {
    id: "t1",
    convId: "dm-m2",
    authorId: "m1",
    body: "Sent you the pilot deck.",
    createdAt: "2026-09-29T10:10:00+06:00",
  },
  {
    id: "t2",
    convId: "dm-m2",
    authorId: "m2",
    body: "Thanks — reading now.",
    createdAt: "2026-09-29T10:12:00+06:00",
  },
]

export const DRAFTS: Array<PromptDraft> = [
  {
    id: "dr1",
    convId: "ch-engineering",
    title: "Board facets sort order",
    createdBy: "m3",
    createdAt: "2026-09-27T12:00:00+06:00",
    updatedAt: "2026-09-29T14:20:00+06:00",
    body: "# Board facets sort order\n\nSort facets server-side so every client renders the same order.\n\n## Rule\n\n1. By count, descending.\n2. Ties broken by key, ascending.\n\n## Why\n\nThe web client and the desktop app disagreed on ties, so the board\njumped between refreshes.\n",
  },
  {
    id: "dr2",
    convId: "ch-engineering",
    title: "Atlas Session Capture edge case",
    createdBy: "m5",
    createdAt: "2026-09-26T10:00:00+06:00",
    updatedAt: "2026-09-27T09:30:00+06:00",
    body: "# Session capture edge case\n\nWhen the agent exits mid-checkpoint, the capture never closes.\n\n- Detect the orphaned checkpoint on the next launch\n- Close it with the last known diff\n",
  },
  {
    id: "dr3",
    convId: "ch-engineering",
    title: "Atlas agent org API doc",
    createdBy: "m1",
    createdAt: "2026-09-25T10:00:00+06:00",
    updatedAt: "2026-09-26T18:00:00+06:00",
    body: "# Org API\n\nEndpoints the agent uses to read org context.\n",
  },
  {
    id: "dr4",
    convId: "ch-design",
    title: "Share panel copy",
    createdBy: "m4",
    createdAt: "2026-09-29T11:00:00+06:00",
    updatedAt: "2026-09-29T16:00:00+06:00",
    body: "# Share panel\n\nWho can open it · Share to · Copy link\n",
  },
]

export const FILES: Array<ChatFile> = [
  {
    id: "f1",
    convId: "ch-engineering",
    name: "board-facets-trace.json",
    bytes: 48_213,
    kind: "file",
    authorId: "m4",
    createdAt: "2026-09-29T14:11:00+06:00",
  },
  {
    id: "f2",
    convId: "ch-engineering",
    name: "ingest-latency.png",
    bytes: 204_551,
    kind: "image",
    authorId: "m3",
    createdAt: "2026-09-28T11:00:00+06:00",
  },
  {
    id: "f3",
    convId: "ch-engineering",
    name: "standup-2026-09-28.m4a",
    bytes: 3_120_000,
    kind: "audio",
    authorId: "m2",
    createdAt: "2026-09-28T09:30:00+06:00",
  },
  {
    id: "f4",
    convId: "ch-engineering",
    name: "board-api-spec.pdf",
    bytes: 1_240_000,
    kind: "file",
    authorId: "m1",
    createdAt: "2026-09-26T15:00:00+06:00",
  },
  {
    id: "f5",
    convId: "ch-design",
    name: "share-panel.png",
    bytes: 312_004,
    kind: "image",
    authorId: "m4",
    createdAt: "2026-09-29T16:31:00+06:00",
  },
]

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / 1024 / 1024).toFixed(1)} MB`
}

/** The emoji a reaction can be — the app keeps an allowlist, so do we. */
export const REACTIONS = [
  "👍",
  "❤️",
  "😂",
  "🎉",
  "🚀",
  "👀",
  "✅",
  "🔥",
  "🙏",
  "💯",
  "🤔",
  "😅",
  "👏",
  "🙌",
]
