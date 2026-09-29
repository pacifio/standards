"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { CheckIcon, CornerDownLeftIcon, MessageSquareIcon } from "lucide-react"
import { cn } from "cn"

import { MEMBERS } from "@/mock/data"
import type { ArtifactComment, CommentAnchorKindApi } from "@/mock/sessions-api"
import { ago, hm } from "@/mock/time"
import { PersonAvatar } from "@/components/patterns/person-avatar"
import { Icon } from "@/components/ui/icon"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

/**
 * Inline comments on a session — the Atlas desktop app's comment threads.
 *
 * Every entry (and the session itself) can carry threads. A thread is a
 * root and its replies, one level deep, exactly as the server stores them.
 * The pill on an entry shows up to three faces and a count and opens the
 * threads in a popover; under the entry, activity lines say who commented
 * and when. Posting, replying and resolving are local to the mock.
 */

const SELF = "m1"

type Person = { name: string; email?: string; image?: string }

function person(id: string, guest: string | null): Person {
  if (guest) return { name: guest }
  const m = MEMBERS.find((x) => x.id === id)
  return m
    ? { name: m.name || m.email, email: m.email, image: m.image }
    : { name: "Former member" }
}

type CommentsContextValue = {
  comments: Array<ArtifactComment>
  post: (
    anchorKind: CommentAnchorKindApi,
    anchorId: string,
    body: string,
    parentId: string | null
  ) => void
  resolve: (id: string, resolved: boolean) => void
  /** A comment to open and mark, from an inbox deep link. */
  highlight?: string
  /**
   * The last "jump to this comment" request: the anchor to scroll to and
   * open, and the comment to mark. `n` changes on every request, so asking
   * for the same anchor twice still fires.
   */
  focus: CommentFocus | null
  focusComment: (anchorId: string, commentId: string) => void
}

export type CommentFocus = { anchorId: string; commentId: string; n: number }

const CommentsContext = createContext<CommentsContextValue | null>(null)

function useComments() {
  const ctx = useContext(CommentsContext)
  if (!ctx) throw new Error("useComments outside <CommentsProvider>")
  return ctx
}

function CommentsProvider({
  sessionId,
  initial,
  highlight,
  children,
}: {
  sessionId: string
  initial: Array<ArtifactComment>
  highlight?: string
  children: React.ReactNode
}) {
  const [comments, setComments] = useState(initial)
  const [focus, setFocus] = useState<CommentFocus | null>(null)
  const value = useMemo<CommentsContextValue>(
    () => ({
      comments,
      highlight: focus?.commentId ?? highlight,
      focus,
      focusComment: (anchorId, commentId) =>
        setFocus((prev) => ({ anchorId, commentId, n: (prev?.n ?? 0) + 1 })),
      post: (anchorKind, anchorId, body, parentId) =>
        setComments((prev) => [
          ...prev,
          {
            id: `${sessionId}_local${prev.length + 1}`,
            sessionId,
            anchorKind,
            anchorId,
            parentId,
            authorId: SELF,
            guestName: null,
            body,
            mentions: [],
            createdAt: new Date().toISOString(),
            editedAt: null,
            deletedAt: null,
            resolvedAt: null,
            resolvedBy: null,
          },
        ]),
      resolve: (id, resolved) =>
        setComments((prev) =>
          prev.map((c) =>
            c.id === id
              ? {
                  ...c,
                  resolvedAt: resolved ? new Date().toISOString() : null,
                  resolvedBy: resolved ? SELF : null,
                }
              : c
          )
        ),
    }),
    [comments, focus, highlight, sessionId]
  )
  return (
    <CommentsContext.Provider value={value}>
      {children}
    </CommentsContext.Provider>
  )
}

/** Live (not deleted) comments on one anchor, oldest first. */
function useAnchor(anchorId: string) {
  const { comments } = useComments()
  return useMemo(
    () =>
      comments
        .filter((c) => c.anchorId === anchorId && !c.deletedAt)
        .sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt)),
    [comments, anchorId]
  )
}

/** Comment count for an anchor, for badges outside the pill. */
function useCommentCount(anchorId: string) {
  return useAnchor(anchorId).length
}

/**
 * The pill and its popover. With no comments it is a quiet glyph that
 * appears on the entry's hover; with comments it stays, showing faces and
 * a count.
 */
function CommentButton({
  anchorKind,
  anchorId,
  className,
}: {
  anchorKind: CommentAnchorKindApi
  anchorId: string
  className?: string
}) {
  const { highlight, focus } = useComments()
  const list = useAnchor(anchorId)
  const hasHighlight = !!highlight && list.some((c) => c.id === highlight)
  const [open, setOpen] = useState(hasHighlight)

  // A jump from the comments popover: open once the reader has scrolled
  // this anchor into view, so the popover positions against where it lands.
  useEffect(() => {
    if (focus?.anchorId !== anchorId) return
    const t = window.setTimeout(() => setOpen(true), 420)
    return () => window.clearTimeout(t)
  }, [focus, anchorId])
  const faces = [...new Set(list.map((c) => c.authorId))].slice(0, 3)
  const count = list.length

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            type="button"
            aria-label={
              count ? `${count} comments — open threads` : "Add a comment"
            }
            className={cn(
              "duration-fast flex h-6 items-center gap-1 rounded-full text-muted-foreground transition-colors hover:text-foreground",
              count
                ? "border border-border bg-card pr-2 pl-0.5"
                : "px-1.5 opacity-0 group-hover/row:opacity-100 focus-visible:opacity-100 data-popup-open:opacity-100",
              className
            )}
          >
            {count ? (
              <>
                <span className="flex -space-x-1.5">
                  {faces.map((id) => {
                    const p = person(id, null)
                    return (
                      <PersonAvatar
                        key={id}
                        size="xs"
                        name={p.name}
                        email={p.email}
                        image={p.image}
                        className="size-4 ring-1 ring-card"
                      />
                    )
                  })}
                </span>
                <span className="text-2xs tnum">
                  {count > 9 ? "9+" : count}
                </span>
              </>
            ) : (
              <Icon icon={MessageSquareIcon} size="xs" />
            )}
          </button>
        }
      />
      <PopoverContent
        side="bottom"
        align="end"
        sideOffset={6}
        className="w-90 gap-0 p-0"
      >
        <Threads anchorKind={anchorKind} anchorId={anchorId} list={list} />
      </PopoverContent>
    </Popover>
  )
}

function Threads({
  anchorKind,
  anchorId,
  list,
}: {
  anchorKind: CommentAnchorKindApi
  anchorId: string
  list: Array<ArtifactComment>
}) {
  const { post } = useComments()
  const roots = list.filter((c) => !c.parentId)
  const [draft, setDraft] = useState("")

  return (
    <div className="flex max-h-96 flex-col">
      <div className="min-h-0 flex-1 divide-y divide-hairline overflow-y-auto">
        {roots.map((root) => (
          <Thread
            key={root.id}
            root={root}
            replies={list.filter((c) => c.parentId === root.id)}
            anchorKind={anchorKind}
            anchorId={anchorId}
          />
        ))}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (!draft.trim()) return
          post(anchorKind, anchorId, draft.trim(), null)
          setDraft("")
        }}
        className={cn(
          "flex items-start gap-2 p-2.5",
          roots.length > 0 && "border-t border-hairline"
        )}
      >
        <SelfAvatar />
        <Composer
          value={draft}
          onChange={setDraft}
          placeholder={
            roots.length ? "Start a new thread…" : "Start a discussion…"
          }
        />
      </form>
    </div>
  )
}

function Thread({
  root,
  replies,
  anchorKind,
  anchorId,
}: {
  root: ArtifactComment
  replies: Array<ArtifactComment>
  anchorKind: CommentAnchorKindApi
  anchorId: string
}) {
  const { post, resolve, highlight } = useComments()
  const [replying, setReplying] = useState(false)
  const [draft, setDraft] = useState("")
  const resolved = !!root.resolvedAt

  return (
    <div className={cn("px-2.5 py-2", resolved && "opacity-55")}>
      <CommentRow
        comment={root}
        marked={highlight === root.id}
        actions={
          <>
            <Action
              onClick={() => resolve(root.id, !resolved)}
              icon={resolved ? undefined : CheckIcon}
            >
              {resolved ? "Reopen" : "Resolve"}
            </Action>
            <Action onClick={() => setReplying((v) => !v)}>Reply</Action>
          </>
        }
      />
      {replies.map((r) => (
        <div key={r.id} className="mt-2 pl-6">
          <CommentRow comment={r} marked={highlight === r.id} />
        </div>
      ))}
      {replying && (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (!draft.trim()) return
            post(anchorKind, anchorId, draft.trim(), root.id)
            setDraft("")
            setReplying(false)
          }}
          className="mt-2 flex items-start gap-2 pl-6"
        >
          <SelfAvatar />
          <Composer
            value={draft}
            onChange={setDraft}
            placeholder="Reply…"
            autoFocus
          />
        </form>
      )}
    </div>
  )
}

function CommentRow({
  comment: c,
  marked,
  actions,
}: {
  comment: ArtifactComment
  marked?: boolean
  actions?: React.ReactNode
}) {
  const p = person(c.authorId, c.guestName)
  return (
    <div
      className={cn(
        "flex gap-2 rounded-md",
        marked && "-m-1 bg-element-selected p-1"
      )}
    >
      <PersonAvatar
        size="xs"
        name={p.name}
        email={p.email}
        image={p.image}
        className="mt-px size-4.5"
      />
      <div className="min-w-0 flex-1">
        <p className="flex items-baseline gap-1.5">
          <span className="truncate text-xs font-medium text-foreground">
            {p.name}
          </span>
          {c.guestName && (
            <span className="rounded-full px-1 text-4xs tracking-wider text-muted-foreground uppercase ring-1 ring-foreground/15">
              Guest
            </span>
          )}
          <time dateTime={c.createdAt} className="mono text-3xs text-disabled">
            {hm(c.createdAt)}
          </time>
        </p>
        <p className="mt-0.5 text-xs leading-snug text-secondary-foreground">
          {c.body ?? <span className="text-disabled italic">Deleted</span>}
        </p>
        {actions && <div className="mt-1 -ml-1 flex gap-0.5">{actions}</div>}
      </div>
    </div>
  )
}

function Action({
  children,
  icon,
  onClick,
}: {
  children: React.ReactNode
  icon?: typeof CheckIcon
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="duration-fast flex items-center gap-1 rounded-sm px-1 py-px text-2xs text-muted-foreground transition-colors hover:bg-element-hover hover:text-foreground"
    >
      {icon && <Icon icon={icon} size="xs" className="size-2.5" />}
      {children}
    </button>
  )
}

function SelfAvatar() {
  const me = person(SELF, null)
  return (
    <PersonAvatar
      size="xs"
      name={me.name}
      email={me.email}
      image={me.image}
      className="mt-1 size-4.5"
    />
  )
}

function Composer({
  value,
  onChange,
  placeholder,
  autoFocus,
}: {
  value: string
  onChange: (v: string) => void
  placeholder: string
  autoFocus?: boolean
}) {
  return (
    <div className="relative min-w-0 flex-1">
      <textarea
        rows={1}
        value={value}
        autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            e.currentTarget.form?.requestSubmit()
          }
        }}
        placeholder={placeholder}
        aria-label={placeholder}
        className="block field-sizing-content max-h-28 min-h-8 w-full resize-none rounded-lg border border-border bg-surface py-1.5 pr-8 pl-2 text-xs text-foreground outline-none placeholder:text-disabled focus:border-border-strong"
      />
      <button
        type="submit"
        aria-label="Send"
        disabled={!value.trim()}
        className="duration-fast absolute top-1.5 right-1.5 flex size-5 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
      >
        <Icon icon={CornerDownLeftIcon} size="xs" />
      </button>
    </div>
  )
}

/** "Name commented on this · 2h ago", under an entry, oldest first. */
function ActivityLog({ anchorId }: { anchorId: string }) {
  const list = useAnchor(anchorId)
  if (!list.length) return null
  return (
    <ul className="mt-4 flex flex-col gap-2">
      {list.map((c) => {
        const p = person(c.authorId, c.guestName)
        return (
          <li
            key={c.id}
            className="flex items-center gap-2 text-2xs text-muted-foreground"
          >
            <PersonAvatar
              size="xs"
              name={p.name}
              email={p.email}
              image={p.image}
              className="size-3.5"
            />
            <span>
              <span className="text-secondary-foreground">{p.name}</span>{" "}
              {c.parentId ? "replied on this" : "commented on this"}
              <span className="text-disabled"> · {ago(c.createdAt)}</span>
            </span>
          </li>
        )
      })}
    </ul>
  )
}

export {
  ActivityLog,
  CommentButton,
  CommentsProvider,
  useCommentCount,
  useComments,
}
