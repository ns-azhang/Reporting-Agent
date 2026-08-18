/**
 * Full report contents for the report canvas — all 11 library reports,
 * extracted from the prototype's DASHBOARDS and REPORT_ABOUT maps by
 * evaluating them rather than scraping, so figures, colours and insight copy
 * are exact.
 *
 * Widget types present: kpi, table, line, hbar, donut, gauge, plus two the
 * canvas does not draw yet (map, sankey) — those render as a labelled
 * placeholder so the layout stays honest instead of silently dropping a widget.
 *
 * `size` is "full" or "half", matching the prototype's grid.
 */

export type Kpi = {
  label: string
  value: string
  delta?: string
  deltaDir?: "up" | "down"
  /** "up is bad" metrics — more open incidents is worse, so colour inverts. */
  invertColor?: boolean
  /** Neither good nor bad; render the delta without a sentiment colour. */
  neutral?: boolean
}

type Base = { size?: string; insight: string; title?: string }

export type KpiWidget = Base & { type: "kpi"; kpis: Kpi[] }
export type TableWidget = Base & {
  type: "table"
  columns: string[]
  rows: string[][]
}
export type LineWidget = Base & {
  type: "line"
  xLabels: string[]
  /** `dashed` marks a comparison series (e.g. the prior period). */
  series: { name: string; color: string; values: number[]; dashed?: boolean }[]
  /**
   * Points the narrative calls out by name — a spike the insight text explains.
   * `onDrill` on the marker asks `drill.text`, so the chart is a way into the
   * follow-up rather than only an illustration.
   */
  anomalies?: {
    index: number
    value: number
    label: string
    drill?: { text: string; id?: string }
  }[]
}
export type HBarWidget = Base & {
  type: "hbar"
  bars: { label: string; value: number; color?: string }[]
}
export type DonutWidget = Base & {
  type: "donut"
  slices: { label: string; value: number; color?: string }[]
}
export type GaugeWidget = Base & { type: "gauge"; value: number; label?: string }
/** Not drawn yet — rendered as a placeholder naming the missing chart. */
export type UnsupportedWidget = Base & { type: "map" | "sankey" }

export type Widget =
  | KpiWidget
  | TableWidget
  | LineWidget
  | HBarWidget
  | DonutWidget
  | GaugeWidget
  | UnsupportedWidget

export type ReportDetail = {
  id: string
  title: string
  description: string
  summary: string
  examplePrompts: string[]
  about: { blurb: string; questions: string[] } | null
  widgets: Widget[]
}

const DETAILS: Record<string, Omit<ReportDetail, "id">> = {
  "dlp-overview": {
    "title": "DLP Incidents Status Monitoring",
    "description": "Track open and outstanding DLP incidents through their lifecycle — status, assignment, and resolution over the last 7 days.",
    "summary": "Here's your DLP incident status for the last 7 days. 147 incidents are open across 95 objects with violations — every one still in 'new' status with no assignee. Weekly volume rose 18% to 147 after two weeks of decline (225 → 186 → 125). ChatGPT dominates by application (117 low/high-severity incidents on the managed Enterprise workspace), driven by EU-name and PAN detection rules. Nothing was resolved or closed this period — the triage pipeline hasn't started, so assignment is the single biggest lever.",
    "examplePrompts": [
      "Which policies have the most open incidents?",
      "Show only the Critical incidents",
      "Forecast next 7 days"
    ],
    "about": {
      "blurb": "Use this report to track the status of DLP incidents through their lifecycle — open and outstanding incidents, assignment, and resolution.",
      "questions": [
        "How many DLP incidents are open or outstanding, and what status are they in?",
        "Which policies have the most open incidents, and at what severity?",
        "How many incidents are unassigned, and who is working the rest?",
        "How are incidents progressing toward resolution?"
      ]
    },
    "widgets": [
      {
        "type": "kpi",
        "size": "full",
        "insight": "147 DLP incidents are open this period across 95 objects with violations, and all of them are unassigned and untriaged. Weekly volume is climbing again (+18%) after two weeks of decline. Zero incidents reached a resolved or closed state — assignment is the first bottleneck to clear.",
        "kpis": [
          {
            "label": "Open DLP incidents",
            "value": "147",
            "delta": "+18% vs prior week",
            "deltaDir": "up",
            "invertColor": true
          },
          {
            "label": "Objects with violations",
            "value": "95"
          },
          {
            "label": "Unassigned incidents",
            "value": "147",
            "delta": "100% of open",
            "deltaDir": "up",
            "invertColor": true
          },
          {
            "label": "Resolved / closed (7d)",
            "value": "0"
          }
        ]
      },
      {
        "type": "table",
        "size": "half",
        "insight": "Incident volume fell for two straight weeks (−17%, −33%) before reversing this week (+18% to 147). The rebound interrupts what looked like a downward trend — worth watching next week to see whether this is noise or a new baseline.",
        "title": "Weekly Incident Count",
        "columns": [
          "Event Week",
          "# DLP Incidents",
          "% Change From Previous Week"
        ],
        "rows": [
          [
            "2026-06-22",
            "225",
            "∅"
          ],
          [
            "2026-06-29",
            "186",
            "−17%"
          ],
          [
            "2026-07-06",
            "125",
            "−33%"
          ],
          [
            "2026-07-13",
            "147",
            "+18%"
          ]
        ]
      },
      {
        "type": "line",
        "size": "half",
        "insight": "Daily incident creation peaked at 40 on July 15 and declined through the weekend. User count stays low (3–7 distinct users) throughout — incident volume is driven by a small set of users generating many violations each, not broad organizational activity.",
        "title": "Trend of DLP Incidents by Creation Date",
        "anomalies": [
          {
            "index": 2,
            "value": 40,
            "label": "Jul 15 peak"
          }
        ],
        "series": [
          {
            "name": "# DLP Incidents",
            "color": "#dc2626",
            "values": [
              25,
              12,
              40,
              33,
              27,
              10,
              0
            ]
          },
          {
            "name": "# Objects With DLP Violations",
            "color": "#f97316",
            "values": [
              16,
              9,
              25,
              21,
              22,
              7,
              0
            ]
          },
          {
            "name": "# Users",
            "color": "#0ea5e9",
            "values": [
              3,
              3,
              4,
              7,
              7,
              6,
              0
            ]
          }
        ],
        "xLabels": [
          "Jul 13",
          "Jul 14",
          "Jul 15",
          "Jul 16",
          "Jul 17",
          "Jul 18",
          "Jul 19"
        ]
      },
      {
        "type": "hbar",
        "size": "half",
        "insight": "One policy dominates the open backlog: 'Detect Credit card or GDPR info in managed ChatGPT Enterprise' holds 117 of 147 open incidents (80%) — sensitive data in managed ChatGPT conversations. The remaining four policies account for 30 incidents combined.",
        "title": "DLP Incidents by Top Policies With Violations",
        "bars": [
          {
            "label": "Detect Credit card or GDPR info in managed ChatGPT Enterprise",
            "value": 117,
            "color": "#F43F5E"
          },
          {
            "label": "Block Sensitive Data sent to non-corporate MCP Servers",
            "value": 20,
            "color": "#EF4444"
          },
          {
            "label": "[NPA EB] Allow Access to Web Apps",
            "value": 6,
            "color": "#FB923C"
          },
          {
            "label": "Browser Access DLP — Block PII and PCI in Flonkerton",
            "value": 3,
            "color": "#EF4444"
          },
          {
            "label": "Restrict public access to sensitive data on managed SaaS",
            "value": 1,
            "color": "#FBBF24"
          }
        ]
      },
      {
        "type": "hbar",
        "size": "half",
        "insight": "EU personal-data rules dominate rule-level matches — EU-Name-Phone (86), EU-Name-PAN (72), and INTL-PAN-Name (72) together account for the bulk of detections, consistent with the GDPR policy driving most incidents. 'Sensitive Project Names' (13) maps to the Critical-severity MCP Server incidents.",
        "title": "Top DLP Rule Violations",
        "bars": [
          {
            "label": "EU-Name-Phone (narrow)",
            "value": 86,
            "color": "#EF4444"
          },
          {
            "label": "EU-Name-PAN (narrow)",
            "value": 72,
            "color": "#EF4444"
          },
          {
            "label": "INTL-PAN-Name",
            "value": 72,
            "color": "#EF4444"
          },
          {
            "label": "Sensitive Project Names",
            "value": 13,
            "color": "#F43F5E"
          },
          {
            "label": "Credit Card (CC)",
            "value": 8,
            "color": "#FB923C"
          },
          {
            "label": "Name-Credit Card (CC)",
            "value": 8,
            "color": "#FB923C"
          },
          {
            "label": "Credit Card",
            "value": 7,
            "color": "#FB923C"
          },
          {
            "label": "EU-Name-Ethnicity (narrow)",
            "value": 4,
            "color": "#FBBF24"
          },
          {
            "label": "EU-Name-Address (narrow)",
            "value": 3,
            "color": "#FBBF24"
          }
        ]
      },
      {
        "type": "table",
        "size": "half",
        "insight": "ChatGPT accounts for 117 incidents (80%) split between Low (89) and High (28) severity. Parallel Search MCP carries all 13 Critical incidents — the highest-severity exposure despite lower volume. Application fields with null values indicate incidents generated from web traffic.",
        "title": "DLP Incidents by Application",
        "columns": [
          "Application",
          "DLP Incident Severity Status",
          "# DLP Incidents"
        ],
        "rows": [
          [
            "ChatGPT",
            "Low",
            "89"
          ],
          [
            "ChatGPT",
            "High",
            "28"
          ],
          [
            "Parallel Search MCP",
            "Critical",
            "13"
          ],
          [
            "[Flonkerton]",
            "Low",
            "8"
          ],
          [
            "Parallel Search MCP",
            "Low",
            "7"
          ],
          [
            "Microsoft Office 365 OneDrive for Business",
            "Medium",
            "1"
          ],
          [
            "[Flonkerton]",
            "High",
            "1"
          ]
        ]
      },
      {
        "type": "table",
        "size": "half",
        "insight": "The managed ChatGPT Enterprise workspace instance is the single largest source (117 incidents). All 13 Critical incidents come from instances with no ID (∅) — web-traffic-generated incidents with no corporate instance binding, which are also the hardest to attribute and remediate.",
        "title": "DLP Severity by App Instance",
        "columns": [
          "Application Instance ID",
          "DLP Incident Severity Status",
          "# DLP Incidents"
        ],
        "rows": [
          [
            "mynetskopedemo.onmicrosoft.com",
            "Medium",
            "1"
          ],
          [
            "workspace_65f5f739-778f-4950-b497-…",
            "Low",
            "89"
          ],
          [
            "workspace_65f5f739-778f-4950-b497-…",
            "High",
            "28"
          ],
          [
            "∅",
            "High",
            "1"
          ],
          [
            "∅",
            "Low",
            "15"
          ],
          [
            "∅",
            "Critical",
            "13"
          ]
        ]
      },
      {
        "type": "table",
        "size": "half",
        "insight": "Every open incident is still in 'new' — none have been acknowledged, assigned, or moved into investigation. The status pipeline hasn't started, which makes triage the immediate priority.",
        "title": "DLP Incidents by Status",
        "columns": [
          "DLP Incident Status",
          "# DLP Incidents",
          "% of Total"
        ],
        "rows": [
          [
            "new",
            "147",
            "100.0%"
          ]
        ]
      },
      {
        "type": "table",
        "size": "half",
        "insight": "All 147 open incidents are unassigned. Until incidents are routed to owners, resolution metrics below will stay empty — consider auto-assignment rules for the highest-volume policy to start the pipeline.",
        "title": "Open Incidents by Assignee",
        "columns": [
          "Assignee",
          "DLP Incident Status",
          "# DLP Incidents"
        ],
        "rows": [
          [
            "∅ (Unassigned)",
            "new",
            "147"
          ]
        ]
      },
      {
        "type": "table",
        "size": "full",
        "insight": "The most recent open incidents are all still in 'new'. The ChatGPT Enterprise GDPR policy appears repeatedly with multi-rule matches (2+ rules per incident), indicating layered detections on the same conversations rather than isolated one-off events.",
        "title": "Top Open DLP Incidents",
        "columns": [
          "Event Date",
          "DLP Incident ID",
          "Status",
          "Policy Name",
          "DLP Rule Count"
        ],
        "rows": [
          [
            "2026-07-18",
            "4140966943…",
            "new",
            "[NPA EB] Allow Access to Web Apps",
            "1"
          ],
          [
            "2026-07-18",
            "1184157204…",
            "new",
            "Detect Credit card or GDPR info in managed ChatGPT Enterprise",
            "2"
          ],
          [
            "2026-07-18",
            "5191885420…",
            "new",
            "Browser Access DLP — Block PII and PCI in Flonkerton",
            "3"
          ],
          [
            "2026-07-18",
            "3755069096…",
            "new",
            "Block Sensitive Data sent to non-corporate MCP Servers",
            "1"
          ],
          [
            "2026-07-17",
            "6594040324…",
            "new",
            "Detect Credit card or GDPR info in managed ChatGPT Enterprise",
            "2"
          ]
        ]
      },
      {
        "type": "line",
        "size": "full",
        "insight": "The resolution rate is flat at zero across the entire period — incidents are being created daily (peaking at 40 on July 15) but none are being worked to completion. The gap between the creation trend above and this flat line is the report's headline finding.",
        "title": "Trend of DLP Incidents Resolution Rate",
        "series": [
          {
            "name": "Resolved / Closed",
            "color": "#10b981",
            "values": [
              0,
              0,
              0,
              0,
              0,
              0,
              0
            ]
          }
        ],
        "xLabels": [
          "Jul 13",
          "Jul 14",
          "Jul 15",
          "Jul 16",
          "Jul 17",
          "Jul 18",
          "Jul 19"
        ]
      }
    ]
  },
  "dlp-policies": {
    "title": "DLP policies",
    "description": "Top-firing policies, 30-day trend by policy, and a quarter-over-quarter comparison.",
    "summary": "Top-firing policies and how they're moving. Customer PII (412) and Source Code (318) drive 57% of all violations this week. Source Code is the fastest grower at +62% over 30 days; HR Documents is the only top policy declining (−14%). Two new policies went live mid-Q2 that may explain ~12% of the PII increase.",
    "examplePrompts": [
      "Drill into Customer PII",
      "What's driving Source Code growth?"
    ],
    "about": {
      "blurb": "Use this report to track DLP policy activity and how it changes over time.",
      "questions": [
        "Which DLP policies trigger the most violations?",
        "How is policy activity trending over the last 30 days?",
        "How does this quarter compare to last quarter?"
      ]
    },
    "widgets": [
      {
        "type": "kpi",
        "size": "full",
        "insight": "",
        "kpis": [
          {
            "label": "Total violations (7d)",
            "value": "1,284"
          },
          {
            "label": "Top policy",
            "value": "Customer PII"
          },
          {
            "label": "Fastest growing",
            "value": "Source Code",
            "delta": "+62%",
            "deltaDir": "up",
            "invertColor": true
          },
          {
            "label": "Trending down",
            "value": "HR Docs",
            "delta": "−14%",
            "deltaDir": "down",
            "invertColor": true
          }
        ]
      },
      {
        "type": "hbar",
        "size": "full",
        "insight": "",
        "title": "Top policies — last 7 days",
        "bars": [
          {
            "label": "Confidential — Customer PII",
            "value": 412
          },
          {
            "label": "Source Code — Internal Only",
            "value": 318
          },
          {
            "label": "Financial Records — PCI",
            "value": 196
          },
          {
            "label": "HR Documents — Employees",
            "value": 142
          },
          {
            "label": "Healthcare — PHI",
            "value": 88
          },
          {
            "label": "Legal — Contracts",
            "value": 64
          },
          {
            "label": "M&A — Restricted",
            "value": 41
          },
          {
            "label": "Other policies (15)",
            "value": 23,
            "color": "#94a3b8"
          }
        ]
      },
      {
        "type": "line",
        "size": "full",
        "insight": "",
        "title": "30-day trend — top 4 policies",
        "series": [
          {
            "name": "Customer PII",
            "color": "#7c3aed",
            "values": [
              38,
              42,
              40,
              41,
              45,
              49,
              46,
              52,
              56,
              54,
              58,
              55,
              51,
              49,
              53,
              57,
              61,
              68,
              64,
              60,
              65,
              72,
              75,
              71,
              69,
              77,
              86,
              84,
              80,
              79
            ]
          },
          {
            "name": "Source Code",
            "color": "#2563eb",
            "values": [
              22,
              24,
              27,
              21,
              25,
              28,
              30,
              33,
              32,
              36,
              38,
              35,
              33,
              30,
              34,
              37,
              42,
              46,
              44,
              42,
              47,
              52,
              55,
              53,
              51,
              57,
              64,
              68,
              63,
              62
            ]
          },
          {
            "name": "PCI Financial",
            "color": "#0ea5e9",
            "values": [
              18,
              19,
              21,
              17,
              18,
              22,
              24,
              23,
              25,
              28,
              27,
              25,
              22,
              21,
              23,
              26,
              28,
              30,
              29,
              27,
              29,
              32,
              33,
              32,
              31,
              34,
              38,
              40,
              37,
              36
            ]
          },
          {
            "name": "HR Documents",
            "color": "#94a3b8",
            "values": [
              24,
              26,
              25,
              23,
              22,
              24,
              25,
              23,
              22,
              24,
              23,
              22,
              21,
              20,
              21,
              22,
              21,
              20,
              19,
              21,
              20,
              19,
              21,
              20,
              19,
              18,
              19,
              20,
              18,
              17
            ]
          }
        ],
        "xLabels": [
          "Apr 1",
          "",
          "",
          "",
          "",
          "Apr 6",
          "",
          "",
          "",
          "",
          "Apr 11",
          "",
          "",
          "",
          "",
          "Apr 16",
          "",
          "",
          "",
          "",
          "Apr 21",
          "",
          "",
          "",
          "",
          "Apr 26",
          "",
          "",
          "",
          ""
        ]
      },
      {
        "type": "hbar",
        "size": "full",
        "insight": "",
        "title": "This quarter vs. last quarter",
        "bars": [
          {
            "label": "Customer PII (Q2)",
            "value": 1842,
            "color": "#F43F5E"
          },
          {
            "label": "Customer PII (Q1)",
            "value": 1421,
            "color": "#c4b5fd"
          },
          {
            "label": "Source Code (Q2)",
            "value": 1218,
            "color": "#2563eb"
          },
          {
            "label": "Source Code (Q1)",
            "value": 712,
            "color": "#93c5fd"
          },
          {
            "label": "PCI Financial (Q2)",
            "value": 784
          },
          {
            "label": "PCI Financial (Q1)",
            "value": 691,
            "color": "#cbd5e1"
          }
        ]
      }
    ]
  },
  "security-engineer": {
    "title": "Data Security Posture Management",
    "description": "Where sensitive data sits and moves — at-rest exposure, DLP policy coverage, and movement to unmanaged apps. Last 7 days.",
    "summary": "64 objects carry sensitive data at rest this period, almost entirely on the managed ChatGPT Enterprise workspace (64 objects) with one more on OneDrive for Business. None are publicly exposed. The 'Detect Credit card information or GDPR info' policy alone accounts for 1,071 detections — by far the largest source, ahead of PII sensitivity labeling (156) and OneDrive PII scans (146 combined). On the movement side, 66.85 MB of sensitive data moved this period with zero DLP violations recorded, and no movement to unmanaged apps or non-corporate instances was detected.",
    "examplePrompts": [
      "Which policies detect the most sensitive data?",
      "Where is sensitive data moving?"
    ],
    "about": {
      "blurb": "Use this report to understand your data security posture — where sensitive data is sitting at rest, how exposed it is, and where it's moving.",
      "questions": [
        "Where is my sensitive data sitting?",
        "How much of it is publicly exposed?",
        "What types of sensitive data are being detected, and by which policies?",
        "Where is my sensitive data moving?"
      ]
    },
    "widgets": [
      {
        "type": "kpi",
        "size": "full",
        "insight": "64 objects carry sensitive data with DLP violations this period, and none are publicly exposed — a snapshot of where sensitive data is stored at rest, not incident volume. On the movement side, 66.85 MB of sensitive data moved this period, but zero objects triggered a DLP violation during that movement. Together these say the exposure risk here is about where data rests, not how it's being moved out.",
        "kpis": [
          {
            "label": "Objects with Sensitive Data (DLP violations)",
            "value": "64"
          },
          {
            "label": "Exposed Files",
            "value": "0"
          },
          {
            "label": "Amount of Data Movement",
            "value": "66.85 MB"
          },
          {
            "label": "Total Objects with DLP violations (movement)",
            "value": "0"
          }
        ]
      },
      {
        "type": "table",
        "size": "half",
        "insight": "The managed ChatGPT Enterprise workspace holds 64 of 65 objects with sensitive data (98%) — nearly all at-rest exposure lives in AI conversation content, not traditional file storage. OneDrive for Business contributes a single object.",
        "title": "Objects with Sensitive Data by App and Instance",
        "columns": [
          "Application",
          "Application Instance ID",
          "# Objects"
        ],
        "rows": [
          [
            "ChatGPT",
            "workspace_65f5f739-778f-4950-b497-794e…",
            "64"
          ],
          [
            "Microsoft Office 365 OneDrive for Business",
            "mynetskopedemo.onmicrosoft.com",
            "1"
          ]
        ]
      },
      {
        "type": "table",
        "size": "half",
        "insight": "All 65 objects have no country attribution — the underlying app/instance data doesn't carry a resolvable location for this data. Region-level reporting will need country tagging on these sources before it becomes actionable.",
        "title": "Objects with Sensitive Data by Region",
        "columns": [
          "Destination Country",
          "# Objects"
        ],
        "rows": [
          [
            "∅ (Unknown)",
            "65"
          ]
        ]
      },
      {
        "type": "hbar",
        "size": "full",
        "insight": "One policy dwarfs the rest: 'Detect Credit card information or GDPR info in managed ChatGPT Enterprise' has 1,071 detections — nearly 7× every other policy combined. PII-related rules (sensitivity labeling + OneDrive/SharePoint PII scans) make up most of the remaining volume, confirming regulated personal data as the dominant sensitive-data type in this environment.",
        "title": "Types of Sensitive Data Detected — Top 15 DLP Policies",
        "bars": [
          {
            "label": "Detect Credit card information or GDPR info in managed ChatGPT Enterprise",
            "value": 1071,
            "color": "#F43F5E"
          },
          {
            "label": "Apply PII Sensitivity Label",
            "value": 156,
            "color": "#EF4444"
          },
          {
            "label": "Detect Credit card information or GDPR info in OneDrive for Business",
            "value": 146,
            "color": "#EF4444"
          },
          {
            "label": "[OneDriveIntrospection] Scan for PII violations in SharePoint",
            "value": 63,
            "color": "#FB923C"
          },
          {
            "label": "[OneDriveIntrospection] Scan for PII violations in OneDrive",
            "value": 63,
            "color": "#FB923C"
          },
          {
            "label": "[OneDriveIntrospection] Scan for PCI DLP violations",
            "value": 59,
            "color": "#FB923C"
          },
          {
            "label": "Alert when sensitive content is detected on both endpoints",
            "value": 52,
            "color": "#FB923C"
          },
          {
            "label": "Scan for PII violations in OneDrive - Apply Sensitivity Label",
            "value": 48,
            "color": "#FB923C"
          },
          {
            "label": "All DLP Policies",
            "value": 20,
            "color": "#FBBF24"
          },
          {
            "label": "Detect Financial Information in managed SaaS",
            "value": 18,
            "color": "#FBBF24"
          },
          {
            "label": "[Microsoft Teams] Detect GDPR data in Teams webhooks",
            "value": 18,
            "color": "#FBBF24"
          },
          {
            "label": "Restrict public access to sensitive data on managed SaaS",
            "value": 17,
            "color": "#FBBF24"
          },
          {
            "label": "[SlackIntrospectionDemo] - Control PCI Data",
            "value": 11,
            "color": "#FBBF24"
          },
          {
            "label": "[Google Drive] - Remove public sharing links",
            "value": 10,
            "color": "#FBBF24"
          },
          {
            "label": "[GoogleDrive] - Detect PCI violations in Google Drive",
            "value": 10,
            "color": "#FBBF24"
          }
        ]
      },
      {
        "type": "table",
        "size": "half",
        "insight": "Zero public exposure across all six monitored applications, consistent with the 'Exposed Files: 0' KPI above. Sensitive data at rest exists (64 objects), but none of it is currently reachable via public link — the risk here is data classification and access scope, not external exposure.",
        "title": "Publicly Exposed Objects with Sensitive Data (DLP violations)",
        "columns": [
          "Application",
          "# Exposed Objects"
        ],
        "rows": [
          [
            "Microsoft Teams",
            "0"
          ],
          [
            "Microsoft Office 365 OneDrive for Business",
            "0"
          ],
          [
            "Microsoft Office 365 Outlook.com",
            "0"
          ],
          [
            "Slack for Enterprise",
            "0"
          ],
          [
            "Google Gmail",
            "0"
          ],
          [
            "External public",
            "0"
          ]
        ]
      },
      {
        "type": "table",
        "size": "half",
        "insight": "The same region-attribution gap seen above applies here — both detected sensitive-data types map to an unresolved region rather than a specific geography. Location-based DSPM reporting depends on closing this attribution gap first.",
        "title": "Top Types of Sensitive Data by Region",
        "columns": [
          "Region",
          "Type of Sensitive Data"
        ],
        "rows": [
          [
            "Unknown (∅)",
            "Detect Credit card information or GDPR info in managed ChatGPT Enterprise"
          ],
          [
            "Unknown (∅)",
            "Restrict public access to sensitive data on managed SaaS"
          ]
        ]
      },
      {
        "type": "table",
        "size": "full",
        "insight": "",
        "title": "Disclaimers",
        "columns": [
          "#",
          "Note"
        ],
        "rows": [
          [
            "1",
            "Data is based on Application Events, Alerts and DLP Incidents, and are in accordance with the retention period of the tenant."
          ],
          [
            "2",
            "The info in alerts and incidents is current when the incident/alert was created. Some of the files may have been changed subsequently."
          ],
          [
            "3",
            "We are only looking for the data identifiers defined by your DLP profiles. We are not looking for all possible data identifiers in this dashboard."
          ]
        ]
      }
    ]
  },
  "severity-sla": {
    "title": "Severity & SLA",
    "description": "Severity mix and the trend across critical, high, medium, low — plus mean time to resolve by severity band.",
    "summary": "Severity posture and SLA compliance. Critical incidents are up 39% week-over-week with a Saturday spike of 19 — the largest single-day Critical count this quarter. Critical share has crept from 3.8% to 4.9% over 30 days — a meaningful regression. Critical SLA is missing target by 30% (5h12m vs. 4h target), concentrated in the spike traffic.",
    "examplePrompts": [
      "Why is Critical share rising?",
      "Show only the Critical incidents"
    ],
    "about": {
      "blurb": "Use this report to monitor incident severity mix and resolution performance against SLA.",
      "questions": [
        "What is the severity breakdown of recent incidents?",
        "How is severity trending over the last 30 days?",
        "Are resolution times meeting SLA targets?"
      ]
    },
    "widgets": [
      {
        "type": "kpi",
        "size": "full",
        "insight": "",
        "kpis": [
          {
            "label": "Critical (30d)",
            "value": "224"
          },
          {
            "label": "High (30d)",
            "value": "598"
          },
          {
            "label": "Critical share",
            "value": "4.9%",
            "delta": "+1.1pp",
            "deltaDir": "up",
            "invertColor": true
          },
          {
            "label": "Critical SLA",
            "value": "5h12m",
            "delta": "+30%",
            "deltaDir": "up",
            "invertColor": true
          }
        ]
      },
      {
        "type": "donut",
        "size": "1/3",
        "insight": "",
        "title": "Severity mix — 7 days",
        "slices": [
          {
            "label": "Critical",
            "value": 64,
            "color": "#F43F5E"
          },
          {
            "label": "High",
            "value": 139,
            "color": "#EF4444"
          },
          {
            "label": "Medium",
            "value": 482,
            "color": "#FB923C"
          },
          {
            "label": "Low",
            "value": 599,
            "color": "#FBBF24"
          }
        ]
      },
      {
        "type": "line",
        "size": "2/3",
        "insight": "",
        "title": "30-day severity trend",
        "series": [
          {
            "name": "Critical",
            "color": "#F43F5E",
            "values": [
              4,
              5,
              5,
              3,
              4,
              6,
              5,
              6,
              7,
              6,
              8,
              7,
              5,
              4,
              6,
              8,
              9,
              11,
              8,
              7,
              9,
              10,
              12,
              10,
              9,
              11,
              14,
              16,
              13,
              12
            ]
          },
          {
            "name": "High",
            "color": "#EF4444",
            "values": [
              12,
              14,
              13,
              11,
              13,
              15,
              16,
              17,
              16,
              18,
              19,
              18,
              16,
              15,
              17,
              19,
              21,
              24,
              22,
              20,
              23,
              25,
              28,
              26,
              24,
              27,
              32,
              34,
              31,
              29
            ]
          },
          {
            "name": "Medium",
            "color": "#FB923C",
            "values": [
              44,
              48,
              52,
              42,
              45,
              49,
              50,
              55,
              56,
              58,
              62,
              60,
              55,
              52,
              57,
              61,
              68,
              72,
              67,
              63,
              68,
              75,
              79,
              75,
              71,
              77,
              86,
              88,
              84,
              81
            ]
          },
          {
            "name": "Low",
            "color": "#FBBF24",
            "values": [
              68,
              67,
              71,
              63,
              60,
              68,
              74,
              74,
              69,
              74,
              73,
              73,
              68,
              66,
              69,
              73,
              76,
              75,
              71,
              69,
              71,
              78,
              76,
              73,
              72,
              83,
              92,
              88,
              85,
              83
            ]
          }
        ],
        "xLabels": [
          "Apr 1",
          "",
          "",
          "",
          "",
          "Apr 6",
          "",
          "",
          "",
          "",
          "Apr 11",
          "",
          "",
          "",
          "",
          "Apr 16",
          "",
          "",
          "",
          "",
          "Apr 21",
          "",
          "",
          "",
          "",
          "Apr 26",
          "",
          "",
          "",
          ""
        ]
      },
      {
        "type": "hbar",
        "size": "full",
        "insight": "",
        "title": "Avg resolution time (minutes) — by severity",
        "bars": [
          {
            "label": "Critical (target ≤ 4h)",
            "value": 312,
            "color": "#F43F5E"
          },
          {
            "label": "High (target ≤ 24h)",
            "value": 1142,
            "color": "#EF4444"
          },
          {
            "label": "Medium (target ≤ 7d)",
            "value": 4080,
            "color": "#FB923C"
          },
          {
            "label": "Low (target ≤ 30d)",
            "value": 18240,
            "color": "#FBBF24"
          }
        ]
      }
    ]
  },
  "forecast": {
    "title": "Incident forecast",
    "description": "Projected DLP incidents for the next 7 days based on the last 30, with confidence interval and identified drivers.",
    "summary": "Projected next 7 days based on the last 30. Forecast is 1,510 incidents (+18% vs. prior week), with Critical at 76 (vs. 64 last week). Confidence interval ±9%. Customer PII and Source Code are the major drivers; the recommended PII upload block would reduce the forecast by an estimated 22%.",
    "examplePrompts": [
      "Forecast assuming the PII block",
      "Compare forecast vs. last week"
    ],
    "about": {
      "blurb": "Use this report to anticipate incident volume over the coming week.",
      "questions": [
        "What incident volume is projected for the next 7 days?",
        "Which drivers contribute most to the projection?",
        "How much Critical exposure should the team expect?"
      ]
    },
    "widgets": [
      {
        "type": "kpi",
        "size": "full",
        "insight": "",
        "kpis": [
          {
            "label": "Forecast total (7d)",
            "value": "1,510",
            "delta": "+18%",
            "deltaDir": "up",
            "invertColor": true
          },
          {
            "label": "Forecast Critical",
            "value": "76"
          },
          {
            "label": "Confidence interval",
            "value": "±9%"
          },
          {
            "label": "Major drivers",
            "value": "PII · Code"
          }
        ]
      },
      {
        "type": "line",
        "size": "full",
        "insight": "",
        "title": "30-day actual + 7-day forecast",
        "series": [
          {
            "name": "Actual",
            "color": "#2563eb",
            "values": [
              128,
              134,
              141,
              119,
              122,
              138,
              145,
              152,
              148,
              156,
              162,
              158,
              144,
              137,
              149,
              161,
              174,
              182,
              168,
              159,
              171,
              188,
              195,
              184,
              176,
              198,
              224,
              226,
              213,
              205,
              0,
              0,
              0,
              0,
              0,
              0,
              0
            ]
          },
          {
            "name": "Forecast",
            "color": "#94a3b8",
            "values": [
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              212,
              218,
              224,
              207,
              198,
              215,
              230
            ],
            "dashed": true
          }
        ],
        "xLabels": [
          "Apr 1",
          "",
          "",
          "",
          "",
          "",
          "Apr 7",
          "",
          "",
          "",
          "",
          "",
          "Apr 13",
          "",
          "",
          "",
          "",
          "",
          "Apr 19",
          "",
          "",
          "",
          "",
          "",
          "Apr 25",
          "",
          "",
          "",
          "",
          "",
          "May 1",
          "",
          "",
          "",
          "",
          "",
          "May 7"
        ]
      }
    ]
  },
  "soc-dlp-monitoring": {
    "title": "Security Operations Analyst",
    "description": "Policy violations, DLP files, malware, and UEBA alerts across your environment — last 7 days.",
    "summary": "This week: 56 DLP policies were violated across 65 files, alongside 56 UEBA alerts. Malware and malicious-URL detections stayed low (1 and 2 respectively), while 86 URLs were blocked outright. The 'Detect Credit card information or GDPR info' policy dominates at 233 alerts — more than 13× the next-highest policy. Alert is the dominant action (233) versus 37 blocks and 8 revoke-public-sharing actions, meaning most detections are being monitored rather than actively stopped.",
    "examplePrompts": [
      "Which policies were violated the most?",
      "Show top users behind these alerts"
    ],
    "about": {
      "blurb": "Use this report for weekly SOC monitoring of policy violations and alerting apps.",
      "questions": [
        "Which policies are firing the most this week?",
        "Which apps are generating alerts?",
        "How is weekly incident volume trending?"
      ]
    },
    "widgets": [
      {
        "type": "kpi",
        "size": "full",
        "insight": "56 DLP policies were violated across 65 files this week, alongside 56 UEBA alerts. Threat signals stayed low — 1 malware and 2 malicious-URL detections — while 86 URLs were blocked outright, well ahead of the confirmed-malicious count. Policy violations and behavioral alerts, not malware, are the dominant signal this period.",
        "kpis": [
          {
            "label": "Total Policies Violated",
            "value": "56"
          },
          {
            "label": "Total Files with DLP",
            "value": "65"
          },
          {
            "label": "Total Malware Detected",
            "value": "1"
          },
          {
            "label": "Total Malicious URLs Detected",
            "value": "2"
          },
          {
            "label": "Total URLs Blocked",
            "value": "86"
          },
          {
            "label": "Total UEBA Alerts",
            "value": "56"
          }
        ]
      },
      {
        "type": "table",
        "size": "full",
        "insight": "One policy dwarfs the rest: 'Detect Credit card information or GDPR info in managed ChatGPT Enterprise' has 233 alerts — more than 13× the next-highest policy. It's also the only policy in the top 5 using 'alert' rather than 'block' or 'revoke public sharing', meaning the single largest source of violations is being monitored, not stopped.",
        "title": "Top DLP Policies Violated",
        "columns": [
          "Policy Name",
          "Action",
          "# Alerts"
        ],
        "rows": [
          [
            "Detect Credit card information or GDPR info in managed ChatGPT Enterprise",
            "alert",
            "233"
          ],
          [
            "Block Sensitive Data sent to non-corporate MCP Servers",
            "block",
            "17"
          ],
          [
            "[NPA EB] Allow Access to Web Apps",
            "block",
            "12"
          ],
          [
            "Restrict public access to sensitive data on managed SaaS",
            "revoke public sharing",
            "8"
          ],
          [
            "Browser Access DLP - Block PII and PCI in Flonkerton",
            "block",
            "8"
          ]
        ]
      },
      {
        "type": "table",
        "size": "half",
        "insight": "Alert outnumbers block + revoke public sharing combined by more than 5 to 1. Given the top policy (233 alerts) is itself alert-only, tightening that single policy to block or coach would shift the action mix substantially.",
        "title": "Top Actions with DLP Policies",
        "columns": [
          "Action",
          "# Alerts"
        ],
        "rows": [
          [
            "alert",
            "233"
          ],
          [
            "block",
            "37"
          ],
          [
            "revoke public sharing",
            "8"
          ]
        ]
      },
      {
        "type": "table",
        "size": "half",
        "insight": "37 violations carry no file name at all — likely inline text or chat content rather than uploaded files. Several more are raw ChatGPT conversation logs (conversation_id entries), and the named files are dominated by PCI-test documents and a pasted-text capture, consistent with the top policy's focus on managed ChatGPT Enterprise content.",
        "title": "Top Files with DLP Violations",
        "columns": [
          "DLP File Name",
          "# Alerts"
        ],
        "rows": [
          [
            "∅ (no file name)",
            "37"
          ],
          [
            "{\"conversation_id\": \"6a56544f-3414-8332-ab6b…\"}",
            "14"
          ],
          [
            "0.SSN and CC2.pdf",
            "8"
          ],
          [
            "dlp_pci_small_documents(25).docx",
            "6"
          ],
          [
            "{\"conversation_id\": \"6a577b0e-465c-8330-a175…\"}",
            "6"
          ],
          [
            "dlp_pci_small_documents(29).docx",
            "6"
          ],
          [
            "Pasted text.txt",
            "6"
          ],
          [
            "dlp_pci_small_documents(27).docx",
            "6"
          ],
          [
            "dlp_pci_small_documents(22).docx",
            "6"
          ],
          [
            "dlp_pci_small_documents(26).docx",
            "6"
          ],
          [
            "{\"conversation_id\": \"6a57a26a-cc70-8325-b595…\"}",
            "6"
          ]
        ]
      }
    ]
  },
  "ciso-overview": {
    "title": "CISO Dashboard",
    "description": "Executive security overview — alerts, DLP, threats, policy violations, network traffic, and risky applications for June 2025.",
    "summary": "June 2025 security posture: 56,092 total alerts (+167% vs. May), driven primarily by Security Assessment events (69%). DLP violations reached 1,211 (+226%), with Generative AI as the top category. Policy violations hit 25,761 (+200%), led by web blocking rules. Threat signals remain low — 10 malware alerts and 37 malicious site alerts. Network traffic is healthy with blocked traffic a fraction of allowed. iCloud Drive is the top unsanctioned application by data volume.",
    "examplePrompts": [
      "Break down the 56,092 alerts by type",
      "Which DLP categories are driving the spike?",
      "Show top policy violations this period"
    ],
    "about": {
      "blurb": "Use this report for an executive view of alerts, threats, and network activity.",
      "questions": [
        "How many alerts occurred, broken down by type?",
        "How are threats, DLP, and policy violations trending?",
        "How is network traffic distributed across categories and apps?"
      ]
    },
    "widgets": [
      {
        "type": "kpi",
        "size": "full",
        "insight": "Total alerts more than doubled versus May — the 167% jump is dominated by Security Assessment events (69% of volume) rather than DLP or malware, suggesting increased policy scanning coverage rather than a deteriorating threat posture. Users and applications both grew 35%+ reflecting broader adoption.",
        "kpis": [
          {
            "label": "Total Alerts (Jun)",
            "value": "56,092",
            "delta": "+167%",
            "deltaDir": "up",
            "invertColor": true,
            "neutral": true
          },
          {
            "label": "Policies Triggered",
            "value": "98",
            "delta": "+10%",
            "deltaDir": "up",
            "invertColor": true
          },
          {
            "label": "Users Protected",
            "value": "81",
            "delta": "+35%",
            "deltaDir": "up"
          },
          {
            "label": "Applications Accessed",
            "value": "112",
            "delta": "+27%",
            "deltaDir": "up"
          }
        ]
      },
      {
        "type": "donut",
        "size": "half",
        "insight": "Security Assessment events (69%) dominate total alert volume — these are largely automated scan findings rather than active threats. Policy alerts (25%) and DLP (5%) are the two actionable categories requiring analyst review. Malware and malsite signals together account for less than 0.1% of volume.",
        "title": "Total Alerts Breakdown by Type — Jun 2025",
        "slices": [
          {
            "label": "Security Assessment",
            "value": 38772,
            "color": "#0ea5e9"
          },
          {
            "label": "Policy",
            "value": 14270,
            "color": "#6366f1"
          },
          {
            "label": "DLP",
            "value": 2966,
            "color": "#f59e0b"
          },
          {
            "label": "Malware",
            "value": 50,
            "color": "#ef4444"
          },
          {
            "label": "Malsite",
            "value": 6,
            "color": "#f43f5e"
          },
          {
            "label": "Compromised Cred.",
            "value": 1,
            "color": "#7c3aed"
          }
        ]
      },
      {
        "type": "line",
        "size": "half",
        "insight": "Threat volume spiked the week of Apr 6 (+195% vs. prior week) then partially recovered, before climbing again through June. Users and Applications show steady organic growth. Policy count grew 79% over 12 weeks, indicating active security rule expansion keeping pace with adoption.",
        "title": "Trend of Threats & Adoption — past 12 weeks",
        "series": [
          {
            "name": "Threats",
            "color": "#ef4444",
            "values": [
              4200,
              3800,
              11200,
              8400,
              5100,
              4700,
              6300,
              7800,
              9200,
              8600,
              12400,
              10800
            ]
          },
          {
            "name": "Policies",
            "color": "#6366f1",
            "values": [
              42,
              38,
              61,
              55,
              48,
              44,
              52,
              57,
              63,
              59,
              71,
              68
            ]
          },
          {
            "name": "Users",
            "color": "#0ea5e9",
            "values": [
              52,
              54,
              58,
              61,
              59,
              62,
              65,
              68,
              71,
              74,
              78,
              81
            ]
          },
          {
            "name": "Applications",
            "color": "#10b981",
            "values": [
              78,
              81,
              85,
              88,
              86,
              90,
              94,
              98,
              103,
              107,
              109,
              112
            ]
          }
        ],
        "xLabels": [
          "Mar 23",
          "Mar 30",
          "Apr 6",
          "Apr 13",
          "Apr 20",
          "Apr 27",
          "May 4",
          "May 11",
          "May 18",
          "May 25",
          "Jun 1",
          "Jun 8"
        ]
      },
      {
        "type": "kpi",
        "size": "full",
        "insight": "DLP violations tripled versus May — the sharpest month-over-month increase across all alert categories. Generative AI is the top DLP category, indicating employees are submitting sensitive data to AI tools. Immediate review of GenAI DLP policy scope and enforcement action is recommended.",
        "kpis": [
          {
            "label": "DLP Violations (Jun)",
            "value": "1,211",
            "delta": "+226%",
            "deltaDir": "up",
            "invertColor": true
          }
        ]
      },
      {
        "type": "hbar",
        "size": "half",
        "insight": "Generative AI is the top DLP category at 612 alerts — twice the volume of Cloud Storage (298). This likely reflects employees pasting or uploading sensitive documents into AI tools like ChatGPT or Copilot. A targeted GenAI DLP policy with contextual coaching would address the majority of violations.",
        "title": "Top Categories by # of DLP Alerts",
        "bars": [
          {
            "label": "Generative AI",
            "value": 612,
            "color": "#f59e0b"
          },
          {
            "label": "Cloud Storage",
            "value": 298,
            "color": "#0ea5e9"
          },
          {
            "label": "Technology",
            "value": 145
          },
          {
            "label": "Webmail",
            "value": 89
          },
          {
            "label": "Collaboration",
            "value": 52
          },
          {
            "label": "Security",
            "value": 15
          }
        ]
      },
      {
        "type": "line",
        "size": "half",
        "insight": "DLP alert volume has climbed steadily since late March, with Browser Access as the dominant access method. The Apr 6–13 spike (+85% week-over-week) aligns with a policy expansion. The Jun 15 week shows the highest weekly DLP volume this quarter across all access methods.",
        "title": "Trend of DLP Alerts — past 90 days",
        "anomalies": [
          {
            "index": 13,
            "value": 42,
            "label": "Apr spike"
          }
        ],
        "series": [
          {
            "name": "Browser Access",
            "color": "#6366f1",
            "values": [
              18,
              22,
              19,
              25,
              21,
              28,
              24,
              31,
              27,
              34,
              29,
              38,
              33,
              42,
              38,
              48,
              43,
              55,
              48,
              62,
              54,
              71,
              63,
              79,
              68,
              88,
              74,
              95,
              82,
              104,
              91,
              112,
              98,
              128,
              108,
              142,
              121,
              158,
              134,
              172,
              148,
              188,
              162,
              201,
              178,
              214
            ]
          },
          {
            "name": "API Connector",
            "color": "#0ea5e9",
            "values": [
              8,
              9,
              8,
              11,
              9,
              12,
              10,
              14,
              12,
              16,
              13,
              18,
              15,
              21,
              17,
              24,
              19,
              27,
              22,
              31,
              25,
              34,
              28,
              38,
              31,
              42,
              34,
              47,
              38,
              51,
              42,
              56,
              46,
              62,
              51,
              68,
              56,
              74,
              62,
              81,
              68,
              88,
              74,
              95,
              81,
              104
            ]
          },
          {
            "name": "Explicit Proxy",
            "color": "#10b981",
            "values": [
              4,
              5,
              4,
              6,
              5,
              7,
              5,
              8,
              6,
              9,
              7,
              11,
              8,
              12,
              9,
              14,
              10,
              16,
              11,
              18,
              13,
              20,
              14,
              23,
              16,
              25,
              17,
              28,
              19,
              31,
              21,
              34,
              23,
              38,
              25,
              41,
              28,
              45,
              31,
              49,
              34,
              53,
              37,
              58,
              40,
              63
            ]
          },
          {
            "name": "CASB API",
            "color": "#f59e0b",
            "values": [
              2,
              2,
              2,
              3,
              2,
              3,
              2,
              4,
              3,
              4,
              3,
              5,
              3,
              6,
              4,
              7,
              4,
              8,
              5,
              9,
              5,
              10,
              6,
              12,
              6,
              13,
              7,
              14,
              8,
              16,
              8,
              17,
              9,
              19,
              10,
              21,
              11,
              23,
              12,
              25,
              14,
              27,
              15,
              30,
              16,
              32,
              18,
              35
            ]
          }
        ],
        "xLabels": [
          "Mar 23",
          "",
          "",
          "",
          "",
          "",
          "",
          "Mar 30",
          "",
          "",
          "",
          "",
          "",
          "",
          "Apr 6",
          "",
          "",
          "",
          "",
          "",
          "",
          "Apr 13",
          "",
          "",
          "",
          "",
          "",
          "",
          "Apr 20",
          "",
          "",
          "",
          "",
          "",
          "",
          "Apr 27",
          "",
          "",
          "",
          "",
          "",
          "",
          "May 4",
          "",
          "",
          ""
        ]
      },
      {
        "type": "kpi",
        "size": "full",
        "insight": "Threat signals remain low in absolute terms — 10 malware and 37 malicious site alerts for the month. The 68% rise in malicious site alerts warrants monitoring but is not yet at incident threshold. Prohibited Websites category dominates malsite alerts, suggesting blocked browsing attempts rather than successful compromises.",
        "kpis": [
          {
            "label": "Malware Alerts (Jun)",
            "value": "10",
            "delta": "+11%",
            "deltaDir": "up",
            "invertColor": true
          },
          {
            "label": "Malicious Site Alerts (Jun)",
            "value": "37",
            "delta": "+68%",
            "deltaDir": "up",
            "invertColor": true
          }
        ]
      },
      {
        "type": "hbar",
        "size": "half",
        "insight": "Web Design and Technology categories account for 70% of malware alerts — likely drive-by download attempts on legitimate-looking sites. The single Phishing alert should be triaged as a priority; phishing-delivered malware has the highest breach conversion rate.",
        "title": "Top Categories by # of Malware Alerts",
        "bars": [
          {
            "label": "Web Design",
            "value": 4,
            "color": "#6366f1"
          },
          {
            "label": "Technology",
            "value": 3,
            "color": "#0ea5e9"
          },
          {
            "label": "Web Hosting / ISP",
            "value": 2,
            "color": "#10b981"
          },
          {
            "label": "Phishing",
            "value": 1,
            "color": "#ef4444"
          }
        ]
      },
      {
        "type": "hbar",
        "size": "half",
        "insight": "Prohibited Websites (38) make up the bulk of malsite alerts — these are policy-blocked navigation attempts, not confirmed infections. Malware Distribution Points (8) and Phish Sites (4) are higher-severity and should be cross-referenced against user session logs to confirm no successful page loads occurred.",
        "title": "Top Categories by # of Malicious Site Alerts",
        "bars": [
          {
            "label": "Prohibited Websites",
            "value": 38,
            "color": "#ef4444"
          },
          {
            "label": "Malware Distribution Point",
            "value": 8,
            "color": "#f43f5e"
          },
          {
            "label": "Phish Site",
            "value": 4,
            "color": "#7c3aed"
          },
          {
            "label": "Malicious Site",
            "value": 2,
            "color": "#f59e0b"
          }
        ]
      },
      {
        "type": "kpi",
        "size": "full",
        "insight": "Policy violations tripled versus May — the largest absolute increase of any category this period. [Web] Block DoH accounts for 38% of all policy violations alone, indicating widespread DNS-over-HTTPS usage that is being intercepted. Reviewing whether this policy should remain block vs. alert-only would significantly reduce noise.",
        "kpis": [
          {
            "label": "Policy Violations (Jun)",
            "value": "25,761",
            "delta": "+200%",
            "deltaDir": "up",
            "invertColor": true
          }
        ]
      },
      {
        "type": "hbar",
        "size": "full",
        "insight": "[Web] Block DoH at 9,847 hits is the single noisiest policy — DNS-over-HTTPS blocking generates high volume with low actionable signal. [Context DLP] High sensitivity (892) and [EmailSecurity] Block (387) are the highest-fidelity signals and should be the focus of analyst triage.",
        "title": "Top Policies Triggered — Jun 2025",
        "bars": [
          {
            "label": "[Web] Block DoH",
            "value": 9847,
            "color": "#ef4444"
          },
          {
            "label": "[Web] Silent Block",
            "value": 3201,
            "color": "#f59e0b"
          },
          {
            "label": "[Web] Policy coaching",
            "value": 2108,
            "color": "#6366f1"
          },
          {
            "label": "[Enterprise Browser] Restriction",
            "value": 1847,
            "color": "#0ea5e9"
          },
          {
            "label": "[Web] Block sites",
            "value": 1203,
            "color": "#ef4444"
          },
          {
            "label": "[Context DLP] High sensitivity",
            "value": 892,
            "color": "#f59e0b"
          },
          {
            "label": "[Enterprise Browser] Block",
            "value": 741,
            "color": "#ef4444"
          },
          {
            "label": "[Context DLP] Low sensitivity",
            "value": 618,
            "color": "#fbbf24"
          },
          {
            "label": "[AccessControl] Restrict",
            "value": 502,
            "color": "#94a3b8"
          },
          {
            "label": "[EmailSecurity] Block",
            "value": 387,
            "color": "#ef4444"
          }
        ]
      },
      {
        "type": "line",
        "size": "half",
        "insight": "Allowed traffic has grown steadily from ~38 GB/week in late March to ~95 GB/week in early June — a 150% increase reflecting user and application growth. Blocked traffic remains below 0.15 GB/week throughout, confirming that security controls are intercepting policy violations without impacting legitimate traffic flow.",
        "title": "Trend of Allowed / Blocked Traffic — past 90 days",
        "series": [
          {
            "name": "Allowed Traffic (GB)",
            "color": "#10b981",
            "values": [
              38,
              42,
              35,
              48,
              41,
              52,
              44,
              56,
              47,
              58,
              49,
              62,
              52,
              65,
              55,
              68,
              58,
              71,
              60,
              74,
              63,
              76,
              65,
              79,
              67,
              82,
              70,
              85,
              72,
              87,
              74,
              89,
              76,
              91,
              78,
              93,
              80,
              95,
              82,
              97,
              84,
              99,
              62,
              45,
              38,
              52
            ]
          },
          {
            "name": "Blocked Traffic (GB)",
            "color": "#ef4444",
            "values": [
              4,
              5,
              3,
              6,
              4,
              7,
              5,
              8,
              6,
              8,
              6,
              9,
              7,
              9,
              7,
              10,
              8,
              10,
              8,
              11,
              9,
              11,
              9,
              11,
              9,
              12,
              10,
              12,
              10,
              12,
              10,
              13,
              11,
              13,
              11,
              13,
              11,
              14,
              12,
              14,
              12,
              14,
              9,
              7,
              6,
              8
            ]
          }
        ],
        "xLabels": [
          "Mar 23",
          "",
          "",
          "",
          "",
          "",
          "",
          "Apr 6",
          "",
          "",
          "",
          "",
          "",
          "",
          "Apr 20",
          "",
          "",
          "",
          "",
          "",
          "",
          "May 4",
          "",
          "",
          "",
          "",
          "",
          "",
          "May 18",
          "",
          "",
          "",
          "",
          "",
          "",
          "Jun 1",
          "",
          "",
          "",
          "",
          "",
          "",
          "Jun 15",
          "",
          "",
          ""
        ]
      },
      {
        "type": "hbar",
        "size": "half",
        "insight": "Online Ads and Prohibited Websites have the highest block rates (~95%+). Cloud Storage, Webmail, and Technology are predominantly allowed — consistent with business use. Generative AI sits at a mixed allow/block ratio, indicating selective policy enforcement rather than a blanket rule.",
        "title": "Allowed vs. Blocked by Site Category",
        "bars": [
          {
            "label": "Online Ads",
            "value": 98,
            "color": "#ef4444"
          },
          {
            "label": "Prohibited Websites",
            "value": 94,
            "color": "#ef4444"
          },
          {
            "label": "Non-business use",
            "value": 71,
            "color": "#f59e0b"
          },
          {
            "label": "Cloud Storage",
            "value": 45,
            "color": "#10b981"
          },
          {
            "label": "Webmail",
            "value": 38,
            "color": "#10b981"
          },
          {
            "label": "Technology",
            "value": 34,
            "color": "#10b981"
          },
          {
            "label": "Generative AI",
            "value": 29,
            "color": "#f59e0b"
          },
          {
            "label": "Weapons",
            "value": 22,
            "color": "#ef4444"
          },
          {
            "label": "Security",
            "value": 18,
            "color": "#10b981"
          }
        ]
      },
      {
        "type": "hbar",
        "size": "half",
        "insight": "iCloud Drive dominates unsanctioned app traffic at 5.82 GB total — 12× the next application. This volume is consistent with automated device backup rather than targeted data exfiltration, but warrants review. YouTube, CNN, and BBC are low-risk consumer media sites with minimal data upload.",
        "title": "Top 5 Unsanctioned Applications by Data Volume",
        "bars": [
          {
            "label": "iCloud Drive",
            "value": 582,
            "color": "#ef4444"
          },
          {
            "label": "YouTube",
            "value": 48,
            "color": "#f59e0b"
          },
          {
            "label": "CNN",
            "value": 12,
            "color": "#94a3b8"
          },
          {
            "label": "BBC",
            "value": 9,
            "color": "#94a3b8"
          },
          {
            "label": "EL UNIVERSAL",
            "value": 4,
            "color": "#94a3b8"
          }
        ]
      },
      {
        "type": "hbar",
        "size": "half",
        "insight": "Cloud Storage (poor CCL) and Generative AI (poor CCL) are the two highest-risk unsanctioned categories. Together they represent the primary data exfiltration and IP leakage surface. Professional Networking (LinkedIn-class apps) is medium risk — sensitive profile data and recruitment contacts are the typical concern.",
        "title": "Top 5 Unsanctioned Categories by Risk Rating",
        "bars": [
          {
            "label": "Cloud Storage",
            "value": 582,
            "color": "#ef4444"
          },
          {
            "label": "Streaming & Downloadable Video",
            "value": 48,
            "color": "#f59e0b"
          },
          {
            "label": "News & Media",
            "value": 25,
            "color": "#fbbf24"
          },
          {
            "label": "Professional Networking",
            "value": 14,
            "color": "#f59e0b"
          },
          {
            "label": "Generative AI",
            "value": 11,
            "color": "#ef4444"
          }
        ]
      },
      {
        "type": "map",
        "size": "half",
        "insight": "Alert volume is concentrated in three hubs — Bengaluru (951), Mexico City (612), and Ashburn (445) — while Europe contributes only a long tail of single- and double-digit locations. Compare with Users by Location: the alert hubs don't match where most users sit, pointing at automation and service traffic rather than employee activity.",
        "title": "Alerts by Location"
      },
      {
        "type": "map",
        "size": "half",
        "insight": "Users are concentrated on the US West Coast (12 in the Bay Area) with small pockets across North America, Europe, and Asia. The contrast with Alerts by Location is the takeaway: Bengaluru generates 951 alerts from a single user and Mexico City 612 from four — automation identities and batch jobs, not headcount, drive geographic alert volume.",
        "title": "Users by Location"
      }
    ]
  },
  "security-analyst": {
    "title": "Cloud Risk Assessment",
    "description": "Cloud app discovery, DLP policy violations, cloud threats, and user behavior analytics for the last 90 days.",
    "summary": "Last 90 days: 170 cloud apps discovered (67% risky), 1,664 files with DLP violations across 243 users, 31 malware detections, 11 malicious sites blocked, and 885 UBA alerts across 181 users. Generative AI is the top category for both uploads (7,416 MB) and DLP violations. The [Web] Block DoH policy and AI-Gateway scans generate the highest alert volumes.",
    "examplePrompts": [
      "What access methods are being used in my environment?",
      "Show DLP profile breakdown",
      "Who are the top users with UBA alerts?"
    ],
    "about": {
      "blurb": "Use this report to assess cloud app risk across discovery, DLP, threats, and user behavior.",
      "questions": [
        "Which cloud apps are in use, and how risky are they?",
        "Where are DLP and threat signals concentrated?",
        "Which users show anomalous behavior (UBA)?"
      ]
    },
    "widgets": [
      {
        "type": "kpi",
        "size": "full",
        "insight": "170 cloud apps were discovered in the last 90 days — 67% are classified as risky (low or poor CCL). Only 31 are managed/sanctioned, meaning 82% of accessed apps are outside IT visibility. Generative AI and Streaming are the top upload categories among non-enterprise-ready apps.",
        "kpis": [
          {
            "label": "Total Cloud Apps Discovered",
            "value": "170"
          },
          {
            "label": "Risky Apps",
            "value": "67.06%",
            "delta": "",
            "deltaDir": "up",
            "invertColor": true
          },
          {
            "label": "Unmanaged Apps",
            "value": "139"
          },
          {
            "label": "Managed Apps",
            "value": "31"
          }
        ]
      },
      {
        "type": "donut",
        "size": "half",
        "insight": "Poor CCL apps are the largest single segment at 33.5% (57 apps) — more than all excellent+high apps combined in terms of risk exposure. Medium CCL (44 apps, 25.9%) adds a second tier of moderate risk. Only 31.2% of apps rate high or excellent, indicating the majority of cloud usage falls outside enterprise-ready standards.",
        "title": "Cloud App Count by CCL Rating",
        "slices": [
          {
            "label": "Poor",
            "value": 57,
            "color": "#ef4444"
          },
          {
            "label": "High",
            "value": 47,
            "color": "#10b981"
          },
          {
            "label": "Medium",
            "value": 44,
            "color": "#f59e0b"
          },
          {
            "label": "Low",
            "value": 13,
            "color": "#fb923c"
          },
          {
            "label": "Excellent",
            "value": 6,
            "color": "#0ea5e9"
          },
          {
            "label": "Unknown",
            "value": 3,
            "color": "#94a3b8"
          }
        ]
      },
      {
        "type": "hbar",
        "size": "half",
        "insight": "82% of accessed cloud apps are unmanaged — no sanctioned policy, DLP rule, or lifecycle management applied. Only 18% (31 apps) are under IT control. This 139-app unmanaged tail is the primary shadow-IT risk surface and the source of most DLP and UBA alert volume.",
        "title": "Managed vs. Unmanaged Applications",
        "bars": [
          {
            "label": "Unmanaged (No)",
            "value": 139,
            "color": "#ef4444"
          },
          {
            "label": "Managed (Yes)",
            "value": 31,
            "color": "#10b981"
          }
        ]
      },
      {
        "type": "line",
        "size": "full",
        "insight": "Poor CCL app uploads spiked to 424 MB the week of May 25 — 10× the prior week and the largest single-week data movement to risky apps in the 90-day period. Medium CCL uploads peaked at 101 MB in the Jun 1 week. Both spikes warrant investigation into which specific apps and users drove the volume.",
        "title": "Trend of Uploads to Non-Enterprise Apps by CCL — last 90 days",
        "anomalies": [
          {
            "index": 9,
            "value": 424,
            "label": "May 25 spike (424 MB)"
          }
        ],
        "series": [
          {
            "name": "Poor CCL",
            "color": "#ef4444",
            "values": [
              3,
              10,
              45,
              23,
              11,
              15,
              0,
              29,
              10,
              424,
              88,
              149,
              68
            ]
          },
          {
            "name": "Low CCL",
            "color": "#fb923c",
            "values": [
              10,
              16,
              12,
              20,
              5,
              8,
              0,
              21,
              6,
              28,
              11,
              16,
              2
            ]
          },
          {
            "name": "Medium CCL",
            "color": "#f59e0b",
            "values": [
              59,
              20,
              10,
              20,
              15,
              21,
              1,
              9,
              11,
              29,
              101,
              21,
              16
            ]
          }
        ],
        "xLabels": [
          "Mar 23",
          "Mar 30",
          "Apr 6",
          "Apr 13",
          "Apr 20",
          "Apr 27",
          "May 4",
          "May 11",
          "May 18",
          "May 25",
          "Jun 1",
          "Jun 8",
          "Jun 15"
        ]
      },
      {
        "type": "hbar",
        "size": "full",
        "insight": "Generative AI dominates non-enterprise uploads at 7,416 MB — 67% more than Streaming (4,438 MB) and 5× the next category. This volume indicates employees are actively submitting files and data into AI tools. Combined with poor CCL ratings for most GenAI apps, this represents the highest-priority DLP risk vector.",
        "title": "Top Non-Enterprise Cloud Categories by Upload Volume",
        "bars": [
          {
            "label": "Generative AI",
            "value": 7416,
            "color": "#ef4444"
          },
          {
            "label": "Streaming & Downloadable Video",
            "value": 4438,
            "color": "#f59e0b"
          },
          {
            "label": "Collaboration",
            "value": 1423,
            "color": "#fb923c"
          },
          {
            "label": "Technology",
            "value": 867,
            "color": "#6366f1"
          },
          {
            "label": "Chat, IM & Communication",
            "value": 648,
            "color": "#0ea5e9"
          },
          {
            "label": "Cloud Storage",
            "value": 490,
            "color": "#ef4444"
          },
          {
            "label": "News & Media",
            "value": 349,
            "color": "#94a3b8"
          },
          {
            "label": "Customer Relationship Mgmt",
            "value": 155,
            "color": "#94a3b8"
          },
          {
            "label": "Professional Networking",
            "value": 150,
            "color": "#f59e0b"
          }
        ]
      },
      {
        "type": "hbar",
        "size": "full",
        "insight": "Upload is the dominant high-risk activity across all unmanaged apps. Amazon Systems Manager and Google Gemini are high-CCL-risk upload destinations. ChatGPT uploads (87 events, Allowed) are the highest-severity finding — sensitive data submitting to a public LLM with no data retention controls. Review whether existing policies are blocking or only alerting on GenAI uploads.",
        "title": "Top Unmanaged/Unsanctioned Apps — High-Risk Activities",
        "bars": [
          {
            "label": "Amazon Systems Manager — Upload",
            "value": 312,
            "color": "#ef4444"
          },
          {
            "label": "Google Gmail — Upload",
            "value": 289,
            "color": "#f59e0b"
          },
          {
            "label": "Google Drive — Upload",
            "value": 241,
            "color": "#f59e0b"
          },
          {
            "label": "Google Gemini — Upload",
            "value": 198,
            "color": "#ef4444"
          },
          {
            "label": "Brave — Upload",
            "value": 167,
            "color": "#fb923c"
          },
          {
            "label": "Slack — Upload",
            "value": 142,
            "color": "#f59e0b"
          },
          {
            "label": "Google Calendar — Download",
            "value": 98,
            "color": "#0ea5e9"
          },
          {
            "label": "ChatGPT — Upload",
            "value": 87,
            "color": "#ef4444"
          }
        ]
      },
      {
        "type": "kpi",
        "size": "full",
        "insight": "1,664 files triggered DLP policies this period across 243 unique users — an average of 6.8 violations per user. The breadth of user impact (243) suggests systemic data handling patterns rather than isolated incidents, pointing to a training or workflow gap rather than targeted exfiltration.",
        "kpis": [
          {
            "label": "Files with DLP Violations",
            "value": "1,664"
          },
          {
            "label": "Users with DLP Violations",
            "value": "243"
          }
        ]
      },
      {
        "type": "donut",
        "size": "half",
        "insight": "Low severity alerts dominate at 75% — largely automated scans and informational findings. However, 12.3% Critical severity is significant: at 1,664 total files that equates to ~204 critical DLP findings that require prioritized review. The 10.8% Medium and 1.8% High also warrant triage before policy tuning.",
        "title": "DLP Policy Alerts by Severity",
        "slices": [
          {
            "label": "Low",
            "value": 75,
            "color": "#FBBF24"
          },
          {
            "label": "Critical",
            "value": 12,
            "color": "#F43F5E"
          },
          {
            "label": "Medium",
            "value": 11,
            "color": "#FB923C"
          },
          {
            "label": "High",
            "value": 2,
            "color": "#EF4444"
          }
        ]
      },
      {
        "type": "hbar",
        "size": "half",
        "insight": "Block is the most common policy action (221 users) — indicating aggressive enforcement is already in place for the majority of DLP violations. 27 users received coaching (useralert), which is the recommended intervention for Low/Medium severity. The 2 bypass users warrant investigation to confirm bypass authorization is valid.",
        "title": "User Count by DLP Policy Action",
        "bars": [
          {
            "label": "Block",
            "value": 221,
            "color": "#ef4444"
          },
          {
            "label": "Useralert (coaching)",
            "value": 27,
            "color": "#f59e0b"
          },
          {
            "label": "Alert",
            "value": 19,
            "color": "#fb923c"
          },
          {
            "label": "Revoke public sharing",
            "value": 4,
            "color": "#6366f1"
          },
          {
            "label": "Apply sensitivity label",
            "value": 6,
            "color": "#0ea5e9"
          },
          {
            "label": "Bypass",
            "value": 2,
            "color": "#94a3b8"
          }
        ]
      },
      {
        "type": "line",
        "size": "full",
        "insight": "DLP alert volume peaked the week of Mar 30 at 1,473, likely coinciding with a policy expansion. May 11 shows a secondary peak (1,121). The Jun 15 partial week shows 390 alerts — on pace for a lower-volume month if the trend holds, though this could reflect incomplete data rather than genuine improvement.",
        "title": "DLP Policy Alerts — Trend Over Time (last 90 days)",
        "anomalies": [
          {
            "index": 1,
            "value": 1473,
            "label": "Mar 30 peak (1,473)"
          }
        ],
        "series": [
          {
            "name": "DLP Alerts",
            "color": "#6366f1",
            "values": [
              562,
              1473,
              804,
              898,
              939,
              850,
              756,
              1121,
              648,
              887,
              480,
              624,
              390
            ]
          }
        ],
        "xLabels": [
          "Mar 23",
          "Mar 30",
          "Apr 6",
          "Apr 13",
          "Apr 20",
          "Apr 27",
          "May 4",
          "May 11",
          "May 18",
          "May 25",
          "Jun 1",
          "Jun 8",
          "Jun 15"
        ]
      },
      {
        "type": "table",
        "size": "full",
        "insight": "AI-Gateway on-demand scans account for the highest alert volume (3,406 + 602 = 4,008). Parallel Search MCP is the most concerning — three separate Critical/Low Block rules fired 866 times, indicating sensitive data is actively flowing into MCP servers. ChatGPT CASB API scans (1,733) confirm significant data submission to the public LLM.",
        "title": "DLP Policy Details — Top 15 Alerts",
        "columns": [
          "Policy",
          "Application",
          "Severity",
          "Action",
          "# Alerts",
          "Access Method"
        ],
        "rows": [
          [
            "N/A (scan)",
            "AI-Gateway",
            "Low",
            "Alert",
            "3,406",
            "DLP On Demand"
          ],
          [
            "Detect Credit Card / GDPR",
            "ChatGPT",
            "Low",
            "Alert",
            "1,733",
            "CASB API"
          ],
          [
            "N/A (scan)",
            "AI-Gateway",
            "Critical",
            "Alert",
            "602",
            "DLP On Demand"
          ],
          [
            "Apply PII Sensitivity Label",
            "Microsoft OneDrive",
            "Low",
            "Apply sensitivity label",
            "438",
            "CASB API"
          ],
          [
            "Browser Access DLP — Block",
            "Finance MyNetskopeDemo",
            "Medium",
            "Block",
            "407",
            "Browser Access"
          ],
          [
            "Block Sensitive Data → MCP",
            "Parallel Search MCP",
            "Critical",
            "Block",
            "381",
            "Explicit Proxy"
          ],
          [
            "[NPA EB] Allow Access to Web Apps",
            "[Flonkerton]",
            "Low",
            "Block",
            "310",
            "Enterprise Browser"
          ],
          [
            "Block Sensitive Data → MCP",
            "Parallel Search MCP",
            "Low",
            "Block",
            "248",
            "Explicit Proxy"
          ],
          [
            "[NPA EB] Allow Access to Web Apps",
            "[Finance Local EB]",
            "Medium",
            "Block",
            "238",
            "Enterprise Browser"
          ],
          [
            "Block Sensitive Data → MCP",
            "Parallel Search MCP",
            "Low",
            "Block",
            "237",
            "Explicit Proxy"
          ],
          [
            "Browser Access DLP — Block",
            "[Flonkerton]",
            "Low",
            "Block",
            "222",
            "Browser Access"
          ],
          [
            "Scan for PII in OneDrive",
            "Microsoft OneDrive",
            "Low",
            "Apply sensitivity label",
            "188",
            "CASB API"
          ],
          [
            "Block Sensitive Data → MCP",
            "Parallel Search MCP",
            "Critical",
            "Block",
            "186",
            "Explicit Proxy"
          ],
          [
            "[Context DLP] Low Severity",
            "Microsoft OneDrive",
            "Low",
            "Useralert",
            "149",
            "Client"
          ],
          [
            "Apply PII Sensitivity Label",
            "Microsoft OneDrive",
            "Critical",
            "Apply sensitivity label",
            "120",
            "CASB API"
          ]
        ]
      },
      {
        "type": "kpi",
        "size": "full",
        "insight": "31 malware detections and 11 malicious sites blocked over 90 days. Trojan and Virus variants dominate malware type, primarily detected via Enterprise Browser on managed app instances. The 11 blocked malicious sites include active phishing infrastructure — perplexity-ai[.]online (52 blocks, 1 user) is the most targeted.",
        "kpis": [
          {
            "label": "Malware Detected",
            "value": "31",
            "delta": "",
            "deltaDir": "up",
            "invertColor": true
          },
          {
            "label": "Malicious Sites Blocked",
            "value": "11",
            "delta": "",
            "deltaDir": "up",
            "invertColor": true
          }
        ]
      },
      {
        "type": "table",
        "size": "full",
        "insight": "vmonarque+web@ accounts for 3 separate malware detections including a Ransomware+Virus combination — the highest-risk user in the threat table. stevenw+web@ has two Trojan detections on fresh malware signatures. The 'get-unknown-pdf' object appears in 2 detections across different users, suggesting a shared malicious file in circulation within the org.",
        "title": "Malware Detections — Details",
        "columns": [
          "Application",
          "User",
          "Object / File",
          "Malware Name",
          "Type"
        ],
        "rows": [
          [
            "netskopesecuritych…",
            "vmonarque+web@…",
            "21",
            "Trojan.Script.EAB",
            "Exploit, Trojan"
          ],
          [
            "netskopesecuritych…",
            "vmonarque+web@…",
            "17",
            "Trojan.GenericKD.4…",
            "Virus"
          ],
          [
            "netskopesecuritych…",
            "ccole+web@netsko…",
            "17",
            "Trojan.GenericKD.4…",
            "Virus"
          ],
          [
            "X (Twitter)",
            "jatkins@netskope.c…",
            "script.txt",
            "Trojan.Generic.398…",
            "Virus"
          ],
          [
            "mynetskopedemo",
            "dtavernier+web@n…",
            "ns_freshmalware_6…",
            "Gen.Malware.Dete…",
            "Trojan"
          ],
          [
            "mynetskopedemo",
            "stevenw+web@net…",
            "ns_freshmalware_1…",
            "Gen.Malware.Dete…",
            "Trojan"
          ],
          [
            "mynetskopedemo",
            "stevenw+web@net…",
            "ns_freshmalware_8…",
            "Gen.Malware.Dete…",
            "Trojan"
          ],
          [
            "mynetskopedemo",
            "gbaileymcewan+we…",
            "get-unknown-pdf",
            "Gen.Malware.Dete…",
            "Trojan"
          ],
          [
            "mynetskopedemo",
            "mainsworth+web@…",
            "get-unknown-pdf",
            "Gen.Malware.Dete…",
            "Trojan"
          ],
          [
            "netskopesecuritych…",
            "vmonarque+web@…",
            "19",
            "Gen.Malware.Dete…",
            "Ransomware, Virus"
          ]
        ]
      },
      {
        "type": "table",
        "size": "full",
        "insight": "perplexity-ai[.]online is a typosquat of the legitimate Perplexity AI — 52 blocks from a single user suggests repeated attempts to access a lookalike GenAI site, possibly from a bookmark or link. chagpt[.]com (typosquat of ChatGPT) also appears with 4 blocks. Both indicate users seeking GenAI tools via unsanctioned channels and encountering phishing infrastructure.",
        "title": "Blocked Malicious Sites — Details",
        "columns": [
          "URL",
          "Category",
          "# Blocks",
          "# Users"
        ],
        "rows": [
          [
            "perplexity-ai[.]online/search",
            "Malicious Site",
            "52",
            "1"
          ],
          [
            "www[.]wicar[.]org/test-malware[.]html",
            "Malicious Site",
            "8",
            "3"
          ],
          [
            "lilianaorganic[.]com/document/au[.]php",
            "Malicious Site, Phish Site",
            "4",
            "1"
          ],
          [
            "chagpt[.]com/",
            "Malicious Site",
            "4",
            "1"
          ],
          [
            "incarnatepicturesque[.]com/72ea2…",
            "Malicious Site",
            "3",
            "1"
          ],
          [
            "ns-catid-580-sn[.]netskopetools[.]com/stop-icon…",
            "Malicious Site",
            "3",
            "2"
          ],
          [
            "ns-catid-589-sn[.]netskopetools[.]com/stop-icon…",
            "Cryptocurrency Mining",
            "3",
            "2"
          ],
          [
            "a60d31c2[.]outlookliveprotection…",
            "Malicious Site, Phish Site",
            "2",
            "1"
          ],
          [
            "ns-catid-586-sn[.]netskopetools[.]com/",
            "Malware Distribution Point",
            "2",
            "1"
          ],
          [
            "chagpt[.]com/favicon[.]ico",
            "Malicious Site",
            "2",
            "1"
          ]
        ]
      },
      {
        "type": "line",
        "size": "full",
        "insight": "Both malware and malsite signals are trending upward through June — each hitting their 90-day high in the Jun 15 week. While absolute numbers remain low, a consistent week-over-week increase in both categories warrants attention. If the trend continues at this rate, July could see 10+ malware events per week.",
        "title": "Trend of Malware & Malicious Sites — last 90 days",
        "series": [
          {
            "name": "Malware Detected",
            "color": "#ef4444",
            "values": [
              0,
              0,
              2,
              1,
              3,
              2,
              0,
              4,
              1,
              5,
              3,
              4,
              6
            ]
          },
          {
            "name": "Malsites Blocked",
            "color": "#7c3aed",
            "values": [
              0,
              0,
              1,
              0,
              1,
              0,
              0,
              1,
              0,
              2,
              1,
              2,
              3
            ]
          }
        ],
        "xLabels": [
          "Mar 23",
          "Mar 30",
          "Apr 6",
          "Apr 13",
          "Apr 20",
          "Apr 27",
          "May 4",
          "May 11",
          "May 18",
          "May 25",
          "Jun 1",
          "Jun 8",
          "Jun 15"
        ]
      },
      {
        "type": "kpi",
        "size": "full",
        "insight": "885 UBA alerts across 181 users and 30 applications — an average of 4.9 alerts per user. UCI threshold breaches and Bulk Failed Logins are the top alert types, indicating credential-related anomalies are the dominant behavioral signal. Microsoft 365 (SharePoint, OneDrive, Teams) and Parallel Search MCP generate the most UBA activity.",
        "kpis": [
          {
            "label": "Users with UBA Alerts",
            "value": "181"
          },
          {
            "label": "Apps with UBA Alerts",
            "value": "30"
          },
          {
            "label": "Total UBA Alerts",
            "value": "885"
          }
        ]
      },
      {
        "type": "hbar",
        "size": "full",
        "insight": "UCI threshold alerts (187) and Bulk Failed Logins (143) together account for 37% of UBA volume — both are high-fidelity credential compromise indicators. Ransomware-like behaviour in OneDrive (54 alerts) is the most critical finding: any confirmed ransomware activity in a cloud drive can propagate across synced devices. Prioritize these 54 alerts for immediate investigation.",
        "title": "Top UBA Alert Types by Volume",
        "bars": [
          {
            "label": "UCI threshold alert",
            "value": 187,
            "color": "#ef4444"
          },
          {
            "label": "Bulk Failed Logins",
            "value": 143,
            "color": "#ef4444"
          },
          {
            "label": "Rare Event",
            "value": 112,
            "color": "#f59e0b"
          },
          {
            "label": "First access from non-Netskope IP",
            "value": 98,
            "color": "#fb923c"
          },
          {
            "label": "Spike of 28 encrypted files uploaded (API)",
            "value": 87,
            "color": "#f59e0b"
          },
          {
            "label": "Sensitive data movement → Google Drive (RT)",
            "value": 74,
            "color": "#ef4444"
          },
          {
            "label": "First access AWS ap-southeast-2 (non-Netskope IP)",
            "value": 62,
            "color": "#fb923c"
          },
          {
            "label": "Ransomware-like behaviour in OneDrive (API Connector)",
            "value": 54,
            "color": "#ef4444"
          },
          {
            "label": "Spike of 20 encrypted files uploaded (API)",
            "value": 48,
            "color": "#f59e0b"
          },
          {
            "label": "Spike of 24 malware files uploaded (API)",
            "value": 20,
            "color": "#ef4444"
          }
        ]
      },
      {
        "type": "hbar",
        "size": "full",
        "insight": "Microsoft 365 apps (SharePoint, OneDrive, Teams) collectively generate 497 UBA alerts — 56% of total volume — reflecting their role as the primary data store and collaboration layer. Parallel Search MCP and Globalpinng MCP together account for 245 alerts, which is disproportionately high for tools that are not core productivity apps. MCP server UBA activity should be reviewed against expected usage patterns.",
        "title": "Top Applications Generating UBA Alerts",
        "bars": [
          {
            "label": "Microsoft SharePoint Online",
            "value": 198,
            "color": "#0ea5e9"
          },
          {
            "label": "Microsoft OneDrive for Business",
            "value": 187,
            "color": "#0ea5e9"
          },
          {
            "label": "Parallel Search MCP",
            "value": 156,
            "color": "#ef4444"
          },
          {
            "label": "Microsoft Teams",
            "value": 112,
            "color": "#0ea5e9"
          },
          {
            "label": "Globalpinng MCP",
            "value": 89,
            "color": "#ef4444"
          },
          {
            "label": "Google Drive",
            "value": 74,
            "color": "#f59e0b"
          },
          {
            "label": "Amazon EC2",
            "value": 69,
            "color": "#fb923c"
          }
        ]
      }
    ]
  },
  "genai-admin": {
    "title": "AI Usage",
    "description": "AI usage across the organization — users, top apps, detected activities, policy controls, and AI web traffic. Last 7 days, Generative AI category.",
    "summary": "Last 7 days: 10 users accessed AI apps and 5 queried them — 50% of active users in each case. ChatGPT leads with 246 events across 7 users; Microsoft 365 Copilot's 175 events come from a single subscribed integration. Most AI activity flows with no policy applied — the 'Detect Credit card information or GDPR info' policy on managed ChatGPT Enterprise generated the bulk of alerts (233 CASB API scan events), while block actions are rare. On the web side, chatgpt.com is the top AI domain and Google Gemini's mail-integrated endpoint moved the most uploaded data (7,580 KB).",
    "examplePrompts": [
      "Which AI apps are being used most?",
      "Show policy actions controlling AI usage",
      "Who are the top users accessing AI apps?"
    ],
    "about": {
      "blurb": "Use this report to understand AI Usage in your organization.",
      "questions": [
        "How many users are using AI in the organization?",
        "What are the top AI apps/sites in use?",
        "What activities are being detected in AI apps?",
        "How is AI use being controlled?"
      ]
    },
    "widgets": [
      {
        "type": "kpi",
        "size": "full",
        "insight": "Half of all active users accessed AI apps this week (10 users), and half of those went beyond browsing to actively query them (5 users submitting prompts). Querying is the higher-risk activity — it means data is flowing into AI models, not just pages being visited.",
        "kpis": [
          {
            "label": "Users Accessing AI Apps",
            "value": "10",
            "delta": "50% of users",
            "deltaDir": "up"
          },
          {
            "label": "Users Querying AI Apps",
            "value": "5",
            "delta": "50% of users",
            "deltaDir": "up"
          },
          {
            "label": "% of Users Accessing AI Apps",
            "value": "50%"
          },
          {
            "label": "% of Users Querying AI Apps",
            "value": "50%"
          }
        ]
      },
      {
        "type": "hbar",
        "size": "half",
        "insight": "ChatGPT (246) and Microsoft 365 Copilot (175) together account for 86% of all AI app events this week. Detected activities span Post, Response, Upload, Delete, CASB API Scan, and Copilot's SubscribedToAIInteractions — a mix of direct prompting and background integration traffic.",
        "title": "Activity in AI Apps — Event Count by Application",
        "bars": [
          {
            "label": "ChatGPT",
            "value": 246,
            "color": "#0ea5e9"
          },
          {
            "label": "Microsoft 365 Copilot",
            "value": 175,
            "color": "#6366f1"
          },
          {
            "label": "Anthropic Claude",
            "value": 32,
            "color": "#f97316"
          },
          {
            "label": "GitHub Copilot",
            "value": 30,
            "color": "#94a3b8"
          },
          {
            "label": "Google Gemini",
            "value": 6,
            "color": "#10b981"
          }
        ]
      },
      {
        "type": "hbar",
        "size": "half",
        "insight": "Most AI usage flows with No Action/Default Allow. ChatGPT is the exception — its events are predominantly alert-tagged via the CASB API scan on the managed Enterprise workspace. Hard blocks are rare and limited to a handful of AI Guardrails hits on Claude and ChatGPT posts/responses.",
        "title": "Action Taken on AI App Usage",
        "bars": [
          {
            "label": "ChatGPT — Alert",
            "value": 246,
            "color": "#f59e0b"
          },
          {
            "label": "Microsoft 365 Copilot — No Action",
            "value": 175,
            "color": "#94a3b8"
          },
          {
            "label": "Anthropic Claude — No Action / Block",
            "value": 32,
            "color": "#94a3b8"
          },
          {
            "label": "GitHub Copilot — No Action",
            "value": 30,
            "color": "#94a3b8"
          },
          {
            "label": "Google Gemini — No Action / Block",
            "value": 6,
            "color": "#94a3b8"
          }
        ]
      },
      {
        "type": "line",
        "size": "full",
        "insight": "ChatGPT and Microsoft 365 Copilot dominate weekly event volume, both trending down slightly week-over-week, while Anthropic Claude is the only app growing. Gemini activity is minimal at the app-event level — though its web-transaction footprint (below) tells a different story.",
        "title": "AI Usage Trend — App Events (weekly)",
        "series": [
          {
            "name": "ChatGPT",
            "color": "#0ea5e9",
            "values": [
              160,
              86
            ]
          },
          {
            "name": "Microsoft 365 Copilot",
            "color": "#6366f1",
            "values": [
              100,
              75
            ]
          },
          {
            "name": "Anthropic Claude",
            "color": "#f97316",
            "values": [
              12,
              20
            ]
          },
          {
            "name": "GitHub Copilot",
            "color": "#94a3b8",
            "values": [
              18,
              12
            ]
          },
          {
            "name": "Google Gemini",
            "color": "#10b981",
            "values": [
              2,
              4
            ]
          }
        ],
        "xLabels": [
          "Jul 13",
          "Jul 20"
        ]
      },
      {
        "type": "hbar",
        "size": "full",
        "insight": "ChatGPT has both the highest event count (246) and the broadest reach (7 users). Microsoft 365 Copilot's 175 events come from a single user via the SubscribedToAIInteractions integration — machine-driven volume rather than hands-on prompting. The remaining three apps are single- or two-user tools this week.",
        "title": "Top 10 AI Apps in Use — Event & User Count",
        "bars": [
          {
            "label": "ChatGPT (246 events · 7 users)",
            "value": 246,
            "color": "#0ea5e9"
          },
          {
            "label": "Microsoft 365 Copilot (175 events · 1 user)",
            "value": 175,
            "color": "#6366f1"
          },
          {
            "label": "Anthropic Claude (32 events · 2 users)",
            "value": 32,
            "color": "#f97316"
          },
          {
            "label": "GitHub Copilot (30 events · 1 user)",
            "value": 30,
            "color": "#94a3b8"
          },
          {
            "label": "Google Gemini (6 events · 1 user)",
            "value": 6,
            "color": "#10b981"
          }
        ]
      },
      {
        "type": "table",
        "size": "half",
        "insight": "ChatGPT and Google Gemini are each used on both the managed netskope.com instance and unauthenticated instances. Unauthenticated access carries no corporate identity binding — those two-user segments are where instance-aware policies (allow corporate, restrict personal) would tighten control.",
        "title": "Top Instances Detected — Instance Detail",
        "columns": [
          "Application",
          "Application Instance ID",
          "# Users",
          "# Events"
        ],
        "rows": [
          [
            "ChatGPT",
            "netskope.com",
            "1",
            "8"
          ],
          [
            "ChatGPT",
            "unauthenticated",
            "2",
            "4"
          ],
          [
            "Google Gemini",
            "netskope.com",
            "1",
            "3"
          ],
          [
            "Google Gemini",
            "unauthenticated",
            "2",
            "2"
          ]
        ]
      },
      {
        "type": "hbar",
        "size": "half",
        "insight": "The 'Web' user group has the most AI users (4), with NS_Block and ZTNA-Next-360 trailing. Group-level views like this identify where AI adoption is concentrated so policy and coaching can be targeted at the heaviest-using teams first.",
        "title": "Top User Groups with High AI Usage",
        "bars": [
          {
            "label": "Web",
            "value": 4,
            "color": "#0ea5e9"
          },
          {
            "label": "NS_Block",
            "value": 2,
            "color": "#94a3b8"
          },
          {
            "label": "ZTNA-Next-360",
            "value": 1,
            "color": "#94a3b8"
          }
        ]
      },
      {
        "type": "table",
        "size": "full",
        "insight": "The single largest event source is the CASB API scan on the managed ChatGPT Enterprise workspace — 233 alert events from the 'Detect Credit card information' policy, confirming regulated data is present in ChatGPT content. Most other activity carries no policy at all, and the only hard blocks are three AI Guardrails hits on Claude and ChatGPT. Unauthenticated ChatGPT instances are tagged Unsanctioned.",
        "title": "Details on App Events",
        "columns": [
          "Application",
          "Instance",
          "Tags",
          "Alert",
          "Policy Name",
          "Action",
          "Activity",
          "# Events",
          "# Users"
        ],
        "rows": [
          [
            "ChatGPT",
            "workspace_65f5f739…",
            "Untagged",
            "Yes",
            "Detect Credit card info…",
            "alert",
            "CASB API Scan",
            "233",
            "4"
          ],
          [
            "Microsoft 365 Copilot",
            "mynetskopedemo",
            "Sanctioned",
            "No",
            "∅",
            "∅",
            "SubscribedToAIInteract…",
            "175",
            "1"
          ],
          [
            "Anthropic Claude",
            "∅",
            "Untagged",
            "No",
            "∅",
            "∅",
            "Post",
            "19",
            "2"
          ],
          [
            "GitHub Copilot",
            "∅",
            "Untagged",
            "No",
            "∅",
            "∅",
            "Response",
            "15",
            "1"
          ],
          [
            "Anthropic Claude",
            "∅",
            "Untagged",
            "No",
            "∅",
            "∅",
            "Response",
            "10",
            "2"
          ],
          [
            "ChatGPT",
            "netskope.com",
            "Untagged",
            "No",
            "∅",
            "∅",
            "Delete",
            "7",
            "1"
          ],
          [
            "ChatGPT",
            "unauthenticated",
            "Unsanctioned",
            "No",
            "∅",
            "∅",
            "Post",
            "2",
            "2"
          ],
          [
            "Anthropic Claude",
            "∅",
            "Untagged",
            "Yes",
            "[AI Guardrails] Guardr…",
            "block",
            "Response",
            "2",
            "1"
          ],
          [
            "ChatGPT",
            "unauthenticated",
            "Unsanctioned",
            "No",
            "∅",
            "∅",
            "Upload",
            "2",
            "1"
          ],
          [
            "ChatGPT",
            "netskope.com",
            "Untagged",
            "Yes",
            "[AI Guardrails] Guardr…",
            "block",
            "Post",
            "1",
            "1"
          ]
        ]
      },
      {
        "type": "sankey",
        "size": "full",
        "insight": "Only two policies touch AI usage this week: the Credit card/GDPR detection on managed ChatGPT Enterprise (233 alert events via CASB API scan) and AI Guardrails (4 block events). Everything else — including all of Microsoft 365 Copilot's integration traffic — flows under No Policy to a default allow. The coverage gap, not the alert volume, is the headline.",
        "title": "Top Policies and Actions Controlling AI Usage"
      },
      {
        "type": "kpi",
        "size": "half",
        "insight": "No coaching (useralert) policies fired on AI usage this period. All policy responses were alerts or hard blocks — there is no intermediate coaching step building user awareness before enforcement.",
        "kpis": [
          {
            "label": "Coaching Policies",
            "value": "No results"
          }
        ]
      },
      {
        "type": "kpi",
        "size": "half",
        "insight": "No justification reasons were captured this period. Without coaching policies in place, users are never prompted to state a business reason for AI usage, so there is no visibility into intent behind the activity.",
        "kpis": [
          {
            "label": "Justification Reasons",
            "value": "No results"
          }
        ]
      },
      {
        "type": "table",
        "size": "full",
        "insight": "Not all AI solutions are applications — many are web traffic. chatgpt.com leads page-event visits, and zero events were blocked across all listed AI sites: at the page level, all AI web traffic is currently allowed. The Copilot telemetry and Anthropic API endpoints show IDE- and integration-level traffic alongside browser use.",
        "title": "AI Websites — Page Events Data",
        "columns": [
          "Site",
          "Category",
          "URL",
          "# Users",
          "# Events",
          "# Blocked Events"
        ],
        "rows": [
          [
            "ChatGPT",
            "Generative AI",
            "chatgpt.com",
            "3",
            "3",
            "0"
          ],
          [
            "ChatGPT",
            "Generative AI",
            "chatgpt.com/",
            "2",
            "2",
            "0"
          ],
          [
            "Anthropic",
            "Generative AI",
            "claude.ai",
            "1",
            "1",
            "0"
          ],
          [
            "GitHub Copilot",
            "Generative AI",
            "api.individual.githubcopilot.com",
            "1",
            "1",
            "0"
          ],
          [
            "NotebookLM",
            "Generative AI",
            "notebooklm.google.com/",
            "1",
            "1",
            "0"
          ],
          [
            "Anthropic",
            "Generative AI",
            "api.anthropic.com",
            "1",
            "1",
            "0"
          ],
          [
            "GitHub Copilot",
            "Generative AI",
            "telemetry.individual.githubcopilot.com",
            "1",
            "1",
            "0"
          ],
          [
            "Google Bard",
            "Generative AI",
            "gemini.google.com/",
            "1",
            "2",
            "0"
          ]
        ]
      },
      {
        "type": "line",
        "size": "full",
        "insight": "Granular AI web transactions swing widely day to day — from 42 on July 15 to a peak of 2,421 on July 17. Transaction-level data captures the request traffic behind AI domains, so these swings track real interaction intensity rather than page visits.",
        "title": "AI Transactions Trend — Transactions Data",
        "anomalies": [
          {
            "index": 3,
            "value": 2421,
            "label": "Jul 17 peak (2,421)"
          }
        ],
        "series": [
          {
            "name": "AI Transactions",
            "color": "#6366f1",
            "values": [
              1980,
              42,
              1402,
              2421,
              494,
              350,
              610
            ]
          }
        ],
        "xLabels": [
          "Jul 14",
          "Jul 15",
          "Jul 16",
          "Jul 17",
          "Jul 18",
          "Jul 19",
          "Jul 20"
        ]
      },
      {
        "type": "table",
        "size": "full",
        "insight": "Google Gemini's mail-integrated endpoint (appsgenaiserver, refered from mail.google.com) generated the most transactions (3,185) and the most uploaded data (7,580 KB) — Gemini's real usage lives in web traffic even though its app-event count is tiny. ChatGPT dominates download volume (~15,500 KB of model responses), and Claude's Datadog telemetry endpoint shows session metadata flowing to a third-party analytics service.",
        "title": "Top AI Domains — Transactions Data",
        "columns": [
          "App",
          "Domain",
          "Referer",
          "# Users",
          "# Events",
          "Uploaded (KB)",
          "Downloaded (KB)"
        ],
        "rows": [
          [
            "Google Gemini",
            "appsgenaiserver-pa.clients6.google.com",
            "mail.google.com",
            "3",
            "3,185",
            "7,580.92",
            "182.27"
          ],
          [
            "ChatGPT",
            "chatgpt.com",
            "chatgpt.com",
            "3",
            "446",
            "3,058.85",
            "8,464.31"
          ],
          [
            "ChatGPT",
            "chatgpt.com",
            "∅",
            "2",
            "595",
            "3,150.28",
            "7,005.31"
          ],
          [
            "Anthropic Claude",
            "claude.ai",
            "∅",
            "3",
            "90",
            "249.65",
            "229.75"
          ],
          [
            "Anthropic Claude",
            "api.anthropic.com",
            "∅",
            "2",
            "88",
            "3,761.44",
            "1,089.14"
          ],
          [
            "Anthropic Claude",
            "browser-intake-us5-datadoghq.com",
            "claude.ai",
            "2",
            "44",
            "605.79",
            "2.28"
          ],
          [
            "Anthropic Claude",
            "a-api.anthropic.com",
            "claude.ai",
            "3",
            "21",
            "132.20",
            "0.43"
          ],
          [
            "ChatGPT",
            "chatgpt.com",
            "backend-api/senti…",
            "3",
            "10",
            "46.94",
            "139.62"
          ],
          [
            "Anthropic Claude",
            "bridge.claudeusercontent.com",
            "∅",
            "3",
            "8",
            "6.57",
            "3.62"
          ],
          [
            "ChatGPT",
            "chatgpt.com",
            "www.google.com",
            "2",
            "3",
            "18.59",
            "240.67"
          ],
          [
            "ChatGPT",
            "cdn.openai.com",
            "chatgpt.com",
            "2",
            "2",
            "2.08",
            "111.46"
          ],
          [
            "Google Gemini",
            "geminiweb-pa.googleapis.com",
            "∅",
            "2",
            "2",
            "1.61",
            "0.22"
          ]
        ]
      }
    ]
  },
  "ai-risk-assessment": {
    "title": "AI Risk Assessment",
    "description": "Risky AI app usage, CCL ratings, policy coverage, and DLP alerts across Generative AI apps — last 7 days.",
    "summary": "80% of the 5 AI apps in use (4 apps) carry a Poor, Low, or Medium CCL rating. Medium-CCL apps account for 83.74% of AI-related data volume. 80% of AI apps (4 of 5) have no documented AI risk regulations & compliance posture and no vendor security assessment of genAI — though every app already has a genAI usage policy in place. The 'Detect Credit card information or GDPR info' policy generated 286 DLP alerts this period, and automation identities (appconnector_user, assistant) are the top alert sources rather than individual end users.",
    "examplePrompts": [
      "Which AI apps carry the highest risk?",
      "Show the DLP alert trend in AI usage",
      "What are users doing with the risky AI apps?"
    ],
    "about": {
      "blurb": "Use this report to assess the overall risk of using AI applications in your organization, including risk associated to GenAI attributes.",
      "questions": [
        "How many users are using risky AI apps in the organization?",
        "What are the top risky AI apps in use?",
        "How are AI apps use being controlled?",
        "Why are some AI apps considered to be risky?"
      ]
    },
    "widgets": [
      {
        "type": "kpi",
        "size": "full",
        "insight": "4 of the organization's 5 AI apps (80%) carry a Poor, Low, or Medium CCL rating, meaning most AI usage falls outside the safe range. ChatGPT is the single riskiest app by volume of activity, warranting the tightest DLP and guardrail coverage.",
        "kpis": [
          {
            "label": "Number of Risky AI Apps",
            "value": "4",
            "delta": "80% of AI apps",
            "deltaDir": "up",
            "invertColor": true
          },
          {
            "label": "Total AI Apps in Use",
            "value": "5"
          },
          {
            "label": "% of Risky AI Apps",
            "value": "80%",
            "delta": "poor/low/medium CCL",
            "neutral": true
          },
          {
            "label": "Top Risky AI App",
            "value": "ChatGPT"
          }
        ]
      },
      {
        "type": "line",
        "size": "full",
        "insight": "Daily users of risky AI apps ranged from 0 to 4 this week, peaking at 4 on July 17. The zero-usage day mid-week suggests access is bursty rather than continuous, so point-in-time snapshots understate how many distinct users touch these apps over a full week.",
        "title": "Number of Users Accessing Risky AI Apps — last 7 days",
        "anomalies": [
          {
            "index": 4,
            "value": 4,
            "label": "Jul 17 peak"
          }
        ],
        "series": [
          {
            "name": "Users",
            "color": "#0ea5e9",
            "values": [
              1,
              2,
              0,
              3,
              4,
              2,
              1
            ]
          }
        ],
        "xLabels": [
          "Jul 13",
          "Jul 14",
          "Jul 15",
          "Jul 16",
          "Jul 17",
          "Jul 18",
          "Jul 19"
        ]
      },
      {
        "type": "gauge",
        "size": "1/3",
        "insight": "Four of the five AI apps in use carry elevated risk. Since Poor, Low, and Medium CCL apps all qualify as 'risky' under this definition, tightening the definition to Poor only would shrink this figure substantially — useful context when prioritizing remediation.",
        "title": "% of Risky AI Apps Amongst All AI Apps",
        "value": 80
      },
      {
        "type": "donut",
        "size": "1/3",
        "insight": "Medium CCL apps dominate at 3 of 5 (60%), with one High and one Poor app (20% each). The absence of any 'Excellent' rated AI app in current usage means every sanctioned alternative still carries some assessed risk.",
        "title": "Count of AI Apps by CCL",
        "slices": [
          {
            "label": "medium",
            "value": 3,
            "color": "#f59e0b"
          },
          {
            "label": "high",
            "value": 1,
            "color": "#10b981"
          },
          {
            "label": "poor",
            "value": 1,
            "color": "#ef4444"
          }
        ]
      },
      {
        "type": "donut",
        "size": "1/3",
        "insight": "Medium CCL apps account for 83.74% of AI-related data volume — a single category dominating data exposure. Poor CCL apps carry just 2.81% of bytes, so byte-volume risk is concentrated in the medium tier rather than the worst-rated apps.",
        "title": "AI Usage in Total Bytes by CCL",
        "slices": [
          {
            "label": "medium",
            "value": 837,
            "color": "#f59e0b"
          },
          {
            "label": "high",
            "value": 134,
            "color": "#10b981"
          },
          {
            "label": "poor",
            "value": 28,
            "color": "#ef4444"
          }
        ]
      },
      {
        "type": "donut",
        "size": "half",
        "insight": "The four risky AI apps — ChatGPT, GitHub Copilot, Google Gemini, and Google NotebookLM — are in roughly equal use (25% each). Risk exposure is spread evenly across them rather than concentrated in one app, so controls need to cover all four.",
        "title": "Top 10 Risky AI Apps",
        "slices": [
          {
            "label": "ChatGPT",
            "value": 25,
            "color": "#0ea5e9"
          },
          {
            "label": "GitHub Copilot",
            "value": 25,
            "color": "#6366f1"
          },
          {
            "label": "Google Gemini",
            "value": 25,
            "color": "#f59e0b"
          },
          {
            "label": "Google NotebookLM",
            "value": 25,
            "color": "#10b981"
          }
        ]
      },
      {
        "type": "table",
        "size": "half",
        "insight": "Anthropic Claude is the only AI app in the High CCL band (CCI 84). GitHub Copilot, Google Gemini, and ChatGPT cluster in the Medium band (64–73), while Google NotebookLM's CCI of 46 makes it the poorest-rated app in use — the first candidate for tighter controls or a sanctioned alternative.",
        "title": "AI Apps Used by CCL Score",
        "columns": [
          "Application",
          "CCI"
        ],
        "rows": [
          [
            "Anthropic Claude",
            "84"
          ],
          [
            "GitHub Copilot",
            "73"
          ],
          [
            "Google Gemini",
            "67"
          ],
          [
            "ChatGPT",
            "64"
          ],
          [
            "Google NotebookLM",
            "46"
          ]
        ]
      },
      {
        "type": "table",
        "size": "full",
        "insight": "Every AI app in use shares customer data with its vendor (100%), and 80% (4 of 5) have no documented AI risk regulations & compliance posture and no vendor security assessment of genAI. Encouragingly, every app already has a genAI usage policy in place (0% without one), so enforcement — not policy creation — is the immediate opportunity.",
        "title": "AI Applications Risk Attributes",
        "columns": [
          "AI Applications Risk Attributes",
          "Percentage",
          "# Apps"
        ],
        "rows": [
          [
            "% of AI apps for which customer data is used for learning purposes",
            "40%",
            "2"
          ],
          [
            "% of AI apps for which customer data is shared with the vendor",
            "100%",
            "5"
          ],
          [
            "% of AI apps for which there is no tenant isolation support",
            "20%",
            "1"
          ],
          [
            "% of AI apps for which there are no AI risk regulations & compliance",
            "80%",
            "4"
          ],
          [
            "% of AI apps for which there is no genAI usage policy",
            "0%",
            "0"
          ],
          [
            "% of AI apps for which there is no security assessment of genAI by the vendor",
            "80%",
            "4"
          ]
        ]
      },
      {
        "type": "sankey",
        "size": "full",
        "insight": "All four AI apps route primarily through the '[AI Guardrails] Guardrails protection for SaaS AIs' policy, but every app also has a share of activity under 'No Policy' — traffic with no guardrail applied at all. Block is the dominant final action across Post, Response, Delete, and Upload activities, though a visible share still ends in No Action/Default Allow.",
        "title": "Top 10 Policies and Actions Controlling AI Usage"
      },
      {
        "type": "hbar",
        "size": "half",
        "insight": "A single policy — 'Detect Credit card information or GDPR info' — generated all 286 DLP alerts in AI usage this period, indicating regulated-data exposure is the sole active DLP concern across AI apps. No TSS alerts were recorded.",
        "title": "Top 10 Policies by # of DLP Alerts",
        "bars": [
          {
            "label": "Detect Credit card information or GDPR info in managed ChatGPT Enterprise",
            "value": 286,
            "color": "#0ea5e9"
          }
        ]
      },
      {
        "type": "hbar",
        "size": "half",
        "insight": "Automation identities dominate: appconnector_user (209) and the 'assistant' service account (59) generate 94% of DLP alert volume, while the two human users account for just 18 alerts combined. Reviewing automated integrations' access to sensitive data would address most of the exposure.",
        "title": "Top 10 Users by # of DLP Alerts",
        "bars": [
          {
            "label": "appconnector_user@demo-org.com",
            "value": 209,
            "color": "#0ea5e9"
          },
          {
            "label": "assistant",
            "value": 59,
            "color": "#0ea5e9"
          },
          {
            "label": "renukesh@demo-org.com",
            "value": 12,
            "color": "#94a3b8"
          },
          {
            "label": "mhaneef@demo-org.com",
            "value": 6,
            "color": "#94a3b8"
          }
        ]
      }
    ]
  },
  "insider-threat": {
    "title": "Insider Threat Dashboard",
    "description": "Insider threat: the risk that never goes away — risky users across intentional risky behavior, potential data loss, and cloud threats. Last 7 days.",
    "summary": "One user (vsundaram+web@demo-org.com, 37 events) shows risk indicators from all three insider-threat categories this week. Four users uploaded to non-corporate instances without data classification — vsundaram alone accounts for 27 events and 3.15 MB. On the data-loss side, one user ignored coaching and proceeded 16 times, and 15 users triggered DLP violations, led by automation identities (appconnector_user: 163). Cloud threats are limited to two users hitting blocked malicious sites. No shared-credential or compromised-credential alerts this period.",
    "examplePrompts": [
      "Who are the top risky users?",
      "Show UEBA anomaly clusters",
      "Where is sensitive data being uploaded?"
    ],
    "about": {
      "blurb": "Use this report to identify users with activities that are indicators of potential insider threat — add users to watchlist and tighten controls.",
      "questions": [
        "Which users show risk indicators across all three categories?",
        "Who is uploading to non-corporate instances or triggering bulk upload/download alerts?",
        "Who chose to proceed when coached, and who triggered DLP violations?",
        "Which users triggered malware, malicious site, or compromised-credential alerts?"
      ]
    },
    "widgets": [
      {
        "type": "kpi",
        "size": "full",
        "insight": "vsundaram+web@demo-org.com is the only user with events from all three risk indicator categories (37 events) — the strongest watchlist candidate this week. Four users uploaded to non-corporate instances, and 15 triggered DLP violations. A single user ignored coaching 16 times, which reads as either an unmet business need or a training gap.",
        "kpis": [
          {
            "label": "Users with All 3 Risk Categories",
            "value": "1",
            "delta": "37 events",
            "deltaDir": "up",
            "invertColor": true
          },
          {
            "label": "Uploading to Non-Corp Instances",
            "value": "4"
          },
          {
            "label": "Users Choosing to Proceed",
            "value": "1",
            "delta": "16 proceeds",
            "deltaDir": "up",
            "invertColor": true
          },
          {
            "label": "Users with DLP Violations",
            "value": "15"
          }
        ]
      },
      {
        "type": "hbar",
        "size": "half",
        "insight": "Two users dominate intentional risky behavior: netskopese (36 events) and vsundaram (28), driven by uploads to non-corporate instances and bulk upload/download UBA alerts. The recommended actions are adding them to the watchlist and tightening upload controls.",
        "title": "Top Risky Users — Intentional Risky Behavior",
        "bars": [
          {
            "label": "netskopese@demo-org.com",
            "value": 36,
            "color": "#F43F5E"
          },
          {
            "label": "vsundaram+web@demo-org.com",
            "value": 28,
            "color": "#EF4444"
          },
          {
            "label": "dbravo+web@demo-org.com",
            "value": 2,
            "color": "#FBBF24"
          },
          {
            "label": "jazofra+web@demo-org.com",
            "value": 2,
            "color": "#FBBF24"
          }
        ]
      },
      {
        "type": "table",
        "size": "half",
        "insight": "Non-corporate instances are those whose Instance IDs don't contain the corporate tenant. vsundaram moved 12 objects (3.15 MB) to non-corporate instances without document classification — the largest data movement in this category by both volume and object count.",
        "title": "Top Users Uploading to Non-Corporate Instances",
        "columns": [
          "User",
          "# Events",
          "# Objects",
          "File Size (MB)"
        ],
        "rows": [
          [
            "vsundaram+web@demo-org.com",
            "27",
            "12",
            "3.15"
          ],
          [
            "netskopese@demo-org.com",
            "8",
            "5",
            "0.00"
          ],
          [
            "jazofra+web@demo-org.com",
            "2",
            "2",
            "0.04"
          ],
          [
            "dbravo+web@demo-org.com",
            "2",
            "0",
            "0.00"
          ]
        ]
      },
      {
        "type": "line",
        "size": "full",
        "insight": "Uploads to non-corporate instances spiked to 30 events on July 16 — roughly 10x the daily baseline — then dropped back to near zero. A burst pattern like this usually traces to a single user moving a batch of files, which matches vsundaram's 27-event footprint.",
        "title": "Trend of Uploads to Non-Corporate Instances",
        "anomalies": [
          {
            "index": 2,
            "value": 30,
            "label": "Jul 16 spike"
          }
        ],
        "series": [
          {
            "name": "Upload events",
            "color": "#0ea5e9",
            "values": [
              3,
              6,
              30,
              2,
              1,
              0,
              2
            ]
          }
        ],
        "xLabels": [
          "Jul 14",
          "Jul 15",
          "Jul 16",
          "Jul 17",
          "Jul 18",
          "Jul 19",
          "Jul 20"
        ]
      },
      {
        "type": "table",
        "size": "half",
        "insight": "UBA behavioral alerts are low-volume but high-signal: netskopese appears in both bulk upload and bulk download — the only user with both movement patterns. No user-shared-credential alerts fired this period.",
        "title": "UBA Alerts — Bulk Upload / Download / Shared Credentials",
        "columns": [
          "UBA Indicator",
          "# Users",
          "Top Users"
        ],
        "rows": [
          [
            "Bulk Upload",
            "2",
            "netskopese (1) · vsundaram+web (1)"
          ],
          [
            "Bulk Download",
            "1",
            "netskopese (1)"
          ],
          [
            "User-Shared Credentials",
            "0",
            "No results"
          ]
        ]
      },
      {
        "type": "table",
        "size": "half",
        "insight": "One user proceeded past coaching pages 16 times this week. Repeated proceeds indicate either a legitimate business need that should be enabled through an exception, or a user who needs security-awareness training — worth a direct follow-up either way.",
        "title": "Top 10 Users Choosing to Proceed when Coached",
        "columns": [
          "User",
          "User Group",
          "# Alerts"
        ],
        "rows": [
          [
            "gpilz+web@demo-org.com",
            "Web",
            "16"
          ]
        ]
      },
      {
        "type": "hbar",
        "size": "full",
        "insight": "DLP violations are led by automation identities — appconnector_user (163) and the 'assistant' service account (52) — rather than employees. For the human users, the typical follow-ups are: enable an exception for a legitimate business need, fine-tune the policy to cut false positives, or provide awareness training.",
        "title": "Top Users with DLP Violations",
        "bars": [
          {
            "label": "appconnector_user@demo-org.com",
            "value": 163,
            "color": "#F43F5E"
          },
          {
            "label": "assistant",
            "value": 52,
            "color": "#EF4444"
          },
          {
            "label": "renukesh@demo-org.com",
            "value": 12,
            "color": "#FB923C"
          },
          {
            "label": "adunham@demo-org.com (CE-Sales Engineering)",
            "value": 11,
            "color": "#FB923C"
          },
          {
            "label": "adunham@demo-org.com (JIT Users)",
            "value": 11,
            "color": "#FB923C"
          },
          {
            "label": "netskopese@demo-org.com",
            "value": 8,
            "color": "#FBBF24"
          },
          {
            "label": "mhaneef@demo-org.com",
            "value": 6,
            "color": "#FBBF24"
          },
          {
            "label": "vsundaram+web@demo-org.com",
            "value": 6,
            "color": "#FBBF24"
          },
          {
            "label": "vbojkovic+web@demo-org.com",
            "value": 5,
            "color": "#FBBF24"
          },
          {
            "label": "preyes+web@demo-org.com",
            "value": 4,
            "color": "#FBBF24"
          }
        ]
      },
      {
        "type": "table",
        "size": "half",
        "insight": "Two users triggered malicious-site alerts, all blocked, each against a single site — repeated attempts to reach the same destination rather than broad risky browsing. Both are candidates for user coaching on the specific site involved.",
        "title": "Top Users by Malicious Sites",
        "columns": [
          "User",
          "Action Taken",
          "# Alerts",
          "# Sites"
        ],
        "rows": [
          [
            "wdoria+web@demo-org.com",
            "block",
            "9",
            "1"
          ],
          [
            "nuno+web@demo-org.com",
            "block",
            "2",
            "1"
          ]
        ]
      },
      {
        "type": "table",
        "size": "half",
        "insight": "Cloud-threat exposure is contained this week: two users on blocked malicious sites, one user with malware alerts via Enterprise Browser, and no compromised credentials detected for tracked domains. The recommended follow-ups are awareness training and keeping block/quarantine controls in place.",
        "title": "Cloud Threats — Users by Indicator",
        "columns": [
          "Threat Indicator",
          "# Users",
          "Detail"
        ],
        "rows": [
          [
            "Malicious Sites",
            "2",
            "wdoria+web (9 alerts) · nuno+web (2)"
          ],
          [
            "Malware",
            "1",
            "Enterprise Browser access method"
          ],
          [
            "Compromised Credentials",
            "0",
            "No results"
          ]
        ]
      }
    ]
  }
}

export const getReportDetail = (id: string): ReportDetail | undefined => {
  const detail = DETAILS[id]
  return detail ? { id, ...detail } : undefined
}

export const hasReportDetail = (id: string) => id in DETAILS
