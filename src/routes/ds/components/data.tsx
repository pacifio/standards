import { createFileRoute } from "@tanstack/react-router"

import { MEMBERS, USAGE_SERIES } from "@/mock/data"
import { ROLE_LABELS } from "@/mock/types"
import { PageHeader } from "@/components/patterns/section-header"
import { KpiStrip } from "@/components/patterns/kpi-strip"
import { Sample, Specimen } from "@/components/gallery/specimen"
import { PersonAvatar } from "@/components/patterns/person-avatar"
import { AvatarGroup, AvatarGroupCount } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Code, DiffStat } from "@/components/ui/code-block"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export const Route = createFileRoute("/ds/components/data")({
  component: DataGallery,
})

function DataGallery() {
  return (
    <>
      <PageHeader
        title="Data"
        description="Tables, avatars, metrics and code."
      />

      <Specimen
        title="Table"
        note="One hairline under the header, no zebra striping, no vertical rules, 32px rows. The grid is implied by alignment — drawing it costs ink and buys nothing."
      >
        <div className="w-full overflow-hidden rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead className="w-32">Role</TableHead>
                <TableHead className="w-24 text-right">Sessions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MEMBERS.slice(0, 4).map((m) => (
                <TableRow key={m.id}>
                  <TableCell>
                    <span className="flex items-center gap-2">
                      <PersonAvatar
                        size="sm"
                        name={m.name}
                        email={m.email}
                        image={m.image}
                      />
                      {m.name}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{ROLE_LABELS[m.role]}</Badge>
                  </TableCell>
                  <TableCell className="text-right tnum">
                    {40 + m.id.length * 7}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Specimen>

      <Specimen
        title="Avatars"
        note="A person is their photo wherever they appear — `PersonAvatar` resolves it once, so the same face is on every screen. Without one it falls back to initials, first-and-last, so 'Azraf Al Monzim' is AM rather than AZ, on a `muted` fill — a generated hue per person turns a members table into eight colour-coded categories that mean nothing."
      >
        <Sample label="xs">
          <PersonAvatar size="xs" name="Adib Mohsin" />
        </Sample>
        <Sample label="sm">
          <PersonAvatar size="sm" name="Adib Mohsin" />
        </Sample>
        <Sample label="md">
          <PersonAvatar size="md" name="Adib Mohsin" />
        </Sample>
        <Sample label="lg">
          <PersonAvatar size="lg" name="Adib Mohsin" />
        </Sample>
        <Sample label="initials">
          <PersonAvatar size="md" name="Antarys AI" />
        </Sample>
        <Sample label="group">
          <AvatarGroup>
            <PersonAvatar size="md" name="Uzayer Masud" />
            <PersonAvatar size="md" name="Talha Razz" />
            <PersonAvatar size="md" name="Ahammad Nafiz" />
            <AvatarGroupCount>+4</AvatarGroupCount>
          </AvatarGroup>
        </Sample>
      </Specimen>

      <Specimen
        title="Metrics"
        note="A KPI strip: light-weight figures divided by hairlines. A judged figure — sessions, failures — takes a DeltaPill; a spend figure takes a neutral `detail` caption, because green-up on money implies a judgement the app has no business making about someone's budget."
      >
        <div className="w-full">
          <KpiStrip
            cells={[
              {
                id: "measured",
                label: "Measured",
                value: "$401.68",
                detail: "billed",
              },
              {
                id: "estimated",
                label: "Estimated",
                value: "$40.50",
                detail: "not yet billed",
              },
              { id: "sessions", label: "Sessions", value: "238", delta: 12.4 },
              {
                id: "daily",
                label: "Daily spend",
                value: "$13.39",
                spark: USAGE_SERIES,
              },
            ]}
          />
        </div>
      </Specimen>

      <Specimen
        title="Code"
        note="Monospace runs turn on `zero` and `ss02`, so 0/O and 1/l stay distinguishable in a session id or a branch name."
      >
        <Sample label="inline">
          <Code>feat/board-facets</Code>
        </Sample>
        <Sample label="diff stat">
          <DiffStat added={412} removed={96} />
        </Sample>
        <div className="w-full">
          <Code variant="block">{`apps/web/src/lib/board.ts
  +38 −4   facets now resolve in the board query`}</Code>
        </div>
      </Specimen>
    </>
  )
}
