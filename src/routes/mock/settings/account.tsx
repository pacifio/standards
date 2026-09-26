import { createFileRoute } from "@tanstack/react-router"
import { CopyIcon, MonitorIcon } from "lucide-react"

import { useOrg } from "@/lib/org-context"
import { PageHeader, SectionHeader } from "@/components/patterns/section-header"
import { SettingCard, SettingRow } from "@/components/patterns/setting-card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Code } from "@/components/ui/code-block"
import { IconButton } from "@/components/ui/icon-button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export const Route = createFileRoute("/mock/settings/account")({
  component: AccountSettings,
})

const SESSIONS_OPEN = [
  {
    id: "d1",
    label: "Atlas Desktop · macOS",
    detail: "This device · Kuala Lumpur",
    current: true,
  },
  {
    id: "d2",
    label: "Web · Safari",
    detail: "Created 3 days ago",
    current: false,
  },
  {
    id: "d3",
    label: "Web · Chrome",
    detail: "Created 2 weeks ago",
    current: false,
  },
]

/** Profile, theme and active devices. The Account tab of today's /dashboard. */
function AccountSettings() {
  const { user } = useOrg()

  return (
    <>
      <PageHeader title="Account" description="How you appear across Atlas." />

      <div className="flex flex-col gap-8">
        <section>
          <SectionHeader title="Profile" />
          <SettingCard>
            <SettingRow
              label="Avatar"
              description="Shown on sessions, comments and messages."
              control={
                <div className="flex items-center gap-2">
                  <Avatar size="lg">
                    <AvatarFallback>{user.initials}</AvatarFallback>
                  </Avatar>
                  <Button variant="outline" size="sm">
                    Change
                  </Button>
                </div>
              }
            />
            <SettingRow
              label="Name"
              control={
                <Input defaultValue={user.name} size="sm" className="w-56" />
              }
            />
            <SettingRow
              label="Email"
              description="Used to sign in. Changing it requires re-verification."
              control={
                <Input defaultValue={user.email} size="sm" className="w-56" />
              }
            />
          </SettingCard>
        </section>

        <section>
          <SectionHeader title="Appearance" />
          <SettingCard>
            <SettingRow
              label="Theme"
              description="System follows your operating system."
              control={
                <Select
                  defaultValue="system"
                  items={{ light: "Light", dark: "Dark", system: "System" }}
                >
                  <SelectTrigger size="sm" className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              }
            />
          </SettingCard>
        </section>

        <section>
          <SectionHeader
            title="Access token"
            description="For the CLI and the desktop app."
          />
          <SettingCard>
            <SettingRow
              label="Personal token"
              description="Treat it like a password. It inherits your role."
              control={
                <div className="flex items-center gap-1">
                  <Code className="max-w-40 truncate">atl_••••••••3d7f</Code>
                  <IconButton icon={CopyIcon} label="Copy token" size="sm" />
                </div>
              }
            />
          </SettingCard>
        </section>

        <section>
          <SectionHeader title="Active sessions" />
          <SettingCard>
            {SESSIONS_OPEN.map((s) => (
              <SettingRow
                key={s.id}
                icon={MonitorIcon}
                label={
                  <span className="flex items-center gap-2">
                    {s.label}
                    {s.current && (
                      <Badge variant="success" size="sm">
                        This device
                      </Badge>
                    )}
                  </span>
                }
                description={s.detail}
                control={
                  <Button variant="ghost" size="sm" disabled={s.current}>
                    Revoke
                  </Button>
                }
              />
            ))}
          </SettingCard>
        </section>
      </div>
    </>
  )
}
