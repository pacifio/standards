import { Avatar as AvatarPrimitive } from "@base-ui/react/avatar"
import { cn } from "cn"

/**
 * An identity mark.
 *
 * Sizes are the control ladder, so an avatar in a 28px row is exactly as tall
 * as the button beside it. The fallback is initials on `bg-muted` — never a
 * generated hue, because a members table with eight colours in it reads as
 * eight categories rather than eight people.
 */

type AvatarSize = "xs" | "sm" | "md" | "lg"

function Avatar({
  className,
  size = "md",
  ...props
}: AvatarPrimitive.Root.Props & { size?: AvatarSize }) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      data-size={size}
      className={cn(
        "group/avatar relative flex shrink-0 overflow-hidden rounded-full select-none",
        "ring-1 ring-border ring-inset",
        "data-[size=xs]:size-control-xs",
        "data-[size=sm]:size-control-sm",
        "data-[size=md]:size-control-md",
        "data-[size=lg]:size-control-xl",
        className
      )}
      {...props}
    />
  )
}

function AvatarImage({ className, ...props }: AvatarPrimitive.Image.Props) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full object-cover", className)}
      {...props}
    />
  )
}

function AvatarFallback({
  className,
  ...props
}: AvatarPrimitive.Fallback.Props) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "flex size-full items-center justify-center bg-muted font-medium text-secondary-foreground uppercase",
        "group-data-[size=xs]/avatar:text-3xs",
        "group-data-[size=sm]/avatar:text-3xs",
        "group-data-[size=md]/avatar:text-2xs",
        "group-data-[size=lg]/avatar:text-xs",
        className
      )}
      {...props}
    />
  )
}

/**
 * Overlapping avatars. The ring is the page background, not a border, so the
 * gap between two faces reads as a gap rather than an outline.
 */
function AvatarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="avatar-group"
      className={cn(
        "group/avatar-group flex -space-x-1.5",
        "*:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-background",
        className
      )}
      {...props}
    />
  )
}

/** The "+3" cap at the end of a group. */
function AvatarGroupCount({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="avatar-group-count"
      className={cn(
        "relative flex size-control-md shrink-0 items-center justify-center",
        "rounded-full bg-muted text-2xs font-medium text-secondary-foreground",
        "ring-2 ring-background",
        className
      )}
      {...props}
    />
  )
}

export { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarImage }
