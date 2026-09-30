"use client"

import { useState } from "react"
import type { RefCallback } from "react"
import { ImageIcon } from "lucide-react"
import { cn } from "cn"

import type { SpaceNode, SpaceShape } from "@/mock/spaces"
import { Icon } from "@/components/ui/icon"

/**
 * The canvas's node renderers — the desktop app's visual language (glass
 * notes, bare text, stretched SVG shapes, dashed frames) drawn as plain
 * absolutely-positioned boxes rather than xyflow nodes.
 *
 * Every renderer fills the box its node was given; the wrapper owns the
 * position, the selection ring and the resize handle, so a new kind is one
 * more branch in `NodeBody` and nothing else.
 */

/** A patch an inline editor hands back when it closes. */
export type NodeEdit = Partial<Pick<SpaceNode, "title" | "body" | "text">>

/** Selection hugs each kind's own corner radius. */
const RING_RADIUS: Record<SpaceNode["kind"], string> = {
  note: "rounded-2xl",
  text: "rounded-md",
  frame: "rounded-xl",
  shape: "rounded-md",
  image: "rounded-xl",
}

/**
 * One node on the canvas: positioned in canvas px inside the scaled layer,
 * so the wrapper never multiplies by zoom — the layer's transform does.
 *
 * Pointer and double-click handlers come from the canvas, which owns the
 * gestures; this only reports where they started.
 */
function SpaceNodeView({
  node,
  selected,
  editing,
  onPointerDown,
  onDoubleClick,
  onResizeStart,
  onEditDone,
}: {
  node: SpaceNode
  selected: boolean
  editing: boolean
  onPointerDown: (e: React.PointerEvent) => void
  onDoubleClick: () => void
  onResizeStart: (e: React.PointerEvent) => void
  onEditDone: (patch: NodeEdit) => void
}) {
  return (
    <div
      data-node-id={node.id}
      onPointerDown={onPointerDown}
      onDoubleClick={onDoubleClick}
      className={cn(
        "absolute",
        RING_RADIUS[node.kind],
        selected &&
          "ring-2 ring-foreground/40 ring-offset-2 ring-offset-background"
      )}
      style={{ left: node.x, top: node.y, width: node.w, height: node.h }}
    >
      <NodeBody node={node} editing={editing} onEditDone={onEditDone} />
      {selected && !editing && (
        <div
          role="presentation"
          onPointerDown={onResizeStart}
          className="absolute -right-1.5 -bottom-1.5 size-2.5 cursor-nwse-resize rounded-xs border border-border-strong bg-card"
        />
      )}
    </div>
  )
}

function NodeBody({
  node,
  editing,
  onEditDone,
}: {
  node: SpaceNode
  editing: boolean
  onEditDone: (patch: NodeEdit) => void
}) {
  switch (node.kind) {
    case "note":
      return editing ? (
        <NoteEditor node={node} onDone={onEditDone} />
      ) : (
        <NoteCard>
          <div className="truncate text-xs font-semibold text-foreground">
            {node.title || "Untitled"}
          </div>
          <p className="line-clamp-6 text-2xs whitespace-pre-wrap text-secondary-foreground">
            {node.body}
          </p>
        </NoteCard>
      )
    case "text":
      return editing ? (
        <TextEditor node={node} onDone={onEditDone} />
      ) : (
        <p className="h-full overflow-hidden px-1 py-0.5 text-md font-semibold break-words whitespace-pre-wrap text-foreground">
          {node.text || "Text"}
        </p>
      )
    case "frame":
      return (
        <div className="size-full rounded-xl border-2 border-dashed border-border-strong bg-element-hover">
          <span className="absolute -top-5 left-1 max-w-full truncate text-2xs font-medium text-muted-foreground">
            {node.title || "Frame"}
          </span>
        </div>
      )
    case "shape":
      return (
        <div className="relative size-full">
          <ShapeSvg shape={node.shape ?? "rectangle"} />
          <div className="absolute inset-0 flex items-center justify-center p-3">
            <span className="line-clamp-3 text-center text-xs font-medium text-foreground">
              {node.title}
            </span>
          </div>
        </div>
      )
    case "image":
      return (
        <div className="flex size-full flex-col items-center justify-center gap-1.5 rounded-xl border border-border bg-surface text-muted-foreground">
          <Icon icon={ImageIcon} size="lg" />
          <span className="text-3xs">Image</span>
        </div>
      )
  }
}

/** The glass card a note is drawn on, reading or editing. */
function NoteCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex size-full flex-col gap-1.5 overflow-hidden rounded-2xl border border-border bg-card/80 px-3 py-2.5 shadow-md backdrop-blur">
      {children}
    </div>
  )
}

/**
 * Focus a field as it mounts with the caret at the END — `autoFocus` puts
 * it at the start, and a double-click to edit means "add to this".
 */
const focusAtEnd: RefCallback<HTMLTextAreaElement> = (el) => {
  if (!el || el.ownerDocument.activeElement === el) return
  el.focus()
  el.setSelectionRange(el.value.length, el.value.length)
}

/**
 * Close the editor when focus leaves the node entirely — tabbing from the
 * title to the body is still editing; clicking the canvas is not.
 */
function leaving(e: React.FocusEvent) {
  const next = e.relatedTarget
  return !(next instanceof Node && e.currentTarget.contains(next))
}

/**
 * Editing keys stay with the field: Backspace must not delete the node it
 * is typing into, and ⌘Z undoes characters, not canvas history. Escape and
 * ⌘Enter finish.
 */
function fieldKeys(e: React.KeyboardEvent) {
  e.stopPropagation()
  if (e.key === "Escape" || (e.key === "Enter" && (e.metaKey || e.ctrlKey))) {
    ;(e.target as HTMLElement).blur()
  }
}

function NoteEditor({
  node,
  onDone,
}: {
  node: SpaceNode
  onDone: (patch: NodeEdit) => void
}) {
  const [title, setTitle] = useState(node.title ?? "")
  const [body, setBody] = useState(node.body ?? "")
  return (
    <div
      className="size-full"
      onPointerDown={(e) => e.stopPropagation()}
      onBlur={(e) => leaving(e) && onDone({ title, body })}
    >
      <NoteCard>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={fieldKeys}
          placeholder="Untitled"
          aria-label="Note title"
          className="w-full bg-transparent text-xs font-semibold text-foreground outline-none placeholder:text-muted-foreground"
        />
        <textarea
          ref={focusAtEnd}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={fieldKeys}
          placeholder="Write something…"
          aria-label="Note body"
          className="min-h-0 w-full flex-1 resize-none bg-transparent text-2xs text-secondary-foreground outline-none placeholder:text-muted-foreground"
        />
      </NoteCard>
    </div>
  )
}

function TextEditor({
  node,
  onDone,
}: {
  node: SpaceNode
  onDone: (patch: NodeEdit) => void
}) {
  const [text, setText] = useState(node.text ?? "")
  return (
    <textarea
      ref={focusAtEnd}
      value={text}
      onChange={(e) => setText(e.target.value)}
      onKeyDown={fieldKeys}
      onPointerDown={(e) => e.stopPropagation()}
      onBlur={() => onDone({ text })}
      placeholder="Text"
      aria-label="Text"
      className="size-full resize-none rounded-md bg-transparent px-1 py-0.5 text-md font-semibold text-foreground outline-none placeholder:text-muted-foreground"
    />
  )
}

/**
 * A shape in a 100×100 box stretched to the node. The stroke does not
 * scale with the stretch (or the zoom), so a wide rectangle and a tall one
 * have the same hairline edge.
 */
function ShapeSvg({ shape }: { shape: SpaceShape }) {
  const common = {
    className: "fill-card/80 stroke-border-strong",
    strokeWidth: 1.5,
    vectorEffect: "non-scaling-stroke" as const,
  }
  return (
    <svg
      className="absolute inset-0 size-full overflow-visible"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {shape === "ellipse" ? (
        <ellipse cx={50} cy={50} rx={49} ry={49} {...common} />
      ) : shape === "diamond" ? (
        <polygon points="50,1 99,50 50,99 1,50" {...common} />
      ) : shape === "triangle" ? (
        <polygon points="50,1 99,99 1,99" {...common} />
      ) : (
        <rect x={1} y={1} width={98} height={98} {...common} />
      )}
    </svg>
  )
}

export { SpaceNodeView }
