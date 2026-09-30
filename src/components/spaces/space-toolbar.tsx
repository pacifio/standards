"use client"

import {
  CircleIcon,
  DiamondIcon,
  FrameIcon,
  ImageIcon,
  PanelBottomIcon,
  PanelLeftIcon,
  PanelRightIcon,
  Redo2Icon,
  Settings2Icon,
  SquareIcon,
  StickyNoteIcon,
  TriangleIcon,
  TypeIcon,
  Undo2Icon,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { cn } from "cn"

import type { SpaceShape } from "@/mock/spaces"
import { GLASS, Hint } from "@/components/spaces/space-chrome"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Icon } from "@/components/ui/icon"
import { Kbd } from "@/components/ui/kbd"

/** What a click on empty canvas does. Anything but `select` creates. */
export type SpaceTool =
  "select" | "note" | "text" | "frame" | "image" | `shape:${SpaceShape}`

/** Which edge the tool dock hugs. */
export type SpaceDock = "bottom" | "left" | "right"

type ToolDef = { tool: SpaceTool; icon: LucideIcon; label: string }

const BLOCKS: Array<ToolDef> = [
  { tool: "note", icon: StickyNoteIcon, label: "Note" },
  { tool: "text", icon: TypeIcon, label: "Text" },
  { tool: "frame", icon: FrameIcon, label: "Frame" },
]

const SHAPES: Array<ToolDef> = [
  { tool: "shape:rectangle", icon: SquareIcon, label: "Rectangle" },
  { tool: "shape:ellipse", icon: CircleIcon, label: "Ellipse" },
  { tool: "shape:diamond", icon: DiamondIcon, label: "Diamond" },
  { tool: "shape:triangle", icon: TriangleIcon, label: "Triangle" },
]

const DOCKS: Array<{ dock: SpaceDock; label: string; icon: LucideIcon }> = [
  { dock: "bottom", label: "Bottom", icon: PanelBottomIcon },
  { dock: "left", label: "Left", icon: PanelLeftIcon },
  { dock: "right", label: "Right", icon: PanelRightIcon },
]

/**
 * The floating tool dock: blocks, shapes, media, history, and — below the
 * last divider, because it is a layout preference and not a drawing tool —
 * where the dock itself lives.
 *
 * Picking a tool arms it for one click on the canvas; picking the armed
 * tool again disarms it. Along the bottom edge it is a row; on a side it is
 * a column pinned to that edge's middle, with tooltips opening away from
 * the edge so they never cover the canvas it is docked against.
 */
function SpaceToolbar({
  tool,
  onTool,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  dock,
  onDock,
}: {
  tool: SpaceTool
  onTool: (tool: SpaceTool) => void
  canUndo: boolean
  canRedo: boolean
  onUndo: () => void
  onRedo: () => void
  dock: SpaceDock
  onDock: (dock: SpaceDock) => void
}) {
  const row = dock === "bottom"
  const side = row ? "top" : dock === "left" ? "right" : "left"
  const divider = row
    ? "mx-0.5 h-5 w-px bg-border"
    : "my-0.5 h-px w-5 bg-border"

  const toolButton = (def: ToolDef) => (
    <DockButton
      key={def.tool}
      icon={def.icon}
      label={def.label}
      side={side}
      active={tool === def.tool}
      onClick={() => onTool(tool === def.tool ? "select" : def.tool)}
    />
  )

  return (
    <div
      className={cn(
        "absolute z-panel flex items-center gap-1 p-1",
        GLASS,
        row
          ? "bottom-3 left-1/2 -translate-x-1/2 flex-row"
          : "top-1/2 -translate-y-1/2 flex-col",
        dock === "left" && "left-3",
        dock === "right" && "right-3"
      )}
    >
      {BLOCKS.map(toolButton)}
      <div aria-hidden="true" className={divider} />
      {SHAPES.map(toolButton)}
      <div aria-hidden="true" className={divider} />
      {toolButton({ tool: "image", icon: ImageIcon, label: "Image" })}
      <div aria-hidden="true" className={divider} />
      <DockButton
        icon={Undo2Icon}
        label="Undo"
        shortcut="⌘Z"
        side={side}
        disabled={!canUndo}
        onClick={onUndo}
      />
      <DockButton
        icon={Redo2Icon}
        label="Redo"
        shortcut="⇧⌘Z"
        side={side}
        disabled={!canRedo}
        onClick={onRedo}
      />
      <div aria-hidden="true" className={divider} />

      <DropdownMenu>
        <Hint label="Dock position" side={side}>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                aria-label="Dock position"
                className={cn(DOCK_BUTTON, "aria-expanded:bg-foreground/10")}
              />
            }
          >
            <Icon icon={Settings2Icon} size="md" />
          </DropdownMenuTrigger>
        </Hint>
        <DropdownMenuContent
          side={side}
          align="end"
          sideOffset={8}
          className="w-40"
        >
          <DropdownMenuGroup>
            <DropdownMenuLabel>Dock position</DropdownMenuLabel>
            <DropdownMenuRadioGroup
              value={dock}
              onValueChange={(d) => onDock(d as SpaceDock)}
            >
              {DOCKS.map((d) => (
                <DropdownMenuRadioItem key={d.dock} value={d.dock}>
                  <Icon
                    icon={d.icon}
                    size="xs"
                    className="text-muted-foreground"
                  />
                  {d.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

const DOCK_BUTTON = cn(
  "flex size-8 items-center justify-center rounded-lg transition-colors",
  "text-secondary-foreground hover:bg-element-hover hover:text-foreground",
  "disabled:pointer-events-none disabled:opacity-30"
)

/** A 32px dock control with its label (and shortcut) in a tooltip. */
function DockButton({
  icon,
  label,
  shortcut,
  side,
  active,
  disabled,
  onClick,
}: {
  icon: LucideIcon
  label: string
  shortcut?: string
  side: "top" | "left" | "right"
  active?: boolean
  disabled?: boolean
  onClick: () => void
}) {
  return (
    <Hint
      side={side}
      label={
        <>
          {label}
          {shortcut && <Kbd>{shortcut}</Kbd>}
        </>
      }
    >
      <button
        type="button"
        aria-label={label}
        aria-pressed={active}
        disabled={disabled}
        onClick={onClick}
        className={cn(
          DOCK_BUTTON,
          active && "bg-foreground/10 text-foreground hover:bg-foreground/10"
        )}
      >
        <Icon icon={icon} size="md" />
      </button>
    </Hint>
  )
}

export { SpaceToolbar }
