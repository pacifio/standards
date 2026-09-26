import { createFileRoute } from "@tanstack/react-router"
import { ChevronRightIcon, GitBranchIcon, KeyIcon } from "lucide-react"

import { PageHeader, SectionHeader } from "@/components/patterns/section-header"
import {
  DrillInRow,
  SettingCard,
  SettingRow,
} from "@/components/patterns/setting-card"
import { Specimen } from "@/components/gallery/specimen"
import { DitherField } from "@/components/ui/dither-field"
import { GitHubMark, GoogleMark } from "@/components/ui/brand-marks"
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
        title="Dither field"
        note="The landing site's hero backdrop, ported from the desktop app so the marketing page, the login pane and the app's empty states all print the same texture. A 4×4 Bayer matrix turns two octaves of value noise into glyph density, stepped at ~12fps because ordered dither reads as retro precisely when it snaps. It parks off screen, parks on a hidden tab, and paints exactly one frame under reduced motion — the texture is the design, only the drift is the accessibility problem."
      >
        <div className="flex w-full flex-col gap-3">
          <div className="relative h-40 w-full overflow-hidden rounded-md border border-border bg-sidebar">
            <DitherField mode="glyphs" hollow={[0.1, 0.5]} />
          </div>
          <div className="relative h-24 w-full overflow-hidden rounded-md border border-border bg-sidebar">
            <DitherField mode="dots" />
          </div>
          <p className="caption">
            <code className="code">glyphs</code> prints a character per 12px
            cell; <code className="code">dots</code> prints 1.5px dots on a 4px
            grid. Ink is the resolved foreground, so both invert with the theme.
          </p>
        </div>
      </Specimen>

      <Specimen
        title="Social sign-in"
        note="Two providers and nothing else — no email field, no divider, no “show other options”. Each of those exists in the references to manage a longer list than Atlas has. Both buttons are `secondary`: neither provider is recommended, and making one of them the single loud element would be a recommendation."
      >
        <div className="flex w-full max-w-72 flex-col gap-2">
          <Button variant="secondary" size="xl" className="w-full">
            <GoogleMark />
            Continue with Google
          </Button>
          <Button variant="secondary" size="xl" className="w-full">
            <GitHubMark />
            Continue with GitHub
          </Button>
          <p className="pt-1 caption">
            Google&apos;s four-colour mark is fixed by their brand guidelines
            and must not be themed; GitHub&apos;s is authorised in one colour
            and takes <code className="code">currentColor</code>.
          </p>
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
