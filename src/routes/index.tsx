import { Link, createFileRoute } from "@tanstack/react-router"
import { ArrowUpRightIcon } from "lucide-react"

import { DashedRails } from "@/components/blocks/dashed-rails"
import { Panel } from "@/components/patterns/panel"
import { Icon } from "@/components/ui/icon"

export const Route = createFileRoute("/")({ component: Home })

const ENTRIES = [
  {
    to: "/ds/foundations/colour",
    title: "Design system",
    description:
      "Tokens, the primitives, the patterns they compose into and the illustration blocks — every variant and state, in both appearances.",
    meta: "Foundations · Components · Compositions",
  },
  {
    to: "/mock/inbox",
    title: "App mock",
    description:
      "The Atlas web app rebuilt on the system: the rail, the org switcher, and every signed-in screen the server repo has.",
    meta: "Inbox · Timeline · Projects · Chat · Settings",
  },
] as const

/**
 * The front door. Two ringed panels on a dashed-rail field — the whole
 * language in one screen, before you open either half.
 */
function Home() {
  return (
    <main className="relative flex min-h-svh flex-col items-center justify-center gap-10 bg-background p-6">
      <DashedRails fade />

      <div className="relative flex max-w-md flex-col gap-2 text-center">
        <span className="micro">Atlas Standards</span>
        <h1 className="text-2xl font-medium tracking-tight text-balance">
          The design system for the Atlas web app.
        </h1>
        <p className="text-xs text-balance text-secondary-foreground">
          Achromatic surfaces, hairline rules and rings instead of shadows; hue
          only where something has an identity.
        </p>
      </div>

      <div className="relative grid w-full max-w-2xl gap-4 sm:grid-cols-2">
        {ENTRIES.map((e, i) => (
          <Link key={e.to} to={e.to} className="group/card outline-none">
            <Panel
              delay={0.1 + i * 0.06}
              title={e.title}
              subtitle={e.meta}
              actions={
                <span className="flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform group-hover/card:scale-105">
                  <Icon icon={ArrowUpRightIcon} size="xs" />
                </span>
              }
              className="h-full transition-colors group-hover/card:bg-illustration group-focus-visible/card:ring-foreground/40"
            >
              <p className="caption text-balance">{e.description}</p>
            </Panel>
          </Link>
        ))}
      </div>
    </main>
  )
}
