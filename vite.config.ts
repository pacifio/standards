import { defineConfig } from "vite"
import { devtools } from "@tanstack/devtools-vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import { nitro } from "nitro/vite"
import viteReact from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  // Nitro turns the Start build into a deployable server. It reads the
  // host from the build environment — on Vercel it writes the Build Output
  // API layout (`.vercel/output`) that Vercel serves; without it the deploy
  // uploads a bare `dist/` that Vercel has no idea how to route, and every
  // path 404s.
  plugins: [devtools(), tailwindcss(), tanstackStart(), nitro(), viteReact()],
  // Vite 8 forwards the browser console to the terminal, and the devtools
  // plugin forwards the terminal back to the browser — one deprecation
  // warning from three (R3F's `new THREE.Clock()`) then echoes forever
  // and floods the page until it stops painting.
  server: { forwardConsole: false },
})

export default config
