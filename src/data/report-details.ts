/**
 * Full report contents for the report canvas — ported from the prototype's
 * DASHBOARDS + REPORT_ABOUT entries.
 *
 * Widget shapes mirror the prototype: a full-width `kpi` row, then half-width
 * `table`, `line` and `hbar` cards. Each carries its own insight paragraph,
 * which is what makes the canvas read as analysis rather than a chart dump.
 */

/** Severity palette from the prototype, reused so bar colours stay meaningful. */
export const SEVERITY_COLORS = {
  Critical: "#a21caf",
  High: "#ef4444",
  Medium: "#f59e0b",
  Low: "#fbbf24",
} as const

export type KpiWidget = {
  type: "kpi"
  kpis: {
    label: string
    value: string
    delta?: string
    /** Direction of change; `invertColor` marks "up is bad" metrics. */
    deltaDir?: "up" | "down"
    invertColor?: boolean
  }[]
  insight: string
}

export type TableWidget = {
  type: "table"
  title: string
  columns: string[]
  rows: string[][]
  insight: string
}

export type LineWidget = {
  type: "line"
  title: string
  xLabels: string[]
  series: { name: string; color: string; values: number[] }[]
  insight: string
}

export type HBarWidget = {
  type: "hbar"
  title: string
  bars: { label: string; value: number; color: string }[]
  insight: string
}

export type Widget = KpiWidget | TableWidget | LineWidget | HBarWidget

export type ReportDetail = {
  id: string
  title: string
  description: string
  about: { blurb: string; questions: string[] }
  /** Seeded into the chat pane as the assistant's opening summary. */
  summary: string
  examplePrompts: string[]
  widgets: Widget[]
}

const DLP_OVERVIEW: ReportDetail = {
  id: "dlp-overview",
  title: "DLP Incidents Status Monitoring",
  description:
    "Track open and outstanding DLP incidents through their lifecycle — status, assignment, and resolution over the last 7 days.",
  about: {
    blurb:
      "Use this report to track the status of DLP incidents through their lifecycle — open and outstanding incidents, assignment, and resolution.",
    questions: [
      "How many DLP incidents are open or outstanding, and what status are they in?",
      "Which policies have the most open incidents, and at what severity?",
      "How many incidents are unassigned, and who is working the rest?",
      "How are incidents progressing toward resolution?",
    ],
  },
  summary:
    "Here's your DLP incident status for the last 7 days. 147 incidents are open across 95 objects with violations — every one still in 'new' status with no assignee. Weekly volume rose 18% to 147 after two weeks of decline (225 → 186 → 125). ChatGPT dominates by application (117 low/high-severity incidents on the managed Enterprise workspace), driven by EU-name and PAN detection rules. Nothing was resolved or closed this period — the triage pipeline hasn't started, so assignment is the single biggest lever.",
  examplePrompts: [
    "Which policies have the most open incidents?",
    "Show only the Critical incidents",
    "Forecast next 7 days",
  ],
  widgets: [
    {
      type: "kpi",
      kpis: [
        {
          label: "Open DLP incidents",
          value: "147",
          delta: "+18% vs prior week",
          deltaDir: "up",
          invertColor: true,
        },
        { label: "Objects with violations", value: "95" },
        {
          label: "Unassigned incidents",
          value: "147",
          delta: "100% of open",
          deltaDir: "up",
          invertColor: true,
        },
        { label: "Resolved / closed (7d)", value: "0" },
      ],
      insight:
        "147 DLP incidents are open this period across 95 objects with violations, and all of them are unassigned and untriaged. Weekly volume is climbing again (+18%) after two weeks of decline. Zero incidents reached a resolved or closed state — assignment is the first bottleneck to clear.",
    },
    {
      type: "table",
      title: "Weekly Incident Count",
      columns: ["Event Week", "# DLP Incidents", "% Change From Previous Week"],
      rows: [
        ["2026-06-22", "225", "∅"],
        ["2026-06-29", "186", "−17%"],
        ["2026-07-06", "125", "−33%"],
        ["2026-07-13", "147", "+18%"],
      ],
      insight:
        "Incident volume fell for two straight weeks (−17%, −33%) before reversing this week (+18% to 147). The rebound interrupts what looked like a downward trend — worth watching next week to see whether this is noise or a new baseline.",
    },
    {
      type: "line",
      title: "Trend of DLP Incidents by Creation Date",
      xLabels: [
        "Jul 13",
        "Jul 14",
        "Jul 15",
        "Jul 16",
        "Jul 17",
        "Jul 18",
        "Jul 19",
      ],
      series: [
        {
          name: "# DLP Incidents",
          color: "#dc2626",
          values: [25, 12, 40, 33, 27, 10, 0],
        },
        {
          name: "# Objects With DLP Violations",
          color: "#f97316",
          values: [16, 9, 25, 21, 22, 7, 0],
        },
        { name: "# Users", color: "#0ea5e9", values: [3, 3, 4, 7, 7, 6, 0] },
      ],
      insight:
        "Daily incident creation peaked at 40 on July 15 and declined through the weekend. User count stays low (3–7 distinct users) throughout — incident volume is driven by a small set of users generating many violations each, not broad organizational activity.",
    },
    {
      type: "hbar",
      title: "DLP Incidents by Top Policies With Violations",
      bars: [
        {
          label: "Detect Credit card or GDPR info in managed ChatGPT Enterprise",
          value: 117,
          color: SEVERITY_COLORS.Critical,
        },
        {
          label: "Block Sensitive Data sent to non-corporate MCP Servers",
          value: 20,
          color: SEVERITY_COLORS.High,
        },
        {
          label: "[NPA EB] Allow Access to Web Apps",
          value: 6,
          color: SEVERITY_COLORS.Medium,
        },
        {
          label: "Browser Access DLP — Block PII and PCI in Flonkerton",
          value: 3,
          color: SEVERITY_COLORS.High,
        },
        {
          label: "Restrict public access to sensitive data on managed SaaS",
          value: 1,
          color: SEVERITY_COLORS.Low,
        },
      ],
      insight:
        "One policy dominates the open backlog: 'Detect Credit card or GDPR info in managed ChatGPT Enterprise' holds 117 of 147 open incidents (80%) — sensitive data in managed ChatGPT conversations. The remaining four policies account for 30 incidents combined.",
    },
    {
      type: "hbar",
      title: "Top DLP Rule Violations",
      bars: [
        { label: "EU-Name-Phone (narrow)", value: 86, color: SEVERITY_COLORS.High },
        { label: "EU-Name-PAN (narrow)", value: 72, color: SEVERITY_COLORS.High },
        { label: "INTL-PAN-Name", value: 72, color: SEVERITY_COLORS.High },
        {
          label: "Sensitive Project Names",
          value: 13,
          color: SEVERITY_COLORS.Critical,
        },
        { label: "Credit Card (CC)", value: 8, color: SEVERITY_COLORS.Medium },
        { label: "Name-Credit Card (CC)", value: 8, color: SEVERITY_COLORS.Medium },
        { label: "Credit Card", value: 7, color: SEVERITY_COLORS.Medium },
        {
          label: "EU-Name-Ethnicity (narrow)",
          value: 4,
          color: SEVERITY_COLORS.Low,
        },
        { label: "EU-Name-Address (narrow)", value: 3, color: SEVERITY_COLORS.Low },
      ],
      insight:
        "EU personal-data rules dominate rule-level matches — EU-Name-Phone (86), EU-Name-PAN (72), and INTL-PAN-Name (72) together account for the bulk of detections, consistent with the GDPR policy driving most incidents. 'Sensitive Project Names' (13) maps to the Critical-severity MCP Server incidents.",
    },
    {
      type: "table",
      title: "DLP Incidents by Application",
      columns: ["Application", "DLP Incident Severity Status", "# DLP Incidents"],
      rows: [
        ["ChatGPT", "Low", "89"],
        ["ChatGPT", "High", "28"],
        ["Parallel Search MCP", "Critical", "13"],
        ["[Flonkerton]", "Low", "8"],
        ["Parallel Search MCP", "Low", "7"],
        ["Microsoft Office 365 OneDrive for Business", "Medium", "1"],
        ["[Flonkerton]", "High", "1"],
      ],
      insight:
        "ChatGPT accounts for 117 incidents (80%) split between Low (89) and High (28) severity. Parallel Search MCP carries all 13 Critical incidents — the highest-severity exposure despite lower volume.",
    },
  ],
}

const REPORT_DETAILS: Record<string, ReportDetail> = {
  "dlp-overview": DLP_OVERVIEW,
}

/**
 * Only dlp-overview has full contents ported so far. Other reports fall back to
 * it so the canvas is never blank — clearly a stand-in, not real data.
 */
export const getReportDetail = (id: string): ReportDetail =>
  REPORT_DETAILS[id] ?? { ...DLP_OVERVIEW, id }

export const hasRealDetail = (id: string) => id in REPORT_DETAILS
