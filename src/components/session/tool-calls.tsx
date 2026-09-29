"use client"

import { useEffect, useState } from "react"
import {
  BookOpenIcon,
  ChevronRightIcon,
  FileIcon,
  GlobeIcon,
  PencilIcon,
  SearchIcon,
  SquareTerminalIcon,
  Trash2Icon,
  WrenchIcon,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { cn } from "cn"

import type { ApiTimelineEntry } from "@/mock/sessions-api"
import { Icon } from "@/components/ui/icon"
import { CommentButton, useCommentCount, useComments } from "./comments"

/**
 * A run of tool calls — the Atlas desktop app's `Calls`.
 *
 * Folded by default behind "Show tool calls ›": a session is read for its
 * prompts and answers, and forty file reads between them are noise until
 * you want them. Open, the calls are one bordered table; a row expands in
 * place to its paths, arguments and result, one row at a time.
 */

const GLYPH: Record<string, LucideIcon> = {
  Read: BookOpenIcon,
  Edit: PencilIcon,
  Write: FileIcon,
  Bash: SquareTerminalIcon,
  Search: SearchIcon,
  Fetch: GlobeIcon,
  Delete: Trash2Icon,
}

const VERB: Record<string, string> = {
  Read: "Read",
  Edit: "Edited",
  Write: "Created",
  Bash: "Ran",
  Search: "Searched",
  Fetch: "Fetched",
  Delete: "Deleted",
}

/** "2 edited · 3 read" — the fold's one-line summary. */
function summarise(calls: Array<ApiTimelineEntry>): string {
  const n = (name: string) => calls.filter((c) => c.toolName === name).length
  const parts: Array<string> = []
  const edited = n("Edit") + n("Write")
  if (edited) parts.push(`${edited} edited`)
  if (n("Read")) parts.push(`${n("Read")} read`)
  if (n("Bash")) parts.push(`${n("Bash")} ran`)
  if (n("Search")) parts.push(`${n("Search")} searched`)
  return parts.join(" · ")
}

function ToolCalls({
  calls,
  defaultOpen = false,
}: {
  calls: Array<ApiTimelineEntry>
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  const [expanded, setExpanded] = useState<string | null>(null)
  const { focus } = useComments()

  // A jump to a comment on one of these calls unfolds the group and opens
  // that call, so the reader has something to scroll to.
  useEffect(() => {
    if (!focus || !calls.some((c) => c.id === focus.anchorId)) return
    setOpen(true)
    setExpanded(focus.anchorId)
  }, [focus, calls])
  const failed = calls.filter((c) => c.toolStatus === "failed").length

  return (
    <div data-slot="tool-calls">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="duration-fast mt-0.5 flex max-w-full min-w-0 items-center gap-1.5 text-xs whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground"
      >
        {open ? "Hide tool calls" : "Show tool calls"}
        <Icon
          icon={ChevronRightIcon}
          size="xs"
          className={cn(
            "duration-fast transition-transform",
            open && "rotate-90"
          )}
        />
        {!open && (
          <span className="min-w-0 truncate text-2xs text-disabled">
            {summarise(calls)}
            {failed > 0 && (
              <span className="text-error"> · {failed} failed</span>
            )}
          </span>
        )}
      </button>

      {open && (
        <ul className="mt-1.5 divide-y divide-hairline overflow-hidden rounded-md border border-border">
          {calls.map((call) => (
            <CallRow
              key={call.id}
              call={call}
              open={expanded === call.id}
              onToggle={() =>
                setExpanded((cur) => (cur === call.id ? null : call.id))
              }
            />
          ))}
        </ul>
      )}
    </div>
  )
}

function CallRow({
  call,
  open,
  onToggle,
}: {
  call: ApiTimelineEntry
  open: boolean
  onToggle: () => void
}) {
  const failed = call.toolStatus === "failed"
  const name = call.toolName ?? "Tool"
  const comments = useCommentCount(call.id)
  return (
    <li data-entry={call.id} className="rounded-md">
      <div className="duration-fast flex items-center bg-card transition-colors hover:bg-element-hover">
        <button
          type="button"
          aria-expanded={open}
          onClick={onToggle}
          className="group/call flex h-8 min-w-0 flex-1 items-center gap-2 px-3 text-left"
        >
          <Icon
            icon={GLYPH[name] ?? WrenchIcon}
            size="sm"
            className={failed ? "text-error" : "text-muted-foreground"}
          />
          <span
            className={cn(
              "min-w-0 flex-1 truncate text-xs",
              failed ? "text-error" : "text-secondary-foreground"
            )}
          >
            {VERB[name] ?? name}{" "}
            <span
              className={cn(
                "mono text-2xs",
                failed ? "text-error/80" : "text-disabled"
              )}
            >
              {call.toolTitle}
            </span>
          </span>
          <Icon
            icon={ChevronRightIcon}
            size="xs"
            className={cn(
              "duration-fast text-disabled transition-transform",
              open && "rotate-90"
            )}
          />
        </button>
        {/* Beside the toggle, not in it: a button cannot hold a button. */}
        {comments > 0 && (
          <CommentButton
            anchorKind="tool_call"
            anchorId={call.id}
            className="mr-2 shrink-0"
          />
        )}
      </div>
      {open && (
        <div className="flex flex-col gap-2.5 border-t border-hairline bg-background px-3 py-3">
          {call.paths && call.paths.length > 0 && (
            <p className="mono text-2xs break-all text-muted-foreground">
              {call.paths.join("  ·  ")}
            </p>
          )}
          {call.arguments && (
            <Payload label="Arguments" text={call.arguments} />
          )}
          {call.result && (
            <Payload label="Result" text={call.result} error={failed} />
          )}
        </div>
      )}
    </li>
  )
}

/** A payload with a line-number gutter — plain mono, no highlighter. */
function Payload({
  label,
  text,
  error,
}: {
  label: string
  text: string
  error?: boolean
}) {
  const lines = text.split("\n")
  return (
    <figure className="overflow-hidden rounded-lg border border-hairline bg-card">
      <figcaption className="flex items-center border-b border-hairline px-3 py-1.5 text-2xs text-muted-foreground">
        {label}
      </figcaption>
      <pre className="max-h-80 overflow-auto py-1 text-2xs leading-relaxed">
        {lines.map((line, i) => (
          <div key={i} className="flex">
            <span
              aria-hidden="true"
              className="w-10 shrink-0 pr-3 text-right mono text-disabled select-none"
            >
              {i + 1}
            </span>
            <code
              className={cn(
                "pr-3 mono whitespace-pre",
                error ? "text-error" : "text-foreground"
              )}
            >
              {line || " "}
            </code>
          </div>
        ))}
      </pre>
    </figure>
  )
}

export { ToolCalls }
