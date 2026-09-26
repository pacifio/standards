"use client"

import { ContextMenu as ContextMenuPrimitive } from "@base-ui/react/context-menu"
import { Menu as MenuPrimitive } from "@base-ui/react/menu"
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react"
import { cn } from "cn"

import {
  menuIndicatorSlot,
  menuItem,
  menuLabel,
  menuPopup,
  menuPositioner,
  menuSeparator,
  menuShortcut,
} from "@/components/ui/menu-styles"

/**
 * A right-click menu. Structurally identical to the dropdown menu and styled
 * from the same strings — only the trigger differs.
 */

const ContextMenu = ContextMenuPrimitive.Root
const ContextMenuTrigger = ContextMenuPrimitive.Trigger
const ContextMenuPortal = MenuPrimitive.Portal
const ContextMenuGroup = MenuPrimitive.Group
const ContextMenuSub = MenuPrimitive.SubmenuRoot
const ContextMenuRadioGroup = MenuPrimitive.RadioGroup

function ContextMenuContent({
  className,
  ...props
}: MenuPrimitive.Popup.Props) {
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Positioner className={menuPositioner}>
        <MenuPrimitive.Popup
          data-slot="context-menu-content"
          className={cn(menuPopup, className)}
          {...props}
        />
      </MenuPrimitive.Positioner>
    </MenuPrimitive.Portal>
  )
}

function ContextMenuLabel({
  className,
  ...props
}: MenuPrimitive.GroupLabel.Props) {
  return (
    <MenuPrimitive.GroupLabel
      data-slot="context-menu-label"
      className={cn(menuLabel, className)}
      {...props}
    />
  )
}

function ContextMenuItem({
  className,
  inset,
  variant = "default",
  ...props
}: MenuPrimitive.Item.Props & {
  inset?: boolean
  variant?: "default" | "destructive"
}) {
  return (
    <MenuPrimitive.Item
      data-slot="context-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(menuItem, className)}
      {...props}
    />
  )
}

function ContextMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: MenuPrimitive.SubmenuTrigger.Props & { inset?: boolean }) {
  return (
    <MenuPrimitive.SubmenuTrigger
      data-slot="context-menu-sub-trigger"
      data-inset={inset}
      className={cn(menuItem, className)}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto" />
    </MenuPrimitive.SubmenuTrigger>
  )
}

function ContextMenuSubContent({
  className,
  ...props
}: MenuPrimitive.Popup.Props) {
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Positioner
        className={menuPositioner}
        side="inline-end"
        alignOffset={-3}
      >
        <MenuPrimitive.Popup
          data-slot="context-menu-sub-content"
          className={cn(menuPopup, "w-auto", className)}
          {...props}
        />
      </MenuPrimitive.Positioner>
    </MenuPrimitive.Portal>
  )
}

function ContextMenuCheckboxItem({
  className,
  children,
  ...props
}: MenuPrimitive.CheckboxItem.Props) {
  return (
    <MenuPrimitive.CheckboxItem
      data-slot="context-menu-checkbox-item"
      className={cn(menuItem, "pl-7", className)}
      {...props}
    >
      <span className={menuIndicatorSlot}>
        <MenuPrimitive.CheckboxItemIndicator>
          <CheckIcon className="size-3.5" />
        </MenuPrimitive.CheckboxItemIndicator>
      </span>
      {children}
    </MenuPrimitive.CheckboxItem>
  )
}

function ContextMenuRadioItem({
  className,
  children,
  ...props
}: MenuPrimitive.RadioItem.Props) {
  return (
    <MenuPrimitive.RadioItem
      data-slot="context-menu-radio-item"
      className={cn(menuItem, "pl-7", className)}
      {...props}
    >
      <span className={menuIndicatorSlot}>
        <MenuPrimitive.RadioItemIndicator>
          <CircleIcon className="size-2 fill-current" />
        </MenuPrimitive.RadioItemIndicator>
      </span>
      {children}
    </MenuPrimitive.RadioItem>
  )
}

function ContextMenuSeparator({
  className,
  ...props
}: MenuPrimitive.Separator.Props) {
  return (
    <MenuPrimitive.Separator
      data-slot="context-menu-separator"
      className={cn(menuSeparator, className)}
      {...props}
    />
  )
}

function ContextMenuShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="context-menu-shortcut"
      className={cn(menuShortcut, className)}
      {...props}
    />
  )
}

export {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuPortal,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
}
