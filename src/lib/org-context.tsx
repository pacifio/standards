import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react"

import { ORGANISATIONS, CURRENT_USER } from "@/mock/data"
import type { Organisation } from "@/mock/types"

/**
 * One source of truth for the active organisation.
 *
 * This is the structural fix the whole mock exists to demonstrate. The server
 * web app currently resolves the active org FOUR different ways:
 *
 *   /timeline, /projects, /inbox   URL search param `org`, validated per route
 *   /chat                          component state + its own <select>
 *   /dashboard → OrgPanel          better-auth `orgSetActive()`
 *   /call, /space                  URL param again, validated differently
 *
 * So switching org on one screen does not switch it on the next, every page
 * re-fetches `orgList()` then `orgFull()` for itself, and there is no single
 * place to put the switcher. Hence: no global switcher, and an org picker
 * buried three levels into a settings tab.
 *
 * One provider, one `useOrg()`, and `<OrgSwitcher>` as the only writer.
 *
 * In the real app the active org belongs in the URL so a deep link survives a
 * reload and a shared link lands on the right workspace; this mock keeps it in
 * state because the mock routes are flat.
 */

type OrgContextValue = {
  org: Organisation
  orgs: Array<Organisation>
  user: typeof CURRENT_USER
  setOrg: (id: string) => void
}

const OrgContext = createContext<OrgContextValue | null>(null)

export function OrgProvider({ children }: { children: React.ReactNode }) {
  const [orgId, setOrgId] = useState(ORGANISATIONS[0].id)

  const setOrg = useCallback((id: string) => {
    if (ORGANISATIONS.some((o) => o.id === id)) setOrgId(id)
  }, [])

  const value = useMemo<OrgContextValue>(
    () => ({
      org: ORGANISATIONS.find((o) => o.id === orgId) ?? ORGANISATIONS[0],
      orgs: ORGANISATIONS,
      user: CURRENT_USER,
      setOrg,
    }),
    [orgId, setOrg]
  )

  return <OrgContext.Provider value={value}>{children}</OrgContext.Provider>
}

export function useOrg(): OrgContextValue {
  const context = useContext(OrgContext)
  if (!context) {
    throw new Error("useOrg must be used inside an <OrgProvider>")
  }
  return context
}
