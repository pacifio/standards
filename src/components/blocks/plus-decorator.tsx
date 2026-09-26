import { cn } from "cn"

/**
 * A corner cross-hair. natai's `PlusDecorator`, from the bento grid.
 *
 * Eight lines and no dependencies, and it is what makes a bordered panel
 * read as a technical drawing rather than a card. Place one at each corner
 * of a container; the `corner` prop nudges it onto the border by half a
 * pixel so the crossing sits exactly on the line.
 */
function PlusDecorator({
  corner = "tl",
  className,
}: {
  corner?: "tl" | "tr" | "bl" | "br"
  className?: string
}) {
  return (
    <div
      aria-hidden="true"
      data-slot="plus-decorator"
      className={cn(
        "pointer-events-none absolute size-3 mask-radial-from-15%",
        "before:absolute before:inset-0 before:m-auto before:h-px before:bg-foreground/25",
        "after:absolute after:inset-0 after:m-auto after:w-px after:bg-foreground/25",
        corner === "tl" &&
          "top-0 left-0 -translate-x-[calc(50%-0.5px)] -translate-y-[calc(50%-0.5px)]",
        corner === "tr" &&
          "top-0 right-0 translate-x-[calc(50%-0.5px)] -translate-y-[calc(50%-0.5px)]",
        corner === "bl" &&
          "bottom-0 left-0 -translate-x-[calc(50%-0.5px)] translate-y-[calc(50%-0.5px)]",
        corner === "br" &&
          "right-0 bottom-0 translate-x-[calc(50%-0.5px)] translate-y-[calc(50%-0.5px)]",
        className
      )}
    />
  )
}

/** All four corners at once. The parent must be `relative`. */
function PlusCorners({ className }: { className?: string }) {
  return (
    <>
      <PlusDecorator corner="tl" className={className} />
      <PlusDecorator corner="tr" className={className} />
      <PlusDecorator corner="bl" className={className} />
      <PlusDecorator corner="br" className={className} />
    </>
  )
}

export { PlusCorners, PlusDecorator }
