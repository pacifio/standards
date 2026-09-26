import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"

/**
 * Theme control for Atlas Standards.
 *
 * Three settings, two appearances. "system" follows the OS and is the default,
 * because a user who has told their machine they want light has already
 * answered this question once.
 *
 * The resolved appearance is written to `data-theme` on <html> as a literal
 * "dark" or "light" — never "system". Every selector in themes.css keys off
 * that attribute, so nothing downstream has to know a media query exists.
 */

export type ThemeSetting = "light" | "dark" | "system"
export type Appearance = "light" | "dark"

const STORAGE_KEY = "atlas-theme"
const SETTINGS: ReadonlyArray<ThemeSetting> = ["light", "dark", "system"]

function isThemeSetting(value: unknown): value is ThemeSetting {
  return typeof value === "string" && SETTINGS.includes(value as ThemeSetting)
}

/**
 * Runs before first paint, inlined into the document head.
 *
 * Without this the server renders the dark fallback, the client reads
 * localStorage on mount, and a user on light gets a black flash on every
 * navigation. It is stringified rather than imported because it has to
 * execute before the bundle does.
 */
export const themeInitScript = `
(function () {
  try {
    var stored = localStorage.getItem(${JSON.stringify(STORAGE_KEY)});
    var setting = stored === "light" || stored === "dark" ? stored : "system";
    var appearance = setting === "system"
      ? (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark")
      : setting;
    document.documentElement.setAttribute("data-theme", appearance);
  } catch (e) {
    document.documentElement.setAttribute("data-theme", "dark");
  }
})();
`

type ThemeContextValue = {
  /** What the user chose. */
  setting: ThemeSetting
  /** What that resolves to right now. */
  appearance: Appearance
  setSetting: (next: ThemeSetting) => void
  /** Flips between the two appearances, leaving "system" behind. */
  toggle: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function systemAppearance(): Appearance {
  if (typeof window === "undefined") return "dark"
  return window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark"
}

function storedSetting(): ThemeSetting {
  if (typeof window === "undefined") return "system"
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return isThemeSetting(stored) ? stored : "system"
  } catch {
    return "system"
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // The server has no localStorage and no media query, so both render paths
  // have to start at the same value or React will complain about the
  // mismatch. themeInitScript has already corrected the DOM by this point;
  // the effect below re-syncs state to it.
  const [setting, setSettingState] = useState<ThemeSetting>("system")
  const [appearance, setAppearance] = useState<Appearance>("dark")

  useEffect(() => {
    const next = storedSetting()
    setSettingState(next)
    setAppearance(next === "system" ? systemAppearance() : next)
  }, [])

  // Only "system" cares what the OS is doing.
  useEffect(() => {
    if (setting !== "system") return
    const query = window.matchMedia("(prefers-color-scheme: light)")
    const onChange = () => setAppearance(query.matches ? "light" : "dark")
    query.addEventListener("change", onChange)
    return () => query.removeEventListener("change", onChange)
  }, [setting])

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", appearance)
  }, [appearance])

  const setSetting = useCallback((next: ThemeSetting) => {
    setSettingState(next)
    setAppearance(next === "system" ? systemAppearance() : next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // A blocked storage API is not a reason to refuse to change theme.
    }
  }, [])

  const toggle = useCallback(() => {
    setSetting(appearance === "dark" ? "light" : "dark")
  }, [appearance, setSetting])

  const value = useMemo<ThemeContextValue>(
    () => ({ setting, appearance, setSetting, toggle }),
    [setting, appearance, setSetting, toggle]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used inside a <ThemeProvider>")
  }
  return context
}
