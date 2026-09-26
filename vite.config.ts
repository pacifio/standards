import { defineConfig } from "vite"
import { devtools } from "@tanstack/devtools-vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import viteReact from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [devtools(), tailwindcss(), tanstackStart(), viteReact()],
  // Vite 8 forwards the browser console to the terminal, and the devtools
  // plugin forwards the terminal back to the browser — one deprecation
  // warning from three (R3F's `new THREE.Clock()`) then echoes forever
  // and floods the page until it stops painting.
  server: { forwardConsole: false },
})

export default config
