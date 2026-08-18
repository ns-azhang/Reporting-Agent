import * as React from "react"

import { Conversation } from "@/components/conversation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, LayoutGrid, Lightbulb, Send } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ChatTurn } from "@/lib/use-chat"
import type { SavableReport } from "@/components/card-menu"
import type { Response } from "@/data/responses"
import type { Session } from "@/data/sessions"

/** The 6 cards shown when nothing is pinned — mirrors POPULAR_REPORTS. */
const POPULAR_REPORTS = [
  {
    id: "dlp-overview",
    title: "DLP Incidents Status Monitoring",
    desc: "Open & outstanding incidents, status, assignees, resolution",
  },
  {
    id: "ai-risk-assessment",
    title: "AI Risk Assessment",
    desc: "Risky AI app usage, CCL ratings, policies, DLP alerts, top users",
  },
  {
    id: "ciso-overview",
    title: "CISO Dashboard",
    desc: "Alerts, DLP, threats, policy violations, network traffic · Jun 2025",
  },
  {
    id: "genai-admin",
    title: "AI Usage",
    desc: "Users, top AI apps, activities, and controls · last 7 days",
  },
  {
    id: "security-analyst",
    title: "Cloud Risk Assessment",
    desc: "Cloud app discovery, DLP, threats, UBA · last 90 days",
  },
  {
    id: "insider-threat",
    title: "Insider Threat Dashboard",
    desc: "Risky users across intentional behavior, data loss, and cloud threats · last 7 days",
  },
] as const

/** Tagged prompts — the category tag reduces scan cost in the dropdown. */
const SUGGESTED_PROMPTS = [
  { tag: "DLP", text: "Show me top DLP incidents this week" },
  { tag: "Users", text: "Which users have the most policy violations?" },
  { tag: "Apps", text: "What are the riskiest cloud apps in use?" },
  { tag: "Threats", text: "Show malware detections over the last 30 days" },
  { tag: "Users", text: "Who are the top data exfiltrators this month?" },
  { tag: "Executive", text: "Give me a CISO-level security overview" },
  { tag: "Severity", text: "Show the severity breakdown of recent incidents" },
  { tag: "Policies", text: "Which policies are triggered most frequently?" },
  { tag: "Apps", text: "Show sanctioned vs. unsanctioned app usage" },
  { tag: "DLP", text: "What is the 30-day DLP trend?" },
  { tag: "GenAI", text: "Show GenAI app usage across the organization" },
  { tag: "Forecast", text: "Give me a forecast for the next 7 days" },
] as const

/* All navigation now lives in the left sidebar — this page has no top bar. */

type WelcomePageProps = {
  onOpenReport?: (id: string) => void
  /** Set when arriving from Session History — renders the restored thread. */
  resumed?: Session | null
  /** The conversation so far. Lives in App so it survives opening a report. */
  turns: ChatTurn[]
  thinking: boolean
  onSend: (text: string, responseId?: string) => void
  /** Reports a card's ⋮ menu can save a chart into. */
  savableReports?: SavableReport[]
  onSaveToReport?: (response: Response, report: SavableReport) => void
  onCreateReport?: (response: Response, name: string) => void
}

export function WelcomePage({
  onOpenReport,
  resumed,
  turns,
  thinking,
  onSend,
  savableReports,
  onSaveToReport,
  onCreateReport,
}: WelcomePageProps) {
  const [value, setValue] = React.useState("")
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)
  const threadEnd = React.useRef<HTMLDivElement>(null)

  /** A suggested prompt fills the composer, so you can edit before sending. */
  const pick = (text: string) => {
    setValue(text)
    textareaRef.current?.focus()
  }

  const send = () => {
    if (!value.trim() || thinking) return
    onSend(value)
    setValue("")
  }

  // Follow-ups send straight away — they are already a complete question, and
  // the prototype treats clicking one as asking it.
  const followUp = (text: string, responseId?: string) => onSend(text, responseId)

  // Keep the newest turn in view as the thread grows.
  const turnCount = turns.length
  React.useEffect(() => {
    if (turnCount === 0) return
    threadEnd.current?.scrollIntoView({ behavior: "smooth", block: "end" })
  }, [turnCount, thinking])

  const started = turns.length > 0 || thinking

  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      {/* No top bar — all navigation lives in the left sidebar. */}
      {/* div, not <main> — SidebarInset already renders the page's <main>.
          Same centred max-w-6xl column as every other page. */}
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-8 py-8">
        {/* Page header — matches the sibling agent pages (AISecOps, AI Command
            Center): title left, no greeting. The title is the active nav
            entry, which is the convention those pages follow
            (nav "Overview" -> title "Overview"). */}
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {resumed ? resumed.title : "New Session"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {resumed
              ? `Resumed from Session History · ${resumed.when}`
              : "Ask a question about your security data."}
          </p>
        </div>

        {/* The thread sits above the composer so the conversation reads
            top-down and the composer stays where you continue it. */}
        {started && (
          <Conversation
            turns={turns}
            thinking={thinking}
            onPickFollowUp={followUp}
            onOpenReport={onOpenReport}
            /* Picking an option is the same as typing that answer — the
               wizard reads the next message either way. */
            onAnswerClarify={(label) => onSend(label)}
            savableReports={savableReports}
            onSaveToReport={onSaveToReport}
            onCreateReport={onCreateReport}
          />
        )}

        {/* Composer. Mirrors the prototype: tall textarea, toolbar row beneath.
            It shrinks once the conversation starts, so the answers get the
            space rather than an empty box. */}
        <div
          className={cn(
            "flex flex-col rounded-md border border-input bg-background shadow-xs transition-[color,box-shadow] focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50",
            started ? "min-h-[112px]" : "min-h-[200px]"
          )}
        >
          <div
            className="flex flex-1 cursor-text flex-col"
            onClick={() => textareaRef.current?.focus()}
          >
            <Textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              /* Enter sends, Shift+Enter breaks the line — the convention for
                 a chat composer, and the prototype's behaviour. */
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  send()
                }
              }}
              placeholder={'Try a specific question, like "risky users this week"'}
              /* px-4 pt-3.5 = 16px / 14px, overriding the Textarea's stock
                 px-2.5 py-2 so the prompt doesn't crowd the box edges. */
              className="min-h-0 flex-1 resize-none border-0 bg-transparent px-4 pt-3.5 shadow-none focus-visible:border-0 focus-visible:ring-0 dark:bg-transparent"
            />
          </div>

          <div className="flex items-center justify-between px-3 pb-2.5 pt-2">
            <DropdownMenu>
              {/* Base UI (not Radix) — custom triggers use `render`, not `asChild`. */}
              <DropdownMenuTrigger render={<Button variant="ghost" size="sm" />}>
                <Lightbulb />
                Suggested Prompts
                <ChevronDown />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-80">
                {/* Base UI requires MenuGroupLabel to live inside its MenuGroup. */}
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Suggested Prompts</DropdownMenuLabel>
                  {SUGGESTED_PROMPTS.map((p) => (
                    <DropdownMenuItem
                      key={p.text}
                      className="items-start gap-2"
                      onSelect={() => pick(p.text)}
                    >
                      <Badge variant="secondary" className="mt-px shrink-0">
                        {p.tag}
                      </Badge>
                      <span className="whitespace-normal">{p.text}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button size="sm" disabled={!value.trim() || thinking} onClick={send}>
              Send <Send />
            </Button>
          </div>
        </div>

        {/* Auto-scroll anchor. It sits below the composer, not below the thread,
            so a new answer brings the composer into view with it — otherwise
            the box you continue in ends up just past the fold. */}
        <div ref={threadEnd} />

        {/* Popular reports. Section heading + description line, matching how
            the sibling pages label sections ("Cases - last 3 days" over
            "Cases by status and risk level").
            Hidden once the conversation starts — it is a way to start, and you
            have already started. */}
        {!started && (
        <section className="flex flex-col gap-3">
          <div className="flex flex-col gap-0.5">
            <h2 className="flex items-center gap-2 text-base font-semibold tracking-tight">
              <LayoutGrid className="size-4 text-muted-foreground" />
              Popular reports
            </h2>
            <p className="text-sm text-muted-foreground">
              Start from a prebuilt report, or ask your own question above.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {POPULAR_REPORTS.map((report) => (
              <button
                key={report.id}
                onClick={() => onOpenReport?.(report.id)}
                className="group flex flex-col gap-1 rounded-xl bg-card px-4 py-3.5 text-left text-card-foreground shadow-xs ring-1 ring-foreground/10 transition-all outline-none hover:ring-ring focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-3"
              >
                <span className="text-sm font-semibold leading-snug">
                  {report.title}
                </span>
                <span className="text-xs leading-snug text-muted-foreground">
                  {report.desc}
                </span>
              </button>
            ))}
          </div>
        </section>
        )}
      </div>
    </div>
  )
}

export default WelcomePage
