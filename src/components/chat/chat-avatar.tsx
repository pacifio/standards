import { cn } from "cn"

import { MEMBERS } from "@/mock/data"
import { ONLINE } from "@/mock/chat"
import { PersonAvatar } from "@/components/patterns/person-avatar"

/** A member by id, with a name that is never empty. */
function member(id: string) {
  const m = MEMBERS.find((x) => x.id === id)
  return m
    ? { id, name: m.name || m.email, email: m.email, image: m.image }
    : { id, name: "Former member", email: undefined, image: undefined }
}

/** "Uzayer Masud" → "Uzayer". */
const firstName = (name: string) => name.split(" ")[0]

/**
 * A member's face with a presence dot on its corner — green when they are
 * online, a quiet grey when they are not. The dot is ringed in the surface
 * the avatar sits on, so it reads as cut out of the photo rather than stuck
 * on top of it.
 */
function ChatAvatar({
  id,
  size = "xs",
  presence = true,
  ring = "ring-background",
  className,
}: {
  id: string
  size?: "xs" | "sm" | "md" | "lg"
  /** Show the presence dot. */
  presence?: boolean
  /** The surface behind the avatar, for the dot's cut-out ring. */
  ring?: string
  className?: string
}) {
  const p = member(id)
  return (
    <span className={cn("relative inline-flex shrink-0", className)}>
      <PersonAvatar size={size} name={p.name} email={p.email} image={p.image} />
      {presence && (
        <span
          aria-label={ONLINE.has(id) ? "Online" : "Offline"}
          className={cn(
            "absolute -right-px -bottom-px rounded-full ring-2",
            size === "xs" || size === "sm" ? "size-1.5" : "size-2.5",
            ring,
            ONLINE.has(id) ? "bg-success" : "bg-border-strong"
          )}
        />
      )}
    </span>
  )
}

export { ChatAvatar, firstName, member }
