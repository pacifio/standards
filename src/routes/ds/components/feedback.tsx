import { createFileRoute } from "@tanstack/react-router"
import { InboxIcon, PlusIcon } from "lucide-react"

import { PageHeader } from "@/components/patterns/section-header"
import { Sample, Specimen } from "@/components/gallery/specimen"
import { Button } from "@/components/ui/button"
import { Callout } from "@/components/ui/callout"
import { EmptyState } from "@/components/ui/empty-state"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"

export const Route = createFileRoute("/ds/components/feedback")({
  component: FeedbackGallery,
})

function FeedbackGallery() {
  return (
    <>
      <PageHeader
        title="Feedback"
        description="Callouts, empty states, progress and loading."
      />

      <Specimen
        title="Callout"
        note="The one place a tinted surface is correct, because the whole block IS the status. A callout a user can dismiss forever is not a callout — that is a toast."
      >
        <div className="flex w-full flex-col gap-2">
          <Callout tone="neutral">
            Prompt capture is off by default and can be turned off again at any
            time.
          </Callout>
          <Callout tone="info">
            Two models are billed at preview rates that change on 1 November.
          </Callout>
          <Callout tone="success">Project synced 2 minutes ago.</Callout>
          <Callout tone="warning">
            You have limited free reviews this month.
          </Callout>
          <Callout tone="error">
            You are acting as a platform administrator. Changes here affect
            every workspace.
          </Callout>
        </div>
      </Specimen>

      <Specimen
        title="Empty state"
        note="Say what would be here, not that there is nothing here. 'No sessions in the last 7 days' beats 'Nothing found', because the first tells you which filter to widen."
      >
        <div className="w-full rounded-md border border-border">
          <EmptyState
            icon={InboxIcon}
            title="No sessions in the last 7 days"
            description="Widen the range, or start a session from the desktop app."
            action={
              <Button size="sm">
                <PlusIcon />
                New session
              </Button>
            }
          />
        </div>
      </Specimen>

      <Specimen title="Progress & loading">
        <div className="flex w-full flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Progress value={62} />
            <span className="caption">Determinate — syncing, 62%</span>
          </div>
          <div className="flex items-center gap-4">
            <Sample label="xs">
              <Spinner size="xs" />
            </Sample>
            <Sample label="sm">
              <Spinner size="sm" />
            </Sample>
            <Sample label="md">
              <Spinner size="md" />
            </Sample>
            <Sample label="lg">
              <Spinner size="lg" />
            </Sample>
          </div>
        </div>
      </Specimen>

      <Specimen
        title="Skeleton"
        note="Animates opacity only. A shimmer that slides a gradient repaints the whole list every frame, which on a 200-row board costs more than the request it is standing in for."
      >
        <div className="flex w-full flex-col gap-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="size-control-sm rounded-full" />
              <Skeleton className="h-3 flex-1" />
              <Skeleton className="h-3 w-12" />
            </div>
          ))}
        </div>
      </Specimen>
    </>
  )
}
