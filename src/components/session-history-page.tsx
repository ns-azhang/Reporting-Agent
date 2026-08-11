import * as React from "react"
import { ChevronRight, History, Search } from "lucide-react"

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { SESSION_PROMPTS, type Session } from "@/data/sessions"

type SessionHistoryPageProps = {
  /** Resume a session — the caller decides what "resume" means. */
  onPickSession?: (session: Session) => void
}

export function SessionHistoryPage({ onPickSession }: SessionHistoryPageProps) {
  const [query, setQuery] = React.useState("")

  const q = query.trim().toLowerCase()
  const results = q
    ? SESSION_PROMPTS.filter(
        ({ prompt, session }) =>
          prompt.toLowerCase().includes(q) ||
          session.title.toLowerCase().includes(q)
      )
    : SESSION_PROMPTS

  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      <main className="flex w-full flex-1 flex-col gap-6 px-8 py-8">
        {/* Title matches the active nav entry, per the sibling agent pages. */}
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Session History
          </h1>
          <p className="text-sm text-muted-foreground">
            Click any prompt to pick up that conversation where you left off.
          </p>
        </div>

        <InputGroup className="max-w-md">
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupInput
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search session history…"
          />
        </InputGroup>

        {results.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl bg-card py-16 text-muted-foreground ring-1 ring-foreground/10">
            <Search className="size-8 opacity-40" />
            <p className="text-sm">No sessions match “{query.trim()}”</p>
          </div>
        ) : (
          <div className="divide-y divide-border overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
            {results.map(({ prompt, session }, i) => (
              <button
                key={`${session.title}-${i}`}
                onClick={() => onPickSession?.(session)}
                className="group flex w-full items-center gap-4 px-5 py-3.5 text-left outline-none transition-colors hover:bg-muted focus-visible:bg-muted"
              >
                <History className="size-4 shrink-0 text-muted-foreground" />
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="truncate text-sm">{prompt}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {session.title} · {session.when}
                  </span>
                </span>
                <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default SessionHistoryPage
