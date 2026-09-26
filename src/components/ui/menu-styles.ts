/**
 * The shared class vocabulary for every menu surface.
 *
 * Dropdown menus and context menus are the same object opened two ways, so
 * they read from one set of strings. The registry ships them as two
 * independently-styled files, which is how a menu item ends up 28px tall in
 * one and 26px in the other.
 *
 * Popovers and the command palette also borrow `menuPopup` — anything on the
 * `z-popover` layer is the same kind of surface.
 */

export const menuPositioner = "isolate z-popover outline-none"

export const menuPopup = [
  "max-h-(--available-height) min-w-40 overflow-x-hidden overflow-y-auto",
  "origin-(--transform-origin)",
  "rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-md outline-none",
  "data-open:animate-scale-in data-closed:animate-scale-out",
].join(" ")

export const menuItem = [
  "group/menu-item relative flex min-h-control-md cursor-default items-center gap-2",
  "rounded-md px-2 py-1 text-xs select-none outline-none",
  "text-secondary-foreground",
  // Menu focus is hover-and-keyboard both; Base UI drives it off `focus`.
  "focus:bg-element-hover focus:text-foreground",
  "data-popup-open:bg-element-hover data-popup-open:text-foreground",
  "data-inset:pl-7",
  "data-[variant=destructive]:text-error",
  "data-[variant=destructive]:focus:bg-error-muted",
  "data-disabled:pointer-events-none data-disabled:opacity-50",
  "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
].join(" ")

/** A group heading inside a menu. Small caps, never a full-height row. */
export const menuLabel = "eyebrow px-2 py-1.5"

/** The keyboard hint pushed to the trailing edge of an item. */
export const menuShortcut =
  "ml-auto pl-4 text-3xs tracking-widest text-disabled tnum"

export const menuSeparator = "-mx-1 my-1 h-px bg-border-subtle"

/** The fixed gutter a check or radio dot occupies, so labels line up. */
export const menuIndicatorSlot =
  "pointer-events-none absolute left-2 flex size-3.5 items-center justify-center"
