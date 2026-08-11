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

  // Absolute counts per chip, like Aurora's "4 Crit + high". Deliberately not
  // narrowed by the other active filters, so the numbers stay stable as you
  // toggle chips rather than shifting under the cursor.
  const tagCounts = React.useMemo(() => {
    const counts: Record<string, number> = {}
    for (const report of REPORTS) {
      counts[report.folder] = (counts[report.folder] ?? 0) + 1
    }
    return counts
  }, [])

  const q = query.trim().toLowerCase()
  const isFiltering = q.length > 0 || tags.length > 0
  const results = REPORTS.filter((report) => {
    const matchesQuery =
      !q ||
      report.title.toLowerCase().includes(q) ||
      report.desc.toLowerCase().includes(q) ||
      report.folder.toLowerCase().includes(q)

    // No tags selected means "all" — the conventional filter default, so there
    // is no explicit All chip to keep in sync.
    const matchesTags =
      tags.length === 0 ||
      tags.some((tag) =>
        tag === FAVORITE_TAG
          ? favorites.includes(report.id)
          : report.folder === tag
      )

    return matchesQuery && matchesTags
  })

  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      {/* Wider than Session History: card grids want columns; a list of rows
            wants a narrow measure. */}
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

          <FilterChips
            value={tags}
            onValueChange={setTags}
            options={[
              {
                value: FAVORITE_TAG,
                label: "Favorite",
                count: favorites.length,
                icon: <Star className="size-3.5" />,
              },
              ...REPORT_TAGS.map((tag) => ({
                value: tag,
                label: tag,
                count: tagCounts[tag] ?? 0,
              })),
            ]}
          />
        </div>

        {/* Result count sits with the results, and only while a filter is
            actually narrowing them — "11 of 11" says nothing. */}
        {isFiltering && results.length > 0 && (
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

                  <div className="flex flex-wrap items-center gap-1.5">
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
