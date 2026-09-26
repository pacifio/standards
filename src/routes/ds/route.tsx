import { Link, Outlet, createFileRoute } from "@tanstack/react-router"
import { cn } from "cn"

import { ThemeToggle } from "@/components/shell/app-shell"
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
    group: "Patterns",
    items: [
      { label: "Patterns", to: "/ds/patterns" },
      { label: "Sign in", to: "/mock/login" },
    ],
  },
]

/**
 * The design-system gallery.
 *
 * Separate from /mock on purpose. The mock proves the system composes into a
 * product; the gallery proves each part is complete — every variant, every
 * size, every state, in both appearances. A component that only exists inside
 * a screen has never had its disabled state looked at.
 */
function GalleryLayout() {
  return (
    <TooltipProvider>
      <div className="flex h-svh overflow-hidden bg-sidebar">
        <nav
          aria-label="Design system"
          className="flex w-settings-nav shrink-0 flex-col gap-1 overflow-y-auto p-2"
        >
          <div className="flex h-topbar items-center justify-between px-2">
            <span className="text-xs font-semibold">Atlas Standards</span>
            <ThemeToggle />
          </div>

          <Link
            to="/mock/inbox"
            className="duration-fast flex h-control-md items-center rounded-md px-2 text-xs font-medium text-secondary-foreground transition-colors hover:bg-element-hover hover:text-foreground"
          >
            Open the app mock →
          </Link>

          {NAV.map((section) => (
            <div key={section.group} className="flex flex-col gap-px pt-4">
              <p className="px-2 pb-1 eyebrow">{section.group}</p>
              {section.items.map((item) => (
                <Link
                  key={item.to}
                  to={item.to as never}
                  className={cn(
                    "flex h-control-md items-center rounded-md px-2",
                    "text-xs font-medium text-secondary-foreground",
                    "duration-fast transition-colors ease-out-strong",
                    "hover:bg-element-hover hover:text-foreground",
                    "aria-[current=page]:bg-element-selected aria-[current=page]:text-foreground"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        <main className="m-2 ml-0 flex min-w-0 flex-1 flex-col overflow-y-auto rounded-lg border border-border bg-background">
          <div className="mx-auto w-full max-w-3xl px-8 py-10">
            <Outlet />
          </div>
        </main>
      </div>
    </TooltipProvider>
  )
}
