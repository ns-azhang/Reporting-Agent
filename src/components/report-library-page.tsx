import * as React from "react"
import { LayoutGrid, Search, Star } from "lucide-react"

import { FilterChips } from "@/components/filter-chips"
import { Badge } from "@/components/ui/badge"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { cn } from "@/lib/utils"
import { REPORTS, REPORT_TAGS, type Report } from "@/data/reports"

const FAVORITE_TAG = "Favorite"

type ReportLibraryPageProps = {
  onOpenReport?: (report: Report) => void
  /** Favourites live in App — My Reports lists whatever is favourited here. */
  favorites: string[]
  onToggleFavorite: (id: string) => void
}

export function ReportLibraryPage({
  onOpenReport,
  favorites,
  onToggleFavorite,
}: ReportLibraryPageProps) {
  const [query, setQuery] = React.useState("")
  const [tags, setTags] = React.useState<string[]>([])

  const q = query.trim().toLowerCase()
  const matchesQuery = React.useCallback(
    (report: Report) =>
      !q ||
      report.title.toLowerCase().includes(q) ||
      report.desc.toLowerCase().includes(q) ||
      report.folder.toLowerCase().includes(q),
    [q]
  )

  // Counts follow the search but not the chips — see the note in My Reports.
  const searched = React.useMemo(() => REPORTS.filter(matchesQuery), [matchesQuery])

  const tagCounts = React.useMemo(() => {
    const counts: Record<string, number> = {}
    for (const report of searched) {
      counts[report.folder] = (counts[report.folder] ?? 0) + 1
    }
    return counts
  }, [searched])

  const results = REPORTS.filter((report) => {
    // No tags selected means "all" — the conventional filter default, so there
    // is no explicit All chip to keep in sync.
    const matchesTags =
      tags.length === 0 ||
      tags.some((tag) =>
        tag === FAVORITE_TAG
          ? favorites.includes(report.id)
          : report.folder === tag
      )

    return matchesQuery(report) && matchesTags
  })

  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      {/* Same centred max-w-6xl column as every other page. */}
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-8 py-8">
        {/* Title matches the active nav entry, per the sibling agent pages.
            The total lives in the subtitle, where it reads as description
            rather than as a stat stranded at the far right of the header. */}
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Report Library
          </h1>
          <p className="text-sm text-muted-foreground">
            {REPORTS.length} prebuilt reports from the Netskope library.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <InputGroup>
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
            <InputGroupInput
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search reports…"
            />
          </InputGroup>

          {/* A chip counting 0 within the current search can only empty the
              list, so it is dropped — except while selected, which would
              otherwise strand a filter the user can no longer see or clear. */}
          <FilterChips
            value={tags}
            onValueChange={setTags}
            options={[
              {
                value: FAVORITE_TAG,
                label: "Favorite",
                count: searched.filter((r) => favorites.includes(r.id)).length,
                icon: <Star className="size-3.5" />,
              },
              ...REPORT_TAGS.map((tag) => ({
                value: tag,
                label: tag,
                count: tagCounts[tag] ?? 0,
              })),
            ].filter((o) => o.count > 0 || tags.includes(o.value))}
          />
        </div>

        {/* Result count sits with the results, and only while a filter is
            actually narrowing them — "11 of 11" says nothing. */}
        {results.length > 0 && results.length < REPORTS.length && (
          <p className="-mb-2 text-sm text-muted-foreground">
            Showing {results.length} of {REPORTS.length}
          </p>
        )}

        {results.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl bg-card py-16 text-muted-foreground ring-1 ring-foreground/10">
            <LayoutGrid className="size-8 opacity-40" />
            <p className="text-sm">No reports match your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((report) => {
              const isFavorite = favorites.includes(report.id)
              return (
                <div
                  key={report.id}
                  className="group relative flex flex-col gap-2 rounded-xl bg-card p-4 text-card-foreground shadow-xs ring-1 ring-foreground/10 transition-all focus-within:ring-ring hover:ring-ring"
                >
                  {/* Favourite sits outside the open-report button so the two
                      actions don't nest — a button inside a button is invalid
                      and the star would trigger navigation. */}
                  <button
                    onClick={() => onToggleFavorite(report.id)}
                    aria-label={
                      isFavorite ? "Remove from favorites" : "Add to favorites"
                    }
                    aria-pressed={isFavorite}
                    className="absolute top-3 right-3 rounded-sm p-1 outline-none transition-colors focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-3"
                  >
                    <Star
                      className={cn(
                        "size-4 transition-colors",
                        isFavorite
                          ? "fill-amber-400 text-amber-400"
                          : "text-muted-foreground/40 hover:text-muted-foreground"
                      )}
                    />
                  </button>

                  <button
                    onClick={() => onOpenReport?.(report)}
                    className="flex flex-col items-start gap-2 pr-8 text-left outline-none"
                  >
                    <span className="text-sm font-semibold leading-snug">
                      {report.title}
                    </span>
                    <span className="text-xs leading-snug text-muted-foreground">
                      {report.desc}
                    </span>
                  </button>

                  {/* mt-auto pins the pills to the bottom of the card so they
                      line up across a row whose descriptions wrap to different
                      line counts. Grid items already stretch to equal height,
                      which is what gives mt-auto something to push against. */}
                  <div className="mt-auto flex flex-wrap items-center gap-1.5">
                    <Badge variant="secondary">Netskope Library</Badge>
                    <Badge variant="outline">{report.folder}</Badge>
                    {isFavorite && <Badge variant="outline">Favorite</Badge>}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default ReportLibraryPage
