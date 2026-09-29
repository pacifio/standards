import { useState } from "react"
import { createFileRoute } from "@tanstack/react-router"

import { ORGANISATIONS } from "@/mock/data"
import type { Organisation } from "@/mock/types"
import { DataTable, TableSearch } from "@/components/patterns/data-table"
import type { Column } from "@/components/patterns/data-table"
import { KpiStrip } from "@/components/patterns/kpi-strip"
import { PageHeader } from "@/components/patterns/section-header"
import { UnderlineTabs } from "@/components/patterns/segmented"
import { Button } from "@/components/ui/button"
import { Callout } from "@/components/ui/callout"
import { ScrollFade } from "@/components/ui/scroll-fade"
import { Tag } from "@/components/ui/tag"

export const Route = createFileRoute("/mock/_app/admin")({
  component: AdminScreen,
})

type AdminTab = "orgs" | "tiers" | "prices" | "models"

type Tier = { id: string; name: string; cap: number; orgs: number }

const TIERS: Array<Tier> = [
  { id: "free", name: "Free", cap: 0, orgs: 412 },
  { id: "team", name: "Team", cap: 600, orgs: 87 },
  { id: "enterprise", name: "Enterprise", cap: 10_000, orgs: 6 },
]

const ORG_COLUMNS: Array<Column<Organisation>> = [
  {
    id: "name",
    header: "Organisation",
    cell: (o) => (
      <div className="flex min-w-0 flex-col">
        <span className="truncate font-medium text-foreground">{o.name}</span>
        <span className="truncate caption">/{o.slug}</span>
      </div>
    ),
    sortValue: (o) => o.name,
    className: "w-full max-w-0",
  },
  {
    id: "members",
    header: "Members",
    cell: (o) => o.memberCount,
    sortValue: (o) => o.memberCount,
    align: "right",
    className: "w-24",
  },
  {
    id: "tier",
    header: "Tier",
    cell: (o) =>
      o.id === "org_atlas" ? (
        <Tag hue="indigo">Enterprise</Tag>
      ) : (
        <Tag hue="grey">Team</Tag>
      ),
    className: "w-28",
  },
  {
    id: "actions",
    header: <span className="sr-only">Actions</span>,
    cell: () => (
      <Button variant="ghost" size="xs">
        Grant
      </Button>
    ),
    align: "right",
    className: "w-20",
  },
]

const TIER_COLUMNS: Array<Column<Tier>> = [
  {
    id: "name",
    header: "Tier",
    cell: (t) => <span className="font-medium text-foreground">{t.name}</span>,
    className: "w-full max-w-0",
  },
  {
    id: "cap",
    header: "Monthly cap",
    cell: (t) => (t.cap === 0 ? "—" : `$${t.cap.toLocaleString()}`),
    sortValue: (t) => t.cap,
    align: "right",
    className: "w-32",
  },
  {
    id: "orgs",
    header: "Organisations",
    cell: (t) => t.orgs,
    sortValue: (t) => t.orgs,
    align: "right",
    className: "w-32",
  },
]

/**
 * Platform admin.
 *
 * Kept inside the app shell rather than the settings shell: this is not
 * settings for YOUR workspace, it is a view across all of them, so it belongs
 * beside Timeline and Projects — behind a nav group that only appears for
 * platform admins.
 *
 * Underline tabs, not pills: these four panels are four renderings of the
 * same "everything on the platform" subject, and nobody deep-links to one.
 */
function AdminScreen() {
  const [tab, setTab] = useState<AdminTab>("orgs")
  const [query, setQuery] = useState("")
  const orgs = ORGANISATIONS.filter((o) =>
    o.name.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <>
      <ScrollFade className="min-h-0 flex-1">
        <div className="flex flex-col gap-4 px-5 pt-4 pb-6">
          <PageHeader
            className="pb-0"
            title="Platform"
            description="Every organisation on this deployment."
          />

          <Callout tone="error">
            You are acting as a platform administrator. Changes here affect
            every workspace.
          </Callout>

          <KpiStrip
            cells={[
              { id: "orgs", label: "Organisations", value: "505", delta: 3.2 },
              {
                id: "active",
                label: "Active this week",
                value: "128",
                delta: 11.4,
              },
              {
                id: "spend",
                label: "Spend · 30d",
                value: "$41,208",
                detail: "measured",
              },
              {
                id: "failed",
                label: "Failed sessions",
                value: "37",
                delta: -0.8,
              },
            ]}
          />

          <UnderlineTabs<AdminTab>
            value={tab}
            onChange={setTab}
            options={[
              { value: "orgs", label: "Organisations", count: 505 },
              { value: "tiers", label: "Tiers", count: TIERS.length },
              { value: "prices", label: "Prices" },
              { value: "models", label: "Models" },
            ]}
          />

          {tab === "orgs" && (
            <DataTable
              rows={orgs}
              columns={ORG_COLUMNS}
              rowId={(o) => o.id}
              toolbar={
                <TableSearch
                  placeholder="Search organisations"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              }
              footer={
                <span className="tnum">{orgs.length} of 505 organisations</span>
              }
            />
          )}
          {tab === "tiers" && (
            <DataTable
              rows={TIERS}
              columns={TIER_COLUMNS}
              rowId={(t) => t.id}
            />
          )}
          {tab === "prices" && (
            <Placeholder>
              Price history per model, with enable and disable dialogs.
            </Placeholder>
          )}
          {tab === "models" && (
            <Placeholder>
              Model metadata: context window, vendor, capabilities.
            </Placeholder>
          )}
        </div>
      </ScrollFade>
    </>
  )
}

function Placeholder({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-border py-10 text-center caption">
      {children}
    </div>
  )
}
