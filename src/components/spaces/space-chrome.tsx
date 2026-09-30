"use client"

import {
  ChevronDownIcon,
  CrosshairIcon,
  DownloadIcon,
  ExternalLinkIcon,
  FileImageIcon,
  FileTextIcon,
  FileType2Icon,
  MinusIcon,
  PanelLeftIcon,
  PlusIcon,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { cn } from "cn"

import type { SpacePage } from "@/mock/spaces"
import { PersonAvatar } from "@/components/patterns/person-avatar"
import { PEER_INK } from "@/components/spaces/space-cursors"
import type { SpacePeer } from "@/components/spaces/space-cursors"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Icon } from "@/components/ui/icon"
import { IconButton } from "@/components/ui/icon-button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

/**
 * The floating chrome over the canvas — the desktop app's design: top-left
 * a page pill (pages toggle · page switcher · zoom · fit), top-right one
 * pill carrying presence, the tab link and export. Divided rather than
 * scattered, so the four corners of the canvas stay the canvas's.
 */

/** The glass every floating control group is cut from. */
export const GLASS =
  "rounded-xl border border-border bg-card/70 shadow-md backdrop-blur-2xl"

/** The hairline between groups inside a pill. */
function PillDivider() {
  return <div aria-hidden="true" className="mx-0.5 h-4 w-px bg-border" />
}

/**
 * A tooltip around one control. The trigger IS the child (Base UI's
 * `render`), so there is no wrapper span to break the pill's flex row.
 */
export function Hint({
  label,
  side = "bottom",
  children,
}: {
  label: React.ReactNode
  side?: "top" | "bottom" | "left" | "right"
  children: React.ReactElement<Record<string, unknown>>
}) {
  return (
    <Tooltip>
      <TooltipTrigger render={children} />
      <TooltipContent side={side} sideOffset={6}>
        {label}
      </TooltipContent>
    </Tooltip>
  )
}

/** A 24px icon control inside a pill. */
function PillButton({
  icon,
  label,
  onClick,
  pressed,
}: {
  icon: LucideIcon
  label: string
  onClick?: () => void
  pressed?: boolean
}) {
  return (
    <Hint label={label}>
      <IconButton
        icon={icon}
        label={label}
        size="sm"
        onClick={onClick}
        aria-pressed={pressed}
        className={cn(
          "text-muted-foreground",
          pressed && "bg-element-selected text-foreground"
        )}
      />
    </Hint>
  )
}

/**
 * Top-left: the pages toggle, the page you are on (which is also the
 * shorthand page switcher — a canvas is usually two clicks from another
 * page), the zoom readout and fit.
 */
function SpaceHeaderPill({
  pages,
  activePageId,
  onOpenPage,
  pagesOpen,
  onTogglePages,
  where,
  zoom,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onFit,
}: {
  pages: ReadonlyArray<SpacePage>
  activePageId: string
  onOpenPage: (id: string) => void
  pagesOpen: boolean
  onTogglePages: () => void
  /** The conversation this Space belongs to, as it is written in chat. */
  where: string
  zoom: number
  onZoomIn: () => void
  onZoomOut: () => void
  onZoomReset: () => void
  onFit: () => void
}) {
  const active = pages.find((p) => p.id === activePageId)
  const selectable = pages.filter((p) => p.kind === "page")

  return (
    <div
      className={cn(
        "absolute top-3 left-3 z-panel flex h-8 items-center gap-1 px-1",
        GLASS
      )}
    >
      <PillButton
        icon={PanelLeftIcon}
        label={pagesOpen ? "Hide pages" : "Show pages"}
        onClick={onTogglePages}
        pressed={pagesOpen}
      />
      <PillDivider />

      <DropdownMenu>
        <Hint label={`Live in ${where} — every change is shared`}>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                className="flex h-6 items-center gap-1.5 rounded-md px-1.5 transition-colors hover:bg-element-hover aria-expanded:bg-element-active"
              />
            }
          >
            <span className="size-1.5 shrink-0 rounded-full bg-success" />
            <span className="max-w-44 truncate text-xs font-semibold text-foreground">
              {active?.name ?? "Space"}
            </span>
            <Icon
              icon={ChevronDownIcon}
              size="xs"
              className="text-muted-foreground"
            />
          </DropdownMenuTrigger>
        </Hint>
        <DropdownMenuContent sideOffset={8} className="w-56">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Pages</DropdownMenuLabel>
            <DropdownMenuRadioGroup
              value={activePageId}
              onValueChange={(id) => onOpenPage(String(id))}
            >
              {selectable.map((p) => (
                <DropdownMenuRadioItem key={p.id} value={p.id}>
                  <span className="min-w-0 flex-1 truncate">{p.name}</span>
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <PillDivider />
      <PillButton icon={MinusIcon} label="Zoom out" onClick={onZoomOut} />
      <Hint label="Reset zoom to 100%">
        <button
          type="button"
          onClick={onZoomReset}
          className="flex h-6 min-w-10 items-center justify-center rounded-md px-1 text-xs text-secondary-foreground tabular-nums transition-colors hover:bg-element-hover hover:text-foreground"
        >
          {Math.round(zoom * 100)}%
        </button>
      </Hint>
      <PillButton icon={PlusIcon} label="Zoom in" onClick={onZoomIn} />
      <PillDivider />
      <PillButton icon={CrosshairIcon} label="Fit to view" onClick={onFit} />
    </div>
  )
}

const FORMATS: Array<{ label: string; icon: LucideIcon }> = [
  { label: "PNG", icon: FileImageIcon },
  { label: "JPEG", icon: FileImageIcon },
  { label: "SVG", icon: FileType2Icon },
  { label: "PDF", icon: FileTextIcon },
]

/**
 * Top-right: who is here, the link out, and export. You are always last
 * in the stack — an empty corner reads as "nobody is here", which is never
 * true while you are. Each peer's face is ringed in their cursor's colour,
 * so the avatar and the arrow on the canvas read as the same person.
 */
function SpaceActionPill({
  peers,
  self,
}: {
  peers: ReadonlyArray<SpacePeer>
  self: { name: string; image?: string }
}) {
  return (
    <div
      className={cn(
        "absolute top-3 right-3 z-panel flex h-8 items-center gap-1 px-1.5",
        GLASS
      )}
    >
      <div className="flex items-center gap-1.5 pr-1 pl-0.5">
        {peers.map((p) => (
          <Hint key={p.id} label={p.name}>
            <span
              className={cn(
                "inline-flex rounded-full ring-2 ring-offset-1 ring-offset-card",
                PEER_INK[p.hue].ring
              )}
            >
              <PersonAvatar name={p.name} image={p.image} size="xs" />
            </span>
          </Hint>
        ))}
        <Hint label={`${self.name} (you)`}>
          <span className="inline-flex rounded-full ring-2 ring-card">
            <PersonAvatar name={self.name} image={self.image} size="xs" />
          </span>
        </Hint>
      </div>

      <PillDivider />
      <PillButton icon={ExternalLinkIcon} label="Open in new tab" />
      <PillDivider />

      <DropdownMenu>
        <Hint label="Export canvas">
          <DropdownMenuTrigger
            render={
              <IconButton
                icon={DownloadIcon}
                label="Export canvas"
                size="sm"
                className="text-muted-foreground"
              />
            }
          />
        </Hint>
        <DropdownMenuContent align="end" sideOffset={8} className="w-36">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Export as</DropdownMenuLabel>
            {FORMATS.map((f) => (
              <DropdownMenuItem key={f.label}>
                <Icon
                  icon={f.icon}
                  size="xs"
                  className="text-muted-foreground"
                />
                {f.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export { SpaceActionPill, SpaceHeaderPill }
