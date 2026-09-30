"use client"

import { useState } from "react"
import { CheckIcon, HashIcon, PlusIcon, SearchIcon } from "lucide-react"
import { cn } from "cn"

import { MEMBERS } from "@/mock/data"
import { SELF_ID } from "@/mock/chat"
import { Icon } from "@/components/ui/icon"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ChatAvatar } from "./chat-avatar"

/**
 * The two "+" menus on the conversation list's section headers: start a
 * message with one or more people, and create a channel. Both are the same
 * object as a menu — a popover with an input row, a body, and one primary
 * action pinned to the bottom — and both reset every time they open.
 */

/** Up to nine others in one conversation; more picks are ignored. */
const MAX_OTHERS = 9

const POPUP =
  "w-64 gap-0 overflow-hidden rounded-xl bg-popover/95 p-0 backdrop-blur-2xl"

function PlusTrigger({ label }: { label: string }) {
  return (
    <PopoverTrigger
      aria-label={label}
      className="duration-fast ml-auto flex size-4 cursor-pointer items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-element-hover hover:text-foreground"
    >
      <Icon icon={PlusIcon} size="xs" />
    </PopoverTrigger>
  )
}

/** The footer action: full width, quiet until there is something to do. */
function Submit({
  disabled,
  onClick,
  children,
}: {
  disabled: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <div className="border-t border-hairline p-2">
      <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        className="duration-fast h-7 w-full cursor-pointer rounded-md bg-element-selected text-xs font-medium transition-colors hover:bg-element-hover disabled:cursor-not-allowed disabled:opacity-45"
      >
        {children}
      </button>
    </div>
  )
}

/**
 * Message people. One pick opens (or reuses) a DM; two or more start a
 * group. Picks are marked with a check on the row, not chips — the list is
 * short enough that the selection stays in view.
 */
function NewDmMenu({ onCreate }: { onCreate: (ids: Array<string>) => void }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [picked, setPicked] = useState<Array<string>>([])

  const people = MEMBERS.filter(
    (m) => m.id !== SELF_ID && m.status === "active"
  ).filter((m) =>
    `${m.name} ${m.email}`.toLowerCase().includes(query.trim().toLowerCase())
  )

  function toggle(id: string) {
    setPicked((p) =>
      p.includes(id)
        ? p.filter((x) => x !== id)
        : p.length >= MAX_OTHERS
          ? p
          : [...p, id]
    )
  }

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (next) {
          setQuery("")
          setPicked([])
        }
      }}
    >
      <PlusTrigger label="New message" />
      <PopoverContent align="end" sideOffset={6} className={POPUP}>
        <label className="flex h-8 items-center gap-2 border-b border-hairline px-3">
          <Icon icon={SearchIcon} size="xs" className="text-disabled" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search people…"
            className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-disabled"
          />
        </label>
        <ul className="max-h-72 overflow-y-auto py-1">
          {people.length === 0 && (
            <li className="px-3 py-4 text-center text-2xs text-muted-foreground">
              No one matches.
            </li>
          )}
          {people.map((m) => {
            const on = picked.includes(m.id)
            return (
              <li key={m.id}>
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggle(m.id)}
                  className="duration-fast flex w-full cursor-pointer items-center gap-2 px-3 py-1.5 text-left transition-colors hover:bg-element-hover"
                >
                  <ChatAvatar id={m.id} ring="ring-popover" />
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-xs">{m.name}</span>
                    <span className="truncate text-3xs text-disabled">
                      {m.email}
                    </span>
                  </span>
                  <Icon
                    icon={CheckIcon}
                    size="sm"
                    className={cn(
                      "duration-fast transition-opacity",
                      on ? "opacity-100" : "opacity-0"
                    )}
                  />
                </button>
              </li>
            )
          })}
        </ul>
        <Submit
          disabled={picked.length === 0}
          onClick={() => {
            onCreate(picked)
            setOpen(false)
          }}
        >
          {picked.length > 1 ? `Message ${picked.length} people` : "Message"}
        </Submit>
      </PopoverContent>
    </Popover>
  )
}

/**
 * Create a channel. Names are slugged as you type (lowercase, dashes), so
 * what you see is the channel's real name; Private makes it invite-only.
 */
function CreateChannelMenu({
  onCreate,
}: {
  onCreate: (name: string, isPrivate: boolean) => void
}) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [priv, setPriv] = useState(false)

  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+/, "")
  const valid = slug.replace(/-+$/, "").length > 0

  function submit() {
    if (!valid) return
    onCreate(slug.replace(/-+$/, ""), priv)
    setOpen(false)
  }

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (next) {
          setName("")
          setPriv(false)
        }
      }}
    >
      <PlusTrigger label="Create channel" />
      <PopoverContent align="end" sideOffset={6} className={POPUP}>
        <label className="flex h-9 items-center gap-2 border-b border-hairline px-3">
          <Icon icon={HashIcon} size="xs" className="text-disabled" />
          <input
            autoFocus
            value={slug}
            maxLength={80}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="new-channel"
            aria-label="Channel name"
            className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-disabled"
          />
        </label>
        <button
          type="button"
          role="checkbox"
          aria-checked={priv}
          onClick={() => setPriv((v) => !v)}
          className="duration-fast flex w-full cursor-pointer items-center gap-2 border-b border-hairline px-3 py-2 text-left text-xs transition-colors hover:bg-element-hover"
        >
          <span
            className={cn(
              "flex size-3.5 items-center justify-center rounded-sm border",
              priv
                ? "border-border-strong bg-element-selected text-foreground"
                : "border-border text-transparent"
            )}
          >
            <Icon icon={CheckIcon} size="xs" />
          </span>
          Private
          <span className="ml-auto text-3xs text-disabled">invite-only</span>
        </button>
        <Submit disabled={!valid} onClick={submit}>
          Create channel
        </Submit>
      </PopoverContent>
    </Popover>
  )
}

export { CreateChannelMenu, NewDmMenu }
