/**
 * Seeded session history — the prompts carried over from the prototype's
 * HISTORY_ITEMS. Each session is a conversation; the history page lists every
 * user prompt across all of them so any turn can be picked back up.
 */
export type Session = {
  title: string
  when: string
  prompts: string[]
}

export const SESSIONS: Session[] = [
  {
    title: "Critical incidents — last 48 hours",
    when: "Today, 9:14 AM",
    prompts: [
      "Show me only Critical and High severity from the last 48 hours",
      "Which policies are generating Critical incidents?",
      "What is the average resolution time per severity?",
    ],
  },
  {
    title: "PCI exposure across cloud apps",
    when: "Today, 8:02 AM",
    prompts: [
      "Drill into PCI Critical incidents",
      "Which apps are receiving these uploads?",
    ],
  },
  {
    title: "Q1 DLP executive summary",
    when: "Yesterday",
    prompts: [
      "DLP incidents this week",
      "Compare top policies vs. last quarter",
      "Export this as a PDF for leadership",
    ],
  },
  {
    title: "Repeat offenders cohort",
    when: "Yesterday",
    prompts: [
      "Top users with violations",
      "Compare to the same users last month",
      "Show j.morales's incidents in detail",
    ],
  },
  {
    title: "Slack DLP — external workspaces",
    when: "2 days ago",
    prompts: [
      "Sensitive Data Movement to cloud apps",
      "Block recommendation for the top destinations",
    ],
  },
  {
    title: "Source code exfiltration review",
    when: "Apr 21",
    prompts: [
      "Which apps are receiving the source code uploads?",
      "Show users uploading to public GitHub",
    ],
  },
  {
    title: "GDPR scope check",
    when: "Apr 19",
    prompts: [
      "Drill into Customer PII violations",
      "Trend it over the last 30 days",
    ],
  },
]

/** Flattened {prompt, session} rows, in the order the sessions are listed. */
export const SESSION_PROMPTS = SESSIONS.flatMap((session) =>
  session.prompts.map((prompt) => ({ prompt, session }))
)
