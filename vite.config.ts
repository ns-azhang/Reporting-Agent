import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig, type Plugin } from "vite"

/**
 * The review-comment widget, served by a local tool on :4000. Dev server
 * only: it is injected into index.html while `pnpm dev` runs and never
 * reaches a build, since localhost:4000 means nothing on the published
 * /ux/ preview.
 */
const commentWidget = (): Plugin => ({
  name: "comment-widget",
  apply: "serve",
  transformIndexHtml: () => [
    {
      tag: "script",
      attrs: {
        src: "http://localhost:4000/widget.js",
        "data-project": "data-reporting-agent",
        defer: true,
      },
      injectTo: "body",
    },
  ],
})

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
  plugins: [react(), tailwindcss(), commentWidget()],
  /**
   * Two pages: the beta (index.html) and its beta-workflows branch. The dev
   * server serves both from the root already; the build needs them listed.
   */
  build: {
    rollupOptions: {
      input: {
        index: path.resolve(__dirname, "index.html"),
        "beta-workflows": path.resolve(__dirname, "beta-workflows.html"),
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}))
