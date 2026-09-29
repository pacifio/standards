import { avatarFor } from "@/mock/people"
import { initialsOf } from "@/mock/initials"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

/**
 * A person's avatar: their photo when there is one, their initials when
 * there is not (or while it loads).
 *
 * Every screen that shows a person goes through this, so a face is the same
 * face everywhere. In the mock the photo is looked up from the name or email
 * (`avatarFor`); in the real app pass the user's `image` and the lookup is
 * never consulted.
 */
function PersonAvatar({
  name,
  email,
  image,
  initials,
  size,
  className,
}: {
  name: string
  email?: string
  /** An explicit photo URL; wins over the lookup. */
  image?: string
  /** Fallback initials, when the caller already has them. */
  initials?: string
  size?: "xs" | "sm" | "md" | "lg"
  className?: string
}) {
  const src = image ?? avatarFor(name) ?? avatarFor(email)
  return (
    <Avatar size={size} className={className}>
      {src && <AvatarImage src={src} alt="" />}
      <AvatarFallback>{initials ?? initialsOf(name, email)}</AvatarFallback>
    </Avatar>
  )
}

export { PersonAvatar }
