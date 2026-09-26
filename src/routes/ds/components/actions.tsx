import { createFileRoute } from "@tanstack/react-router"
import { ArrowRightIcon, PlusIcon, Trash2Icon } from "lucide-react"

import { PageHeader } from "@/components/patterns/section-header"
import { Sample, Specimen } from "@/components/gallery/specimen"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Callout } from "@/components/ui/callout"
import { IconButton } from "@/components/ui/icon-button"
import { Kbd, KbdGroup } from "@/components/ui/kbd"
import { Pill, StatusDot } from "@/components/ui/pill"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export const Route = createFileRoute("/ds/components/actions")({
  component: ActionsGallery,
})

const VARIANTS = [
  "default",
  "secondary",
  "outline",
  "ghost",
  "destructive",
  "link",
] as const

function ActionsGallery() {
  return (
    <>
      <PageHeader
        title="Actions"
        description="Buttons, icon buttons, chips and tabs."
      />

      <Callout tone="info">
        <code className="code">default</code> is the one loud element on a
        screen — use it at most once per view. The toolbar default is{" "}
        <code className="code">secondary</code>.
      </Callout>

      <Callout tone="neutral">
        <strong className="font-semibold text-foreground">
          Buttons are pills.
        </strong>{" "}
        <code className="code">rounded-full</code> at every size and variant,
        following Cursor and the Atlas landing site. This is the one place the
        system departs from the 4/6/8/12 radius ladder: cards, inputs, menus and
        dialogs keep it, and only the things you click are round. Badges stay{" "}
        <code className="code">rounded-sm</code> — a badge is a statement, not
        an action, and a page of pills has no hierarchy left.
      </Callout>

      <Specimen title="Button variants">
        {VARIANTS.map((v) => (
          <Sample key={v} label={v}>
            <Button variant={v}>Action</Button>
          </Sample>
        ))}
      </Specimen>

      <Specimen
        title="States"
        note="Focus is drawn once, globally, as a 1px outline at 1px offset in the action colour — components do not carry their own ring. Press scales to 99%: small enough that you feel it rather than watch it, which on a pill reads as give. Disabled is one treatment everywhere: 50% opacity plus not-allowed."
      >
        <Sample label="default">
          <Button>Action</Button>
        </Sample>
        <Sample label="with icon">
          <Button>
            <PlusIcon />
            New session
          </Button>
        </Sample>
        <Sample label="trailing icon">
          <Button variant="outline">
            Continue
            <ArrowRightIcon />
          </Button>
        </Sample>
        <Sample label="disabled">
          <Button disabled>Action</Button>
        </Sample>
        <Sample label="destructive">
          <Button variant="destructive">
            <Trash2Icon />
            Delete
          </Button>
        </Sample>
      </Specimen>

      <Specimen
        title="Icon buttons"
        note="`label` is a required prop, so an unlabelled icon button is a type error rather than an accessibility bug found in review."
      >
        <Sample label="xs">
          <IconButton icon={PlusIcon} label="Add" size="xs" />
        </Sample>
        <Sample label="sm">
          <IconButton icon={PlusIcon} label="Add" size="sm" />
        </Sample>
        <Sample label="md">
          <IconButton icon={PlusIcon} label="Add" size="md" />
        </Sample>
        <Sample label="lg">
          <IconButton icon={PlusIcon} label="Add" size="lg" />
        </Sample>
        <Sample label="outline">
          <IconButton icon={PlusIcon} label="Add" variant="outline" />
        </Sample>
        <Sample label="with tooltip">
          <Tooltip>
            <TooltipTrigger
              render={<IconButton icon={Trash2Icon} label="Delete session" />}
            />
            <TooltipContent>
              Delete session <Kbd>⌫</Kbd>
            </TooltipContent>
          </Tooltip>
        </Sample>
      </Specimen>

      <Specimen
        title="Badges"
        note="Sentence case. Uppercase with tracking belongs to `eyebrow`, which labels a group — a badge that shouts is louder than the row it is describing."
      >
        <Sample label="default">
          <Badge>Admin</Badge>
        </Sample>
        <Sample label="secondary">
          <Badge variant="secondary">Developer</Badge>
        </Sample>
        <Sample label="outline">
          <Badge variant="outline">atlas</Badge>
        </Sample>
        <Sample label="success">
          <Badge variant="success">Live</Badge>
        </Sample>
        <Sample label="warning">
          <Badge variant="warning">Queued</Badge>
        </Sample>
        <Sample label="error">
          <Badge variant="error">Failed</Badge>
        </Sample>
        <Sample label="info">
          <Badge variant="info">Beta</Badge>
        </Sample>
        <Sample label="sm">
          <Badge size="sm">Free</Badge>
        </Sample>
      </Specimen>

      <Specimen
        title="Pills & dots"
        note="A badge states a fact about a row. A pill is usually interactive or removable, and its full radius is what says so."
      >
        <Sample label="pill">
          <Pill>claude-opus-5</Pill>
        </Sample>
        <Sample label="with dot">
          <Pill>
            <StatusDot tone="success" />
            Running
          </Pill>
        </Sample>
        <Sample label="dots">
          <span className="flex items-center gap-2">
            <StatusDot />
            <StatusDot tone="success" />
            <StatusDot tone="warning" />
            <StatusDot tone="error" />
            <StatusDot tone="info" />
          </span>
        </Sample>
      </Specimen>

      <Specimen title="Keycaps">
        <Sample label="single">
          <Kbd>Esc</Kbd>
        </Sample>
        <Sample label="chord">
          <KbdGroup>
            <Kbd>⌘</Kbd>
            <Kbd>K</Kbd>
          </KbdGroup>
        </Sample>
        <Sample label="sequence">
          <KbdGroup>
            <Kbd>G</Kbd>
            <span className="caption">then</span>
            <Kbd>S</Kbd>
          </KbdGroup>
        </Sample>
      </Specimen>

      <Specimen
        title="Tabs"
        note="`segmented` is a local switch between renderings of the same data. `line` is a section-level switch between different content. Neither is navigation — a tab you can link to is a nav item."
      >
        <div className="flex w-full flex-col gap-6">
          <Tabs defaultValue="30d">
            <TabsList>
              <TabsTrigger value="1d">1d</TabsTrigger>
              <TabsTrigger value="7d">7d</TabsTrigger>
              <TabsTrigger value="30d">30d</TabsTrigger>
            </TabsList>
          </Tabs>
          <Tabs defaultValue="orgs">
            <TabsList variant="line">
              <TabsTrigger value="orgs">Organisations</TabsTrigger>
              <TabsTrigger value="tiers">Tiers</TabsTrigger>
              <TabsTrigger value="prices">Prices</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </Specimen>
    </>
  )
}
