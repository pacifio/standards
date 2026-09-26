/**
 * The domain, mirrored from `~/Desktop/server/apps/web/src/lib/api.ts`.
 *
 * These are re-declared rather than imported because `standards` does not
 * depend on the server repo — but the field names and the Role union are kept
 * identical on purpose. When a screen here is ported into the real app, the
 * fixture types should line up with the API types with no renaming, and any
 * drift shows up as a type error rather than as a wrong-looking screen.
 */

export type Role = "admin" | "product_owner" | "developer" | "member"

export const ROLE_LABELS: Record<Role, string> = {
  admin: "Admin",
  product_owner: "Product owner",
  developer: "Developer",
  member: "Member",
}

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  admin: "Full access, including billing, members and org settings.",
  product_owner: "Can manage projects and invite people. No billing access.",
  developer: "Can create sessions and comment. No org settings.",
  member: "Read-only across the projects they are added to.",
}

export type Organisation = {
  id: string
  name: string
  slug: string
  /** Two-letter mark shown when there is no logo. */
  initials: string
  memberCount: number
}

export type Member = {
  id: string
  name: string
  email: string
  role: Role
  /** A departed member is never deleted — their sessions still reference them. */
  status: "active" | "invited" | "former"
  lastSeen?: string
}

export type InviteLink = {
  id: string
  role: Exclude<Role, "admin">
  uses: number
  maxUses: number | null
  expiresAt: string | null
}

export type Project = {
  id: string
  name: string
  slug: string
  sessionCount: number
  memberCount: number
  visibility: "org" | "restricted"
  lastSyncedAt: string
  /** Present while a sync run is in flight. */
  syncProgress?: number
}

export type SessionStatus = "live" | "done" | "failed" | "queued"

/** Mirrors the label palette in themes.css. Identity, not status. */
export type LabelTone =
  "grey" | "indigo" | "purple" | "cyan" | "green" | "amber" | "orange" | "red"

export type Label = { name: string; tone: LabelTone }

export type Priority = "none" | "low" | "medium" | "high" | "urgent"

export type Session = {
  id: string
  ref: string
  title: string
  agent: string
  model: string
  branch: string
  project: string
  author: string
  authorInitials: string
  status: SessionStatus
  tokens: number
  added: number
  removed: number
  startedAt: string
  durationMinutes: number
  commentCount: number
  labels: Array<Label>
  priority: Priority
}

export type TimelineEntryKind =
  "prompt" | "thinking" | "tool_call" | "response" | "checkpoint"

export type TimelineEntry = {
  id: string
  kind: TimelineEntryKind
  title: string
  detail?: string
  at: string
  toolStatus?: "ok" | "error" | "running"
}

export type NotificationKind =
  "artifact_mention" | "artifact_reply" | "artifact_session_comment"

export type Notification = {
  id: string
  kind: NotificationKind
  sessionRef: string
  title: string
  actor: string
  actorInitials: string
  preview: string
  at: string
  read: boolean
  project: string
}

export type Conversation = {
  id: string
  name: string
  kind: "channel" | "dm" | "group"
  initials: string
  unread: number
  lastMessage: string
  at: string
}

export type ChatMessage = {
  id: string
  author: string
  authorInitials: string
  body: string
  at: string
  pinned?: boolean
  /** A session or checkpoint pulled into the thread. */
  artifactRef?: { ref: string; title: string }
}
