import type { Widget } from "@/data/report-details"
import { REGIONS, SEVERITIES, type Dimension } from "@/lib/filters"

/**
 * Discover what a report can be filtered by, from the report itself.
 *
 * A table column headed "Application" or a bar chart of "Top Policies" is a
 * filter waiting to happen — its distinct values are the options. Reading
 * them off the widgets means "+ Add filter" only ever offers dimensions that
 * something on the canvas responds to, and the assistant only ever sets ones
 * that exist. Column headers are normalised to a handful of names so "Policy
 * Name" and "Top Policies" both become Policy.
 */

/** Header (or chart title) patterns → the dimension they stand for. */
const COLUMN_DIMENSIONS: [RegExp, string][] = [
  [/^(application|app)$/i, "Application"],
  [/^polic(y|ies)( name)?$/i, "Policy"],
  [/^(user|users|top users)$/i, "User"],
  [/^(?!.*severity).*status$/i, "Status"],
  [/^action$/i, "Action"],
  [/^activity$/i, "Activity"],
  [/^dlp rule$/i, "DLP rule"],
  [/^site$/i, "Site"],
  [/instance/i, "Instance"],
  [/^organization unit/i, "Org unit"],
  [/^type( of sensitive data)?$/i, "Type"],
  [/indicator$/i, "Indicator"],
  [/^category$/i, "Category"],
]

/** Chart titles that say what their categories are. */
const TITLE_DIMENSIONS: [RegExp, string][] = [
  [/\bpolic(y|ies)\b/i, "Policy"],
  [/\b(applications?|apps?)\b/i, "Application"],
  [/\busers?\b/i, "User"],
  [/\brules?\b/i, "DLP rule"],
  [/\bactivit(y|ies)\b/i, "Activity"],
  [/\bactions?\b/i, "Action"],
  [/\bcategor(y|ies)\b/i, "Category"],
]

export const dimensionOfColumn = (header: string): string | undefined =>
  COLUMN_DIMENSIONS.find(([re]) => re.test(header.trim()))?.[1]

export const dimensionOfTitle = (title: string | undefined): string | undefined =>
  title ? TITLE_DIMENSIONS.find(([re]) => re.test(title))?.[1] : undefined

/** Bands the fixed filters already cover; a chart of these isn't a dimension. */
const FIXED_BANDS = new Set<string>(
  [...SEVERITIES, ...REGIONS, "excellent", "high", "medium", "low", "poor", "Managed", "Unmanaged"].map((s) =>
    s.toLowerCase()
  )
)

/** A cell that is a value, not a number, a blank or a placeholder. */
const isCategorical = (cell: string) =>
  cell.trim().length > 0 &&
  !/^[∅\-–—]/.test(cell.trim()) &&
  !/^\$?\d[\d,]*(\.\d+)?(\s*[A-Za-z%]+)?$/.test(cell.trim()) &&
  !/^\d{4}-\d{2}-\d{2}$/.test(cell.trim())

const MAX_VALUES = 8

/**
 * The dimensions a report offers, most useful first: the ones with more
 * distinct values, then alphabetical. `exclude` drops dimensions another
 * chip already owns (Category on the category-scoped report).
 */
export function deriveDimensions(widgets: Widget[], exclude: string[] = []): Dimension[] {
  const counts = new Map<string, Map<string, number>>()
  const bump = (dim: string, value: string, by = 1) => {
    if (exclude.includes(dim)) return
    const v = value.trim()
    if (!isCategorical(v) || FIXED_BANDS.has(v.toLowerCase())) return
    const m = counts.get(dim) ?? new Map<string, number>()
    m.set(v, (m.get(v) ?? 0) + by)
    counts.set(dim, m)
  }

  for (const w of widgets) {
    if (w.type === "table") {
      w.columns.forEach((header, i) => {
        const dim = dimensionOfColumn(header)
        if (!dim) return
        for (const row of w.rows) bump(dim, row[i] ?? "")
      })
    } else if (w.type === "hbar" || w.type === "donut") {
      const dim = dimensionOfTitle(w.title)
      if (!dim) continue
      const items = w.type === "hbar" ? w.bars : w.slices
      // Weighted by value so a policy with 3,720 alerts outranks one with 5.
      for (const item of items) bump(dim, item.label, Math.max(1, item.value))
    }
  }

  const dims: Dimension[] = []
  for (const [name, m] of counts) {
    if (m.size < 2) continue
    const total = [...m.values()].reduce((a, b) => a + b, 0)
    const values = [...m.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, MAX_VALUES)
      .map(([v]) => v)
    const share: Record<string, number> = {}
    for (const v of values) share[v] = Math.max(0.05, (m.get(v) ?? 0) / total)
    dims.push({ name, values, share })
  }
  return dims.sort((a, b) => b.values.length - a.values.length || a.name.localeCompare(b.name))
}
