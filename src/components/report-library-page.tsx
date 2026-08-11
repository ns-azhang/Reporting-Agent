import * as React from "react"
import { LayoutGrid, Search, Star, X } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn } from "@/lib/utils"
import { REPORTS, REPORT_TAGS, type Report } from "@/data/reports"

const FAVORITE_TAG = "Favorite"

/**
 * Filter chip styling, matching the Aurora product's pattern:
 * unselected is a flat grey fill with muted text and no border; selected is a
 * solid dark fill with light text. The stock Toggle only shifts to bg-muted
 * when pressed, which reads as barely-changed next to Aurora's chips.
 *
 * Base UI drives this off `aria-pressed` — the `data-[state=on]` selector in
 * toggle-group.tsx is dead Radix leftover and never matches.
 */
const CHIP =
  "rounded-md border-0 bg-muted px-3 text-muted-foreground shadow-none " +
  "hover:bg-muted/70 hover:text-foreground " +
  "aria-pressed:bg-primary aria-pressed:text-primary-foreground " +
  "aria-pressed:hover:bg-primary/90"

type ReportLibraryPageProps = {
  onOpenReport?: (report: Report) => void
}

export function ReportLibraryPage({ onOpenReport }: ReportLibraryPageProps) {
  const [query, setQuery] = React.useState("")
  const [tags, setTags] = React.useState<string[]>([])
  const [favorites, setFavorites] = React.useState<string[]>([])

  const toggleFavorite = (id: string) =>
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    )

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
      {/* Same centred 896px column as the other pages. */}
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-8 py-8">
        {/* Title matches the active nav entry, per the sibling agent pages. */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              Report Library
            </h1>
            <p className="text-sm text-muted-foreground">
              Prebuilt reports from the Netskope library.
            </p>
          </div>
          <span className="shrink-0 pt-1 text-sm text-muted-foreground">
            {results.length} of {REPORTS.length}
          </span>
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

          {/* ToggleGroup rather than looped buttons with manual active state —
              this is a multi-select option set.
              Base UI uses `multiple`, not Radix's type="multiple". */}
          <div className="flex flex-wrap items-center gap-2">
            <ToggleGroup
              multiple
              size="sm"
              value={tags}
              onValueChange={(value) => setTags(value)}
              className="flex-wrap justify-start"
            >
              <ToggleGroupItem value={FAVORITE_TAG} className={CHIP}>
                <Star className="size-3.5" />
                <span className="font-semibold">{favorites.length}</span>
                Favorite
              </ToggleGroupItem>
              {REPORT_TAGS.map((tag) => (
                <ToggleGroupItem key={tag} value={tag} className={CHIP}>
                  <span className="font-semibold">{tagCounts[tag] ?? 0}</span>
                  {tag}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>

            {/* Only offered when there's something to clear, so it isn't a
                permanently dead control. */}
            {tags.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTags([])}
                className="text-muted-foreground"
              >
                <X />
                Clear
              </Button>
            )}
          </div>
        </div>

        {results.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl bg-card py-16 text-muted-foreground ring-1 ring-foreground/10">
            <LayoutGrid className="size-8 opacity-40" />
            <p className="text-sm">No reports match your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                    onClick={() => toggleFavorite(report.id)}
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
