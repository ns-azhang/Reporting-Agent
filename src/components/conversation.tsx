import { Sparkles, Zap } from "lucide-react"

import { ReportWidget } from "@/components/report-widgets"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getResponse, type Response } from "@/data/responses"
import type { Turn } from "@/data/sessions"
import type { Widget } from "@/data/report-details"

/**
 * Restored conversation view — the thread you get back when you resume a
 * session from Session History.
 *
 * Each assistant turn renders as a card: title, its chart, the summary, then
 * follow-up chips. That mirrors the prototype's ResponseCard, and reuses the
 * same widget renderers the report canvas uses so charts stay consistent
 * between the two surfaces.
 */

/** Bridge a canned Response onto the widget shapes the renderers expect. */
function responseWidgets(response: Response): Widget[] {
  const widgets: Widget[] = []

  if (response.kpis?.length) {
    widgets.push({
      type: "kpi",
      kpis: response.kpis,
      // The summary is shown once beneath the card, so the KPI widget's own
      // insight slot stays empty rather than repeating it.
      insight: "",
    })
  }
  if (response.series?.length && response.xLabels?.length) {
    widgets.push({
      type: "line",
      title: "",
      xLabels: response.xLabels,
      series: response.series,
      insight: "",
    })
  }
  if (response.bars?.length) {
    widgets.push({
      type: "hbar",
      title: "",
      // Some responses leave bars unstyled; fall back to the prototype's
      // neutral rather than letting Recharts pick its own palette.
      bars: response.bars.map((b) => ({
        label: b.label,
        value: b.value,
        color: b.color ?? "#94a3b8",
      })),
      insight: "",
    })
  }
  if (response.columns?.length && response.rows?.length) {
    widgets.push({
      type: "table",
      title: "",
      columns: response.columns,
      rows: response.rows,
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

function ResponseCard({
  response,
  onPickFollowUp,
}: {
  response: Response
  onPickFollowUp?: (text: string) => void
}) {
  const widgets = responseWidgets(response)
  const isAction = response.chartType === "action"

  return (
    <div className="flex flex-col gap-3 rounded-xl bg-card p-4 text-card-foreground shadow-xs ring-1 ring-foreground/10">
      <div className="flex items-center gap-2">
        {isAction ? (
          <Zap className="size-4 text-muted-foreground" />
        ) : (
          <Sparkles className="size-4 text-muted-foreground" />
        )}
        <h3 className="text-sm font-semibold leading-snug">{response.title}</h3>
        {isAction && <Badge variant="secondary">Action</Badge>}
      </div>

      {widgets.length > 0 && (
        <div className="flex flex-col gap-3">
          {widgets.map((widget, i) => (
            <ReportWidget key={i} widget={widget} bare />
          ))}
        </div>
      )}

      <p className="text-xs leading-relaxed text-muted-foreground">
        {response.summary}
      </p>

      {response.followUps.length > 0 && (
        <div className="flex flex-col gap-2 border-t border-border pt-3">
          <span className="text-xs font-medium text-muted-foreground">
            Suggested follow-ups
          </span>
          <div className="flex flex-wrap gap-2">
            {response.followUps.map((text) => (
              <Button
                key={text}
                variant="outline"
                size="sm"
                onClick={() => onPickFollowUp?.(text)}
                /* text-left + h-auto so a long chip wraps instead of being
                   clipped — the same fix the prototype needed. */
                className="h-auto max-w-full py-1.5 text-left whitespace-normal"
              >
                {text}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export function Conversation({
  turns,
  onPickFollowUp,
}: {
  turns: Turn[]
  onPickFollowUp?: (text: string) => void
}) {
  return (
    <div className="flex flex-col gap-5">
      {turns.map((turn, i) => {
        if (turn.role === "user") {
          return <UserBubble key={i} text={turn.text} />
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
    </div>
  )
}

export default Conversation
