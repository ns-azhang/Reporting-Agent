/**
 * The clarifying-questions wizard, carried over from the prototype's
 * CLARIFY_WIZARD.
 *
 * A prompt that bundles several questions gets one widget each — but the scope
 * those widgets share has to be pinned down first, so the assistant asks
 * before generating rather than guessing and being wrong three times over.
 */

export type ClarifyOption = {
  label: string
  desc: string
  /** Flagged as the sensible default; still just an option. */
  recommended?: boolean
}

export type ClarifyStep = {
  question: string
  /** Shown as the lead-in to the next step once this one is answered. */
  ack: string
  options: ClarifyOption[]
}

/**
 * `n` is how many questions the prompt bundled (one widget each); `stepCount`
 * is how many clarifying questions follow. Unrelated numbers — they stay in
 * separate sentences so they are never read as the same count.
 */
export const clarifyIntro = (n: number, stepCount: number) =>
  `That prompt bundles ${n} separate questions — I'll build a widget for each. ` +
  `First I have ${stepCount} quick clarifying question${stepCount === 1 ? "" : "s"} for you. ` +
  `Pick an option below, or type your own answer.`

export const CLARIFY_STEPS: ClarifyStep[] = [
  {
    question: "What time range should they cover?",
    ack: "Noted — I'll scope everything to that window.",
    options: [
      {
        label: "Last 7 days",
        desc: "The default window for most Netskope Library reports",
        recommended: true,
      },
      { label: "Last 30 days", desc: "A broader window for trend context" },
      { label: "This quarter", desc: "Quarter-to-date, for leadership reporting" },
    ],
  },
  {
    question: "Any preferred breakdown?",
    ack: "Great — generating now.",
    options: [
      {
        label: "Whatever fits each question",
        desc: "Let me pick the best visualization per widget",
        recommended: true,
      },
      {
        label: "By user",
        desc: "Rank by the users generating the events where possible",
      },
      {
        label: "By policy",
        desc: "Rank by the policies firing the most where possible",
      },
    ],
  },
]

/**
 * Split one submission into distinct questions, so each can get its own
 * widget. A submission counts as several questions when it spans multiple
 * lines (Shift+Enter) or contains several "?"-terminated clauses. Text with no
 * line breaks and no "?" is one question.
 */
export function splitQuestions(text: string): string[] {
  const parts: string[] = []
  for (const line of text.split(/\r?\n+/)) {
    const trimmed = line.trim()
    if (!trimmed) continue
    // Break the line on "?", keeping the mark with its clause.
    const segments = trimmed.match(/[^?]+\?+|[^?]+$/g)
    if (segments) {
      for (const segment of segments) {
        const q = segment.trim()
        if (q) parts.push(q)
      }
    } else {
      parts.push(trimmed)
    }
  }
  return parts.length ? parts : [text.trim()]
}
