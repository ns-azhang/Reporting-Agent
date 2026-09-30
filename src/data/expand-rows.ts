import type { TableWidget, Widget } from "@/data/report-details"

/**
 * Beta returns up to 100 rows per table. The exports we transcribed carry
 * only the top handful, so the list and detail tables are filled out
 * deterministically to their beta row count in the shape of their seeded
 * rows — the seeded rows stay exactly as they are at the top, and generated
 * rows continue the ranking beneath them: counts keep falling, dates keep
 * going back, users, apps, policies and domains come from pools, and
 * categorical columns (severity, action, CCL…) keep their seeded mix.
 *
 * A "Top N" table fills to N. Breakdowns (by status, by action, by region,
 * disclaimers) are left alone — a hundred statuses is not a thing.
 */
/** Tables filled to a specific count rather than the cap. */
const FILL_COUNTS: Record<string, number> = {
  // 72 weeks of history — a believable number, not a round one.
  "Weekly Incident Count": 72,
}

const FILL_TITLES = new Set([
  // dlp-overview
  "Weekly Incident Count",
  "DLP Incidents by Application",
  "DLP Severity by App Instance",
  "Top Open DLP Incidents",
  // security-engineer
  "Objects with Sensitive Data by App and Instance",
  "Publicly Exposed Objects with Sensitive Data",
  // soc-dlp-monitoring
  "Top DLP Policies Violated",
  "Top Files with DLP Violations",
  // security-analyst
  "DLP Policy Details — Top 15 Alerts",
  "Malware Detections — Details",
  "Blocked Malicious Sites — Details",
  // genai-admin
  "Top Instances Detected — Instance Detail",
  "Details on App Events",
  "AI Websites — Page Events Data",
  "Top AI Domains — Transactions Data",
  // ai-risk-assessment
  "AI Apps Used by CCL Score",
  // insider-threat
  "Top Users Uploading to Non-Corporate Instances",
  "Top 10 Users Choosing to Proceed when Coached",
  "Top Users by Malicious Sites",
  // app-activity
  "Top Users by Total Size of Files Uploaded/Downloaded",
  "Organization Unit & Application Instance by # Objects",
  // app-category
  "Application Usage Details",
  "Top Policies by # Alerts",
  "Allowed Data Movement Details",
])

const ROW_CAP = 100

/* ---------------------------------- pools --------------------------------- */

const APPS = [
  "ChatGPT", "Microsoft Copilot", "Google Gemini", "Anthropic Claude", "Perplexity", "Notion",
  "Slack", "Microsoft Teams", "Zoom", "Box", "Dropbox", "Google Drive",
  "Microsoft Office 365 OneDrive for Business", "Microsoft Office 365 Sharepoint Online",
  "Salesforce", "HubSpot", "Zendesk", "GitHub", "Jira", "Confluence", "Figma", "Miro",
  "Amazon S3", "GCP Storage", "Microsoft Azure", "Snowflake", "Databricks", "Tableau",
  "Grammarly", "Otter.ai", "Jasper", "Midjourney", "Hugging Face", "Replit", "Canva",
  "WeTransfer", "Evernote", "Trello", "Asana", "Monday.com", "DocuSign", "Workday",
]
/** Sub-pools, chosen when a table's seeded apps sit in one category. */
const AI_APPS = [
  "ChatGPT", "Microsoft Copilot", "Google Gemini", "Anthropic Claude", "Perplexity", "Jasper",
  "Midjourney", "Hugging Face", "Otter.ai", "Grammarly", "Poe", "Character.AI", "Mistral Le Chat",
  "GitHub Copilot", "Runway", "ElevenLabs", "Notion AI", "You.com", "DeepL", "Replit",
]
const STORAGE_APPS = [
  "GCP Storage", "Microsoft Office 365 OneDrive for Business", "Box", "Dropbox", "Google Drive",
  "Amazon S3", "Microsoft Office 365 Sharepoint Online", "WeTransfer", "pCloud", "Egnyte",
  "Citrix ShareFile", "MEGA", "Backblaze B2", "Wasabi", "Sync.com", "iCloud Drive",
]
const MALICIOUS_URLS = [
  "secure-login-verify[.]net/auth", "invoice-update-portal[.]com/view", "docs-share-cloud[.]top/file",
  "microsoft-365-renew[.]info/signin", "dhl-parcel-track[.]xyz/id", "paypa1-support[.]com/verify",
  "drive-shared-doc[.]online/open", "okta-sso-reset[.]net/login", "zoom-meeting-join[.]click/j",
  "hr-payroll-update[.]site/form", "adobe-cloud-view[.]top/pdf", "teams-invite-secure[.]link/m",
]

const POLICIES = [
  "Detect Credit card or GDPR info in managed ChatGPT Enterprise",
  "Block Sensitive Data sent to non-corporate MCP Servers",
  "Browser Access DLP — Block PII and PCI in Flonkerton",
  "[NPA EB] Allow Access to Web Apps",
  "Restrict public access to sensitive data on managed SaaS",
  "Scan for PII violations in OneDrive - Apply Sensitivity Label",
  "Detect Financial Information in managed SaaS",
  "[Context DLP] High Severity PII Block",
  "[Context DLP] Low Severity PII Warn",
  "Block uploads of source code to unsanctioned GenAI",
  "Coach users on personal cloud storage uploads",
  "Detect PHI in outbound webmail",
  "Quarantine executables downloaded from uncategorized sites",
  "Block Sensitive Data to personal instances",
  "Alert on bulk download from corporate SharePoint",
]
const RULES = [
  "EU-Name-Phone (narrow)", "EU-Name-PAN (narrow)", "INTL-PAN-Name", "US-SSN-Name",
  "US-SSN-Name-Address", "Name-Credit Card (CC)", "Credit Card (CC)", "LastName-Near-SSN-Unique",
  "SSN (Dash Delimited)", "EU-Name-DOB (narrow)", "Sensitive Project Names", "Source Code - Python",
]
const DOMAINS = [
  "chatgpt.com", "gemini.google.com", "copilot.microsoft.com", "claude.ai", "perplexity.ai",
  "notion.so", "slack.com", "teams.microsoft.com", "app.box.com", "dropbox.com", "drive.google.com",
  "sharepoint.com", "salesforce.com", "github.com", "atlassian.net", "figma.com", "miro.com",
  "s3.amazonaws.com", "storage.googleapis.com", "grammarly.com", "huggingface.co", "replit.com",
  "canva.com", "wetransfer.com", "openai.com", "api.anthropic.com", "midjourney.com", "poe.com",
]
const FILES = [
  "Q3-forecast.xlsx", "customer-list-export.csv", "board-deck-draft.pptx", "employee-roster.xlsx",
  "vendor-contract-signed.pdf", "payroll-2026-07.csv", "design-system-tokens.json", "incident-report.docx",
  "card-numbers-test.txt", "prod-config-backup.env", "patient-intake-form.pdf", "source-bundle.zip",
  "sales-pipeline.xlsx", "m&a-target-memo.docx", "api-keys.txt", "quarterly-close.xlsx",
]
const MALWARE = [
  "Trojan.Script.EAB", "Gen:Variant.Zusy", "Trojan.GenericKD", "HEUR:Trojan.Win32.Generic",
  "Exploit.PDF-JS.Gen", "Backdoor.Agent", "Trojan.Downloader.Win32", "Ransom.Win32.Lockbit",
  "Adware.Win32.Neoreklami", "PUA.Win32.Presenoker", "Trojan.MSOffice.SAgent", "Worm.Win32.Dorkbot",
]
const FIRST = ["j", "m", "a", "r", "k", "s", "d", "l", "t", "p", "c", "e", "n", "b", "h", "g", "v", "w"]
const LAST = [
  "chen", "patel", "garcia", "nguyen", "okafor", "kim", "rossi", "singh", "morales", "tanaka",
  "ivanov", "silva", "mueller", "dubois", "ahmed", "oconnor", "haddad", "kowalski", "lopez", "sato",
  "fischer", "novak", "costa", "reyes", "ito", "brown", "walsh", "berg", "lindqvist", "adeyemi",
]
const COUNTRIES = [
  "United States", "United Kingdom", "Germany", "India", "Canada", "France", "Netherlands",
  "Australia", "Japan", "Singapore", "Brazil", "Ireland", "Spain", "Sweden", "Mexico",
]
const ORG_UNITS = ["Finance", "Engineering", "Sales", "Marketing", "Legal", "HR", "Support", "Operations"]
const GROUPS = ["Web", "Finance", "Engineering", "Sales", "Contractors", "Executives", "Support"]

/* ------------------------------- generation ------------------------------- */

/** Small deterministic generator — the same table every load. */
function lcg(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0
    return s / 2 ** 32
  }
}
const seedFrom = (s: string) => [...s].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) >>> 0, 7)

const NUMERIC = /^([^\d-]*)(-?\d[\d,]*)(\.\d+)?(\s*[A-Za-z%]+)?$/
const parseNumber = (cell: string) => {
  const m = NUMERIC.exec(cell.trim())
  if (!m) return undefined
  return { prefix: m[1], value: Number(m[2].replace(/,/g, "") + (m[3] ?? "")), decimals: m[3] ? m[3].length - 1 : 0, suffix: m[4] ?? "", grouped: m[2].includes(",") }
}
const formatNumber = (n: number, like: NonNullable<ReturnType<typeof parseNumber>>) => {
  const v = like.decimals ? Number(n.toFixed(like.decimals)) : Math.round(n)
  const body = like.grouped || Math.abs(v) >= 1000
    ? v.toLocaleString("en-US", { minimumFractionDigits: like.decimals, maximumFractionDigits: like.decimals })
    : v.toFixed(like.decimals)
  return `${like.prefix}${body}${like.suffix}`
}

type Kind = "date" | "email" | "id" | "pool" | "numeric" | "categorical"

/** What a column holds, from its header and its seeded cells. */
function classify(header: string, cells: string[]): { kind: Kind; pool?: string[] } {
  const h = header.toLowerCase()
  const sample = cells.filter((c) => c && !/^[∅\-–—]/.test(c))
  // A date column holds dates — "% Change From Previous Week" does not.
  if (/date|week/.test(h) && sample.some((c) => /^\d{4}-\d{2}-\d{2}$/.test(c))) return { kind: "date" }
  if (sample.some((c) => c.includes("@"))) return { kind: "email" }
  if (/incident id|instance id|^id$|workspace/.test(h) || sample.some((c) => /^workspace_|^\d{6,}/.test(c))) return { kind: "id" }
  if (sample.length && sample.every((c) => parseNumber(c) && !/^\d{4}-\d{2}/.test(c))) return { kind: "numeric" }
  if (/polic/.test(h)) return { kind: "pool", pool: POLICIES }
  if (/rule/.test(h)) return { kind: "pool", pool: RULES }
  if (/malware/.test(h)) return { kind: "pool", pool: MALWARE }
  if (/url/.test(h) && sample.some((c) => c.includes("[.]"))) return { kind: "pool", pool: MALICIOUS_URLS }
  if (/domain|referer|url/.test(h)) return { kind: "pool", pool: DOMAINS }
  if (/file|object/.test(h) && !/objects?$/.test(h)) return { kind: "pool", pool: FILES }
  if (/country|region/.test(h)) return { kind: "pool", pool: COUNTRIES }
  if (/organization unit/.test(h)) return { kind: "pool", pool: [...new Set([...sample, ...ORG_UNITS])] }
  if (/group/.test(h)) return { kind: "pool", pool: [...new Set([...sample, ...GROUPS])] }
  if (/application|^app$|^site$|^apps?\b/.test(h)) {
    // Stay in the table's category: an AI-apps table fills with AI apps.
    const inAi = sample.filter((c) => AI_APPS.some((a) => c.startsWith(a))).length
    const inStorage = sample.filter((c) => STORAGE_APPS.some((a) => c.startsWith(a))).length
    const pool = inAi >= sample.length / 2 ? AI_APPS : inStorage >= sample.length / 2 ? STORAGE_APPS : APPS
    return { kind: "pool", pool }
  }
  if (/instance/.test(h)) return { kind: "pool", pool: DOMAINS }
  return { kind: "categorical" }
}

const isoDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`

function fillTable(widget: TableWidget, total: number): TableWidget {
  const rand = lcg(seedFrom(widget.title ?? "table"))
  const pick = <T,>(xs: readonly T[]) => xs[Math.floor(rand() * xs.length)]
  const seeded = widget.rows
  const need = total - seeded.length
  if (need <= 0) return widget

  const columns = widget.columns.map((header, c) => {
    const cells = seeded.map((r) => r[c] ?? "")
    const { kind, pool } = classify(header, cells)
    const nums = cells.map(parseNumber).filter((n): n is NonNullable<typeof n> => !!n)
    const min = nums.length ? Math.min(...nums.map((n) => n.value)) : 1
    const like = nums[nums.length - 1]
    const emailDomain = cells.find((x) => x.includes("@"))?.split("@")[1] ?? "demo-org.com"
    const dated = cells.map((x) => /^\d{4}-\d{2}-\d{2}$/.test(x) ? new Date(x) : undefined).filter(Boolean) as Date[]
    const oldest = dated.length ? new Date(Math.min(...dated.map((d) => d.getTime()))) : new Date(2026, 6, 18)
    return { header, kind, pool, cells, min, like, emailDomain, oldest }
  })

  // A table with one row per week is a time series, not a ranking: its
  // dates step back a week at a time and its counts wander around the
  // seeded level instead of falling.
  const weekly = columns.some((c) => c.kind === "date" && /week/i.test(c.header))
  const perDay = Math.ceil(need / 7)
  const rows: string[][] = []
  for (let i = 0; i < need; i++) {
    const t = i / Math.max(1, need - 1) // 0 → 1 down the table
    rows.push(
      columns.map((col) => {
        switch (col.kind) {
          case "date": {
            const d = new Date(col.oldest)
            d.setDate(col.oldest.getDate() - (weekly ? 7 * (i + 1) : Math.floor(i / perDay)))
            return isoDate(d)
          }
          case "email":
            return `${pick(FIRST)}${pick(LAST)}${rand() < 0.7 ? "+web" : ""}@${col.emailDomain}`
          case "id": {
            const seedCell = col.cells.find((x) => x && !/^[∅\-–—]/.test(x)) ?? ""
            if (/^workspace_/.test(seedCell)) return `workspace_${Math.floor(rand() * 0xffffffff).toString(16).padStart(8, "0")}-${Math.floor(rand() * 0xffff).toString(16).padStart(4, "0")}…`
            if (/^\d/.test(seedCell)) return `${Math.floor(1_000_000_000 + rand() * 8_999_999_999)}…`
            return pick(DOMAINS)
          }
          case "numeric": {
            if (!col.like) return "0"
            if (weekly) {
              // Around the seeded level, ±35%, so the series reads as history.
              const mean = col.cells.map(parseNumber).filter(Boolean).reduce((a, n) => a + n!.value, 0) /
                Math.max(1, col.cells.filter(parseNumber).length)
              return formatNumber(Math.max(0, mean * (0.65 + rand() * 0.7)), col.like)
            }
            // Continue the ranking: from just under the seeded minimum down
            // towards a fifth of it, with a little wobble — never above the
            // seeded minimum, so a table that bottoms out at 0.00 GB stays there.
            const floor =
              col.like.suffix.trim() === "%" ? Math.min(0.1, col.min)
              : col.like.decimals ? 0
              : col.min > 5 ? Math.max(1, col.min * 0.2)
              : Math.min(1, col.min)
            const v = col.min - (col.min - floor) * t * (0.85 + rand() * 0.3)
            return formatNumber(Math.max(floor, Math.min(col.min, v)), col.like)
          }
          case "pool":
            return pick(col.pool!)
          default: {
            // Keep the seeded mix; prefer the values that already appear most.
            const real = col.cells.filter(Boolean)
            return real.length ? pick(real) : ""
          }
        }
      })
    )
  }
  if (!weekly) return { ...widget, rows: [...seeded, ...rows] }

  // Weekly: newest first, and a "% change" column computed from the week
  // before it rather than drawn from the seeded mix.
  const dateCol = columns.findIndex((c) => c.kind === "date")
  const countCol = columns.findIndex((c) => c.kind === "numeric")
  const changeCol = columns.findIndex((c) => /% ?change/i.test(c.header))
  const all = [...seeded, ...rows].sort((a, b) => (a[dateCol] < b[dateCol] ? 1 : -1))
  if (changeCol >= 0 && countCol >= 0) {
    for (let i = 0; i < all.length; i++) {
      const cur = parseNumber(all[i][countCol])?.value
      const prev = parseNumber(all[i + 1]?.[countCol] ?? "")?.value
      all[i] = [...all[i]]
      all[i][changeCol] =
        cur === undefined || prev === undefined || prev === 0
          ? "∅"
          : `${cur >= prev ? "+" : "−"}${Math.round((Math.abs(cur - prev) / prev) * 100)}%`
    }
  }
  return { ...widget, rows: all }
}

/** How many rows a titled table should hold: a set count, its "Top N", else the cap. */
const targetRows = (title: string) => {
  if (FILL_COUNTS[title]) return FILL_COUNTS[title]
  const n = /\btop (\d+)\b/i.exec(title)
  return n ? Math.min(ROW_CAP, Number(n[1])) : ROW_CAP
}

/** The widget with its full beta row count, or itself. */
export function expandRows(widget: Widget): Widget {
  if (widget.type !== "table" || !widget.title || !FILL_TITLES.has(widget.title)) return widget
  return fillTable(widget, targetRows(widget.title))
}
