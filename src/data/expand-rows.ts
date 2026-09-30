import type { TableWidget, Widget } from "@/data/report-details"

/**
 * Beta returns up to 100 rows per table. The exports we transcribed carry
 * only the top handful, so the one detail table that would plausibly hit the
 * cap — the open-incident list — is filled out deterministically to 100 rows
 * in the same shape as its seeded ones: newest first across the report's
 * week, the same policies in roughly the same mix, 1–3 rules per incident.
 * The seeded rows stay exactly as they are at the top.
 */
const LONG_TABLES: Record<string, number> = {
  "Top Open DLP Incidents": 100,
}

const POLICIES = [
  "Detect Credit card or GDPR info in managed ChatGPT Enterprise",
  "Detect Credit card or GDPR info in managed ChatGPT Enterprise",
  "Detect Credit card or GDPR info in managed ChatGPT Enterprise",
  "Block Sensitive Data sent to non-corporate MCP Servers",
  "Browser Access DLP — Block PII and PCI in Flonkerton",
  "[NPA EB] Allow Access to Web Apps",
  "Restrict public access to sensitive data on managed SaaS",
]

/** Small deterministic generator — the same table every load. */
function lcg(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0
    return s / 2 ** 32
  }
}

function fillIncidents(widget: TableWidget, total: number): TableWidget {
  const rand = lcg(20260718)
  const rows = [...widget.rows]
  // Newest first, spread over the seven days the report covers, carrying on
  // from the oldest seeded date so the column stays in order.
  const oldest = rows.map((r) => r[0]).sort()[0] ?? "2026-07-18"
  const [y, m, d0] = oldest.split("-").map(Number)
  const lastDate = new Date(y, m - 1, d0)
  let day = 0
  let onThisDay = rows.filter((r) => r[0] === oldest).length
  const perDay = Math.ceil(total / 7)
  while (rows.length < total) {
    if (onThisDay >= perDay) {
      day += 1
      onThisDay = 0
    }
    const d = new Date(lastDate)
    d.setDate(lastDate.getDate() - day)
    const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
    const id = `${Math.floor(1_000_000_000 + rand() * 8_999_999_999)}…`
    const policy = POLICIES[Math.floor(rand() * POLICIES.length)]
    const rules = policy.startsWith("Detect") ? (rand() < 0.6 ? "2" : "3") : rand() < 0.8 ? "1" : "2"
    rows.push([date, id, "new", policy, rules])
    onThisDay += 1
  }
  return { ...widget, rows }
}

/** The widget with its full beta row count, or itself. */
export function expandRows(widget: Widget): Widget {
  if (widget.type !== "table" || !widget.title) return widget
  const total = LONG_TABLES[widget.title]
  if (!total || widget.rows.length >= total) return widget
  return fillIncidents(widget, total)
}
