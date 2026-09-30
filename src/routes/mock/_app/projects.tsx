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

import { cn } from "cn"

import { PROJECTS } from "@/mock/data"
import { hueFor } from "@/lib/hue"
import { Panel } from "@/components/patterns/panel"
import { NewProjectDrawer } from "@/components/projects/new-project-drawer"
import { PageHeader } from "@/components/patterns/section-header"
import { CompoundFilter, SegmentedPills } from "@/components/patterns/segmented"
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { HueDot, Tag } from "@/components/ui/tag"

export const Route = createFileRoute("/mock/_app/projects")({
  component: ProjectsScreen,
  // The sidebar links each project here by slug; the mock page shows the
  // whole grid either way, but the param is what lights the right row.
  validateSearch: (search: Record<string, unknown>): { project?: string } =>
    typeof search.project === "string" ? { project: search.project } : {},
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
 *
 * "New project" — the floating button and the dashed slot — opens a three-step sheet
 * from the bottom; what it creates lands first in the grid, ringed for a
 * moment so the eye finds it.
 */
function ProjectsScreen() {
  const [scope, setScope] = useState<Scope>("all")
  const [projects, setProjects] = useState(PROJECTS)
  const [creating, setCreating] = useState(false)
  // The project just made, marked for a moment where it lands.
  const [fresh, setFresh] = useState<string | null>(null)
  const visible = projects.filter((p) =>
    scope === "restricted" ? p.visibility === "restricted" : true
  )

  return (
    // Relative, so the floating button pins to this panel's corner.
    <div className="relative flex min-h-0 flex-1 flex-col">
      <ScrollFade className="min-h-0 flex-1">
        <div className="flex flex-col gap-4 px-5 pt-4 pb-6">
          <PageHeader
            className="pb-0"
            title="Projects"
            description={`${projects.length} repositories Atlas is watching for this workspace`}
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
                  className={cn(
                    "duration-slow transition-shadow",
                    fresh === p.id && "ring-2 ring-success/50"
                  )}
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
              onClick={() => setCreating(true)}
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

      <NewProjectDrawer
        open={creating}
        onOpenChange={setCreating}
        existing={projects.map((p) => p.slug)}
        onCreate={(p) => {
          setProjects((all) => [p, ...all])
          setScope("all")
          setFresh(p.id)
          window.setTimeout(() => setFresh(null), 2400)
        }}
      />

      {/* The page's one action, floating in the corner rather than
          competing with the filters in the header. The dashboard's invite
          button's size, so the two primary "+" read as one control. */}
      <Tooltip>
        <TooltipTrigger
          render={
            <button
              type="button"
              aria-label="New project"
              onClick={() => setCreating(true)}
              className="duration-fast absolute right-3 bottom-3 z-10 flex size-control-xl cursor-pointer items-center justify-center rounded-full bg-foreground text-background shadow-lg transition-transform ease-out-strong hover:scale-105 active:scale-95"
            >
              <Icon icon={PlusIcon} size="md" />
            </button>
          }
        />
        <TooltipContent side="left">New project</TooltipContent>
      </Tooltip>
    </div>
  )
}

function Figure({ value, label }: { value: number; label: string }) {
  return (
    <span className="flex items-baseline gap-1">
      <span className="text-lg leading-none figure">{value}</span>
      <span className="caption">
        {value === 1 ? label.replace(/s$/, "") : label}
      </span>
    </span>
  )
}
