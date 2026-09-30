"use client"

import { Fragment, useEffect, useMemo, useRef } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import {
  CopyIcon,
  CornerUpRightIcon,
  DownloadIcon,
  FileTextIcon,
  ImageIcon,
  MoreHorizontalIcon,
  PinIcon,
  SmilePlusIcon,
} from "lucide-react"
import { cn } from "cn"

import { MEMBERS } from "@/mock/data"
import { REACTIONS, SELF_ID, formatBytes } from "@/mock/chat"
import type { ChatMessage } from "@/mock/chat"
import { dayKey, dayLabel, fullStamp, hm } from "@/mock/time"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Icon } from "@/components/ui/icon"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollFade } from "@/components/ui/scroll-fade"
import { ChatAvatar, member } from "./chat-avatar"

/**
 * A conversation's transcript, read top to bottom in one column — the way a
 * team chat reads, not a phone's alternating bubbles.
 *
 * Messages group under one face and name while the same person keeps
 * talking: a new group starts when the author changes, five minutes pass,
 * the day turns, or a message replies to another. Follow-on lines show their
 * time only on hover, in the gutter where the face would be.
 *
 * Each line carries a hover toolbar — react, reply, more — and its reactions
 * as chips beneath it; your own reactions are tinted so you can see what you
 * said without reading the counts.
 */

const GROUP_WINDOW = 5 * 60_000

type Row =
  | { kind: "day"; key: string; iso: string }
  | { kind: "msg"; m: ChatMessage; head: boolean }

function rows(messages: Array<ChatMessage>): Array<Row> {
  const out: Array<Row> = []
  let prev: ChatMessage | null = null
  for (const m of messages) {
    const day = dayKey(m.createdAt)
    const newDay = !prev || dayKey(prev.createdAt) !== day
    if (newDay) out.push({ kind: "day", key: day, iso: m.createdAt })
    const head =
      newDay ||
      !prev ||
      prev.authorId !== m.authorId ||
      Date.parse(m.createdAt) - Date.parse(prev.createdAt) > GROUP_WINDOW ||
      !!m.replyToId
    out.push({ kind: "msg", m, head })
    prev = m
  }
  return out
}

/** "@Adib" → a mention link the renderer turns into a chip. */
function withMentions(body: string): string {
  return body.replace(/(^|\s)@([A-Z][a-z]+)/g, (all, space, first) => {
    const m = MEMBERS.find((x) => x.name.split(" ")[0] === first)
    return m ? `${space}[@${first}](mention:${m.id})` : all
  })
}

function MessageList({
  messages,
  isDm,
  onReact,
  onReply,
  onPin,
}: {
  messages: Array<ChatMessage>
  /** One-to-one: the name on every group is noise, so it is dropped. */
  isDm: boolean
  onReact: (id: string, emoji: string) => void
  onReply: (m: ChatMessage) => void
  onPin: (id: string) => void
}) {
  const list = useMemo(() => rows(messages), [messages])
  const byId = useMemo(
    () => new Map(messages.map((m) => [m.id, m])),
    [messages]
  )
  const end = useRef<HTMLDivElement>(null)

  // Land on the latest message, and follow new ones as they arrive.
  useEffect(() => {
    end.current?.scrollIntoView({ block: "end" })
  }, [messages.length])

  return (
    <ScrollFade className="min-h-0 flex-1" fade={24}>
      <div className="flex flex-col px-3 pt-4 pb-2">
        {list.map((r) =>
          r.kind === "day" ? (
            <DayDivider key={`day-${r.key}`} iso={r.iso} />
          ) : (
            <Fragment key={r.m.id}>
              <MessageRow
                m={r.m}
                head={r.head}
                showName={!isDm || r.m.authorId === SELF_ID}
                replyTo={r.m.replyToId ? byId.get(r.m.replyToId) : undefined}
                onReact={(e) => onReact(r.m.id, e)}
                onReply={() => onReply(r.m)}
                onPin={() => onPin(r.m.id)}
              />
            </Fragment>
          )
        )}
        <div ref={end} />
      </div>
    </ScrollFade>
  )
}

function DayDivider({ iso }: { iso: string }) {
  const { date, day } = dayLabel(iso)
  const label = day === "Today" || day === "Yesterday" ? day : date
  return (
    <div className="my-3 flex items-center gap-3 px-2">
      <span className="h-px flex-1 bg-hairline" />
      <span className="text-3xs font-medium tracking-wide text-disabled uppercase">
        {label}
      </span>
      <span className="h-px flex-1 bg-hairline" />
    </div>
  )
}

function MessageRow({
  m,
  head,
  showName,
  replyTo,
  onReact,
  onReply,
  onPin,
}: {
  m: ChatMessage
  head: boolean
  showName: boolean
  replyTo?: ChatMessage
  onReact: (emoji: string) => void
  onReply: () => void
  onPin: () => void
}) {
  const who = member(m.authorId)
  return (
    <div
      data-message={m.id}
      className={cn(
        "group/msg duration-slow relative flex gap-2.5 rounded-lg px-2 py-0.5 transition-colors hover:bg-element-hover data-flash:bg-warning-muted",
        head && "mt-2.5"
      )}
    >
      {/* The gutter: a face on the first line of a group, the time on
          hover for the rest. */}
      <div className="flex w-8 shrink-0 items-start justify-center">
        {head ? (
          <ChatAvatar
            id={m.authorId}
            size="md"
            className="mt-0.5"
            ring="ring-background"
          />
        ) : (
          <time
            dateTime={m.createdAt}
            className="pt-0.5 text-4xs leading-5 text-disabled tnum opacity-0 group-hover/msg:opacity-100"
          >
            {hm(m.createdAt)}
          </time>
        )}
      </div>

      <div className="min-w-0 flex-1">
        {replyTo && (
          <p className="mb-0.5 flex min-w-0 items-center gap-1.5 text-2xs text-muted-foreground">
            <Icon icon={CornerUpRightIcon} size="xs" className="shrink-0" />
            <span className="shrink-0 font-medium text-secondary-foreground">
              {member(replyTo.authorId).name}
            </span>
            <span className="truncate">{replyTo.body}</span>
          </p>
        )}
        {head && (
          <p className="flex items-baseline gap-2">
            {showName && (
              <span className="text-xs font-semibold">{who.name}</span>
            )}
            <time
              dateTime={m.createdAt}
              title={fullStamp(m.createdAt)}
              className="text-3xs text-disabled tnum"
            >
              {hm(m.createdAt)}
            </time>
            {m.pinned && (
              <span className="flex items-center gap-1 text-3xs text-disabled">
                <Icon icon={PinIcon} size="xs" />
                Pinned
              </span>
            )}
          </p>
        )}

        <div className="prose-session">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            urlTransform={(u) => u}
            components={{
              a: ({ href, children }) =>
                href?.startsWith("mention:") ? (
                  <span
                    className={cn(
                      "rounded-sm px-0.5 font-medium",
                      href === `mention:${SELF_ID}`
                        ? "bg-warning-muted text-warning"
                        : "bg-info-muted text-info"
                    )}
                  >
                    {children}
                  </span>
                ) : (
                  <a href={href} target="_blank" rel="noreferrer">
                    {children}
                  </a>
                ),
            }}
          >
            {withMentions(m.body)}
          </ReactMarkdown>
        </div>

        {m.sessionRef && (
          // A session pulled into the thread: a card, not a link, so the
          // reference survives being skimmed.
          <a
            href={`/mock/timeline`}
            className="duration-fast mt-1.5 flex w-fit max-w-full items-center gap-2 rounded-lg border border-border bg-card px-2.5 py-1.5 transition-colors hover:bg-element-hover"
          >
            <span className="shrink-0 mono text-2xs text-muted-foreground">
              {m.sessionRef.ref}
            </span>
            <span className="truncate text-xs">{m.sessionRef.title}</span>
          </a>
        )}

        {m.attachments?.map((a) =>
          a.kind === "image" ? (
            <figure
              key={a.name}
              style={{ aspectRatio: `${a.width} / ${a.height}` }}
              className="relative mt-1.5 flex w-full max-w-md items-center justify-center overflow-hidden rounded-lg border border-border bg-surface"
            >
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-linear-to-br from-foreground/6 to-transparent"
              />
              <Icon icon={ImageIcon} size="lg" className="text-disabled" />
              <figcaption className="absolute bottom-2 left-2 rounded-md bg-background/80 px-1.5 text-3xs text-muted-foreground backdrop-blur">
                {a.name}
              </figcaption>
            </figure>
          ) : (
            <div
              key={a.name}
              className="group/file mt-1.5 flex w-fit max-w-full items-center gap-2.5 rounded-lg border border-border bg-card py-2 pr-2 pl-2.5"
            >
              <Icon
                icon={FileTextIcon}
                size="md"
                className="text-muted-foreground"
              />
              <span className="flex min-w-0 flex-col">
                <span className="truncate text-xs">{a.name}</span>
                <span className="text-3xs text-disabled tnum">
                  {formatBytes(a.bytes)}
                </span>
              </span>
              <button
                type="button"
                aria-label={`Download ${a.name}`}
                className="ml-2 flex size-6 cursor-pointer items-center justify-center rounded-md text-muted-foreground opacity-0 transition-opacity group-hover/file:opacity-100 hover:bg-element-hover hover:text-foreground"
              >
                <Icon icon={DownloadIcon} size="xs" />
              </button>
            </div>
          )
        )}

        {m.reactions && m.reactions.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {m.reactions.map((r) => {
              const mine = r.userIds.includes(SELF_ID)
              return (
                <button
                  key={r.emoji}
                  type="button"
                  aria-pressed={mine}
                  title={r.userIds.map((id) => member(id).name).join(", ")}
                  onClick={() => onReact(r.emoji)}
                  className={cn(
                    "duration-fast flex h-5.5 cursor-pointer items-center gap-1 rounded-full border px-1.5 text-2xs tnum transition-colors",
                    mine
                      ? "border-success/40 bg-success-muted text-success"
                      : "border-border bg-card text-muted-foreground hover:border-border-strong"
                  )}
                >
                  <span className="text-xs">{r.emoji}</span>
                  {r.userIds.length}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Hover toolbar. */}
      <div className="absolute -top-3 right-2 hidden items-center gap-0.5 rounded-md border border-border bg-popover p-0.5 shadow-md group-hover/msg:flex has-data-popup-open:flex">
        <Popover>
          <PopoverTrigger aria-label="Add reaction" className={TOOL}>
            <Icon icon={SmilePlusIcon} size="sm" />
          </PopoverTrigger>
          <PopoverContent side="top" align="end" className="w-auto p-1.5">
            <div className="grid grid-cols-7 gap-0.5">
              {REACTIONS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => onReact(e)}
                  className="flex size-8 cursor-pointer items-center justify-center rounded-md text-md hover:bg-element-hover"
                >
                  {e}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
        <button
          type="button"
          aria-label="Reply"
          onClick={onReply}
          className={TOOL}
        >
          <Icon icon={CornerUpRightIcon} size="sm" />
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger aria-label="More" className={TOOL}>
            <Icon icon={MoreHorizontalIcon} size="sm" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem
              onClick={() => void navigator.clipboard.writeText(m.body)}
            >
              <Icon icon={CopyIcon} size="sm" />
              Copy text
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onPin}>
              <Icon icon={PinIcon} size="sm" />
              {m.pinned ? "Unpin" : "Pin for everyone"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

const TOOL =
  "flex size-6 cursor-pointer items-center justify-center rounded-sm text-muted-foreground hover:bg-element-hover hover:text-foreground"

export { MessageList }
