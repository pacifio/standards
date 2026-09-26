import { createFileRoute } from "@tanstack/react-router"
import { ShieldIcon } from "lucide-react"

import { ORGANISATIONS } from "@/mock/data"
import { AppShell } from "@/components/shell/app-shell"
import { Crumb, TopBar } from "@/components/shell/top-bar"
import { PageHeader } from "@/components/patterns/section-header"
import { MetricRow, MetricTile } from "@/components/patterns/metric"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Callout } from "@/components/ui/callout"
import { Icon } from "@/components/ui/icon"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export const Route = createFileRoute("/mock/admin")({ component: AdminScreen })

const TIERS = [
  { id: "free", name: "Free", cap: 0, orgs: 412 },
  { id: "team", name: "Team", cap: 600, orgs: 87 },
  { id: "enterprise", name: "Enterprise", cap: 10_000, orgs: 6 },
]

/**
 * Platform admin.
 *
 * Kept inside the app shell rather than the settings shell: this is not
 * settings for YOUR workspace, it is a view across all of them, so it belongs
 * beside Timeline and Projects — behind a nav group that only appears for
 * platform admins.
 *
 * Tabs are correct here, unlike on /dashboard: these four panels are four
 * renderings of the same "everything on the platform" subject, and nobody
 * deep-links to one.
 */
function AdminScreen() {
  return (
    <AppShell>
      <TopBar>
        <Icon icon={ShieldIcon} size="sm" className="text-muted-foreground" />
        <Crumb>Administration</Crumb>
        <Crumb current>Platform</Crumb>
      </TopBar>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        <PageHeader
          title="Platform"
          description="Every organisation on this deployment."
        />

        <div className="flex flex-col gap-6">
          <Callout tone="error">
            You are acting as a platform administrator. Changes here affect
            every workspace.
          </Callout>

          <MetricRow>
            <MetricTile label="Organisations" value="505" />
            <MetricTile label="Active this week" value="128" />
            <MetricTile label="Spend · 30d" value="$41,208" />
            <MetricTile label="Failed sessions" value="37" detail="0.4%" />
          </MetricRow>

          <Tabs defaultValue="orgs">
            <TabsList variant="line">
              <TabsTrigger value="orgs">Organisations</TabsTrigger>
              <TabsTrigger value="tiers">Tiers</TabsTrigger>
              <TabsTrigger value="prices">Prices</TabsTrigger>
              <TabsTrigger value="models">Models</TabsTrigger>
            </TabsList>

            <TabsContent value="orgs">
              <div className="overflow-hidden rounded-md border border-border bg-card">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Organisation</TableHead>
                      <TableHead className="w-24 text-right">Members</TableHead>
                      <TableHead className="w-24">Tier</TableHead>
                      <TableHead className="w-20" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ORGANISATIONS.map((o, i) => (
                      <TableRow key={o.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-xs font-medium">
                              {o.name}
                            </span>
                            <span className="caption">/{o.slug}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right tnum">
                          {o.memberCount}
                        </TableCell>
                        <TableCell>
                          <Badge variant={i === 0 ? "info" : "secondary"}>
                            {i === 0 ? "Enterprise" : "Team"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            Grant
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="tiers">
              <div className="overflow-hidden rounded-md border border-border bg-card">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tier</TableHead>
                      <TableHead className="w-32 text-right">
                        Monthly cap
                      </TableHead>
                      <TableHead className="w-32 text-right">
                        Organisations
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {TIERS.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell className="text-xs font-medium">
                          {t.name}
                        </TableCell>
                        <TableCell className="text-right tnum">
                          {t.cap === 0 ? "—" : `$${t.cap.toLocaleString()}`}
                        </TableCell>
                        <TableCell className="text-right tnum">
                          {t.orgs}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="prices">
              <p className="py-8 text-center caption">
                Price history per model, with enable and disable dialogs.
              </p>
            </TabsContent>
            <TabsContent value="models">
              <p className="py-8 text-center caption">
                Model metadata: context window, vendor, capabilities.
              </p>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppShell>
  )
}
