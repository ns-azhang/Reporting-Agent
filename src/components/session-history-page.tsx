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
import { SESSION_PROMPTS, type Session } from "@/data/sessions"

/** Recency filter. The label doubles as the Select value, because Base UI's
    Select.Value renders the raw value rather than the item's children. */
const RANGES = [
  { label: "Last 1 day", days: 1 },
  { label: "Last 3 days", days: 3 },
  { label: "Last 7 days", days: 7 },
  { label: "Last 30 days", days: 30 },
] as const

const DEFAULT_RANGE = "Last 30 days"

type SessionHistoryPageProps = {
  /** Resume a session — the caller decides what "resume" means. */
  onPickSession?: (session: Session) => void
}

export function SessionHistoryPage({ onPickSession }: SessionHistoryPageProps) {
  const [query, setQuery] = React.useState("")
  const [range, setRange] = React.useState<string>(DEFAULT_RANGE)

  const q = query.trim().toLowerCase()
  const maxAge = RANGES.find((r) => r.label === range)?.days ?? 30
  const results = SESSION_PROMPTS.filter(({ prompt, session }) => {
    if (session.daysAgo > maxAge) return false
    if (!q) return true
    return (
      prompt.toLowerCase().includes(q) || session.title.toLowerCase().includes(q)
    )
  })

  const rangeLabel = range.toLowerCase()

  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      {/* Narrower than the dashboard pages on purpose: this is a list of text
          rows, and a full-width column strands the timestamp and chevron far
          from the prompt they belong to. */}
      {/* div, not <main> — SidebarInset already renders the page's <main>.
          mx-auto centres the column: full width strands the timestamp and
          chevron away from the prompt they describe. */}
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-8 py-8">
        {/* Title matches the active nav entry, per the sibling agent pages. */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              Session History
            </h1>
            <p className="text-sm text-muted-foreground">
              Click any prompt to pick up that conversation where you left off.
            </p>
          </div>
          {/* Base UI can emit null when a Select is cleared; ignore that and
              keep the current range rather than falling into an unset state. */}
          <Select
            value={range}
            onValueChange={(value) => value && setRange(value)}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {RANGES.map((r) => (
                  <SelectItem key={r.label} value={r.label}>
                    {r.label}
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
            placeholder="Search session history…"
          />
        </InputGroup>

        {results.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl bg-card py-16 text-muted-foreground ring-1 ring-foreground/10">
            <Search className="size-8 opacity-40" />
            {/* Distinguish "your search found nothing" from "the range is
                empty" — otherwise clearing the search looks broken. */}
            <p className="text-sm">
              {q
                ? `No sessions match “${query.trim()}” in the ${rangeLabel}`
                : `No sessions in the ${rangeLabel}`}
            </p>
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
      </div>
    </div>
  )
}

export default SessionHistoryPage
