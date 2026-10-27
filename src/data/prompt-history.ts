/**
 * Session History, as the PM settled it: the prompts you asked, not whole
 * conversations, kept per user and capped by count rather than by age.
 *
 * Count, not time, because reporting admins schedule their reports and leave.
 * A 30-day window would be empty for someone back after six weeks, which is
 * exactly when their old questions are worth reusing; the last X are always
 * there however long the gap. The seed reaches past 30 days to show that.
 */

/**
 * How many prompts a user can choose to keep. Asking past it drops the oldest.
 * The labels double as Select values, because Base UI's Select.Value renders
 * the raw value rather than the item's children.
 */
export const KEEP_OPTIONS = [
  { label: "Keep last 10", count: 10 },
  { label: "Keep last 20", count: 20 },
  { label: "Keep last 50", count: 50 },
] as const

export const DEFAULT_KEEP = "Keep last 20"

/**
 * The most any setting keeps. History is stored up to this and the chosen
 * setting decides how much of it shows, so trying a smaller number in the
 * prototype doesn't throw the rest away.
 */
export const HISTORY_MAX = Math.max(...KEEP_OPTIONS.map((o) => o.count))

export type PastPrompt = {
  text: string
  askedAt: Date
}

const ago = (days: number, hours = 0) =>
  new Date(Date.now() - (days * 24 + hours) * 60 * 60 * 1000)

/** Kevin Flyn's history, newest first. */
export const SEEDED_PROMPTS: PastPrompt[] = [
  {
    text: "Show me only Critical and High severity from the last 48 hours",
    askedAt: ago(0, 1),
  },
  {
    text: "Which policies are generating Critical incidents?",
    askedAt: ago(0, 2),
  },
  { text: "Drill into PCI Critical incidents", askedAt: ago(0, 3) },
  { text: "DLP incidents this week", askedAt: ago(1, 2) },
  { text: "Compare top policies vs. last quarter", askedAt: ago(1, 3) },
  { text: "Top users with violations", askedAt: ago(1, 5) },
  { text: "Sensitive Data Movement to cloud apps", askedAt: ago(2, 4) },
  {
    text: "Which apps are receiving the source code uploads?",
    askedAt: ago(12),
  },
  { text: "Drill into Customer PII violations", askedAt: ago(26) },
  { text: "Risky AI app usage by department this month", askedAt: ago(38) },
  {
    text: "Which users uploaded to personal cloud storage last month?",
    askedAt: ago(45),
  },
  { text: "Malware detections by app over the last 90 days", askedAt: ago(61) },
  { text: "Shadow IT apps discovered this quarter", askedAt: ago(64) },
  { text: "Top blocked web categories by office", askedAt: ago(67) },
  { text: "Users with the most policy overrides", askedAt: ago(70) },
  { text: "Unsanctioned AI apps with file uploads", askedAt: ago(74) },
  { text: "Incidents by severity, month over month", askedAt: ago(78) },
  { text: "Which devices are missing the Netskope client?", askedAt: ago(83) },
  { text: "Compare DLP incidents in EMEA vs. North America", askedAt: ago(89) },
  { text: "Data exfiltration attempts to personal email", askedAt: ago(96) },
  { text: "Policy changes made in the last quarter", askedAt: ago(103) },
  { text: "Top risky users for the board report", askedAt: ago(110) },
  { text: "Cloud apps with the lowest CCL ratings in use", askedAt: ago(118) },
  { text: "Threat detections by type this year", askedAt: ago(125) },
  { text: "Which teams share the most files externally?", askedAt: ago(133) },
]

/**
 * Add a prompt to the top of a history. Asking the same thing again moves it
 * up rather than listing it twice, so the cap counts distinct questions.
 */
export function addPrompt(history: PastPrompt[], text: string): PastPrompt[] {
  const key = text.trim().toLowerCase()
  return [
    { text: text.trim(), askedAt: new Date() },
    ...history.filter((p) => p.text.toLowerCase() !== key),
  ].slice(0, HISTORY_MAX)
}

/** "Today, 9:14 AM" / "Yesterday" / "12 days ago" / "6 weeks ago" /
    "3 months ago". */
export function askedLabel(askedAt: Date, now = new Date()): string {
  const startOfDay = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  const days = Math.round((startOfDay(now) - startOfDay(askedAt)) / 86_400_000)
  if (days <= 0) {
    const time = askedAt.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    })
    return `Today, ${time}`
  }
  if (days === 1) return "Yesterday"
  if (days < 28) return `${days} days ago`
  if (days < 60) return `${Math.floor(days / 7)} weeks ago`
  return `${Math.floor(days / 30)} months ago`
}
