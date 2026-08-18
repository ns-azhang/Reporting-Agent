import * as React from "react"
import {
  CalendarClock,
  Check,
  Copy,
  Download,
  FileText,
  Send,
  ShieldAlert,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import type { ResponseAction } from "@/data/responses"

/**
 * The prepared-action cards, ported from the prototype's ActionPanel: an export
 * that's ready to download, a recurring delivery to confirm, a Slack post to
 * review, or a set of policy recommendations.
 *
 * The prototype tints each kind (emerald / blue / violet / amber). v6 is on the
 * neutral shadcn palette, so the kinds are distinguished by their icon and
 * layout instead of by hue — colour here is reserved for chart data.
 *
 * Buttons confirm inline (Download -> Downloaded) rather than raising a toast;
 * there is no toaster in this app yet, and a button that visibly latches is
 * enough to show the action landed.
 */

const fmt = (n: number) => n.toLocaleString("en-US")

/** Icon in a muted tile, matching the prototype's leading-icon layout. */
function ActionIcon({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground [&_svg]:size-5">
      {children}
    </div>
  )
}

/** A button that latches into a done state once pressed. */
function ConfirmButton({
  children,
  done,
  doneLabel,
  onConfirm,
  variant = "default",
}: {
  children: React.ReactNode
  done: boolean
  doneLabel: string
  onConfirm: () => void
  variant?: "default" | "outline"
}) {
  return (
    <Button
      size="sm"
      variant={done ? "outline" : variant}
      disabled={done}
      onClick={onConfirm}
      /* disabled:opacity-100 so the latched state reads as "done", not
         "unavailable" — the default disabled fade says the wrong thing here. */
      className={done ? "disabled:opacity-100" : undefined}
    >
      {done ? (
        <>
          <Check />
          {doneLabel}
        </>
      ) : (
        children
      )}
    </Button>
  )
}

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border p-4">
      {children}
    </div>
  )
}

export function ActionPanel({ action }: { action: ResponseAction }) {
  const [done, setDone] = React.useState<Record<string, boolean>>({})
  const mark = (key: string) => setDone((d) => ({ ...d, [key]: true }))

  if (action.kind === "export") {
    return (
      <Frame>
        <div className="flex items-start gap-3">
          <ActionIcon>
            <FileText />
          </ActionIcon>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <code className="truncate font-mono text-xs font-semibold">
                {action.filename}
              </code>
              <Badge variant="secondary">
                <Check />
                Ready
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground tabular-nums">
              {fmt(action.rows)} rows · {action.columns.length} columns ·{" "}
              {action.sizeKb} KB
            </p>
            {/* <details> keeps the column list one click away without needing a
                disclosure component or any state of its own. */}
            <details className="group mt-1">
              <summary className="w-fit cursor-pointer list-none text-xs text-muted-foreground select-none hover:text-foreground">
                <span className="inline-block transition-transform group-open:rotate-90">
                  ›
                </span>{" "}
                Preview columns
              </summary>
              <div className="mt-2 flex flex-wrap gap-1">
                {action.columns.map((c) => (
                  <span
                    key={c}
                    className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </details>
          </div>
        </div>
        <Separator />
        <div className="flex flex-wrap items-center gap-2">
          <ConfirmButton
            done={!!done.csv}
            doneLabel="Downloaded"
            onConfirm={() => mark("csv")}
          >
            <Download />
            Download {action.format}
          </ConfirmButton>
          {!/\.pdf$/i.test(action.filename) && (
            <ConfirmButton
              variant="outline"
              done={!!done.pdf}
              doneLabel="Downloaded"
              onConfirm={() => mark("pdf")}
            >
              <Download />
              Download PDF
            </ConfirmButton>
          )}
          <ConfirmButton
            variant="outline"
            done={!!done.link}
            doneLabel="Link copied"
            onConfirm={() => mark("link")}
          >
            <Copy />
            Copy share link
          </ConfirmButton>
        </div>
      </Frame>
    )
  }

  if (action.kind === "schedule") {
    return (
      <Frame>
        <div className="flex items-start gap-3">
          <ActionIcon>
            <CalendarClock />
          </ActionIcon>
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <p className="text-sm font-semibold">{action.title}</p>
            <dl className="grid grid-cols-1 gap-x-6 gap-y-1.5 text-xs sm:grid-cols-2">
              {action.fields.map((f) => (
                <div key={f.label} className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">{f.label}</dt>
                  <dd className="truncate text-right font-medium">{f.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
        <Separator />
        <div className="flex items-center gap-2">
          <ConfirmButton
            done={!!done.schedule}
            doneLabel={`Scheduled — first run ${action.firstRun}`}
            onConfirm={() => mark("schedule")}
          >
            Confirm schedule
          </ConfirmButton>
          {!done.schedule && (
            <Button size="sm" variant="ghost">
              Edit
            </Button>
          )}
        </div>
      </Frame>
    )
  }

  if (action.kind === "send") {
    return (
      <Frame>
        <div className="flex items-start gap-3">
          <ActionIcon>
            <Send />
          </ActionIcon>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <p className="text-sm font-semibold">{action.title}</p>
            <p className="text-xs text-muted-foreground">
              Channel:{" "}
              <span className="font-mono text-foreground">{action.channel}</span>
            </p>
            <div className="mt-2 rounded-md bg-muted p-3 text-xs whitespace-pre-wrap">
              {action.preview}
            </div>
          </div>
        </div>
        <Separator />
        <div className="flex items-center gap-2">
          <ConfirmButton
            done={!!done.send}
            doneLabel={`Sent to ${action.channel}`}
            onConfirm={() => mark("send")}
          >
            Send now
          </ConfirmButton>
          {!done.send && (
            <Button size="sm" variant="ghost">
              Edit message
            </Button>
          )}
        </div>
      </Frame>
    )
  }

  return (
    <Frame>
      <div className="flex items-start gap-3">
        <ActionIcon>
          <ShieldAlert />
        </ActionIcon>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <p className="text-sm font-semibold">{action.title}</p>
          <p className="text-xs text-muted-foreground">
            Generated from policy + destination + user-risk signals
          </p>
        </div>
      </div>
      <ul className="flex flex-col gap-2">
        {action.recommendations.map((r, i) => (
          <li
            key={r.title}
            className="flex items-start gap-3 rounded-lg border border-border p-3"
          >
            <Badge variant="outline" className="mt-0.5 shrink-0">
              REC {i + 1}
            </Badge>
            <div className="flex flex-1 flex-col gap-0.5">
              <p className="text-xs font-medium">{r.title}</p>
              <p className="text-xs text-muted-foreground">{r.detail}</p>
            </div>
            <ConfirmButton
              variant="outline"
              done={!!done[`rec${i}`]}
              doneLabel="Drafted"
              onConfirm={() => mark(`rec${i}`)}
            >
              Draft policy
            </ConfirmButton>
          </li>
        ))}
      </ul>
    </Frame>
  )
}

export default ActionPanel
