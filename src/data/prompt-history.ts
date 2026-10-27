/**
 * Session History, as the PM settled it: the prompts you asked, not whole
 * conversations, kept per user and capped by count rather than by age.
 *
 * Count, not time, because reporting admins schedule their reports and leave.
 * A 30-day window would be empty for someone back after six weeks, which is
 * exactly when their old questions are worth reusing; the last X are always
 * there however long the gap. The seed reaches past 30 days to show that.
 */

import { splitQuestions } from "@/data/clarify"
import {
  classifyPrompt,
  matchReportByKeyword,
  resolveResponseId,
} from "@/lib/classify-prompt"
import type { ChatTurn } from "@/lib/use-chat"

/**
 * How many prompts a user keeps. Asking past it drops the oldest. Three is
 * enough for the demo; the real number is still open.
 */
export const HISTORY_LIMIT = 3

export type PastPrompt = {
  text: string
  askedAt: Date
  /** Set when the prompt was a follow-up chip, which names its own answer. */
  responseId?: string
}

const ago = (days: number, hours = 0) =>
  new Date(Date.now() - (days * 24 + hours) * 60 * 60 * 1000)

/**
 * Kevin Flyn's history, newest first. The oldest is six weeks back — past a
 * 30-day window, still among his last three.
 */
export const SEEDED_PROMPTS: PastPrompt[] = [
  {
    text: "Show me only Critical incidents from the last 7 days",
    askedAt: ago(0, 1),
    responseId: "critical-only",
  },
  {
    text: "Which apps are receiving the source code uploads?",
    askedAt: ago(12),
    responseId: "apps-source-code",
  },
  {
    text: "Which users are uploading to high-risk destinations?",
    askedAt: ago(45),
    responseId: "users-wetransfer",
  },
]

/**
 * Add a prompt to the top of a history. Asking the same thing again moves it
 * up rather than listing it twice, so the cap counts distinct questions.
 */
export function addPrompt(
  history: PastPrompt[],
  text: string,
  responseId?: string
): PastPrompt[] {
  const key = text.trim().toLowerCase()
  return [
    { text: text.trim(), askedAt: new Date(), responseId },
    ...history.filter((p) => p.text.toLowerCase() !== key),
  ].slice(0, HISTORY_LIMIT)
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

/**
 * What the agent answered, rebuilt for the read-only view. The prototype's
 * answers are canned and picked from the prompt alone, so running the same
 * routing use-chat does reproduces them; there is no thread to store. A
 * clarifying wizard's steps aren't replayed, only what it ended in: one
 * answer per question.
 */
export function replayTurns(prompt: PastPrompt): ChatTurn[] {
  const asked: ChatTurn = { role: "user", text: prompt.text }
  if (prompt.responseId) {
    return [
      asked,
      { role: "ai", responseId: resolveResponseId(prompt.responseId) },
    ]
  }
  // A prompt naming a report opened it rather than being answered inline.
  const report = matchReportByKeyword(prompt.text)
  if (report) {
    return [
      asked,
      {
        role: "note",
        text: "Opened",
        link: { reportId: report.id, label: report.title },
      },
    ]
  }
  const questions = splitQuestions(prompt.text)
  return [
    asked,
    ...(questions.length > 1 ? questions : [prompt.text]).map(
      (q): ChatTurn => ({
        role: "ai",
        responseId: resolveResponseId(classifyPrompt(q)),
      })
    ),
  ]
}
