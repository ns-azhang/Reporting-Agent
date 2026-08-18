import { useMemo, useState, type CSSProperties } from "react"

import { AppSidebar, type Page } from "@/components/app-sidebar"
import { MyReportsPage } from "@/components/my-reports-page"
import { ReportDetailPage } from "@/components/report-detail-page"
import { ReportLibraryPage } from "@/components/report-library-page"
import { SessionHistoryPage } from "@/components/session-history-page"
import { StyleGuide } from "@/components/style-guide"
import { WelcomePage } from "@/components/welcome-page"
import { OWNED_REPORTS, SHARED_ACCESS, getReport } from "@/data/reports"
import type { Session } from "@/data/sessions"
import { useChat } from "@/lib/use-chat"
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

  /**
   * The conversation lives here, not in WelcomePage: a prompt naming a report
   * opens it, which swaps the page out, and the thread has to still be there
   * when you come back.
   */
  const chat = useChat(
    (reportId) => setOpenReportId(reportId),
    openReportId !== null
  )

  const newSession = () => {
    setOpenReportId(null)
    setResumed(null)
    chat.reset()
    setPage("new-session")
    setSessionKey((k) => k + 1)
  }

  /** Resuming drops you on the prompt page with the thread rebuilt above the
      composer, so you can carry on where the conversation left off. */
  const resumeSession = (session: Session) => {
    setOpenReportId(null)
    setResumed(session)
    chat.reset(session.turns)
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

  /**
   * What a card's ⋮ "Save to" can write into: the same set My Reports lists —
   * reports you own, plus library reports you favourited — so "my reports"
   * means one thing across the app.
   */
  const savableReports = useMemo(() => {
    const ownedIds = OWNED_REPORTS.map((r) => r.id)
    const ids = [...ownedIds, ...favorites.filter((f) => !ownedIds.includes(f))]
    return ids.flatMap((id) => {
      const report = getReport(id)
      return report
        ? [{ id, title: report.title, sharedWith: SHARED_ACCESS[id] }]
        : []
    })
  }, [favorites])

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
            // opened it; Back returns to that list. It gets the same
            // conversation, so a prompt that opened a report lands you beside
            // the thread that asked for it rather than in a dead end.
            <ReportDetailPage
              reportId={openReportId}
              onBack={() => setOpenReportId(null)}
              turns={chat.turns}
              thinking={chat.thinking}
              onSend={chat.send}
              savableReports={savableReports}
              onSaveToReport={(response, report) =>
                chat.note(`Added “${response.title}” to ${report.title}.`)
              }
              onCreateReport={(_response, name) =>
                chat.note(`Created “${name}” with this chart.`)
              }
            />
          ) : page === "new-session" ? (
            <WelcomePage
              key={sessionKey}
              resumed={resumed}
              turns={chat.turns}
              thinking={chat.thinking}
              onSend={chat.send}
              onOpenReport={(id) => setOpenReportId(id)}
              savableReports={savableReports}
              /* Saving lands as a line in the thread rather than a toast, so
                 there is still a record of it once the toast would have gone.
                 Neither actually writes into the report yet. */
              onSaveToReport={(response, report) =>
                chat.note(`Added “${response.title}” to ${report.title}.`)
              }
              /* "with this chart" rather than naming it again — the new report
                 usually takes the chart's own title, and repeating it reads as
                 a mistake. */
              onCreateReport={(_response, name) =>
                chat.note(`Created “${name}” with this chart.`)
              }
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
