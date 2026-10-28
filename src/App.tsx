import { useMemo, useState, type CSSProperties } from "react"

import { AppSidebar, type Page } from "@/components/app-sidebar"
import { MyReportsPage } from "@/components/my-reports-page"
import { PastSessionPage } from "@/components/past-session-page"
import { ReportDetailPage } from "@/components/report-detail-page"
import { ReportLibraryPage } from "@/components/report-library-page"
import { StyleGuide } from "@/components/style-guide"
import { WelcomePage } from "@/components/welcome-page"
import {
  OWNED_REPORTS,
  SHARED_ACCESS,
  getReport,
  type ReportOrigin,
} from "@/data/reports"
import type { Widget } from "@/data/report-details"
import {
  SEEDED_SESSIONS,
  askInto,
  askedLabel,
  isLive,
  newSessionId,
  type PastSession,
} from "@/data/prompt-history"
import { matchReportByKeyword } from "@/lib/classify-prompt"
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

  /**
   * The signed-in user's sessions, newest first, capped by count (see
   * @/data/prompt-history) and listed under Recent in the nav. Per user, so
   * they live beside the user's other state rather than being shared across
   * the tenant.
   */
  const [sessions, setSessions] = useState<PastSession[]>(SEEDED_SESSIONS)
  /**
   * The session on the prompt page: null for a new one not yet asked into.
   * A live one is in `chat`; a read-only one is only shown. Leaving for
   * another page keeps it, so its Recent entry takes you back to it as left.
   */
  const [openSessionId, setOpenSessionId] = useState<string | null>(null)

  /**
   * What's typed in each composer, by session ("new" for New Session). It
   * lives here, not in WelcomePage, so leaving mid-sentence and coming back
   * finds it as you left it. Sending is what clears it. + New Session
   * doesn't: it starts a new thread, not a new sentence.
   */
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const draftKey = openSessionId ?? "new"

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

  /**
   * `sessions` with the live thread in place. The chat holds the open
   * session's turns while you are in it and they are written back only when
   * you switch away, so the list never trails a turn behind the screen.
   */
  const withChat = sessions.map((s) =>
    s.id === openSessionId && chat.turns.length > 0
      ? { ...s, turns: chat.turns }
      : s
  )
  const openSession = withChat.find((s) => s.id === openSessionId) ?? null

  /** Every switch of session goes through here, so the one left is saved. */
  const switchSession = (id: string | null) => {
    setSessions(withChat)
    setOpenReportId(null)
    setOpenSessionId(id)
    const next = withChat.find((s) => s.id === id)
    // Only a live session goes back into the chat; a read-only one is shown
    // as is, and an empty chat keeps `withChat` from writing over it.
    chat.reset(next && isLive(next) ? next.turns : [])
    setPage("new-session")
    setSessionKey((k) => k + 1)
  }

  const newSession = () => switchSession(null)

  /** From Recent. The session already open just comes back to the front, so
      an answer still on its way isn't cut off. */
  const openSessionFromNav = (id: string) => {
    if (id === openSessionId) {
      setOpenReportId(null)
      setPage("new-session")
      return
    }
    switchSession(id)
  }

  /**
   * A prompt asked on the prompt page. The first one starts a session under
   * it; later ones move it back to the top. A prompt that named a report
   * opened that report instead of being answered here, so it starts nothing.
   */
  const recordAsk = (text: string, responseId?: string) => {
    if (!responseId && matchReportByKeyword(text)) return
    const id = openSessionId ?? newSessionId()
    setOpenSessionId(id)
    setSessions((prev) => askInto(prev, id, text))
  }

  /** Reusing a prompt starts a new session with it waiting in the composer,
      rather than asking it straight away — see WelcomePage's `draft`. */
  const reusePrompt = (text: string) => {
    newSession()
    setDrafts((d) => ({ ...d, new: text }))
  }

  const navigate = (next: Page) => {
    setOpenReportId(null)
    setPage(next)
  }

  // Favourites live here so the star reads the same on every list. Starring
  // marks a report where it is — it doesn't copy it into My Reports; that is
  // what Save does, and doing both used to list the report twice.
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
   * What a card's "Save to" can write into: the same set My Reports lists —
   * the reports you own — so "my reports" means one thing across the app. A
   * favourited template isn't yours to write into until you save it.
   */
  const savableReports = useMemo(
    () =>
      ownedReports.flatMap(({ id }) => {
        const report = getReport(id)
        return report
          ? [{ id, title: report.title, sharedWith: SHARED_ACCESS[id] }]
          : []
      }),
    [ownedReports]
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
          sessions={withChat}
          activeSessionId={
            page === "new-session" && !openReportId ? openSessionId : null
          }
          onOpenSession={openSessionFromNav}
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
              onAck={reportChat.ack}
              onSaveWidget={saveWidgets}
              onOpenReport={(id) => openReport(id, "my-reports")}
            />
          ) : page === "new-session" && openSession && !isLive(openSession) ? (
            <PastSessionPage
              session={openSession}
              onAskAgain={reusePrompt}
              onOpenReport={openReport}
            />
          ) : page === "new-session" ? (
            <WelcomePage
              key={sessionKey}
              title={openSession?.title}
              subtitle={
                openSession
                  ? `Last asked ${askedLabel(openSession.askedAt, undefined, true)}. You can keep asking for 24 hours after your last prompt.`
                  : undefined
              }
              draft={drafts[draftKey] ?? ""}
              onDraftChange={(text) =>
                setDrafts((d) => ({ ...d, [draftKey]: text }))
              }
              turns={chat.turns}
              thinking={chat.thinking}
              onSend={chat.send}
              onAsk={recordAsk}
              onOpenReport={openReport}
              onOpenSavedReport={(id) => openReport(id, "my-reports")}
              savableReports={savableReports}
              /* A ⋮ action lands as a line in the thread rather than a toast, so
                 there is still a record of it once a toast would have gone. */
              onNote={chat.note}
              onSaveWidget={saveWidgets}
            />
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
