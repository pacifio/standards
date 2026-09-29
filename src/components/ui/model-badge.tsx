import { cn } from "cn"

/**
 * A model, as a pill with its family's mark: the orange Claude spark, the
 * Gemini star, the OpenAI knot. The marks are LobeHub's model icons (MIT),
 * vendored under `public/logos/models/`.
 *
 * Claude and Gemini are drawn in their brand colours — like the logo strip
 * on the sign-in page, a third-party mark keeps its own colour. OpenAI's
 * mark is monochrome, so it is a mask over `bg-current` and follows the
 * theme's ink instead of vanishing on the dark canvas.
 */

type Family = "claude" | "openai" | "gemini"

function familyOf(model: string): Family | null {
  const m = model.toLowerCase()
  if (m.includes("claude") || m.includes("opus") || m.includes("sonnet"))
    return "claude"
  if (m.startsWith("gpt") || m.includes("codex") || /^o\d/.test(m))
    return "openai"
  if (m.includes("gemini")) return "gemini"
  return null
}

function ModelMark({
  family,
  className,
}: {
  family: Family
  className?: string
}) {
  if (family === "openai") {
    return (
      <span
        aria-hidden="true"
        className={cn(
          "inline-block size-3 shrink-0 bg-current",
          "mask-[url(/logos/models/openai.svg)] mask-contain mask-center mask-no-repeat",
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

export { ModelBadge, ModelMark, familyOf }
