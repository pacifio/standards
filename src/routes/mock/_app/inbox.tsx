import { useMemo, useRef, useState } from "react"
import { Link, createFileRoute } from "@tanstack/react-router"
import {
  AtSignIcon,
  CheckCheckIcon,
  CornerDownRightIcon,
  InboxIcon,
  MessageSquareIcon,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { cn } from "cn"

import { MEMBERS } from "@/mock/data"
import { INBOX } from "@/mock/inbox"
import { ago, dayKey, dayLabel, fullStamp } from "@/mock/time"
import type { ArtifactNotificationKind, InboxEntry } from "@/mock/types"
import { hueFor } from "@/lib/hue"
import { DashedRails } from "@/components/blocks/dashed-rails"
import { TimelineCalendar } from "@/components/blocks/timeline-calendar"
import type { CalendarDay } from "@/components/blocks/timeline-calendar"
import { PersonAvatar } from "@/components/patterns/person-avatar"
import { SegmentedPills } from "@/components/patterns/segmented"
import { EmptyState } from "@/components/ui/empty-state"
import { GoChevron } from "@/components/ui/go-chevron"
import { Icon } from "@/components/ui/icon"
import { IconButton } from "@/components/ui/icon-button"
import { MailboxIcon } from "@/components/ui/mailbox-icon"
import type { MailboxIconHandle } from "@/components/ui/mailbox-icon"
import { LabelMark } from "@/components/ui/tag"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export const Route = createFileRoute("/mock/_app/inbox")({
  component: InboxScreen,
})

type Filter = "all" | "unread" | "mentions"

/**
 * The server's own icon and verb per kind (`apps/web/src/routes/inbox.tsx`
 * in the server repo), so the mock and the product say the same thing.
 */
const KIND_ICON: Record<ArtifactNotificationKind, LucideIcon> = {
  artifact_mention: AtSignIcon,
  artifact_reply: CornerDownRightIcon,
  artifact_session_comment: MessageSquareIcon,
}

const KIND_LABEL: Record<ArtifactNotificationKind, string> = {
  artifact_mention: "mentioned you on",
  artifact_reply: "replied to you on",
  artifact_session_comment: "commented on your session",
}

/* --- People ------------------------------------------------------------ */

type Actor = { name: string; email?: string; image?: string; guest: boolean }

/**
 * `actorName` is set only for guests; everyone else is resolved from the
 * org directory by `actorId`, exactly as the real client does. Someone who
 * has left is still shown — as a former member — because the comment is.
 */
function resolveActor(entry: InboxEntry): Actor {
  if (entry.actorName) return { name: entry.actorName, guest: true }
  const m = MEMBERS.find((x) => x.id === entry.actorId)
  if (!m) return { name: "Former member", guest: false }
  return {
    name: m.name || m.email,
    email: m.email,
    image: m.image,
    guest: false,
  }
}

/**
 * The Inbox.
 *
 * Comments that concern you, from every project you can see — nothing else
 * reaches it. Each entry is a sentence and a link: who, what they did, on
 * which session, what they said, and where. So it is a list, not a
 * list-and-reader: opening an entry takes you to the comment in its
 * session, which is where you would answer it.
 *
 * Days are a timeline calendar — one sticky date that changes as you scroll
 * into the next day — in a centred column with room either side. Rows are
 * three lines separated by hairlines, not boxed: who and what, what they
 * said, where and how long ago. The kind is a glyph in a ring (@ mention,
 * ↳ reply, bubble for a comment on your session) and unread is a dot ON
 * that ring, so a read row loses nothing but the dot and keeps its shape.
 *
 * The name, the session and the project are links in their own right; the
 * rest of the row opens the comment. Opening marks it read, optimistically,
 * as the server client does (`POST /inbox/read { ids }`). "Mark all as
 * read" is `POST /inbox/read { all: true }`.
 */
function InboxScreen() {
  const scroller = useRef<HTMLDivElement>(null)
  const mailbox = useRef<MailboxIconHandle>(null)
  const [filter, setFilter] = useState<Filter>("all")
  const [readIds, setReadIds] = useState<Set<string>>(
    () => new Set(INBOX.filter((e) => e.readAt).map((e) => e.id))
  )

  const isRead = (e: InboxEntry) => readIds.has(e.id)
  const unread = INBOX.filter((e) => !isRead(e)).length

  const byDay = useMemo(() => {
    const visible = INBOX.filter((e) => {
      if (filter === "unread") return !readIds.has(e.id)
      if (filter === "mentions") return e.kind === "artifact_mention"
      return true
    })
    const days = new Map<string, Array<InboxEntry>>()
    for (const e of visible) {
      const key = dayKey(e.createdAt)
      days.set(key, [...(days.get(key) ?? []), e])
    }
    return [...days.entries()]
  }, [filter, readIds])

  function markRead(id: string) {
    setReadIds((prev) => (prev.has(id) ? prev : new Set(prev).add(id)))
  }

  function markAllRead() {
    setReadIds(new Set(INBOX.map((e) => e.id)))
  }

  const days: Array<CalendarDay> = byDay.map(([key, entries]) => ({
    id: key,
    ...dayLabel(entries[0].createdAt),
    children: (
      <ul className="divide-y divide-hairline">
        {entries.map((entry) => (
          <li key={entry.id}>
            <InboxRow
              entry={entry}
              read={isRead(entry)}
              onOpen={() => markRead(entry.id)}
            />
          </li>
        ))}
      </ul>
    ),
  }))

  return (
    <div
      ref={scroller}
      // A container, so the rails answer to the PANEL's width — which the
      // sidebar and the dock both eat into — not the window's.
      className="@container min-h-0 flex-1 overflow-y-auto"
    >
      <div className="flex min-h-full flex-col px-2 @5xl:px-10">
        {/* A column framed by dashed rails at its edges; the content keeps a
          gutter inside them. */}
        <div className="relative mx-auto flex w-full max-w-232 flex-1 flex-col gap-6 px-5 pt-8 pb-24">
          {/* The rails stand 3.25rem off the content (the 1.25rem gutter plus
            2rem outside the column), matching the timeline. They need the
            panel to be wider than the column plus that margin, so below
            64rem of panel they are not drawn at all rather than grazing the
            panel's edge. */}
          <DashedRails offset="-2rem" className="hidden @5xl:block" />
          {/* The title drives the mailbox: hovering anywhere on it raises
            the flag, not just on the 20px glyph. */}
          <header className="flex flex-wrap items-center justify-between gap-3">
            <h1
              className="flex items-center gap-2.5 text-xl font-medium tracking-tight"
              onMouseEnter={() => mailbox.current?.startAnimation()}
              onMouseLeave={() => mailbox.current?.stopAnimation()}
            >
              <MailboxIcon ref={mailbox} controlled size={22} />
              Inbox
            </h1>
            <div className="flex flex-wrap items-center gap-2">
              <SegmentedPills<Filter>
                size="sm"
                value={filter}
                onChange={setFilter}
                options={[
                  { value: "all", label: "All" },
                  {
                    value: "unread",
                    label: "Unread",
                    count: unread || undefined,
                  },
                  { value: "mentions", label: "Mentions" },
                ]}
              />
              <Tooltip>
                <TooltipTrigger
                  render={
                    <IconButton
                      icon={CheckCheckIcon}
                      label="Mark all as read"
                      variant="outline"
                      onClick={markAllRead}
                      disabled={unread === 0}
                    />
                  }
                />
                <TooltipContent>Mark all as read</TooltipContent>
              </Tooltip>
            </div>
          </header>

          {days.length === 0 ? (
            <EmptyState
              icon={InboxIcon}
              title={
                filter === "all" ? "Nothing here yet" : "You are caught up"
              }
              description="When somebody mentions you, replies to you, or comments on a session you recorded, it will appear here."
              className="py-20"
            />
          ) : (
            <TimelineCalendar days={days} root={scroller} />
          )}
        </div>
      </div>
    </div>
  )
}

function InboxRow({
  entry,
  read,
  onOpen,
}: {
  entry: InboxEntry
  read: boolean
  onOpen: () => void
}) {
  const actor = resolveActor(entry)
  const deleted = entry.excerpt === ""
  const title = entry.sessionTitle ?? "an untitled session"
  // Inner links sit above the row's own link; hover underlines them.
  const inline =
    "relative z-10 underline-offset-2 hover:underline focus-visible:underline"

  return (
    <article
      data-unread={!read || undefined}
      className="group/row group/go duration-fast relative -mx-2 flex gap-2.5 rounded-lg px-2 py-2.5 transition-colors ease-out-strong hover:bg-element-hover"
    >
      {/* The row itself opens the comment: a link stretched under the
          content, so the inner links stay real links rather than nesting. */}
      <Link
        to="/mock/timeline"
        search={{
          view: "all",
          session: entry.sessionId,
          comment: entry.commentId,
        }}
        onClick={onOpen}
        aria-label={`${actor.name} ${KIND_LABEL[entry.kind]} ${title}`}
        className="absolute inset-0 rounded-lg"
      />

      <span
        aria-hidden="true"
        className="relative flex size-6 shrink-0 items-center justify-center rounded-full text-muted-foreground ring-1 ring-foreground/12"
      >
        <Icon icon={KIND_ICON[entry.kind]} size="sm" />
        {!read && (
          <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-foreground ring-2 ring-background" />
        )}
      </span>
      {!read && <span className="sr-only">Unread.</span>}

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs">
          <PersonAvatar
            size="xs"
            name={actor.name}
            email={actor.email}
            image={actor.image}
          />
          {actor.guest ? (
            <span className="font-medium text-foreground">{actor.name}</span>
          ) : (
            <Link
              to="/mock/settings/organisation"
              className={cn(
                inline,
                "font-medium",
                read ? "text-secondary-foreground" : "text-foreground"
              )}
            >
              {actor.name}
            </Link>
          )}
          {actor.guest && (
            <span className="rounded-full px-1.5 text-4xs tracking-wider text-muted-foreground uppercase ring-1 ring-foreground/15">
              Guest
            </span>
          )}
          <span className="text-muted-foreground">
            {KIND_LABEL[entry.kind]}
          </span>
          <Link
            to="/mock/timeline"
            search={{
              view: "all",
              session: entry.sessionId,
              comment: entry.commentId,
            }}
            onClick={onOpen}
            className={cn(
              inline,
              "min-w-0 truncate",
              read ? "text-secondary-foreground" : "text-foreground"
            )}
          >
            {title}
          </Link>
        </p>

        <p
          className={cn(
            "line-clamp-2 text-xs leading-snug",
            deleted ? "text-disabled italic" : "text-secondary-foreground"
          )}
        >
          {deleted ? "Comment deleted" : entry.excerpt}
        </p>

        <p className="flex items-center gap-2 text-2xs text-muted-foreground">
          <Link to="/mock/projects" className={inline}>
            <LabelMark hue={hueFor(entry.workspaceSlug)}>
              {entry.workspaceSlug}
            </LabelMark>
          </Link>
          <span aria-hidden="true">·</span>
          <time dateTime={entry.createdAt} title={fullStamp(entry.createdAt)}>
            {ago(entry.createdAt)}
          </time>
        </p>
      </div>

      {/* Says "this opens the comment". Decorative: the row itself is the
          link, and the chevron answers the row's hover. */}
      <span
        aria-hidden="true"
        className="duration-fast flex size-7 shrink-0 items-center justify-center self-center rounded-full text-muted-foreground transition-colors group-hover/row:text-foreground"
      >
        <GoChevron />
      </span>
    </article>
  )
}
