/**
 * Session History, kept per user and capped by count rather than by age.
 *
 * Count, not time, because reporting admins schedule their reports and leave.
 * A 30-day window would be empty for someone back after six weeks, which is
 * exactly when their old questions are worth reusing; the last X are always
 * there however long the gap. The seed reaches past 30 days to show that.
 *
 * Each entry is a session — the thread a first prompt started, listed under
 * that prompt — so a recent one can be picked up where it was left, the way
 * chat assistants list their conversations. Only recent ones, though: see
 * LIVE_FOR_MS.
 */

import { splitQuestions } from "@/data/clarify"
import {
  classifyPrompt,
  matchReportByKeyword,
  resolveResponseId,
} from "@/lib/classify-prompt"
import type { ChatTurn } from "@/lib/use-chat"

/**
 * How many sessions a user keeps. Starting one past it drops the oldest.
 */
export const HISTORY_LIMIT = 10

/**
 * How long a session stays open to more prompts after the last one. Past it
 * the session is read-only: the data under its answers has moved on, so
 * asking on top of them would mix old and new numbers in one thread.
 */
export const LIVE_FOR_MS = 24 * 60 * 60 * 1000

export type PastSession = {
  id: string
  /** The prompt that started it — what it is listed under. */
  title: string
  /** When it was last asked into. Orders the list and decides if it's live. */
  askedAt: Date
  turns: ChatTurn[]
}

/** Whether a session still takes prompts — see LIVE_FOR_MS. */
export const isLive = (session: PastSession, now = Date.now()) =>
  now - session.askedAt.getTime() < LIVE_FOR_MS

/** "9:31 AM tomorrow" / "11:00 PM today" — when a live session closes. */
export function closesAtLabel(session: PastSession, now = new Date()): string {
  const closes = new Date(session.askedAt.getTime() + LIVE_FOR_MS)
  const time = closes.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  })
  // Closing is always within the next 24 hours, so today or tomorrow.
  return `${time} ${closes.getDate() === now.getDate() ? "today" : "tomorrow"}`
}

let lastId = 0
export const newSessionId = () => `session-${++lastId}`

const ago = (days: number, hours = 0) =>
  new Date(Date.now() - (days * 24 + hours) * 60 * 60 * 1000)

/**
 * Kevin Flyn's history, newest first, filling the cap. Three are from the
 * last 24 hours, so still live; the rest are closed, the oldest past a 30-day
 * window but still among his last ten. Two carry a follow-up, to show an
 * entry is a whole session rather than one prompt.
 */
export const SEEDED_SESSIONS: PastSession[] = [
  {
    askedAt: ago(0, 1),
    asks: [
      {
        text: "Show me only Critical incidents from the last 7 days",
        responseId: "critical-only",
      },
      {
        text: "Which policies generate the Critical incidents?",
        responseId: "policies-critical",
      },
    ],
  },
  {
    askedAt: ago(0, 4),
    asks: [
      {
        text: "What DLP activity happened in the last 24 hours?",
        responseId: "last-24h",
      },
    ],
  },
  {
    askedAt: ago(0, 9),
    asks: [
      {
        text: "Show failed login attempts in the last 24 hours",
        responseId: "role-failed-logins",
      },
    ],
  },
  {
    askedAt: ago(1, 6),
    asks: [
      {
        text: "Compare DLP incidents this week vs. last week",
        responseId: "compare-week",
      },
      { text: "What caused the Saturday spike?", responseId: "rca-saturday" },
    ],
  },
  {
    askedAt: ago(3),
    asks: [
      { text: "Which AI apps are the riskiest?", responseId: "ai-risk-top-apps" },
    ],
  },
  {
    askedAt: ago(6),
    asks: [
      {
        text: "Break down DLP incidents by department",
        responseId: "by-department",
      },
    ],
  },
  {
    askedAt: ago(12),
    asks: [
      {
        text: "Which apps are receiving the source code uploads?",
        responseId: "apps-source-code",
      },
    ],
  },
  {
    askedAt: ago(21),
    asks: [
      {
        text: "Forecast DLP incidents for the next 7 days",
        responseId: "forecast-7d",
      },
    ],
  },
  {
    askedAt: ago(45),
    asks: [
      {
        text: "Which users are uploading to high-risk destinations?",
        responseId: "users-wetransfer",
      },
    ],
  },
  {
    askedAt: ago(70),
    asks: [
      {
        text: "Show the 30-day incident trend by top policies",
        responseId: "trend-by-policy",
      },
    ],
  },
].map((seed, i) => ({
  id: `seed-${i + 1}`,
  title: seed.asks[0].text,
  askedAt: seed.askedAt,
  turns: seed.asks.flatMap(replayTurns),
}))

/**
 * A prompt asked into a session: it goes to the top, and is started under
 * that prompt if it is new. Over the cap, the oldest session drops. Its turns
 * are App's to fill in — they come from the chat.
 */
export function askInto(
  history: PastSession[],
  id: string,
  text: string
): PastSession[] {
  const existing = history.find((s) => s.id === id)
  const asked: PastSession = existing
    ? { ...existing, askedAt: new Date() }
    : { id, title: text.trim(), askedAt: new Date(), turns: [] }
  return [asked, ...history.filter((s) => s.id !== id)].slice(0, HISTORY_LIMIT)
}

/** "Today, 9:14 AM" / "Yesterday" / "12 days ago" / "6 weeks ago" /
    "3 months ago". `inSentence` lowercases the day, for "last asked today". */
export function askedLabel(
  askedAt: Date,
  now = new Date(),
  inSentence = false
): string {
  const startOfDay = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  const days = Math.round((startOfDay(now) - startOfDay(askedAt)) / 86_400_000)
  if (days <= 0) {
    const time = askedAt.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    })
    return `${inSentence ? "today" : "Today"}, ${time}`
  }
  if (days === 1) return inSentence ? "yesterday" : "Yesterday"
  if (days < 28) return `${days} days ago`
  if (days < 60) return `${Math.floor(days / 7)} weeks ago`
  return `${Math.floor(days / 30)} months ago`
}

/**
 * A seeded session's thread, rebuilt from its prompt. The prototype's answers
 * are canned and picked from the prompt alone, so running the same routing
 * use-chat does reproduces them. A clarifying wizard's steps aren't replayed,
 * only what it ended in: one answer per question.
 */
function replayTurns(prompt: {
  text: string
  responseId?: string
}): ChatTurn[] {
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
