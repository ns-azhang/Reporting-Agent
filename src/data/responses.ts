/**
 * Canned assistant responses, extracted from the prototype's RESPONSES map —
 * the ones Session History references, so resuming a session restores the real
 * answers rather than placeholder text.
 *
 * chartType maps onto the widget renderers:
 *   kpi+line -> KPI row above a trend line
 *   hbar     -> horizontal bars
 *   table    -> data table (nested under `table` in the prototype)
 *   action   -> no chart; a prepared action carried by its summary. Note the
 *               prototype also puts columns/rows on these, but they describe
 *               the generated artifact (rows: 1284 is a count), not a table,
 *               so they are deliberately not carried over.
 */

export type ResponseChartType = "kpi+line" | "hbar" | "table" | "action"

export type Response = {
  title: string
  chartType: ResponseChartType
  summary: string
  followUps: string[]
  kpis?: {
    label: string
    value: string
    delta?: string
    deltaDir?: "up" | "down"
    invertColor?: boolean
  }[]
  series?: { name: string; color: string; values: number[] }[]
  xLabels?: string[]
  /** `color` is optional — some responses leave their bars unstyled. */
  bars?: { label: string; value: number; color?: string }[]
  columns?: string[]
  rows?: string[][]
}

export const RESPONSES: Record<string, Response> = {
  "critical-only": {
    "title": "Critical incidents only — last 7 days",
    "chartType": "kpi+line",
    "summary": "Critical-severity incidents are up 39% week-over-week, with Saturday's spike (19) being the largest single-day count in the last quarter. PCI policy violations (24) account for the largest share of Criticals; PII (21) is close behind. 75% of Criticals are already resolved — but the remaining 16 have aged past the 4-hour SLA.",
    "followUps": [
      "Show the 16 unresolved Critical incidents",
      "Which users triggered Critical incidents?",
      "Trend Critical/High over 30 days",
      "Send the Critical list to #dlp-triage"
    ],
    "kpis": [
      {
        "label": "Critical incidents",
        "value": "64",
        "delta": "+39%",
        "deltaDir": "up",
        "invertColor": true
      },
      {
        "label": "Unique users",
        "value": "23"
      },
      {
        "label": "Top policy",
        "value": "PCI"
      },
      {
        "label": "Resolved",
        "value": "48 / 64"
      }
    ],
    "series": [
      {
        "name": "Critical",
        "color": "#F43F5E",
        "values": [
          4,
          6,
          7,
          8,
          11,
          19,
          9
        ]
      }
    ],
    "xLabels": [
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat",
      "Sun"
    ]
  },
  "policies-critical": {
    "title": "Policies generating Critical incidents",
    "chartType": "hbar",
    "summary": "Critical-severity incidents are concentrated in regulated data classes — PCI (78) and PII (64) account for 64% of all Criticals over 30 days. Healthcare PHI (41) is the third largest, driven by file shares from a small clinical-services team. M&A and Legal have low absolute counts but every incident there is high impact.",
    "followUps": [
      "Drill into PCI Critical incidents",
      "Show the M&A incident details",
      "Recommend a Critical-only review SLA",
      "Trend Critical incidents over 30 days"
    ],
    "bars": [
      {
        "label": "PCI Financial",
        "value": 78,
        "color": "#F43F5E"
      },
      {
        "label": "Customer PII",
        "value": 64,
        "color": "#F43F5E"
      },
      {
        "label": "Healthcare — PHI",
        "value": 41
      },
      {
        "label": "Source Code — restricted",
        "value": 22
      },
      {
        "label": "M&A — Restricted",
        "value": 14
      },
      {
        "label": "Legal — Contracts",
        "value": 5
      }
    ]
  },
  "resolution-time-severity": {
    "title": "Average resolution time by severity",
    "chartType": "hbar",
    "summary": "Critical incidents are resolving in ~5h12m on average — 30% over the 4h SLA target. High-severity is meeting target (~19h vs. 24h target). Medium and Low both well within target. The Critical SLA miss is concentrated in Saturday spike traffic, where on-call responders had longer pickup times.",
    "followUps": [
      "Show Critical incidents that breached SLA",
      "Trend resolution time over 30 days",
      "Compare to last quarter's resolution times",
      "Recommend SLA changes"
    ],
    "bars": [
      {
        "label": "Critical (target ≤ 4h)",
        "value": 312,
        "color": "#F43F5E"
      },
      {
        "label": "High (target ≤ 24h)",
        "value": 1142
      },
      {
        "label": "Medium (target ≤ 7d)",
        "value": 4080,
        "color": "#94a3b8"
      },
      {
        "label": "Low (target ≤ 30d)",
        "value": 18240,
        "color": "#94a3b8"
      }
    ]
  },
  "policy-detail-pii": {
    "title": "Confidential — Customer PII · last 7 days",
    "chartType": "kpi+line",
    "summary": "Customer PII violations grew 22% week-over-week. Friday and Saturday concentrated 34% of the volume. 78% of incidents were uploads to personal Google Drive accounts, and the most-frequent data class match was customer email addresses + phone numbers in the same row.",
    "followUps": [
      "Which users triggered this policy most?",
      "Show the destination breakdown for PII",
      "Trend over the last 30 days",
      "Recommend a policy update"
    ],
    "kpis": [
      {
        "label": "Violations",
        "value": "412",
        "delta": "+22%",
        "deltaDir": "up",
        "invertColor": true
      },
      {
        "label": "Unique users",
        "value": "61"
      },
      {
        "label": "Top destination",
        "value": "GDrive"
      },
      {
        "label": "Avg severity",
        "value": "High"
      }
    ],
    "series": [
      {
        "name": "Violations",
        "color": "#7c3aed",
        "values": [
          42,
          51,
          58,
          54,
          67,
          81,
          59
        ]
      }
    ],
    "xLabels": [
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat",
      "Sun"
    ]
  },
  "apps-source-code": {
    "title": "Apps receiving Source Code uploads — last 7 days",
    "chartType": "hbar",
    "summary": "Source code is leaving the corporate perimeter primarily through Slack DMs to external workspaces (124 incidents) and pushes to public GitHub repos (68). Pastebin and Telegram Web account for a smaller but particularly high-risk channel — typically associated with intent to exfiltrate rather than convenience.",
    "followUps": [
      "Show users uploading to public GitHub",
      "Block recommendation for these destinations",
      "Trend source-code policy over 30 days",
      "Filter to only external Slack workspaces"
    ],
    "bars": [
      {
        "label": "Slack (external workspace)",
        "value": 124,
        "color": "#f59e0b"
      },
      {
        "label": "GitHub (public repo)",
        "value": 68,
        "color": "#ef4444"
      },
      {
        "label": "Personal email — Gmail",
        "value": 47,
        "color": "#ef4444"
      },
      {
        "label": "Pastebin",
        "value": 23,
        "color": "#ef4444"
      },
      {
        "label": "Discord",
        "value": 18,
        "color": "#f59e0b"
      },
      {
        "label": "Telegram Web",
        "value": 11,
        "color": "#ef4444"
      }
    ]
  },
  "weekly-overview": {
    "title": "DLP Incidents — Last 7 Days",
    "chartType": "kpi+line",
    "summary": "DLP incidents climbed 18% week-over-week, driven mostly by a Saturday spike that pushed Critical and High severity counts up 24%. The increase is concentrated in two policies — Confidential — Customer PII and Source Code — Internal Only — which together account for ~58% of new incidents. Triage time improved 9%, suggesting the analyst team is keeping pace despite higher volume.",
    "followUps": [
      "What caused the Saturday spike?",
      "Break this down by policy",
      "Show the same chart for last week for comparison",
      "Which users were involved in the Saturday spike?"
    ],
    "kpis": [
      {
        "label": "Total incidents",
        "value": "1,284",
        "delta": "+18%",
        "deltaDir": "up",
        "invertColor": true
      },
      {
        "label": "Critical / High",
        "value": "203",
        "delta": "+24%",
        "deltaDir": "up",
        "invertColor": true
      },
      {
        "label": "Mean time to triage",
        "value": "42m",
        "delta": "−9%",
        "deltaDir": "down"
      },
      {
        "label": "Policies firing",
        "value": "12 / 38"
      }
    ],
    "series": [
      {
        "name": "Incidents",
        "color": "#2563eb",
        "values": [
          142,
          158,
          171,
          165,
          198,
          224,
          226
        ]
      }
    ],
    "xLabels": [
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat",
      "Sun"
    ]
  },
  "policy-compare-quarter": {
    "title": "Top policies — this quarter vs. last quarter",
    "chartType": "hbar",
    "summary": "Quarter-over-quarter, Source Code violations are up 71% and Customer PII up 30% — the largest movers. PCI Financial is up modestly (+13%). HR Documents is the only top-policy that declined (−15%). Two new policies went live mid-Q2 that may explain ~12% of the PII increase.",
    "followUps": [
      "Which 2 policies went live mid-Q2?",
      "Show 30-day trend for Source Code",
      "Top users for Source Code violations",
      "Recommend a policy update"
    ],
    "bars": [
      {
        "label": "Customer PII (Q2)",
        "value": 1842,
        "color": "#7c3aed"
      },
      {
        "label": "Customer PII (Q1)",
        "value": 1421,
        "color": "#fda4af"
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
      },
      {
        "label": "HR Documents (Q2)",
        "value": 421
      },
      {
        "label": "HR Documents (Q1)",
        "value": 498,
        "color": "#cbd5e1"
      }
    ]
  },
  "export-pdf": {
    "title": "PDF export ready",
    "chartType": "action",
    "summary": "Generated an executive-friendly PDF (5 pages, 1,284 rows summarized into charts). It includes the KPI scorecard, the severity donut, top-10 policies and users, and an anomaly callout for the Saturday spike. Designed to be readable on tablet and print without losing data fidelity.",
    "followUps": [
      "Send to the #dlp-triage Slack channel",
      "Switch back to CSV format",
      "Filter to Critical/High before exporting"
    ]
  },
  "top-users": {
    "title": "Top Users by DLP Incident Count — Last 30 Days",
    "chartType": "hbar",
    "summary": "Two users — j.morales and k.tanaka — together account for 151 incidents (24% of the total), well above the team baseline of ~12 incidents per user per month. Both belong to Customer Success, and most violations involve attaching customer reports to outbound email — likely a mis-configured workflow rather than active exfiltration, but worth review.",
    "followUps": [
      "Show j.morales's incidents in detail",
      "Which policies is k.tanaka triggering?",
      "Compare to the same users last month",
      "Are these users sharing data with the same destinations?"
    ],
    "bars": [
      {
        "label": "j.morales@abc.com",
        "value": 87,
        "color": "#ef4444"
      },
      {
        "label": "k.tanaka@abc.com",
        "value": 64,
        "color": "#ef4444"
      },
      {
        "label": "r.singh@abc.com",
        "value": 52
      },
      {
        "label": "m.oconnell@abc.com",
        "value": 41
      },
      {
        "label": "s.aldridge@abc.com",
        "value": 38
      },
      {
        "label": "p.diallo@abc.com",
        "value": 29
      },
      {
        "label": "h.becker@abc.com",
        "value": 22
      },
      {
        "label": "Others (124 users)",
        "value": 311,
        "color": "#94a3b8"
      }
    ]
  },
  "users-compare-month": {
    "title": "Top users — this month vs. last month",
    "chartType": "hbar",
    "summary": "Among the top 3 repeat offenders, j.morales is up 67% month-over-month and r.singh up 37% — both moving in the wrong direction. k.tanaka is slightly down (−10%). The team baseline is essentially unchanged, indicating the increase in UEBA alerts is driven by a small number of users rather than a systemic shift.",
    "followUps": [
      "Drill into j.morales",
      "Show how their destinations have changed",
      "Send a digest to their managers",
      "Recommend coaching"
    ],
    "bars": [
      {
        "label": "j.morales (this mo.)",
        "value": 87,
        "color": "#ef4444"
      },
      {
        "label": "j.morales (last mo.)",
        "value": 52,
        "color": "#fda4af"
      },
      {
        "label": "k.tanaka (this mo.)",
        "value": 64,
        "color": "#ef4444"
      },
      {
        "label": "k.tanaka (last mo.)",
        "value": 71,
        "color": "#fda4af"
      },
      {
        "label": "r.singh (this mo.)",
        "value": 52
      },
      {
        "label": "r.singh (last mo.)",
        "value": 38,
        "color": "#cbd5e1"
      },
      {
        "label": "Team baseline (this mo.)",
        "value": 12,
        "color": "#94a3b8"
      },
      {
        "label": "Team baseline (last mo.)",
        "value": 11,
        "color": "#cbd5e1"
      }
    ]
  },
  "user-detail-jmorales": {
    "title": "j.morales@abc.com · UEBA alert breakdown — last 30 days",
    "chartType": "table",
    "summary": "j.morales's 87 UEBA alerts in the last 30 days are concentrated in bulk uploads to personal Google Drive (34) and unusual access pattern alerts from outbound email (28). All five activity types involve moving data out of corporate controls — Google Drive personal is the dominant exfiltration vector. Most alerts fire Friday afternoons. No previous escalations in the last 90 days.",
    "followUps": [
      "Show the destinations j.morales used",
      "View full incident timeline",
      "Compare j.morales vs. team baseline"
    ],
    "columns": [
      "Activity",
      "App",
      "UEBA Alert",
      "Alerts"
    ],
    "rows": [
      [
        "File upload",
        "Google Drive (personal)",
        "Bulk upload",
        "34"
      ],
      [
        "Email attachment",
        "Outbound email — Gmail",
        "Unusual access pattern",
        "28"
      ],
      [
        "File upload",
        "Dropbox (personal)",
        "Bulk upload",
        "12"
      ],
      [
        "File share",
        "Slack DM (external)",
        "Data exfiltration",
        "7"
      ],
      [
        "File upload",
        "OneDrive (corporate)",
        "Privilege escalation",
        "6"
      ]
    ]
  },
  "destinations": {
    "title": "Sensitive File Movement — Top Destination Apps",
    "chartType": "hbar",
    "summary": "Unsanctioned destinations (red) account for 60% of sensitive file movement this week — Google Drive personal accounts alone received 284 files. Movement to corporate-managed apps (Box, OneDrive) is healthy at ~25% of volume. Slack external workspaces and public GitHub remain the top risk channels for source-code data.",
    "followUps": [
      "What types of files are going to personal Google Drive?",
      "Which users are uploading to WeTransfer?",
      "Show me sanctioned vs. unsanctioned trend over time",
      "Block recommendation for the top destinations"
    ],
    "bars": [
      {
        "label": "Google Drive (personal)",
        "value": 284,
        "color": "#ef4444"
      },
      {
        "label": "Dropbox (personal)",
        "value": 167,
        "color": "#ef4444"
      },
      {
        "label": "Slack (external workspace)",
        "value": 142,
        "color": "#f59e0b"
      },
      {
        "label": "Box (corporate)",
        "value": 118,
        "color": "#10b981"
      },
      {
        "label": "OneDrive (corporate)",
        "value": 94,
        "color": "#10b981"
      },
      {
        "label": "WeTransfer",
        "value": 61,
        "color": "#ef4444"
      },
      {
        "label": "GitHub (public)",
        "value": 48,
        "color": "#f59e0b"
      }
    ]
  },
  "block-recommendation": {
    "title": "Recommended policy actions",
    "chartType": "action",
    "summary": "Four recommended changes, ordered by impact-per-friction. Drafting a policy from any of these creates a proposal in your existing review workflow — no automatic enforcement.",
    "followUps": [
      "Show me the affected users for recommendation 1",
      "Send the recommendations to security architecture",
      "Compare PCI false-positive rate before vs. after"
    ]
  },
  "users-wetransfer": {
    "title": "Users uploading to high-risk destinations",
    "chartType": "hbar",
    "summary": "73 sensitive uploads this week went to WeTransfer, public GitHub, or Pastebin. 4 users contributed 70% of those incidents. j.morales and n.fernandez are first-time appearances on this list — worth a manager-level coaching conversation given the destinations involved.",
    "followUps": [
      "Show the file types involved",
      "Block these destinations entirely",
      "Send a manager digest",
      "Open user detail for n.fernandez"
    ],
    "bars": [
      {
        "label": "j.morales@abc.com",
        "value": 18,
        "color": "#ef4444"
      },
      {
        "label": "n.fernandez@abc.com",
        "value": 14,
        "color": "#ef4444"
      },
      {
        "label": "p.diallo@abc.com",
        "value": 11
      },
      {
        "label": "h.becker@abc.com",
        "value": 8
      },
      {
        "label": "Other (12 users)",
        "value": 22,
        "color": "#94a3b8"
      }
    ]
  },
  "policy-trend-30d": {
    "title": "Top 4 policies — 30-day violation trend",
    "chartType": "kpi+line",
    "summary": "Customer PII and Source Code policies account for the bulk of the upward drift — Source Code in particular grew 62% over the 30-day window. PCI Financial follows the same growth shape but at lower magnitude. HR Documents is the only top-policy trending down (−14%), likely reflecting onboarding-season ending.",
    "followUps": [
      "What's driving the Source Code growth?",
      "Show forecast for the next 7 days",
      "Drill into Customer PII",
      "Compare to last quarter"
    ],
    "kpis": [
      {
        "label": "Total (30d)",
        "value": "4,612"
      },
      {
        "label": "Fastest growing",
        "value": "Source Code",
        "delta": "+62%",
        "deltaDir": "up",
        "invertColor": true
      },
      {
        "label": "Most stable",
        "value": "PHI"
      },
      {
        "label": "Trending down",
        "value": "HR Docs",
        "delta": "−14%",
        "deltaDir": "down",
        "invertColor": true
      }
    ],
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
  }
}

export const getResponse = (id: string): Response | undefined => RESPONSES[id]
