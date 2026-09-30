/**
 * Time, for the mock.
 *
 * Every relative time and day grouping in the mock is computed against one
 * pinned "now" in one fixed zone, so the server render and the client render
 * produce identical strings — a `Date.now()` here would put a row under
 * "Today" on the server and "Yesterday" on a client past midnight, and
 * hydration would fail. The real app uses the browser's clock and zone.
 */

export const MOCK_NOW = "2026-09-29T17:45:00+06:00"
export const MOCK_TIME_ZONE = "Asia/Dhaka"

const DAY_KEY = new Intl.DateTimeFormat("en-CA", {
  timeZone: MOCK_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
})
const MONTH_DAY = new Intl.DateTimeFormat("en-US", {
  timeZone: MOCK_TIME_ZONE,
  month: "long",
  day: "numeric",
})
const WEEKDAY = new Intl.DateTimeFormat("en-US", {
  timeZone: MOCK_TIME_ZONE,
  weekday: "long",
})
const FULL = new Intl.DateTimeFormat("en-GB", {
  timeZone: MOCK_TIME_ZONE,
  dateStyle: "full",
  timeStyle: "short",
})
const CLOCK = new Intl.DateTimeFormat("en-GB", {
  timeZone: MOCK_TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
})
const HM = new Intl.DateTimeFormat("en-GB", {
  timeZone: MOCK_TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
})
const RELATIVE = new Intl.RelativeTimeFormat("en", { numeric: "always" })

/** The calendar day an instant falls on, as `YYYY-MM-DD`. */
export const dayKey = (iso: string) => DAY_KEY.format(new Date(iso))

/** "September 29 / Today", "September 28 / Yesterday", "September 25 / Thursday". */
export function dayLabel(iso: string): { date: string; day: string } {
  const at = new Date(iso)
  const diff = Math.round(
    (Date.parse(dayKey(MOCK_NOW)) - Date.parse(dayKey(iso))) / 86_400_000
  )
  return {
    date: MONTH_DAY.format(at),
    day: diff === 0 ? "Today" : diff === 1 ? "Yesterday" : WEEKDAY.format(at),
  }
}

/** "just now", "12 minutes ago", "1 hour ago", "3 days ago", "2 weeks ago". */
export function ago(iso: string): string {
  const s = (Date.parse(MOCK_NOW) - Date.parse(iso)) / 1000
  if (s < 60) return "just now"
  const steps: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ["minute", 60],
    ["hour", 3600],
    ["day", 86_400],
    ["week", 604_800],
    ["month", 2_592_000],
    ["year", 31_536_000],
  ]
  let unit = steps[0]
  for (const step of steps) if (s >= step[1]) unit = step
  return RELATIVE.format(-Math.floor(s / unit[1]), unit[0])
}

/** "Tuesday 29 September 2026 at 17:06" — for a `title` tooltip. */
export const fullStamp = (iso: string) => FULL.format(new Date(iso))

/** "14:02:16". */
export const clock = (iso: string) => CLOCK.format(new Date(iso))

/** "14:02". */
export const hm = (iso: string) => HM.format(new Date(iso))

const SHORT_DATE = new Intl.DateTimeFormat("en-US", {
  timeZone: MOCK_TIME_ZONE,
  day: "numeric",
  month: "short",
})

/** "27 Sep" — day first, three-letter month (en-GB would say "Sept"). */
export function shortDate(iso: string): string {
  const parts = SHORT_DATE.formatToParts(new Date(iso))
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? ""
  return `${get("day")} ${get("month")}`
}

/** Minutes before `MOCK_NOW`, as an ISO instant in the mock's zone. */
export function minutesBefore(minutes: number): string {
  return new Date(Date.parse(MOCK_NOW) - minutes * 60_000).toISOString()
}

/** The server's `formatDuration`: `47m`, `1h 04m`, `142h`, `58d`. */
export function formatDuration(seconds: number): string {
  const m = Math.round(seconds / 60)
  if (m < 1) return `${Math.round(seconds)}s`
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  if (h < 100) return `${h}h ${String(m % 60).padStart(2, "0")}m`
  if (h < 1000) return `${h}h`
  return `${Math.round(h / 24)}d`
}

/** The server's `formatTokens`: `940`, `84.0K`, `1.20M`, `4.3B`. */
export function formatTokens(n: number): string {
  if (n < 1000) return String(n)
  if (n < 1_000_000) return `${(n / 1000).toFixed(1)}K`
  if (n < 1_000_000_000) return `${(n / 1_000_000).toFixed(2)}M`
  return `${(n / 1_000_000_000).toFixed(1)}B`
}
