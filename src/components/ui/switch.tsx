"use client"

import { Switch as SwitchPrimitive } from "@base-ui/react/switch"
import { cn } from "cn"

/**
 * A toggle.
 *
 * The control settings surfaces are built from: a row of label +
 * description with one of these hard-right. Off is the input fill, on is the
 * primary ink — no green, because "on" is a state, not a success.
 *
 * The `after:` inset expands the hit target past the 16px track to a
 * comfortable 32px without changing the painted size.
 */
function Switch({
  className,
  size = "md",
  ...props
}: SwitchPrimitive.Root.Props & { size?: "sm" | "md" }) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "group/switch relative inline-flex shrink-0 items-center rounded-full p-px",
        "duration-fast transition-colors ease-out-strong",
        "after:absolute after:-inset-x-2 after:-inset-y-2",
        "data-[size=md]:h-4 data-[size=md]:w-7",
        "data-[size=sm]:h-3.5 data-[size=sm]:w-6",
        "data-checked:bg-primary data-unchecked:bg-input",
        "data-disabled:cursor-not-allowed data-disabled:opacity-50",
        "aria-invalid:outline aria-invalid:outline-destructive",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block rounded-full bg-background",
          "duration-fast transition-transform ease-out-strong",
          "group-data-[size=md]/switch:size-3.5 group-data-[size=sm]/switch:size-3",
          "data-unchecked:translate-x-0",
          "group-data-[size=md]/switch:data-checked:translate-x-3",
          "group-data-[size=sm]/switch:data-checked:translate-x-2.5"
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
