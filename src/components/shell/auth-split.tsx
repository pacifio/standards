import { cn } from "cn"

import { DitherField } from "@/components/ui/dither-field"

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
 * Right is atmosphere and proof: the dither field from the landing site, one
 * line of copy and the logo cloud, all anchored to the bottom. It collapses
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
      <div className="flex min-w-0 flex-1 flex-col px-6 py-8">
        <div className="flex h-8 shrink-0 items-center">{back}</div>

        <div className="flex w-full flex-1 items-center justify-center">
          <div className="flex w-full max-w-72 flex-col gap-6">{children}</div>
        </div>

        {/* Balances the back-link strip so the form sits on the true optical
            centre rather than 16px below it. */}
        <div aria-hidden="true" className="h-8 shrink-0" />
      </div>

      <aside className="relative hidden w-1/2 shrink-0 overflow-hidden border-l border-border bg-sidebar lg:block">
        {/*
          A tall, narrow pane has a long half-diagonal, so the default hollow
          — tuned for the landing site's wide hero — pushes almost everything
          off the edges. Pulling the start in and narrowing the ramp restores
          the density the reference has.

          The fade keeps the bottom clear: the hollow quiets the MIDDLE, which
          is exactly where the content is not.
        */}
        <DitherField
          mode="glyphs"
          hollow={[0.12, 0.42]}
          className="field-fade-b"
        />

        <div className="absolute inset-0 flex flex-col justify-end p-10">
          <div className="flex flex-col gap-16">
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
