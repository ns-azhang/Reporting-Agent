import * as React from "react"
import {
  ArrowLeft,
  ChevronDown,
  MessageSquare,
  PanelRightClose,
  Send,
  Share2,
  Sparkles,
} from "lucide-react"

import { Conversation } from "@/components/conversation"
import { ReportWidget } from "@/components/report-widgets"
import type { SavableReport } from "@/components/card-menu"
import type { ChatTurn } from "@/lib/use-chat"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { getReportDetail, type Widget } from "@/data/report-details"

type ReportDetailPageProps = {
  reportId: string
  onBack: () => void
  /**
   * The same conversation the prompt page uses. A prompt that names a report
   * opens it *with* the thread, so the report is on the left and the chat keeps
   * going on the right — you carry on iterating rather than being handed a
   * finished artifact and dropped.
   */
  turns: ChatTurn[]
  thinking: boolean
  onSend: (text: string, responseId?: string) => void
  savableReports?: SavableReport[]
  /** Charts saved into this report from a chat card, appended to its own. */
  extraWidgets?: Widget[]
  /** Follow a report link in a note. */
  onOpenReport?: (reportId: string) => void
  /** Record a finished ⋮ action in the thread. */
  onNote?: (text: string, link?: { reportId: string; label: string }) => void
  /** Add a chart to a report, so the note's link tells the truth. */
  onSaveWidget?: (reportId: string, widgets: Widget[]) => void
}

export function ReportDetailPage({
  reportId,
  onBack,
  turns,
  thinking,
  onSend,
  savableReports,
  extraWidgets = [],
  onOpenReport,
  onNote,
  onSaveWidget,
}: ReportDetailPageProps) {
  const report = getReportDetail(reportId)
  const [chatOpen, setChatOpen] = React.useState(true)
  const [draft, setDraft] = React.useState("")
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)
  const threadEnd = React.useRef<HTMLDivElement>(null)

  const send = () => {
    if (!draft.trim() || thinking) return
    onSend(draft)
    setDraft("")
  }

  const turnCount = turns.length
  React.useEffect(() => {
    if (turnCount === 0) return
    threadEnd.current?.scrollIntoView({ behavior: "smooth", block: "end" })
  }, [turnCount, thinking])

  // Every library report now has contents; this only trips on a bad id.
  if (!report) {
    return (
      <div className="flex h-svh flex-col items-center justify-center gap-3">
        <p className="text-sm text-muted-foreground">Report not found.</p>
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft />
          Back
        </Button>
      </div>
    )
  }

  return (
    // The two panes scroll independently, so the canvas can be long without
    // pushing the chat composer off-screen.
    //
    // No `flex-1` here: this sits in SidebarInset's column flex, where flex
    // sizing would override h-svh and let the element grow to content height —
    // which stops overflow-y-auto engaging and scrolls the whole document
    // instead, taking the chat pane with it. Fixed height + overflow-hidden
    // pins it to the viewport so the children own their own scrolling.
    <div className="flex h-svh overflow-hidden">
      {/* Canvas */}
      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <div className="flex w-full flex-col gap-6 px-8 py-8">
          <div className="flex flex-col gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="-ml-2 w-fit text-muted-foreground"
            >
              <ArrowLeft />
              Back
            </Button>

            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-semibold tracking-tight">
                    {report.title}
                  </h1>
                  <Badge variant="secondary">Netskope Library</Badge>
                </div>
                <p className="max-w-2xl text-sm text-muted-foreground">
                  {report.description}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Button variant="outline" size="sm">
                  <Share2 />
                  Share
                </Button>
                {!chatOpen && (
                  <Button size="sm" onClick={() => setChatOpen(true)}>
                    <MessageSquare />
                    Ask
                  </Button>
                )}
              </div>
            </div>


            {/* About this report — collapsed by default so it doesn't push the
                data below the fold. */}
            {report.about && (
            <Collapsible>
              <CollapsibleTrigger
                render={
                  <Button
                    variant="ghost"
                    size="sm"
                    className="-ml-2 w-fit text-muted-foreground"
                  />
                }
              >
                <ChevronDown />
                About this report
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="flex flex-col gap-2 pt-2 pl-1">
                  <p className="max-w-2xl text-sm text-muted-foreground">
                    {report.about.blurb}
                  </p>
                  <ul className="flex flex-col gap-1">
                    {report.about.questions.map((q: string) => (
                      <li
                        key={q}
                        className="flex gap-2 text-sm text-muted-foreground"
                      >
                        <span aria-hidden>•</span>
                        {q}
                      </li>
                    ))}
                  </ul>
                </div>
              </CollapsibleContent>
            </Collapsible>
            )}
          </div>

          {/* KPI row spans both columns; the rest sit half-width, as in v5.
              Charts saved here from a chat card come after the built-ins. */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[...report.widgets, ...extraWidgets].map((widget, i) => (
              <div
                key={i}
                className={widget.size === "full" ? "sm:col-span-2" : undefined}
              >
                <ReportWidget widget={widget} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chat pane */}
      {chatOpen && (
        <aside className="flex w-[380px] shrink-0 flex-col border-l border-border bg-background">
          <div className="flex items-center justify-between gap-2 px-4 py-3">
            <span className="flex items-center gap-2 text-sm font-semibold">
              <Sparkles className="size-4 text-muted-foreground" />
              AI Assistant
            </span>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Collapse chat"
              onClick={() => setChatOpen(false)}
            >
              <PanelRightClose />
            </Button>
          </div>
          <Separator />

          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
            {/* Seeded assistant turn — the report's own summary, so the pane
                opens with analysis rather than an empty box. */}
            <div className="flex flex-col gap-2 rounded-xl bg-muted p-3">
              <p className="text-xs leading-relaxed">{report.summary}</p>
            </div>

            {/* The thread that brought you here, and everything since. */}
            {turns.length > 0 && (
              <Conversation
                turns={turns}
                thinking={thinking}
                onPickFollowUp={onSend}
                onAnswerClarify={(label) => onSend(label)}
                savableReports={savableReports}
                onNote={onNote}
                onSaveWidget={onSaveWidget}
                onOpenReport={onOpenReport}
              />
            )}

            {/* Openers, shown until the conversation has its own momentum. */}
            {turns.length === 0 && !thinking && (
              <div className="flex flex-col gap-2">
                <span className="text-xs font-medium text-muted-foreground">
                  Try asking
                </span>
                {report.examplePrompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => onSend(prompt)}
                    className="rounded-md border border-border px-3 py-2 text-left text-xs outline-none transition-colors hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            <div ref={threadEnd} />
          </div>

          <div className="p-3">
            <div className="flex flex-col rounded-md border border-input bg-background shadow-xs transition-[color,box-shadow] focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
              <Textarea
                ref={textareaRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    send()
                  }
                }}
                placeholder="Ask about this report…"
                className="min-h-[64px] resize-none border-0 bg-transparent px-3 pt-2.5 text-sm shadow-none focus-visible:border-0 focus-visible:ring-0 dark:bg-transparent"
              />
              <div className="flex justify-end px-2 pb-2">
                <Button
                  size="sm"
                  disabled={!draft.trim() || thinking}
                  onClick={send}
                >
                  Send <Send />
                </Button>
              </div>
            </div>
          </div>
        </aside>
      )}
    </div>
  )
}

export default ReportDetailPage
