"use client"

import { useCallback, useMemo, useRef, useState } from "react"

import { SELF_ID } from "@/mock/chat"
import type { ChatConversation } from "@/mock/chat"
import { MEMBERS } from "@/mock/data"
import { spacePagesFor } from "@/mock/spaces"
import type { SpaceNode, SpacePage } from "@/mock/spaces"
import { MOCK_NOW } from "@/mock/time"
import { SpaceCanvas } from "@/components/spaces/space-canvas"
import type { Viewport } from "@/components/spaces/space-canvas"
import { peerHues } from "@/components/spaces/space-cursors"
import type { SpacePeer } from "@/components/spaces/space-cursors"
import { SpacePages } from "@/components/spaces/space-pages"
import type { SpaceDock } from "@/components/spaces/space-toolbar"
import { TooltipProvider } from "@/components/ui/tooltip"

/**
 * One conversation's Space: the pages column beside the canvas.
 *
 * The host owns what outlives a page switch — the pages and their nodes,
 * which page is open, where each page's camera was left, whether the
 * column is showing and where the dock sits. The canvas is remounted per
 * page (`key`), so selection, the armed tool and undo history are the
 * page's own and never leak into the next one.
 *
 * The mock keeps edits in memory; a reload is a fresh Space.
 */
function SpaceView({ conversation }: { conversation: ChatConversation }) {
  const [pages, setPages] = useState<Array<SpacePage>>(() =>
    spacePagesFor(conversation.id)
  )
  const [activeId, setActiveId] = useState(pages[0].id)
  const [pagesOpen, setPagesOpen] = useState(true)
  const [dock, setDock] = useState<SpaceDock>("bottom")
  const viewports = useRef(new Map<string, Viewport>())

  const active =
    pages.find((p) => p.id === activeId && p.kind === "page") ??
    pages.find((p) => p.kind === "page")!

  const label =
    conversation.kind === "channel"
      ? `#${conversation.name}`
      : conversation.name

  // Everyone in the conversation but you, up to two, is "here" — the mock's
  // stand-in for a presence feed.
  const peers = useMemo<Array<SpacePeer>>(() => {
    const ids = conversation.memberIds.filter((id) => id !== SELF_ID)
    const people = ids
      .map((id) => MEMBERS.find((m) => m.id === id))
      .filter((m) => m !== undefined)
      .slice(0, 2)
    const hues = peerHues(people.map((m) => m.id))
    return people.map((m, i) => ({
      id: m.id,
      name: m.name || m.email,
      image: m.image,
      hue: hues[i],
    }))
  }, [conversation])

  const me = MEMBERS.find((m) => m.id === SELF_ID)
  const self = { name: me?.name ?? "You", image: me?.image }

  const setNodes = (nodes: Array<SpaceNode>) =>
    setPages((all) =>
      all.map((p) =>
        p.id === active.id ? { ...p, nodes, updatedAt: MOCK_NOW } : p
      )
    )

  const create = (kind: SpacePage["kind"]) => {
    const page: SpacePage = {
      id: `pg-${Math.random().toString(36).slice(2, 10)}`,
      kind,
      name: kind === "page" ? "Untitled" : "New folder",
      updatedAt: MOCK_NOW,
      nodes: [],
    }
    setPages((all) => [...all, page])
    if (kind === "page") setActiveId(page.id)
  }

  const remove = (id: string) => {
    const rest = pages.filter((p) => p.id !== id)
    setPages(rest)
    viewports.current.delete(id)
    if (id === active.id) {
      const next = rest.find((p) => p.kind === "page")
      if (next) setActiveId(next.id)
    }
  }

  const rename = (id: string, name: string) =>
    setPages((all) => all.map((p) => (p.id === id ? { ...p, name } : p)))

  // Stable, so the canvas's viewport effect runs on camera moves only.
  const activePageId = active.id
  const rememberViewport = useCallback(
    (v: Viewport) => viewports.current.set(activePageId, v),
    [activePageId]
  )

  return (
    <TooltipProvider>
      <div className="flex min-h-0 flex-1">
        {pagesOpen && (
          <SpacePages
            pages={pages}
            activeId={active.id}
            onOpen={setActiveId}
            onCreate={create}
            onDelete={remove}
            onRename={rename}
            conversation={{ id: conversation.id, label }}
          />
        )}
        <SpaceCanvas
          key={active.id}
          page={active}
          pages={pages}
          onNodes={setNodes}
          onOpenPage={setActiveId}
          pagesOpen={pagesOpen}
          onTogglePages={() => setPagesOpen((o) => !o)}
          initialViewport={viewports.current.get(active.id)}
          onViewport={rememberViewport}
          dock={dock}
          onDock={setDock}
          where={label}
          peers={peers}
          self={self}
        />
      </div>
    </TooltipProvider>
  )
}

export { SpaceView }
