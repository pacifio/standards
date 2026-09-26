import { useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import {
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
import { AppShell } from "@/components/shell/app-shell"
import { Crumb, TopBar } from "@/components/shell/top-bar"
import {
  DetailPane,
  ListDetail,
  ListPane,
} from "@/components/shell/list-detail"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/ui/empty-state"
import { Icon } from "@/components/ui/icon"
import { IconButton } from "@/components/ui/icon-button"
import { Separator } from "@/components/ui/separator"

export const Route = createFileRoute("/mock/inbox")({ component: InboxScreen })

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
 * Today this route exists but is unreachable from the app chrome — it is only
 * linked from a button on /timeline. Here it is the first item in the rail,
 * which is what an inbox is for.
 *
 * Three panes: rail, notification list, read pane. The unread dot is a 6px
 * mark in a fixed gutter rather than a bold title, so a read and an unread row
 * are the same height and the list does not shift as you work through it.
 */
function InboxScreen() {
  const [selectedId, setSelectedId] = useState(NOTIFICATIONS[0]?.id)
  const selected = NOTIFICATIONS.find((n) => n.id === selectedId)
  const unread = NOTIFICATIONS.filter((n) => !n.read).length

  return (
    <AppShell>
      <TopBar
        actions={
          <>
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
          </>
        }
      >
        <Icon icon={InboxIcon} size="sm" className="text-muted-foreground" />
        <Crumb current>Inbox</Crumb>
        {unread > 0 && (
          <span className="text-2xs text-muted-foreground tnum">{unread}</span>
        )}
      </TopBar>

      <ListDetail>
        <ListPane className="overflow-y-auto">
          {NOTIFICATIONS.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => setSelectedId(n.id)}
              aria-current={n.id === selectedId ? "true" : undefined}
              className={cn(
                "flex w-full items-start gap-2.5 border-b border-border-subtle px-3 py-2.5 text-left",
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
                    className="size-1.5 rounded-full bg-info"
                  />
                )}
              </span>
              <Avatar size="sm" className="mt-px">
                <AvatarFallback>{n.actorInitials}</AvatarFallback>
              </Avatar>
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="flex items-baseline gap-1.5">
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
                </span>
                <span className="flex items-center gap-1.5">
                  <Icon
                    icon={KIND_ICON[n.kind]}
                    size="xs"
                    className="text-muted-foreground"
                  />
                  <span className="truncate caption">{n.preview}</span>
                </span>
              </span>
              <span className="shrink-0 pt-0.5 caption tnum">{n.at}</span>
            </button>
          ))}
        </ListPane>

        <DetailPane>
          {selected ? (
            <div className="flex flex-col overflow-y-auto">
              <div className="flex flex-col gap-3 p-5">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{selected.project}</Badge>
                  <span className="mono text-2xs text-muted-foreground">
                    {selected.sessionRef}
                  </span>
                </div>
                <h2 className="text-md font-semibold tracking-tight text-balance">
                  {selected.title}
                </h2>
              </div>

              <Separator />

              <div className="flex gap-2.5 p-5">
                <Avatar size="md">
                  <AvatarFallback>{selected.actorInitials}</AvatarFallback>
                </Avatar>
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
          ) : (
            <EmptyState
              icon={InboxIcon}
              title="Nothing selected"
              description="Pick a notification to read it here."
              className="flex-1"
            />
          )}
        </DetailPane>
      </ListDetail>
    </AppShell>
  )
}
