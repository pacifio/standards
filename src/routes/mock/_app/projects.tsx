import { useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import {
  ChevronDownIcon,
  Link2Icon,
  MoreHorizontalIcon,
  PlusIcon,
  RefreshCwIcon,
  UsersIcon,
} from "lucide-react"

import { PROJECTS } from "@/mock/data"
import { hueFor } from "@/lib/hue"
import { Panel } from "@/components/patterns/panel"
import { PageHeader } from "@/components/patterns/section-header"
import { CompoundFilter, SegmentedPills } from "@/components/patterns/segmented"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Icon } from "@/components/ui/icon"
import { IconButton } from "@/components/ui/icon-button"
import { Progress } from "@/components/ui/progress"
import { ScrollFade } from "@/components/ui/scroll-fade"
import { Spinner } from "@/components/ui/spinner"
import { HueDot, Tag } from "@/components/ui/tag"

export const Route = createFileRoute("/mock/_app/projects")({
  component: ProjectsScreen,
})

type Scope = "all" | "mine" | "restricted"

/**
 * Projects.
 *
 * A grid of Panels, staggered in down the page. Each card answers the three
 * questions someone opens this screen with — how much is in it, who can see
 * it, and is it up to date — and hides everything else behind the row menu.
 *
 * Every project has a hue, derived from its id, so the same project is the
 * same colour on this screen, in a session's property block and in the
 * sidebar. That is what the hue palette is for: identity, never status.
 *
 * A project mid-sync shows a determinate bar inside the card, because the
 * card is the thing being synced.
 */
function ProjectsScreen() {
  const [scope, setScope] = useState<Scope>("all")
  const visible = PROJECTS.filter((p) =>
    scope === "restricted" ? p.visibility === "restricted" : true
  )

  return (
    <>
      <ScrollFade className="min-h-0 flex-1">
        <div className="flex flex-col gap-4 px-5 pt-4 pb-6">
          <PageHeader
            className="pb-0"
            title="Projects"
            description={`${PROJECTS.length} repositories Atlas is watching for this workspace`}
            action={
              <div className="flex flex-wrap items-center gap-2">
                <SegmentedPills<Scope>
                  value={scope}
                  onChange={setScope}
                  options={[
                    { value: "all", label: "All" },
                    { value: "mine", label: "Mine" },
                    { value: "restricted", label: "Restricted" },
                  ]}
                />
                <CompoundFilter label="Sort">
                  Recent
                  <Icon icon={ChevronDownIcon} size="xs" />
                </CompoundFilter>
                <Button variant="default" size="sm">
                  <PlusIcon />
                  New project
                </Button>
              </div>
            }
          />

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {visible.map((p, i) => {
              const hue = hueFor(p.id)
              return (
                <Panel
                  key={p.id}
                  delay={i * 0.05}
                  title={
                    <span className="flex items-center gap-2">
                      <HueDot hue={hue} />
                      {p.name}
                    </span>
                  }
                  subtitle={`/${p.slug}`}
                  actions={
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <IconButton
                            icon={MoreHorizontalIcon}
                            label={`Actions for ${p.name}`}
                            size="sm"
                          />
                        }
                      />
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Icon icon={UsersIcon} size="sm" />
                          Manage members
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Icon icon={Link2Icon} size="sm" />
                          Share links
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Icon icon={RefreshCwIcon} size="sm" />
                          Sync now
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant="destructive">
                          Delete project
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  }
                  bodyClassName="flex flex-col gap-3"
                >
                  <div className="flex items-baseline gap-4">
                    <Figure value={p.sessionCount} label="sessions" />
                    <Figure value={p.memberCount} label="members" />
                    {p.visibility === "restricted" && (
                      <Tag hue="amber" className="ml-auto self-center">
                        Restricted
                      </Tag>
                    )}
                  </div>

                  {p.syncProgress !== undefined ? (
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-1.5">
                        <Spinner size="xs" label="" />
                        <span className="caption">
                          Syncing · {Math.round(p.syncProgress * 100)}%
                        </span>
                      </div>
                      <Progress value={p.syncProgress * 100} />
                    </div>
                  ) : (
                    <span className="caption">Synced {p.lastSyncedAt}</span>
                  )}
                </Panel>
              )
            })}

            {/* The empty slot: a dashed outline where the next card goes.
                It is the "New project" action drawn as the thing it makes. */}
            <button
              type="button"
              className="flex min-h-28 flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-border text-muted-foreground transition-colors hover:border-border-strong hover:bg-element-hover hover:text-foreground"
            >
              <span className="flex size-7 items-center justify-center rounded-full bg-muted">
                <Icon icon={PlusIcon} size="sm" />
              </span>
              <span className="text-2xs font-medium">New project</span>
            </button>
          </div>
        </div>
      </ScrollFade>
    </>
  )
}

function Figure({ value, label }: { value: number; label: string }) {
  return (
    <span className="flex items-baseline gap-1">
      <span className="text-lg leading-none figure">{value}</span>
      <span className="caption">{label}</span>
    </span>
  )
}
