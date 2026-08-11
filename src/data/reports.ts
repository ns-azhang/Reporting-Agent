/**
 * The built-in report templates, carried over from the prototype's
 * ALL_DASHBOARD_ITEMS. All of these ship with the product, so all carry the
 * "Netskope Library" badge; user-created reports would not.
 */
export type Report = {
  id: string
  title: string
  desc: string
  folder: string
}

export const REPORTS: Report[] = [
  {
    id: "dlp-overview",
    title: "DLP Incidents Status Monitoring",
    desc: "Open & outstanding incidents, status, assignees, resolution",
    folder: "DLP",
  },
  {
    id: "dlp-policies",
    title: "DLP policies",
    desc: "Top policies, 30-day trend, quarter compare",
    folder: "DLP",
  },
  {
    id: "security-engineer",
    title: "Data Security Posture Management",
    desc: "Where sensitive data sits and moves — at-rest exposure, DLP policy coverage, movement to unmanaged apps",
    folder: "DLP",
  },
  {
    id: "severity-sla",
    title: "Severity & SLA",
    desc: "Severity mix, 30d trend, resolution time",
    folder: "Severity & SLA",
  },
  {
    id: "forecast",
    title: "Incident forecast",
    desc: "Projected next 7 days · drivers",
    folder: "Forecast",
  },
  {
    id: "soc-dlp-monitoring",
    title: "Security Operations Analyst",
    desc: "Policy violations, DLP files, malware, and UEBA alerts",
    folder: "SOC",
  },
  {
    id: "ciso-overview",
    title: "CISO Dashboard",
    desc: "Alerts, DLP, threats, policy violations, network traffic · Jun 2025",
    folder: "CISO",
  },
  {
    id: "security-analyst",
    title: "Cloud Risk Assessment",
    desc: "Cloud app discovery, DLP, threats, UBA · last 90 days",
    folder: "Security Analyst",
  },
  {
    id: "genai-admin",
    title: "AI Usage",
    desc: "Users, top AI apps, activities, and controls · last 7 days",
    folder: "GenAI Admin",
  },
  {
    id: "ai-risk-assessment",
    title: "AI Risk Assessment",
    desc: "Risky AI app usage, CCL ratings, policies, DLP alerts, top users",
    folder: "GenAI Admin",
  },
  {
    id: "insider-threat",
    title: "Insider Threat Dashboard",
    desc: "Risky users across intentional behavior, data loss, and cloud threats · last 7 days",
    folder: "Insider Threat",
  },
]

/**
 * Filterable folder tags. The prototype excludes the persona-shaped folders
 * (CISO / Security Analyst / GenAI Admin) from the chip row — those reports are
 * still reachable via search, just not via a tag.
 */
const EXCLUDED_FROM_TAGS = ["CISO", "Security Analyst", "GenAI Admin"]

export const REPORT_TAGS = [
  ...new Set(
    REPORTS.map((r) => r.folder).filter((f) => !EXCLUDED_FROM_TAGS.includes(f))
  ),
]
