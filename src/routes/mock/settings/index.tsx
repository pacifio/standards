import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/mock/settings/")({
  beforeLoad: () => {
    throw redirect({ to: "/mock/settings/organisation" })
  },
})
