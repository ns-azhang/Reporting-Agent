import { useState, type CSSProperties } from "react"

import { AppSidebar } from "@/components/app-sidebar"
import { StyleGuide } from "@/components/style-guide"
import { WelcomePage } from "@/components/welcome-page"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"

/**
 * ?styleguide -> primitives kitchen sink (for comparing against the docs)
 * otherwise   -> the ported Reporting Agent homepage, inside the left nav
 */
export function App() {
  const showStyleGuide = new URLSearchParams(window.location.search).has(
    "styleguide"
  )

  // Bumping this remounts WelcomePage, which clears the composer — so
  // New Session actually resets the thread rather than being decorative.
  const [sessionKey, setSessionKey] = useState(0)

  if (showStyleGuide) {
    return <StyleGuide />
  }

  return (
    // TooltipProvider is required by SidebarMenuButton's `tooltip` prop, which
    // is what labels the items once the sidebar collapses to icons.
    <TooltipProvider>
      {/* 180px matches the Figma nav frame; shadcn's default is 16rem. */}
      <SidebarProvider
        style={{ "--sidebar-width": "180px" } as CSSProperties}
      >
        <AppSidebar onNewSession={() => setSessionKey((k) => k + 1)} />
        <SidebarInset>
          <WelcomePage key={sessionKey} />
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}

export default App
