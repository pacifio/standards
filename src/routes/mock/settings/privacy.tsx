import { createFileRoute } from "@tanstack/react-router"

import { PageHeader, SectionHeader } from "@/components/patterns/section-header"
import { SettingCard, SettingRow } from "@/components/patterns/setting-card"
import { Callout } from "@/components/ui/callout"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

export const Route = createFileRoute("/mock/settings/privacy")({
  component: PrivacySettings,
})

/**
 * Privacy.
 *
 * Every control here says what is retained, for how long, and who can read it,
 * in the row's own description. A consent toggle whose consequence is
 * explained on a linked page is not consent.
 */
function PrivacySettings() {
  return (
    <>
      <PageHeader
        title="Privacy"
        description="What Atlas keeps from your sessions, and for how long."
      />

      <div className="flex flex-col gap-8">
        <Callout tone="info">
          Prompt capture is off by default and can be turned off again at any
          time. Turning it off deletes what has already been captured.
        </Callout>

        <section>
          <SectionHeader title="Prompt capture" />
          <SettingCard>
            <SettingRow
              label="Capture prompts"
              description="Stores the text you send to an agent so sessions can be replayed and searched."
              control={<Switch defaultChecked />}
            />
            <SettingRow
              label="Retention"
              description="Captured prompts are deleted after this long."
              control={
                <Select
                  defaultValue="90"
                  items={{
                    "30": "30 days",
                    "90": "90 days",
                    "365": "1 year",
                    forever: "Keep forever",
                  }}
                >
                  <SelectTrigger size="sm" className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                    <SelectItem value="365">1 year</SelectItem>
                    <SelectItem value="forever">Keep forever</SelectItem>
                  </SelectContent>
                </Select>
              }
            />
            <SettingRow
              label="Visible to"
              description="Who in the workspace can read captured prompts."
              control={
                <Select
                  defaultValue="admins"
                  items={{
                    me: "Only me",
                    admins: "Admins",
                    workspace: "Whole workspace",
                  }}
                >
                  <SelectTrigger size="sm" className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="me">Only me</SelectItem>
                    <SelectItem value="admins">Admins</SelectItem>
                    <SelectItem value="workspace">Whole workspace</SelectItem>
                  </SelectContent>
                </Select>
              }
            />
          </SettingCard>
        </section>

        <section>
          <SectionHeader title="Sharing" />
          <SettingCard>
            <SettingRow
              label="Allow public share links"
              description="Members can publish a read-only session at a public URL."
              control={<Switch defaultChecked />}
            />
            <SettingRow
              label="Require a password"
              description="Every new share link must be password-protected."
              control={<Switch />}
            />
          </SettingCard>
        </section>
      </div>
    </>
  )
}
