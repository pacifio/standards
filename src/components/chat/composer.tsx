"use client"

import { useRef, useState } from "react"
import {
  ArrowUpIcon,
  AtSignIcon,
  BoldIcon,
  CodeIcon,
  CornerUpRightIcon,
  FileIcon,
  ItalicIcon,
  Link2Icon,
  ListIcon,
  ListOrderedIcon,
  PlusIcon,
  QuoteIcon,
  SmileIcon,
  StrikethroughIcon,
  XIcon,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { cn } from "cn"

import { MEMBERS } from "@/mock/data"
import { REACTIONS, SELF_ID, formatBytes } from "@/mock/chat"
import type { ChatAttachment } from "@/mock/chat"
import { Icon } from "@/components/ui/icon"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ChatAvatar, firstName } from "./chat-avatar"

/**
 * The message composer — the Atlas desktop app's, on this system's tokens.
 *
 * A card with a recessed well inside it: the well holds what you are
 * writing and the send arrow; the strip beneath holds everything you might
 * do to it — attach, emoji, mention on the left, Markdown formatting on the
 * right. Formatting inserts the Markdown around the selection rather than
 * styling in place, so what you send is exactly what you see.
 *
 * Enter sends, Shift+Enter breaks the line, ⌘B / ⌘I / ⌘K format, Esc drops a
 * reply. Send stays quiet until there is something to send.
 */

export type ReplyTarget = { id: string; author: string; body: string }

type Wrap = {
  icon: LucideIcon
  label: string
  keys?: string
  apply: (sel: string) => { text: string; caret: [number, number] }
}

/** Wraps the selection; with no selection, places the caret between marks. */
const wrap =
  (open: string, close = open) =>
  (sel: string) => ({
    text: `${open}${sel}${close}`,
    caret: [open.length, open.length + sel.length] as [number, number],
  })

/** Prefixes every selected line (or the empty line) with a marker. */
const prefix = (mark: (i: number) => string) => (sel: string) => {
  const lines = (sel || "").split("\n")
  const text = lines.map((l, i) => `${mark(i)}${l}`).join("\n")
  return { text, caret: [text.length, text.length] as [number, number] }
}

const INLINE: Array<Wrap> = [
  { icon: BoldIcon, label: "Bold", keys: "⌘B", apply: wrap("**") },
  { icon: ItalicIcon, label: "Italic", keys: "⌘I", apply: wrap("*") },
  { icon: StrikethroughIcon, label: "Strikethrough", apply: wrap("~~") },
  { icon: CodeIcon, label: "Code", apply: wrap("`") },
  {
    icon: Link2Icon,
    label: "Link",
    keys: "⌘K",
    apply: (sel) => {
      const text = `[${sel}](https://)`
      const at = sel.length + 3
      return { text, caret: [at, at + 8] }
    },
  },
]

const BLOCK: Array<Wrap> = [
  { icon: ListIcon, label: "Bulleted list", apply: prefix(() => "- ") },
  {
    icon: ListOrderedIcon,
    label: "Numbered list",
    apply: prefix((i) => `${i + 1}. `),
  },
  { icon: QuoteIcon, label: "Quote", apply: prefix(() => "> ") },
]

function Composer({
  placeholder,
  replyTo,
  onCancelReply,
  onSend,
}: {
  placeholder: string
  replyTo: ReplyTarget | null
  onCancelReply: () => void
  onSend: (body: string, attachments: Array<ChatAttachment>) => void
}) {
  const [text, setText] = useState("")
  const [files, setFiles] = useState<Array<ChatAttachment>>([])
  const [mentionOpen, setMentionOpen] = useState(false)
  const area = useRef<HTMLTextAreaElement>(null)
  const picker = useRef<HTMLInputElement>(null)

  const canSend = text.trim().length > 0 || files.length > 0

  /** Replace the selection with `apply(selection)` and restore the caret. */
  function edit(apply: Wrap["apply"]) {
    const el = area.current
    if (!el) return
    const [a, b] = [el.selectionStart, el.selectionEnd]
    const out = apply(text.slice(a, b))
    setText(text.slice(0, a) + out.text + text.slice(b))
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(a + out.caret[0], a + out.caret[1])
    })
  }

  function insert(s: string) {
    edit(() => ({ text: s, caret: [s.length, s.length] }))
  }

  function send() {
    if (!canSend) return
    onSend(text.trim(), files)
    setText("")
    setFiles([])
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      send()
      return
    }
    if (e.key === "Escape" && replyTo) onCancelReply()
    if (e.metaKey || e.ctrlKey) {
      const k = e.key.toLowerCase()
      const hit =
        k === "b"
          ? INLINE[0]
          : k === "i"
            ? INLINE[1]
            : k === "k"
              ? INLINE[4]
              : null
      if (hit) {
        e.preventDefault()
        edit(hit.apply)
      }
    }
    if (e.key === "@") setMentionOpen(true)
  }

  return (
    <div className="shrink-0 px-4 pb-2">
      {/* A reply tucks in behind the top of the card, like a tab. */}
      {replyTo && (
        <div className="mx-2 -mb-4 flex items-center gap-2 rounded-t-2xl bg-popover px-3 pt-2 pb-5 text-2xs text-muted-foreground ring-1 ring-border">
          <Icon icon={CornerUpRightIcon} size="xs" />
          <span className="shrink-0">
            Replying to{" "}
            <span className="font-medium text-foreground">
              {replyTo.author}
            </span>
          </span>
          <span className="min-w-0 flex-1 truncate">{replyTo.body}</span>
          <button
            type="button"
            aria-label="Cancel reply"
            onClick={onCancelReply}
            className="cursor-pointer rounded-sm hover:text-foreground"
          >
            <Icon icon={XIcon} size="xs" />
          </button>
        </div>
      )}

      <div className="relative rounded-2xl border border-border bg-card shadow-md">
        {files.length > 0 && (
          <ul className="flex flex-wrap gap-1.5 px-2.5 pt-2">
            {files.map((f, i) => (
              <li
                key={`${f.name}-${i}`}
                className="flex h-7 items-center gap-1.5 rounded-lg border border-border bg-background pr-1 pl-2 text-2xs"
              >
                <Icon
                  icon={FileIcon}
                  size="xs"
                  className="text-muted-foreground"
                />
                <span className="max-w-40 truncate">{f.name}</span>
                <span className="text-disabled tnum">
                  {formatBytes(f.bytes)}
                </span>
                <button
                  type="button"
                  aria-label={`Remove ${f.name}`}
                  onClick={() =>
                    setFiles((all) => all.filter((_, j) => j !== i))
                  }
                  className="flex size-5 cursor-pointer items-center justify-center rounded-md text-muted-foreground hover:bg-element-hover hover:text-foreground"
                >
                  <Icon icon={XIcon} size="xs" />
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="relative m-1 rounded-xl border border-border bg-background focus-within:border-border-strong">
          <textarea
            ref={area}
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            aria-label={placeholder}
            className="block field-sizing-content max-h-40 min-h-9 w-full resize-none bg-transparent py-2 pr-10 pl-3 text-xs leading-5 outline-none placeholder:text-disabled"
          />
          <button
            type="button"
            aria-label="Send"
            disabled={!canSend}
            onClick={send}
            className={cn(
              "duration-fast absolute top-1 right-1 flex size-7 items-center justify-center rounded-lg transition-colors",
              canSend
                ? "cursor-pointer bg-foreground text-background hover:opacity-85"
                : "cursor-not-allowed text-disabled"
            )}
          >
            <Icon icon={ArrowUpIcon} size="sm" />
          </button>
        </div>

        <div className="flex items-center justify-between px-1.5 pt-0.5 pb-1.5">
          <div className="flex items-center gap-0.5">
            <Tool label="Attach files">
              <button
                type="button"
                aria-label="Attach files"
                onClick={() => picker.current?.click()}
                className="duration-fast mr-0.5 flex size-5.5 cursor-pointer items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
              >
                <Icon icon={PlusIcon} size="xs" />
              </button>
            </Tool>
            <input
              ref={picker}
              type="file"
              multiple
              hidden
              onChange={(e) => {
                const picked = [...(e.target.files ?? [])].map(
                  (f): ChatAttachment => ({
                    kind: "file",
                    name: f.name,
                    bytes: f.size,
                  })
                )
                setFiles((all) => [...all, ...picked].slice(0, 10))
                e.target.value = ""
              }}
            />
            <Divider />
            <Popover>
              <Tool label="Emoji">
                <PopoverTrigger aria-label="Emoji" className={FORMAT_BUTTON}>
                  <Icon icon={SmileIcon} size="sm" />
                </PopoverTrigger>
              </Tool>
              <PopoverContent side="top" align="start" className="w-auto p-1.5">
                <div className="grid grid-cols-7 gap-0.5">
                  {REACTIONS.map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => insert(e)}
                      className="flex size-8 cursor-pointer items-center justify-center rounded-md text-md hover:bg-element-hover"
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            <Popover open={mentionOpen} onOpenChange={setMentionOpen}>
              <Tool label="Mention someone">
                <PopoverTrigger
                  aria-label="Mention someone"
                  className={FORMAT_BUTTON}
                >
                  <Icon icon={AtSignIcon} size="sm" />
                </PopoverTrigger>
              </Tool>
              <PopoverContent
                side="top"
                align="start"
                className="w-56 gap-0 p-1"
                initialFocus={false}
                finalFocus={area}
              >
                {MEMBERS.filter(
                  (m) => m.status === "active" && m.id !== SELF_ID
                ).map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      // Typing "@" already put one in; the button did not.
                      const el = area.current
                      const before = el ? text.slice(0, el.selectionStart) : ""
                      insert(
                        `${before.endsWith("@") ? "" : "@"}${firstName(m.name)} `
                      )
                      setMentionOpen(false)
                    }}
                    className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs hover:bg-element-hover"
                  >
                    <ChatAvatar id={m.id} ring="ring-popover" />
                    {m.name}
                  </button>
                ))}
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex items-center gap-0.5">
            {INLINE.map((f) => (
              <Format key={f.label} f={f} onApply={() => edit(f.apply)} />
            ))}
            <Divider />
            {BLOCK.map((f) => (
              <Format key={f.label} f={f} onApply={() => edit(f.apply)} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

const FORMAT_BUTTON =
  "duration-fast flex size-6 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-element-hover hover:text-foreground"

function Divider() {
  return <span aria-hidden="true" className="mx-0.5 h-3.5 w-px bg-border" />
}

function Tool({
  label,
  children,
}: {
  label: string
  children: React.ReactElement
}) {
  return (
    <Tooltip>
      <TooltipTrigger render={children} />
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

function Format({ f, onApply }: { f: Wrap; onApply: () => void }) {
  return (
    <Tool label={f.keys ? `${f.label} ${f.keys}` : f.label}>
      <button
        type="button"
        aria-label={f.label}
        // Keep the selection in the textarea while the button is pressed.
        onMouseDown={(e) => e.preventDefault()}
        onClick={onApply}
        className={FORMAT_BUTTON}
      >
        <Icon icon={f.icon} size="sm" />
      </button>
    </Tool>
  )
}

export { Composer }
