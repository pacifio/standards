import { Link, createFileRoute } from "@tanstack/react-router"
import { cn } from "cn"
import { ChevronLeftIcon } from "lucide-react"

import {
  AuthAsideCopy,
  AuthAsideNote,
  AuthSplit,
} from "@/components/shell/auth-split"
import { GitHubMark, GoogleMark } from "@/components/ui/brand-marks"
import { buttonVariants } from "@/components/ui/button"
import { LogoMarquee } from "@/components/ui/logo-marquee"

export const Route = createFileRoute("/mock/login")({ component: LoginScreen })

/**
 * Sign in.
 *
 * Two providers, and that is the whole screen. Atlas supports Google and
 * GitHub, so there is no email field, no password, no divider and no "show
 * other options" — every one of those in the reference exists to manage a
 * longer list than we have. A sign-in page with two buttons should look like
 * a page with two buttons.
 *
 * The providers are `secondary`, not `default`: neither is the recommended
 * one, and making one of them the single loud element would be a
 * recommendation. They are the same weight because the choice is the user's
 * and it is already made before they arrive.
 */
function LoginScreen() {
  return (
    <AuthSplit
      back={
        <a
          href="/"
          className={buttonVariants({ variant: "ghost", size: "sm" })}
        >
          <ChevronLeftIcon />
          Back to homepage
        </a>
      }
      aside={
        <>
          <AuthAsideCopy>Source control for agents.</AuthAsideCopy>
          <AuthAsideNote>
            Use multiple coding agents, track their changes and query them in
            one place.
          </AuthAsideNote>
        </>
      }
      proof={<LogoMarquee />}
    >
      <div className="flex flex-col gap-1.5 text-center">
        <h1 className="text-lg font-semibold tracking-tight">
          Sign in to Atlas
        </h1>
        <p className="text-xs text-balance text-secondary-foreground">
          Continue with the account your code already lives in.
        </p>
      </div>

      {/*
        Both providers land on the Inbox. In the real app these kick off an
        OAuth redirect and come back to wherever the user was headed; in the
        mock they are plain links, which also makes the happy path clickable
        end to end when someone is walking the flow.

        Links styled with `buttonVariants`, not `<Button render={<Link/>}>`:
        Base UI stamps `role="button"` on a rendered anchor, which would have
        these announce as buttons while actually navigating. See button.tsx.
      */}
      <div className="flex flex-col gap-2">
        <Link
          to="/mock/inbox"
          className={cn(
            buttonVariants({ variant: "secondary", size: "xl" }),
            "w-full"
          )}
        >
          <GoogleMark />
          Continue with Google
        </Link>
        <Link
          to="/mock/inbox"
          className={cn(
            buttonVariants({ variant: "secondary", size: "xl" }),
            "w-full"
          )}
        >
          <GitHubMark />
          Continue with GitHub
        </Link>
      </div>

      <p className="text-center text-2xs text-balance text-muted-foreground">
        By continuing you agree to the{" "}
        <a
          href="#"
          className="text-secondary-foreground underline-offset-2 hover:underline"
        >
          Terms
        </a>{" "}
        and{" "}
        <a
          href="#"
          className="text-secondary-foreground underline-offset-2 hover:underline"
        >
          Privacy Policy
        </a>
        .
      </p>

      <div className="flex items-center justify-center gap-1 text-2xs">
        <span className="text-muted-foreground">
          Signing in from the desktop app?
        </span>
        <Link
          to="/mock/inbox"
          className="font-medium text-foreground underline-offset-2 hover:underline"
        >
          Use a device code
        </Link>
      </div>
    </AuthSplit>
  )
}
