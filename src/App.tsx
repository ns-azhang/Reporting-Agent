import { useMemo, useState, type CSSProperties } from "react"

import { AppSidebar, type Page } from "@/components/app-sidebar"
import { MyReportsPage } from "@/components/my-reports-page"
import { ReportDetailPage } from "@/components/report-detail-page"
import { ReportLibraryPage } from "@/components/report-library-page"
import { SessionHistoryPage } from "@/components/session-history-page"
import { StyleGuide } from "@/components/style-guide"
import { WelcomePage } from "@/components/welcome-page"
import {
  OWNED_REPORTS,
  SHARED_ACCESS,
  getReport,
  type ReportOrigin,
} from "@/data/reports"
import type { Widget } from "@/data/report-details"
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
  /**
   * Which list opened it. The provenance badge follows the route rather than the
   * report, because two library templates are also reports the user owns — so
   * the header has to say what the card they clicked said.
   */
  const [reportOrigin, setReportOrigin] = useState<ReportOrigin>("library")

  /** Session restored from history, rendered as a thread on the prompt page. */
  const [resumed, setResumed] = useState<Session | null>(null)

  /**
   * Two conversations, deliberately separate.
   *
   * `chat` belongs to New Session. `reportChat` belongs to whichever report is
   * open. Sharing one thread meant questions asked beside a report piled up on
   * the New Session page, and a prompt that opened a report left its question
   * stranded there with nothing under it — so closing the report dropped you on
   * a half-finished thread instead of the page you started from.
   *
   * `reportChat` is created with reportOpen=true: from inside a report, a
   * question that happens to name one answers in the pane rather than
   * "navigating" to the page already on screen.
   */
  const reportChat = useChat(undefined, true)
  /** Every route into a report goes through here, so it always opens clean. */
  const openReport = (reportId: string, origin: ReportOrigin = "library") => {
    setOpenReportId(reportId)
    setReportOrigin(origin)
    reportChat.reset()
  }
  const chat = useChat(openReport)

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
   * Charts saved into a report from a chat card, keyed by report id. They render
   * after the report's built-in widgets, so the link in "Added X to <report>"
   * leads somewhere the chart actually is.
   */
  /**
   * Library templates the user saved. Saving one is a clone: the template stays
   * in the library, and the user gets a copy that shows up in My Reports — so
   * ownership is runtime state, not just the seeded OWNED_REPORTS.
   */
  const [savedReports, setSavedReports] = useState<
    { id: string; createdAt: string }[]
  >([])
  const saveReport = (reportId: string) =>
    setSavedReports((prev) =>
      prev.some((r) => r.id === reportId)
        ? prev
        : [
            ...prev,
            // Today, in the same ISO shape the seeded entries use.
            { id: reportId, createdAt: new Date().toISOString().slice(0, 10) },
          ]
    )
  /** Everything the user owns: seeded plus saved this session. */
  const ownedReports = useMemo(
    () => [
      ...OWNED_REPORTS,
      ...savedReports.filter((s) => !OWNED_REPORTS.some((o) => o.id === s.id)),
    ],
    [savedReports]
  )

  const [savedWidgets, setSavedWidgets] = useState<Record<string, Widget[]>>({})
  const saveWidgets = (reportId: string, widgets: Widget[]) =>
    setSavedWidgets((prev) => ({
      ...prev,
      [reportId]: [...(prev[reportId] ?? []), ...widgets],
    }))

  /**
   * What a card's ⋮ "Save to" can write into: the same set My Reports lists —
   * reports you own, plus library reports you favourited — so "my reports"
   * means one thing across the app.
   */
  const savableReports = useMemo(() => {
    const ownedIds = ownedReports.map((r) => r.id)
    const ids = [...ownedIds, ...favorites.filter((f) => !ownedIds.includes(f))]
    return ids.flatMap((id) => {
      const report = getReport(id)
      return report
        ? [{ id, title: report.title, sharedWith: SHARED_ACCESS[id] }]
        : []
    })
  }, [favorites, ownedReports])

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
            // opened it; Back returns to that list, untouched. The report gets
            // its own conversation in the right-hand pane.
            <ReportDetailPage
              reportId={openReportId}
              origin={reportOrigin}
              owned={ownedReports.some((r) => r.id === openReportId)}
              onSaveReport={saveReport}
              onBack={() => setOpenReportId(null)}
              turns={reportChat.turns}
              thinking={reportChat.thinking}
              onSend={reportChat.send}
              extraWidgets={savedWidgets[openReportId] ?? []}
              savableReports={savableReports}
              onNote={reportChat.note}
              onSaveWidget={saveWidgets}
              onOpenReport={(id) => openReport(id, "my-reports")}
            />
          ) : page === "new-session" ? (
            <WelcomePage
              key={sessionKey}
              resumed={resumed}
              turns={chat.turns}
              thinking={chat.thinking}
              onSend={chat.send}
              onOpenReport={openReport}
              onOpenSavedReport={(id) => openReport(id, "my-reports")}
              savableReports={savableReports}
              /* A ⋮ action lands as a line in the thread rather than a toast, so
                 there is still a record of it once a toast would have gone. */
              onNote={chat.note}
              onSaveWidget={saveWidgets}
            />
          ) : page === "session-history" ? (
            <SessionHistoryPage onPickSession={resumeSession} />
          ) : page === "report-library" ? (
            <ReportLibraryPage
              onOpenReport={(report) => openReport(report.id)}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
            />
          ) : (
            <MyReportsPage
              ownedReports={ownedReports}
              onOpenReport={(report) => openReport(report.id, "my-reports")}
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
