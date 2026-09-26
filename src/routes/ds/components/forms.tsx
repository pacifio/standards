import { createFileRoute } from "@tanstack/react-router"
import { SearchIcon } from "lucide-react"

import { PageHeader } from "@/components/patterns/section-header"
import { Sample, Specimen } from "@/components/gallery/specimen"
import { Callout } from "@/components/ui/callout"
import { Checkbox } from "@/components/ui/checkbox"
import { Icon } from "@/components/ui/icon"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"

export const Route = createFileRoute("/ds/components/forms")({
  component: FormsGallery,
})

const MODELS = {
  "claude-opus-5": "Claude Opus 5",
  "claude-sonnet-5": "Claude Sonnet 5",
  "gpt-5.4-high": "GPT-5.4 High",
}

function FormsGallery() {
  return (
    <>
      <PageHeader
        title="Forms"
        description="Inputs, selects, toggles and choices."
      />

      <Callout tone="warning">
        The server web app has no <code className="code">Select</code> — every
        choice there is a raw <code className="code">&lt;select&gt;</code>,
        which renders differently on macOS, Windows and Linux. This is the
        replacement, and porting it is the single highest-value swap.
      </Callout>

      <Specimen
        title="Input"
        note="Focus lifts the border to border-strong rather than drawing a ring. An input that gains both a ring and a brighter border reads as two states at once."
      >
        <Sample label="default">
          <Input placeholder="Search sessions" className="w-48" />
        </Sample>
        <Sample label="with value">
          <Input defaultValue="feat/board-facets" className="w-48" />
        </Sample>
        <Sample label="disabled">
          <Input placeholder="Disabled" disabled className="w-48" />
        </Sample>
        <Sample label="invalid">
          <Input defaultValue="not an email" aria-invalid className="w-48" />
        </Sample>
        <Sample label="with icon">
          <span className="relative">
            <Icon
              icon={SearchIcon}
              size="sm"
              className="pointer-events-none absolute top-1/2 left-2 -translate-y-1/2 text-muted-foreground"
            />
            <Input placeholder="Search" className="w-48 pl-7" />
          </span>
        </Sample>
      </Specimen>

      <Specimen title="Textarea">
        <Textarea placeholder="Leave a comment…" className="w-full" rows={3} />
      </Specimen>

      <Specimen
        title="Select"
        note="Two trigger looks. `bordered` is a form field; `ghost` is a control inside a toolbar or a settings row, where a box around it would be the fourth rectangle in a row of three."
      >
        <Sample label="bordered">
          <Select defaultValue="claude-sonnet-5" items={MODELS}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(MODELS).map(([v, l]) => (
                <SelectItem key={v} value={v}>
                  {l}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Sample>
        <Sample label="ghost">
          <Select defaultValue="claude-opus-5" items={MODELS}>
            <SelectTrigger variant="ghost">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(MODELS).map(([v, l]) => (
                <SelectItem key={v} value={v}>
                  {l}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Sample>
        <Sample label="disabled">
          <Select defaultValue="claude-opus-5" items={MODELS} disabled>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent />
          </Select>
        </Sample>
      </Specimen>

      <Specimen
        title="Switch"
        note="Off is the input fill, on is the primary ink — not green. 'On' is a state, not a success."
      >
        <Sample label="off">
          <Switch />
        </Sample>
        <Sample label="on">
          <Switch defaultChecked />
        </Sample>
        <Sample label="sm">
          <Switch size="sm" defaultChecked />
        </Sample>
        <Sample label="disabled">
          <Switch disabled />
        </Sample>
        <Sample label="with label">
          <Label>
            <Switch defaultChecked />
            Capture prompts
          </Label>
        </Sample>
      </Specimen>

      <Specimen title="Checkbox & radio">
        <Sample label="unchecked">
          <Checkbox />
        </Sample>
        <Sample label="checked">
          <Checkbox defaultChecked />
        </Sample>
        <Sample label="indeterminate">
          <Checkbox indeterminate />
        </Sample>
        <Sample label="disabled">
          <Checkbox disabled />
        </Sample>
        <Sample label="radio group">
          <RadioGroup defaultValue="b" className="flex gap-4">
            <Label>
              <RadioGroupItem value="a" />
              Org
            </Label>
            <Label>
              <RadioGroupItem value="b" />
              Restricted
            </Label>
          </RadioGroup>
        </Sample>
      </Specimen>
    </>
  )
}
