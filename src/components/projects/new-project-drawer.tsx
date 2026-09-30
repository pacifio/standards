"use client"

import { useEffect, useMemo, useState } from "react"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { AnimatePresence, motion } from "motion/react"
import {
  ArrowRightIcon,
  CheckIcon,
  ChevronLeftIcon,
  FolderGitIcon,
  GitBranchIcon,
  GlobeIcon,
  LockIcon,
  XIcon,
} from "lucide-react"
import { cn } from "cn"

import { MEMBERS } from "@/mock/data"
import type { Project } from "@/mock/types"
import { hueFor } from "@/lib/hue"
import { SPRING_PILL } from "@/lib/motion"
import { useMeasure } from "@/lib/use-measure"
import { PersonAvatar } from "@/components/patterns/person-avatar"
import { Icon } from "@/components/ui/icon"
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
 * The project, assembling as you name it: a folder card at the centre of
 * dashed orbits takes the name, the slug and the project's own hue (from
 * the same `hueFor` that colours it everywhere else), and the teammates who
 * will see it wait on the orbits.
 */
function ProjectStage({ name, slug }: { name: string; slug: string }) {
  const hue = hueFor(`p-${slug || "new"}`)
  const faces = useMemo(
    () => MEMBERS.filter((m) => m.status === "active" && m.image).slice(0, 4),
    []
  )
  const SPOTS = [
    { x: 14, y: 30 },
    { x: 20, y: 76 },
    { x: 84, y: 26 },
    { x: 86, y: 72 },
  ]
  return (
    <div className="relative h-40 overflow-hidden rounded-2xl border border-hairline bg-surface">
      <svg
        aria-hidden="true"
        viewBox="0 0 320 160"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 size-full text-foreground/16"
      >
        {[46, 86, 126, 166].map((r) => (
          <circle
            key={r}
            cx="160"
            cy="80"
            r={r}
            fill="none"
            stroke="currentColor"
            strokeDasharray="3 5"
          />
        ))}
      </svg>

      {faces.map((m, i) => (
        <motion.span
          key={m.id}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1, y: [0, -3, 0] }}
          transition={{
            opacity: { delay: 0.1 + i * 0.06 },
            scale: { ...SPRING_PILL, delay: 0.1 + i * 0.06 },
            y: { duration: 3.2, delay: i * 0.5, repeat: Infinity },
          }}
          style={{ left: `${SPOTS[i].x}%`, top: `${SPOTS[i].y}%` }}
          className="absolute -translate-1/2 rounded-full ring-2 ring-surface"
        >
          <PersonAvatar
            size="xs"
            name={m.name}
            email={m.email}
            image={m.image}
          />
        </motion.span>
      ))}

      {/* The card: a folder tab, then the project as it is being named. */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING_PILL, delay: 0.05 }}
        className="absolute top-1/2 left-1/2 w-44 -translate-1/2"
      >
        <span className="ml-3 block h-2 w-12 rounded-t-md border border-b-0 border-border bg-card" />
        <div className="rounded-xl rounded-tl-none border border-border bg-card px-3 py-2.5 shadow-md">
          <div className="flex items-center gap-1.5">
            <motion.span
              key={hue}
              initial={{ scale: 0.4 }}
              animate={{ scale: 1 }}
              transition={SPRING_PILL}
              className="flex"
            >
              <HueDot hue={hue} />
            </motion.span>
            <span
              className={cn(
                "truncate text-xs font-medium",
                !name.trim() && "text-disabled"
              )}
            >
              {name.trim() || "Untitled project"}
            </span>
          </div>
          <p className="mt-0.5 truncate mono text-3xs text-muted-foreground">
            /{slug || "…"}
          </p>
          <div className="mt-2 flex items-center gap-1 text-3xs text-disabled">
            <Icon icon={FolderGitIcon} size="xs" />0 sessions
          </div>
        </div>
      </motion.div>
    </div>
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
