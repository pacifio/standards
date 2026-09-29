import { useState } from "react"
import { createFileRoute } from "@tanstack/react-router"

import { USAGE_BY_MEMBER, USAGE_SERIES } from "@/mock/data"
import { PageHeader, SectionHeader } from "@/components/patterns/section-header"
import { SettingCard, SettingRow } from "@/components/patterns/setting-card"
import { KpiStrip } from "@/components/patterns/kpi-strip"
import { Progress } from "@/components/ui/progress"
import { DataTable } from "@/components/patterns/data-table"
import type { Column } from "@/components/patterns/data-table"
import { SegmentedPills } from "@/components/patterns/segmented"
import { PersonAvatar } from "@/components/patterns/person-avatar"

export const Route = createFileRoute("/mock/settings/usage")({
  component: UsageSettings,
})

const usd = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" })

type Range = "1d" | "7d" | "30d"
type MemberUsage = (typeof USAGE_BY_MEMBER)[number]

const TOP_SPEND = Math.max(...USAGE_BY_MEMBER.map((m) => m.measured))

const COLUMNS: Array<Column<MemberUsage>> = [
  {
    id: "member",
    header: "Member",
    cell: (m) => (
      <div className="flex items-center gap-2">
        <PersonAvatar size="xs" name={m.member} initials={m.initials} />
        <span className="text-foreground">{m.member}</span>
        {/* A bar in the row, not a separate chart: the comparison people
            want is between these rows. Width is a percentage of a fixed
            track so it scales with the interface, not the viewport. */}
        <span
          aria-hidden="true"
          className="ml-1 h-1 w-16 overflow-hidden rounded-full bg-muted"
        >
          <span
            className="block h-full rounded-full bg-foreground/40"
            style={{ width: `${(m.measured / TOP_SPEND) * 100}%` }}
          />
        </span>
      </div>
    ),
    sortValue: (m) => m.member,
    className: "w-full max-w-0",
  },
  {
    id: "measured",
    header: "Measured",
    cell: (m) => usd(m.measured),
    sortValue: (m) => m.measured,
    align: "right",
    className: "w-28",
  },
  {
    id: "estimated",
    header: "Estimated",
    cell: (m) =>
      m.estimated ? (
        <span className="text-secondary-foreground">{usd(m.estimated)}</span>
      ) : (
        <span className="text-disabled">—</span>
      ),
    sortValue: (m) => m.estimated,
    align: "right",
    className: "w-28",
  },
  {
    id: "sessions",
    header: "Sessions",
    cell: (m) => m.sessions,
    sortValue: (m) => m.sessions,
    align: "right",
    className: "w-20",
  },
]

/**
 * Usage.
 *
 * Four figures, a sparkline, a 1d/7d/30d range, then the table that
 * explains them.
 *
 * "Measured" and "estimated" are kept as separate columns rather than summed.
 * A single number that silently mixes a billed figure with a guess is the kind
 * of thing people make budget decisions on and then get surprised by.
 */
function UsageSettings() {
  const [range, setRange] = useState<Range>("30d")
  const measured = USAGE_BY_MEMBER.reduce((a, m) => a + m.measured, 0)
  const estimated = USAGE_BY_MEMBER.reduce((a, m) => a + m.estimated, 0)
  const sessions = USAGE_BY_MEMBER.reduce((a, m) => a + m.sessions, 0)
  const budget = 600

  return (
    <>
      <PageHeader
        title="Usage"
        description="What this workspace has spent on model calls."
        action={
          <SegmentedPills<Range>
            size="sm"
            value={range}
            onChange={setRange}
            options={[
              { value: "1d", label: "1d" },
              { value: "7d", label: "7d" },
              { value: "30d", label: "30d" },
            ]}
          />
        }
      />

      <div className="flex flex-col gap-8">
        <KpiStrip
          cells={[
            {
              id: "measured",
              label: "Measured",
              value: usd(measured),
              detail: "billed",
            },
            {
              id: "estimated",
              label: "Estimated",
              value: usd(estimated),
              detail: "not yet billed",
            },
            {
              id: "sessions",
              label: "Sessions",
              value: sessions,
              detail: `last ${range}`,
            },
            {
              id: "daily",
              label: "Daily spend",
              value: usd(measured / 30),
              spark: USAGE_SERIES,
            },
          ]}
        />

        <section>
          <SectionHeader title="Budget" />
          <SettingCard>
            <SettingRow
              label="Monthly cap"
              description={`${usd(measured + estimated)} of ${usd(budget)} used`}
              control={
                <span className="text-xs text-secondary-foreground tnum">
                  {Math.round(((measured + estimated) / budget) * 100)}%
                </span>
              }
            />
            <div className="px-3 pb-3">
              <Progress value={((measured + estimated) / budget) * 100} />
            </div>
          </SettingCard>
        </section>

        <section>
          <SectionHeader
            title="By member"
            description="Admins see the whole workspace."
          />
          <DataTable
            rows={USAGE_BY_MEMBER}
            columns={COLUMNS}
            rowId={(m) => m.member}
            footer={
              <>
                <span className="tnum">{USAGE_BY_MEMBER.length} members</span>
                <span className="ml-auto tnum">{usd(measured)} measured</span>
              </>
            }
          />
        </section>
      </div>
    </>
  )
}
