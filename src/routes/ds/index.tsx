import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/ds/")({
  beforeLoad: () => {
    throw redirect({ to: "/ds/foundations/colour" })
  },
})
