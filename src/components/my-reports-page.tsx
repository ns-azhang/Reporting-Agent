import * as React from "react"
import { FolderOpen, Search, Star, Users } from "lucide-react"

import { FilterChips } from "@/components/filter-chips"
import { Badge } from "@/components/ui/badge"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { cn } from "@/lib/utils"
import {
  OWNED_REPORTS,
  REPORTS,
  SHARED_ACCESS,
  getReport,
  type Report,
} from "@/data/reports"

const FAVORITE_TAG = "Favorite"

/** An entry in My Reports: either created by the user, or a favourited template. */
type MyReport = Report & {
  owned: boolean
  createdAt?: string
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })

type MyReportsPageProps = {
  onOpenReport?: (report: Report) => void
  favorites: string[]
  onToggleFavorite: (id: string) => void
}

export function MyReportsPage({
  onOpenReport,
  favorites,
  onToggleFavorite,
}: MyReportsPageProps) {
  const [query, setQuery] = React.useState("")
  const [tags, setTags] = React.useState<string[]>([])

  /**
   * Owned reports first, then library reports the user favourited but doesn't
   * own — mirroring the prototype, where starring a template surfaces it here.
   */
  const myReports = React.useMemo<MyReport[]>(() => {
    const owned = OWNED_REPORTS.flatMap(({ id, createdAt }) => {
      const report = getReport(id)
      return report ? [{ ...report, owned: true, createdAt }] : []
    })
    const ownedIds = new Set(owned.map((r) => r.id))
    const favourited = REPORTS.filter(
      (r) => favorites.includes(r.id) && !ownedIds.has(r.id)
    ).map((r) => ({ ...r, owned: false }))
    return [...owned, ...favourited]
  }, [favorites])

  const folderCounts = React.useMemo(() => {
    const counts: Record<string, number> = {}
    for (const report of myReports) {
      counts[report.folder] = (counts[report.folder] ?? 0) + 1
    }
    return counts
  }, [myReports])

  const folders = React.useMemo(
    () => [...new Set(myReports.map((r) => r.folder))],
    [myReports]
  )

  const q = query.trim().toLowerCase()
  const isFiltering = q.length > 0 || tags.length > 0
  const results = myReports.filter((report) => {
    const matchesQuery =
      !q ||
      report.title.toLowerCase().includes(q) ||
      report.desc.toLowerCase().includes(q) ||
      report.folder.toLowerCase().includes(q)

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
      {/* Same centred max-w-6xl column as every other page. */}
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-8 py-8">
        {/* Title matches the active nav entry, per the sibling agent pages. */}
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">My Reports</h1>
          <p className="text-sm text-muted-foreground">
            Reports you created, plus library reports you’ve favorited.
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
              placeholder="Search my reports…"
            />
          </InputGroup>

          <FilterChips
            value={tags}
            onValueChange={setTags}
            options={[
              {
                value: FAVORITE_TAG,
                label: "Favorite",
                count: myReports.filter((r) => favorites.includes(r.id)).length,
                icon: <Star className="size-3.5" />,
              },
              ...folders.map((folder) => ({
                value: folder,
                label: folder,
                count: folderCounts[folder] ?? 0,
              })),
            ]}
          />
        </div>

        {isFiltering && results.length > 0 && (
          <p className="-mb-2 text-sm text-muted-foreground">
            Showing {results.length} of {myReports.length}
          </p>
        )}

        {results.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl bg-card py-16 text-center text-muted-foreground ring-1 ring-foreground/10">
            <FolderOpen className="size-8 opacity-40" />
            {/* Empty because nothing matched vs. empty because there is nothing
                here yet are different problems, so they get different copy. */}
            {isFiltering ? (
              <p className="text-sm">No reports match your filters</p>
            ) : (
              <p className="max-w-xs text-sm">
                Nothing here yet. Favorite a report in the Report Library and it
                will show up here.
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((report) => {
              const isFavorite = favorites.includes(report.id)
              const sharedWith = SHARED_ACCESS[report.id]
              return (
                <div
                  key={report.id}
                  className="group relative flex flex-col gap-2 rounded-xl bg-card p-4 text-card-foreground shadow-xs ring-1 ring-foreground/10 transition-all focus-within:ring-ring hover:ring-ring"
                >
                  {/* Sibling of the open button, not nested — a button inside a
                      button is invalid and the star would navigate. */}
                  <button
                    onClick={() => onToggleFavorite(report.id)}
                    aria-label={
                      isFavorite ? "Remove from favorites" : "Add to favorites"
                    }
                    aria-pressed={isFavorite}
                    className="absolute top-3 right-3 rounded-sm p-1 outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
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
                    <Badge variant={report.owned ? "secondary" : "outline"}>
                      {report.owned ? "Created by you" : "Netskope Library"}
                    </Badge>
                    <Badge variant="outline">{report.folder}</Badge>
                    {sharedWith && (
                      <Badge variant="outline" title={`Shared with ${sharedWith}`}>
                        <Users className="size-3" />
                        Shared
                      </Badge>
                    )}
                  </div>

                  {/* mt-auto pins the date to the bottom of the card, so it
                      lines up across cards whose descriptions wrap to
                      different heights. Grid items stretch to equal height,
                      which is what gives mt-auto something to push against. */}
                  {report.createdAt && (
                    <p className="mt-auto text-xs text-muted-foreground">
                      Created {formatDate(report.createdAt)}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default MyReportsPage
