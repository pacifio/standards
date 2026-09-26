/**
 * Resolve any CSS colour — including `oklch()` and `color-mix()` — to a
 * concrete RGB triple.
 *
 * Canvas 2D and WebGL take colour strings, not custom properties, and they
 * do not understand every syntax the token layer uses. A 1×1 canvas does:
 * assign the value to `fillStyle`, paint a pixel, and read it back. The
 * browser's own colour engine does the conversion, so this stays correct as
 * the token layer evolves.
 *
 * Reads the variable off `<html>` so it resolves against the active theme.
 */

export type Rgb = { r: number; g: number; b: number }

let probe: CanvasRenderingContext2D | null | undefined

function context(): CanvasRenderingContext2D | null {
  if (probe !== undefined) return probe
  if (typeof document === "undefined") return (probe = null)
  const canvas = document.createElement("canvas")
  canvas.width = 1
  canvas.height = 1
  probe = canvas.getContext("2d", { willReadFrequently: true })
  return probe
}

export function resolveColor(value: string): Rgb | null {
  const ctx = context()
  if (!ctx) return null
  ctx.clearRect(0, 0, 1, 1)
  ctx.fillStyle = value
  ctx.fillRect(0, 0, 1, 1)
  const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data
  if (a === 0) return null
  return { r, g, b }
}

/** The resolved value of a custom property on the document root. */
export function resolveToken(name: string): Rgb | null {
  if (typeof document === "undefined") return null
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim()
  return raw ? resolveColor(raw) : null
}

export function rgbString({ r, g, b }: Rgb, alpha = 1): string {
  return `rgb(${r} ${g} ${b} / ${alpha})`
}
