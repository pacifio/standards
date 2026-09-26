import { createFileRoute } from "@tanstack/react-router"

import { USAGE_BY_MEMBER, USAGE_SERIES } from "@/mock/data"
import { PageHeader, SectionHeader } from "@/components/patterns/section-header"
import { SettingCard, SettingRow } from "@/components/patterns/setting-card"
import { MetricRow, MetricTile, Sparkline } from "@/components/patterns/metric"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export const Route = createFileRoute("/mock/settings/usage")({
  component: UsageSettings,
})

const usd = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" })

/**
 * Usage.
 *
 * The metric strip and the 1d/7d/30d segmented control are lifted straight
 * from Cursor's Automations page — four numbers, a sparkline, then the table
 * that explains them.
 *
 * "Measured" and "estimated" are kept as separate columns rather than summed.
 * A single number that silently mixes a billed figure with a guess is the kind
 * of thing people make budget decisions on and then get surprised by.
 */
function UsageSettings() {
  const measured = USAGE_BY_MEMBER.reduce((a, m) => a + m.measured, 0)
  const estimated = USAGE_BY_MEMBER.reduce((a, m) => a + m.estimated, 0)
  const sessions = USAGE_BY_MEMBER.reduce((a, m) => a + m.sessions, 0)
  const budget = 600
  const topSpend = Math.max(...USAGE_BY_MEMBER.map((m) => m.measured))

  return (
    <>
      <PageHeader
        title="Usage"
        description="What this workspace has spent on model calls."
        action={
          <Tabs defaultValue="30d">
            <TabsList className="h-control-md">
              <TabsTrigger value="1d">1d</TabsTrigger>
              <TabsTrigger value="7d">7d</TabsTrigger>
              <TabsTrigger value="30d">30d</TabsTrigger>
            </TabsList>
          </Tabs>
        }
      />

      <div className="flex flex-col gap-8">
        <MetricRow>
          <MetricTile label="Measured" value={usd(measured)} detail="billed" />
          <MetricTile
            label="Estimated"
            value={usd(estimated)}
            detail="not yet billed"
          />
          <MetricTile label="Sessions" value={sessions} detail="last 30 days" />
          <MetricTile label="Daily spend">
            <Sparkline values={USAGE_SERIES} className="mt-1" />
          </MetricTile>
        </MetricRow>

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
          <div className="overflow-hidden rounded-md border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead className="w-28 text-right">Measured</TableHead>
                  <TableHead className="w-28 text-right">Estimated</TableHead>
                  <TableHead className="w-20 text-right">Sessions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {USAGE_BY_MEMBER.map((m) => (
                  <TableRow key={m.member}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar size="xs">
                          <AvatarFallback>{m.initials}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs">{m.member}</span>
                        {/* A bar in the row, not a separate chart: the
                            comparison people want is between these rows. */}
                        <span
                          aria-hidden="true"
                          className="ml-1 h-1 rounded-full bg-element-emphasis"
                          style={{
                            width: `${(m.measured / topSpend) * 64}px`,
                          }}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-right tnum">
                      {usd(m.measured)}
                    </TableCell>
                    <TableCell className="text-right text-secondary-foreground tnum">
                      {m.estimated ? usd(m.estimated) : "—"}
                    </TableCell>
                    <TableCell className="text-right tnum">
                      {m.sessions}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>
      </div>
    </>
  )
}
