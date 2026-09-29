import { MEMBERS } from "@/mock/data"

/**
 * A person's photo, found by name or email.
 *
 * The fixtures name people in several places — a session's `author`, a
 * notification's `actor`, a chat message's `author` — but only `MEMBERS`
 * carries an `image`. This joins them, so a face is the same face on every
 * screen. In the real app every one of those payloads carries the user's
 * `image` directly and this lookup goes away.
 */
const BY_KEY = new Map<string, string>()
for (const m of MEMBERS) {
  if (!m.image) continue
  if (m.name) BY_KEY.set(m.name.toLowerCase(), m.image)
  BY_KEY.set(m.email.toLowerCase(), m.image)
}

export function avatarFor(nameOrEmail: string | undefined): string | undefined {
  return nameOrEmail ? BY_KEY.get(nameOrEmail.trim().toLowerCase()) : undefined
}
