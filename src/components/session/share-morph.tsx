"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { motion } from "motion/react"
import {
  CheckIcon,
  CodeIcon,
  FileDownIcon,
  LinkIcon,
  MailIcon,
  PaperclipIcon,
  XIcon,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { cn } from "cn"

import { MEMBERS } from "@/mock/data"
import type { SessionDetailApi } from "@/mock/sessions-api"
import { useTheme } from "@/lib/theme"
import { useMeasure } from "@/lib/use-measure"
import { SPRING_PILL } from "@/lib/motion"
import { PersonAvatar } from "@/components/patterns/person-avatar"
import { SegmentedPills } from "@/components/patterns/segmented"
import { GitHubMark, XMark } from "@/components/ui/brand-marks"
import { Icon } from "@/components/ui/icon"
import { UploadIcon } from "@/components/ui/upload-icon"
import type { UploadIconHandle } from "@/components/ui/upload-icon"

/**
 * Sharing a session, in a panel the share button grows into — the same
 * `t-morph` as the comments panel, anchored at the other corner
 * (`data-anchor="start"`), so it opens up and right out of the button.
 *
 * The top is an illustration rather than a heading: the session as a sheet
 * of paper, clipped to a stack of the drafts behind it, with the people who
 * can already read it drifting on dashed orbits around it. Hover the sheet
 * and the stack fans out. Below it, who can open the link, the places it
 * can go, and the link itself.
 *
 * Drawn in the other theme, like the comments panel, so it reads as a layer
 * over the session.
 */

type Access = "org" | "link"

const SELF = "m1"

/** Where each orbiting face sits, as % of the stage, and how it bobs. */
const ORBIT = [
  { x: 15, y: 56, d: 0 },
  { x: 16, y: 22, d: 0.6 },
  { x: 85, y: 24, d: 1.2 },
  { x: 86, y: 60, d: 1.8 },
]

const TARGETS: Array<{
  id: string
  label: string
  icon?: LucideIcon
  mark?: React.ComponentType<{ className?: string }>
}> = [
  { id: "email", label: "Email", icon: MailIcon },
  { id: "github", label: "GitHub", mark: GitHubMark },
  { id: "x", label: "X", mark: XMark },
  { id: "markdown", label: "Markdown", icon: FileDownIcon },
  { id: "embed", label: "Embed", icon: CodeIcon },
]

/** The first response, as plain lines for the sheet's body. */
function excerpt(detail: SessionDetailApi): string {
  const first = detail.entries.find((e) => e.kind === "response")
  return (first?.text ?? "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/[#*_`>[\]()-]/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

function ShareMorph({ detail }: { detail: SessionDetailApi }) {
  const s = detail.summary
  const { appearance } = useTheme()
  const inverted = appearance === "dark" ? "light" : "dark"

  const [open, setOpen] = useState(false)
  const [access, setAccess] = useState<Access>("org")
  const [copied, setCopied] = useState(false)
  const [url, setUrl] = useState("")
  const [measure, content] = useMeasure<HTMLDivElement>()
  const root = useRef<HTMLDivElement>(null)
  const icon = useRef<UploadIconHandle>(null)

  // The author first, then everyone who has commented: the people who can
  // already read this.
  const people = useMemo(() => {
    const ids = [
      s.authorId,
      ...detail.comments.filter((c) => !c.guestName).map((c) => c.authorId),
    ]
    return [...new Set(ids)]
      .map((id) => MEMBERS.find((m) => m.id === id))
      .filter((m) => m !== undefined)
      .slice(0, ORBIT.length)
  }, [s.authorId, detail.comments])
  const body = useMemo(() => excerpt(detail), [detail])

  useEffect(() => {
    if (!open) return
    const link = new URL(window.location.href)
    link.search = ""
    link.searchParams.set("session", s.id)
    setUrl(link.toString())
    function onDown(e: PointerEvent) {
      if (root.current?.contains(e.target as Node)) return
      setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("pointerdown", onDown)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("pointerdown", onDown)
      document.removeEventListener("keydown", onKey)
    }
  }, [open, s.id])

  async function copy() {
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      // Clipboard can be refused; the button still acknowledges the press.
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  return (
    <div ref={root} className="relative z-10">
      <div
        data-open={open}
        data-anchor="start"
        className={cn(
          "t-morph border border-border bg-card/80 shadow-md backdrop-blur-xl data-[open=true]:shadow-lg",
          "[--morph-open-w:min(22rem,calc(100cqw-2rem))]"
        )}
        // The open height is the content's own, measured, so the box fits it
        // exactly. The menu's padding (1rem) and the border (2px) sit
        // outside the measure.
        style={
          {
            "--morph-open-h": `min(calc(${Math.ceil(content.height)}px + 1rem + 2px), calc(100svh - 10rem))`,
          } as React.CSSProperties
        }
      >
        <div
          aria-hidden="true"
          data-theme={inverted}
          className="t-morph-surface bg-card"
        />

        <div
          data-theme={inverted}
          role="dialog"
          aria-label="Share session"
          inert={!open}
          className="t-morph-menu hide-scrollbar flex flex-col gap-3.5 overflow-y-auto p-2 text-foreground"
        >
          <div ref={measure} className="flex flex-col gap-3.5">
            <Stage
              open={open}
              title={s.title ?? "Untitled session"}
              body={body}
              people={people}
            />

            <button
              type="button"
              aria-label="Close share"
              onClick={() => setOpen(false)}
              className="duration-fast absolute top-4 right-4 flex size-7 cursor-pointer items-center justify-center rounded-full bg-foreground text-background transition-opacity hover:opacity-80"
            >
              <Icon icon={XIcon} size="sm" />
            </button>

            <div className="flex flex-col gap-3 px-2">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-secondary-foreground">
                  Who can open it
                </span>
                <SegmentedPills<Access>
                  size="sm"
                  className="bg-foreground/8 ring-foreground/15"
                  value={access}
                  onChange={setAccess}
                  options={[
                    { value: "org", label: "Atlas org" },
                    { value: "link", label: "Anyone" },
                  ]}
                />
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-xs text-secondary-foreground">
                  Share to
                </span>
                <ul className="grid grid-cols-5 gap-1">
                  {TARGETS.map((t, i) => (
                    <motion.li
                      key={t.id}
                      initial={false}
                      animate={
                        open ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }
                      }
                      transition={{
                        ...SPRING_PILL,
                        delay: open ? 0.18 + i * 0.035 : 0,
                      }}
                    >
                      <button
                        type="button"
                        className="group/target flex w-full cursor-pointer flex-col items-center gap-1.5 rounded-xl text-muted-foreground"
                      >
                        <span className="duration-fast flex size-10 items-center justify-center rounded-full border border-border bg-secondary text-foreground transition-[translate,background-color] group-hover/target:-translate-y-0.5 group-hover/target:bg-element-hover">
                          {t.mark ? (
                            <t.mark className="size-4" />
                          ) : t.icon ? (
                            <Icon icon={t.icon} size="md" />
                          ) : null}
                        </span>
                        <span className="duration-fast text-3xs transition-colors group-hover/target:text-foreground">
                          {t.label}
                        </span>
                      </button>
                    </motion.li>
                  ))}
                </ul>
              </div>

              <div className="flex h-9 items-center gap-2 rounded-full border border-border-strong bg-secondary pr-1 pl-3">
                <Icon
                  icon={LinkIcon}
                  size="sm"
                  className="shrink-0 text-muted-foreground"
                />
                <span className="min-w-0 flex-1 truncate mask-r-from-80% mono text-2xs text-secondary-foreground">
                  {url.replace(/^https?:\/\//, "")}
                </span>
                <button
                  type="button"
                  onClick={copy}
                  className="duration-fast flex h-7 shrink-0 cursor-pointer items-center gap-1.5 rounded-full bg-foreground px-3 text-2xs font-medium text-background transition-opacity hover:opacity-85"
                >
                  <Icon icon={copied ? CheckIcon : LinkIcon} size="xs" />
                  {copied ? "Copied" : "Copy link"}
                </button>
              </div>
            </div>
          </div>
        </div>

        <button
          type="button"
          aria-label="Share session"
          aria-expanded={open}
          onClick={() => setOpen(true)}
          onMouseEnter={() => icon.current?.startAnimation()}
          onMouseLeave={() => icon.current?.stopAnimation()}
          // `-left-px -bottom-px`: positioned children sit inside the box's
          // 1px border, so without this the glyph hangs off-centre.
          className="t-morph-trigger duration-fast -bottom-px -left-px flex cursor-pointer items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
        >
          <UploadIcon ref={icon} controlled />
        </button>
      </div>
    </div>
  )
}

/**
 * The illustration: dashed orbits, the session as a clipped
 * sheet in the middle and its readers on the orbits. Everything enters
 * once the panel has mostly grown, so the morph and the scene don't fight.
 */
function Stage({
  open,
  title,
  body,
  people,
}: {
  open: boolean
  title: string
  body: string
  people: Array<(typeof MEMBERS)[number]>
}) {
  return (
    <div className="relative h-48 shrink-0 overflow-hidden rounded-2xl border border-hairline bg-surface">
      <svg
        aria-hidden="true"
        viewBox="0 0 320 192"
        preserveAspectRatio="xMidYMax slice"
        className="absolute inset-0 size-full text-foreground/16"
      >
        {[70, 120, 170, 220].map((r) => (
          <circle
            key={r}
            cx="160"
            cy="220"
            r={r}
            fill="none"
            stroke="currentColor"
            strokeDasharray="3 5"
          />
        ))}
      </svg>

      {/* The sheet, clipped to two drafts that fan out on hover. */}
      <motion.div
        initial={false}
        animate={
          open
            ? { opacity: 1, y: 0, rotate: -2 }
            : { opacity: 0, y: 28, rotate: -6 }
        }
        transition={{ ...SPRING_PILL, delay: open ? 0.12 : 0 }}
        className="group/sheet absolute top-6 left-1/2 w-34 -translate-x-1/2"
      >
        <span
          aria-hidden="true"
          className="duration-base absolute inset-0 translate-x-1 rotate-3 rounded-lg border border-border bg-card transition-transform ease-out-strong group-hover/sheet:translate-x-4 group-hover/sheet:rotate-9"
        />
        <span
          aria-hidden="true"
          className="duration-base absolute inset-0 -translate-x-0.5 -rotate-2 rounded-lg border border-border bg-card transition-transform ease-out-strong group-hover/sheet:-translate-x-3 group-hover/sheet:-rotate-7"
        />
        <div className="relative h-34 overflow-hidden rounded-lg border border-border bg-card px-3 pt-4 shadow-md">
          <p className="line-clamp-3 text-2xs leading-snug font-medium">
            {title}
          </p>
          <p className="mt-1.5 h-16 overflow-hidden mask-b-from-15% text-4xs leading-relaxed text-muted-foreground">
            {body}
          </p>
        </div>
        <Icon
          icon={PaperclipIcon}
          size="lg"
          className="duration-base absolute -top-2.5 left-2 -rotate-12 text-muted-foreground transition-transform ease-out-strong group-hover/sheet:-translate-y-0.5 group-hover/sheet:-rotate-20"
        />
      </motion.div>

      {people.map((p, i) => {
        const o = ORBIT[i]
        return (
          <motion.div
            key={p.id}
            initial={false}
            animate={
              open ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.4 }
            }
            transition={{ ...SPRING_PILL, delay: open ? 0.2 + i * 0.06 : 0 }}
            style={{ left: `${o.x}%`, top: `${o.y}%` }}
            className="absolute -translate-1/2"
          >
            <motion.div
              animate={open ? { y: [0, -4, 0] } : { y: 0 }}
              transition={{
                duration: 3.2,
                delay: o.d,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="rounded-full ring-2 ring-surface"
            >
              <PersonAvatar
                size="sm"
                name={p.name || p.email}
                email={p.email}
                image={p.image}
              />
            </motion.div>
            {p.id === SELF && (
              <span className="absolute top-full left-1/2 mt-1 -translate-x-1/2 rounded-full bg-foreground px-1.5 text-4xs font-medium text-background">
                You
              </span>
            )}
          </motion.div>
        )
      })}
    </div>
  )
}

export { ShareMorph }
