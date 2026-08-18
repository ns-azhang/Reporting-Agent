import * as React from "react"

import { classifyPrompt, matchReportByKeyword, resolveResponseId } from "@/lib/classify-prompt"
import type { Turn } from "@/data/sessions"

/**
 * The prompt page's conversation, ported from the prototype's `send`.
 *
 * A turn from a resumed session and a turn you just typed are the same shape,
 * so a restored thread simply keeps growing.
 */
export type ChatTurn =
  | Turn
  /** A prompt that named a library report, which opened instead of answering.
      Recorded so the thread still reads as a conversation when you come back. */
  | { role: "report"; reportId: string }

/** The prototype's "Thinking…" beat before an answer lands. */
const THINKING_MS = 800

export function useChat(onOpenReport?: (reportId: string) => void) {
  const [turns, setTurns] = React.useState<ChatTurn[]>([])
  const [thinking, setThinking] = React.useState(false)
  const timer = React.useRef<number | null>(null)

  const clearTimer = () => {
    if (timer.current !== null) window.clearTimeout(timer.current)
    timer.current = null
  }
  React.useEffect(() => clearTimer, [])

  /**
   * `responseId` is set when the prompt came from a follow-up chip, which names
   * the answer it leads to. That also bypasses report routing — otherwise
   * "Send the Critical list to #dlp-triage" would open the DLP report on the
   * bare word "dlp" instead of preparing the Slack post.
   */
  const send = (text: string, responseId?: string) => {
    const prompt = text.trim()
    if (!prompt || thinking) return

    setTurns((t) => [...t, { role: "user", text: prompt }])
    setThinking(true)

    const report = responseId ? undefined : matchReportByKeyword(prompt)
    clearTimer()
    timer.current = window.setTimeout(() => {
      setThinking(false)
      setTurns((t) => [
        ...t,
        report
          ? { role: "report", reportId: report.id }
          : { role: "ai", responseId: resolveResponseId(responseId ?? classifyPrompt(prompt)) },
      ])
      if (report) onOpenReport?.(report.id)
    }, THINKING_MS)
  }

  /** Start over, or drop into a session restored from history. */
  const reset = (seed: ChatTurn[] = []) => {
    clearTimer()
    setThinking(false)
    setTurns(seed)
  }

  return { turns, thinking, send, reset }
}
