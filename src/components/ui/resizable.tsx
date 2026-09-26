"use client"

import { Group, Panel, Separator } from "react-resizable-panels"
import { cn } from "cn"

/**
 * Split panes, on react-resizable-panels v4 (`Group / Panel / Separator` —
 * the v3 `PanelGroup / PanelResizeHandle` names are gone).
 *
 * The handle is a 1px rule, not a grab bar. A visible gutter between two panes
 * costs horizontal space permanently to advertise an interaction that happens
 * once a week; the hit area is widened invisibly with `after:` instead, so the
 * line stays 1px and the target stays ~10px.
 */

function ResizableGroup({
  className,
  ...props
}: React.ComponentProps<typeof Group>) {
  return (
    <Group
      data-slot="resizable-group"
      className={cn("flex h-full w-full", className)}
      {...props}
    />
  )
}

const ResizablePanel = Panel

function ResizableHandle({
  className,
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="resizable-handle"
      className={cn(
        "relative w-px shrink-0 cursor-col-resize bg-border",
        "duration-fast transition-colors ease-out-strong",
        "hover:bg-border-strong data-[separator=active]:bg-primary",
        // The invisible ~10px target around the 1px line.
        "after:absolute after:inset-y-0 after:-left-1 after:w-2.5 after:content-['']",
        className
      )}
      {...props}
    />
  )
}

export { ResizableGroup, ResizableHandle, ResizablePanel }
