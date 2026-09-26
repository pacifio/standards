import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"

/**
 * Interface scale.
 *
 * Everything in this system sizes in rem, so raising the root font size
 * grows type, spacing, controls and icons together rather than only the
 * text. This is the answer to "the sidebar is too condensed": the density
 * is Auberge's, and the person reading it decides how big that is.
 *
 * Written to `--ui-scale` on <html>; `globals.css` does
 * `font-size: calc(16px * var(--ui-scale))`. Persisted per browser.
 */

export const UI_SCALE_MIN = 0.9
export const UI_SCALE_MAX = 1.4
export const UI_SCALE_STEP = 0.05
export const UI_SCALE_PRESETS = [
  { value: 0.9, label: "Compact" },
  { value: 1, label: "Default" },
  { value: 1.15, label: "Large" },
  { value: 1.3, label: "Larger" },
] as const

const STORAGE_KEY = "atlas-ui-scale"

function clamp(value: number): number {
  const stepped = Math.round(value / UI_SCALE_STEP) * UI_SCALE_STEP
  // Two decimals, so SSR and client serialise the same number.
  return (
    Math.round(Math.min(UI_SCALE_MAX, Math.max(UI_SCALE_MIN, stepped)) * 100) /
    100
  )
}

/** Runs before first paint, inlined into the head beside the theme script. */
export const uiScaleInitScript = `
(function () {
  try {
    var raw = parseFloat(localStorage.getItem(${JSON.stringify(STORAGE_KEY)}) || "1");
    var v = isFinite(raw) ? Math.min(${UI_SCALE_MAX}, Math.max(${UI_SCALE_MIN}, raw)) : 1;
    document.documentElement.style.setProperty("--ui-scale", String(v));
  } catch (e) {}
})();
`

type UiScaleContextValue = {
  scale: number
  setScale: (next: number) => void
  step: (direction: 1 | -1) => void
  reset: () => void
}

const UiScaleContext = createContext<UiScaleContextValue | null>(null)

function stored(): number {
  if (typeof window === "undefined") return 1
  try {
    const raw = parseFloat(localStorage.getItem(STORAGE_KEY) ?? "1")
    return Number.isFinite(raw) ? clamp(raw) : 1
  } catch {
    return 1
  }
}

export function UiScaleProvider({ children }: { children: React.ReactNode }) {
  const [scale, setScaleState] = useState(1)

  useEffect(() => {
    setScaleState(stored())
  }, [])

  useEffect(() => {
    document.documentElement.style.setProperty("--ui-scale", String(scale))
  }, [scale])

  const setScale = useCallback((next: number) => {
    const value = clamp(next)
    setScaleState(value)
    try {
      localStorage.setItem(STORAGE_KEY, String(value))
    } catch {
      // Storage being blocked is not a reason to refuse to scale.
    }
  }, [])

  const step = useCallback(
    (direction: 1 | -1) => setScale(scale + direction * UI_SCALE_STEP),
    [scale, setScale]
  )
  const reset = useCallback(() => setScale(1), [setScale])

  // ⌘⌥= / ⌘⌥- / ⌘⌥0, the same chord the desktop app and browsers use.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (!(e.metaKey || e.ctrlKey) || !e.altKey) return
      if (e.key === "=" || e.key === "+") {
        e.preventDefault()
        step(1)
      } else if (e.key === "-" || e.key === "_") {
        e.preventDefault()
        step(-1)
      } else if (e.key === "0") {
        e.preventDefault()
        reset()
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [step, reset])

  const value = useMemo(
    () => ({ scale, setScale, step, reset }),
    [scale, setScale, step, reset]
  )

  return (
    <UiScaleContext.Provider value={value}>{children}</UiScaleContext.Provider>
  )
}

export function useUiScale(): UiScaleContextValue {
  const ctx = useContext(UiScaleContext)
  if (!ctx) throw new Error("useUiScale must be used inside <UiScaleProvider>")
  return ctx
}
