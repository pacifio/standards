"use client"

import { useState } from "react"
import {
  HashIcon,
  LockIcon,
  PanelLeftIcon,
  PanelRightIcon,
  PhoneIcon,
  PinIcon,
  SearchIcon,
  UsersIcon,
  VideoIcon,
} from "lucide-react"

import { SELF_ID } from "@/mock/chat"
import type { ChatConversation, ChatMessage } from "@/mock/chat"
import { ago } from "@/mock/time"
import { Icon } from "@/components/ui/icon"
import { IconButton } from "@/components/ui/icon-button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ChatAvatar, member } from "./chat-avatar"

/**
 * The conversation's bar. On the left, the switch for the conversation
 * list and what you are in. On the right, the two things you do to the
 * whole conversation rather than a message — look at what was pinned, and
 * call — then the switch for the assets panel. Members, topic and presence
 * live in the list and the transcript; repeating them here only crowded
 * the title.
 */
function ChatHeader({
  conversation: c,
  pinned,
  panelOpen,
  onTogglePanel,
  listOpen,
  onToggleList,
}: {
  conversation: ChatConversation
  pinned: Array<ChatMessage>
  /** Whether the assets panel beside the conversation is showing. */
  panelOpen: boolean
  onTogglePanel: () => void
  /** Whether the conversation list to the left is showing. */
  listOpen: boolean
  onToggleList: () => void
}) {
  const dmWith =
    c.kind === "dm" ? c.memberIds.find((id) => id !== SELF_ID) : undefined

  return (
    <header className="flex h-11 shrink-0 items-center gap-2 border-b border-hairline pr-4 pl-2">
      <IconButton
        icon={PanelLeftIcon}
        label={listOpen ? "Hide conversations" : "Show conversations"}
        size="sm"
        aria-pressed={listOpen}
        onClick={onToggleList}
        className="aria-pressed:bg-element-selected aria-pressed:text-foreground"
      />
      <span aria-hidden="true" className="mr-1 h-4 w-px bg-border" />
      {dmWith ? (
        <ChatAvatar id={dmWith} />
      ) : (
        <Icon
          icon={
            c.kind === "group" ? UsersIcon : c.private ? LockIcon : HashIcon
          }
          size="sm"
          className="text-muted-foreground"
        />
      )}
      <h1 className="min-w-0 truncate text-sm font-medium">{c.name}</h1>

      <div className="ml-auto flex items-center gap-1">
        <PinsMenu pinned={pinned} />
        <span aria-hidden="true" className="mx-1 h-4 w-px bg-border" />
        <IconButton icon={PhoneIcon} label="Start a call" size="sm" />
        <IconButton icon={VideoIcon} label="Start a video call" size="sm" />
        <span aria-hidden="true" className="mx-1 h-4 w-px bg-border" />
        <IconButton
          icon={PanelRightIcon}
          label={panelOpen ? "Hide assets" : "Show assets"}
          size="sm"
          aria-pressed={panelOpen}
          onClick={onTogglePanel}
          className="aria-pressed:bg-element-selected aria-pressed:text-foreground"
        />
      </div>
    </header>
  )
}

/**
 * Pinned messages, in a dropdown off the header rather than a bar across
 * the top of the transcript: pins are looked up, not read every time. Pick
 * one and the transcript scrolls to it.
 */
function PinsMenu({ pinned }: { pinned: Array<ChatMessage> }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const q = query.trim().toLowerCase()
  const shown = pinned.filter(
    (m) =>
      !q ||
      m.body.toLowerCase().includes(q) ||
      member(m.authorId).name.toLowerCase().includes(q)
  )

  function jump(id: string) {
    setOpen(false)
    const el = document.querySelector<HTMLElement>(`[data-message="${id}"]`)
    el?.scrollIntoView({ behavior: "smooth", block: "center" })
    // A brief mark so the eye finds it after the scroll.
    el?.setAttribute("data-flash", "")
    window.setTimeout(() => el?.removeAttribute("data-flash"), 1400)
  }

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (next) setQuery("")
      }}
    >
      <PopoverTrigger
        aria-label={`${pinned.length} pinned messages`}
        className="duration-fast flex h-7 cursor-pointer items-center gap-1 rounded-md px-1.5 text-xs text-muted-foreground transition-colors hover:bg-element-hover hover:text-foreground data-popup-open:bg-element-hover data-popup-open:text-foreground"
      >
        <Icon icon={PinIcon} size="sm" />
        <span className="tnum">{pinned.length}</span>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={6}
        className="w-80 gap-0 overflow-hidden rounded-xl bg-popover/95 p-0 backdrop-blur-2xl"
      >
        <label className="flex h-9 items-center gap-2 border-b border-hairline px-3">
          <Icon icon={SearchIcon} size="xs" className="text-disabled" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pins…"
            className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-disabled"
          />
        </label>
        <ul className="max-h-80 overflow-y-auto py-1">
          {shown.length === 0 ? (
            <li className="px-3 py-6 text-center text-2xs text-muted-foreground">
              {pinned.length === 0
                ? "Nothing pinned yet. Pin a message from its ⋯ menu."
                : "No pins match."}
            </li>
          ) : (
            shown.map((m) => (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => jump(m.id)}
                  className="duration-fast flex w-full cursor-pointer flex-col gap-1 px-3 py-2 text-left transition-colors hover:bg-element-hover"
                >
                  <span className="flex items-center gap-2">
                    <ChatAvatar id={m.authorId} presence={false} />
                    <span className="truncate text-xs font-medium">
                      {member(m.authorId).name}
                    </span>
                    <span className="shrink-0 text-3xs text-disabled">
                      {ago(m.createdAt)}
                    </span>
                  </span>
                  <span className="line-clamp-2 pl-7 text-xs text-secondary-foreground">
                    {m.body.replace(/[*`_]/g, "")}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      </PopoverContent>
    </Popover>
  )
}

export { ChatHeader }
