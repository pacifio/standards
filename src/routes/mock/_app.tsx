import { Outlet, createFileRoute } from "@tanstack/react-router"

import { AppShell } from "@/components/shell/app-shell"

export const Route = createFileRoute("/mock/_app")({ component: AppLayout })

/**
 * One shell for every signed-in screen.
 *
 * The chrome lives in a pathless layout rather than in each route, so
 * navigating between Inbox and Timeline re-renders the page and NOT the
 * sidebar. That is what lets the active pill slide between rows instead of
 * remounting in its new place, and what keeps the collapse state, the
 * drawer and the command menu alive across a navigation.
 *
 * Sign-in and Settings are siblings under /mock, not children of this
 * layout — they have their own shells.
 */
function AppLayout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  )
}
