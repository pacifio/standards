"use client"

import { useState } from "react"
import { Link } from "@tanstack/react-router"
import {
  ArrowLeftIcon,
  ChevronRightIcon,
  FilePlus2Icon,
  FolderPlusIcon,
  Trash2Icon,
} from "lucide-react"
import { cn } from "cn"

import { ago } from "@/mock/time"
import type { SpacePage } from "@/mock/spaces"
import { Hint } from "@/components/spaces/space-chrome"
import { Icon } from "@/components/ui/icon"
import { IconButton } from "@/components/ui/icon-button"

/**
 * The pages column — the desktop app's quiet header (a label and two round
 * buttons, no divider under it) over rows in the drafts-list shape: the
 * name over when it last changed.
 *
 * Always the left column; the tool dock is the movable one. Above it, the
 * way back to the conversation this Space belongs to, because a Space is a
 * room off a chat, not a document of its own.
 *
 * Folders are rows too, flat for now: they collapse, but nothing is filed
 * into them yet. Double-click a name to rename it.
 */
function SpacePages({
  pages,
  activeId,
  onOpen,
  onCreate,
  onDelete,
  onRename,
  conversation,
}: {
  pages: ReadonlyArray<SpacePage>
  activeId: string
  onOpen: (id: string) => void
  onCreate: (kind: SpacePage["kind"]) => void
  onDelete: (id: string) => void
  onRename: (id: string, name: string) => void
  /** Where the back link goes, and how it is written there. */
  conversation: { id: string; label: string }
}) {
  const [renaming, setRenaming] = useState<string | null>(null)
  const [collapsed, setCollapsed] = useState<ReadonlySet<string>>(new Set())
  const pageCount = pages.filter((p) => p.kind === "page").length

  const toggle = (id: string) =>
    setCollapsed((cur) => {
      const next = new Set(cur)
      if (!next.delete(id)) next.add(id)
      return next
    })

  return (
    <div className="flex w-64 shrink-0 flex-col border-r border-hairline bg-surface">
      <Link
        to="/mock/chat"
        search={{ c: conversation.id }}
        className="flex h-9 shrink-0 items-center gap-1.5 border-b border-hairline px-3 text-xs font-medium text-secondary-foreground transition-colors hover:text-foreground"
      >
        <Icon
          icon={ArrowLeftIcon}
          size="xs"
          className="text-muted-foreground"
        />
        <span className="truncate">{conversation.label}</span>
      </Link>

      <div className="flex h-8 shrink-0 items-center gap-1 pr-2 pl-3">
        <span className="flex-1 micro">Pages</span>
        <RoundButton
          icon={FilePlus2Icon}
          label="New page"
          onClick={() => onCreate("page")}
        />
        <RoundButton
          icon={FolderPlusIcon}
          label="New folder"
          onClick={() => onCreate("folder")}
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-px overflow-y-auto px-1.5 py-1">
        {pages.map((page) => {
          const folder = page.kind === "folder"
          const active = page.id === activeId
          const last = !folder && pageCount <= 1
          return (
            <div
              key={page.id}
              role="button"
              tabIndex={0}
              aria-current={active ? "page" : undefined}
              onClick={() => (folder ? toggle(page.id) : onOpen(page.id))}
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.target === e.currentTarget)
                  folder ? toggle(page.id) : onOpen(page.id)
              }}
              className={cn(
                "group/row flex cursor-default items-center gap-2 rounded-md py-1.5 pr-1.5 pl-2 outline-none",
                "focus-visible:ring-2 focus-visible:ring-ring",
                active
                  ? "bg-element-selected text-foreground"
                  : "text-secondary-foreground hover:bg-element-hover"
              )}
            >
              {folder && (
                <Icon
                  icon={ChevronRightIcon}
                  size="xs"
                  className={cn(
                    "text-muted-foreground transition-transform",
                    !collapsed.has(page.id) && "rotate-90"
                  )}
                />
              )}
              <div className="min-w-0 flex-1">
                {renaming === page.id ? (
                  <input
                    autoFocus
                    defaultValue={page.name}
                    aria-label="Page name"
                    onClick={(e) => e.stopPropagation()}
                    onBlur={(e) => {
                      const name = e.target.value.trim()
                      setRenaming(null)
                      if (name && name !== page.name) onRename(page.id, name)
                    }}
                    onKeyDown={(e) => {
                      e.stopPropagation()
                      if (e.key === "Enter") e.currentTarget.blur()
                      if (e.key === "Escape") setRenaming(null)
                    }}
                    className="w-full min-w-0 rounded-sm bg-background px-1 text-xs font-medium text-foreground ring-1 ring-border outline-none"
                  />
                ) : (
                  <span
                    className="block truncate text-xs font-medium"
                    onDoubleClick={(e) => {
                      e.stopPropagation()
                      setRenaming(page.id)
                    }}
                  >
                    {page.name}
                  </span>
                )}
                {!folder && (
                  <span className="block truncate text-3xs text-muted-foreground">
                    Updated {ago(page.updatedAt)}
                  </span>
                )}
              </div>
              {!last && (
                <Hint
                  side="right"
                  label={
                    folder
                      ? `Delete folder “${page.name}”`
                      : `Delete “${page.name}”`
                  }
                >
                  <IconButton
                    icon={Trash2Icon}
                    label={`Delete ${page.name}`}
                    size="xs"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete(page.id)
                    }}
                    className={cn(
                      "rounded-full border border-border text-muted-foreground hover:text-error",
                      "opacity-0 group-hover/row:opacity-100 focus-visible:opacity-100"
                    )}
                  />
                </Hint>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/** The header's compact round buttons: 20px, a hairline ring, one glyph. */
function RoundButton({
  icon,
  label,
  onClick,
}: {
  icon: typeof FilePlus2Icon
  label: string
  onClick: () => void
}) {
  return (
    <Hint label={label}>
      <IconButton
        icon={icon}
        label={label}
        size="xs"
        onClick={onClick}
        className="rounded-full border border-border"
      />
    </Hint>
  )
}

export { SpacePages }
