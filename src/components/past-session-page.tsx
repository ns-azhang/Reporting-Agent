import { Lock, RotateCcw } from "lucide-react"

import { Conversation } from "@/components/conversation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { askedLabel, type PastSession } from "@/data/prompt-history"

type PastSessionPageProps = {
  session: PastSession
  /** Carry the question on — in a new session, since this one is closed. */
  onAskAgain: (text: string) => void
  /** Follow the report link when the prompt opened a report. */
  onOpenReport?: (reportId: string) => void
}

/**
 * A session from the sidebar's Recent list that has gone past LIVE_FOR_MS,
 * to read but not continue. The thread is read-only and the composer stays on screen, locked,
 * so it is plain that you can't keep asking here rather than the box just
 * being missing; its one live control starts a new session with the prompt.
 */
export function PastSessionPage({
  session,
  onAskAgain,
  onOpenReport,
}: PastSessionPageProps) {
  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      {/* div, not <main> — SidebarInset already renders the page's <main>.
          Same centred max-w-6xl column as every other page. */}
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-8 py-8">
        {/* No Back: the session was opened from the sidebar, which is
            still there to go anywhere else. */}
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              {session.title}
            </h1>
            <Badge variant="secondary">
              <Lock />
              Read-only
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {/* "Last asked 12 days ago" — and why that means read-only. */}
            Last asked {askedLabel(session.askedAt, undefined, true)}. Sessions stay
            open for 24 hours after the last prompt.
          </p>
        </div>

        <Conversation
          turns={session.turns}
          readOnly
          onOpenReport={onOpenReport}
        />

        {/* The composer, locked. Same box as New Session's so it reads as the
            place you'd type, with the reason in it instead of a prompt. */}
        <div className="flex min-h-[112px] flex-col rounded-md border border-input bg-muted/50">
          <Textarea
            disabled
            aria-label="Prompt"
            placeholder="This session is read-only. You can't keep prompting here — ask again to continue in a new session."
            className="min-h-0 flex-1 resize-none border-0 bg-transparent px-4 pt-3.5 shadow-none focus-visible:border-0 focus-visible:ring-0 disabled:cursor-default disabled:opacity-100 dark:bg-transparent"
          />
          <div className="flex items-center justify-between px-3 pt-2 pb-2.5">
            <span className="flex items-center gap-1.5 px-2 text-xs text-muted-foreground">
              <Lock className="size-3.5" />
              Read-only
            </span>
            <Button size="sm" onClick={() => onAskAgain(session.title)}>
              <RotateCcw />
              Ask again in a new session
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PastSessionPage
