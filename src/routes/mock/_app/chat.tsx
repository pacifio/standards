import { useMemo, useState } from "react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { AnimatePresence, motion } from "motion/react"
import {
  CHANNELS,
  CONTACT_IDS,
  DIRECT,
  DISCOVERABLE,
  DRAFTS,
  FILES,
  MESSAGES,
  SELF_ID,
} from "@/mock/chat"
import type {
  ChatAttachment,
  ChatConversation,
  ChatMessage,
  PromptDraft,
} from "@/mock/chat"
import { MOCK_NOW } from "@/mock/time"
import { SPRING_RAIL } from "@/lib/motion"
import { Dock } from "@/components/shell/app-shell"
import { firstName, member } from "@/components/chat/chat-avatar"
import { ChatHeader } from "@/components/chat/chat-header"
import { Composer } from "@/components/chat/composer"
import type { ReplyTarget } from "@/components/chat/composer"
import { ConversationList } from "@/components/chat/conversation-list"
import { MessageList } from "@/components/chat/message-list"
import { SidePanel } from "@/components/chat/side-panel"

export const Route = createFileRoute("/mock/_app/chat")({
  component: ChatScreen,
  // `c` is the open conversation, so the sidebar's quick chats can link
  // straight into one.
  validateSearch: (search: Record<string, unknown>): { c?: string } =>
    typeof search.c === "string" ? { c: search.c } : {},
})

/**
 * Chat, in three panels.
 *
 *   list │ conversation │ drafts & files
 *
 * The list is the Atlas desktop app's comms home. The conversation reads
 * like a team chat — one column, grouped by author, day dividers — rather
 * than a phone's bubbles, because a team's history is read back, not just
 * replied to. The third panel is the dock, so it is its own curved panel
 * beside the page and takes the dock's sizes when a draft needs room.
 *
 * Everything is local state over the fixtures: sending, reacting, pinning,
 * joining a channel and starting a conversation all work, and all reset on
 * reload.
 */
function ChatScreen() {
  const { c: selectedParam } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })

  const [channels, setChannels] = useState(CHANNELS)
  const [direct, setDirect] = useState(DIRECT)
  const [discover, setDiscover] = useState(DISCOVERABLE)
  const [contacts, setContacts] = useState(CONTACT_IDS)
  const [messages, setMessages] = useState(MESSAGES)
  const [drafts, setDrafts] = useState(DRAFTS)
  const [panelOpen, setPanelOpen] = useState(true)
  const [listOpen, setListOpen] = useState(true)
  const [replyTo, setReplyTo] = useState<ReplyTarget | null>(null)

  const joined = [...channels, ...direct]
  const selected = joined.find((c) => c.id === selectedParam) ?? joined[0]

  function select(id: string) {
    setReplyTo(null)
    // Opening a conversation reads it.
    const clear = (list: Array<ChatConversation>) =>
      list.map((c) => (c.id === id ? { ...c, unread: 0, mentions: 0 } : c))
    setChannels(clear)
    setDirect(clear)
    void navigate({ search: { c: id }, replace: true })
  }

  function openDm(memberId: string) {
    const existing = direct.find(
      (c) => c.kind === "dm" && c.memberIds.includes(memberId)
    )
    if (existing) return select(existing.id)
    const dm: ChatConversation = {
      id: `dm-${memberId}`,
      kind: "dm",
      name: member(memberId).name,
      memberIds: [SELF_ID, memberId],
      unread: 0,
      mentions: 0,
      lastActivityAt: MOCK_NOW,
    }
    setDirect((d) => [...d, dm])
    setContacts((c) => c.filter((id) => id !== memberId))
    select(dm.id)
  }

  function createGroup(ids: Array<string>) {
    if (ids.length === 1) return openDm(ids[0])
    const group: ChatConversation = {
      id: `g-${ids.join("-")}`,
      kind: "group",
      name: ids.map((id) => firstName(member(id).name)).join(", "),
      memberIds: [SELF_ID, ...ids],
      unread: 0,
      mentions: 0,
      lastActivityAt: MOCK_NOW,
    }
    setDirect((d) => (d.some((x) => x.id === group.id) ? d : [group, ...d]))
    select(group.id)
  }

  function createChannel(name: string, isPrivate: boolean) {
    const id = `ch-${name}`
    if (!channels.some((c) => c.id === id)) {
      setChannels((c) => [
        ...c,
        {
          id,
          kind: "channel",
          name,
          private: isPrivate,
          memberIds: [SELF_ID],
          unread: 0,
          mentions: 0,
          lastActivityAt: MOCK_NOW,
        },
      ])
    }
    select(id)
  }

  function join(id: string) {
    const c = discover.find((x) => x.id === id)
    if (!c) return
    setDiscover((d) => d.filter((x) => x.id !== id))
    setChannels((list) => [
      ...list,
      { ...c, memberIds: [...c.memberIds, SELF_ID] },
    ])
    select(id)
  }

  function send(body: string, attachments: Array<ChatAttachment>) {
    const m: ChatMessage = {
      id: `local-${messages.length}`,
      convId: selected.id,
      authorId: SELF_ID,
      body,
      // After the last message, so the transcript's order holds.
      createdAt: MOCK_NOW,
      replyToId: replyTo?.id,
      attachments: attachments.length ? attachments : undefined,
    }
    setMessages((all) => [...all, m])
    setReplyTo(null)
  }

  function react(id: string, emoji: string) {
    setMessages((all) =>
      all.map((m) => {
        if (m.id !== id) return m
        const reactions = [...(m.reactions ?? [])]
        const i = reactions.findIndex((r) => r.emoji === emoji)
        if (i === -1) {
          reactions.push({ emoji, userIds: [SELF_ID] })
        } else {
          const r = reactions[i]
          const userIds = r.userIds.includes(SELF_ID)
            ? r.userIds.filter((u) => u !== SELF_ID)
            : [...r.userIds, SELF_ID]
          if (userIds.length) reactions[i] = { ...r, userIds }
          else reactions.splice(i, 1)
        }
        return { ...m, reactions }
      })
    )
  }

  function pin(id: string) {
    setMessages((all) =>
      all.map((m) => (m.id === id ? { ...m, pinned: !m.pinned } : m))
    )
  }

  function createDraft(title: string): PromptDraft {
    const d: PromptDraft = {
      id: `draft-${drafts.length}`,
      convId: selected.id,
      title,
      createdBy: SELF_ID,
      createdAt: MOCK_NOW,
      updatedAt: MOCK_NOW,
      body: `# ${title}\n\n`,
    }
    setDrafts((all) => [d, ...all])
    return d
  }

  const thread = useMemo(
    () => messages.filter((m) => m.convId === selected.id),
    [messages, selected.id]
  )
  const pinned = thread.filter((m) => m.pinned)

  return (
    <>
      <div className="flex min-h-0 flex-1">
        {/* The list folds away to give the conversation the width; it
            slides rather than snaps, on the rail's spring. */}
        <AnimatePresence initial={false}>
          {listOpen && (
            <motion.div
              key="list"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "auto", opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={SPRING_RAIL}
              className="flex shrink-0 overflow-hidden"
            >
              <ConversationList
                channels={channels}
                direct={direct}
                contacts={contacts}
                discover={discover}
                selectedId={selected.id}
                onSelect={select}
                onOpenDm={openDm}
                onCreateGroup={createGroup}
                onCreateChannel={createChannel}
                onJoin={join}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex min-w-0 flex-1 flex-col">
          <ChatHeader
            conversation={selected}
            pinned={pinned}
            panelOpen={panelOpen}
            onTogglePanel={() => setPanelOpen((v) => !v)}
            listOpen={listOpen}
            onToggleList={() => setListOpen((v) => !v)}
          />
          <MessageList
            key={selected.id}
            messages={thread}
            isDm={selected.kind === "dm"}
            onReact={react}
            onPin={pin}
            onReply={(m) =>
              setReplyTo({
                id: m.id,
                author: member(m.authorId).name,
                body: m.body,
              })
            }
          />
          <Composer
            placeholder={
              selected.kind === "channel"
                ? `Message #${selected.name}`
                : `Message ${selected.name}`
            }
            replyTo={replyTo}
            onCancelReply={() => setReplyTo(null)}
            onSend={send}
          />
        </div>
      </div>

      <Dock>
        {panelOpen && (
          <SidePanel
            key={selected.id}
            conversation={selected}
            drafts={drafts.filter((d) => d.convId === selected.id)}
            files={FILES.filter((f) => f.convId === selected.id)}
            onCreateDraft={createDraft}
            onClose={() => setPanelOpen(false)}
          />
        )}
      </Dock>
    </>
  )
}
