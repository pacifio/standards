"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { CornerDownRightIcon, SearchIcon, XIcon } from "lucide-react"
import { cn } from "cn"

import { MEMBERS } from "@/mock/data"
import type { ApiTimelineEntry, ArtifactComment } from "@/mock/sessions-api"
import { MOCK_NOW, ago } from "@/mock/time"
import { useTheme } from "@/lib/theme"
import { useDockRoom } from "@/components/shell/app-shell"
import { PersonAvatar } from "@/components/patterns/person-avatar"
import { SegmentedPills } from "@/components/patterns/segmented"
import { Icon } from "@/components/ui/icon"
import { MessageSquareMoreIcon } from "@/components/ui/message-square-more-icon"
import type { MessageSquareMoreIconHandle } from "@/components/ui/message-square-more-icon"
import { useComments } from "./comments"

/**
 * Every comment on the session, in a panel the comments button grows into.
 *
 * The desktop app gives comments a side panel; the web reader has no room
 * for a second panel, so the button itself morphs into one (the `t-morph`
 * transition, utilities.css) and shrinks back into the button on close.
 *
 * The panel is drawn in the OTHER theme — dark on a light page, light on a
 * dark one — by setting `data-theme` on its surface, so it reads as a layer
 * over the session rather than more of it. Choosing a thread closes the
 * panel and jumps to where the comment lives: the reader scrolls the entry
 * into view, marks it, and opens that entry's thread.
 *
 * The compact dock is too narrow for the panel, so opening it there first
 * widens the dock to half, waits for it to settle, then grows the panel;
 * closing hands the dock back to compact. At half width or on the public
 * page it just opens.
 */

type Filter = "all" | "open" | "unread"

const SELF = "m1"

function person(id: string, guest: string | null) {
  if (guest) return { name: guest }
  const m = MEMBERS.find((x) => x.id === id)
  return m
    ? { name: m.name || m.email, email: m.email, image: m.image }
    : { name: "Former member" }
}

const VERB: Record<string, string> = {
  Read: "Read",
  Edit: "Edited",
  Write: "Created",
  Bash: "Ran",
  Search: "Searched",
}

/** "This session", "Response", "Tool call · Ran bun test board", … */
function anchorLabel(
  c: ArtifactComment,
  byId: Map<string, ApiTimelineEntry>
): string {
  if (c.anchorKind === "session") return "This session"
  const e = byId.get(c.anchorId)
  if (!e) return "An entry"
  if (e.kind === "tool_call") {
    const verb = e.toolName ? (VERB[e.toolName] ?? e.toolName) : "Tool call"
    return `Tool call · ${verb} ${e.toolTitle ?? ""}`.trim()
  }
  if (e.kind === "checkpoint")
    return `Checkpoint · ${e.commitSubject ?? e.commitSha?.slice(0, 7) ?? ""}`
  return e.kind === "prompt"
    ? "Prompt"
    : e.kind === "thinking"
      ? "Thinking"
      : "Response"
}

function CommentsMorph({ entries }: { entries: Array<ApiTimelineEntry> }) {
  const { comments, focusComment } = useComments()
  const { appearance } = useTheme()
  const inverted = appearance === "dark" ? "light" : "dark"

  const [open, setOpen] = useState(false)
  const room = useDockRoom()
  const wasOpen = useRef(false)

  function openPanel() {
    const wait = room.expand()
    if (wait) window.setTimeout(() => setOpen(true), wait)
    else setOpen(true)
  }

  // However it closes — ✕, Escape, a click outside, or jumping to a
  // comment — give back any room it borrowed.
  useEffect(() => {
    if (wasOpen.current && !open) room.restore()
    wasOpen.current = open
  }, [open, room])
  const [filter, setFilter] = useState<Filter>("all")
  const [query, setQuery] = useState("")
  const root = useRef<HTMLDivElement>(null)
  const search = useRef<HTMLInputElement>(null)
  const icon = useRef<MessageSquareMoreIconHandle>(null)

  const live = comments.filter((c) => !c.deletedAt)

  // What you have not seen yet: a thread someone else started in the last
  // two hours, until you open it. The real app would read this from the server.
  const [seen, setSeen] = useState<Set<string>>(
    () =>
      new Set(
        comments
          .filter(
            (c) =>
              c.authorId === SELF ||
              Date.parse(MOCK_NOW) - Date.parse(c.createdAt) > 7_200_000
          )
          .map((c) => c.id)
      )
  )
  const isUnread = (c: ArtifactComment) =>
    c.authorId !== SELF && !seen.has(c.id)
  const unreadCount = live.filter((c) => !c.parentId && isUnread(c)).length
  const byId = useMemo(() => new Map(entries.map((e) => [e.id, e])), [entries])

  const threads = useMemo(() => {
    const q = query.trim().toLowerCase()
    return live
      .filter((c) => !c.parentId)
      .filter((c) =>
        filter === "open"
          ? !c.resolvedAt
          : filter === "unread"
            ? c.authorId !== SELF && !seen.has(c.id)
            : true
      )
      .map((c) => ({
        root: c,
        replies: live.filter((r) => r.parentId === c.id),
      }))
      .filter(
        ({ root: c, replies }) =>
          !q ||
          [c, ...replies].some(
            (x) =>
              x.body?.toLowerCase().includes(q) ||
              person(x.authorId, x.guestName).name.toLowerCase().includes(q)
          )
      )
      .sort(
        (a, b) => Date.parse(b.root.createdAt) - Date.parse(a.root.createdAt)
      )
  }, [live, filter, query, seen])

  // Close on a click outside or Escape; focus the search once it has grown.
  useEffect(() => {
    if (!open) return
    const t = window.setTimeout(() => search.current?.focus(), 200)
    function onDown(e: PointerEvent) {
      // Inside the panel, or inside a popover it opened, stays open.
      const target = e.target as Node
      if (root.current?.contains(target)) return
      setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("pointerdown", onDown)
    document.addEventListener("keydown", onKey)
    return () => {
      window.clearTimeout(t)
      document.removeEventListener("pointerdown", onDown)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  function jump(c: ArtifactComment) {
    setSeen((prev) => new Set(prev).add(c.id))
    setOpen(false)
    focusComment(c.anchorId, c.id)
  }

  return (
    <div ref={root} className="relative z-10">
      <div
        data-open={open}
        className={cn(
          "t-morph border border-border bg-card/80 shadow-md backdrop-blur-xl data-[open=true]:shadow-lg",
          // The width cap leaves the bar's padding (2rem), the share button
          // beside it (2rem) and the gap between them (0.75rem), so the
          // panel never runs past the reader's edge.
          "[--morph-open-h:min(32rem,calc(100svh-10rem))] [--morph-open-w:min(24rem,calc(100cqw-4.75rem))]"
        )}
      >
        {/* The panel's own surface, in the other theme; fades in as the
            box grows so the button does not flash dark mid-morph. */}
        <div
          aria-hidden="true"
          data-theme={inverted}
          className="t-morph-surface bg-card"
        />

        <div
          data-theme={inverted}
          role="dialog"
          aria-label="Comments"
          inert={!open}
          className="t-morph-menu flex flex-col gap-2.5 p-3 text-foreground"
        >
          <header className="flex items-center justify-between gap-2">
            <SegmentedPills<Filter>
              size="sm"
              // A touch more contrast than the page's segmented controls:
              // this sits on a surface of the other theme, where the
              // default track all but disappears.
              className="bg-foreground/8 ring-foreground/15"
              value={filter}
              onChange={setFilter}
              options={[
                { value: "all", label: "All" },
                { value: "open", label: "Open" },
                {
                  value: "unread",
                  label: "Unread",
                  count: unreadCount || undefined,
                },
              ]}
            />
            <button
              type="button"
              aria-label="Close comments"
              onClick={() => setOpen(false)}
              className="duration-fast flex size-8 cursor-pointer items-center justify-center rounded-full text-secondary-foreground ring-1 ring-foreground/20 transition-colors hover:bg-element-hover hover:text-foreground"
            >
              <Icon icon={XIcon} size="sm" />
            </button>
          </header>

          <ul className="-mx-1 min-h-0 flex-1 overflow-y-auto">
            {threads.length === 0 ? (
              <li className="px-2 py-10 text-center text-xs text-muted-foreground">
                {query
                  ? "No comments match."
                  : filter === "unread"
                    ? "You're all caught up."
                    : "No comments here yet."}
              </li>
            ) : (
              threads.map(({ root: c, replies }) => {
                const p = person(c.authorId, c.guestName)
                return (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => jump(c)}
                      className={cn(
                        "flex w-full cursor-pointer flex-col gap-1 rounded-xl px-2 py-2 text-left",
                        "duration-fast transition-colors hover:bg-element-hover",
                        c.resolvedAt && "opacity-55"
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <PersonAvatar
                          size="xs"
                          name={p.name}
                          email={p.email}
                          image={p.image}
                          className="size-5"
                        />
                        <span className="min-w-0 flex-1 truncate text-xs font-medium">
                          {p.name}
                        </span>
                        {isUnread(c) && (
                          <span
                            aria-label="Unread"
                            className="size-1.5 shrink-0 rounded-full bg-destructive"
                          />
                        )}
                        <span className="shrink-0 mono text-3xs text-muted-foreground">
                          {ago(c.createdAt)}
                        </span>
                      </span>
                      <span className="line-clamp-2 text-xs leading-snug text-secondary-foreground">
                        {c.body}
                      </span>
                      <span className="flex items-center justify-between gap-2 text-2xs text-muted-foreground">
                        <span className="flex min-w-0 items-center gap-1">
                          <Icon icon={CornerDownRightIcon} size="xs" />
                          <span className="truncate">
                            {anchorLabel(c, byId)}
                          </span>
                        </span>
                        <span className="shrink-0 tnum">
                          {c.resolvedAt
                            ? "Resolved"
                            : replies.length > 0
                              ? `${replies.length} ${replies.length === 1 ? "reply" : "replies"}`
                              : ""}
                        </span>
                      </span>
                    </button>
                  </li>
                )
              })
            )}
          </ul>

          <label className="duration-fast flex h-9 shrink-0 items-center gap-2 rounded-2xl border border-border-strong bg-secondary px-3 transition-colors focus-within:border-foreground/20">
            <Icon
              icon={SearchIcon}
              size="sm"
              className="text-muted-foreground"
            />
            <input
              ref={search}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search comments…"
              aria-label="Search comments"
              className="min-w-0 flex-1 bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground"
            />
          </label>
        </div>

        <button
          type="button"
          aria-label={`${live.length} comments — open all comments`}
          aria-expanded={open}
          onClick={openPanel}
          onMouseEnter={() => icon.current?.startAnimation()}
          onMouseLeave={() => icon.current?.stopAnimation()}
          // `-right-px -bottom-px`: the box has a 1px border and positioned
          // children sit inside it, so without this the 2rem trigger hangs
          // 1px up and left of the circle's centre.
          className="t-morph-trigger duration-fast -right-px -bottom-px flex cursor-pointer items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
        >
          <MessageSquareMoreIcon ref={icon} controlled />
        </button>
      </div>

      {/* Outside the morph box, which clips: the badge overhangs the
          button's corner, and steps away while the panel is open. */}
      {live.length > 0 && (
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-3xs font-semibold text-destructive-foreground tnum ring-2 ring-card",
            "duration-fast transition-[opacity,scale]",
            open ? "scale-50 opacity-0" : "scale-100 opacity-100"
          )}
        >
          {live.length}
        </span>
      )}
    </div>
  )
}

export { CommentsMorph }
