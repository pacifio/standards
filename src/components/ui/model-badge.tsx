import { cn } from "cn"

/**
 * A model, as a pill with its family's mark: the orange Claude spark, the
 * Gemini star, the OpenAI knot, the Cursor cube. The marks are
 * vendored under `public/logos/models/` (licence: THIRD_PARTY_NOTICES.md).
 *
 * Claude and Gemini are drawn in their brand colours — like the logo strip
 * on the sign-in page, a third-party mark keeps its own colour. OpenAI's
 * mark is monochrome, so it is a mask over `bg-current` and follows the
 * theme's ink instead of vanishing on the dark canvas.
 */

type Family = "claude" | "openai" | "gemini" | "cursor"

function familyOf(model: string): Family | null {
  const m = model.toLowerCase()
  if (m.includes("claude") || m.includes("opus") || m.includes("sonnet"))
    return "claude"
  if (m.startsWith("gpt") || m.includes("codex") || /^o\d/.test(m))
    return "openai"
  if (m.includes("gemini")) return "gemini"
  return null
}

/** The mark for a coding agent: Claude Code, Codex, Gemini CLI, Cursor. */
function agentFamily(agent: string): Family | null {
  const a = agent.toLowerCase()
  if (a.includes("claude")) return "claude"
  if (a.includes("codex") || a.includes("openai")) return "openai"
  if (a.includes("gemini")) return "gemini"
  if (a.includes("cursor")) return "cursor"
  return null
}

/** Monochrome marks, drawn as a mask so they take the theme's ink. */
const MONO: Partial<Record<Family, string>> = {
  openai: "mask-[url(/logos/models/openai.svg)]",
  cursor: "mask-[url(/logos/models/cursor.svg)]",
}

function ModelMark({
  family,
  className,
}: {
  family: Family
  className?: string
}) {
  const mono = MONO[family]
  if (mono) {
    return (
      <span
        aria-hidden="true"
        className={cn(
          "inline-block size-3 shrink-0 bg-current",
          mono,
          "mask-contain mask-center mask-no-repeat",
          className
        )}
      />
    )
  }
  return (
    <img
      src={`/logos/models/${family}.svg`}
      alt=""
      aria-hidden="true"
      className={cn("size-3 shrink-0", className)}
    />
  )
}

function ModelBadge({
  model,
  className,
}: {
  model: string
  className?: string
}) {
  const family = familyOf(model)
  return (
    <span
      data-slot="model-badge"
      className={cn(
        "inline-flex h-5.5 max-w-full items-center gap-1.5 rounded-full border border-border bg-card px-2 text-secondary-foreground",
        className
      )}
    >
      {family && <ModelMark family={family} />}
      <span className="truncate mono text-2xs">{model}</span>
    </span>
  )
}

export { ModelBadge, ModelMark, agentFamily, familyOf }
