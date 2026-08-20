/**
 * Prompt routing, ported from the prototype's `classifyPrompt` and
 * `matchDashboardByKeyword`.
 *
 * A typed prompt goes one of two ways:
 *   1. it names a library report ("show me the CISO dashboard") -> open it
 *   2. otherwise -> answer inline with the closest canned response
 *
 * Order matters in both matchers: the first hit wins, so the narrow patterns
 * are listed before the broad ones. "Show the severity breakdown by policy"
 * has to reach `top-policies`, not `severity`.
 */

import { REPORTS, REPORT_KEYWORDS, type Report } from "@/data/reports"
import { RESPONSES, FREEFORM_RESPONSE_ID } from "@/data/responses"
import { isHiddenResponse } from "@/data/beta-scope"

/**
 * Pick the canned response that best answers a free-typed prompt.
 *
 * Rules whose answer is out of beta scope are skipped rather than removed, so
 * the prompt keeps falling through to the next rule and lands on the closest
 * thing beta *can* answer. "Export this as a CSV" reaches the freeform summary
 * rather than an export card we don't ship.
 */
export function classifyPrompt(text: string): string {
  const t = text.toLowerCase()
  // Every `return` below goes through this, so a hidden answer is never the
  // result of a match — the rule simply doesn't fire.
  const pick = (id: string): string | undefined =>
    isHiddenResponse(id) ? undefined : id

  if (
    /\b(kpi|key metric|summary metric|top[- ]line|create.*kpi|build.*kpi|kpi row|metric row|scorecard)\b/.test(t)
  )
    return "kpi-row-custom"
  if (/\b(export|download|csv|xlsx|excel|spreadsheet)\b/.test(t) && pick("action-export")) return "action-export"
  if (/\b(pdf)\b/.test(t) && pick("export-pdf")) return "export-pdf"
  if (/\b(slack|channel|#dlp)\b/.test(t) && pick("slack-sent")) return "slack-sent"
  if (/\b(forecast|predict|next 7 days|next week)\b/.test(t)) return "forecast-7d"
  if (/\b(split|break.?down|group(ed)?)\s+(it\s+)?by\s+(severity|risk)/.test(t)) return "severity"
  if (/\b(split|break.?down|group(ed)?)\s+(it\s+)?by\s+(polic(y|ies))/.test(t)) return "top-policies"
  if (/\b(split|break.?down|group(ed)?)\s+(it\s+)?by\s+(destination|app|cloud)/.test(t))
    return "destinations"
  if (
    /\b(department|dept|by team|by org|business unit|\bbu\b|cohort|user group|by group|split by user|split by team)\b/.test(t)
  )
    return "by-department"
  if (/\b(24[- ]?hours?|today|past day|last day)\b/.test(t)) return "last-24h"
  if (/\b(critical only|only critical|just critical)\b/.test(t)) return "critical-only"
  if (/\b(severity)\b/.test(t)) return "severity"
  if (/\b(j\.morales|jmorales|morales)\b/.test(t)) return "user-detail-jmorales"
  if (/\b(k\.tanaka|tanaka)\b/.test(t)) return "user-policies-ktanaka"
  if (/\b(saturday spike|spike)\b/.test(t)) return "rca-saturday"
  if (/\bblock|recommend|policy update\b/.test(t) && pick("block-recommendation"))
    return "block-recommendation"
  if (/\b30[- ]?day|month|trend\b/.test(t)) return "trend-30d"
  if (/\b(week|7[- ]?day|this week)\b/.test(t) && /(overview|summary|incident)/.test(t))
    return "weekly-overview"
  if (/policy|policies/.test(t)) return "top-policies"
  if (/user|people|who/.test(t)) return "top-users"
  if (/destination|app|cloud|where|drive|dropbox/.test(t)) return "destinations"

  return FREEFORM_RESPONSE_ID
}

/**
 * Resolve an id to a response, falling back to the catch-all answer — for an
 * unknown id and for one beta hides, so no route can reach a hidden answer even
 * if a chip or caller names it directly.
 */
export const resolveResponseId = (id: string) =>
  id in RESPONSES && !isHiddenResponse(id) ? id : FREEFORM_RESPONSE_ID

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

/**
 * Does the prompt name a library report? Explicit keywords match on word
 * boundaries; title / folder / id match as substrings either way round, so both
 * "open the CISO dashboard" and a bare "ciso" land on the same report.
 */
export function matchReportByKeyword(text: string): Report | undefined {
  const t = text.toLowerCase().trim()
  if (t.length < 2) return undefined

  return REPORTS.find((report) => {
    const explicit = REPORT_KEYWORDS[report.id] ?? []
    if (explicit.some((k) => new RegExp(`\\b${escape(k.toLowerCase())}\\b`).test(t)))
      return true

    const loose = [report.title, report.folder, report.id.replace(/-/g, " ")].map((s) =>
      s.toLowerCase()
    )
    return loose.some(
      (k) => t.includes(k) || (k.length >= 4 && k.includes(t) && t.length >= 3)
    )
  })
}
