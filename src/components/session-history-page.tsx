import * as React from "react"
import { ChevronRight, History, Search } from "lucide-react"

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  KEEP_OPTIONS,
  askedLabel,
  type PastPrompt,
} from "@/data/prompt-history"

type SessionHistoryPageProps = {
  /** The signed-in user's prompts, newest first. */
  prompts: PastPrompt[]
  /** "Keep last N" — one of KEEP_OPTIONS' labels. */
  keep: string
  onKeepChange: (keep: string) => void
  /** Reuse a prompt — the caller decides what "reuse" means. */
  onPickPrompt?: (text: string) => void
}

/**
 * The last N prompts you asked, newest first, where you choose N. The control
 * sits where the date range used to, and replaces it: the history is capped
 * by count, so an old question stays until newer ones push it out, however
 * long ago it was asked.
 */
export function SessionHistoryPage({
  prompts,
  keep,
  onKeepChange,
  onPickPrompt,
}: SessionHistoryPageProps) {
  const [query, setQuery] = React.useState("")

  const keepCount = KEEP_OPTIONS.find((o) => o.label === keep)?.count ?? 20
  const kept = prompts.slice(0, keepCount)
  const q = query.trim().toLowerCase()
  const results = q
    ? kept.filter((p) => p.text.toLowerCase().includes(q))
    : kept

  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      {/* div, not <main> — SidebarInset already renders the page's <main>.
          Same centred max-w-6xl column as every other page, so titles hold
          position as you move through the nav. */}
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-8 py-8">
        {/* Title matches the active nav entry, per the sibling agent pages. */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              Session History
            </h1>
            <p className="text-sm text-muted-foreground">
              Your last {keepCount} prompts, newest first. Pick one to ask it
              again in a new session.
            </p>
          </div>
          {/* Base UI can emit null when a Select is cleared; ignore that and
              keep the current setting rather than falling into an unset
              state. */}
          <Select
            value={keep}
            onValueChange={(value) => value && onKeepChange(value)}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {KEEP_OPTIONS.map((o) => (
                  <SelectItem key={o.label} value={o.label}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <InputGroup>
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupInput
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your prompts…"
          />
        </InputGroup>

        {results.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl bg-card py-16 text-muted-foreground ring-1 ring-foreground/10">
            {q ? (
              <Search className="size-8 opacity-40" />
            ) : (
              <History className="size-8 opacity-40" />
            )}
            {/* Distinguish "your search found nothing" from "you haven't
                asked anything yet" — otherwise clearing the search looks
                broken. */}
            <p className="text-sm">
              {q
                ? `No prompts match “${query.trim()}”`
                : "Prompts you ask will show up here"}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="divide-y divide-border overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
              {results.map((p) => (
                <button
                  key={p.text}
                  onClick={() => onPickPrompt?.(p.text)}
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
              {kept.length} of {keepCount} kept. Only you can see these.
              Once the list is full, each new prompt replaces the oldest.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default SessionHistoryPage
