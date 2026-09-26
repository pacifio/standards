import { Link, createFileRoute } from "@tanstack/react-router"
import { ArrowRightIcon } from "lucide-react"

export const Route = createFileRoute("/")({ component: Home })

const ENTRIES = [
  {
    to: "/ds/foundations/colour",
    title: "Design system",
    description:
      "Tokens, 36 components and the patterns they compose into, every variant and state, in both appearances.",
  },
  {
    to: "/mock/inbox",
    title: "App mock",
    description:
      "The Atlas web app rebuilt on the system: the rail, the org switcher, and every signed-in screen the server repo has.",
  },
] as const

function Home() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-8 p-6">
      <div className="flex max-w-md flex-col gap-2 text-center">
        <h1 className="text-xl font-semibold tracking-tight">
          Atlas Standards
        </h1>
        <p className="text-xs text-balance text-secondary-foreground">
          The UI design system for the Atlas web app. Cursor&apos;s component
          language, Linear&apos;s layout, on the desktop app&apos;s tokens.
        </p>
      </div>

      <div className="grid w-full max-w-lg gap-3 sm:grid-cols-2">
        {ENTRIES.map((e) => (
          <Link
            key={e.to}
            to={e.to}
            className="group/card duration-fast flex flex-col gap-2 rounded-md border border-border bg-card p-4 transition-colors ease-out-strong hover:bg-element-hover"
          >
            <span className="flex items-center gap-1.5">
              <span className="label font-semibold">{e.title}</span>
              <ArrowRightIcon className="duration-fast size-3.5 text-muted-foreground transition-transform group-hover/card:translate-x-0.5" />
            </span>
            <span className="caption text-balance">{e.description}</span>
          </Link>
        ))}
      </div>
    </main>
  )
}
