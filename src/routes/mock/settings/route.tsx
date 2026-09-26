import { Outlet, createFileRoute } from "@tanstack/react-router"

import { SettingsShell } from "@/components/shell/settings-shell"

export const Route = createFileRoute("/mock/settings")({
  component: SettingsLayout,
})

function SettingsLayout() {
  return (
    <SettingsShell>
      <Outlet />
    </SettingsShell>
  )
}
