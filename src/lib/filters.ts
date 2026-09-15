/**
 * The report's global filters — the state a prompt leaves behind.
 *
 * When someone asks "show me the last 30 days" or picks "Show only the
 * Critical incidents", the assistant answers *and* the constraint it applied
 * shows up in the filter bar under the report title, as an ordinary chip the
 * user can change or remove without typing again. Nothing the assistant
 * assumed stays hidden: every report carries a date range by default (its own
 * description names one), so that chip is always present.
 *
 * `extractFilters` is the prototype's stand-in for the model's structured
 * output — a few patterns over the prompt text. The real thing would return
 * the same shape alongside the answer.
 */

export type DateRange = "24h" | "7d" | "30d" | "90d" | "12m"

export const DATE_RANGES: { id: DateRange; label: string }[] = [
  { id: "24h", label: "Last 24 hours" },
  { id: "7d", label: "Last 7 days" },
  { id: "30d", label: "Last 30 days" },
  { id: "90d", label: "Last 90 days" },
  { id: "12m", label: "Last 12 months" },
]

export const dateLabel = (id: DateRange) =>
  DATE_RANGES.find((d) => d.id === id)?.label ?? id

export const SEVERITIES = ["Critical", "High", "Medium", "Low"] as const
export type Severity = (typeof SEVERITIES)[number]

export const REGIONS = ["Americas", "EMEA", "APAC"] as const
export type Region = (typeof REGIONS)[number]

export type FilterKey = "date" | "severity" | "region"

/** Who set a filter last: the report itself, a prompt, or a click in the bar. */
export type FilterSource = "default" | "ai" | "user"

export type FilterValues = {
  date: DateRange
  severity?: Severity
  region?: Region
}

export type FilterState = {
  values: FilterValues
  sources: Partial<Record<FilterKey, FilterSource>>
}

export const FILTER_LABELS: Record<FilterKey, string> = {
  date: "Date",
  severity: "Severity",
  region: "Region",
}

export function filterValueLabel(key: FilterKey, values: FilterValues): string | undefined {
  if (key === "date") return dateLabel(values.date)
  return values[key]
}

/**
 * The range a report opens with, read off its own description — "over the
 * last 7 days", "30-day trend", "for the last 90 days", "June 2025". Anything
 * that names no period defaults to a week, the most common window here.
 */
export function defaultFilters(description: string | undefined): FilterState {
  const t = (description ?? "").toLowerCase()
  let date: DateRange = "7d"
  if (/\b(90|ninety)[- ]days?\b/.test(t)) date = "90d"
  else if (/\b(30|thirty)[- ]days?\b|\b(june|jun) 2025\b|\bmonth\b/.test(t)) date = "30d"
  else if (/\b(24|twenty-four)[- ]hours?\b/.test(t)) date = "24h"
  else if (/\b(12|twelve)[- ]months?\b|\byear\b/.test(t)) date = "12m"
  return { values: { date }, sources: { date: "default" } }
}

/** What a prompt asks the filters to do — set some, or start over. */
export type FilterIntent =
  | { kind: "clear" }
  | { kind: "set"; values: Partial<FilterValues> }

/**
 * Read filter constraints out of a prompt. Returns null when the prompt says
 * nothing about scope, which is most prompts — the bar only changes when the
 * user actually narrowed something.
 *
 * "Next 7 days" is a forecast horizon, not a window over existing data, so it
 * is left alone.
 */
export function extractFilters(prompt: string): FilterIntent | null {
  const t = prompt.toLowerCase()

  if (/\b(clear|reset|remove|drop)\b[^.]*\bfilters?\b|\bstart (over|fresh)\b/.test(t))
    return { kind: "clear" }

  const values: Partial<FilterValues> = {}

  if (!/\bnext\b/.test(t)) {
    if (/\b(24[- ]?hours?|today|past day|last day|yesterday)\b/.test(t)) values.date = "24h"
    else if (/\b(90[- ]?days?|quarter|3 months)\b/.test(t)) values.date = "90d"
    else if (/\b(12[- ]?months?|year)\b/.test(t)) values.date = "12m"
    else if (/\b(30[- ]?days?|month)\b/.test(t)) values.date = "30d"
    else if (/\b(7[- ]?days?|week)\b/.test(t)) values.date = "7d"
  }

  // A severity word on its own ("high volume") isn't a filter; it has to be
  // used as one — "critical incidents", "only the high ones", "severity: low".
  const sev =
    /\b(critical|high|medium|low)(?=[- ](?:severity|incidents?|alerts?|events?|violations?|only|ones)\b)/.exec(t) ??
    /\bonly (?:the )?(critical|high|medium|low)\b/.exec(t) ??
    /\bseverity\W+(?:is |= |of |to )?(critical|high|medium|low)\b/.exec(t)
  if (sev) {
    const word = sev[1]
    values.severity = (word[0].toUpperCase() + word.slice(1)) as Severity
  }

  const region = /\b(emea|europe|apac|asia|americas|north america|us|usa)\b/.exec(t)
  if (region) {
    const word = region[1]
    values.region =
      word === "emea" || word === "europe"
        ? "EMEA"
        : word === "apac" || word === "asia"
          ? "APAC"
          : "Americas"
  }

  return Object.keys(values).length ? { kind: "set", values } : null
}

/** Apply an intent to the current state, marking touched filters with `source`. */
export function applyIntent(
  state: FilterState,
  intent: FilterIntent,
  defaults: FilterState,
  source: FilterSource
): FilterState {
  if (intent.kind === "clear") return defaults
  const sources = { ...state.sources }
  for (const key of Object.keys(intent.values) as FilterKey[]) sources[key] = source
  return { values: { ...state.values, ...intent.values }, sources }
}

/** True when nothing differs from the report's own defaults. */
export const isDefaultFilters = (state: FilterState, defaults: FilterState) =>
  state.values.date === defaults.values.date &&
  !state.values.severity &&
  !state.values.region

/** "Date · Last 30 days, Severity · Critical" — for the note in the thread. */
export function describeFilters(values: Partial<FilterValues>): string {
  const parts: string[] = []
  if (values.date) parts.push(`Date · ${dateLabel(values.date)}`)
  if (values.severity) parts.push(`Severity · ${values.severity}`)
  if (values.region) parts.push(`Region · ${values.region}`)
  return parts.join(", ")
}
