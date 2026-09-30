"use client"

import { useState } from "react"
import {
  ChevronRightIcon,
  HashIcon,
  LockIcon,
  MessagesSquareIcon,
  SearchIcon,
  UsersIcon,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { cn } from "cn"

import { ONLINE, SELF_ID } from "@/mock/chat"
import type { ChatConversation } from "@/mock/chat"
import { Icon } from "@/components/ui/icon"
import { ScrollFade } from "@/components/ui/scroll-fade"
import { ChatAvatar, firstName, member } from "./chat-avatar"
import { CreateChannelMenu, NewDmMenu } from "./chat-menus"

/**
 * The conversation list — the chat's first panel, the Atlas desktop app's
 * comms home on this system's tokens.
 *
 * Top to bottom: a jump field, the people online right now as a row of
 * faces (tap one to message them), then Channels, then Direct messages —
 * group conversations, a hairline, one-to-ones, and members you have not
 * messaged yet — and last, folded away, public channels you could join.
 *
 * A row with something new is set in the foreground ink and weight; the rest
 * sit back in the secondary ink, so the list reads unread-first without
 * reordering under you. Counts are keycaps; a mention turns its keycap red.
 */

function ConversationList({
  channels,
  direct,
  contacts,
  discover,
  selectedId,
  onSelect,
  onOpenDm,
  onCreateGroup,
  onCreateChannel,
  onJoin,
}: {
  channels: Array<ChatConversation>
  direct: Array<ChatConversation>
  /** Member ids with no DM yet. */
  contacts: Array<string>
  discover: Array<ChatConversation>
  selectedId: string
  onSelect: (id: string) => void
  /** Open — creating if needed — the DM with one member. */
  onOpenDm: (memberId: string) => void
  onCreateGroup: (memberIds: Array<string>) => void
  onCreateChannel: (name: string, isPrivate: boolean) => void
  onJoin: (id: string) => void
}) {
  const [query, setQuery] = useState("")
  const [discoverOpen, setDiscoverOpen] = useState(false)
  const q = query.trim().toLowerCase()
  const match = (s: string) => !q || s.toLowerCase().includes(q)

  const groups = direct.filter((c) => c.kind === "group" && match(c.name))
  const ones = direct.filter((c) => c.kind === "dm" && match(c.name))
  const people = contacts.filter((id) => match(member(id).name))
  const active = [...ONLINE].filter((id) => id !== SELF_ID)

  return (
    <div className="flex w-64 shrink-0 flex-col border-r border-hairline bg-surface">
      <div className="shrink-0 px-2.5 pt-2.5">
        <label className="duration-fast flex h-7 items-center gap-1.5 rounded-xl border border-border bg-card px-2.5 transition-colors focus-within:border-border-strong">
          <Icon icon={SearchIcon} size="xs" className="text-disabled" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Jump to a channel or person…"
            className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-disabled"
          />
        </label>
      </div>

      {/* Who is around, like a messenger's "Active" row: the fastest way to
          reach someone is to see that they are there. */}
      {!q && (
        <div className="shrink-0 border-b border-hairline px-3.5 pt-3 pb-3">
          <span className="text-2xs font-medium text-secondary-foreground">
            Active now
          </span>
          <ul className="mt-2 flex gap-3">
            {active.map((id) => (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => onOpenDm(id)}
                  className="group/active flex w-10 cursor-pointer flex-col items-center gap-1"
                >
                  <ChatAvatar
                    id={id}
                    size="lg"
                    ring="ring-surface"
                    className="duration-fast transition-transform group-hover/active:-translate-y-0.5"
                  />
                  <span className="w-full truncate text-center text-3xs text-muted-foreground group-hover/active:text-foreground">
                    {firstName(member(id).name)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <ScrollFade className="min-h-0 flex-1" fade={24}>
        <div className="pb-3">
          <SectionLabel icon={HashIcon} label="Channels">
            <CreateChannelMenu onCreate={onCreateChannel} />
          </SectionLabel>
          {channels
            .filter((c) => match(c.name))
            .map((c) => (
              <Row
                key={c.id}
                selected={c.id === selectedId}
                unread={c.unread}
                mentions={c.mentions}
                onClick={() => onSelect(c.id)}
                icon={
                  <Icon
                    icon={c.private ? LockIcon : HashIcon}
                    size="sm"
                    className="text-disabled"
                  />
                }
                label={c.name}
              />
            ))}

          <SectionLabel icon={MessagesSquareIcon} label="Direct messages">
            <NewDmMenu onCreate={onCreateGroup} />
          </SectionLabel>
          {groups.map((c) => (
            <Row
              key={c.id}
              selected={c.id === selectedId}
              unread={c.unread}
              mentions={c.mentions}
              onClick={() => onSelect(c.id)}
              icon={
                <span className="flex size-5 items-center justify-center rounded-full bg-card text-muted-foreground ring-1 ring-border">
                  <Icon icon={UsersIcon} size="xs" />
                </span>
              }
              label={c.name}
              trailing={
                <span className="text-2xs text-muted-foreground tnum">
                  {c.memberIds.length}
                </span>
              }
            />
          ))}
          {groups.length > 0 && (ones.length > 0 || people.length > 0) && (
            <div aria-hidden="true" className="py-1 pr-2.5 pl-3.5">
              <div className="h-px bg-hairline" />
            </div>
          )}
          {ones.map((c) => {
            const other = c.memberIds.find((id) => id !== SELF_ID) ?? SELF_ID
            return (
              <Row
                key={c.id}
                selected={c.id === selectedId}
                unread={c.unread}
                mentions={c.mentions}
                onClick={() => onSelect(c.id)}
                icon={<ChatAvatar id={other} ring="ring-surface" />}
                label={c.name}
              />
            )
          })}
          {/* Members with no conversation yet: always quiet, one click
              away from a DM. */}
          {people.map((id) => (
            <Row
              key={id}
              selected={false}
              unread={0}
              mentions={0}
              onClick={() => onOpenDm(id)}
              icon={<ChatAvatar id={id} ring="ring-surface" />}
              label={member(id).name}
            />
          ))}

          {discover.length > 0 && !q && (
            <>
              <button
                type="button"
                aria-expanded={discoverOpen}
                onClick={() => setDiscoverOpen((v) => !v)}
                className="mt-2 flex w-full cursor-pointer items-center gap-1.5 px-3.5 pt-3.5 pb-1.5 text-2xs font-medium text-secondary-foreground hover:text-foreground"
              >
                <Icon
                  icon={ChevronRightIcon}
                  size="xs"
                  className={cn(
                    "duration-base transition-transform",
                    discoverOpen && "rotate-90"
                  )}
                />
                Discover
                <span className="ml-auto text-muted-foreground tnum">
                  {discover.length}
                </span>
              </button>
              {discoverOpen &&
                discover.map((c) => (
                  <div
                    key={c.id}
                    className="group/disc flex items-center gap-2 py-1.5 pr-2.5 pl-3.5 text-muted-foreground"
                  >
                    <span className="flex w-5 shrink-0 justify-center">
                      <Icon icon={HashIcon} size="sm" className="opacity-60" />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-xs">{c.name}</span>
                      {c.topic && (
                        <span className="truncate text-3xs text-disabled">
                          {c.topic}
                        </span>
                      )}
                    </span>
                    <button
                      type="button"
                      onClick={() => onJoin(c.id)}
                      className="duration-fast cursor-pointer rounded-sm px-1.5 text-2xs font-medium text-secondary-foreground opacity-0 transition-opacity group-hover/disc:opacity-100 hover:bg-element-hover hover:text-foreground focus-visible:opacity-100"
                    >
                      Join
                    </button>
                  </div>
                ))}
            </>
          )}
        </div>
      </ScrollFade>
    </div>
  )
}

function SectionLabel({
  icon,
  label,
  children,
}: {
  icon: LucideIcon
  label: string
  children?: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-1.5 px-3.5 pt-3.5 pb-1.5 text-2xs font-medium text-secondary-foreground">
      <Icon icon={icon} size="xs" />
      {label}
      {children}
    </div>
  )
}

function Row({
  selected,
  unread,
  mentions,
  onClick,
  icon,
  label,
  trailing,
}: {
  selected: boolean
  unread: number
  mentions: number
  onClick: () => void
  icon: React.ReactNode
  label: string
  trailing?: React.ReactNode
}) {
  const hot = unread > 0
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={selected ? "true" : undefined}
      className={cn(
        "flex w-full cursor-pointer items-center gap-2 py-1.5 pr-2.5 pl-3.5 text-left",
        "duration-fast transition-colors hover:bg-element-hover",
        "aria-[current=true]:bg-element-selected"
      )}
    >
      {/* A fixed slot, so hashes, group glyphs and faces line up. */}
      <span className="flex w-5 shrink-0 items-center justify-center">
        {icon}
      </span>
      <span
        className={cn(
          "min-w-0 flex-1 truncate text-xs",
          hot || selected
            ? "font-medium text-foreground"
            : "text-secondary-foreground"
        )}
      >
        {label}
      </span>
      {trailing}
      {hot && (
        <span
          className={cn(
            "flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-3xs font-semibold tnum",
            mentions > 0
              ? "bg-destructive text-destructive-foreground"
              : "border border-border bg-card text-foreground"
          )}
        >
          {mentions > 0
            ? mentions > 9
              ? "9+"
              : mentions
            : unread > 99
              ? "99+"
              : unread}
        </span>
      )}
    </button>
  )
}

export { ConversationList }
