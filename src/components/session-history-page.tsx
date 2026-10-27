import { ChevronRight, History } from "lucide-react"

import {
  HISTORY_LIMIT,
  askedLabel,
  type PastPrompt,
} from "@/data/prompt-history"

type SessionHistoryPageProps = {
  /** The signed-in user's prompts, newest first. */
  prompts: PastPrompt[]
  /** Open a prompt — the caller decides what opening one shows. */
  onPickPrompt?: (prompt: PastPrompt) => void
}

/**
 * The last HISTORY_LIMIT prompts you asked, newest first. No date range and
 * no search: the list is short and capped by count, so an old question stays
 * until newer ones push it out, however long ago it was asked.
 */
export function SessionHistoryPage({
  prompts,
  onPickPrompt,
}: SessionHistoryPageProps) {
  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      {/* div, not <main> — SidebarInset already renders the page's <main>.
          Same centred max-w-6xl column as every other page, so titles hold
          position as you move through the nav. */}
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-8 py-8">
        {/* Title matches the active nav entry, per the sibling agent pages. */}
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Session History
          </h1>
          <p className="text-sm text-muted-foreground">
            Your last {HISTORY_LIMIT} prompts, newest first. Open one to see
            what the agent answered.
          </p>
        </div>

        {prompts.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl bg-card py-16 text-muted-foreground ring-1 ring-foreground/10">
            <History className="size-8 opacity-40" />
            <p className="text-sm">Prompts you ask will show up here</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="divide-y divide-border overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
              {prompts.map((p) => (
                <button
                  key={p.text}
                  onClick={() => onPickPrompt?.(p)}
                  className="group flex w-full items-center gap-4 px-5 py-3.5 text-left transition-colors outline-none hover:bg-muted focus-visible:bg-muted"
                >
                  <History className="size-4 shrink-0 text-muted-foreground" />
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="truncate text-sm">{p.text}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {askedLabel(p.askedAt)}
                    </span>
                  </span>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                </button>
              ))}
            </div>
            {/* Say how the list is kept, so a short list doesn't read as
                "older ones expired" and a full one explains the drop-off. */}
            <p className="text-xs text-muted-foreground">
              Only you can see these. Each new prompt replaces the oldest.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default SessionHistoryPage
