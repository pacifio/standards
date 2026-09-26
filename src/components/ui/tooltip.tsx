import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip"
import { cn } from "cn"

import {
  TOOLTIP_OPEN_DELAY,
  TOOLTIP_WARM_WINDOW,
} from "@/components/ui/tooltip-timing"

/**
 * A tooltip.
 *
 * Deliberately NOT inverted. The shadcn default paints a light chip on a dark
 * page (and vice versa), which is the loudest thing on screen for a label that
 * is, by definition, secondary information. This system uses the popover
 * surface plus a border — the same material as a menu, because it is the same
 * kind of floating thing.
 *
 * Timing comes from `tooltip-timing.ts`. See the note there about the warm
 * window; it is the difference between a usable icon toolbar and an unusable
 * one.
 */

function TooltipProvider({
  delay = TOOLTIP_OPEN_DELAY,
  closeDelay = 0,
  timeout = TOOLTIP_WARM_WINDOW,
  ...props
}: TooltipPrimitive.Provider.Props) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delay={delay}
      closeDelay={closeDelay}
      timeout={timeout}
      {...props}
    />
  )
}

const Tooltip = TooltipPrimitive.Root
const TooltipTrigger = TooltipPrimitive.Trigger

function TooltipContent({
  className,
  side = "top",
  sideOffset = 6,
  align = "center",
  alignOffset = 0,
  children,
  ...props
}: TooltipPrimitive.Popup.Props &
  Pick<
    TooltipPrimitive.Positioner.Props,
    "align" | "alignOffset" | "side" | "sideOffset"
  >) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        className="isolate z-tooltip"
      >
        <TooltipPrimitive.Popup
          data-slot="tooltip-content"
          className={cn(
            "inline-flex w-fit max-w-xs origin-(--transform-origin) items-center gap-1.5",
            "rounded-md border border-border bg-popover px-2 py-1",
            "text-2xs text-balance text-popover-foreground shadow-md",
            // A keycap inside a tooltip drops its own border — the tooltip
            // already has one, and two hairlines 2px apart read as a smudge.
            "has-data-[slot=kbd]:pr-1 **:data-[slot=kbd]:border-transparent",
            "data-open:animate-scale-in data-closed:animate-scale-out",
            className
          )}
          {...props}
        >
          {children}
        </TooltipPrimitive.Popup>
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  )
}

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger }
