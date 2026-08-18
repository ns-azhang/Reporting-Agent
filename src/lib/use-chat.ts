import * as React from "react"

import { classifyPrompt, matchReportByKeyword, resolveResponseId } from "@/lib/classify-prompt"
import { CLARIFY_STEPS, clarifyIntro, splitQuestions } from "@/data/clarify"
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
  /** One step of the clarifying-questions wizard. */
  | {
      role: "clarify"
      /** Index into CLARIFY_STEPS — the step being asked. */
      stepIndex: number
      /** The intro on step 1, or the previous step's ack after that. */
      lead: string
    }
  /** A plain assistant line, e.g. the wizard's closing ack. */
  | { role: "note"; text: string }

/** The prototype's "Thinking…" beat before an answer lands. */
const THINKING_MS = 800
/** The pause between acknowledging the last answer and building the widgets. */
const HANDOFF_MS = 400
/** Generating several widgets takes a little longer than one answer. */
const GENERATING_MS = 900

export function useChat(onOpenReport?: (reportId: string) => void) {
  const [turns, setTurns] = React.useState<ChatTurn[]>([])
  const [thinking, setThinking] = React.useState(false)
  /** 0 = no wizard running; n = waiting for the answer to CLARIFY_STEPS[n-1]. */
  const [clarifyStep, setClarifyStep] = React.useState(0)
  /** The questions the original prompt bundled — one widget each, at the end. */
  const bundled = React.useRef<string[]>([])

  const timers = React.useRef<number[]>([])
  const after = (ms: number, fn: () => void) => {
    timers.current.push(window.setTimeout(fn, ms))
  }
  const clearTimers = () => {
    timers.current.forEach(window.clearTimeout)
    timers.current = []
  }
  React.useEffect(() => clearTimers, [])

  const push = (...added: ChatTurn[]) => setTurns((t) => [...t, ...added])

  /**
   * `responseId` is set when the prompt came from a follow-up chip, which names
   * the answer it leads to. That also bypasses report routing — otherwise
   * "Send the Critical list to #dlp-triage" would open the DLP report on the
   * bare word "dlp".
   */
  const send = (text: string, responseId?: string) => {
    const prompt = text.trim()
    if (!prompt || thinking) return

    push({ role: "user", text: prompt })
    setThinking(true)
    clearTimers()

    // A wizard is running: this message is the answer to the current step,
    // whether it came from an option or was typed. Intent classification is
    // skipped entirely until the wizard finishes.
    if (clarifyStep > 0) {
      after(THINKING_MS, () => {
        const answered = CLARIFY_STEPS[clarifyStep - 1]
        const next = CLARIFY_STEPS[clarifyStep]

        if (next) {
          setThinking(false)
          setClarifyStep(clarifyStep + 1)
          push({ role: "clarify", stepIndex: clarifyStep, lead: answered.ack })
          return
        }

        // Last answer in — acknowledge, then build one widget per question.
        setThinking(false)
        setClarifyStep(0)
        push({ role: "note", text: answered.ack })

        const questions = bundled.current.length ? bundled.current : [prompt]
        after(HANDOFF_MS, () => {
          setThinking(true)
          after(GENERATING_MS, () => {
            setThinking(false)
            push(
              ...questions.map(
                (q): ChatTurn => ({
                  role: "ai",
                  responseId: resolveResponseId(classifyPrompt(q)),
                })
              )
            )
          })
        })
      })
      return
    }

    const report = responseId ? undefined : matchReportByKeyword(prompt)

    // A prompt bundling several questions starts the wizard — unless it names a
    // report, in which case opening that report already answers it.
    if (!responseId && !report) {
      const questions = splitQuestions(prompt)
      if (questions.length > 1) {
        bundled.current = questions
        after(THINKING_MS, () => {
          setThinking(false)
          setClarifyStep(1)
          push({
            role: "clarify",
            stepIndex: 0,
            lead: clarifyIntro(questions.length, CLARIFY_STEPS.length),
          })
        })
        return
      }
    }

    after(THINKING_MS, () => {
      setThinking(false)
      push(
        report
          ? { role: "report", reportId: report.id }
          : {
              role: "ai",
              responseId: resolveResponseId(responseId ?? classifyPrompt(prompt)),
            }
      )
      if (report) onOpenReport?.(report.id)
    })
  }

  /** Start over, or drop into a session restored from history. */
  const reset = (seed: ChatTurn[] = []) => {
    clearTimers()
    setThinking(false)
    setClarifyStep(0)
    bundled.current = []
    setTurns(seed)
  }

  return { turns, thinking, send, reset }
}
