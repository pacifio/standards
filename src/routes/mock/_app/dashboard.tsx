import { useState } from "react"
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router"
import { ArrowRightIcon } from "lucide-react"

import { SESSIONS } from "@/mock/data"
import { ageMinutes } from "@/mock/age"
import { RANGE_LABEL, statFigures, tokenParts } from "@/mock/dashboard"
import type { DashboardRange } from "@/mock/dashboard"
import type { Session, SessionStatus } from "@/mock/types"
import { useOrg } from "@/lib/org-context"
import { ActivityFeed } from "@/components/dashboard/activity-feed"
import { MemberQuickManage } from "@/components/dashboard/member-quick-manage"
import { DataTable } from "@/components/patterns/data-table"
import type { Column } from "@/components/patterns/data-table"
import { SectionHeader } from "@/components/patterns/section-header"
import { SegmentedPills } from "@/components/patterns/segmented"
import { MeterCard, StatCard, StatGrid } from "@/components/patterns/stat-card"
import { buttonVariants } from "@/components/ui/button"
import { DiffStat } from "@/components/ui/code-block"
import { Icon } from "@/components/ui/icon"
import { ScrollFade } from "@/components/ui/scroll-fade"
import { StatusIcon } from "@/components/ui/status-icon"
import { LabelMark } from "@/components/ui/tag"
import { PersonAvatar } from "@/components/patterns/person-avatar"

export const Route = createFileRoute("/mock/_app/dashboard")({
  component: DashboardScreen,
})

const STATUS_LABEL: Record<SessionStatus, string> = {
  live: "Running",
  queued: "Queued",
  failed: "Failed",
  done: "Done",
}

const STATUS_ORDER: Record<SessionStatus, number> = {
  live: 0,
  queued: 1,
  failed: 2,
  done: 3,
}

const RECENT = [...SESSIONS]
  .sort(
    (a, b) =>
      STATUS_ORDER[a.status] - STATUS_ORDER[b.status] ||
      ageMinutes(a.startedAt) - ageMinutes(b.startedAt)
  )
  .slice(0, 10)

const COLUMNS: Array<Column<Session>> = [
  {
    id: "ref",
    header: "Ref",
    cell: (s) => (
      <span className="mono text-2xs whitespace-nowrap text-muted-foreground">
        {s.ref}
      </span>
    ),
    className: "w-18",
  },
  {
    id: "status",
    header: "Status",
    cell: (s) => (
      <span className="flex items-center gap-1.5">
        <StatusIcon status={s.status} />
        <span className="mono text-3xs tracking-wide text-secondary-foreground uppercase">
          {STATUS_LABEL[s.status]}
        </span>
      </span>
    ),
    sortValue: (s) => STATUS_ORDER[s.status],
    className: "w-24",
  },
  {
    id: "title",
    header: "Session",
    cell: (s) => (
      <span className="flex min-w-0 items-center gap-2.5 overflow-hidden">
        <span className="truncate font-medium text-foreground">{s.title}</span>
        <span className="hidden shrink-0 items-center gap-2.5 @4xl:flex">
          {s.labels.map((l) => (
            <LabelMark key={l.name} hue={l.tone}>
              {l.name}
            </LabelMark>
          ))}
        </span>
      </span>
    ),
    sortValue: (s) => s.title,
    className: "w-full max-w-0 min-w-36",
  },
  {
    id: "agent",
    header: "Agent",
    cell: (s) => <span className="text-2xs whitespace-nowrap">{s.agent}</span>,
    sortValue: (s) => s.agent,
    className: "hidden @3xl:table-cell",
  },
  {
    id: "changes",
    header: "Changes",
    cell: (s) =>
      s.added > 0 || s.removed > 0 ? (
        <DiffStat added={s.added} removed={s.removed} />
      ) : (
        <span className="text-disabled">—</span>
      ),
    sortValue: (s) => s.added + s.removed,
    align: "right",
    className: "hidden @2xl:table-cell",
  },
  {
    id: "started",
    header: "Started",
    cell: (s) => <span className="caption">{s.startedAt}</span>,
    align: "right",
    className: "hidden w-20 @md:table-cell",
  },
  {
    id: "author",
    header: <span className="sr-only">Author</span>,
    cell: (s) => (
      <PersonAvatar size="xs" name={s.author} initials={s.authorInitials} />
    ),
    className: "w-10",
  },
]

/**
 * The org dashboard: how much, what is happening, who, and what ran.
 *
 * Four bands, each answering one question, in the order someone scans:
 *
 *   1. Headline figures — tokens, cost, sessions, messages, cache — each on
 *      its own squircle with a dot-matrix of the period.
 *   2. Where the tokens went — input, output, cache read and write as shares
 *      of the whole, on segment meters.
 *   3. Now — a live activity stream beside quick member management.
 *   4. What ran — the most recent sessions, running ones first, linking
 *      through to the full timeline.
 *
 * The range switch re-draws bands 1 and 2 only; activity is always "now" and
 * the table is always "latest", so neither pretends to have a range.
 */
function DashboardScreen() {
  const { org, user } = useOrg()
  const firstName = user.name.split(" ")[0]
  const navigate = useNavigate()
  const [range, setRange] = useState<DashboardRange>("7d")
  const figures = statFigures(range)
  const parts = tokenParts(range)

  return (
    <>
      <ScrollFade className="min-h-0 flex-1">
        <div className="@container flex flex-col gap-6 px-5 pt-4 pb-8">
          {/* A greeting rather than a page title — the sidebar already says
              where you are. 20/25 at weight 400, the size Anthropic sets its
              own greeting at: warm, not shouted. */}
          <header className="flex flex-wrap items-end justify-between gap-3">
            <div className="min-w-0">
              <h1 className="flex items-center gap-2 text-xl/6.25 font-normal">
                <span aria-hidden="true">👋</span>
                <span className="truncate">Welcome back, {firstName}</span>
              </h1>
              <p className="mt-0.5 truncate text-2xs text-muted-foreground">
                {RANGE_LABEL[range]} across {org.name}
              </p>
            </div>
            <SegmentedPills<DashboardRange>
              size="sm"
              value={range}
              onChange={setRange}
              options={[
                { value: "24h", label: "24h" },
                { value: "7d", label: "7d" },
                { value: "30d", label: "30d" },
              ]}
            />
          </header>

          <section aria-label="Usage" className="flex flex-col gap-3">
            {/* Two up until there is room for all five; the odd one out takes
                the full row rather than sitting alone beside a hole. */}
            <StatGrid className="grid-cols-2 @5xl:grid-cols-5 [&>*:last-child:nth-child(odd)]:col-span-2 @5xl:[&>*:last-child:nth-child(odd)]:col-span-1">
              {figures.map((f, i) => (
                <StatCard
                  key={`${range}-${f.id}`}
                  index={i}
                  label={f.label}
                  badge={f.badge}
                  value={f.value}
                  trend={f.trend}
                  series={f.series}
                />
              ))}
            </StatGrid>
            <StatGrid className="grid-cols-2 @4xl:grid-cols-4">
              {parts.map((p, i) => (
                <MeterCard
                  key={`${range}-${p.id}`}
                  index={i + figures.length}
                  label={p.label}
                  value={p.value}
                  share={p.share}
                  hue={p.hue}
                />
              ))}
            </StatGrid>
          </section>

          <section
            aria-label="Now"
            className="grid gap-3 @4xl:h-104 @4xl:grid-cols-2"
          >
            <ActivityFeed className="h-104 @4xl:h-auto" />
            <MemberQuickManage className="h-104 @4xl:h-auto" />
          </section>

          <section aria-label="Recent sessions">
            <SectionHeader
              title="Recent sessions"
              description="Running first, then queued, failed and done — newest first in each"
              action={
                <Link
                  to="/mock/timeline"
                  search={{ view: "all" }}
                  className={buttonVariants({ variant: "ghost", size: "xs" })}
                >
                  Open timeline
                  <Icon icon={ArrowRightIcon} size="xs" />
                </Link>
              }
            />
            <DataTable
              rows={RECENT}
              columns={COLUMNS}
              rowId={(s) => s.id}
              onRowClick={(s) =>
                navigate({
                  to: "/mock/timeline",
                  search: { view: "all", session: s.id },
                })
              }
            />
          </section>
        </div>
      </ScrollFade>
    </>
  )
}
