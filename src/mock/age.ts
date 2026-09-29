/**
 * Minutes since a fixture's human `startedAt` ("35m ago", "Yesterday",
 * "5w ago"), so lists can sort newest-first within a status. The real API
 * returns ISO timestamps and this goes away.
 */
const UNIT: Record<string, number> = { m: 1, h: 60, d: 1440, w: 10080 }

export function ageMinutes(startedAt: string): number {
  if (/^yesterday$/i.test(startedAt.trim())) return 1440
  const m = /^(\d+)\s*([mhdw])/i.exec(startedAt.trim())
  return m ? Number(m[1]) * UNIT[m[2].toLowerCase()] : Number.MAX_SAFE_INTEGER
}
