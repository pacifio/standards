import { useEffect, useState } from "react"
import { Link, createFileRoute } from "@tanstack/react-router"
import {
  DownloadIcon,
  LayersIcon,
  LockIcon,
  LogInIcon,
  LogOutIcon,
  MoonIcon,
  SunIcon,
  UserIcon,
} from "lucide-react"

import { cn } from "cn"

import { CURRENT_USER, MEMBERS } from "@/mock/data"
import { publicShare, sessionDetail } from "@/mock/sessions-api"
import { useTheme } from "@/lib/theme"
import type { Appearance } from "@/lib/theme"
import { PersonAvatar } from "@/components/patterns/person-avatar"
import { SessionReader } from "@/components/session/session-reader"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EmptyState } from "@/components/ui/empty-state"
import { Icon } from "@/components/ui/icon"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type PublicSearch = {
  /** Mock sign-in state: `?auth=1` reads the page as the signed-in member. */
  auth?: boolean
}

export const Route = createFileRoute("/mock/s/$sessionId")({
  component: PublicSession,
  validateSearch: (search: Record<string, unknown>): PublicSearch =>
    search.auth === 1 || search.auth === "1" || search.auth === true
      ? { auth: true }
      : {},
})

/**
 * A session on its own page — the link a share hands out.
 *
 * No chrome at all: someone opening this may not be in the org, or signed
 * in, so there is nothing to navigate to. The session reads in a column
 * between dashed rails; a ruler in the left gutter says how far through it
 * you are; one floating button in the top corner is the only way in or out
 * — your face when you are signed in, a person glyph when you are not — and
 * its twin in the bottom corner flips this page's theme, and only this
 * page's.
 *
 * Signed in, you read and comment as yourself. Signed out you are a guest:
 * if the link allows guest comments you post under a name you give once,
 * otherwise the threads are read-only.
 */
function PublicSession() {
  const { sessionId } = Route.useParams()
  const { auth } = Route.useSearch()
  const detail = sessionDetail(sessionId)
  const share = publicShare(sessionId)
  const readable = !!detail && (share.public || !!auth)
  const [theme, toggleTheme] = usePageTheme()

  return (
    <div
      data-theme={theme}
      className="relative flex h-dvh flex-col bg-background text-foreground"
    >
      <AccountButton signedIn={!!auth} sessionId={sessionId} />
      <ThemeButton theme={theme} onToggle={toggleTheme} />

      {readable ? (
        <SessionReader
          detail={detail}
          variant="page"
          viewer={
            auth
              ? { kind: "member", id: "m1" }
              : { kind: "guest", canComment: share.guestComments }
          }
        />
      ) : (
        <EmptyState
          icon={LockIcon}
          title={detail ? "This session is private" : "Session not found"}
          description={
            detail
              ? "Its owner has not made it public. Sign in with an account in their organisation to read it."
              : "The link may be mistyped, or the session was deleted."
          }
          className="flex-1"
        />
      )}
    </div>
  )
}

const PAGE_THEME_KEY = "atlas-public-theme"

/**
 * This page's own light/dark, kept apart from the app's setting: whoever
 * opens a shared link reads it the way THEY like, and changing it here
 * changes nothing in the app. Until they choose, it follows the app's
 * current appearance.
 *
 * The page's root carries `data-theme`, but menus and tooltips portal to
 * <body>, outside it — so while the page is open it also owns <html>'s
 * attribute, holding it against the app's provider (which writes there on
 * its own schedule), and hands it back on the way out.
 */
function usePageTheme(): [Appearance, () => void] {
  const { appearance } = useTheme()
  const [chosen, setChosen] = useState<Appearance | null>(null)
  const theme = chosen ?? appearance

  useEffect(() => {
    try {
      const saved = localStorage.getItem(PAGE_THEME_KEY)
      if (saved === "light" || saved === "dark") setChosen(saved)
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    const html = document.documentElement
    const hold = () => {
      if (html.getAttribute("data-theme") !== theme) {
        html.setAttribute("data-theme", theme)
      }
    }
    hold()
    const watch = new MutationObserver(hold)
    watch.observe(html, { attributes: true, attributeFilter: ["data-theme"] })
    return () => {
      watch.disconnect()
      html.setAttribute("data-theme", appearance)
    }
  }, [theme, appearance])

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark"
    setChosen(next)
    try {
      localStorage.setItem(PAGE_THEME_KEY, next)
    } catch {
      // ignore
    }
  }
  return [theme, toggle]
}

/** Bottom-left, the twin of the account button in the top-right. */
function ThemeButton({
  theme,
  onToggle,
}: {
  theme: Appearance
  onToggle: () => void
}) {
  const label = `Switch to ${theme === "dark" ? "light" : "dark"} theme`
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            type="button"
            aria-label={label}
            onClick={onToggle}
            className={cn(FLOATING, "absolute bottom-4 left-4")}
          >
            <Icon icon={theme === "dark" ? SunIcon : MoonIcon} size="md" />
          </button>
        }
      />
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  )
}

/** The floating round buttons' shared material. */
const FLOATING =
  "duration-fast z-10 flex size-9 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-border bg-card/80 text-muted-foreground shadow-md backdrop-blur-xl transition-colors hover:text-foreground data-popup-open:text-foreground"

/**
 * The corner button. Signed in: your avatar, opening a menu with the way
 * back into the app and out. Signed out: a person glyph, offering sign-in
 * and the app.
 */
function AccountButton({
  signedIn,
  sessionId,
}: {
  signedIn: boolean
  sessionId: string
}) {
  const me = MEMBERS.find((m) => m.email === CURRENT_USER.email)
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={signedIn ? `Account — ${CURRENT_USER.name}` : "Sign in"}
        className={cn(FLOATING, "absolute top-4 right-4")}
      >
        {signedIn ? (
          <PersonAvatar
            name={CURRENT_USER.name}
            email={CURRENT_USER.email}
            image={me?.image}
            className="size-full"
          />
        ) : (
          <Icon icon={UserIcon} size="md" />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={6} className="w-56">
        {signedIn ? (
          <>
            {/* Who you are — a plain block, not a menu label, which
                would need a group around it. */}
            <div className="px-2 py-1.5">
              <span className="block truncate text-xs font-medium">
                {CURRENT_USER.name}
              </span>
              <span className="block truncate text-3xs text-muted-foreground">
                {CURRENT_USER.email}
              </span>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              render={
                <Link
                  to="/mock/timeline"
                  search={{ view: "all", session: sessionId }}
                />
              }
            >
              <Icon icon={LayersIcon} size="sm" />
              Open in Atlas
            </DropdownMenuItem>
            <DropdownMenuItem
              render={<Link to="/mock/s/$sessionId" params={{ sessionId }} />}
            >
              <Icon icon={LogOutIcon} size="sm" />
              Sign out
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem render={<Link to="/mock/login" />}>
              <Icon icon={LogInIcon} size="sm" />
              Sign in
            </DropdownMenuItem>
            <DropdownMenuItem
              render={
                <a
                  href="https://tryatlas.cc"
                  target="_blank"
                  rel="noreferrer"
                />
              }
            >
              <Icon icon={DownloadIcon} size="sm" />
              Get Atlas
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
