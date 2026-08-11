import { useState, type CSSProperties } from "react"

import { AppSidebar, type Page } from "@/components/app-sidebar"
import { MyReportsPage } from "@/components/my-reports-page"
import { ReportLibraryPage } from "@/components/report-library-page"
import { SessionHistoryPage } from "@/components/session-history-page"
import { StyleGuide } from "@/components/style-guide"
import { WelcomePage } from "@/components/welcome-page"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"

/**
 * ?styleguide -> primitives kitchen sink (for comparing against the docs)
 * otherwise   -> the app, with the left nav switching between pages.
 *
 * Routing is deliberately just state: this is a prototype, and a router would
 * add a dependency and URL surface we don't need yet.
 */
export function App() {
  const showStyleGuide = new URLSearchParams(window.location.search).has(
    "styleguide"
  )

  const [page, setPage] = useState<Page>("new-session")
  // Bumping this remounts WelcomePage, which clears the composer — so
  // New Session actually resets the thread rather than being decorative.
  const [sessionKey, setSessionKey] = useState(0)

  const newSession = () => {
    setPage("new-session")
    setSessionKey((k) => k + 1)
  }

  // Favourites live here rather than in a page, because starring a report in
  // the Report Library is what surfaces it in My Reports.
  const [favorites, setFavorites] = useState<string[]>([])
  const toggleFavorite = (id: string) =>
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    )

  if (showStyleGuide) {
    return <StyleGuide />
  }

  return (
    // TooltipProvider is required by SidebarMenuButton's `tooltip` prop, which
    // is what labels the items once the sidebar collapses to icons.
    <TooltipProvider>
      {/* 180px matches the Figma nav frame; shadcn's default is 16rem. */}
      <SidebarProvider style={{ "--sidebar-width": "180px" } as CSSProperties}>
        <AppSidebar
          page={page}
          onNavigate={setPage}
          onNewSession={newSession}
        />
        <SidebarInset>
          {page === "new-session" ? (
            <WelcomePage key={sessionKey} />
          ) : page === "session-history" ? (
            // Resuming a session lands you back on the prompt page. The thread
            // itself isn't restored yet — that needs the conversation view.
            <SessionHistoryPage onPickSession={newSession} />
          ) : page === "report-library" ? (
            // Opening a report lands on the prompt page for now; the report
            // canvas itself isn't ported yet.
            <ReportLibraryPage
              onOpenReport={newSession}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
            />
          ) : (
            <MyReportsPage
              onOpenReport={newSession}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
            />
          )}
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}

export default App
