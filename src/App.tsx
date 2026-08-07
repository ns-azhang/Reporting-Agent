import type { CSSProperties } from "react"

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
        <AppSidebar />
        <SidebarInset>
          <WelcomePage />
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}

export default App
