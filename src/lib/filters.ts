/**
 * The report's filters — the state a prompt leaves behind.
 *
 * When someone asks "show me the last 30 days" or picks "Show only the
 * Critical incidents", the assistant answers *and* the constraint it applied
 * shows up in the filter bar under the report title, as an ordinary chip the
 * user can change or remove without typing again. Nothing the assistant
 * assumed stays hidden: every report carries a date range by default (its own
 * description names one), so that chip is always present.
 *
 * Two kinds of chip:
 *   - fixed filters (date, severity, region, category), known in advance;
 *   - dimension filters (Application, Policy, User, …), discovered from the
 *     report's own columns and chart categories — so a filter is only ever
 *     offered when something on the canvas can respond to it.
 *
 * Every chip has a scope: all widgets (the default) or a named subset. That is
 * how Advanced Analytics' two tiers — dashboard-level and widget-level — become
 * one model: one place to see and change every filter, and the assistant does
 * the fan-out ("apply last 60 days to widgets 1 and 2").
 *
 * `extractFilters` is the prototype's stand-in for the model's structured
 * output — patterns over the prompt text, given the report's context.
 */

export type DateRange = "24h" | "7d" | "30d" | "60d" | "90d" | "12m"

export const DATE_RANGES: { id: DateRange; label: string }[] = [
  { id: "24h", label: "Last 24 hours" },
  { id: "7d", label: "Last 7 days" },
  { id: "30d", label: "Last 30 days" },
  { id: "60d", label: "Last 60 days" },
  { id: "90d", label: "Last 90 days" },
  { id: "12m", label: "Last 12 months" },
]

export const dateLabel = (id: DateRange) =>
  DATE_RANGES.find((d) => d.id === id)?.label ?? id

export const SEVERITIES = ["Critical", "High", "Medium", "Low"] as const
export type Severity = (typeof SEVERITIES)[number]

export const REGIONS = ["Americas", "EMEA", "APAC"] as const
export type Region = (typeof REGIONS)[number]

/**
 * Application categories, for reports scoped to one (AA's Application
 * Category Dashboard). A required filter on the reports that carry it — it
 * can be changed, not removed — and it doesn't apply to reports that don't.
 */
export const CATEGORIES = [
  "Cloud Storage",
  "Generative AI",
  "Collaboration",
  "Webmail",
  "Technology",
  "Customer Relationship Management",
  "IaaS/PaaS",
] as const
export type Category = (typeof CATEGORIES)[number]

export type FilterKey = "date" | "severity" | "region" | "category"
/** A discovered dimension's chip key: "dim:Application". */
export type DimensionKey = `dim:${string}`
export type ChipKey = FilterKey | DimensionKey

export const dimKey = (name: string): DimensionKey => `dim:${name}`
export const dimName = (key: string): string | undefined =>
  key.startsWith("dim:") ? key.slice(4) : undefined

/** Who set a filter last: the report itself, a prompt, or a click in the bar. */
export type FilterSource = "default" | "ai" | "user"

/** Widget indices (canvas order, 0-based) a chip applies to; absent = all. */
export type Scope = number[]

export type FilterValues = {
  date: DateRange
  severity?: Severity
  region?: Region
  category?: Category
  /** Dimension name → chosen value. "" is a chip waiting for its value. */
  dimensions?: Record<string, string>
}

export type FilterState = {
  values: FilterValues
  sources: Partial<Record<ChipKey, FilterSource>>
  scopes?: Partial<Record<ChipKey, Scope>>
}

export const FILTER_LABELS: Record<FilterKey, string> = {
  date: "Date",
  severity: "Severity",
  region: "Region",
  category: "Category",
}

export const chipLabel = (key: ChipKey): string =>
  dimName(key) ?? FILTER_LABELS[key as FilterKey]

export function chipValue(key: ChipKey, values: FilterValues): string | undefined {
  const name = dimName(key)
  if (name !== undefined) return values.dimensions?.[name]
  if (key === "date") return dateLabel(values.date)
  return values[key as "severity" | "region" | "category"]
}

/**
 * A filter dimension discovered on the report: its name, the values the data
 * holds (most common first) and each value's share of rows — the factor a
 * KPI or trend takes when the filter is applied to it.
 */
export type Dimension = {
  name: string
  values: string[]
  share: Record<string, number>
}

/** What the extractor knows about the report it is reading a prompt for. */
export type FilterContext = {
  dimensions: Dimension[]
  widgets: { index: number; title: string }[]
}

/* -------------------------------- defaults -------------------------------- */

/**
 * The range a report opens with, read off its own description — "over the
 * last 7 days", "30-day trend", "for the last 90 days", "June 2025". Anything
 * that names no period defaults to a week, the most common window here.
 */
export function defaultFilters(
  description: string | undefined,
  /** Dashboard-level filters the report declares beyond its date range. */
  fixed?: { category?: Category }
): FilterState {
  const t = (description ?? "").toLowerCase()
  let date: DateRange = "7d"
  if (/\b(90|ninety)[- ]days?\b/.test(t)) date = "90d"
  else if (/\b(60|sixty)[- ]days?\b/.test(t)) date = "60d"
  else if (/\b(30|thirty)[- ]days?\b|\b(june|jun) 2025\b|\bmonth\b/.test(t)) date = "30d"
  else if (/\b(24|twenty-four)[- ]hours?\b/.test(t)) date = "24h"
  else if (/\b(12|twelve)[- ]months?\b|\byear\b/.test(t)) date = "12m"
  const values: FilterValues = { date }
  const sources: FilterState["sources"] = { date: "default" }
  if (fixed?.category) {
    values.category = fixed.category
    sources.category = "default"
  }
  return { values, sources }
}

/* ------------------------------- extraction ------------------------------- */

/** Ways people refer to a category that aren't its display name. */
const CATEGORY_ALIASES: [RegExp, Category][] = [
  [/\bgen\s?ai\b|\bgenerative\b|\bai apps?\b|\bllms?\b/, "Generative AI"],
  [/\bcrm\b|\bsalesforce\b/, "Customer Relationship Management"],
  [/\biaas\b|\bpaas\b|\bcloud infrastructure\b/, "IaaS/PaaS"],
  [/\bcollab(oration)?\b|\bmessaging\b/, "Collaboration"],
  [/\bweb ?mail\b|\bemail apps?\b/, "Webmail"],
  [/\bstorage\b/, "Cloud Storage"],
]

function matchCategory(t: string): Category | undefined {
  const named = CATEGORIES.find((c) => t.includes(c.toLowerCase()))
  if (named) return named
  return CATEGORY_ALIASES.find(([re]) => re.test(t))?.[1]
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

/** What a prompt asks the filters to do — set some (maybe for a few widgets), or start over. */
export type FilterIntent =
  | { kind: "clear" }
  | { kind: "set"; values: Partial<FilterValues>; scope?: Scope }

/**
 * "widgets 1 and 2", "widget 3", "the first two widgets", or a widget named
 * by its title. Indices are 0-based; anything that names no widget is all.
 */
function extractScope(t: string, ctx?: FilterContext): Scope | undefined {
  const indices = new Set<number>()
  const list = /\bwidgets?\s+((?:#?\d+\s*(?:,|and|&|\s)\s*)*#?\d+)/.exec(t)
  if (list) {
    for (const m of list[1].matchAll(/\d+/g)) indices.add(Number(m[0]) - 1)
  }
  const first = /\b(?:the )?first (\w+) widgets\b/.exec(t)
  if (first) {
    const n = { two: 2, three: 3, four: 4, five: 5 }[first[1]] ?? Number(first[1])
    for (let i = 0; i < (n || 0); i++) indices.add(i)
  }
  for (const w of ctx?.widgets ?? []) {
    if (w.title.length >= 8 && t.includes(w.title.toLowerCase())) indices.add(w.index)
  }
  const max = ctx ? ctx.widgets.length : Infinity
  const valid = [...indices].filter((i) => i >= 0 && i < max).sort((a, b) => a - b)
  return valid.length ? valid : undefined
}

/**
 * Read filter constraints out of a prompt. Returns null when the prompt says
 * nothing about scope, which is most prompts — the bar only changes when the
 * user actually narrowed something.
 *
 * "Next 7 days" is a forecast horizon, not a window over existing data, so it
 * is left alone.
 */
export function extractFilters(prompt: string, ctx?: FilterContext): FilterIntent | null {
  const t = prompt.toLowerCase()

  if (/\b(clear|reset|remove|drop)\b[^.]*\bfilters?\b|\bstart (over|fresh)\b/.test(t))
    return { kind: "clear" }

  const values: Partial<FilterValues> = {}

  if (!/\bnext\b/.test(t)) {
    if (/\b(24[- ]?hours?|today|past day|last day|yesterday)\b/.test(t)) values.date = "24h"
    else if (/\b(90[- ]?days?|quarter|3 months)\b/.test(t)) values.date = "90d"
    else if (/\b(60[- ]?days?|2 months)\b/.test(t)) values.date = "60d"
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

  const category = matchCategory(t)
  if (category) values.category = category

  // Dimensions from the report itself: a value that appears in the prompt
  // ("filter to Google Drive", "only ChatGPT") sets the chip; a dimension named
  // without a value ("add a filter on application") adds the chip, waiting.
  if (ctx) {
    const dims: Record<string, string> = {}
    // A value that lives in several dimensions ("ChatGPT" is an Application
    // and a Site) sets only one — the first dimension that holds it, and the
    // context lists richer dimensions first — otherwise one word would narrow
    // the report twice.
    const claimed = new Map<string, { dim: string; value: string }>()
    for (const dim of ctx.dimensions) {
      const hit = [...dim.values]
        .filter((v) => v.length >= 3)
        .sort((a, b) => b.length - a.length)
        .find((v) => new RegExp(`(?<![\\w@.])${escapeRe(v.toLowerCase())}(?![\\w@.])`).test(t))
      if (hit) {
        if (!claimed.has(hit.toLowerCase()))
          claimed.set(hit.toLowerCase(), { dim: dim.name, value: hit })
        continue
      }
      const named = new RegExp(
        `\\b(?:filter|filters|filtered|chip)\\b[^.]{0,40}\\b${escapeRe(dim.name.toLowerCase())}(?: name)?s?\\b|\\b${escapeRe(dim.name.toLowerCase())}(?: name)?\\s+filter\\b`
      )
      if (named.test(t)) dims[dim.name] = ""
    }
    for (const { dim, value } of claimed.values()) dims[dim] = value
    if (Object.keys(dims).length) values.dimensions = dims
  }

  if (!Object.keys(values).length) return null
  const scope = extractScope(t, ctx)
  return scope ? { kind: "set", values, scope } : { kind: "set", values }
}

/**
 * Is this prompt an instruction to the filters rather than a question about
 * the data? "Apply last 60 days to widgets 1 and 2" wants confirmation;
 * "Why did critical incidents spike this week?" wants an answer (and the
 * filter as a side effect). Questions win when both readings are possible.
 */
export function isFilterCommand(prompt: string): boolean {
  const t = prompt.toLowerCase()
  if (/\b(why|what|which|who|how|compare|forecast|predict|explain|summari[sz]e|break ?down|drill|trend|top \d+)\b|\?/.test(t))
    return false
  return /\b(apply|filter|filters|only|set|switch|change|narrow|limit|restrict|scope|clear|reset|remove|add a|show (?:me )?(?:only|just)|for widgets?)\b/.test(t)
}

/** Which widgets a scope names, as prose: "Weekly Incident Count and Trend of…". */
export function describeScope(scope: Scope | undefined, widgets: { index: number; title: string }[]): string {
  if (!scope) return "every widget"
  const names = scope.map((i) => widgets.find((w) => w.index === i)?.title ?? `widget ${i + 1}`)
  if (names.length === 1) return names[0]
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`
}

/* -------------------------------- mutation -------------------------------- */

const touchedKeys = (values: Partial<FilterValues>): ChipKey[] => [
  ...(Object.keys(values).filter((k) => k !== "dimensions") as FilterKey[]),
  ...Object.keys(values.dimensions ?? {}).map(dimKey),
]

/**
 * Apply an intent to the current state, marking touched filters with `source`.
 * A category only lands on a report that has a category to begin with —
 * "show me the generative AI apps" on the DLP report is a question, not a
 * filter it can honour. A prompt that names widgets scopes what it set to
 * them; one that doesn't applies to all, clearing any earlier scope.
 */
export function applyIntent(
  state: FilterState,
  intent: FilterIntent,
  defaults: FilterState,
  source: FilterSource
): FilterState {
  if (intent.kind === "clear") return defaults
  const next: Partial<FilterValues> = { ...intent.values }
  if (next.category && !defaults.values.category) delete next.category

  const sources = { ...state.sources }
  const scopes = { ...state.scopes }
  for (const key of touchedKeys(next)) {
    sources[key] = source
    if (intent.scope) scopes[key] = intent.scope
    else delete scopes[key]
  }
  const { dimensions, ...rest } = next
  return {
    values: {
      ...state.values,
      ...rest,
      dimensions: { ...state.values.dimensions, ...dimensions },
    },
    sources,
    scopes,
  }
}

/** Set one chip's value from the bar — always user-sourced; scope is kept. */
export function setFilter(state: FilterState, key: ChipKey, value: string): FilterState {
  const name = dimName(key)
  const values: FilterValues = name !== undefined
    ? { ...state.values, dimensions: { ...state.values.dimensions, [name]: value } }
    : { ...state.values, [key]: value }
  return { ...state, values, sources: { ...state.sources, [key]: "user" } }
}

/** Drop an optional chip. Date and category are never removed, only changed. */
export function removeFilter(state: FilterState, key: ChipKey): FilterState {
  const name = dimName(key)
  const values: FilterValues = { ...state.values }
  if (name !== undefined) {
    const dimensions = { ...values.dimensions }
    delete dimensions[name]
    values.dimensions = dimensions
  } else if (key === "severity" || key === "region") {
    delete values[key]
  }
  const sources = { ...state.sources }
  delete sources[key]
  const scopes = { ...state.scopes }
  delete scopes[key]
  return { values, sources, scopes }
}

/** Point a chip at some widgets, or back at all of them (undefined). */
export function setScope(state: FilterState, key: ChipKey, scope: Scope | undefined): FilterState {
  const scopes = { ...state.scopes }
  if (scope && scope.length) scopes[key] = scope
  else delete scopes[key]
  return { ...state, scopes }
}

/** Every chip the bar should show, in a stable order. */
export function activeChips(state: FilterState): ChipKey[] {
  const keys: ChipKey[] = ["date"]
  if (state.values.category) keys.push("category")
  if (state.values.severity) keys.push("severity")
  if (state.values.region) keys.push("region")
  for (const name of Object.keys(state.values.dimensions ?? {})) keys.push(dimKey(name))
  return keys
}

/**
 * The filters one widget actually sees: chips scoped elsewhere fall back to
 * the report's defaults, and pending dimension chips (no value yet) do nothing.
 */
export function effectiveValues(
  state: FilterState,
  defaults: FilterState,
  widgetIndex: number
): FilterValues {
  const applies = (key: ChipKey) => {
    const scope = state.scopes?.[key]
    return !scope || scope.includes(widgetIndex)
  }
  const v = state.values
  const out: FilterValues = {
    date: applies("date") ? v.date : defaults.values.date,
    category: applies("category") ? v.category : defaults.values.category,
  }
  if (v.severity && applies("severity")) out.severity = v.severity
  if (v.region && applies("region")) out.region = v.region
  const dims: Record<string, string> = {}
  for (const [name, value] of Object.entries(v.dimensions ?? {})) {
    if (value && applies(dimKey(name))) dims[name] = value
  }
  if (Object.keys(dims).length) out.dimensions = dims
  return out
}

/** Chips that reach this widget by an explicit scope — what its marker lists. */
export function scopedChipsFor(state: FilterState, widgetIndex: number): ChipKey[] {
  return activeChips(state).filter((key) => state.scopes?.[key]?.includes(widgetIndex))
}

/** True when nothing differs from the report's own defaults. */
export const isDefaultFilters = (state: FilterState, defaults: FilterState) =>
  state.values.date === defaults.values.date &&
  state.values.category === defaults.values.category &&
  !state.values.severity &&
  !state.values.region &&
  Object.keys(state.values.dimensions ?? {}).length === 0 &&
  Object.keys(state.scopes ?? {}).length === 0

/** "Date · Last 60 days (widgets 1, 2), Application · Google Drive" — for the thread. */
export function describeFilters(values: Partial<FilterValues>, scope?: Scope): string {
  const parts: string[] = []
  if (values.date) parts.push(`Date · ${dateLabel(values.date)}`)
  if (values.severity) parts.push(`Severity · ${values.severity}`)
  if (values.region) parts.push(`Region · ${values.region}`)
  if (values.category) parts.push(`Category · ${values.category}`)
  for (const [name, value] of Object.entries(values.dimensions ?? {})) {
    parts.push(value ? `${name} · ${value}` : `${name} · choose a value`)
  }
  const where = scope ? ` (widget${scope.length > 1 ? "s" : ""} ${scope.map((i) => i + 1).join(", ")})` : ""
  return parts.join(", ") + where
}
