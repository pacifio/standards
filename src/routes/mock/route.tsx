import { Outlet, createFileRoute } from "@tanstack/react-router"

import { OrgProvider } from "@/lib/org-context"
import { TooltipProvider } from "@/components/ui/tooltip"

export const Route = createFileRoute("/mock")({ component: MockLayout })

/**
 * Everything under /mock shares one org context and one tooltip provider.
 *
 * The providers live here rather than in __root so the design-system gallery
 * under /ds does not carry an organisation it has no use for.
 */
function MockLayout() {
  return (
    <OrgProvider>
      <TooltipProvider>
        <Outlet />
      </TooltipProvider>
    </OrgProvider>
  )
}
