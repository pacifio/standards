/**
 * Initials for an avatar fallback.
 *
 * First letter of the first and last word, so "Adib Mohsin" is AM and
 * "Azraf Al Monzim" is AM too — not AZ, which is what slicing the first two
 * characters gives you. An invited member has no name yet, so the email's
 * local part stands in.
 */
export function initialsOf(name: string, email?: string): string {
  const source =
    name.trim() || (email ?? "").split("@")[0].replace(/[._-]/g, " ")
  const words = source.split(/\s+/).filter(Boolean)
  if (words.length === 0) return "?"
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (words[0][0] + words[words.length - 1][0]).toUpperCase()
}
