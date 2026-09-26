import { createFileRoute } from "@tanstack/react-router"
import { CopyIcon, MoreHorizontalIcon, Trash2Icon } from "lucide-react"

import { PageHeader } from "@/components/patterns/section-header"
import { Sample, Specimen } from "@/components/gallery/specimen"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Callout } from "@/components/ui/callout"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Icon } from "@/components/ui/icon"
import { IconButton } from "@/components/ui/icon-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export const Route = createFileRoute("/ds/components/overlays")({
  component: OverlaysGallery,
})

function OverlaysGallery() {
  return (
    <>
      <PageHeader
        title="Overlays"
        description="Menus, popovers, tooltips and dialogs."
      />

      <Callout tone="info">
        Every floating surface is the same material: popover fill, a
        foreground/10 ring, <code className="code">shadow-md</code>, and a 150ms
        scale-in from its own transform origin. Only dialogs step up to{" "}
        <code className="code">shadow-lg</code> and a 12px radius.
      </Callout>

      <Specimen
        title="Dropdown menu"
        note="Menu items are 28px, sentence case, with the shortcut pushed to the trailing edge in dimmed tabular text. Destructive items are tinted, never filled."
      >
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <IconButton icon={MoreHorizontalIcon} label="Row actions" />
            }
          />
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>Session</DropdownMenuLabel>
            <DropdownMenuItem>
              <Icon icon={CopyIcon} size="sm" />
              Copy link
              <DropdownMenuShortcut>⌘ C</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuCheckboxItem defaultChecked>
              Subscribe to updates
            </DropdownMenuCheckboxItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Move to project</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem>atlas</DropdownMenuItem>
                <DropdownMenuItem>server</DropdownMenuItem>
                <DropdownMenuItem>standards</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">
              <Icon icon={Trash2Icon} size="sm" />
              Delete session
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <span className="caption">Open it — the submenu opens inline-end.</span>
      </Specimen>

      <Specimen
        title="Tooltip"
        note="Not inverted. A light chip on a dark page is the loudest thing on screen for a label that is, by definition, secondary. 300ms to open, with a 300ms warm window so scanning a toolbar does not mean waiting six times."
      >
        <Tooltip>
          <TooltipTrigger
            render={<Button variant="outline">Hover me</Button>}
          />
          <TooltipContent>Sync this project now</TooltipContent>
        </Tooltip>
      </Specimen>

      <Specimen title="Popover">
        <Popover>
          <PopoverTrigger render={<Button variant="outline">Share</Button>} />
          <PopoverContent>
            <PopoverHeader>
              <PopoverTitle>Public link</PopoverTitle>
              <PopoverDescription>
                Anyone with the link can read this session.
              </PopoverDescription>
            </PopoverHeader>
            <Input defaultValue="atlas.dev/s/k3f9q" readOnly />
            <Button variant="default" size="sm">
              Copy link
            </Button>
          </PopoverContent>
        </Popover>
      </Specimen>

      <Specimen title="Dialog">
        <Sample label="form dialog">
          <Dialog>
            <DialogTrigger render={<Button>Invite</Button>} />
            <DialogContent size="sm">
              <DialogHeader>
                <DialogTitle>Invite to Atlas</DialogTitle>
                <DialogDescription>
                  They will get an email with a link that expires in seven days.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-2">
                <Label htmlFor="gallery-email">Email</Label>
                <Input id="gallery-email" placeholder="name@company.com" />
              </div>
              <DialogFooter>
                <Button variant="outline">Cancel</Button>
                <Button variant="default">Send invite</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </Sample>

        <Sample label="confirm">
          <AlertDialog>
            <AlertDialogTrigger
              render={<Button variant="destructive">Delete</Button>}
            />
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this project?</AlertDialogTitle>
                <AlertDialogDescription>
                  284 sessions will stop syncing. Sessions already captured stay
                  readable. You cannot undo this.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction>Delete project</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </Sample>
      </Specimen>

      <Callout tone="neutral">
        The confirm dialog is the one place a solid destructive fill is correct
        — destruction is the action being confirmed, so it carries the weight.
        Everywhere else{" "}
        <code className="code">variant=&quot;destructive&quot;</code> is tinted,
        so it does not outshout the primary action beside it.
      </Callout>
    </>
  )
}
