import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  /**
   * The built preview is served from a subfolder of the GitHub Pages site
   * (ns-azhang.github.io/Reporting-Agent/ux/), so assets have to resolve
   * relative to that path rather than the domain root.
   *
   * Build only: `base` applies to the dev server too, and setting it there
   * would move local dev to localhost:5180/Reporting-Agent/ux/.
   */
  base: command === "build" ? "/Reporting-Agent/ux/" : "/",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}))
