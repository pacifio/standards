import { createFileRoute } from "@tanstack/react-router"
import { CheckIcon } from "lucide-react"
import { cn } from "cn"

import { PageHeader, SectionHeader } from "@/components/patterns/section-header"
import { SettingCard, SettingRow } from "@/components/patterns/setting-card"
import { Badge } from "@/components/ui/badge"
import { Callout } from "@/components/ui/callout"
import { Icon } from "@/components/ui/icon"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export const Route = createFileRoute("/mock/settings/ai")({
  component: AiSettings,
})

const MODELS = [
  {
    id: "claude-opus-5",
    label: "Claude Opus 5",
    vendor: "Anthropic",
    input: 5,
    output: 25,
    enabled: true,
  },
  {
    id: "claude-sonnet-5",
    label: "Claude Sonnet 5",
    vendor: "Anthropic",
    input: 1.5,
    output: 7.5,
    enabled: true,
  },
  {
    id: "claude-haiku-4-5",
    label: "Claude Haiku 4.5",
    vendor: "Anthropic",
    input: 0.5,
    output: 2.5,
    enabled: true,
  },
  {
    id: "gpt-5.4-high",
    label: "GPT-5.4 High",
    vendor: "OpenAI",
    input: 4,
    output: 20,
    enabled: true,
  },
  {
    id: "gemini-3-pro",
    label: "Gemini 3 Pro",
    vendor: "Google",
    input: 2,
    output: 10,
    enabled: false,
  },
]

const TIERS = [
  {
    id: "balanced",
    title: "Balanced",
    description: "Sonnet for most turns, Opus when a session stalls.",
    active: true,
  },
  {
    id: "thorough",
    title: "Thorough",
    description: "Opus everywhere. Roughly 3× the cost per session.",
    active: false,
  },
  {
    id: "economy",
    title: "Economy",
    description: "Haiku for tool calls, Sonnet for reasoning turns.",
    active: false,
  },
]

/**
 * AI settings.
 *
 * The routing tier is a RadioCardGroup rather than a select: the three options
 * differ by a sentence of consequence each, and a select would hide exactly
 * the sentence that decides it. This is the shape of Cursor's Privacy Mode
 * dialog, for the same reason.
 */
function AiSettings() {
  return (
    <>
      <PageHeader
        title="AI"
        description="Which models Atlas may call, and how it chooses between them."
      />

      <div className="flex flex-col gap-8">
        <Callout tone="warning">
          Two models are billed at preview rates that change on 1 November.
        </Callout>

        <section>
          <SectionHeader
            title="Routing"
            description="How Atlas picks a model for a turn."
          />
          <div
            role="radiogroup"
            aria-label="Routing tier"
            className="flex flex-col gap-2"
          >
            {TIERS.map((t) => (
              <button
                key={t.id}
                type="button"
                role="radio"
                aria-checked={t.active}
                className={cn(
                  "flex items-start gap-3 rounded-md border px-3 py-2.5 text-left",
                  "duration-fast transition-colors ease-out-strong",
                  t.active
                    ? "border-border-strong bg-element-selected"
                    : "border-border bg-card hover:bg-element-hover"
                )}
              >
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="flex items-center gap-2">
                    <span className="label">{t.title}</span>
                    {t.active && <Badge size="sm">Active</Badge>}
                  </span>
                  <span className="caption">{t.description}</span>
                </span>
                {t.active && (
                  <Icon icon={CheckIcon} size="sm" className="mt-0.5" />
                )}
              </button>
            ))}
          </div>
        </section>

        <section>
          <SectionHeader title="Limits" />
          <SettingCard>
            <SettingRow
              label="Monthly budget"
              description="Atlas stops accepting new sessions at the cap."
              control={
                <Input
                  defaultValue="600"
                  size="sm"
                  className="w-24 text-right"
                />
              }
            />
            <SettingRow
              label="Default model"
              description="Used when a session does not name one."
              control={
                <Select
                  defaultValue="claude-sonnet-5"
                  items={Object.fromEntries(MODELS.map((m) => [m.id, m.label]))}
                >
                  <SelectTrigger size="sm" className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MODELS.filter((m) => m.enabled).map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              }
            />
            <SettingRow
              label="Allow overage"
              description="Keep running past the cap and bill the difference."
              control={<Switch />}
            />
          </SettingCard>
        </section>

        <section>
          <SectionHeader
            title="Models"
            description="Prices are per million tokens."
          />
          <div className="overflow-hidden rounded-md border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Model</TableHead>
                  <TableHead className="w-24 text-right">Input</TableHead>
                  <TableHead className="w-24 text-right">Output</TableHead>
                  <TableHead className="w-16 text-right">Enabled</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MODELS.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-xs font-medium">{m.label}</span>
                        <span className="caption">{m.vendor}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right tnum">
                      ${m.input.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right tnum">
                      ${m.output.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Switch size="sm" defaultChecked={m.enabled} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>
      </div>
    </>
  )
}
