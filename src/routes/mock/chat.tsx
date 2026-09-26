import { useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import {
  HashIcon,
  MessageSquareIcon,
  PaperclipIcon,
  PhoneIcon,
  PinIcon,
  SendIcon,
  UsersIcon,
} from "lucide-react"
import { cn } from "cn"

import { CONVERSATIONS, MESSAGES } from "@/mock/data"
import { AppShell } from "@/components/shell/app-shell"
import { Crumb, TopBar } from "@/components/shell/top-bar"
import {
  DetailPane,
  ListDetail,
  ListPane,
} from "@/components/shell/list-detail"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Icon } from "@/components/ui/icon"
import { IconButton } from "@/components/ui/icon-button"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"

export const Route = createFileRoute("/mock/chat")({ component: ChatScreen })

/**
 * Chat.
 *
 * Same three-pane shape as Inbox and Timeline, which is the point — the
 * current app gives this route its own `grid lg:grid-cols-[16rem_1fr]` and its
 * own org `<select>` in the header, so it reads as a different product.
 *
 * Messages are left-aligned for everyone including you. Right-aligning your
 * own messages is an SMS convention; in a work thread it halves the usable
 * width and makes a conversation harder to skim than it needs to be.
 */
function ChatScreen() {
  const [selectedId, setSelectedId] = useState(CONVERSATIONS[0].id)
  const selected = CONVERSATIONS.find((c) => c.id === selectedId)!
  const pinned = MESSAGES.filter((m) => m.pinned)

  return (
    <AppShell>
      <TopBar
        actions={
          <>
            <IconButton icon={PinIcon} label="Pinned messages" size="sm" />
            <IconButton icon={PhoneIcon} label="Start a call" size="sm" />
            <IconButton icon={UsersIcon} label="Members" size="sm" />
          </>
        }
      >
        <Icon
          icon={selected.kind === "channel" ? HashIcon : MessageSquareIcon}
          size="sm"
          className="text-muted-foreground"
        />
        <Crumb current>{selected.name}</Crumb>
      </TopBar>

      <ListDetail>
        <ListPane className="w-64 overflow-y-auto p-1.5">
          {CONVERSATIONS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelectedId(c.id)}
              aria-current={c.id === selectedId ? "true" : undefined}
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left",
                "duration-fast transition-colors ease-out-strong",
                "hover:bg-element-hover aria-[current=true]:bg-element-selected"
              )}
            >
              {c.kind === "channel" ? (
                <Icon
                  icon={HashIcon}
                  size="sm"
                  className="text-muted-foreground"
                />
              ) : (
                <Avatar size="xs">
                  <AvatarFallback>{c.initials}</AvatarFallback>
                </Avatar>
              )}
              <span className="flex min-w-0 flex-1 flex-col">
                <span
                  className={cn(
                    "truncate text-xs",
                    c.unread > 0
                      ? "font-medium text-foreground"
                      : "text-secondary-foreground"
                  )}
                >
                  {c.name}
                </span>
                <span className="truncate caption">{c.lastMessage}</span>
              </span>
              {c.unread > 0 && (
                <span className="shrink-0 rounded-full bg-element-emphasis px-1.5 text-3xs font-semibold tnum">
                  {c.unread}
                </span>
              )}
            </button>
          ))}
        </ListPane>

        <DetailPane>
          {pinned.length > 0 && (
            <div className="flex shrink-0 items-center gap-2 border-b border-border-subtle bg-card px-4 py-1.5">
              <Icon
                icon={PinIcon}
                size="xs"
                className="text-muted-foreground"
              />
              <span className="truncate caption">{pinned[0].body}</span>
            </div>
          )}

          <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
            {MESSAGES.map((m) => (
              <div key={m.id} className="flex gap-2.5">
                <Avatar size="md" className="mt-px">
                  <AvatarFallback>{m.authorInitials}</AvatarFallback>
                </Avatar>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <p className="flex items-baseline gap-2">
                    <span className="text-xs font-medium">{m.author}</span>
                    <span className="caption tnum">{m.at}</span>
                  </p>
                  <p className="text-xs text-balance text-secondary-foreground">
                    {m.body}
                  </p>
                  {m.artifactRef && (
                    // A session pulled into the thread. Bordered card rather
                    // than a link, so the reference survives being skimmed.
                    <a
                      href="#"
                      className="duration-fast mt-0.5 flex w-fit max-w-full items-center gap-2 rounded-md border border-border bg-card px-2 py-1.5 transition-colors hover:bg-element-hover"
                    >
                      <span className="shrink-0 mono text-2xs text-muted-foreground">
                        {m.artifactRef.ref}
                      </span>
                      <span className="truncate text-xs">
                        {m.artifactRef.title}
                      </span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          <Separator />

          <div className="flex shrink-0 items-end gap-2 p-3">
            {/*
              Textarea is w-full, so it needs a flex-1 min-w-0 parent or it
              claims the whole row and pushes the send button off the edge.
            */}
            <div className="min-w-0 flex-1">
              <Textarea
                rows={1}
                placeholder={`Message ${selected.name}`}
                className="min-h-control-lg max-h-32 resize-none"
              />
            </div>
            <IconButton icon={PaperclipIcon} label="Attach a file" size="sm" />
            <IconButton
              icon={SendIcon}
              label="Send"
              size="sm"
              variant="default"
            />
          </div>
        </DetailPane>
      </ListDetail>
    </AppShell>
  )
}
