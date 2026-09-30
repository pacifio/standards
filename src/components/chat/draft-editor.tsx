"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { motion } from "motion/react"
import { ChevronLeftIcon, HashIcon } from "lucide-react"
import { cn } from "cn"

import { SELF_ID } from "@/mock/chat"
import type { PromptDraft } from "@/mock/chat"
import { ago } from "@/mock/time"
import { hueFor } from "@/lib/hue"
import type { LabelTone } from "@/mock/types"
import { Icon } from "@/components/ui/icon"
import { IconButton } from "@/components/ui/icon-button"
import { ChatAvatar, firstName, member } from "./chat-avatar"

/**
 * A prompt draft, open for writing together — the Atlas desktop app's draft
 * editor, where the conversation drafts what it will send to an agent.
 *
 * It behaves like a shared document: a collaborator's caret sits in the
 * text with their name on a flag, moves as they type, and your own edits
 * shift it rather than collide with it. In the real app the document is a
 * CRDT synced over the conversation; the mock plays one collaborator's
 * typing so the presence reads true.
 *
 * Plain Markdown with line numbers, not rich text: a draft ends up as an
 * agent's prompt, so what you see is what the agent will read.
 */

/** What the scripted collaborator types, a character at a time. */
const SCRIPT = "\n- Keep the old order behind `?legacySort=1` for one release\n"

/** A hue → the caret's ink, as classes (no literals). */
const INK: Record<LabelTone, { bg: string; ring: string }> = {
  grey: { bg: "bg-hue-grey", ring: "ring-hue-grey" },
  indigo: { bg: "bg-hue-indigo", ring: "ring-hue-indigo" },
  purple: { bg: "bg-hue-purple", ring: "ring-hue-purple" },
  cyan: { bg: "bg-hue-cyan", ring: "ring-hue-cyan" },
  green: { bg: "bg-hue-green", ring: "ring-hue-green" },
  amber: { bg: "bg-hue-amber", ring: "ring-hue-amber" },
  orange: { bg: "bg-hue-orange", ring: "ring-hue-orange" },
  red: { bg: "bg-hue-red", ring: "ring-hue-red" },
}

function DraftEditor({
  draft,
  convName,
  onBack,
}: {
  draft: PromptDraft
  convName: string
  onBack: () => void
}) {
  const [text, setText] = useState(draft.body)
  const area = useRef<HTMLTextAreaElement>(null)
  const gutter = useRef<HTMLDivElement>(null)
  const mirror = useRef<HTMLPreElement>(null)

  // The collaborator: whoever wrote it, or a teammate when that was you.
  const peerId = draft.createdBy === SELF_ID ? "m3" : draft.createdBy
  const peer = member(peerId)
  const ink = INK[hueFor(peerId)]

  // Their caret starts at the end of the second-to-last paragraph.
  const [peerAt, setPeerAt] = useState(() =>
    Math.max(0, draft.body.trimEnd().length)
  )
  const [typing, setTyping] = useState(false)
  const peerRef = useRef(peerAt)
  peerRef.current = peerAt

  // Play the script: a pause, then a character every ~90ms, then idle.
  useEffect(() => {
    let i = 0
    let t = window.setTimeout(function step() {
      if (i >= SCRIPT.length) {
        setTyping(false)
        return
      }
      setTyping(true)
      const ch = SCRIPT[i++]
      const at = peerRef.current
      setText((s) => s.slice(0, at) + ch + s.slice(at))
      setPeerAt(at + 1)
      // Keep your own caret where it was, relative to your text.
      const el = area.current
      if (el && document.activeElement === el && el.selectionStart > at) {
        const [a, b] = [el.selectionStart + 1, el.selectionEnd + 1]
        requestAnimationFrame(() => el.setSelectionRange(a, b))
      }
      t = window.setTimeout(step, 60 + Math.random() * 90)
    }, 1400)
    return () => window.clearTimeout(t)
  }, [draft.id])

  function onChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const next = e.target.value
    const delta = next.length - text.length
    // Where the edit happened: the caret after an insert, minus what went in.
    const start = e.target.selectionStart - Math.max(delta, 0)
    if (start <= peerAt) setPeerAt((p) => Math.max(start, p + delta))
    setText(next)
  }

  const lines = useMemo(() => text.split("\n").length, [text])

  function syncScroll() {
    const el = area.current
    if (!el) return
    if (gutter.current) gutter.current.scrollTop = el.scrollTop
    if (mirror.current) {
      mirror.current.scrollTop = el.scrollTop
      mirror.current.scrollLeft = el.scrollLeft
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex h-11 shrink-0 items-center gap-1.5 border-b border-hairline px-2">
        <IconButton
          icon={ChevronLeftIcon}
          label="Back to drafts"
          size="sm"
          onClick={onBack}
        />
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-xs font-medium">{draft.title}</span>
          <span className="flex items-center gap-1 truncate text-3xs text-muted-foreground">
            <Icon icon={HashIcon} size="xs" />
            {convName} · edited {ago(draft.updatedAt)}
          </span>
        </span>
        {/* Who is in the document. */}
        <span className="flex items-center -space-x-1.5">
          <ChatAvatar
            id={peerId}
            presence={false}
            className={cn("rounded-full ring-2", ink.ring)}
          />
          <ChatAvatar
            id={SELF_ID}
            presence={false}
            className="rounded-full ring-2 ring-card"
          />
        </span>
      </header>

      <div className="relative flex min-h-0 flex-1 bg-background">
        {/* Line numbers, scrolled with the text. */}
        <div
          ref={gutter}
          aria-hidden="true"
          className="w-10 shrink-0 overflow-hidden border-r border-hairline py-3 pr-2 text-right mono text-2xs leading-5 text-disabled select-none"
        >
          {Array.from({ length: lines }, (_, i) => (
            <div key={i} className="tnum">
              {i + 1}
            </div>
          ))}
        </div>

        <div className="relative min-w-0 flex-1">
          {/* A mirror of the text with the collaborator's caret in it. Same
              font, same metrics, no wrapping — so an offset in the string
              is a place on screen. The textarea sits over it. */}
          <pre
            ref={mirror}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 overflow-hidden px-3 py-3 mono text-xs leading-5 whitespace-pre text-transparent"
          >
            {text.slice(0, peerAt)}
            <span className="relative">
              <motion.span
                animate={typing ? { opacity: 1 } : { opacity: [1, 1, 0.25, 1] }}
                transition={
                  typing ? { duration: 0 } : { duration: 1.2, repeat: Infinity }
                }
                className={cn(
                  "absolute -top-0.5 left-0 h-5 w-0.5 rounded-full",
                  ink.bg
                )}
              />
              <span
                className={cn(
                  "absolute -top-4 left-0 rounded-sm rounded-bl-none px-1 font-sans text-4xs leading-4 font-medium whitespace-nowrap text-background",
                  ink.bg
                )}
              >
                {firstName(peer.name)}
              </span>
            </span>
            {text.slice(peerAt)}
          </pre>
          <textarea
            ref={area}
            value={text}
            onChange={onChange}
            onScroll={syncScroll}
            spellCheck={false}
            wrap="off"
            placeholder="Write together…"
            aria-label={`Draft: ${draft.title}`}
            className="absolute inset-0 resize-none overflow-auto bg-transparent px-3 py-3 mono text-xs leading-5 whitespace-pre text-foreground caret-foreground outline-none placeholder:text-disabled"
          />
        </div>
      </div>
    </div>
  )
}

export { DraftEditor }
