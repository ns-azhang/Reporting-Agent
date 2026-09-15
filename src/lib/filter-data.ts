import type {
  DonutWidget,
  HBarWidget,
  LineWidget,
  TableWidget,
  Widget,
} from "@/data/report-details"
import {
  REGIONS,
  SEVERITIES,
  type DateRange,
  type FilterValues,
  type Region,
  type Severity,
} from "@/lib/filters"

/**
 * Make the seeded report data answer to the filter bar.
 *
 * There is no backend to re-query, so this derives a filtered view from the
 * report's own figures: a longer window carries proportionally more volume, a
 * severity or region narrows it to that band's share, tables and charts that
 * list severities or regions keep only the matching rows, and trend lines are
 * re-bucketed to the new window (hourly for a day, daily for a week or a month,
 * weekly for a quarter, monthly for a year) with their axis relabelled.
 *
 * Everything is deterministic — the same number under the same filters always
 * becomes the same number — so a figure quoted in a KPI, a table and an insight
 * stays in step. The report's default view is returned untouched.
 */

const RANGE_DAYS: Record<DateRange, number> = {
  "24h": 1,
  "7d": 7,
  "30d": 30,
  "90d": 90,
  "12m": 365,
}

/** How a trend chart buckets each window: bucket width in days, point count. */
const BUCKETS: Record<DateRange, { days: number; points: number }> = {
  "24h": { days: 1 / 24, points: 24 },
  "7d": { days: 1, points: 7 },
  "30d": { days: 1, points: 30 },
  "90d": { days: 7, points: 13 },
  "12m": { days: 365 / 12, points: 12 },
}

/** Rough share of incident volume by band — the usual pyramid. */
const SEVERITY_SHARE: Record<Severity, number> = {
  Critical: 0.12,
  High: 0.28,
  Medium: 0.38,
  Low: 0.22,
}

const REGION_SHARE: Record<Region, number> = {
  Americas: 0.46,
  EMEA: 0.34,
  APAC: 0.2,
}

/** Stable pseudo-random in [0, 1) from a string — FNV-1a, then scaled. */
function hash01(s: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return ((h >>> 0) % 10_000) / 10_000
}

/** A little spread around 1 so scaled figures don't all share one ratio. */
const jitter = (seed: string, spread = 0.08) => 1 + (hash01(seed) * 2 - 1) * spread

type Factors = { date: number; severity: number; region: number }

function factorsFor(values: FilterValues, defaults: FilterValues): Factors {
  return {
    date: RANGE_DAYS[values.date] / RANGE_DAYS[defaults.date],
    severity: values.severity ? SEVERITY_SHARE[values.severity] : 1,
    region: values.region ? REGION_SHARE[values.region] : 1,
  }
}

const product = (f: Factors) => f.date * f.severity * f.region

const isDefaultView = (values: FilterValues, defaults: FilterValues) =>
  values.date === defaults.date && !values.severity && !values.region

/* ----------------------------- number strings ----------------------------- */

// The digit run can't end on a comma, so "40," in prose keeps its comma.
const NUMBER = /^([^\d-]*?)(-?\d(?:[\d,]*\d)?)(\.\d+)?(.*)$/

/**
 * Scale one displayed figure — "147", "56,092", "7,580 KB", "$1.2M" — keeping
 * its prefix, suffix, digit grouping and decimal places. Percentages are
 * shares, not volumes, and pass through unchanged.
 */
export function scaleNumberString(text: string, factor: number): string {
  const m = NUMBER.exec(text.trim())
  if (!m) return text
  const [, prefix, whole, frac = "", suffix] = m
  if (/^\s*%/.test(suffix)) return text

  const original = Number(whole.replace(/,/g, "") + frac)
  if (!Number.isFinite(original) || original === 0) return text

  const scaled = original * factor * jitter(whole + frac)
  const decimals = frac ? frac.length - 1 : 0
  const grouped = whole.includes(",") || Math.abs(scaled) >= 1000
  let n = decimals ? Number(scaled.toFixed(decimals)) : Math.round(scaled)
  // A count that was there shouldn't vanish because the window got narrow.
  if (n === 0 && original > 0) n = decimals ? Number((1 / 10 ** decimals).toFixed(decimals)) : 1

  const out = grouped
    ? n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
    : n.toFixed(decimals)
  return `${prefix}${out}${suffix}`
}

const MONTH_BEFORE = /(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s*$/i
const UNIT_AFTER = /^\s*(?:%|percent|x\b|st\b|nd\b|rd\b|th\b|:|am\b|pm\b|[-–]\s*(?:day|week|hour|month|minute)|\s*(?:day|week|hour|month|minute|yr|year)s?\b)/i
const COUNT_WORD_BEFORE = /(?:top|week|day|q|step|#|no\.|number|page|v|version|rule)\s*$/i

/**
 * Scale the figures quoted in a sentence — "147 DLP incidents across 95
 * objects" — while leaving alone the numbers that aren't volumes: percentages,
 * dates and times, durations ("7 days"), ordinals, ranges ("3–7 users"), years
 * and "top 5".
 */
export function scaleText(text: string, factor: number): string {
  return text.replace(/\$?\d(?:[\d,]*\d)?(?:\.\d+)?/g, (match, offset: number) => {
    const before = text.slice(Math.max(0, offset - 12), offset)
    const after = text.slice(offset + match.length)
    if (/^\d{4}$/.test(match)) return match
    if (/[-–\d.]$/.test(before) || /^[-–]\d|^[-–]\s/.test(after)) return match
    if (MONTH_BEFORE.test(before) || COUNT_WORD_BEFORE.test(before)) return match
    if (UNIT_AFTER.test(after)) return match
    if (/\w$/.test(before)) return match
    return scaleNumberString(match, factor)
  })
}

/* --------------------------------- labels --------------------------------- */

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
const fmtDay = (d: Date) => `${MONTHS[d.getMonth()]} ${d.getDate()}`

/** The date a "Mon D" or ISO label names, if it does; the data is 2026. */
function parseLabel(label: string | undefined): Date | undefined {
  if (!label) return undefined
  const md = /^([A-Z][a-z]{2}) (\d{1,2})$/.exec(label)
  if (md) {
    const m = MONTHS.indexOf(md[1])
    if (m >= 0) return new Date(2026, m, Number(md[2]))
  }
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(label)
  if (iso) return new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]))
  return undefined
}

/** Axis labels for a window, ending where the original series ended. */
function axisLabels(range: DateRange, endLabel: string | undefined): string[] {
  const { points } = BUCKETS[range]
  const end = parseLabel(endLabel) ?? new Date(2026, 6, 19)

  if (range === "24h")
    return Array.from({ length: points }, (_, i) => `${String(i).padStart(2, "0")}:00`)
  if (range === "12m")
    return Array.from({ length: points }, (_, i) => {
      const d = new Date(end.getFullYear(), end.getMonth() - (points - 1 - i), 1)
      return MONTHS[d.getMonth()]
    })
  const step = range === "90d" ? 7 : 1
  return Array.from({ length: points }, (_, i) => {
    const d = new Date(end)
    d.setDate(end.getDate() - (points - 1 - i) * step)
    return fmtDay(d)
  })
}

/* --------------------------------- series --------------------------------- */

/**
 * Stretch or squeeze a series to `n` points, keeping its shape: linear
 * interpolation over the original, with a seeded wobble so a stretched line
 * doesn't read as a polyline through seven points.
 */
function resample(values: number[], n: number, seed: string, scale: number): number[] {
  if (values.length === 0) return []
  const integers = values.every((v) => Number.isInteger(v))
  const last = values.length - 1
  return Array.from({ length: n }, (_, i) => {
    const pos = n === 1 ? last : (i * last) / (n - 1)
    const lo = Math.floor(pos)
    const hi = Math.min(last, Math.ceil(pos))
    const v = values[lo] + (values[hi] - values[lo]) * (pos - lo)
    const out = v * scale * jitter(`${seed}:${i}`, 0.12)
    return integers ? Math.round(out) : Number(out.toFixed(1))
  })
}

const scaleSeries = (values: number[], scale: number, seed: string) => {
  const integers = values.every((v) => Number.isInteger(v))
  return values.map((v, i) => {
    const out = v * scale * jitter(`${seed}:${i}`, 0.04)
    return integers ? Math.round(out) : Number(out.toFixed(1))
  })
}

/* --------------------------------- widgets -------------------------------- */

/**
 * Does this label name the chosen band? "Critical", "critical (12)", … Whole
 * words only — "Allow" is not "Low".
 */
const labelMatches = (label: string, value: string) =>
  new RegExp(`\\b${value}\\b`, "i").test(label)

/**
 * When a chart's categories *are* severities or regions, filtering means
 * keeping the matching ones — and the band's share must not be applied on top,
 * or the surviving slice would be cut twice. Categories that don't name the
 * band at all (policies, apps) just take the share.
 */
function filterByLabels<T extends { label: string }>(
  items: T[],
  values: FilterValues,
  f: Factors
): { items: T[]; factor: number } {
  let kept = items
  let factor = product(f)
  const named = (options: readonly string[]) =>
    options.some((o) => kept.some((i) => labelMatches(i.label, o)))
  if (values.severity && named(SEVERITIES)) {
    const matching = kept.filter((i) => labelMatches(i.label, values.severity!))
    if (matching.length) {
      kept = matching
      factor /= f.severity
    }
  }
  if (values.region && named(REGIONS)) {
    const matching = kept.filter((i) => labelMatches(i.label, values.region!))
    if (matching.length) {
      kept = matching
      factor /= f.region
    }
  }
  return { items: kept, factor }
}

/** Headers whose cells are not volumes, whatever they look like. */
const NON_VOLUME_COLUMN = /%|percent|rating|score|\bid\b|date|week|status|severity|region|rank/i

function filterTable(w: TableWidget, values: FilterValues, f: Factors): TableWidget {
  let rows = w.rows
  let factor = product(f)

  const bandColumn = (test: RegExp) => w.columns.findIndex((c) => test.test(c))
  const sevCol = bandColumn(/severity/i)
  if (values.severity && sevCol >= 0) {
    const kept = rows.filter((r) => labelMatches(r[sevCol] ?? "", values.severity!))
    if (kept.length) {
      rows = kept
      factor /= f.severity
    }
  }
  const regCol = bandColumn(/region/i)
  if (values.region && regCol >= 0) {
    const kept = rows.filter((r) => labelMatches(r[regCol] ?? "", values.region!))
    if (kept.length) {
      rows = kept
      factor /= f.region
    }
  }

  const scalable = w.columns.map((c) => !NON_VOLUME_COLUMN.test(c))
  rows = rows.map((r) =>
    r.map((cell, i) =>
      scalable[i] && /^\$?\d[\d,]*(\.\d+)?(\s*[A-Za-z]+)?$/.test(cell.trim())
        ? scaleNumberString(cell, factor)
        : cell
    )
  )
  return { ...w, rows, insight: scaleText(w.insight, factor) }
}

function filterLine(w: LineWidget, values: FilterValues, defaults: FilterValues, f: Factors): LineWidget {
  const band = f.severity * f.region

  if (values.date === defaults.date) {
    // Same window, narrower band: the shape holds, the level drops.
    const series = w.series.map((s) => ({ ...s, values: scaleSeries(s.values, band, s.name) }))
    const anomalies = w.anomalies?.map((a) => {
      const i = w.series.findIndex((s) => s.values[a.index] === a.value)
      return { ...a, value: series[Math.max(0, i)].values[a.index] }
    })
    return { ...w, series, anomalies, insight: scaleText(w.insight, band) }
  }

  // New window: re-bucket. A point's value scales with how many days its
  // bucket spans relative to the original's, not with the whole window.
  const bucket = BUCKETS[values.date]
  const originalBucketDays = RANGE_DAYS[defaults.date] / Math.max(1, w.xLabels.length)
  const perPoint = (bucket.days / originalBucketDays) * band
  const series = w.series.map((s) => ({
    ...s,
    values: resample(s.values, bucket.points, s.name, perPoint),
  }))
  const named = w.xLabels.filter(Boolean)
  return {
    ...w,
    xLabels: axisLabels(values.date, named[named.length - 1]),
    series,
    // The callouts name dates on the old axis; they don't survive the move.
    anomalies: undefined,
    insight: scaleText(w.insight, perPoint),
  }
}

function filterBars(w: HBarWidget, values: FilterValues, f: Factors): HBarWidget {
  const { items, factor } = filterByLabels(w.bars, values, f)
  return {
    ...w,
    bars: items.map((b) => ({ ...b, value: Math.max(1, Math.round(b.value * factor * jitter(b.label))) })),
    insight: scaleText(w.insight, factor),
  }
}

function filterDonut(w: DonutWidget, values: FilterValues, f: Factors): DonutWidget {
  const { items, factor } = filterByLabels(w.slices, values, f)
  return {
    ...w,
    slices: items.map((s) => ({ ...s, value: Math.max(1, Math.round(s.value * factor * jitter(s.label))) })),
    insight: scaleText(w.insight, factor),
  }
}

/** The widget as it looks under these filters; the default view is itself. */
export function filterWidget(widget: Widget, values: FilterValues, defaults: FilterValues): Widget {
  if (isDefaultView(values, defaults)) return widget
  const f = factorsFor(values, defaults)
  switch (widget.type) {
    case "kpi": {
      const factor = product(f)
      return {
        ...widget,
        kpis: widget.kpis.map((k) => ({ ...k, value: scaleNumberString(k.value, factor) })),
        insight: scaleText(widget.insight, factor),
      }
    }
    case "table":
      return filterTable(widget, values, f)
    case "line":
      return filterLine(widget, values, defaults, f)
    case "hbar":
      return filterBars(widget, values, f)
    case "donut":
      return filterDonut(widget, values, f)
    // Gauges are ratios and the placeholders have nothing to scale.
    default:
      return widget
  }
}
