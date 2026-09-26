"use client"

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { XIcon } from "lucide-react"
import { cn } from "cn"

import { IconButton } from "@/components/ui/icon-button"

/**
 * A modal dialog.
 *
 * Layering: the backdrop is `z-overlay` (100) and the popup `z-modal` (110),
 * both named. A menu opened from inside a dialog lands on `z-popover` (200),
 * which is ABOVE the dialog on purpose — otherwise the menu is clipped behind
 * the surface that opened it.
 *
 * The scrim is a flat 60% black in both appearances. It is the one colour in
 * the system that is not a theme key: a scrim's job is to push the page away
 * from the reader, and only darkening does that. A light scrim over a light
 * page pushes nothing.
 *
 * Surface is `bg-card` with a real border, not a ring: this system is
 * border-defined. The shadow says "floating", the border says "edge".
 */

const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger
const DialogPortal = DialogPrimitive.Portal
const DialogClose = DialogPrimitive.Close

function DialogOverlay({
  className,
  ...props
}: DialogPrimitive.Backdrop.Props) {
  return (
    <DialogPrimitive.Backdrop
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 z-overlay scrim",
        "data-open:animate-fade-in data-closed:animate-fade-out",
        className
      )}
      {...props}
    />
  )
}

type DialogContentProps = DialogPrimitive.Popup.Props & {
  size?: "sm" | "md" | "lg"
  /** Hides the built-in close button, for a dialog that must be answered. */
  hideClose?: boolean
}

function DialogContent({
  className,
  children,
  size = "md",
  hideClose = false,
  ...props
}: DialogContentProps) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Popup
        data-slot="dialog-content"
        data-size={size}
        className={cn(
          "fixed top-1/2 left-1/2 z-modal -translate-x-1/2 -translate-y-1/2",
          "flex w-full flex-col gap-3 p-4",
          "rounded-xl bg-popover text-popover-foreground shadow-lg ring-1 ring-foreground/10 outline-none",
          "data-[size=sm]:max-w-[min(24rem,calc(100vw-2rem))]",
          "data-[size=md]:max-w-[min(32rem,calc(100vw-2rem))]",
          "data-[size=lg]:max-w-[min(44rem,calc(100vw-2rem))]",
          "data-open:animate-scale-in data-closed:animate-scale-out",
          className
        )}
        {...props}
      >
        {children}
        {!hideClose && (
          <DialogPrimitive.Close
            render={
              <IconButton
                icon={XIcon}
                label="Close"
                size="sm"
                className="absolute top-2.5 right-2.5"
              />
            }
          />
        )}
      </DialogPrimitive.Popup>
    </DialogPortal>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      // pr-8 keeps the title clear of the close button.
      className={cn("flex flex-col gap-1 pr-8", className)}
      {...props}
    />
  )
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    />
  )
}

function DialogTitle({ className, ...props }: DialogPrimitive.Title.Props) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("heading", className)}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}: DialogPrimitive.Description.Props) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-xs text-secondary-foreground", className)}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
