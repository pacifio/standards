import { useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import {
  ArchiveIcon,
  AtSignIcon,
  CheckCheckIcon,
  InboxIcon,
  MessageSquareIcon,
  ReplyIcon,
  SlidersHorizontalIcon,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { cn } from "cn"

import { NOTIFICATIONS } from "@/mock/data"
import type { NotificationKind } from "@/mock/types"
import { SegmentedPills } from "@/components/patterns/segmented"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { Icon } from "@/components/ui/icon"
import { IconButton } from "@/components/ui/icon-button"
import {
  ResizableGroup,
  ResizableHandle,
  ResizablePanel,
} from "@/components/ui/resizable"
import { ScrollFade } from "@/components/ui/scroll-fade"
import { Tag } from "@/components/ui/tag"
import { Textarea } from "@/components/ui/textarea"
import { hueFor } from "@/lib/hue"
import { PersonAvatar } from "@/components/patterns/person-avatar"

export const Route = createFileRoute("/mock/_app/inbox")({
  component: InboxScreen,
})

type Filter = "all" | "unread" | "mentions"

const KIND_ICON: Record<NotificationKind, LucideIcon> = {
  artifact_mention: AtSignIcon,
  artifact_reply: ReplyIcon,
  artifact_session_comment: MessageSquareIcon,
}

const KIND_LABEL: Record<NotificationKind, string> = {
  artifact_mention: "Mentioned you",
  artifact_reply: "Replied",
  artifact_session_comment: "Commented",
}

/**
 * The Inbox.
 *
 * Two resizable panes under the topbar, split by a hairline handle: the
 * list, and the one you are reading. The unread mark is a 6px foreground
 * dot in a fixed gutter — monochrome, like everything that is not a status
 * — so a read and an unread row are the same height and the list does not
 * shift as you work through it.
 */
function InboxScreen() {
  const [filter, setFilter] = useState<Filter>("all")
  const [selectedId, setSelectedId] = useState(NOTIFICATIONS[0]?.id)
  const selected = NOTIFICATIONS.find((n) => n.id === selectedId)
  const unread = NOTIFICATIONS.filter((n) => !n.read).length

  const visible = NOTIFICATIONS.filter((n) => {
    if (filter === "unread") return !n.read
    if (filter === "mentions") return n.kind === "artifact_mention"
    return true
  })

  return (
    <>
      <ResizableGroup orientation="horizontal" className="min-h-0 flex-1">
        <ResizablePanel defaultSize="38%" minSize="28%" maxSize="55%">
          <div className="flex h-full flex-col">
            <div className="flex h-11 shrink-0 items-center gap-1 border-b border-hairline px-3">
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
              <div className="ml-auto flex items-center gap-0.5">
                <IconButton
                  icon={CheckCheckIcon}
                  label="Mark all as read"
                  size="sm"
                />
                <IconButton
                  icon={SlidersHorizontalIcon}
                  label="Display options"
                  size="sm"
                />
              </div>
            </div>
            <ScrollFade className="min-h-0 flex-1">
              {visible.length === 0 ? (
                <EmptyState
                  icon={InboxIcon}
                  title="Nothing here"
                  description="You are caught up."
                  className="py-16"
                />
              ) : (
                visible.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => setSelectedId(n.id)}
                    aria-current={n.id === selectedId ? "true" : undefined}
                    className={cn(
                      "flex w-full items-start gap-2.5 border-b border-hairline px-3 py-2.5 text-left",
                      "duration-fast transition-colors ease-out-strong",
                      "hover:bg-element-hover",
                      "aria-[current=true]:bg-element-selected"
                    )}
                  >
                    {/* Fixed gutter: read and unread rows stay the same width. */}
                    <span className="flex w-1.5 shrink-0 justify-center pt-1.5">
                      {!n.read && (
                        <span
                          aria-label="Unread"
                          className="size-1.5 rounded-full bg-foreground"
                        />
                      )}
                    </span>
                    <PersonAvatar
                      size="sm"
                      className="mt-px"
                      name={n.actor}
                      initials={n.actorInitials}
                    />
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span
                        className={cn(
                          "truncate text-xs",
                          n.read
                            ? "text-secondary-foreground"
                            : "font-medium text-foreground"
                        )}
                      >
                        <span className="mono text-2xs text-muted-foreground">
                          {n.sessionRef}
                        </span>{" "}
                        {n.title}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Icon
                          icon={KIND_ICON[n.kind]}
                          size="xs"
                          className="shrink-0 text-muted-foreground"
                        />
                        <span className="truncate caption">{n.preview}</span>
                      </span>
                    </span>
                    <span className="shrink-0 pt-0.5 caption tnum">{n.at}</span>
                  </button>
                ))
              )}
            </ScrollFade>
          </div>
        </ResizablePanel>

        <ResizableHandle className="bg-hairline" />

        <ResizablePanel>
          {selected ? (
            <div className="flex h-full flex-col">
              <ScrollFade className="min-h-0 flex-1">
                <div className="mx-auto flex max-w-2xl flex-col gap-5 px-6 py-5">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Tag hue={hueFor(selected.project)} dot>
                        {selected.project}
                      </Tag>
                      <span className="mono text-2xs text-muted-foreground">
                        {selected.sessionRef}
                      </span>
                      <div className="ml-auto flex items-center gap-1">
                        <IconButton
                          icon={ArchiveIcon}
                          label="Archive"
                          size="sm"
                        />
                        <IconButton
                          icon={CheckCheckIcon}
                          label="Mark as read"
                          size="sm"
                        />
                      </div>
                    </div>
                    <h2 className="text-md font-medium tracking-tight text-balance">
                      {selected.title}
                    </h2>
                  </div>

                  <div className="flex gap-2.5 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
                    <PersonAvatar
                      size="md"
                      name={selected.actor}
                      initials={selected.actorInitials}
                    />
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <p className="flex items-baseline gap-2">
                        <span className="text-xs font-medium">
                          {selected.actor}
                        </span>
                        <span className="caption">
                          {KIND_LABEL[selected.kind]} · {selected.at} ago
                        </span>
                      </p>
                      <p className="text-xs text-balance text-secondary-foreground">
                        {selected.preview}
                      </p>
                    </div>
                  </div>
                </div>
              </ScrollFade>

              {/* The reply composer: the same ringed card the thread uses,
                  pinned to the bottom so the reply is beside the thing it
                  answers. */}
              <div className="shrink-0 border-t border-hairline p-3">
                <div className="mx-auto flex max-w-2xl flex-col gap-2 rounded-xl bg-card p-2 ring-1 ring-foreground/10 focus-within:ring-foreground/25">
                  <Textarea
                    rows={2}
                    placeholder={`Reply to ${selected.actor}`}
                    className="resize-none border-0 bg-transparent px-1.5 shadow-none ring-0 focus-visible:ring-0"
                  />
                  <div className="flex items-center justify-end gap-1.5">
                    <Button variant="ghost" size="xs">
                      Open session
                    </Button>
                    <Button variant="default" size="xs">
                      Reply
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <EmptyState
              icon={InboxIcon}
              title="Nothing selected"
              description="Pick a notification to read it here."
              className="h-full"
            />
          )}
        </ResizablePanel>
      </ResizableGroup>
    </>
  )
}
