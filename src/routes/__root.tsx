import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router"
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools"
import { TanStackDevtools } from "@tanstack/react-devtools"

import { ThemeProvider, themeInitScript } from "@/lib/theme"
import appCss from "../styles.css?url"

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Atlas Standards" },
      {
        name: "description",
        content: "The design system and web UI reference for Atlas.",
      },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  notFoundComponent: () => (
    <main className="flex min-h-svh flex-col items-center justify-center gap-2">
      <h1 className="heading">404</h1>
      <p className="caption">That page does not exist.</p>
    </main>
  ),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    // data-theme is set here so the server-rendered HTML is already the dark
    // floor rather than an unstyled document; themeInitScript corrects it to
    // the user's actual appearance before the first paint.
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <HeadContent />
        <script
          // Must run before the bundle, or a light-mode user gets a black
          // flash on every navigation.
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
        />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
        <TanStackDevtools
          config={{ position: "bottom-right" }}
          plugins={[
            {
              name: "Tanstack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
