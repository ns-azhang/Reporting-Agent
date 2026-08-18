/**
 * Seeded session history, carried over from the prototype's HISTORY_ITEMS.
 *
 * Each session stores its full alternating turns — the user's prompts and the
 * assistant's answers (by responseId) — so resuming rebuilds the actual
 * conversation rather than just dropping you on an empty composer.
 */
export type Turn =
  | { role: "user"; text: string }
  | { role: "ai"; responseId: string }

export type Session = {
  title: string
  /** Human label shown in the list. */
  when: string
  /** Age in days, used by the range filter. Kept in sync with `when`. */
  daysAgo: number
  turns: Turn[]
}

const user = (text: string): Turn => ({ role: "user", text })
const ai = (responseId: string): Turn => ({ role: "ai", responseId })

export const SESSIONS: Session[] = [
  {
    title: "Critical incidents — last 48 hours",
    when: "Today, 9:14 AM",
    daysAgo: 0,
    turns: [
      user("Show me only Critical and High severity from the last 48 hours"),
      ai("critical-only"),
      user("Which policies are generating Critical incidents?"),
      ai("policies-critical"),
      user("What is the average resolution time per severity?"),
      ai("resolution-time-severity"),
    ],
  },
  {
    title: "PCI exposure across cloud apps",
    when: "Today, 8:02 AM",
    daysAgo: 0,
    turns: [
      user("Drill into PCI Critical incidents"),
      ai("policy-detail-pii"),
      user("Which apps are receiving these uploads?"),
      ai("apps-source-code"),
    ],
  },
  {
    title: "Q1 DLP executive summary",
    when: "Yesterday",
    daysAgo: 1,
    turns: [
      user("DLP incidents this week"),
      ai("weekly-overview"),
      user("Compare top policies vs. last quarter"),
      ai("policy-compare-quarter"),
      user("Export this as a PDF for leadership"),
      ai("export-pdf"),
    ],
  },
  {
    title: "Repeat offenders cohort",
    when: "Yesterday",
    daysAgo: 1,
    turns: [
      user("Top users with violations"),
      ai("top-users"),
      user("Compare to the same users last month"),
      ai("users-compare-month"),
      user("Show j.morales's incidents in detail"),
      ai("user-detail-jmorales"),
    ],
  },
  {
    title: "Slack DLP — external workspaces",
    when: "2 days ago",
    daysAgo: 2,
    turns: [
      user("Sensitive Data Movement to cloud apps"),
      ai("destinations"),
      user("Block recommendation for the top destinations"),
      ai("block-recommendation"),
    ],
  },
  {
    title: "Source code exfiltration review",
    when: "12 days ago",
    daysAgo: 12,
    turns: [
      user("Which apps are receiving the source code uploads?"),
      ai("apps-source-code"),
      user("Show users uploading to public GitHub"),
      ai("users-wetransfer"),
    ],
  },
  {
    title: "GDPR scope check",
    when: "26 days ago",
    daysAgo: 26,
    turns: [
      user("Drill into Customer PII violations"),
      ai("policy-detail-pii"),
      user("Trend it over the last 30 days"),
      ai("policy-trend-30d"),
    ],
  },
]

/**
 * Flattened {prompt, session} rows for the history list. Only user turns are
 * listed — each row is a question you asked, and picking one resumes the
 * session it belongs to.
 */
export const SESSION_PROMPTS = SESSIONS.flatMap((session) =>
  session.turns.flatMap((turn) =>
    turn.role === "user" ? [{ prompt: turn.text, session }] : []
  )
)
