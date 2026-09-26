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
`apps/web/src/styles.css` with the four imports. Then add
`src/lib/theme.tsx`'s `data-theme` contract — the server app already has a
near-identical theme provider, so this is renaming `.dark`/`[data-theme]`
selectors, not writing one.

Four things will move on their own, and they are the point:

- **The surface ramp inverts.** The server app paints the rail lighter than the
  canvas. Here the rail is `#070707` behind a `#0f0f0f` canvas, measured from
  Linear, and the content reads as a lit plane in front of it.
- **An action colour appears.** `--primary` becomes indigo `#5e6ad2` rather
  than white, and `--ring` follows it. Every primary button and focus ring on
  every screen changes.
- **Root font-size 14px** (the server app inherits the browser's 16px today),
  so every existing screen gets slightly denser.
- **`--spacing: 4px`**, not `0.25rem`. At a 14px root the stock multiplier puts
  every hairline on a half-pixel boundary. See the comment in `tokens.css`.

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

## 3. Components the server app is missing

It vendors 16. This repo has 36. The gaps that matter, roughly in order of how
much they are costing today:

| Component | Why it matters |
|---|---|
| `select` | **Every choice in the app is a raw `<select>`** — the org picker, the project filter, the role picker, the facet bar. They render differently on macOS, Windows and Linux and cannot be styled into the system. |
| `icon-button` | `label` is required, so the toolbar of unlabelled glyphs becomes a type error. |
| `popover`, `command-menu` | There is no ⌘K and no lightweight floating panel. |
| `switch`, `checkbox`, `radio-group`, `slider` | No form controls beyond input and textarea. |
| `scroll-area`, `resizable` | Panes are fixed or native-scrolled. |
| `empty-state`, `callout`, `spinner`, `progress` | Each screen invents its own. |
| `breadcrumb`, `accordion`, `collapsible`, `toggle-group`, `combobox`, `kbd` | Needed by the shell below. |

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

`src/components/shell/` replaces it: `AppShell`, `Sidebar` + `SidebarSection` +
`SidebarItem`, `OrgSwitcher`, `TopBar`, `ListDetail`, `CommandMenu`, and
`SettingsShell`. The rail gives vertical space, which is what lets Inbox,
recent timelines, per-project entries and an admin group all exist without
competing.

## 6. Screens, in dependency order

1. **`/dashboard` → `/settings/*`.** Today's five `<Tabs>` become five routes
   behind `SettingsShell`. `defaultValue="org"` is not URL-backed, so a
   settings tab currently cannot be linked, bookmarked or returned to after a
   reload. Map: `org` → `/settings/organisation`, `account`, `ai`, `usage`,
   `privacy`.
2. **`/inbox`** — put it in the rail. It is a complete route that is only
   reachable from a button on `/timeline`.
3. **`/timeline`** — 747 lines. The filter bar, the board and the detail pane
   are all shell components now; the route's job shrinks to supplying rows.
4. **`/projects`** — 970 lines, becomes a card grid.
5. **`/chat`** — 967 lines, loses its bespoke grid and its own org `<select>`.
6. **`/admin`** — same shell, behind the admin nav group.

Out of scope here and unchanged: the marketing page, the auth and onboarding
routes, `/call/$callId`, `/space/$convId`, and the public `/s/$slug` and
`/j/$slug` share routes.

## 7. Bring the ratchet

Copy `tests/design-system-ratchet.test.ts`. It is the only thing that stops
the new token layer decaying back into the old one — it holds ten rules at
zero, including raw hex, stock Tailwind ramps, arbitrary type sizes and bare
z-indexes. It found eight real violations in this repo's own components on the
first run.

The escape hatch is deliberate friction: `ratchet-allow: <20+ characters of
reason>` on the line. Writing the sentence is usually what makes you notice
the token you actually wanted.
