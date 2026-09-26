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
import { Crumb, TopBar } from "@/components/shell/top-bar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Icon } from "@/components/ui/icon"
import { IconButton } from "@/components/ui/icon-button"
import { ScrollFade } from "@/components/ui/scroll-fade"
import { Textarea } from "@/components/ui/textarea"

export const Route = createFileRoute("/mock/_app/chat")({
  component: ChatScreen,
})

/**
 * Chat.
 *
 * A narrow conversation rail on the surface tone, a hairline, then the
 * thread. Messages are left-aligned for everyone including you: right-
 * aligning your own is an SMS convention that halves the usable width.
 *
 * The composer is the same ringed card as every other input well in the
 * app, so a thread and its reply box read as one object.
 */
function ChatScreen() {
  const [selectedId, setSelectedId] = useState(CONVERSATIONS[0].id)
  const selected = CONVERSATIONS.find((c) => c.id === selectedId)!
  const pinned = MESSAGES.filter((m) => m.pinned)

  return (
    <>
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

      <div className="flex min-h-0 flex-1">
        <ScrollFade className="w-60 shrink-0 border-r border-hairline bg-surface">
          <div className="flex flex-col gap-px p-1.5">
            <span className="px-2 pt-1.5 pb-1 micro">Conversations</span>
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
                  <span className="flex size-5 items-center justify-center rounded-md bg-muted text-muted-foreground">
                    <Icon icon={HashIcon} size="xs" />
                  </span>
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
                  <span className="shrink-0 rounded-full bg-primary px-1.5 text-3xs font-medium text-primary-foreground tnum">
                    {c.unread}
                  </span>
                )}
              </button>
            ))}
          </div>
        </ScrollFade>

        <div className="flex min-w-0 flex-1 flex-col">
          {pinned.length > 0 && (
            <div className="flex h-8 shrink-0 items-center gap-2 border-b border-hairline px-4">
              <Icon
                icon={PinIcon}
                size="xs"
                className="text-muted-foreground"
              />
              <span className="truncate caption">{pinned[0].body}</span>
            </div>
          )}

          <ScrollFade className="min-h-0 flex-1">
            <div className="flex flex-col gap-4 px-5 py-4">
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
                      // A session pulled into the thread. A ringed card
                      // rather than a link, so the reference survives being
                      // skimmed.
                      <a
                        href="#"
                        className="duration-fast mt-0.5 flex w-fit max-w-full items-center gap-2 rounded-lg bg-card px-2.5 py-1.5 ring-1 ring-foreground/10 transition-colors hover:bg-element-hover"
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
          </ScrollFade>

          <div className="shrink-0 border-t border-hairline p-3">
            <div className="flex items-end gap-1 rounded-xl bg-card p-1.5 ring-1 ring-foreground/10 focus-within:ring-foreground/25">
              <div className="min-w-0 flex-1">
                <Textarea
                  rows={1}
                  placeholder={`Message ${selected.name}`}
                  className="max-h-32 min-h-7 resize-none border-0 bg-transparent px-1.5 py-1.5 shadow-none ring-0 focus-visible:ring-0"
                />
              </div>
              <IconButton
                icon={PaperclipIcon}
                label="Attach a file"
                size="sm"
              />
              <IconButton
                icon={SendIcon}
                label="Send"
                size="sm"
                variant="default"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
