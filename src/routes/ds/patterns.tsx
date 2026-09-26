import { createFileRoute } from "@tanstack/react-router"
import { ChevronRightIcon, GitBranchIcon, KeyIcon } from "lucide-react"

import { PageHeader, SectionHeader } from "@/components/patterns/section-header"
import {
  DrillInRow,
  SettingCard,
  SettingRow,
} from "@/components/patterns/setting-card"
import { Specimen } from "@/components/gallery/specimen"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Callout } from "@/components/ui/callout"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

export const Route = createFileRoute("/ds/patterns")({
  component: PatternsGallery,
})

function PatternsGallery() {
  return (
    <>
      <PageHeader
        title="Patterns"
        description="Compositions that appear on more than one screen."
      />

      <Callout tone="info">
        A pattern earns a component when the third screen needs it. Before that
        it is a layout; after that it is a source of drift.
      </Callout>

      <Specimen
        title="Setting card"
        note="The atom every settings surface is built from. Alignment is the whole point: every row in a card shares one baseline for its label and one right edge for its control, and the moment a screen hand-rolls a row the column breaks."
      >
        <div className="w-full">
          <SettingCard>
            <SettingRow
              label="Capture prompts"
              description="Stores the text you send to an agent so sessions can be replayed."
              control={<Switch defaultChecked />}
            />
            <SettingRow
              label="Default model"
              description="Used when a session does not name one."
              control={
                <Select
                  defaultValue="sonnet"
                  items={{ sonnet: "Claude Sonnet 5", opus: "Claude Opus 5" }}
                >
                  <SelectTrigger size="sm" className="w-44">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sonnet">Claude Sonnet 5</SelectItem>
                    <SelectItem value="opus">Claude Opus 5</SelectItem>
                  </SelectContent>
                </Select>
              }
            />
            <SettingRow
              icon={KeyIcon}
              label="Bugbot licence"
              description="Unlimited reviews on every pull request."
              control={<Badge variant="info">Beta</Badge>}
            />
            <SettingRow
              label="GitHub connection"
              description="Manage connected accounts and repositories."
              control={
                <Button variant="outline" size="sm">
                  Manage
                </Button>
              }
            />
            <DrillInRow
              icon={GitBranchIcon}
              label="Repository rules"
              description="Project rules and automatic learned rules."
              value="5 rules"
            />
          </SettingCard>
        </div>
      </Specimen>

      <Specimen
        title="Section header"
        note="`eyebrow`-cased, because it labels a GROUP. A heading here would compete with the page title for the same job."
      >
        <div className="w-full">
          <SectionHeader
            title="Invite links"
            description="A link lets several people join at once."
            action={
              <Button variant="outline" size="sm">
                New link
              </Button>
            }
          />
          <SettingCard>
            <SettingRow
              label="Developer link"
              description="3 of 10 uses · expires in 6 days"
              control={
                <Button variant="ghost" size="sm">
                  Revoke
                </Button>
              }
            />
          </SettingCard>
        </div>
      </Specimen>

      <Specimen
        title="Drill-in row"
        note="Navigates rather than sets. The whole row is the target — the chevron is decoration and must never be the only clickable thing."
      >
        <div className="w-full">
          <SettingCard>
            <DrillInRow label="Members" value="12 members" />
            <DrillInRow label="Access and permissions" />
            <DrillInRow label="Slack notifications" value="Off" />
          </SettingCard>
        </div>
      </Specimen>

      <Specimen
        title="Where these came from"
        note="Cursor for the component language, Linear for the layout. The setting card, the metric strip, the segmented range control and the quiet table are Cursor's settings surfaces; the rail, the org switcher, the three-pane reading layout and the separate settings shell are Linear's."
      >
        <a
          href="/mock/settings/organisation"
          className="flex items-center gap-1.5 text-xs text-secondary-foreground underline-offset-2 hover:underline"
        >
          See them composed in the app mock
          <ChevronRightIcon className="size-3.5" />
        </a>
      </Specimen>
    </>
  )
}
