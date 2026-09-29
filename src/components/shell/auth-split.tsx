import { cn } from "cn"

import { DashedRails } from "@/components/blocks/dashed-rails"
import { Globe } from "@/components/blocks/globe"
import { PlusCorners } from "@/components/blocks/plus-decorator"

/**
 * The two-pane authentication layout.
 *
 * Left is the form and nothing else: a single measured column, vertically
 * centred, with a way back at the top. The column is deliberately narrow —
 * an auth form is two buttons and a sentence, and letting it run to 600px
 * makes it look like there is more to fill in than there is.
 *
 * There is no mark above the form and no footer below it. Both were tried
 * and both were noise: a badge floating over an empty half-screen, and a
 * copyright line on a page nobody reads for legal information. The page is
 * two buttons; everything that is not those two buttons is competition.
 *
 * Right is atmosphere and proof: a draggable globe parked off the top-right
 * corner on the bare pane, one line of copy and the logo cloud anchored to
 * the bottom. There is no image behind it — the pane is the surface, and
 * the globe is the only thing moving on the page. It collapses
 * entirely below `lg` — on a phone it would be a screenful of texture
 * between the user and the button they came to press.
 *
 * The pane is `bg-sidebar` rather than `bg-background` so the two halves read
 * as the rail/canvas pair the rest of the app is built from, rather than as
 * two unrelated surfaces that happen to sit side by side.
 */

function AuthSplit({
  children,
  back,
  aside,
  proof,
}: {
  children: React.ReactNode
  /** The escape hatch, top-left of the form column. */
  back?: React.ReactNode
  /** Atmosphere copy, bottom of the aside. */
  aside: React.ReactNode
  /** Social proof, below the copy. */
  proof?: React.ReactNode
}) {
  return (
    <div className="flex h-svh overflow-hidden bg-background">
      <div className="relative flex min-w-0 flex-1 flex-col px-6 py-8">
        <DashedRails fade />
        <div className="flex h-8 shrink-0 items-center">{back}</div>

        <div className="flex w-full flex-1 items-center justify-center">
          {/* The form sits in a dashed drafting box with cross-hair corners:
              natai's bento frame, at sign-in scale. */}
          <div className="relative flex w-full max-w-88 flex-col gap-6 border border-dashed border-foreground/10 px-8 py-10">
            <PlusCorners />
            {children}
          </div>
        </div>

        {/* Balances the back-link strip so the form sits on the true optical
            centre rather than 16px below it. */}
        <div aria-hidden="true" className="h-8 shrink-0" />
      </div>

      <aside className="relative hidden w-1/2 shrink-0 overflow-hidden border-l border-hairline bg-surface lg:block">
        {/* Oversized and offset past the corner, so only the northern
            hemisphere shows and it reads as a horizon, not an object. */}
        <Globe className="absolute -top-[28%] -right-[30%] w-[120%]" />

        {/* Click-through, so the globe stays draggable everywhere but the
            copy and the logos. */}
        <div className="pointer-events-none absolute inset-0 flex flex-col justify-end p-10">
          <div className="pointer-events-auto flex flex-col gap-8">
            <div className="flex flex-col gap-2">{aside}</div>
            {proof}
          </div>
        </div>
      </aside>
    </div>
  )
}

/** One line of atmosphere copy, sized to sit under the field. */
function AuthAsideCopy({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      className={cn(
        "max-w-md text-xl font-semibold tracking-tight text-balance",
        className
      )}
      {...props}
    />
  )
}

function AuthAsideNote({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      className={cn("max-w-sm text-xs text-secondary-foreground", className)}
      {...props}
    />
  )
}

export { AuthAsideCopy, AuthAsideNote, AuthSplit }
