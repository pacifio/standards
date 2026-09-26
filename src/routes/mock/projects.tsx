import { createFileRoute } from "@tanstack/react-router"
import {
  FolderGitIcon,
  Link2Icon,
  MoreHorizontalIcon,
  PlusIcon,
  RefreshCwIcon,
  UsersIcon,
} from "lucide-react"

import { PROJECTS } from "@/mock/data"
import { AppShell } from "@/components/shell/app-shell"
import { Crumb, TopBar } from "@/components/shell/top-bar"
import { PageHeader, SectionHeader } from "@/components/patterns/section-header"
import { Badge } from "@/components/ui/badge"
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
import { Spinner } from "@/components/ui/spinner"

export const Route = createFileRoute("/mock/projects")({
  component: ProjectsScreen,
})

/**
 * Projects.
 *
 * A card grid rather than the 970-line stack of bespoke sections the current
 * route renders. Each card answers the three questions someone opens this
 * screen with — how much is in it, who can see it, and is it up to date —
 * and hides everything else behind the row menu.
 *
 * A project mid-sync shows a determinate bar. The current app renders sync
 * progress in two different places with two different treatments; here it is
 * part of the card, because that is the thing being synced.
 */
function ProjectsScreen() {
  return (
    <AppShell>
      <TopBar>
        <Icon
          icon={FolderGitIcon}
          size="sm"
          className="text-muted-foreground"
        />
        <Crumb current>Projects</Crumb>
      </TopBar>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        <PageHeader
          title="Projects"
          description="Repositories Atlas is watching for this workspace."
          action={
            <Button variant="default">
              <PlusIcon />
              New project
            </Button>
          }
        />

        <SectionHeader
          title="Active"
          description={`${PROJECTS.length} projects`}
        />

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {PROJECTS.map((p) => (
            <div
              key={p.id}
              className="flex flex-col gap-3 rounded-md border border-border bg-card p-3"
            >
              <div className="flex items-start gap-2">
                <Icon
                  icon={FolderGitIcon}
                  size="sm"
                  className="mt-0.5 text-muted-foreground"
                />
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="truncate text-xs font-medium">{p.name}</span>
                  <span className="truncate caption">/{p.slug}</span>
                </div>
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
              </div>

              <div className="flex items-center gap-1.5">
                <Badge variant="secondary">
                  <span className="tnum">{p.sessionCount}</span> sessions
                </Badge>
                <Badge variant="secondary">
                  <span className="tnum">{p.memberCount}</span> members
                </Badge>
                {p.visibility === "restricted" && (
                  <Badge variant="warning">Restricted</Badge>
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
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  )
}
