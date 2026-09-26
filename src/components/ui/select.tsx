"use client"

import { Select as SelectPrimitive } from "@base-ui/react/select"
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react"
import { cn } from "cn"

import {
  menuIndicatorSlot,
  menuItem,
  menuLabel,
  menuPopup,
  menuPositioner,
  menuSeparator,
} from "@/components/ui/menu-styles"

/**
 * A select.
 *
 * The control the server web app never had — every choice there is a raw
 * `<select>`, which is why its filter bars render differently on macOS, Windows
 * and Linux. This one is the row-right control in Cursor's settings cards:
 * `GPT-5.4 High ⌄`, quiet until you touch it.
 *
 * Two trigger looks. `bordered` is a form field. `ghost` is a control that
 * sits inside a toolbar or a settings row, where a box around it would be the
 * fourth rectangle in a row of three.
 *
 * The popup is the shared menu surface — a select IS a menu of one choice.
 */

const Select = SelectPrimitive.Root
const SelectValue = SelectPrimitive.Value

function SelectGroup({ className, ...props }: SelectPrimitive.Group.Props) {
  return (
    <SelectPrimitive.Group
      data-slot="select-group"
      className={cn("scroll-my-1", className)}
      {...props}
    />
  )
}

function SelectTrigger({
  className,
  size = "md",
  variant = "bordered",
  children,
  ...props
}: SelectPrimitive.Trigger.Props & {
  size?: "sm" | "md" | "lg"
  variant?: "bordered" | "ghost"
}) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      data-variant={variant}
      className={cn(
        "flex w-fit items-center justify-between gap-1.5 rounded-sm px-2",
        "text-xs whitespace-nowrap select-none",
        "duration-fast transition-colors ease-out-strong",
        "data-[size=lg]:h-control-lg data-[size=md]:h-control-md data-[size=sm]:h-control-sm",
        "data-[variant=bordered]:border data-[variant=bordered]:border-input data-[variant=bordered]:bg-panel-input",
        "data-[variant=bordered]:focus:border-border-strong",
        "data-[variant=ghost]:text-secondary-foreground data-[variant=ghost]:hover:bg-element-hover data-[variant=ghost]:hover:text-foreground",
        "data-popup-open:bg-element-active",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-destructive",
        "data-placeholder:text-muted-foreground",
        "*:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-1.5",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon
        render={
          <ChevronDownIcon className="pointer-events-none size-3.5 text-muted-foreground" />
        }
      />
    </SelectPrimitive.Trigger>
  )
}

function SelectContent({
  className,
  children,
  side = "bottom",
  sideOffset = 4,
  align = "start",
  ...props
}: SelectPrimitive.Popup.Props &
  Pick<SelectPrimitive.Positioner.Props, "side" | "sideOffset" | "align">) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner
        className={menuPositioner}
        side={side}
        sideOffset={sideOffset}
        align={align}
      >
        <SelectPrimitive.Popup
          data-slot="select-content"
          className={cn(menuPopup, className)}
          {...props}
        >
          <SelectScrollUpButton />
          {children}
          <SelectScrollDownButton />
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  )
}

function SelectLabel({
  className,
  ...props
}: SelectPrimitive.GroupLabel.Props) {
  return (
    <SelectPrimitive.GroupLabel
      data-slot="select-label"
      className={cn(menuLabel, className)}
      {...props}
    />
  )
}

function SelectItem({
  className,
  children,
  ...props
}: SelectPrimitive.Item.Props) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      // pl-7 reserves the check gutter so labels line up whether or not the
      // item is the selected one.
      className={cn(menuItem, "pl-7", className)}
      {...props}
    >
      <span className={menuIndicatorSlot}>
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="size-3.5" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}

function SelectSeparator({
  className,
  ...props
}: SelectPrimitive.Separator.Props) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn(menuSeparator, className)}
      {...props}
    />
  )
}

const scrollButton =
  "flex h-5 cursor-default items-center justify-center bg-popover text-muted-foreground"

function SelectScrollUpButton({
  className,
  ...props
}: SelectPrimitive.ScrollUpArrow.Props) {
  return (
    <SelectPrimitive.ScrollUpArrow
      data-slot="select-scroll-up-button"
      className={cn(scrollButton, className)}
      {...props}
    >
      <ChevronUpIcon className="size-3.5" />
    </SelectPrimitive.ScrollUpArrow>
  )
}

function SelectScrollDownButton({
  className,
  ...props
}: SelectPrimitive.ScrollDownArrow.Props) {
  return (
    <SelectPrimitive.ScrollDownArrow
      data-slot="select-scroll-down-button"
      className={cn(scrollButton, className)}
      {...props}
    >
      <ChevronDownIcon className="size-3.5" />
    </SelectPrimitive.ScrollDownArrow>
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
