import { useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import {
  ChevronDownIcon,
  ChevronRightIcon,
  GitBranchIcon,
  KeyIcon,
} from "lucide-react"

import { SESSIONS } from "@/mock/data"
import type { Session } from "@/mock/types"
import { PageHeader, SectionHeader } from "@/components/patterns/section-header"
import {
  DrillInRow,
  SettingCard,
  SettingRow,
} from "@/components/patterns/setting-card"
import { DataTable, TableSearch } from "@/components/patterns/data-table"
import type { Column } from "@/components/patterns/data-table"
import { KpiStrip } from "@/components/patterns/kpi-strip"
import { Panel } from "@/components/patterns/panel"
import {
  CompoundFilter,
  SegmentedPills,
  UnderlineTabs,
} from "@/components/patterns/segmented"
import { Specimen } from "@/components/gallery/specimen"
import { DitherField } from "@/components/ui/dither-field"
import { GitHubMark, GoogleMark } from "@/components/ui/brand-marks"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Callout } from "@/components/ui/callout"
import { Icon } from "@/components/ui/icon"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { StatusIcon } from "@/components/ui/status-icon"
import { Switch } from "@/components/ui/switch"
import { Tag } from "@/components/ui/tag"

export const Route = createFileRoute("/ds/patterns")({
  component: PatternsGallery,
})

const COLUMNS: Array<Column<Session>> = [
  {
    id: "ref",
    header: "Ref",
    cell: (s) => (
      <span className="mono text-2xs whitespace-nowrap text-muted-foreground">
        {s.ref}
      </span>
    ),
    sortValue: (s) => Number(s.ref.replace(/\D/g, "")),
    className: "w-18",
  },
  {
    id: "title",
    header: "Session",
    cell: (s) => (
      <span className="flex min-w-0 items-center gap-2 overflow-hidden">
        <StatusIcon status={s.status} />
        <span className="truncate font-medium text-foreground">{s.title}</span>
        {s.labels[0] && <Tag hue={s.labels[0].tone}>{s.labels[0].name}</Tag>}
      </span>
    ),
    sortValue: (s) => s.title,
    className: "w-full max-w-0 min-w-56",
  },
  {
    id: "tokens",
    header: "Tokens",
    cell: (s) => s.tokens.toLocaleString(),
    sortValue: (s) => s.tokens,
    align: "right",
    className: "w-24",
  },
]

function PatternsGallery() {
  const [pill, setPill] = useState<"all" | "mine" | "agents">("all")
  const [tab, setTab] = useState<"orgs" | "tiers">("orgs")
  const [selected, setSelected] = useState<string | undefined>(SESSIONS[0].id)

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
        title="Panel"
        note="The block every dashboard surface is built from: a ringed card with a title, a subtitle, and a circular action cluster — filter in muted, open in primary. It enters with an 8px rise; give it a `delay` from PANEL_STAGGER when there is more than one on the page."
      >
        <div className="grid w-full gap-3 sm:grid-cols-2">
          <Panel
            title="Sessions this week"
            subtitle="Across every project"
            onFilter={() => {}}
            onExpand={() => {}}
          >
            <span className="text-2xl leading-none figure">42</span>
          </Panel>
          <Panel title="Without actions" subtitle="Just a ringed card">
            <span className="caption">The body takes any content.</span>
          </Panel>
        </div>
      </Specimen>

      <Specimen
        title="KPI strip"
        note="Cells divided by hairlines, not separate cards. The figure is weight 300; the delta rides beside the label so the number stays clean. `detail` is for a neutral note under a figure nobody should judge — spend, for instance."
      >
        <div className="w-full">
          <KpiStrip
            cells={[
              {
                id: "live",
                label: "Live",
                value: 2,
                spark: [1, 2, 1, 3, 2, 2, 2],
              },
              { id: "done", label: "Done", value: 5, delta: 12 },
              { id: "failed", label: "Failed", value: 1, delta: -50 },
              {
                id: "spend",
                label: "Spend",
                value: "$401",
                detail: "measured",
              },
            ]}
          />
        </div>
      </Specimen>

      <Specimen
        title="Segmented controls"
        note="Three shapes for three jobs. Pills switch a VIEW and the active one slides on SPRING_INDICATOR; underline tabs switch a PANEL inside a page; the compound filter is `grey label │ value ⌄` and opens a menu."
      >
        <div className="flex w-full flex-col gap-4">
          <SegmentedPills
            value={pill}
            onChange={setPill}
            options={[
              { value: "all", label: "All" },
              { value: "mine", label: "Mine" },
              { value: "agents", label: "Agents" },
            ]}
          />
          <UnderlineTabs
            value={tab}
            onChange={setTab}
            options={[
              { value: "orgs", label: "Organisations", count: 505 },
              { value: "tiers", label: "Tiers", count: 3 },
            ]}
          />
          <div className="flex items-center gap-2">
            <CompoundFilter label="Project">
              All
              <Icon icon={ChevronDownIcon} size="xs" />
            </CompoundFilter>
            <CompoundFilter label="Agent">
              Claude Code
              <Icon icon={ChevronDownIcon} size="xs" />
            </CompoundFilter>
            <TableSearch placeholder="Search" />
          </div>
        </div>
      </Specimen>

      <Specimen
        title="Data table"
        note="A ringed container; a toolbar band; a sticky blurred header in .micro; hairline rows that fade in with a capped stagger; a footer band. Click a header to sort, a row to select. Right-aligned cells are tabular."
      >
        <div className="w-full">
          <DataTable
            rows={SESSIONS.slice(0, 5)}
            columns={COLUMNS}
            rowId={(s) => s.id}
            selectedId={selected}
            onRowClick={(s) => setSelected(s.id)}
            toolbar={<TableSearch placeholder="Search sessions" />}
            footer={<span className="tnum">5 of {SESSIONS.length}</span>}
          />
        </div>
      </Specimen>

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
        note="`micro`-cased, because it labels a GROUP. A heading here would compete with the page title for the same job."
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
        title="Dither field"
        note="The canvas-2D fallback for the login aside and empty states: a 4×4 Bayer matrix over value noise, stepped at ~12fps. Ink is the resolved foreground, so it inverts with the theme. The GLSL RevealWaveImage on the Blocks page replaces it wherever WebGL is available."
      >
        <div className="flex w-full flex-col gap-3">
          <div className="relative h-32 w-full overflow-hidden rounded-xl bg-surface ring-1 ring-foreground/10">
            <DitherField mode="glyphs" hollow={[0.1, 0.5]} />
          </div>
          <div className="relative h-20 w-full overflow-hidden rounded-xl bg-surface ring-1 ring-foreground/10">
            <DitherField mode="dots" />
          </div>
        </div>
      </Specimen>

      <Specimen
        title="Social sign-in"
        note="Two providers and nothing else. Both buttons are `secondary`: neither provider is recommended, and making one of them the single loud element would be a recommendation."
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
        </div>
      </Specimen>

      <Specimen
        title="Where these came from"
        note="The Panel, KPI strip, segmented controls, data table and the sliding-pill sidebar are Auberge's structure; the achromatic ramp, the dashed rails, the cross-hair corners and the illustration blocks are natai's. Neither reference's accent survived — the primary is the foreground, inverted."
      >
        <a
          href="/mock/timeline"
          className="flex items-center gap-1.5 text-xs text-secondary-foreground underline-offset-2 hover:underline"
        >
          See them composed in the app mock
          <ChevronRightIcon className="size-3.5" />
        </a>
      </Specimen>
    </>
  )
}
