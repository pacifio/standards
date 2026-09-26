/**
 * The raw measurements, kept in one place.
 *
 * These are the values sampled from screenshots of the reference apps with
 * PIL — a most-common-colour histogram plus horizontal scanlines to find the
 * column edges and hairlines. `themes.css` is derived from them; this module
 * exists so the gallery can SHOW the provenance without scattering hex
 * literals through JSX, and so there is exactly one place to update if the
 * references are re-sampled.
 *
 * This is the only file in the system allowed to contain colour literals
 * outside the token layer, and the ratchet exempts it by name for that reason.
 */

export type Measurement = {
  role: string
  value: string
  note: string
}

/** Linear, dark appearance. Sampled 2026-09-26. */
export const LINEAR_DARK: Array<Measurement> = [
  { role: "rail", value: "#070707", note: "15.3% of frame" },
  { role: "canvas", value: "#0f0f0f", note: "51.9% of frame" },
  { role: "card", value: "#171717", note: "board cards" },
  { role: "recessed", value: "#0c0c0c", note: "board column gutter" },
  { role: "border", value: "#212121", note: "card edge" },
  { role: "divider", value: "#151515", note: "rail / canvas rule" },
  { role: "brand", value: "#5e6ad2", note: "primary, focus, Done glyph" },
  { role: "status green", value: "#009a4d", note: "project health" },
  { role: "label purple", value: "#7c44ad", note: "label dot" },
  { role: "label cyan", value: "#24b6cf", note: "label dot" },
]

/** Cursor, light appearance. Sampled 2026-09-26. */
export const CURSOR_LIGHT: Array<Measurement> = [
  { role: "rail", value: "#f3f3f3", note: "left nav" },
  { role: "main", value: "#f7f7f7", note: "centre column" },
  { role: "detail", value: "#fdfdfd", note: "right panel" },
  { role: "border", value: "#e4e4e4", note: "column rule" },
  { role: "success", value: "#1c7e5d", note: "check glyphs, running state" },
]
