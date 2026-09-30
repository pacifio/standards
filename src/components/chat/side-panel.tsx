"use client"

import { useState } from "react"
import { Link } from "@tanstack/react-router"
import { motion } from "motion/react"
import {
  FilePlus2Icon,
  FileTextIcon,
  FolderIcon,
  FrameIcon,
  ImageIcon,
  MusicIcon,
  PlusIcon,
  XIcon,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { cn } from "cn"

import { SELF_ID, formatBytes } from "@/mock/chat"
import type { ChatConversation, ChatFile, PromptDraft } from "@/mock/chat"
import { MOCK_NOW, ago, shortDate } from "@/mock/time"
import { SPRING_INDICATOR } from "@/lib/motion"
import { DockSizeToggle } from "@/components/shell/app-shell"
import { EmptyState } from "@/components/ui/empty-state"
import { Icon } from "@/components/ui/icon"
import { IconButton } from "@/components/ui/icon-button"
import { ChatAvatar, firstName, member } from "./chat-avatar"
import { DraftEditor } from "./draft-editor"

/**
 * The chat's third panel: what the conversation has made, beside what it
 * has said. Drafts — prompts the conversation writes together before one is
 * sent to an agent — and the files it has collected. Spaces, the
 * conversation's canvas, is a whole page and opens as one.
 *
 * A draft opens in place: the list gives way to the editor, and the panel's
 * size toggle lets it take half the screen while you write.
 */

type Tab = "drafts" | "files"

function SidePanel({
  conversation,
  drafts,
  files,
  onCreateDraft,
  onClose,
}: {
  conversation: ChatConversation
  drafts: Array<PromptDraft>
  files: Array<ChatFile>
  onCreateDraft: (title: string) => PromptDraft
  onClose: () => void
}) {
  const [openId, setOpenId] = useState<string | null>(null)
  const open = drafts.find((d) => d.id === openId)

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PanelHeader onClose={onClose} />
      {open ? (
        <DraftEditor
          draft={open}
          convName={conversation.name}
          onBack={() => setOpenId(null)}
        />
      ) : (
        <Tabs
          conversation={conversation}
          drafts={drafts}
          files={files}
          onOpen={setOpenId}
          onCreateDraft={onCreateDraft}
        />
      )}
    </div>
  )
}

/**
 * The panel's own bar, above whatever it shows: its name, how much room it
 * takes — the same size control as the timeline's session panel — and a
 * way to put it away.
 */
function PanelHeader({ onClose }: { onClose: () => void }) {
  return (
    <header className="flex h-11 shrink-0 items-center gap-1 border-b border-hairline pr-2 pl-3.5">
      <h2 className="text-xs font-medium">Assets</h2>
      <DockSizeToggle className="ml-auto" />
      <IconButton
        icon={XIcon}
        label="Close assets"
        size="sm"
        onClick={onClose}
      />
    </header>
  )
}

function Tabs({
  conversation,
  drafts,
  files,
  onOpen,
  onCreateDraft,
}: {
  conversation: ChatConversation
  drafts: Array<PromptDraft>
  files: Array<ChatFile>
  onOpen: (id: string) => void
  onCreateDraft: (title: string) => PromptDraft
}) {
  const [tab, setTab] = useState<Tab>("drafts")
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex h-11 shrink-0 items-center gap-0.5 border-b border-hairline px-2">
        <TabButton
          icon={FileTextIcon}
          label="Drafts"
          count={drafts.length}
          active={tab === "drafts"}
          onClick={() => setTab("drafts")}
        />
        <TabButton
          icon={FolderIcon}
          label="Files"
          count={files.length}
          active={tab === "files"}
          onClick={() => setTab("files")}
        />
        <Link
          to="/mock/spaces"
          search={{ c: conversation.id }}
          className="duration-fast mr-1 ml-auto flex h-6 items-center gap-1.5 rounded-full border border-border bg-element-selected px-2.5 text-2xs font-medium text-secondary-foreground transition-colors hover:text-foreground"
        >
          <Icon icon={FrameIcon} size="xs" />
          Spaces
        </Link>
      </header>

      {tab === "drafts" ? (
        <Drafts
          drafts={drafts}
          onOpen={onOpen}
          onCreate={(title) => onOpen(onCreateDraft(title).id)}
        />
      ) : (
        <Files files={files} />
      )}
    </div>
  )
}

function TabButton({
  icon,
  label,
  count,
  active,
  onClick,
}: {
  icon: LucideIcon
  label: string
  count: number
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "duration-fast relative flex h-full cursor-pointer items-center gap-1.5 px-2.5 text-xs font-medium transition-colors",
        active
          ? "text-foreground"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      <Icon icon={icon} size="xs" />
      {label}
      <span className="text-3xs text-disabled tnum">{count}</span>
      {active && (
        <motion.span
          layoutId="side-panel-tab"
          transition={SPRING_INDICATOR}
          className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-foreground"
        />
      )}
    </button>
  )
}

function Drafts({
  drafts,
  onOpen,
  onCreate,
}: {
  drafts: Array<PromptDraft>
  onOpen: (id: string) => void
  onCreate: (title: string) => void
}) {
  const [title, setTitle] = useState("")
  const create = () => {
    const t = title.trim()
    if (!t) return
    onCreate(t)
    setTitle("")
  }
  const sorted = [...drafts].sort(
    (a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt)
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <label className="flex h-9 shrink-0 items-center gap-2 border-b border-hairline px-3">
        <Icon icon={FilePlus2Icon} size="xs" className="text-disabled" />
        <input
          value={title}
          maxLength={200}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && create()}
          placeholder="Name a new draft…"
          className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-disabled"
        />
        <button
          type="button"
          aria-label="Create draft"
          disabled={!title.trim()}
          onClick={create}
          className="flex size-5 cursor-pointer items-center justify-center rounded-sm text-muted-foreground hover:bg-element-hover hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Icon icon={PlusIcon} size="xs" />
        </button>
      </label>

      {sorted.length === 0 ? (
        <EmptyState
          icon={FileTextIcon}
          title="No drafts yet"
          description="Name one above and write it together before it goes to an agent."
          className="flex-1"
        />
      ) : (
        <ul className="min-h-0 flex-1 overflow-y-auto">
          {sorted.map((d) => {
            const by = member(d.createdBy)
            return (
              <li key={d.id}>
                <button
                  type="button"
                  onClick={() => onOpen(d.id)}
                  className="duration-fast flex w-full cursor-pointer items-center gap-2 border-b border-hairline px-3 py-2.5 text-left transition-colors hover:bg-element-hover"
                >
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="truncate text-xs font-medium">
                      {d.title}
                    </span>
                    <span className="text-3xs text-disabled">
                      Updated {ago(d.updatedAt)}
                    </span>
                  </span>
                  <span className="flex max-w-20 shrink-0 items-center gap-1.5 text-3xs text-muted-foreground">
                    <ChatAvatar id={d.createdBy} presence={false} />
                    <span className="truncate">
                      {d.createdBy === SELF_ID ? "You" : firstName(by.name)}
                    </span>
                  </span>
                  <span className="w-12 shrink-0 text-right text-3xs text-muted-foreground tnum">
                    {shortDate(d.createdAt)}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

const FILE_ICON: Record<ChatFile["kind"], LucideIcon> = {
  image: ImageIcon,
  audio: MusicIcon,
  file: FileTextIcon,
}

function Files({ files }: { files: Array<ChatFile> }) {
  if (files.length === 0) {
    return (
      <EmptyState
        icon={FolderIcon}
        title="No files yet"
        description="Anything shared in this conversation collects here."
        className="flex-1"
      />
    )
  }
  const media = files.filter((f) => f.kind === "image")
  const rest = files.filter((f) => f.kind !== "image")
  return (
    <div className="min-h-0 flex-1 overflow-y-auto p-3">
      {media.length > 0 && (
        <section>
          <h3 className="mb-2 text-2xs font-medium text-secondary-foreground">
            Media
          </h3>
          <ul className="grid grid-cols-3 gap-1.5">
            {media.map((f) => (
              <li
                key={f.id}
                title={f.name}
                className="relative flex aspect-square items-center justify-center overflow-hidden rounded-md border border-border bg-surface"
              >
                <span
                  aria-hidden="true"
                  className="absolute inset-0 bg-linear-to-br from-foreground/6 to-transparent"
                />
                <Icon icon={ImageIcon} size="md" className="text-disabled" />
              </li>
            ))}
          </ul>
        </section>
      )}
      {rest.length > 0 && (
        <section className={cn(media.length > 0 && "mt-4")}>
          <h3 className="mb-2 text-2xs font-medium text-secondary-foreground">
            Files
          </h3>
          <ul className="flex flex-col gap-1.5">
            {rest.map((f) => (
              <li
                key={f.id}
                className="flex items-center gap-2.5 rounded-lg bg-card px-2.5 py-2 ring-1 ring-border"
              >
                <Icon
                  icon={FILE_ICON[f.kind]}
                  size="md"
                  className="shrink-0 text-muted-foreground"
                />
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="truncate text-xs">{f.name}</span>
                  <span className="flex items-center gap-1 truncate text-3xs text-disabled">
                    <ChatAvatar
                      id={f.authorId}
                      presence={false}
                      size="xs"
                      className="scale-75"
                    />
                    {firstName(member(f.authorId).name)} ·{" "}
                    {Date.parse(MOCK_NOW) - Date.parse(f.createdAt) < 86_400_000
                      ? ago(f.createdAt)
                      : shortDate(f.createdAt)}{" "}
                    · {formatBytes(f.bytes)}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

export { SidePanel }
