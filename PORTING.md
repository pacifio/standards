# Porting Standards into the Atlas web app

This repo is the design system and a high-fidelity mock. Nothing here is wired
to an API. This is what it takes to move it into
`~/Desktop/server/apps/web`, in the order that keeps the app shippable at every
step.

Both repos are TanStack Start + TanStack Router + Vite + Tailwind v4 and React
19, so none of this is a framework migration. The one genuine incompatibility
is the primitive engine — see step 2.

---

## 1. The token layer — swap `styles.css`, change nothing else

Copy `src/styles/{tokens,themes,utilities,globals}.css` and replace the body of
`apps/web/src/styles.css` with the four imports plus the two `@fontsource-
variable` imports (Geist, Geist Mono). Then add `src/lib/theme.tsx`'s
`data-theme` contract and `src/lib/ui-scale.tsx` — both are providers plus an
inline init script in `__root.tsx` so there is no flash of the wrong theme or
scale.

Four things will move on their own, and they are the point:

- **Everything goes achromatic.** Every colour becomes OKLCH with zero chroma
  except the four status inks and the eight identity hues. The server app's
  blue accent disappears; `--primary` becomes the foreground inverted and
  `--ring` the foreground at 40%. Every primary button and focus ring on every
  screen changes.
- **The surface ramp becomes monotonic.** Page `0.08` → surface `0.10` → card
  `0.12` → popover `0.17` in dark. The sidebar sits one step *below* the page
  and every raised block one step above it, ringed rather than shadowed.
- **Root font-size becomes `calc(16px * var(--ui-scale))`** and the body
  default becomes 12px. Every existing screen gets denser; the scale control
  is what gives it back to people who want it.
- **`--spacing` is Tailwind's `0.25rem`** again — the earlier 4px pin only
  existed to fight a 14px root. At scale 1 every value is an integer.

Expect a visual diff on every screen. That is the migration, not a regression.

**Do not** keep the old `--bg-*`/`--text-*` alias block alongside the new
roles. Two names for one pixel is what the token layer exists to end.

## 2. Primitives — Base UI here, Radix there

`standards` is on `@base-ui/react`, matching the Atlas desktop app, which
deliberately removed all five `@radix-ui/*` packages. `apps/web` is on Radix.

Two options, and the second is almost certainly right:

- **Port component-by-component**, rewriting each file's primitive import and
  its prop surface (`render` instead of `asChild`, `data-*` state attributes
  instead of `data-state`). Roughly a day per ten components.
- **Move `apps/web` to Base UI wholesale**, using this repo's 36 components as
  the replacement set. The server app only vendors 16 shadcn files and imports
  Radix in none of its feature code directly, so the blast radius is those 16
  files plus their call sites. This also ends the split with the desktop app.

Either way the class strings, the tokens and the patterns port unchanged —
they are where the design lives.

Two Base UI rules worth knowing before the first file: a `<Button
render={<Link/>}>` gets `role="button"` stamped on the anchor, so navigation
styled as a button is `<Link className={buttonVariants(...)}>`; and a
`PopoverTrigger`/`DropdownMenuTrigger` must `render` the button itself, not a
wrapper around one, or Base UI warns about a non-native button.

## 3. Components the server app is missing

It vendors 16. This repo has 36 primitives, five patterns and ten blocks. The
gaps that matter, roughly in order of how much they are costing today:

| Component | Why it matters |
|---|---|
| `select` | **Every choice in the app is a raw `<select>`** — the org picker, the project filter, the role picker, the facet bar. They render differently on macOS, Windows and Linux and cannot be styled into the system. |
| `patterns/data-table`, `kpi-strip`, `segmented` | The timeline board, admin, usage and members are all the same three shapes. Today each screen hand-rolls its own table and its own filter row. |
| `patterns/panel` | The ringed, staggered card that every dashboard surface is made of. |
| `ui/tag` + `lib/hue.ts` | Labels, projects and roles get a stable identity hue via `hueFor(id)` instead of ad-hoc badge variants. |
| `icon-button` | `label` is required, so the toolbar of unlabelled glyphs becomes a type error. |
| `popover`, `command-menu` | There is no ⌘K and no lightweight floating panel. |
| `scroll-fade` | Scrollbars are hidden system-wide; this is what tells you a region scrolls. |
| `switch`, `checkbox`, `radio-group`, `slider` | No form controls beyond input and textarea. |
| `resizable` | Panes are fixed or native-scrolled. |
| `empty-state`, `callout`, `spinner`, `progress` | Each screen invents its own. |
| `blocks/*` | `SessionPipeline` and `SessionTimeline` are the session view; `RevealWaveImage` is the login aside (client-only — it pulls `three`, so keep it behind `ClientOnly` + `React.lazy` as here). |

## 4. One org context, replacing four

This is the largest structural change and the one with the clearest payoff.

`apps/web` resolves the active organisation four different ways:

| Where | How |
|---|---|
| `/timeline`, `/projects`, `/inbox` | URL search param `org`, validated per route |
| `/chat` | component state plus its own `<select>` in the page header |
| `/dashboard` → `OrgPanel` | better-auth `orgSetActive()` (`org-panel.tsx:391`) |
| `/call/$callId`, `/space/$convId` | URL param again, validated differently |

So switching org on one screen does not switch it on the next, every page
independently runs `orgList()` then `orgFull()`, and there is nowhere to put a
global switcher — which is why the current org picker is buried in a settings
tab.

Replace all four with `src/lib/org-context.tsx`. Keep the active org **in the
URL** in the real app (this mock holds it in state because the mock routes are
flat) so deep links and reloads land in the right workspace. `<OrgSwitcher>`
becomes its only writer. The existing API surface in `apps/web/src/lib/api.ts`
(`orgList`, `orgFull`, `orgSetActive`, …) does not change — only who calls it.

## 5. The shell — `AppShell` replaces `DashboardShell`

`apps/web/src/components/dashboard/dashboard-shell.tsx` is a 56px top bar with
four links. `/inbox` and `/admin` are not in it, and it is `hidden sm:flex`, so
below 640px the signed-in app has no navigation at all.

`src/components/shell/` replaces it: `AppShell` (sidebar · topbar + main ·
optional `dock`), `Sidebar` + `SidebarGroup` + `SidebarItem` (with nested
children on an animated rail), `OrgSwitcher`, `TopBar` + `TopBarCluster`,
`CommandMenu`, `UiScaleControl` and `SettingsShell`. The `dock` prop is how a
screen shows a selected record beside the page — the timeline uses it for the
session view — without a second layout system.

## 6. Screens, in dependency order

1. **`/dashboard` → `/settings/*`.** Today's five `<Tabs>` become five routes
   behind `SettingsShell`. `defaultValue="org"` is not URL-backed, so a
   settings tab currently cannot be linked, bookmarked or returned to after a
   reload. Map: `org` → `/settings/organisation`, `account`, `ai`, `usage`,
   `privacy`. Members and usage become `DataTable`s.
2. **`/inbox`** — put it in the rail. It is a complete route that is only
   reachable from a button on `/timeline`. Two resizable panes.
3. **`/timeline`** — 747 lines. Becomes `PageHeader` → `KpiStrip` →
   `DataTable` of sessions, with the selected session in the shell dock; the
   route's job shrinks to supplying rows and the `?view` filter.
4. **`/projects`** — 970 lines, becomes a grid of `Panel`s with `hueFor`.
5. **`/chat`** — 967 lines, loses its bespoke grid and its own org `<select>`.
6. **`/admin`** — `UnderlineTabs` + `DataTable`, behind the admin nav group.

Out of scope here and unchanged: the marketing page, the auth and onboarding
routes, `/call/$callId`, `/space/$convId`, and the public `/s/$slug` and
`/j/$slug` share routes.

## 7. Bring the ratchet

Copy `tests/design-system-ratchet.test.ts`. It is the only thing that stops
the new token layer decaying back into the old one — it holds thirteen rules
at zero, including raw hex, OKLCH and `color-mix` literals outside the token
layer, raised shadows, `[var(--…)]` escapes, stock Tailwind ramps, arbitrary
type sizes and bare z-indexes.

The escape hatch is deliberate friction: `ratchet-allow: <20+ characters of
reason>` on the line. Writing the sentence is usually what makes you notice
the token you actually wanted.

## 8. Vite

Set `server: { forwardConsole: false }` if the TanStack devtools plugin is
installed. Vite 8 forwards the browser console to the terminal and devtools
forwards the terminal back to the browser; one warning from `three` then
echoes forever and floods the page.
