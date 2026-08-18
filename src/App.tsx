import { useState, type CSSProperties } from "react"

import { AppSidebar, type Page } from "@/components/app-sidebar"
import { MyReportsPage } from "@/components/my-reports-page"
import { ReportDetailPage } from "@/components/report-detail-page"
import { ReportLibraryPage } from "@/components/report-library-page"
import { SessionHistoryPage } from "@/components/session-history-page"
import { StyleGuide } from "@/components/style-guide"
import { WelcomePage } from "@/components/welcome-page"
import type { Session } from "@/data/sessions"
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

  /**
   * An open report is tracked alongside `page` rather than as another Page
   * value, so closing it returns you to whichever list you came from.
   */
  const [openReportId, setOpenReportId] = useState<string | null>(null)

  /** Session restored from history, rendered as a thread on the prompt page. */
  const [resumed, setResumed] = useState<Session | null>(null)

  const newSession = () => {
    setOpenReportId(null)
    setResumed(null)
    setPage("new-session")
    setSessionKey((k) => k + 1)
  }

  /** Resuming drops you on the prompt page with the thread rebuilt above the
      composer, so you can carry on where the conversation left off. */
  const resumeSession = (session: Session) => {
    setOpenReportId(null)
    setResumed(session)
    setPage("new-session")
    setSessionKey((k) => k + 1)
  }

  const navigate = (next: Page) => {
    setOpenReportId(null)
    if (next !== "new-session") setResumed(null)
    setPage(next)
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
          onNavigate={navigate}
          onNewSession={newSession}
        />
        <SidebarInset>
          {openReportId ? (
            // An open report takes over the inset regardless of which list
            // opened it; Back returns to that list.
            <ReportDetailPage
              reportId={openReportId}
              onBack={() => setOpenReportId(null)}
            />
          ) : page === "new-session" ? (
            <WelcomePage
              key={sessionKey}
              resumed={resumed}
              onOpenReport={(id) => setOpenReportId(id)}
            />
          ) : page === "session-history" ? (
            <SessionHistoryPage onPickSession={resumeSession} />
          ) : page === "report-library" ? (
            <ReportLibraryPage
              onOpenReport={(report) => setOpenReportId(report.id)}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
            />
          ) : (
            <MyReportsPage
              onOpenReport={(report) => setOpenReportId(report.id)}
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
