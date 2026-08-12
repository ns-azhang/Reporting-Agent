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

import { ReportWidget } from "@/components/report-widgets"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { getReportDetail, hasRealDetail } from "@/data/report-details"

type ReportDetailPageProps = {
  reportId: string
  onBack: () => void
}

export function ReportDetailPage({ reportId, onBack }: ReportDetailPageProps) {
  const report = getReportDetail(reportId)
  const [chatOpen, setChatOpen] = React.useState(true)
  const [draft, setDraft] = React.useState("")
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  const ask = (text: string) => {
    setDraft(text)
    textareaRef.current?.focus()
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

            {!hasRealDetail(reportId) && (
              <p className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
                Showing DLP Incidents Status Monitoring as a stand-in — this
                report’s contents aren’t ported yet.
              </p>
            )}

            {/* About this report — collapsed by default so it doesn't push the
                data below the fold. */}
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
                    {report.about.questions.map((q) => (
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
          </div>

          {/* KPI row spans both columns; the rest sit half-width, as in v5. */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {report.widgets.map((widget, i) => (
              <ReportWidget key={i} widget={widget} />
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

            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium text-muted-foreground">
                Try asking
              </span>
              {report.examplePrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => ask(prompt)}
                  className="rounded-md border border-border px-3 py-2 text-left text-xs outline-none transition-colors hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          <div className="p-3">
            <div className="flex flex-col rounded-md border border-input bg-background shadow-xs transition-[color,box-shadow] focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
              <Textarea
                ref={textareaRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Ask about this report…"
                className="min-h-[64px] resize-none border-0 bg-transparent px-3 pt-2.5 text-sm shadow-none focus-visible:border-0 focus-visible:ring-0 dark:bg-transparent"
              />
              <div className="flex justify-end px-2 pb-2">
                <Button size="sm" disabled={!draft.trim()}>
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
