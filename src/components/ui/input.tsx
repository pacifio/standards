import { Input as InputPrimitive } from "@base-ui/react/input"
import { cva } from "class-variance-authority"
import type { VariantProps } from "class-variance-authority"
import { cn } from "cn"

/**
 * A text input.
 *
 * Focus lifts the border to `border-strong` rather than drawing a ring — the
 * global `:focus-visible` outline is the keyboard affordance, and an input
 * that gains BOTH a ring and a brighter border reads as two states at once.
 *
 * The fill is `bg-surface`, one step darker than the surface it sits on in
 * dark and one step lighter in light. That inset reading is what says "you can
 * type here" without a heavier border.
 */

const inputVariants = cva(
  [
    "w-full min-w-0 rounded-md border border-input bg-surface text-foreground",
    "duration-fast transition-colors ease-out-strong",
    "placeholder:text-muted-foreground",
    "focus:border-border-strong",
    "disabled:cursor-not-allowed disabled:opacity-50",
    "aria-invalid:border-destructive",
    "file:inline-flex file:border-0 file:bg-transparent file:font-medium file:text-foreground",
  ],
  {
    variants: {
      size: {
        xs: "h-control-xs px-1.5 text-2xs",
        sm: "h-control-sm px-2 text-xs",
        md: "h-control-md px-2 text-xs",
        lg: "h-control-lg px-2.5 text-sm",
      },
    },
    defaultVariants: { size: "md" },
  }
)

function Input({
  className,
  size,
  ...props
}: Omit<InputPrimitive.Props, "size"> & VariantProps<typeof inputVariants>) {
  return (
    <InputPrimitive
      data-slot="input"
      className={cn(inputVariants({ size }), className)}
      {...props}
    />
  )
}

export { Input, inputVariants }
