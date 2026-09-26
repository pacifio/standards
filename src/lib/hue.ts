import type { LabelTone } from "@/mock/types"

/**
 * The eight categorical hues.
 *
 * A hue is an IDENTITY, not a status: `purple` means "the Design label", not
 * "informational". Everything here reads through `--hue-*` in themes.css, so
 * a tone keeps its meaning across themes even though its numbers change.
 */

export const HUES: ReadonlyArray<LabelTone> = [
  "grey",
  "indigo",
  "purple",
  "cyan",
  "green",
  "amber",
  "orange",
  "red",
]

export const TAG_CLASS: Record<LabelTone, string> = {
  grey: "tag-grey",
  indigo: "tag-indigo",
  purple: "tag-purple",
  cyan: "tag-cyan",
  green: "tag-green",
  amber: "tag-amber",
  orange: "tag-orange",
  red: "tag-red",
}

export const HUE_VAR: Record<LabelTone, string> = {
  grey: "var(--hue-grey)",
  indigo: "var(--hue-indigo)",
  purple: "var(--hue-purple)",
  cyan: "var(--hue-cyan)",
  green: "var(--hue-green)",
  amber: "var(--hue-amber)",
  orange: "var(--hue-orange)",
  red: "var(--hue-red)",
}

/**
 * A stable hue for an arbitrary key, so the same entity keeps its colour
 * forever — a project is always the same hue on every screen, in every
 * session, without anyone assigning it.
 */
export function hueFor(key: string): LabelTone {
  let hash = 0
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0
  }
  return HUES[hash % HUES.length]
}
