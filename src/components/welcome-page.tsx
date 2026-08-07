import * as React from "react"

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

export function WelcomePage() {
  const [value, setValue] = React.useState("")
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  const pick = (text: string) => {
    setValue(text)
    textareaRef.current?.focus()
  }

  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      {/* No top bar — all navigation lives in the left sidebar. */}
      <main className="flex w-full flex-1 flex-col gap-6 px-8 py-8">
        {/* Page header — matches the sibling agent pages (AISecOps, AI Command
            Center): title left, no greeting. The title is the active nav
            entry, which is the convention those pages follow
            (nav "Overview" -> title "Overview"). */}
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">New Session</h1>
          <p className="text-sm text-muted-foreground">
            Ask a question about your security data.
          </p>
        </div>

        {/* Composer. Mirrors the prototype: tall textarea, toolbar row beneath. */}
        <div className="flex min-h-[200px] flex-col rounded-md border border-input bg-background shadow-xs transition-[color,box-shadow] focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-3">
          <div
            className="flex flex-1 cursor-text flex-col"
            onClick={() => textareaRef.current?.focus()}
          >
            <Textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
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

            <Button size="sm" disabled={!value.trim()}>
              Send <Send />
            </Button>
          </div>
        </div>

        {/* Popular reports. Section heading + description line, matching how
            the sibling pages label sections ("Cases - last 3 days" over
            "Cases by status and risk level"). */}
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
      </main>
    </div>
  )
}

export default WelcomePage
