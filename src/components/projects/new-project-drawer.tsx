"use client"

import { useEffect, useState } from "react"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { AnimatePresence, motion } from "motion/react"
import {
  ArrowRightIcon,
  BrainIcon,
  CheckIcon,
  ChevronLeftIcon,
  FolderGitIcon,
  GitBranchIcon,
  GlobeIcon,
  LockIcon,
  ScrollTextIcon,
  SparklesIcon,
  XIcon,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { cn } from "cn"

import { MEMBERS } from "@/mock/data"
import type { LabelTone, Project } from "@/mock/types"
import { hueFor } from "@/lib/hue"
import { useOrg } from "@/lib/org-context"
import { useTheme } from "@/lib/theme"
import { SPRING_PILL } from "@/lib/motion"
import { useMeasure } from "@/lib/use-measure"
import { AtlasMark } from "@/components/ui/atlas-mark"
import { Icon } from "@/components/ui/icon"
import { ModelMark } from "@/components/ui/model-badge"
import { Spinner } from "@/components/ui/spinner"
import { HueDot, Tag } from "@/components/ui/tag"

/**
 * Creating a project, as a sheet that rises from the bottom and walks
 * through three steps: what it is called, how it is wired, and a last look
 * before it is made.
 *
 * The sheet's height follows its content — measured, and animated between
 * steps — while the steps themselves cross-fade with a slight scale, so the
 * sheet reads as one object changing shape rather than three dialogs.
 *
 * Step one leads with an illustration that builds the project as you type
 * it: the card in the middle takes the name, the slug and the project's
 * hue, and teammates wait on the orbits to be let in.
 *
 * The fields are the server's: name, slug (unique in the org — lowercase,
 * numbers, hyphens), an optional repository URL, and whether only named
 * members can see it. Confirming waits on a mock request, then hands the
 * new project back to the page.
 */

type Step = "name" | "details" | "review"
const STEPS: Array<Step> = ["name", "details", "review"]
const TITLE: Record<Step, string> = {
  name: "New project",
  details: "Details",
  review: "Review",
}

const EASE_HEIGHT = [0.25, 1, 0.5, 1] as const
const EASE_STEP = [0.26, 0.08, 0.25, 1] as const

/** "Atlas Server" → "atlas-server". */
const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48)

const SLUG_OK = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

type Draft = {
  name: string
  slug: string
  /** Once the slug is typed into, it stops following the name. */
  slugTouched: boolean
  repoUrl: string
  restricted: boolean
}

const EMPTY: Draft = {
  name: "",
  slug: "",
  slugTouched: false,
  repoUrl: "",
  restricted: false,
}

function NewProjectDrawer({
  open,
  onOpenChange,
  existing,
  onCreate,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Slugs already taken in the org. */
  existing: Array<string>
  onCreate: (project: Project) => void
}) {
  const [step, setStep] = useState<Step>("name")
  const [draft, setDraft] = useState<Draft>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [measure, box] = useMeasure<HTMLDivElement>()
  // The sheet is drawn in the other theme — dark over a light page, light
  // over a dark one — so it reads as a layer above the grid, not part of it.
  const { appearance } = useTheme()
  const inverted = appearance === "dark" ? "light" : "dark"

  // Every open starts over.
  useEffect(() => {
    if (!open) return
    setStep("name")
    setDraft(EMPTY)
    setSaving(false)
  }, [open])

  const slug = draft.slugTouched ? draft.slug : slugify(draft.name)
  const taken = existing.includes(slug)
  const slugValid = SLUG_OK.test(slug) && !taken
  const repoValid =
    !draft.repoUrl.trim() || /^https?:\/\/\S+\.\S+/.test(draft.repoUrl.trim())
  const canNext =
    step === "name"
      ? draft.name.trim().length > 0 && slugValid
      : step === "details"
        ? repoValid
        : !saving

  const go = (to: Step) => setStep(to)

  async function next() {
    if (!canNext) return
    if (step === "name") return go("details")
    if (step === "details") return go("review")
    setSaving(true)
    // The mock's "request": long enough to see, short enough not to wait.
    await new Promise((r) => setTimeout(r, 1300))
    onCreate({
      id: `p-${slug}`,
      name: draft.name.trim(),
      slug,
      sessionCount: 0,
      memberCount: draft.restricted ? 1 : MEMBERS.length,
      visibility: draft.restricted ? "restricted" : "org",
      lastSyncedAt: "just now",
    })
    onOpenChange(false)
  }

  const view = {
    name: (
      <NameStep
        draft={draft}
        slug={slug}
        taken={taken}
        onChange={(patch) => setDraft((d) => ({ ...d, ...patch }))}
        onSubmit={next}
      />
    ),
    details: (
      <DetailsStep
        draft={draft}
        repoValid={repoValid}
        onChange={(patch) => setDraft((d) => ({ ...d, ...patch }))}
        onSubmit={next}
      />
    ),
    review: <ReviewStep draft={draft} slug={slug} />,
  }[step]

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(o) => !saving && onOpenChange(o)}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="duration-base fixed inset-0 z-overlay bg-background/60 backdrop-blur-sm transition-opacity data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <DialogPrimitive.Popup
          data-theme={inverted}
          className={cn(
            "fixed inset-x-4 bottom-4 z-modal mx-auto max-w-96 overflow-hidden rounded-3xl bg-popover text-popover-foreground shadow-lg ring-1 ring-foreground/10 outline-none",
            // Rises from below the fold, and sinks back into it.
            "duration-slow transition-[translate,opacity] ease-out-strong data-ending-style:translate-y-[calc(100%+1rem)] data-starting-style:translate-y-[calc(100%+1rem)]"
          )}
        >
          <motion.div
            animate={{ height: box.height || "auto" }}
            transition={{ duration: 0.27, ease: EASE_HEIGHT }}
          >
            <div ref={measure}>
              <header className="flex items-center justify-between gap-3 px-5 pt-5 pb-1">
                <RoundButton
                  label="Back"
                  onClick={() => go(STEPS[STEPS.indexOf(step) - 1])}
                  className={cn(
                    step === "name" && "pointer-events-none opacity-0"
                  )}
                >
                  <Icon icon={ChevronLeftIcon} size="sm" />
                </RoundButton>
                <div className="flex flex-col items-center gap-1.5">
                  <DialogPrimitive.Title className="text-sm font-medium tracking-tight">
                    {TITLE[step]}
                  </DialogPrimitive.Title>
                  {/* Where you are: three marks, the current one long. */}
                  <span className="flex items-center gap-1">
                    {STEPS.map((s) => (
                      <motion.span
                        key={s}
                        animate={{ width: s === step ? 14 : 5 }}
                        transition={SPRING_PILL}
                        className={cn(
                          "h-1.5 rounded-full",
                          STEPS.indexOf(s) <= STEPS.indexOf(step)
                            ? "bg-foreground"
                            : "bg-foreground/15"
                        )}
                      />
                    ))}
                  </span>
                </div>
                <DialogPrimitive.Close
                  render={
                    <RoundButton label="Close" disabled={saving}>
                      <Icon icon={XIcon} size="sm" />
                    </RoundButton>
                  }
                />
              </header>

              <AnimatePresence initial={false} mode="popLayout">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.27, ease: EASE_STEP }}
                  className="px-5 pt-4"
                >
                  {view}
                </motion.div>
              </AnimatePresence>

              <div className="px-5 pt-4 pb-5">
                <button
                  type="button"
                  disabled={!canNext}
                  onClick={next}
                  className={cn(
                    "duration-fast flex h-10 w-full items-center justify-center gap-2 rounded-full text-xs font-medium transition-[background-color,color,scale] active:scale-98",
                    canNext
                      ? "cursor-pointer bg-foreground text-background hover:opacity-90"
                      : "cursor-not-allowed bg-foreground/8 text-disabled"
                  )}
                >
                  {step === "review" ? (
                    saving ? (
                      <>
                        <Spinner size="xs" label="" className="text-current" />
                        Creating project…
                      </>
                    ) : (
                      <>
                        <Icon icon={CheckIcon} size="sm" />
                        Create project
                      </>
                    )
                  ) : (
                    <>
                      Continue
                      <Icon icon={ArrowRightIcon} size="sm" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

/* --- Steps -------------------------------------------------------------- */

function NameStep({
  draft,
  slug,
  taken,
  onChange,
  onSubmit,
}: {
  draft: Draft
  slug: string
  taken: boolean
  onChange: (patch: Partial<Draft>) => void
  onSubmit: () => void
}) {
  return (
    <div className="flex flex-col gap-4">
      <ProjectStage name={draft.name} slug={slug} />
      <Field label="Name">
        <input
          autoFocus
          value={draft.name}
          maxLength={60}
          onChange={(e) => onChange({ name: e.target.value })}
          onKeyDown={(e) => e.key === "Enter" && onSubmit()}
          placeholder="Atlas Server"
          className={INPUT}
        />
      </Field>
      <Field
        label="Slug"
        hint={
          taken ? (
            <span className="text-error">
              Another project in this organisation already uses it.
            </span>
          ) : (
            "How a desktop binds a checkout to this project. Lowercase letters, numbers and hyphens."
          )
        }
      >
        <div className={cn(INPUT, "flex items-center gap-0.5 pr-1")}>
          <span className="shrink-0 text-disabled">/</span>
          <input
            value={slug}
            maxLength={48}
            onChange={(e) =>
              onChange({
                slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
                slugTouched: true,
              })
            }
            onKeyDown={(e) => e.key === "Enter" && onSubmit()}
            placeholder="atlas-server"
            aria-label="Slug"
            aria-invalid={taken || undefined}
            className="min-w-0 flex-1 bg-transparent mono text-xs outline-none placeholder:text-disabled"
          />
        </div>
      </Field>
    </div>
  )
}

function DetailsStep({
  draft,
  repoValid,
  onChange,
  onSubmit,
}: {
  draft: Draft
  repoValid: boolean
  onChange: (patch: Partial<Draft>) => void
  onSubmit: () => void
}) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-2xs text-muted-foreground">
        Both optional, and both can change later.
      </p>
      <Field
        label="Repository URL"
        hint={
          repoValid ? (
            "A URL, and nothing more — it is what lets a teammate's desktop find this project from their checkout's origin."
          ) : (
            <span className="text-error">That does not look like a URL.</span>
          )
        }
      >
        <div className={cn(INPUT, "flex items-center gap-2")}>
          <Icon
            icon={GitBranchIcon}
            size="xs"
            className="shrink-0 text-disabled"
          />
          <input
            autoFocus
            value={draft.repoUrl}
            onChange={(e) => onChange({ repoUrl: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && onSubmit()}
            placeholder="https://github.com/acme/atlas-server"
            aria-label="Repository URL"
            className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-disabled"
          />
        </div>
      </Field>
      <button
        type="button"
        role="checkbox"
        aria-checked={draft.restricted}
        onClick={() => onChange({ restricted: !draft.restricted })}
        className="duration-fast flex cursor-pointer items-start gap-3 rounded-2xl border border-border bg-card p-3 text-left transition-colors hover:border-border-strong"
      >
        <span
          className={cn(
            "duration-fast mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-sm border transition-colors",
            draft.restricted
              ? "border-foreground bg-foreground text-background"
              : "border-border-strong text-transparent"
          )}
        >
          <Icon icon={CheckIcon} size="xs" />
        </span>
        <span className="flex flex-col gap-0.5">
          <span className="text-xs font-medium">Restrict to named members</span>
          <span className="text-2xs text-muted-foreground">
            Otherwise every member of the organisation can read it and push to
            it.
          </span>
        </span>
      </button>
    </div>
  )
}

function ReviewStep({ draft, slug }: { draft: Draft; slug: string }) {
  const hue = hueFor(`p-${slug}`)
  return (
    <div className="flex flex-col gap-3">
      {/* The card as it will land in the grid. */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center gap-2">
          <HueDot hue={hue} />
          <span className="truncate text-sm font-medium">{draft.name}</span>
          {draft.restricted && (
            <Tag hue="amber" className="ml-auto">
              Restricted
            </Tag>
          )}
        </div>
        <p className="mt-0.5 mono text-2xs text-muted-foreground">/{slug}</p>
        <p className="mt-3 flex items-baseline gap-4">
          <span className="flex items-baseline gap-1">
            <span className="text-lg leading-none figure">0</span>
            <span className="caption">sessions</span>
          </span>
          <span className="caption">Waiting for its first checkout</span>
        </p>
      </div>

      <dl className="divide-y divide-hairline rounded-2xl border border-border">
        <Row label="Repository">
          {draft.repoUrl.trim() ? (
            <span className="truncate mono">{draft.repoUrl.trim()}</span>
          ) : (
            <span className="text-disabled">None</span>
          )}
        </Row>
        <Row label="Access">
          <span className="flex items-center gap-1.5">
            <Icon icon={draft.restricted ? LockIcon : GlobeIcon} size="xs" />
            {draft.restricted ? "Named members only" : "Everyone in the org"}
          </span>
        </Row>
      </dl>
    </div>
  )
}

/* --- Illustration ------------------------------------------------------- */

/**
 * Where a project sits in Atlas: the coding agents at the top feed it —
 * their connectors draw in and carry a light down each line — into one
 * endpoint, the project's own path, which updates as you type. Below, the
 * project gathers memory and transcripts, with its logo at the heart.
 *
 * The connectors live in one SVG so the curves stay true; the badges are
 * HTML laid over it at the same x positions (as % of the 200-unit
 * viewBox), so they get real type and icons.
 */

const AGENTS: Array<{ label: string; x: number; mark: React.ReactNode }> = [
  { label: "Atlas", x: 31, mark: <AtlasMark className="size-3" /> },
  { label: "Claude", x: 77, mark: <ModelMark family="claude" /> },
  { label: "Codex", x: 124, mark: <ModelMark family="openai" /> },
  {
    label: "OpenCode",
    x: 170,
    mark: <ModelMark family="opencode" />,
  },
]

/** From each badge's foot down to the endpoint chip at (100, 44). */
const WIRES = [
  "M 31 12 v 13 q 0 5 5 5 h 59 q 5 0 5 5 v 9",
  "M 77 12 v 8 q 0 5 5 5 h 13 q 5 0 5 5 v 14",
  "M 124 12 v 8 q 0 5 -5 5 h -14 q -5 0 -5 5 v 14",
  "M 170 12 v 13 q 0 5 -5 5 h -60 q -5 0 -5 5 v 9",
]

/** Monogram ink per hue — spelled out so the classes exist. */
const HUE_TEXT: Record<LabelTone, string> = {
  grey: "text-hue-grey",
  indigo: "text-hue-indigo",
  purple: "text-hue-purple",
  cyan: "text-hue-cyan",
  green: "text-hue-green",
  amber: "text-hue-amber",
  orange: "text-hue-orange",
  red: "text-hue-red",
}

function ProjectStage({ name, slug }: { name: string; slug: string }) {
  const { org } = useOrg()
  const hue = hueFor(`p-${slug || "new"}`)
  const words = name.trim().split(/\s+/).filter(Boolean)
  const monogram = (
    words.length > 1 ? words[0][0] + words[1][0] : (words[0]?.slice(0, 2) ?? "")
  ).toUpperCase()

  return (
    <div className="relative pb-7">
      {/* Agents, and the wires from them. */}
      <div className="relative aspect-[200/44] w-full">
        <svg
          aria-hidden="true"
          viewBox="0 0 200 44"
          className="absolute inset-0 size-full overflow-visible text-border-strong"
        >
          {WIRES.map((d, i) => (
            <motion.path
              key={d}
              d={d}
              fill="none"
              stroke="currentColor"
              strokeWidth={0.5}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{
                duration: 0.9,
                delay: 0.1 + i * 0.05,
                ease: "easeOut",
              }}
            />
          ))}
          {/* A light rides each wire toward the endpoint, staggered. */}
          {WIRES.map((d, i) => (
            // Hidden until its animation begins, or it waits at the SVG's
            // origin, a stray dot in the corner.
            <circle key={`l-${d}`} r={1.1} opacity={0} className="fill-info">
              <animateMotion
                dur="2.4s"
                begin={`${1 + i * 0.6}s`}
                repeatCount="indefinite"
                path={d}
                keyPoints="0;1"
                keyTimes="0;1"
                calcMode="spline"
                keySplines="0.4 0 0.2 1"
              />
              <animate
                attributeName="opacity"
                values="0;1;1;0"
                keyTimes="0;0.1;0.85;1"
                dur="2.4s"
                begin={`${1 + i * 0.6}s`}
                repeatCount="indefinite"
              />
            </circle>
          ))}
        </svg>
        {AGENTS.map((a, i) => (
          <motion.span
            key={a.label}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...SPRING_PILL, delay: i * 0.05 }}
            style={{ left: `${(a.x / 200) * 100}%`, top: `${(7 / 44) * 100}%` }}
            className="absolute flex h-6 -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 rounded-full border border-border bg-card px-2 text-3xs font-medium whitespace-nowrap shadow-md"
          >
            <span className="flex text-foreground">{a.mark}</span>
            {a.label}
          </motion.span>
        ))}
      </div>

      {/* The project: a framed field with its endpoint on the top edge. */}
      <div className="relative">
        {/* The slab beneath, for depth. */}
        <div
          aria-hidden="true"
          className="absolute -bottom-3 left-1/2 h-16 w-3/5 -translate-x-1/2 rounded-lg bg-foreground/4"
        />
        <div className="relative z-10 h-36 overflow-hidden rounded-xl border border-foreground/15 bg-background">
          {/* A dotted field across the whole body, corner to corner. The
              rings sit ON it and are opaque, so the dots stop at their
              edges and the rings read as solid shapes laid over paper. */}
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle, var(--border-strong) 1px, transparent 1.2px)",
              backgroundSize: "10px 10px",
              backgroundPosition: "center bottom",
            }}
          />
          {/* The box is tall enough (9rem) that the largest ring's crown,
              7.5rem up, clears the endpoint chip on the top edge.
              Largest first, so each smaller ring lands on top. Each is the
              page colour underneath (to hide the dots) with its own tint
              over it, a touch stronger toward the centre. */}
          {(
            [
              ["-bottom-30", "size-60", "after:bg-foreground/2", 3],
              ["-bottom-24", "size-48", "after:bg-foreground/3", 2],
              ["-bottom-18", "size-36", "after:bg-foreground/4", 1],
              ["-bottom-12", "size-24", "after:bg-foreground/5", 0],
            ] as const
          ).map(([bottom, size, tint, i]) => (
            <motion.span
              key={i}
              aria-hidden="true"
              animate={{ scale: [1, 1.025, 1] }}
              transition={{
                duration: 2,
                delay: i * 0.25,
                repeat: Infinity,
                repeatDelay: 1,
              }}
              className={cn(
                "absolute left-1/2 -translate-x-1/2 rounded-full border-t-[1.5px] border-foreground/20 bg-background",
                "after:absolute after:inset-0 after:rounded-full",
                bottom,
                size,
                tint
              )}
            />
          ))}
          <Badge className="bottom-5 left-5" icon={BrainIcon}>
            Memory
          </Badge>
          <Badge className="top-12 right-5" icon={ScrollTextIcon}>
            Transcription
          </Badge>
        </div>

        {/* The endpoint: the project's path, where every wire lands. */}
        <span className="absolute -top-3 left-1/2 z-20 flex h-6 max-w-[80%] -translate-x-1/2 items-center gap-1.5 rounded-lg border border-border bg-card px-2 text-3xs shadow-md">
          <Icon icon={SparklesIcon} size="xs" className="shrink-0" />
          <span className="truncate mono">
            {org.slug}/
            <span className="text-foreground">{slug || "new-project"}</span>
          </span>
        </span>

        {/* The project's logo, at the heart. */}
        <span className="absolute -bottom-7 left-1/2 z-20 flex size-14 -translate-x-1/2 items-center justify-center rounded-full border-t border-border bg-card shadow-md ring-1 ring-foreground/10 ring-offset-2 ring-offset-background">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={monogram || "empty"}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={SPRING_PILL}
              className={cn("text-sm font-semibold", HUE_TEXT[hue])}
            >
              {monogram || (
                <Icon
                  icon={FolderGitIcon}
                  size="md"
                  className="text-foreground"
                />
              )}
            </motion.span>
          </AnimatePresence>
        </span>
      </div>
    </div>
  )
}

function Badge({
  icon,
  className,
  children,
}: {
  icon: LucideIcon
  className?: string
  children: React.ReactNode
}) {
  return (
    <span
      className={cn(
        "absolute z-10 flex h-6 items-center gap-1.5 rounded-full border border-border bg-card px-2.5 text-3xs font-medium",
        className
      )}
    >
      <Icon icon={icon} size="xs" />
      {children}
    </span>
  )
}

/* --- Bits --------------------------------------------------------------- */

const INPUT =
  "h-10 w-full rounded-xl border border-border bg-card px-3 text-xs outline-none transition-colors duration-fast placeholder:text-disabled focus-within:border-border-strong focus:border-border-strong"

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-2xs font-medium text-secondary-foreground">
        {label}
      </span>
      {children}
      {hint && <span className="text-3xs text-muted-foreground">{hint}</span>}
    </label>
  )
}

function Row({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-3 px-3 py-2.5 text-xs">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className="flex min-w-0 justify-end text-foreground">{children}</dd>
    </div>
  )
}

function RoundButton({
  label,
  className,
  children,
  ...props
}: React.ComponentProps<"button"> & { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        "duration-fast flex size-8 cursor-pointer items-center justify-center rounded-full bg-foreground/6 text-muted-foreground transition-[color,scale,opacity] hover:text-foreground active:scale-90 disabled:cursor-not-allowed disabled:opacity-40",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export { NewProjectDrawer }
