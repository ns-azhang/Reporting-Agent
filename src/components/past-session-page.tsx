import { Lock } from "lucide-react"

import { Conversation } from "@/components/conversation"
import { Badge } from "@/components/ui/badge"
import { askedLabel, type PastSession } from "@/data/prompt-history"

type PastSessionPageProps = {
  session: PastSession
  /** Follow the report link when the prompt opened a report. */
  onOpenReport?: (reportId: string) => void
}

/**
 * A session from the sidebar's Recent list that has gone past LIVE_FOR_MS,
 * to read but not continue. The header only states facts; why it is closed
 * sits in a bar where the composer would be, since
 * that is where you'd try to keep asking — and it stays pinned there however
 * far the thread scrolls.
 */
export function PastSessionPage({
  session,
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
            Last asked {askedLabel(session.askedAt, undefined, true)}
          </p>
        </div>

        <Conversation
          turns={session.turns}
          readOnly
          onOpenReport={onOpenReport}
        />

        {/* In place of the composer: a bar, not a greyed-out box — there is
            nothing to type, so nothing should look typeable. Pinned like the
            live composer so the state is always on screen. */}
        <div className="sticky bottom-0 -mb-8 bg-background pt-2 pb-8">
          <div className="flex flex-wrap items-center gap-3 rounded-md border border-input bg-muted/50 px-4 py-3">
            <Lock className="size-4 shrink-0 text-muted-foreground" />
            <p className="min-w-0 flex-1 text-sm text-muted-foreground">
              This session closed 24 hours after its last prompt.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PastSessionPage
