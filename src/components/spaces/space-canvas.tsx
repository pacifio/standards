"use client"

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { cn } from "cn"

import { NODE_DEFAULT_SIZE } from "@/mock/spaces"
import type { SpaceNode, SpaceNodeKind, SpacePage } from "@/mock/spaces"
import {
  SpaceActionPill,
  SpaceHeaderPill,
} from "@/components/spaces/space-chrome"
import { SpaceCursors } from "@/components/spaces/space-cursors"
import type { Bounds, SpacePeer } from "@/components/spaces/space-cursors"
import { SpaceNodeView } from "@/components/spaces/space-nodes"
import type { NodeEdit } from "@/components/spaces/space-nodes"
import { SpaceToolbar } from "@/components/spaces/space-toolbar"
import type { SpaceDock, SpaceTool } from "@/components/spaces/space-toolbar"

/**
 * The canvas surface: an infinite dotted plane you pan and zoom, with the
 * page's nodes on it.
 *
 * The desktop app builds this on xyflow over a Y.Doc; the mock has neither,
 * so it is the smallest thing that behaves the same. One viewport
 * `{x, y, zoom}` maps canvas px to screen px (`screen = v + canvas * zoom`),
 * and everything that lives on the plane — nodes, the dot grid, peer
 * cursors — is drawn through it. Nodes sit in one layer transformed by
 * `translate(x, y) scale(zoom)` from its top-left corner, so a node's
 * `left/top` are plain canvas coordinates.
 *
 * Gestures are pointer-captured on the surface: a press on empty canvas
 * pans (or, with a tool armed, creates), a press on a node selects and
 * drags it, a press on its corner handle resizes. A drag writes the page
 * live and lands in history once, on release — undo steps are gestures,
 * not pointer events.
 */

export type Viewport = { x: number; y: number; zoom: number }

const MIN_ZOOM = 0.2
const MAX_ZOOM = 2
/** Dot spacing at zoom 1, in canvas px. */
const GRID = 20
/** A press that moves less than this (screen px) is a click, not a drag. */
const DRAG_SLOP = 3
/** Room around the content when fitting, clear of the floating chrome. */
const FIT_PAD = 72
/** How long a button-driven viewport change glides for. */
const GLIDE_MS = 280

/** Where an empty page's peers wander, and what its camera centres on. */
const EMPTY_BOUNDS: Bounds = { x: 0, y: 0, w: 600, h: 400 }

const clampZoom = (z: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z))

/** The box around every node, frame labels included. */
function boundsOf(nodes: ReadonlyArray<SpaceNode>): Bounds | null {
  if (nodes.length === 0) return null
  let x0 = Infinity
  let y0 = Infinity
  let x1 = -Infinity
  let y1 = -Infinity
  for (const n of nodes) {
    x0 = Math.min(x0, n.x)
    y0 = Math.min(y0, n.kind === "frame" ? n.y - 24 : n.y)
    x1 = Math.max(x1, n.x + n.w)
    y1 = Math.max(y1, n.y + n.h)
  }
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 }
}

/** The viewport that centres `nodes` in a `w × h` surface, never above 100%. */
function fitViewport(
  nodes: ReadonlyArray<SpaceNode>,
  w: number,
  h: number
): Viewport {
  const b = boundsOf(nodes)
  if (!b)
    return { x: (w - EMPTY_BOUNDS.w) / 2, y: (h - EMPTY_BOUNDS.h) / 2, zoom: 1 }
  const zoom = clampZoom(
    Math.min((w - FIT_PAD * 2) / b.w, (h - FIT_PAD * 2) / b.h, 1)
  )
  return {
    zoom,
    x: (w - b.w * zoom) / 2 - b.x * zoom,
    y: (h - b.h * zoom) / 2 - b.y * zoom,
  }
}

/** What the next node gets called; ids only need to be unique per page. */
function nextId() {
  return `n-${Math.random().toString(36).slice(2, 10)}`
}

/** A fresh node of the armed tool, centred where the canvas was clicked. */
function createNode(tool: SpaceTool, at: { x: number; y: number }): SpaceNode {
  const kind: SpaceNodeKind = tool.startsWith("shape:")
    ? "shape"
    : (tool as SpaceNodeKind)
  const { w, h } = NODE_DEFAULT_SIZE[kind]
  const node: SpaceNode = {
    id: nextId(),
    kind,
    x: Math.round(at.x - w / 2),
    y: Math.round(at.y - h / 2),
    w,
    h,
  }
  if (kind === "shape") node.shape = tool.slice(6) as SpaceNode["shape"]
  if (kind === "note") Object.assign(node, { title: "Note", body: "" })
  if (kind === "text") node.text = "Text"
  if (kind === "frame") node.title = "Frame"
  return node
}

type Gesture =
  | { kind: "pan"; startX: number; startY: number; from: Viewport }
  | {
      kind: "move" | "resize"
      id: string
      startX: number
      startY: number
      before: Array<SpaceNode>
      moved: boolean
    }

function SpaceCanvas({
  page,
  pages,
  onNodes,
  onOpenPage,
  pagesOpen,
  onTogglePages,
  initialViewport,
  onViewport,
  dock,
  onDock,
  where,
  peers,
  self,
}: {
  page: SpacePage
  pages: ReadonlyArray<SpacePage>
  onNodes: (nodes: Array<SpaceNode>) => void
  onOpenPage: (id: string) => void
  pagesOpen: boolean
  onTogglePages: () => void
  /** Where this page was left; `undefined` fits the content on open. */
  initialViewport?: Viewport
  onViewport: (v: Viewport) => void
  dock: SpaceDock
  onDock: (dock: SpaceDock) => void
  where: string
  peers: ReadonlyArray<SpacePeer>
  self: { name: string; image?: string }
}) {
  const nodes = page.nodes
  const surfaceRef = useRef<HTMLDivElement>(null)

  const [viewport, setViewport] = useState<Viewport>(
    initialViewport ?? { x: 0, y: 0, zoom: 1 }
  )
  const [glide, setGlide] = useState(false)
  const [tool, setTool] = useState<SpaceTool>("select")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [panning, setPanning] = useState(false)
  const [past, setPast] = useState<Array<Array<SpaceNode>>>([])
  const [future, setFuture] = useState<Array<Array<SpaceNode>>>([])
  const gesture = useRef<Gesture | null>(null)
  const glideTimer = useRef(0)

  // The cursors' rAF loop reads these every frame rather than re-rendering.
  const viewportRef = useRef(viewport)
  const boundsRef = useRef<Bounds>(EMPTY_BOUNDS)
  useLayoutEffect(() => {
    viewportRef.current = viewport
    onViewport(viewport)
  }, [viewport, onViewport])
  useLayoutEffect(() => {
    boundsRef.current = boundsOf(nodes) ?? EMPTY_BOUNDS
  }, [nodes])

  // First open of a page: fit its content. Measured, so client-only; the
  // server render is the untransformed plane for one frame at most.
  useLayoutEffect(() => {
    const el = surfaceRef.current
    if (initialViewport || !el) return
    setViewport(fitViewport(nodes, el.clientWidth, el.clientHeight))
    // Once per mount: a page's later edits must not yank the camera.
  }, [])

  /** Move the camera from a button, with a short glide. */
  const animateTo = (v: Viewport) => {
    window.clearTimeout(glideTimer.current)
    setGlide(true)
    setViewport(v)
    glideTimer.current = window.setTimeout(() => setGlide(false), GLIDE_MS)
  }
  useEffect(() => () => window.clearTimeout(glideTimer.current), [])

  /** Zoom by `factor` about the surface's centre. */
  const zoomBy = (factor: number, absolute?: number) => {
    const el = surfaceRef.current
    if (!el) return
    const cx = el.clientWidth / 2
    const cy = el.clientHeight / 2
    const zoom = clampZoom(absolute ?? viewport.zoom * factor)
    const k = zoom / viewport.zoom
    animateTo({
      zoom,
      x: cx - (cx - viewport.x) * k,
      y: cy - (cy - viewport.y) * k,
    })
  }

  const fit = () => {
    const el = surfaceRef.current
    if (el) animateTo(fitViewport(nodes, el.clientWidth, el.clientHeight))
  }

  // Wheel: scroll pans, pinch (ctrl) or ⌘-scroll zooms about the pointer.
  // Bound natively because React's wheel listener is passive and could not
  // stop the page from scrolling or the browser from zooming.
  useEffect(() => {
    const el = surfaceRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      window.clearTimeout(glideTimer.current)
      setGlide(false)
      if (e.ctrlKey || e.metaKey) {
        const rect = el.getBoundingClientRect()
        const px = e.clientX - rect.left
        const py = e.clientY - rect.top
        setViewport((v) => {
          // A pinch sends small deltas, a mouse wheel ~100 a notch;
          // clamping keeps one notch to a ~35% step, not a 2.7× leap.
          const d = Math.max(-30, Math.min(30, e.deltaY))
          const zoom = clampZoom(v.zoom * Math.exp(-d * 0.01))
          const k = zoom / v.zoom
          return { zoom, x: px - (px - v.x) * k, y: py - (py - v.y) * k }
        })
      } else {
        setViewport((v) => ({ ...v, x: v.x - e.deltaX, y: v.y - e.deltaY }))
      }
    }
    el.addEventListener("wheel", onWheel, { passive: false })
    return () => el.removeEventListener("wheel", onWheel)
  }, [])

  // ---- history ------------------------------------------------------------

  /** Replace the page's nodes as one undoable step. */
  const commit = (next: Array<SpaceNode>) => {
    setPast((p) => [...p, nodes])
    setFuture([])
    onNodes(next)
  }

  const undo = () => {
    const prev = past.at(-1)
    if (!prev) return
    setPast(past.slice(0, -1))
    setFuture([nodes, ...future])
    onNodes(prev)
    setEditingId(null)
  }

  const redo = () => {
    const next = future.at(0)
    if (!next) return
    setFuture(future.slice(1))
    setPast([...past, nodes])
    onNodes(next)
    setEditingId(null)
  }

  const remove = (id: string) => {
    commit(nodes.filter((n) => n.id !== id))
    setSelectedId(null)
  }

  // Keys belong to the canvas only when nothing is being typed into.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target
      if (
        t instanceof HTMLElement &&
        t.closest("input, textarea, select, [contenteditable='true']")
      ) {
        return
      }
      const mod = e.metaKey || e.ctrlKey
      if (mod && e.key.toLowerCase() === "z") {
        e.preventDefault()
        if (e.shiftKey) redo()
        else undo()
      } else if (mod && e.key.toLowerCase() === "y") {
        e.preventDefault()
        redo()
      } else if ((e.key === "Delete" || e.key === "Backspace") && selectedId) {
        e.preventDefault()
        remove(selectedId)
      } else if (e.key === "Escape") {
        setTool("select")
        setSelectedId(null)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  })

  // ---- gestures -----------------------------------------------------------

  const toCanvas = (clientX: number, clientY: number) => {
    const rect = surfaceRef.current!.getBoundingClientRect()
    return {
      x: (clientX - rect.left - viewport.x) / viewport.zoom,
      y: (clientY - rect.top - viewport.y) / viewport.zoom,
    }
  }

  const capture = (e: React.PointerEvent) => {
    surfaceRef.current?.setPointerCapture(e.pointerId)
  }

  const onSurfaceDown = (e: React.PointerEvent) => {
    if (e.button !== 0 && e.button !== 1) return
    window.clearTimeout(glideTimer.current)
    setGlide(false)
    if (tool !== "select" && e.button === 0) {
      const node = createNode(tool, toCanvas(e.clientX, e.clientY))
      commit([...nodes, node])
      setSelectedId(node.id)
      setTool("select")
      return
    }
    // Not `setEditingId(null)`: the open editor's blur closes it, and saves.
    setSelectedId(null)
    gesture.current = {
      kind: "pan",
      startX: e.clientX,
      startY: e.clientY,
      from: viewport,
    }
    setPanning(true)
    capture(e)
  }

  const onNodeDown = (node: SpaceNode, e: React.PointerEvent) => {
    // With a tool armed, a press on a node is a press on the canvas: drop a
    // note inside a frame by clicking the frame.
    if (tool !== "select" || e.button !== 0) return
    e.stopPropagation()
    if (editingId === node.id) return
    setSelectedId(node.id)
    gesture.current = {
      kind: "move",
      id: node.id,
      startX: e.clientX,
      startY: e.clientY,
      before: nodes,
      moved: false,
    }
    // Captured once it becomes a drag (in `onMove`), not here: a capture
    // retargets the click and double-click to the surface, and
    // double-click is how a note opens for editing.
  }

  const onResizeDown = (node: SpaceNode, e: React.PointerEvent) => {
    if (e.button !== 0) return
    e.stopPropagation()
    gesture.current = {
      kind: "resize",
      id: node.id,
      startX: e.clientX,
      startY: e.clientY,
      before: nodes,
      moved: false,
    }
    capture(e)
  }

  const onMove = (e: React.PointerEvent) => {
    const g = gesture.current
    if (!g) return
    const dx = e.clientX - g.startX
    const dy = e.clientY - g.startY
    if (g.kind === "pan") {
      setViewport({ ...g.from, x: g.from.x + dx, y: g.from.y + dy })
      return
    }
    if (!g.moved) {
      if (Math.hypot(dx, dy) < DRAG_SLOP) return
      g.moved = true
      capture(e)
    }
    // Screen px to canvas px: a 100px drag at 50% moves the node 200px.
    const cx = dx / viewport.zoom
    const cy = dy / viewport.zoom
    onNodes(
      g.before.map((n) => {
        if (n.id !== g.id) return n
        return g.kind === "move"
          ? { ...n, x: Math.round(n.x + cx), y: Math.round(n.y + cy) }
          : {
              ...n,
              w: Math.max(40, Math.round(n.w + cx)),
              h: Math.max(32, Math.round(n.h + cy)),
            }
      })
    )
  }

  const onUp = () => {
    const g = gesture.current
    gesture.current = null
    setPanning(false)
    if (g && g.kind !== "pan" && g.moved) {
      setPast((p) => [...p, g.before])
      setFuture([])
    }
  }

  const onEditDone = (node: SpaceNode, patch: NodeEdit) => {
    setEditingId(null)
    const changed = (Object.keys(patch) as Array<keyof NodeEdit>).some(
      (k) => (patch[k] ?? "") !== (node[k] ?? "")
    )
    if (changed) {
      commit(nodes.map((n) => (n.id === node.id ? { ...n, ...patch } : n)))
    }
  }

  // Frames draw first so they sit under whatever they contain.
  const ordered = useMemo(
    () => [
      ...nodes.filter((n) => n.kind === "frame"),
      ...nodes.filter((n) => n.kind !== "frame"),
    ],
    [nodes]
  )

  const { x, y, zoom } = viewport

  return (
    <div className="relative min-h-0 min-w-0 flex-1 overflow-hidden bg-background">
      <div
        ref={surfaceRef}
        onPointerDown={onSurfaceDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        className={cn(
          "absolute inset-0 touch-none select-none",
          tool !== "select"
            ? "cursor-crosshair"
            : panning
              ? "cursor-grabbing"
              : "cursor-default",
          glide &&
            "transition-[background-position,background-size] duration-300 ease-out"
        )}
        style={{
          backgroundImage:
            "radial-gradient(circle, var(--border-strong) 1.2px, transparent 1.4px)",
          backgroundSize: `${GRID * zoom}px ${GRID * zoom}px`,
          backgroundPosition: `${x}px ${y}px`,
        }}
      >
        <div
          className={cn(
            "absolute top-0 left-0 origin-top-left",
            glide && "transition-transform duration-300 ease-out"
          )}
          style={{ transform: `translate(${x}px, ${y}px) scale(${zoom})` }}
        >
          {ordered.map((node) => (
            <SpaceNodeView
              key={node.id}
              node={node}
              selected={node.id === selectedId}
              editing={node.id === editingId}
              onPointerDown={(e) => onNodeDown(node, e)}
              onResizeStart={(e) => onResizeDown(node, e)}
              onDoubleClick={() => {
                if (node.kind === "note" || node.kind === "text") {
                  setSelectedId(node.id)
                  setEditingId(node.id)
                }
              }}
              onEditDone={(patch) => onEditDone(node, patch)}
            />
          ))}
        </div>
      </div>

      <SpaceCursors
        peers={peers}
        viewportRef={viewportRef}
        boundsRef={boundsRef}
      />

      <SpaceHeaderPill
        pages={pages}
        activePageId={page.id}
        onOpenPage={onOpenPage}
        pagesOpen={pagesOpen}
        onTogglePages={onTogglePages}
        where={where}
        zoom={zoom}
        onZoomIn={() => zoomBy(1.25)}
        onZoomOut={() => zoomBy(0.8)}
        onZoomReset={() => zoomBy(1, 1)}
        onFit={fit}
      />
      <SpaceActionPill peers={peers} self={self} />
      <SpaceToolbar
        tool={tool}
        onTool={(t) => {
          setTool(t)
          setEditingId(null)
        }}
        canUndo={past.length > 0}
        canRedo={future.length > 0}
        onUndo={undo}
        onRedo={redo}
        dock={dock}
        onDock={onDock}
      />
    </div>
  )
}

export { SpaceCanvas }
