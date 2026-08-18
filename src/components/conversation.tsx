import * as React from "react"
import {
  ArrowUpRight,
  Check,
  Copy,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  X,
  Zap,
} from "lucide-react"

import { ActionPanel } from "@/components/action-panel"
import { ReportWidget } from "@/components/report-widgets"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import type { ChatTurn } from "@/lib/use-chat"
import { getReport } from "@/data/reports"
import { getResponse, type Response } from "@/data/responses"
import type { Widget } from "@/data/report-details"

/**
 * The conversation thread — both the restored thread you get back from Session
 * History and the one you build by typing. Ported from the prototype's
 * Conversation / ResponseCard / TypingBubble.
 *
 * Each assistant turn renders as a card: header, chart, insight, follow-ups,
 * then the feedback row. Charts reuse the same renderers the report canvas
 * uses, so a trend line looks the same in both places.
 *
 * Not ported from the prototype's card: the chart-type selector, the ⋮ "Save to
 * report" menu, and drill-through on clicking a bar or an anomaly.
 */

/** Bridge a canned Response onto the widget shapes the renderers expect. */
function responseWidgets(response: Response): Widget[] {
  const widgets: Widget[] = []

  // The card shows the summary itself, so each widget's own insight slot stays
  // empty rather than repeating it.
  if (response.kpis?.length) {
    widgets.push({ type: "kpi", kpis: response.kpis, insight: "" })
  }
  if (response.series?.length && response.xLabels?.length) {
    widgets.push({
      type: "line",
      xLabels: response.xLabels,
      series: response.series,
      insight: "",
    })
  }
  if (response.bars?.length) {
    widgets.push({
      type: "hbar",
      // Some responses leave bars unstyled; fall back to the prototype's
      // neutral rather than letting Recharts pick its own palette.
      bars: response.bars.map((b) => ({ ...b, color: b.color ?? "#94a3b8" })),
      insight: "",
    })
  }
  if (response.slices?.length) {
    widgets.push({ type: "donut", slices: response.slices, insight: "" })
  }
  if (response.table) {
    widgets.push({
      type: "table",
      columns: response.table.columns,
      rows: response.table.rows,
      insight: "",
    })
  }
  return widgets
}

function UserBubble({ text }: { text: string }) {
  return (
    <div className="flex justify-end">
      <p className="max-w-[80%] rounded-xl bg-primary px-4 py-2.5 text-sm text-primary-foreground">
        {text}
      </p>
    </div>
  )
}

/** The "Thinking" beat while an answer is on its way. */
export function ThinkingBubble() {
  return (
    <div className="flex w-fit items-center gap-2.5 rounded-xl bg-card px-4 py-3 shadow-xs ring-1 ring-foreground/10">
      <Sparkles className="size-4 text-muted-foreground" />
      <span className="text-sm text-muted-foreground">Thinking</span>
      <span className="flex gap-1">
        {[0, 150, 300].map((delay) => (
          <span
            key={delay}
            className="size-1.5 animate-bounce rounded-full bg-muted-foreground/60"
            style={{ animationDelay: `${delay}ms` }}
          />
        ))}
      </span>
    </div>
  )
}

/** A prompt that named a report, so the report opened instead of answering. */
function ReportOpenedCard({
  reportId,
  onOpenReport,
}: {
  reportId: string
  onOpenReport?: (reportId: string) => void
}) {
  const report = getReport(reportId)
  if (!report) return null
  return (
    <div className="flex items-center gap-3 rounded-xl bg-card p-4 text-card-foreground shadow-xs ring-1 ring-foreground/10">
      <Sparkles className="size-4 shrink-0 text-muted-foreground" />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="text-sm font-semibold leading-snug">{report.title}</p>
        <p className="text-xs text-muted-foreground">
          Opened the matching report from the library.
        </p>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onOpenReport?.(report.id)}
      >
        Open
        <ArrowUpRight />
      </Button>
    </div>
  )
}

/** Helpful? — thumbs, then a reason picker if the answer missed. */
function FeedbackRow({ summary }: { summary: string }) {
  const [vote, setVote] = React.useState<"up" | "down" | null>(null)
  const [submitted, setSubmitted] = React.useState(false)
  const [reasons, setReasons] = React.useState<string[]>([])
  const [copied, setCopied] = React.useState(false)

  const REASONS = [
    "Wrong numbers",
    "Wrong time range",
    "Not what I asked",
    "Too generic",
    "Missing a breakdown",
  ]

  const copy = () => {
    void navigator.clipboard?.writeText(summary)
    setCopied(true)
  }

  if (submitted) {
    return (
      <p className="flex items-center justify-end gap-1.5 text-xs text-muted-foreground">
        <Check className="size-3.5" />
        Thanks for the feedback
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-end gap-1">
        <span className="mr-1 text-xs text-muted-foreground">Helpful?</span>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Helpful"
          aria-pressed={vote === "up"}
          onClick={() => {
            setVote("up")
            setSubmitted(true)
          }}
        >
          <ThumbsUp />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Not helpful"
          aria-pressed={vote === "down"}
          onClick={() => setVote(vote === "down" ? null : "down")}
          className={cn(vote === "down" && "bg-accent")}
        >
          <ThumbsDown />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Copy insight"
          onClick={copy}
        >
          {copied ? <Check /> : <Copy />}
        </Button>
      </div>

      {vote === "down" && (
        <div className="flex flex-col gap-2 rounded-lg bg-muted p-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium">What was off?</span>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Dismiss"
              onClick={() => setVote(null)}
            >
              <X />
            </Button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {REASONS.map((reason) => {
              const on = reasons.includes(reason)
              return (
                <Button
                  key={reason}
                  variant={on ? "default" : "outline"}
                  size="sm"
                  onClick={() =>
                    setReasons((r) =>
                      on ? r.filter((x) => x !== reason) : [...r, reason]
                    )
                  }
                >
                  {reason}
                </Button>
              )
            })}
          </div>
          <Button
            size="sm"
            className="w-fit"
            onClick={() => setSubmitted(true)}
          >
            Send feedback
          </Button>
        </div>
      )}
    </div>
  )
}

function ResponseCard({
  response,
  onPickFollowUp,
}: {
  response: Response
  onPickFollowUp?: (text: string, responseId?: string) => void
}) {
  const widgets = responseWidgets(response)
  const isAction =
    response.chartType === "action" || response.chartType === "ack"

  return (
    <div className="flex flex-col gap-4 rounded-xl bg-card p-4 text-card-foreground shadow-xs ring-1 ring-foreground/10">
      <div className="flex items-center gap-2">
        {isAction ? (
          <Zap className="size-4 shrink-0 text-muted-foreground" />
        ) : (
          <Sparkles className="size-4 shrink-0 text-muted-foreground" />
        )}
        <div className="flex min-w-0 flex-1 flex-col">
          <h3 className="truncate text-sm font-semibold leading-snug">
            {response.title}
          </h3>
          <p className="text-xs text-muted-foreground">
            {isAction
              ? "Action prepared · 0.4s"
              : "Generated · 1.2s · scoped to abc-corp"}
          </p>
        </div>
        {isAction && <Badge variant="secondary">Action</Badge>}
      </div>

      {response.action && <ActionPanel action={response.action} />}

      {response.chartType === "ack" && (
        <p className="flex w-fit items-center gap-2 rounded-lg bg-muted px-3 py-2 text-xs font-medium">
          {response.ackKind === "cancelled" ? (
            <X className="size-3.5" />
          ) : (
            <Check className="size-3.5" />
          )}
          {response.ackKind === "cancelled"
            ? "Cancelled — no changes applied."
            : "Acknowledged — recorded in your tenant."}
        </p>
      )}

      {widgets.length > 0 && (
        <div className="flex flex-col gap-4">
          {widgets.map((widget, i) => (
            <ReportWidget key={i} widget={widget} bare />
          ))}
        </div>
      )}

      {/* Insight — the narrative, set apart from the chart as in the prototype. */}
      <div className="flex flex-col gap-1.5 rounded-lg bg-muted p-3">
        <span className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
          <Sparkles className="size-3" />
          Insight
        </span>
        <p className="text-xs leading-relaxed">{response.summary}</p>
      </div>

      {response.followUps.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
            Suggested follow-ups
          </span>
          <div className="flex flex-wrap gap-2">
            {response.followUps.map((f) => (
              <Button
                key={f.text}
                variant="outline"
                size="sm"
                onClick={() => onPickFollowUp?.(f.text, f.id)}
                /* text-left + h-auto so a long chip wraps instead of being
                   clipped — the same fix the prototype needed. */
                className="h-auto max-w-full py-1.5 text-left whitespace-normal"
              >
                {f.text}
              </Button>
            ))}
          </div>
        </div>
      )}

      <Separator />
      <FeedbackRow summary={response.summary} />
    </div>
  )
}

export function Conversation({
  turns,
  thinking,
  onPickFollowUp,
  onOpenReport,
}: {
  turns: ChatTurn[]
  thinking?: boolean
  onPickFollowUp?: (text: string, responseId?: string) => void
  onOpenReport?: (reportId: string) => void
}) {
  return (
    <div className="flex flex-col gap-5">
      {turns.map((turn, i) => {
        if (turn.role === "user") {
          return <UserBubble key={i} text={turn.text} />
        }
        if (turn.role === "report") {
          return (
            <ReportOpenedCard
              key={i}
              reportId={turn.reportId}
              onOpenReport={onOpenReport}
            />
          )
        }
        const response = getResponse(turn.responseId)
        if (!response) return null
        return (
          <ResponseCard
            key={i}
            response={response}
            onPickFollowUp={onPickFollowUp}
          />
        )
      })}
      {thinking && <ThinkingBubble />}
    </div>
  )
}

export default Conversation
