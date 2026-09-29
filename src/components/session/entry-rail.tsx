"use client"

import Markdown from "react-markdown"
import remarkGfm from "remark-gfm"
import {
  BrainIcon,
  CheckIcon,
  GitCommitHorizontalIcon,
  SparklesIcon,
  UserIcon,
} from "lucide-react"
import { cn } from "cn"

import type {
  ApiTimelineEntry,
  CommentAnchorKindApi,
} from "@/mock/sessions-api"
import { clock } from "@/mock/time"
import { DiffStat } from "@/components/ui/code-block"
import { Icon } from "@/components/ui/icon"
import { Clamp } from "./clamp"
import { ActivityLog, CommentButton } from "./comments"
import { ToolCalls } from "./tool-calls"

/**
 * The session's entries on a vertical rail — the Atlas desktop app's
 * `Timeline`.
 *
 * Consecutive tool calls fold into one group. Every other entry is its own
 * row: a 32px rail column with a node, then the content — a header line
 * (label · time · a hover action), the body, and activity lines for its
 * comments. The rail runs from the first node's centre to the last's.
 *
 * Nodes say what kind of thing happened before the label does: a person
 * for a prompt, the agent for a response, a small brain for thinking, a
 * bare dot for tool calls (red when one failed), a green check for a
 * checkpoint.
 */

export type EntryGroup =
  | { kind: "entry"; entry: ApiTimelineEntry }
  | { kind: "calls"; id: string; calls: Array<ApiTimelineEntry> }

function groupEntries(entries: Array<ApiTimelineEntry>): Array<EntryGroup> {
  const out: Array<EntryGroup> = []
  for (const e of entries) {
    const last = out.at(-1)
    if (e.kind === "tool_call" && last?.kind === "calls") last.calls.push(e)
    else if (e.kind === "tool_call")
      out.push({ kind: "calls", id: e.id, calls: [e] })
    else out.push({ kind: "entry", entry: e })
  }
  return out
}

const LABEL: Record<ApiTimelineEntry["kind"], string> = {
  prompt: "Prompt",
  response: "Response",
  thinking: "Thinking",
  tool_call: "Tool calls",
  checkpoint: "Checkpoint",
}

function anchorKindFor(e: ApiTimelineEntry): CommentAnchorKindApi {
  if (e.kind === "tool_call") return "tool_call"
  if (e.kind === "checkpoint") return "checkpoint"
  return "message"
}

function EntryRail({
  groups,
  expandCalls,
}: {
  groups: Array<EntryGroup>
  expandCalls?: boolean
}) {
  return (
    <ol data-slot="entry-rail" className="flex flex-col">
      {groups.map((g, i) => (
        <Row
          key={g.kind === "calls" ? g.id : g.entry.id}
          group={g}
          first={i === 0}
          last={i === groups.length - 1}
          expandCalls={expandCalls}
        />
      ))}
    </ol>
  )
}

function Row({
  group,
  first,
  last,
  expandCalls,
}: {
  group: EntryGroup
  first: boolean
  last: boolean
  expandCalls?: boolean
}) {
  const head = group.kind === "calls" ? group.calls[0] : group.entry
  const kind = head.kind
  const failed =
    group.kind === "calls" && group.calls.some((c) => c.toolStatus === "failed")
  const label =
    group.kind === "calls" && group.calls.length === 1
      ? (head.toolName ?? LABEL.tool_call)
      : LABEL[kind]

  return (
    <li
      data-entry={head.id}
      className="group/row relative grid grid-cols-[2rem_minmax(0,1fr)] gap-3.5"
    >
      {/* The rail: centre of the first node to centre of the last. */}
      <span
        aria-hidden="true"
        className={cn(
          "absolute left-4 w-px -translate-x-1/2 bg-hairline",
          first ? "top-4" : "top-0",
          last ? "h-4" : "bottom-0"
        )}
      />
      <div className="relative flex justify-center">
        <Node kind={kind} failed={failed} />
      </div>

      <div className="min-w-0 pb-7">
        <div className="flex min-h-8 items-center gap-2">
          <span
            className={cn(
              "text-sm font-medium",
              kind === "prompt"
                ? "text-foreground"
                : kind === "checkpoint"
                  ? "text-success"
                  : "text-secondary-foreground"
            )}
          >
            {label}
          </span>
          <span aria-hidden="true" className="text-disabled">
            ·
          </span>
          <time
            dateTime={head.at}
            className="mono text-2xs text-muted-foreground"
          >
            {clock(head.at)}
          </time>
          {group.kind === "calls" && group.calls.length > 1 && (
            <span className="mono text-2xs text-disabled">
              {group.calls.length} calls
            </span>
          )}
          <span className="flex-1" />
          {group.kind === "entry" && (
            <CommentButton
              anchorKind={anchorKindFor(head)}
              anchorId={head.id}
            />
          )}
        </div>

        {group.kind === "calls" ? (
          <ToolCalls calls={group.calls} defaultOpen={expandCalls} />
        ) : (
          <Body entry={group.entry} />
        )}

        {group.kind === "entry" && <ActivityLog anchorId={head.id} />}
      </div>
    </li>
  )
}

function Node({
  kind,
  failed,
}: {
  kind: ApiTimelineEntry["kind"]
  failed: boolean
}) {
  if (kind === "tool_call") {
    return (
      <span
        className={cn(
          "mt-3 size-2 rounded-full",
          failed ? "bg-error" : "bg-border-strong"
        )}
      />
    )
  }
  if (kind === "thinking") {
    return (
      <span className="mt-1.5 flex size-5 items-center justify-center rounded-full border border-border bg-card text-muted-foreground">
        <Icon icon={BrainIcon} size="xs" className="size-2.5" />
      </span>
    )
  }
  if (kind === "checkpoint") {
    return (
      <span className="flex size-8 items-center justify-center rounded-full border border-success/35 bg-success-muted text-success">
        <Icon icon={CheckIcon} size="sm" />
      </span>
    )
  }
  return (
    <span className="flex size-8 items-center justify-center rounded-full border border-border-strong/50 bg-card text-secondary-foreground">
      <Icon icon={kind === "prompt" ? UserIcon : SparklesIcon} size="sm" />
    </span>
  )
}

function Body({ entry }: { entry: ApiTimelineEntry }) {
  if (entry.kind === "prompt") {
    return (
      <Clamp>
        <p className="mt-2.5 rounded-md border border-hairline bg-card px-3.5 py-3 mono text-xs leading-relaxed break-words whitespace-pre-wrap text-secondary-foreground">
          {entry.text}
        </p>
      </Clamp>
    )
  }
  if (entry.kind === "checkpoint") return <Checkpoint entry={entry} />
  if (entry.kind === "thinking") {
    return (
      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground italic">
        {entry.text}
      </p>
    )
  }
  return (
    <Clamp>
      <div className="prose-session mt-1.5">
        <Markdown remarkPlugins={[remarkGfm]}>{entry.text ?? ""}</Markdown>
      </div>
    </Clamp>
  )
}

function Checkpoint({ entry }: { entry: ApiTimelineEntry }) {
  const files = entry.files ?? []
  return (
    <div className="mt-2.5 overflow-hidden rounded-md border border-border bg-card">
      <div className="flex items-center gap-2 border-b border-hairline px-3 py-2">
        <Icon
          icon={GitCommitHorizontalIcon}
          size="sm"
          className="text-muted-foreground"
        />
        <span className="mono text-2xs text-muted-foreground">
          {entry.commitSha?.slice(0, 7)}
        </span>
        <span className="min-w-0 flex-1 truncate text-xs text-foreground">
          {entry.commitSubject}
        </span>
        <DiffStat
          added={entry.insertions ?? 0}
          removed={entry.deletions ?? 0}
        />
      </div>
      <ul className="px-3 py-2">
        {files.slice(0, 12).map((f) => (
          <li
            key={f}
            className="truncate mono text-2xs leading-loose text-secondary-foreground"
          >
            {f}
          </li>
        ))}
        {files.length > 12 && (
          <li className="text-2xs text-disabled">+{files.length - 12} more</li>
        )}
        {entry.branch && (
          <li className="mt-1 text-2xs text-disabled">
            on <span className="mono">{entry.branch}</span>
          </li>
        )}
      </ul>
    </div>
  )
}

export { EntryRail, groupEntries }
