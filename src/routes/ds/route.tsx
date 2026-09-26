import { Link, Outlet, createFileRoute } from "@tanstack/react-router"

import { ThemeToggle } from "@/components/shell/app-shell"
import { RailLink } from "@/components/shell/settings-shell"
import { UiScaleControl } from "@/components/shell/ui-scale"
import { ScrollFade } from "@/components/ui/scroll-fade"
import { TooltipProvider } from "@/components/ui/tooltip"

export const Route = createFileRoute("/ds")({ component: GalleryLayout })

const NAV = [
  {
    group: "Foundations",
    items: [
      { label: "Colour", to: "/ds/foundations/colour" },
      { label: "Type", to: "/ds/foundations/type" },
      { label: "Density", to: "/ds/foundations/density" },
      { label: "Motion & depth", to: "/ds/foundations/motion" },
    ],
  },
  {
    group: "Components",
    items: [
      { label: "Actions", to: "/ds/components/actions" },
      { label: "Forms", to: "/ds/components/forms" },
      { label: "Overlays", to: "/ds/components/overlays" },
      { label: "Data", to: "/ds/components/data" },
      { label: "Feedback", to: "/ds/components/feedback" },
    ],
  },
  {
    group: "Compositions",
    items: [
      { label: "Patterns", to: "/ds/patterns" },
      { label: "Blocks", to: "/ds/blocks" },
      { label: "Sign in", to: "/mock/login" },
    ],
  },
]

/**
 * The gallery. Same rail material as the app so a regression in the rail
 * shows up in the page that documents it.
 */
function GalleryLayout() {
  return (
    <TooltipProvider>
      <div className="flex h-svh w-full overflow-hidden bg-background">
        <nav
          aria-label="Design system"
          className="flex w-settings-nav shrink-0 flex-col border-r border-sidebar-border bg-sidebar"
        >
          <div className="flex h-topbar items-center justify-between px-3">
            <span className="text-xs font-semibold">Atlas Standards</span>
            <ThemeToggle />
          </div>
          <div className="px-2 pb-2">
            <RailLink to="/mock/inbox">Open the app mock →</RailLink>
          </div>
          <ScrollFade fade={24} className="min-h-0 flex-1 px-2 pb-2">
            {NAV.map((section) => (
              <div key={section.group} className="mb-3">
                <div className="px-2 pb-1.5 micro">{section.group}</div>
                <ul className="space-y-px">
                  {section.items.map((item) => (
                    <li key={item.to}>
                      <RailLink to={item.to}>{item.label}</RailLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </ScrollFade>
          <div className="flex items-center gap-1 border-t border-sidebar-border p-2">
            <UiScaleControl />
          </div>
        </nav>

        <ScrollFade className="min-h-0 flex-1">
          <div className="mx-auto w-full max-w-3xl px-8 py-8">
            <Outlet />
          </div>
        </ScrollFade>
      </div>
    </TooltipProvider>
  )
}

// Keep `Link` referenced so the route-tree types stay wired for this file.
void Link
