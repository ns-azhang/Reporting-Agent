/**
 * What an answer is called, and the window it covers.
 *
 * The window lives in one place — the subline here, the Date chip on a
 * report — never in the title, where it goes stale the moment a report's
 * Date changes. So titles lose their "— last 7 days", and the window is read
 * off them instead. Windows are rolling ("last 7 days"), never calendar ("this
 * week"). Where the period is the subject — a comparison, a forecast — the
 * title keeps it.
 *
 * An answer to a suggested prompt is named after the prompt, so the card
 * reads as the thing that was asked for. The product would have the model
 * name it the same way; the prototype's canned titles stand in otherwise.
 */

import { suggestedPrompt } from "@/data/suggested-prompts"
import { dateLabel, type DateRange } from "@/lib/filters"

const RANGES: [RegExp, DateRange][] = [
  [/\b24[- ]hours?\b/i, "24h"],
  [/\b7[- ]days?\b/i, "7d"],
  [/\b30[- ]days?\b/i, "30d"],
  [/\b60[- ]days?\b/i, "60d"],
  [/\b90[- ]days?\b/i, "90d"],
  [/\b12[- ]months?\b/i, "12m"],
]

/** Comparisons and forecasts: the period is what the title is about. */
const PERIOD_IS_SUBJECT = /\bvs\.?\s|\bnext \d+\b|\bforecast\b/i

/** The rolling window a text names, if any. */
export const rangeIn = (text: string): DateRange | undefined =>
  RANGES.find(([re]) => re.test(text))?.[1]

/**
 * A text without the window it names: "— Last 30 Days", "· last 7 days",
 * "in past 7 days", "(last 7 days)", a leading "7-day". Sentence-cased again
 * if the cut left a lower-case start.
 */
export function withoutRange(text: string): string {
  if (PERIOD_IS_SUBJECT.test(text)) return text
  const cut = text
    .replace(/\s*[—–·-]\s*(?:the )?(?:last|past) \d+ (?:hours|days|months)$/i, "")
    .replace(/\s*\((?:the )?(?:last|past) \d+ (?:hours|days|months)\)$/i, "")
    .replace(/\s+(?:in|over|for) (?:the )?(?:last|past) \d+ (?:hours|days|months)$/i, "")
    .replace(/^\d+-(?:day|hour|month)\s+/i, "")
    .trim()
  return cut.charAt(0).toUpperCase() + cut.slice(1)
}

/**
 * The window an answer covers: what its prompt or title names, else the
 * product's default — the same 7 days a report opens on when it names none.
 */
export const answerRange = (title: string, prompt?: string): DateRange =>
  (prompt && suggestedPrompt(prompt) ? rangeIn(prompt) : undefined) ??
  rangeIn(title) ??
  "7d"

/** The card's title: the suggested prompt it answers, or its own — either way without the window. */
export const answerTitle = (title: string, prompt?: string): string => {
  const asked = prompt ? suggestedPrompt(prompt) : undefined
  return withoutRange(asked ? asked.text : title)
}

/** "Last 7 days of abc-corp data, generated in 1.2s" — one sentence. */
export const answerSubline = (range: DateRange) =>
  `${dateLabel(range)} of abc-corp data, generated in 1.2s`
