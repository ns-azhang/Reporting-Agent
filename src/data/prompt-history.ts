/**
 * Session History, as the PM settled it: the prompts you asked, not whole
 * conversations, kept per user and capped by count rather than by age.
 *
 * Count, not time, because reporting admins schedule their reports and leave.
 * A 30-day window would be empty for someone back after six weeks, which is
 * exactly when their old questions are worth reusing; the last X are always
 * there however long the gap. The seed reaches past 30 days to show that.
 */

/** How many prompts a user keeps. Asking past it drops the oldest. */
export const HISTORY_LIMIT = 20

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
  ].slice(0, HISTORY_LIMIT)
}

/** "Today, 9:14 AM" / "Yesterday" / "12 days ago" / "6 weeks ago". */
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
  return `${Math.floor(days / 7)} weeks ago`
}
