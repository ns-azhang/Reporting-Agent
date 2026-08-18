/**
 * Canned assistant responses — the prototype's full RESPONSES map, extracted by
 * evaluating it rather than scraping, so figures, colours and copy are exact.
 *
 * classifyPrompt() in @/lib/classify-prompt picks one of these for a free-typed
 * prompt; follow-up chips name their target by id, so a chain of follow-ups
 * walks the same path it does in the prototype.
 *
 * chartType maps onto the widget renderers:
 *   kpi       -> KPI scorecard row
 *   kpi+line  -> KPI row above a trend line
 *   hbar      -> horizontal bars
 *   donut     -> donut with a value/percent legend
 *   table      -> data table (nested under `table`, as in the prototype)
 *   action    -> no chart; a prepared export / schedule / Slack post / policy
 *                recommendation, rendered by ActionPanel
 *   ack       -> a one-line acknowledgement, the terminal state of an action
 *
 * Not ported: the two agent-flow responses (v6 has no agent builder), and the
 * `drill` targets the prototype attaches to individual bars and slices — those
 * have no visible affordance, unlike an anomaly marker, which carries one.
 */

export type ResponseChartType =
  | "kpi"
  | "kpi+line"
  | "hbar"
  | "donut"
  | "table"
  | "action"
  | "ack"

/** A suggested follow-up. `id` names the response it leads to; without one the
 *  prompt is classified like any other free-typed question. */
export type FollowUp = { text: string; id?: string }

export type ResponseKpi = {
  label: string
  value: string
  delta?: string
  deltaDir?: "up" | "down"
  /** "up is bad" metrics — more incidents is worse, so the colour inverts. */
  invertColor?: boolean
}

export type ExportAction = {
  kind: "export"
  filename: string
  rows: number
  columns: string[]
  sizeKb: number
  format: string
}
export type ScheduleAction = {
  kind: "schedule"
  title: string
  firstRun: string
  fields: { label: string; value: string }[]
}
export type SendAction = {
  kind: "send"
  title: string
  channel: string
  preview: string
}
export type RecommendationAction = {
  kind: "recommendation"
  title: string
  recommendations: { title: string; detail: string }[]
}
export type ResponseAction =
  | ExportAction
  | ScheduleAction
  | SendAction
  | RecommendationAction

export type Response = {
  title: string
  chartType: ResponseChartType
  summary: string
  followUps: FollowUp[]
  kpis?: ResponseKpi[]
  series?: { name: string; color: string; values: number[] }[]
  xLabels?: string[]
  /** Points called out on the line chart. `drill` makes the marker clickable,
   *  asking that question the way a follow-up chip does. */
  anomalies?: {
    index: number
    value: number
    label: string
    drill?: FollowUp
  }[]
  /** Index from which the series is projected rather than observed. */
  forecastIndex?: number
  /** `color` is optional — some responses leave their bars unstyled. */
  bars?: { label: string; value: number; color?: string }[]
  slices?: { label: string; value: number; color?: string }[]
  table?: { columns: string[]; rows: string[][] }
  action?: ResponseAction
  /** "cancelled" flips the acknowledgement from confirming to unwinding. */
  ackKind?: "acknowledged" | "cancelled"
}

export const RESPONSES: Record<string, Response> = {
  "sa-access-methods": {
    "title": "Access Methods — User Count",
    "chartType": "hbar",
    "summary": "Client is the dominant access method with 210 users — more than double API Connector (95) and five times Enterprise Browser (42). API Connector covers apps without native client support, while limited Enterprise Browser adoption suggests room to expand browser-based isolation for higher-risk web access.",
    "followUps": [
      {
        "text": "Show DLP profile breakdown",
        "id": "sa-dlp-profile-breakdown"
      },
      {
        "text": "Who are the top users with UBA alerts?",
        "id": "sa-top-uba-users"
      },
      {
        "text": "Which cloud apps have the poorest CCL rating?",
        "id": "destinations"
      }
    ],
    "bars": [
      {
        "label": "Client",
        "value": 210,
        "color": "#0ea5e9"
      },
      {
        "label": "API Connector",
        "value": 95,
        "color": "#0ea5e9"
      },
      {
        "label": "Enterprise Browser",
        "value": 42,
        "color": "#94a3b8"
      }
    ]
  },
  "sa-dlp-profile-breakdown": {
    "title": "DLP Profile Breakdown",
    "chartType": "donut",
    "summary": "PII accounts for 980 of the 1,664 DLP violations (59%) — by far the largest profile — followed by PHI (412, 25%) and PCI (272, 16%). The heavy skew toward PII suggests general customer/employee data handling is the primary DLP risk, ahead of healthcare- or payment-card-specific exposure.",
    "followUps": [
      {
        "text": "What access methods are being used in my environment?",
        "id": "sa-access-methods"
      },
      {
        "text": "Who are the top users with UBA alerts?",
        "id": "sa-top-uba-users"
      },
      {
        "text": "Show top users with DLP violations",
        "id": "top-users"
      }
    ],
    "slices": [
      {
        "label": "PII",
        "value": 980,
        "color": "#7c3aed"
      },
      {
        "label": "PHI",
        "value": 412,
        "color": "#0ea5e9"
      },
      {
        "label": "PCI",
        "value": 272,
        "color": "#f59e0b"
      }
    ]
  },
  "sa-top-uba-users": {
    "title": "Top 10 Users by UBA Alert Count",
    "chartType": "hbar",
    "summary": "s.chen (87) and j.morales (64) generate the most UBA alerts, together accounting for 17% of the top-10 volume. The remaining eight users decline steadily from 52 down to 9, indicating alert volume is led by a small handful of higher-risk users rather than being spread evenly across the 181 users seen this period.",
    "followUps": [
      {
        "text": "What access methods are being used in my environment?",
        "id": "sa-access-methods"
      },
      {
        "text": "Show DLP profile breakdown",
        "id": "sa-dlp-profile-breakdown"
      },
      {
        "text": "Which cloud apps have the poorest CCL rating?",
        "id": "destinations"
      }
    ],
    "bars": [
      {
        "label": "s.chen@company.com",
        "value": 87,
        "color": "#ef4444"
      },
      {
        "label": "j.morales@company.com",
        "value": 64,
        "color": "#ef4444"
      },
      {
        "label": "k.tanaka@company.com",
        "value": 52,
        "color": "#f59e0b"
      },
      {
        "label": "r.patel@company.com",
        "value": 41,
        "color": "#f59e0b"
      },
      {
        "label": "m.oconnell@company.com",
        "value": 38
      },
      {
        "label": "d.kim@company.com",
        "value": 29
      },
      {
        "label": "a.silva@company.com",
        "value": 22
      },
      {
        "label": "p.diallo@company.com",
        "value": 19
      },
      {
        "label": "h.becker@company.com",
        "value": 14
      },
      {
        "label": "l.nguyen@company.com",
        "value": 9
      }
    ]
  },
  "ai-risk-top-apps": {
    "title": "Top 5 Risky AI Apps by Event Count",
    "chartType": "hbar",
    "summary": "ChatGPT (120 events) and Google Gemini (95 events) — both Medium CCL — account for the overwhelming majority of risky AI app activity. Manus (Low CCL) and Google NotebookLM (Poor CCL) see far less volume, but Google NotebookLM's Poor rating means even its small footprint carries outsized risk per event.",
    "followUps": [
      {
        "text": "Show the DLP alert trend in AI usage",
        "id": "ai-risk-dlp-trend"
      },
      {
        "text": "What are users doing with the risky AI apps?",
        "id": "ai-risk-user-activities"
      },
      {
        "text": "Which cloud apps have the poorest CCL rating?",
        "id": "destinations"
      }
    ],
    "bars": [
      {
        "label": "ChatGPT — Medium CCL",
        "value": 120,
        "color": "#f59e0b"
      },
      {
        "label": "Google Gemini — Medium CCL",
        "value": 95,
        "color": "#f59e0b"
      },
      {
        "label": "Manus — Low CCL",
        "value": 15,
        "color": "#fb923c"
      },
      {
        "label": "OpenAI — Medium CCL",
        "value": 5,
        "color": "#f59e0b"
      },
      {
        "label": "Google NotebookLM — Poor CCL",
        "value": 3,
        "color": "#ef4444"
      }
    ]
  },
  "ai-risk-user-activities": {
    "title": "Top User Activities in Risky AI Apps",
    "chartType": "table",
    "summary": "Upload (428 events) and Post (356 events) are the two most common user activities in risky AI apps — both involve sending data into the app, the highest-risk direction of data flow. Login Failed (67 events, 22 users) is worth monitoring as a potential signal of credential issues or automated access attempts against these apps.",
    "followUps": [
      {
        "text": "Show the DLP alert trend in AI usage",
        "id": "ai-risk-dlp-trend"
      },
      {
        "text": "Which AI apps carry the highest risk?",
        "id": "ai-risk-top-apps"
      },
      {
        "text": "Block recommendation for the top destinations",
        "id": "block-recommendation"
      }
    ],
    "table": {
      "columns": [
        "Activity",
        "# Events",
        "# Users"
      ],
      "rows": [
        [
          "Upload",
          "428",
          "62"
        ],
        [
          "Post",
          "356",
          "74"
        ],
        [
          "Login",
          "289",
          "91"
        ],
        [
          "Share",
          "142",
          "38"
        ],
        [
          "Login Failed",
          "67",
          "22"
        ]
      ]
    }
  },
  "ai-risk-dlp-trend": {
    "title": "DLP Alert Trend in AI Usage — Last 7 Days",
    "chartType": "kpi+line",
    "summary": "DLP alerts in AI apps peaked at 67 on June 30 — about 60% above the weekly average of ~44/day — before easing back down. The pattern is choppy rather than steadily trending, suggesting alert volume is driven by bursts of risky activity (e.g. bulk uploads) rather than a sustained increase in baseline usage.",
    "followUps": [
      {
        "text": "Which AI apps carry the highest risk?",
        "id": "ai-risk-top-apps"
      },
      {
        "text": "What are users doing with the risky AI apps?",
        "id": "ai-risk-user-activities"
      },
      {
        "text": "Show top DLP policies driving these alerts",
        "id": "top-policies"
      }
    ],
    "series": [
      {
        "name": "DLP Alerts",
        "color": "#ef4444",
        "values": [
          38,
          45,
          52,
          41,
          67,
          29,
          33
        ]
      }
    ],
    "xLabels": [
      "Jun 26",
      "Jun 27",
      "Jun 28",
      "Jun 29",
      "Jun 30",
      "Jul 1",
      "Jul 2"
    ],
    "anomalies": [
      {
        "index": 4,
        "value": 67,
        "label": "Jun 30 spike"
      }
    ]
  },
  "weekly-overview": {
    "title": "DLP Incidents — Last 7 Days",
    "chartType": "kpi+line",
    "summary": "DLP incidents climbed 18% week-over-week, driven mostly by a Saturday spike that pushed Critical and High severity counts up 24%. The increase is concentrated in two policies — Confidential — Customer PII and Source Code — Internal Only — which together account for ~58% of new incidents. Triage time improved 9%, suggesting the analyst team is keeping pace despite higher volume.",
    "followUps": [
      {
        "text": "What caused the Saturday spike?",
        "id": "rca-saturday"
      },
      {
        "text": "Break this down by policy",
        "id": "top-policies"
      },
      {
        "text": "Show the same chart for last week for comparison",
        "id": "compare-week"
      },
      {
        "text": "Which users were involved in the Saturday spike?",
        "id": "users-saturday"
      }
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
    ],
    "anomalies": [
      {
        "index": 5,
        "value": 224,
        "label": "Spike",
        "drill": {
          "text": "What caused the Saturday spike?",
          "id": "rca-saturday"
        }
      }
    ]
  },
  "soc-dlp-monitoring": {
    "title": "Security Operations Analyst",
    "chartType": "table",
    "summary": "56 DLP policies were violated across 65 files this week, alongside 56 UEBA alerts. The top policy — 'Detect Credit card information or GDPR info in managed ChatGPT Enterprise' — accounts for 233 alerts, more than 13× the next-highest policy, and is alert-only rather than blocked. Malware and malicious-URL detections stayed low (1 and 2 respectively), while 86 URLs were blocked outright.",
    "followUps": [
      {
        "text": "Which policies were violated the most?",
        "id": "top-policies"
      },
      {
        "text": "Show top users behind these alerts",
        "id": "top-users"
      },
      {
        "text": "Show malicious URL detections",
        "id": "destinations"
      },
      {
        "text": "Export this as a PDF for leadership",
        "id": "export-pdf"
      }
    ],
    "table": {
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
    }
  },
  "soc-top-policies": {
    "title": "Top Policies Triggered — Last 30 Days",
    "chartType": "hbar",
    "summary": "Five policies generate 36% of all DLP alerts. The top policy — 'Block Sensitive Data sent to non-corporate instances' — fired 512 times, primarily on uploads to personal Google Drive and Box accounts. The next two policies (managed-chat credit card / GDPR detection and NPA web-app access) are largely informational allow-with-alert flows rather than blocks.",
    "followUps": [
      {
        "text": "Show users behind 'Block Sensitive Data' policy",
        "id": "soc-user-drilldown"
      },
      {
        "text": "Break down by policy action",
        "id": "soc-policy-actions"
      },
      {
        "text": "Show all policies in a table",
        "id": "soc-user-drilldown"
      },
      {
        "text": "Back to Security Operations Analyst",
        "id": "soc-dlp-monitoring"
      }
    ],
    "bars": [
      {
        "label": "Block Sensitive Data sent to non-corporate instances",
        "value": 512
      },
      {
        "label": "Detect Credit card / GDPR info in managed Chat",
        "value": 304
      },
      {
        "label": "[NPA EB] Allow Access to Web Apps",
        "value": 289
      },
      {
        "label": "Browser Access DLP — Block PII / PCI in Finance MyNetskope",
        "value": 108
      },
      {
        "label": "[Context DLP] High Severity PII Block",
        "value": 108
      }
    ]
  },
  "soc-policy-actions": {
    "title": "Policy Actions for All DLP Policies — Last 30 Days",
    "chartType": "donut",
    "summary": "60% of policy decisions are 'alert' (monitor-only), 35% are active 'block', and the remaining 5% cover user-coaching, labeling, and link-revocation actions. Block actions are concentrated on the top non-corporate-instance policy and on credit card / PII rules. The alert-heavy posture suggests room to convert mature alert-only policies into blocks once false-positive rates are validated.",
    "followUps": [
      {
        "text": "Which policies are alert-only but candidate to block?",
        "id": "block-recommendation"
      },
      {
        "text": "Top policies firing block actions",
        "id": "soc-top-policies"
      },
      {
        "text": "Drill into users with the most blocks",
        "id": "soc-user-drilldown"
      },
      {
        "text": "Back to Security Operations Analyst",
        "id": "soc-dlp-monitoring"
      }
    ],
    "slices": [
      {
        "label": "alert",
        "value": 2207,
        "color": "#3b82f6"
      },
      {
        "label": "block",
        "value": 1306,
        "color": "#ef4444"
      },
      {
        "label": "useralert",
        "value": 84,
        "color": "#f59e0b"
      },
      {
        "label": "apply sensitivity label",
        "value": 55,
        "color": "#8b5cf6"
      },
      {
        "label": "revoke public sharing",
        "value": 22,
        "color": "#10b981"
      },
      {
        "label": "add_headers",
        "value": 8,
        "color": "#94a3b8"
      },
      {
        "label": "bypass",
        "value": 3,
        "color": "#cbd5e1"
      },
      {
        "label": "restrictAccess",
        "value": 2,
        "color": "#6b7280"
      }
    ]
  },
  "soc-weekly-rca-wedfri": {
    "title": "Wednesday–Friday spike · root cause",
    "chartType": "kpi+line",
    "summary": "15 of the week's 23 Critical incidents (65%) landed Wed–Fri. The cluster traces back to a surge in unsanctioned Generative AI usage — ChatGPT accounted for 387 alerts and three of the Critical incidents involved sensitive code or customer data being pasted into prompts. Friday May 9 was the peak day (2,504 events, 6 Critical). Weekend volume fell off as expected.",
    "followUps": [
      {
        "text": "Show all DLP violations involving ChatGPT this week",
        "id": "soc-weekly-chatgpt-dlp"
      },
      {
        "text": "Top users in the Wed–Fri Critical incidents",
        "id": "soc-weekly-storage-users"
      },
      {
        "text": "Back to Security Operations Analyst",
        "id": "soc-dlp-monitoring"
      }
    ],
    "kpis": [
      {
        "label": "Critical incidents (Wed–Fri)",
        "value": "15",
        "delta": "65% of week",
        "deltaDir": "up",
        "invertColor": true
      },
      {
        "label": "Driver",
        "value": "GenAI"
      },
      {
        "label": "Most active app",
        "value": "ChatGPT"
      },
      {
        "label": "Peak day",
        "value": "Fri May 9"
      }
    ],
    "series": [
      {
        "name": "Critical",
        "color": "#F43F5E",
        "values": [
          2,
          3,
          5,
          4,
          6,
          2,
          1
        ]
      },
      {
        "name": "High",
        "color": "#EF4444",
        "values": [
          142,
          160,
          221,
          189,
          243,
          87,
          75
        ]
      }
    ],
    "xLabels": [
      "Mon May 5",
      "Tue May 6",
      "Wed May 7",
      "Thu May 8",
      "Fri May 9",
      "Sat May 10",
      "Sun May 11"
    ]
  },
  "soc-weekly-chatgpt-dlp": {
    "title": "ChatGPT DLP violations · this week",
    "chartType": "hbar",
    "summary": "ChatGPT generated 387 DLP alerts this week — the single most-alerting app. The dominant trigger is source-code pasting (142 alerts), followed by customer PII (98) and credential exposure (64). Three of these escalated to Critical severity. Engineering and Sales departments account for ~70% of the volume, with sarah.chen@company.com responsible for the largest share.",
    "followUps": [
      {
        "text": "Show the users behind these ChatGPT alerts",
        "id": "soc-weekly-risky-users"
      },
      {
        "text": "What caused the Wed–Fri Critical spike?",
        "id": "soc-weekly-rca-wedfri"
      },
      {
        "text": "Back to Security Operations Analyst",
        "id": "soc-dlp-monitoring"
      }
    ],
    "bars": [
      {
        "label": "Source code paste",
        "value": 142,
        "color": "#F43F5E"
      },
      {
        "label": "Customer PII paste",
        "value": 98,
        "color": "#EF4444"
      },
      {
        "label": "Credentials / API keys",
        "value": 64,
        "color": "#F43F5E"
      },
      {
        "label": "Internal financial data",
        "value": 47,
        "color": "#EF4444"
      },
      {
        "label": "Strategy / roadmap docs",
        "value": 36,
        "color": "#FB923C"
      }
    ]
  },
  "soc-weekly-storage-users": {
    "title": "Top users · unsanctioned cloud storage",
    "chartType": "table",
    "summary": "Five users drive most of the unsanctioned cloud-storage alerts this week (49 of 654 total). Dropbox Personal and Google Drive (Personal) dominate the destinations. sarah.chen (Engineering, 14 alerts) is the same user behind the ChatGPT spike — her activity spans both shadow-IT vectors and warrants coordinated review.",
    "followUps": [
      {
        "text": "Show all incidents for sarah.chen",
        "id": "soc-weekly-risky-users"
      },
      {
        "text": "Top apps generating alerts this week",
        "id": "soc-weekly-top-apps"
      },
      {
        "text": "Back to Security Operations Analyst",
        "id": "soc-dlp-monitoring"
      }
    ],
    "table": {
      "columns": [
        "User",
        "Department",
        "Top app",
        "Alerts"
      ],
      "rows": [
        [
          "sarah.chen@company.com",
          "Engineering",
          "Dropbox Personal",
          "14"
        ],
        [
          "mike.torres@company.com",
          "Sales",
          "WeTransfer",
          "11"
        ],
        [
          "priya.patel@company.com",
          "Finance",
          "Google Drive (Personal)",
          "9"
        ],
        [
          "david.kim@company.com",
          "Marketing",
          "Dropbox Personal",
          "8"
        ],
        [
          "jennifer.wu@company.com",
          "HR",
          "Google Drive (Personal)",
          "7"
        ]
      ]
    }
  },
  "soc-weekly-categories": {
    "title": "Incidents by category · this week",
    "chartType": "donut",
    "summary": "DLP violations remain the top category at 31% of total incidents (1,452). Malware/Threats sit at 25% and anomalous behavior at 19%. Compromised credentials are the smallest slice (9%) but the highest-severity category — every entry here is treated as a potential breach precursor and should be triaged within 4 hours per SLA.",
    "followUps": [
      {
        "text": "Drill into DLP Violations",
        "id": "soc-weekly-chatgpt-dlp"
      },
      {
        "text": "Show the top users behind these incidents",
        "id": "soc-weekly-risky-users"
      },
      {
        "text": "Back to Security Operations Analyst",
        "id": "soc-dlp-monitoring"
      }
    ],
    "slices": [
      {
        "label": "DLP Violations",
        "value": 1452,
        "color": "#7c3aed"
      },
      {
        "label": "Malware / Threats",
        "value": 1187,
        "color": "#EF4444"
      },
      {
        "label": "Anomalous Behavior",
        "value": 892,
        "color": "#FB923C"
      },
      {
        "label": "Policy Violations",
        "value": 743,
        "color": "#2563eb"
      },
      {
        "label": "Compromised Credentials",
        "value": 412,
        "color": "#F43F5E"
      }
    ]
  },
  "soc-weekly-top-apps": {
    "title": "Top apps generating alerts · this week",
    "chartType": "hbar",
    "summary": "ChatGPT is the single most-alerting app this week at 387 alerts, followed by Dropbox Personal (312) and WeTransfer (234). All but Salesforce are unsanctioned. Generative-AI and personal cloud-storage together generate 64% of the week's app-level alerts — these are the two shadow-IT vectors most worth tightening policy on.",
    "followUps": [
      {
        "text": "Show DLP violations on ChatGPT",
        "id": "soc-weekly-chatgpt-dlp"
      },
      {
        "text": "Top users on unsanctioned cloud storage",
        "id": "soc-weekly-storage-users"
      },
      {
        "text": "Back to Security Operations Analyst",
        "id": "soc-dlp-monitoring"
      }
    ],
    "bars": [
      {
        "label": "ChatGPT",
        "value": 387,
        "color": "#F43F5E"
      },
      {
        "label": "Dropbox Personal",
        "value": 312,
        "color": "#EF4444"
      },
      {
        "label": "WeTransfer",
        "value": 234,
        "color": "#EF4444"
      },
      {
        "label": "Telegram",
        "value": 189,
        "color": "#FB923C"
      },
      {
        "label": "Salesforce",
        "value": 156,
        "color": "#94a3b8"
      },
      {
        "label": "Google Drive (Personal)",
        "value": 142,
        "color": "#EF4444"
      },
      {
        "label": "GitHub (Personal)",
        "value": 98,
        "color": "#FB923C"
      }
    ]
  },
  "soc-weekly-risky-users": {
    "title": "Top 5 risky users · this week",
    "chartType": "table",
    "summary": "Risk scores combine incident count, severity mix, and policy criticality. sarah.chen (87) leads the list on the strength of GenAI + cloud-storage activity from Engineering. mike.torres (82) and priya.patel (76) are next — both touching financially-sensitive data. The top 5 generate 49 of the week's 4,706 user-attributed incidents (≈1%) but drive nearly all of the Critical severity escalations.",
    "followUps": [
      {
        "text": "Show sarah.chen's incidents in detail",
        "id": "soc-weekly-chatgpt-dlp"
      },
      {
        "text": "Top apps generating alerts this week",
        "id": "soc-weekly-top-apps"
      },
      {
        "text": "Back to Security Operations Analyst",
        "id": "soc-dlp-monitoring"
      }
    ],
    "table": {
      "columns": [
        "User",
        "Department",
        "Risk score",
        "Incidents"
      ],
      "rows": [
        [
          "sarah.chen@company.com",
          "Engineering",
          "87",
          "14"
        ],
        [
          "mike.torres@company.com",
          "Sales",
          "82",
          "11"
        ],
        [
          "priya.patel@company.com",
          "Finance",
          "76",
          "9"
        ],
        [
          "david.kim@company.com",
          "Marketing",
          "71",
          "8"
        ],
        [
          "jennifer.wu@company.com",
          "HR",
          "68",
          "7"
        ]
      ]
    }
  },
  "soc-top-apps": {
    "title": "Top Applications Triggering DLP Alerts — Last 30 Days",
    "chartType": "hbar",
    "summary": "AI-Gateway dominates DLP alert volume at 1,847 (50% of total), followed by two other gen-AI / MCP destinations (Parallel Search MCP — 496, ChatGPT — 311). Together, AI-related applications drive 72% of all DLP alerts in the last 30 days. Traditional SaaS sharing apps (OneDrive, Google Drive, MediaFire) trail well behind — suggesting attention should shift toward AI-egress controls.",
    "followUps": [
      {
        "text": "Drill into AI-Gateway alerts",
        "id": "soc-user-drilldown"
      },
      {
        "text": "Compare AI apps vs. SaaS sharing apps",
        "id": "soc-policy-actions"
      },
      {
        "text": "Block recommendation for AI apps",
        "id": "block-recommendation"
      },
      {
        "text": "Back to Security Operations Analyst",
        "id": "soc-dlp-monitoring"
      }
    ],
    "bars": [
      {
        "label": "AI-Gateway",
        "value": 1847,
        "color": "#ef4444"
      },
      {
        "label": "Parallel Search MCP",
        "value": 496,
        "color": "#f97316"
      },
      {
        "label": "ChatGPT",
        "value": 311,
        "color": "#f97316"
      },
      {
        "label": "Microsoft Office 365 OneDrive",
        "value": 190,
        "color": "#f59e0b"
      },
      {
        "label": "[Finance Local EB]",
        "value": 185,
        "color": "#f59e0b"
      },
      {
        "label": "[Flonkerton]",
        "value": 179,
        "color": "#f59e0b"
      },
      {
        "label": "[Finance MyNetskopeDemo Browser Access]",
        "value": 108,
        "color": "#fbbf24"
      },
      {
        "label": "MediaFire",
        "value": 86,
        "color": "#fbbf24"
      },
      {
        "label": "Google Drive",
        "value": 78,
        "color": "#fbbf24"
      },
      {
        "label": "Globalping MCP",
        "value": 44,
        "color": "#fbbf24"
      }
    ]
  },
  "soc-top-rules": {
    "title": "Top DLP Rules Triggered — Last 30 Days",
    "chartType": "hbar",
    "summary": "PII-related rules dominate: 'Name-SSN' alone fired 812 times. EU-Name combinations together exceed 1,000 alerts, indicating strong GDPR exposure across managed apps. PCI rules (Credit Card variants and INTL-PAN-Name) account for ~390 alerts and warrant a review of finance-team workflows.",
    "followUps": [
      {
        "text": "Drill into Name-SSN rule violations",
        "id": "soc-user-drilldown"
      },
      {
        "text": "Compare PII vs. PCI vs. EU rule families",
        "id": "soc-policy-actions"
      },
      {
        "text": "Top apps for SSN-related rules",
        "id": "soc-top-apps"
      },
      {
        "text": "Back to Security Operations Analyst",
        "id": "soc-dlp-monitoring"
      }
    ],
    "bars": [
      {
        "label": "Name-SSN",
        "value": 812
      },
      {
        "label": "Sensitive Project Names",
        "value": 498
      },
      {
        "label": "EU-Name-Phone (narrow)",
        "value": 342
      },
      {
        "label": "EU-Name-Address (narrow)",
        "value": 211
      },
      {
        "label": "EU-Name-Address",
        "value": 184
      },
      {
        "label": "EU-Name-Ethnicity",
        "value": 142
      },
      {
        "label": "Credit Card",
        "value": 121
      },
      {
        "label": "LastName-Near-SSN-Unique",
        "value": 96
      },
      {
        "label": "SSN (Dash Delimited)",
        "value": 88
      },
      {
        "label": "Credit Card (CC)",
        "value": 76
      },
      {
        "label": "Name-Credit Card (CC)",
        "value": 71
      },
      {
        "label": "INTL-PAN-Name",
        "value": 64
      },
      {
        "label": "Name-CC-EXP",
        "value": 58
      },
      {
        "label": "US-SSN-Name-Address",
        "value": 47
      },
      {
        "label": "EU-Name-PAN (narrow)",
        "value": 41
      }
    ]
  },
  "soc-user-drilldown": {
    "title": "SOC DLP Drill-down — User × Application × Action",
    "chartType": "table",
    "summary": "Top 10 users behind the SOC DLP alert volume span five user groups — CE-PM (4 users, all on Google Drive), CE-CX (2, Box), CE-CIT (2, Box, Alert-only), CE-Sales (1, Slack), and CE-HR (1, Box). demouser9 (47, CE-CX→Box) and demouser8 (42, CE-PM→Google Drive) are the highest-volume contributors. 7 of 10 users are on Block — actively prevented uploads — while 3 (demouser4, demouser5, demouser6) remain on Alert-only and may warrant a policy tightening review.",
    "followUps": [
      {
        "text": "Why is CE-PM concentrated on Google Drive?",
        "id": "soc-top-apps"
      },
      {
        "text": "Should the 3 Alert-only users be moved to Block?",
        "id": "block-recommendation"
      },
      {
        "text": "Drill into demouser9 — 47 alerts on Box",
        "id": "user-detail-jmorales"
      },
      {
        "text": "Which DLP rules did the top 3 users trigger?",
        "id": "soc-top-rules"
      },
      {
        "text": "Compare CE-PM vs. CE-CX alert volume",
        "id": "soc-policy-actions"
      },
      {
        "text": "Send a coaching Slack message to the top 5 users",
        "id": "slack-sent"
      },
      {
        "text": "Back to Security Operations Analyst",
        "id": "soc-dlp-monitoring"
      }
    ],
    "table": {
      "columns": [
        "User",
        "User Group",
        "Application",
        "Action",
        "# Alerts"
      ],
      "rows": [
        [
          "demouser1@netskope.com",
          "CE-PM",
          "Google Drive",
          "Block",
          "12"
        ],
        [
          "demouser2@netskope.com",
          "CE-PM",
          "Google Drive",
          "Block",
          "37"
        ],
        [
          "demouser3@netskope.com",
          "CE-CX",
          "Box",
          "Block",
          "33"
        ],
        [
          "demouser4@netskope.com",
          "CE-CIT",
          "Box",
          "Alert",
          "21"
        ],
        [
          "demouser5@netskope.com",
          "CE-PM",
          "Google Drive",
          "Alert",
          "35"
        ],
        [
          "demouser6@netskope.com",
          "CE-CIT",
          "Box",
          "Alert",
          "13"
        ],
        [
          "demouser7@netskope.com",
          "CE-Sales",
          "Slack",
          "Block",
          "36"
        ],
        [
          "demouser8@netskope.com",
          "CE-PM",
          "Google Drive",
          "Block",
          "42"
        ],
        [
          "demouser9@netskope.com",
          "CE-CX",
          "Box",
          "Block",
          "47"
        ],
        [
          "demouser10@netskope.com",
          "CE-HR",
          "Box",
          "Block",
          "14"
        ]
      ]
    }
  },
  "top-policies": {
    "title": "Top DLP Policies by Violation Count — Last 7 Days",
    "chartType": "hbar",
    "summary": "Two policies — Confidential — Customer PII (412) and Source Code — Internal Only (318) — drive 57% of all violations this week. Customer PII incidents are concentrated in uploads to personal Google Drive, while Source Code violations are mostly Slack DMs to external workspaces.",
    "followUps": [
      {
        "text": "Drill into Customer PII violations",
        "id": "policy-detail-pii"
      },
      {
        "text": "Which apps are receiving the source code uploads?",
        "id": "apps-source-code"
      },
      {
        "text": "Show this trended over the last 30 days",
        "id": "policy-trend-30d"
      },
      {
        "text": "Compare top policies vs. last quarter",
        "id": "policy-compare-quarter"
      }
    ],
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
        "value": 23
      }
    ]
  },
  "top-users": {
    "title": "Top Users by DLP Incident Count — Last 30 Days",
    "chartType": "hbar",
    "summary": "Two users — j.morales and k.tanaka — together account for 151 incidents (24% of the total), well above the team baseline of ~12 incidents per user per month. Both belong to Customer Success, and most violations involve attaching customer reports to outbound email — likely a mis-configured workflow rather than active exfiltration, but worth review.",
    "followUps": [
      {
        "text": "Show j.morales's incidents in detail",
        "id": "user-detail-jmorales"
      },
      {
        "text": "Which policies is k.tanaka triggering?",
        "id": "user-policies-ktanaka"
      },
      {
        "text": "Compare to the same users last month",
        "id": "users-compare-month"
      },
      {
        "text": "Are these users sharing data with the same destinations?",
        "id": "users-destinations"
      }
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
  "top-users-daily": {
    "title": "Top 10 Users by Incident Count — Selected Day",
    "chartType": "hbar",
    "summary": "s.chen and j.morales together account for 30% of this day's incidents — both in Engineering, with violations concentrated in unsanctioned cloud storage uploads and GenAI data submissions. r.patel and k.tanaka show a spike versus their weekly baseline, suggesting coordinated or workflow-driven activity worth reviewing.",
    "followUps": [
      {
        "text": "Show all incidents for s.chen today",
        "id": "user-detail-jmorales"
      },
      {
        "text": "Which policies are these users triggering most?",
        "id": "top-users"
      },
      {
        "text": "Compare these users to their prior-week baseline",
        "id": "users-compare-month"
      },
      {
        "text": "Show the destinations these users are sending data to",
        "id": "users-destinations"
      }
    ],
    "bars": [
      {
        "label": "s.chen@company.com",
        "value": 47,
        "color": "#ef4444"
      },
      {
        "label": "j.morales@company.com",
        "value": 38,
        "color": "#ef4444"
      },
      {
        "label": "r.patel@company.com",
        "value": 31,
        "color": "#f59e0b"
      },
      {
        "label": "k.tanaka@company.com",
        "value": 28,
        "color": "#f59e0b"
      },
      {
        "label": "m.oconnell@company.com",
        "value": 22
      },
      {
        "label": "d.kim@company.com",
        "value": 19
      },
      {
        "label": "a.silva@company.com",
        "value": 17
      },
      {
        "label": "p.diallo@company.com",
        "value": 14
      },
      {
        "label": "h.becker@company.com",
        "value": 11
      },
      {
        "label": "l.nguyen@company.com",
        "value": 9
      }
    ]
  },
  "destinations": {
    "title": "Sensitive File Movement — Top Destination Apps",
    "chartType": "hbar",
    "summary": "Unsanctioned destinations (red) account for 60% of sensitive file movement this week — Google Drive personal accounts alone received 284 files. Movement to corporate-managed apps (Box, OneDrive) is healthy at ~25% of volume. Slack external workspaces and public GitHub remain the top risk channels for source-code data.",
    "followUps": [
      {
        "text": "What types of files are going to personal Google Drive?",
        "id": "filetypes-gdrive"
      },
      {
        "text": "Which users are uploading to WeTransfer?",
        "id": "users-wetransfer"
      },
      {
        "text": "Show me sanctioned vs. unsanctioned trend over time",
        "id": "sanctioned-trend"
      },
      {
        "text": "Block recommendation for the top destinations",
        "id": "block-recommendation"
      }
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
  "dest-gdrive-personal": {
    "title": "Top 10 Users → Google Drive (personal) — Last 7 Days",
    "chartType": "table",
    "summary": "s.chen and j.morales together account for 30% of all files moved to personal Google Drive. Customer PII is the dominant policy (6 of 10 users), with .xlsx and .pdf spreadsheets making up 71% of the files. PCI Financial and Source Code violations indicate two separate risk cohorts — Finance employees and Engineers both using personal GDrive as an off-ramp.",
    "followUps": [
      {
        "text": "Block personal Google Drive uploads",
        "id": "block-recommendation"
      },
      {
        "text": "Show file types going to personal GDrive",
        "id": "filetypes-gdrive"
      },
      {
        "text": "Compare these users to last week",
        "id": "users-compare-month"
      },
      {
        "text": "Back to Sensitive Data Movement"
      }
    ],
    "table": {
      "columns": [
        "User",
        "Files",
        "DLP Policy"
      ],
      "rows": [
        [
          "s.chen@company.com",
          "47",
          "Confidential — Customer PII"
        ],
        [
          "j.morales@company.com",
          "38",
          "Confidential — Customer PII"
        ],
        [
          "r.patel@company.com",
          "31",
          "PCI Financial Data"
        ],
        [
          "k.tanaka@company.com",
          "28",
          "Confidential — Customer PII"
        ],
        [
          "m.oconnell@company.com",
          "22",
          "Source Code"
        ],
        [
          "d.kim@company.com",
          "19",
          "PCI Financial Data"
        ],
        [
          "a.silva@company.com",
          "17",
          "Confidential — Customer PII"
        ],
        [
          "p.diallo@company.com",
          "14",
          "HR — Employee Records"
        ],
        [
          "h.becker@company.com",
          "11",
          "Source Code"
        ],
        [
          "l.nguyen@company.com",
          "9",
          "GenAI — Sensitive Data"
        ]
      ]
    }
  },
  "dest-dropbox-personal": {
    "title": "Top 10 Users → Dropbox (personal) — Last 7 Days",
    "chartType": "table",
    "summary": "Source Code is the top policy for Dropbox personal uploads (3 of 10 users, 51 files) — Engineers appear to be syncing work repositories to personal accounts. m.torres is the top offender at 34 files, all tagged as Source Code. Combined with HR and PCI violations, this destination carries the widest policy breadth of any unsanctioned app.",
    "followUps": [
      {
        "text": "Block personal Dropbox uploads",
        "id": "block-recommendation"
      },
      {
        "text": "Show top users for Source Code violations",
        "id": "top-users"
      },
      {
        "text": "Compare to last week",
        "id": "users-compare-month"
      },
      {
        "text": "Back to Sensitive Data Movement"
      }
    ],
    "table": {
      "columns": [
        "User",
        "Files",
        "DLP Policy"
      ],
      "rows": [
        [
          "m.torres@company.com",
          "34",
          "Source Code"
        ],
        [
          "j.wu@company.com",
          "27",
          "Confidential — Customer PII"
        ],
        [
          "b.okafor@company.com",
          "22",
          "HR — Employee Records"
        ],
        [
          "s.aldridge@company.com",
          "19",
          "PCI Financial Data"
        ],
        [
          "c.hernandez@company.com",
          "17",
          "Source Code"
        ],
        [
          "t.nakamura@company.com",
          "14",
          "GenAI — Sensitive Data"
        ],
        [
          "y.zhou@company.com",
          "11",
          "Confidential — Customer PII"
        ],
        [
          "r.singh@company.com",
          "9",
          "Source Code"
        ],
        [
          "e.foster@company.com",
          "8",
          "PCI Financial Data"
        ],
        [
          "g.martin@company.com",
          "6",
          "Confidential — Customer PII"
        ]
      ]
    }
  },
  "dest-slack-external": {
    "title": "Top 10 Users → Slack (external workspaces) — Last 7 Days",
    "chartType": "table",
    "summary": "External Slack sharing is most common in Sales and Engineering, with Customer PII and Source Code as the top policies. Unlike unsanctioned storage apps, Slack is a sanctioned internal tool — these violations are likely accidental overshares to partner or vendor workspaces rather than intentional exfiltration. A DLP rule targeting external channel file shares would address this with minimal user friction.",
    "followUps": [
      {
        "text": "Recommend a Slack DLP policy",
        "id": "block-recommendation"
      },
      {
        "text": "Which external Slack workspaces are involved?",
        "id": "destinations"
      },
      {
        "text": "Show top users by DLP incident count",
        "id": "top-users"
      },
      {
        "text": "Back to Sensitive Data Movement"
      }
    ],
    "table": {
      "columns": [
        "User",
        "Files",
        "DLP Policy"
      ],
      "rows": [
        [
          "p.johnson@company.com",
          "29",
          "Confidential — Customer PII"
        ],
        [
          "a.brooks@company.com",
          "23",
          "Source Code"
        ],
        [
          "m.oconnell@company.com",
          "18",
          "GenAI — Sensitive Data"
        ],
        [
          "s.chen@company.com",
          "16",
          "Confidential — Customer PII"
        ],
        [
          "k.tanaka@company.com",
          "13",
          "Source Code"
        ],
        [
          "r.evans@company.com",
          "11",
          "PCI Financial Data"
        ],
        [
          "d.white@company.com",
          "9",
          "Confidential — Customer PII"
        ],
        [
          "f.garcia@company.com",
          "8",
          "HR — Employee Records"
        ],
        [
          "n.patel@company.com",
          "8",
          "Source Code"
        ],
        [
          "o.smith@company.com",
          "7",
          "GenAI — Sensitive Data"
        ]
      ]
    }
  },
  "dest-box-corporate": {
    "title": "Top 10 Users → Box (corporate) — Last 7 Days",
    "chartType": "table",
    "summary": "Box (corporate) is a sanctioned destination, but 118 files still triggered DLP policies — primarily Customer PII and PCI Financial uploads without proper classification labels. These are likely compliance gaps (untagged sensitive files) rather than policy violations. A classification-at-upload prompt would reduce these incidents by an estimated 60–70%.",
    "followUps": [
      {
        "text": "Recommend file classification controls",
        "id": "block-recommendation"
      },
      {
        "text": "Show PCI Financial violations in detail",
        "id": "top-users"
      },
      {
        "text": "Compare sanctioned vs. unsanctioned trend",
        "id": "sanctioned-trend"
      },
      {
        "text": "Back to Sensitive Data Movement"
      }
    ],
    "table": {
      "columns": [
        "User",
        "Files",
        "DLP Policy"
      ],
      "rows": [
        [
          "j.morales@company.com",
          "21",
          "Confidential — Customer PII"
        ],
        [
          "l.nguyen@company.com",
          "17",
          "PCI Financial Data"
        ],
        [
          "b.okafor@company.com",
          "14",
          "HR — Employee Records"
        ],
        [
          "c.hernandez@company.com",
          "13",
          "Source Code"
        ],
        [
          "m.torres@company.com",
          "11",
          "Confidential — Customer PII"
        ],
        [
          "s.aldridge@company.com",
          "9",
          "GenAI — Sensitive Data"
        ],
        [
          "p.diallo@company.com",
          "9",
          "PCI Financial Data"
        ],
        [
          "r.patel@company.com",
          "8",
          "Confidential — Customer PII"
        ],
        [
          "y.zhou@company.com",
          "7",
          "Source Code"
        ],
        [
          "e.foster@company.com",
          "9",
          "HR — Employee Records"
        ]
      ]
    }
  },
  "dest-onedrive-corporate": {
    "title": "Top 10 Users → OneDrive (corporate) — Last 7 Days",
    "chartType": "table",
    "summary": "OneDrive corporate is a sanctioned destination — the 94 policy-triggering files are predominantly mislabeled or unclassified uploads. Customer PII (k.tanaka, 18 files) and PCI Financial (d.kim, 14 files) are the highest-priority rows. No evidence of exfiltration; likely a classification workflow gap in Finance and Engineering.",
    "followUps": [
      {
        "text": "Show k.tanaka's Customer PII incidents",
        "id": "user-policies-ktanaka"
      },
      {
        "text": "Recommend classification policy",
        "id": "block-recommendation"
      },
      {
        "text": "Compare sanctioned vs. unsanctioned trend",
        "id": "sanctioned-trend"
      },
      {
        "text": "Back to Sensitive Data Movement"
      }
    ],
    "table": {
      "columns": [
        "User",
        "Files",
        "DLP Policy"
      ],
      "rows": [
        [
          "k.tanaka@company.com",
          "18",
          "Confidential — Customer PII"
        ],
        [
          "d.kim@company.com",
          "14",
          "PCI Financial Data"
        ],
        [
          "a.silva@company.com",
          "13",
          "Source Code"
        ],
        [
          "g.martin@company.com",
          "11",
          "GenAI — Sensitive Data"
        ],
        [
          "h.becker@company.com",
          "9",
          "Confidential — Customer PII"
        ],
        [
          "t.nakamura@company.com",
          "8",
          "HR — Employee Records"
        ],
        [
          "p.johnson@company.com",
          "7",
          "PCI Financial Data"
        ],
        [
          "o.smith@company.com",
          "7",
          "Source Code"
        ],
        [
          "f.garcia@company.com",
          "6",
          "Confidential — Customer PII"
        ],
        [
          "n.patel@company.com",
          "6",
          "GenAI — Sensitive Data"
        ]
      ]
    }
  },
  "dest-wetransfer": {
    "title": "Top 10 Users → WeTransfer — Last 7 Days",
    "chartType": "table",
    "summary": "WeTransfer has no sanctioned use case at this company — all 61 file moves are policy violations. Source Code is the top policy (3 users, 28 files), concentrated in Engineering. s.chen appears here again (14 files), making this the third unsanctioned destination for this user this week. Blocking WeTransfer at the network level is the recommended immediate action.",
    "followUps": [
      {
        "text": "Block WeTransfer company-wide",
        "id": "block-recommendation"
      },
      {
        "text": "Show all incidents for s.chen",
        "id": "soc-weekly-storage-users"
      },
      {
        "text": "Which other unsanctioned apps is s.chen using?",
        "id": "top-users"
      },
      {
        "text": "Back to Sensitive Data Movement"
      }
    ],
    "table": {
      "columns": [
        "User",
        "Files",
        "DLP Policy"
      ],
      "rows": [
        [
          "s.chen@company.com",
          "14",
          "Source Code"
        ],
        [
          "r.singh@company.com",
          "11",
          "Confidential — Customer PII"
        ],
        [
          "m.torres@company.com",
          "9",
          "PCI Financial Data"
        ],
        [
          "j.wu@company.com",
          "7",
          "Confidential — Customer PII"
        ],
        [
          "b.okafor@company.com",
          "6",
          "Source Code"
        ],
        [
          "c.hernandez@company.com",
          "5",
          "Source Code"
        ],
        [
          "a.brooks@company.com",
          "4",
          "GenAI — Sensitive Data"
        ],
        [
          "e.foster@company.com",
          "3",
          "PCI Financial Data"
        ],
        [
          "d.white@company.com",
          "1",
          "Confidential — Customer PII"
        ],
        [
          "g.martin@company.com",
          "1",
          "HR — Employee Records"
        ]
      ]
    }
  },
  "dest-github-public": {
    "title": "Top 10 Users → GitHub (public repos) — Last 7 Days",
    "chartType": "table",
    "summary": "All 48 files pushed to public GitHub repos matched the Source Code DLP policy — the highest-risk destination type for IP leakage. a.brooks is the top contributor with 12 files pushed across 4 separate repositories. 8 of 9 users are in Engineering. These incidents require immediate review: any confirmed public commit should be treated as a potential IP exposure incident.",
    "followUps": [
      {
        "text": "Block pushes to public GitHub repos",
        "id": "block-recommendation"
      },
      {
        "text": "Show incidents for a.brooks",
        "id": "soc-weekly-storage-users"
      },
      {
        "text": "Which repos are involved?",
        "id": "top-users"
      },
      {
        "text": "Back to Sensitive Data Movement"
      }
    ],
    "table": {
      "columns": [
        "User",
        "Files",
        "DLP Policy"
      ],
      "rows": [
        [
          "a.brooks@company.com",
          "12",
          "Source Code"
        ],
        [
          "c.hernandez@company.com",
          "9",
          "Source Code"
        ],
        [
          "m.oconnell@company.com",
          "8",
          "Source Code"
        ],
        [
          "r.singh@company.com",
          "7",
          "Source Code"
        ],
        [
          "n.patel@company.com",
          "5",
          "Source Code"
        ],
        [
          "k.tanaka@company.com",
          "3",
          "Source Code"
        ],
        [
          "o.smith@company.com",
          "2",
          "GenAI — Sensitive Data"
        ],
        [
          "y.zhou@company.com",
          "1",
          "Source Code"
        ],
        [
          "d.white@company.com",
          "1",
          "Source Code"
        ]
      ]
    }
  },
  "severity": {
    "title": "Incidents by Severity — Last 7 Days",
    "chartType": "donut",
    "summary": "Of 1,284 total incidents this week, 16% are Critical or High severity — a notable shift from the typical 10–11%. Critical incidents (64) all involve regulated data classes (PII, PCI, PHI). Low and Medium severity together account for 84% of volume and are dominated by routine policy reminders that auto-resolve via user education prompts.",
    "followUps": [
      {
        "text": "Show only the Critical incidents",
        "id": "critical-only"
      },
      {
        "text": "Trend Critical/High severity over 30 days",
        "id": "severity-trend-30d"
      },
      {
        "text": "Which policies are generating Critical incidents?",
        "id": "policies-critical"
      },
      {
        "text": "What is the average resolution time per severity?",
        "id": "resolution-time-severity"
      }
    ],
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
  "trend-30d": {
    "title": "DLP Incident Trend — Last 30 Days",
    "chartType": "kpi+line",
    "summary": "Daily incident volume shows a clear upward drift over the 30-day window — averaging 134/day in week 1 versus 195/day in the most recent week (~46% increase). Two anomalous spikes were detected: Apr 18 and Apr 26. Both correlate with quarterly close activity, when finance teams move large volumes of PCI-classified data.",
    "followUps": [
      {
        "text": "Why did Apr 26 spike?",
        "id": "rca-apr26"
      },
      {
        "text": "Compare this trend to last month",
        "id": "trend-compare-month"
      },
      {
        "text": "Forecast the next 7 days",
        "id": "forecast-7d"
      },
      {
        "text": "Show the same chart split by policy",
        "id": "trend-by-policy"
      }
    ],
    "kpis": [
      {
        "label": "30-day total",
        "value": "4,612"
      },
      {
        "label": "Daily average",
        "value": "154"
      },
      {
        "label": "Peak day",
        "value": "Apr 26"
      },
      {
        "label": "Anomalies detected",
        "value": "2"
      }
    ],
    "series": [
      {
        "name": "Incidents",
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
          205
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
    ],
    "anomalies": [
      {
        "index": 17,
        "value": 182,
        "label": "Apr 18 spike",
        "drill": {
          "text": "Why did Apr 18 spike?",
          "id": "rca-apr26"
        }
      },
      {
        "index": 26,
        "value": 224,
        "label": "Apr 26 spike",
        "drill": {
          "text": "Why did Apr 26 spike?",
          "id": "rca-apr26"
        }
      }
    ]
  },
  "freeform": {
    "title": "DLP Incident Summary",
    "chartType": "kpi+line",
    "summary": "Here's a summary of DLP activity for your scope. I've inferred a 7-day window since none was specified — let me know if you want to adjust the time range or focus on a particular policy, severity, or user.",
    "followUps": [
      {
        "text": "Show me only Critical and High severity",
        "id": "critical-only"
      },
      {
        "text": "Limit to the past 24 hours",
        "id": "last-24h"
      },
      {
        "text": "Group by department instead",
        "id": "by-department"
      },
      {
        "text": "Export this as a CSV",
        "id": "action-export"
      }
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
        "value": "203"
      },
      {
        "label": "Top policy",
        "value": "PII"
      },
      {
        "label": "Top destination",
        "value": "GDrive"
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
  "rca-saturday": {
    "title": "Root cause — Saturday incident spike",
    "chartType": "hbar",
    "summary": "The Saturday spike (224 incidents, +36% vs. weekday average) is concentrated in 4 user cohorts. The finance team's quarterly-close workflow (89 incidents) accounts for the largest share — large PCI-classified datasets being attached to outbound email. This pattern recurs every quarter-end and is mostly a workflow misconfiguration rather than a security event.",
    "followUps": [
      {
        "text": "Show the finance team's incident details",
        "id": "user-detail-jmorales"
      },
      {
        "text": "Which destinations did the Saturday traffic go to?",
        "id": "destinations"
      },
      {
        "text": "Recommend a policy change to reduce false positives",
        "id": "block-recommendation"
      },
      {
        "text": "Acknowledge spike as expected quarter-close behavior",
        "id": "ack-acknowledged"
      }
    ],
    "bars": [
      {
        "label": "Quarterly close — finance team",
        "value": 89,
        "color": "#ef4444"
      },
      {
        "label": "Marketing campaign export",
        "value": 47,
        "color": "#f59e0b"
      },
      {
        "label": "Customer Success email batches",
        "value": 38,
        "color": "#f59e0b"
      },
      {
        "label": "Engineering — code review share",
        "value": 21
      },
      {
        "label": "Other / unattributed",
        "value": 29
      }
    ]
  },
  "compare-week": {
    "title": "DLP Incidents — This Week vs. Last Week",
    "chartType": "kpi+line",
    "summary": "Week-over-week, every day is up except Tue/Wed which are flat. Saturday shows the largest delta (+52%), again driven by quarter-close traffic. The base rate (Mon–Fri average) is up 14%, suggesting a real, sustained increase in DLP triggers — not just a one-day anomaly.",
    "followUps": [
      {
        "text": "What changed Mon–Fri to drive the base rate up?",
        "id": "rca-saturday"
      },
      {
        "text": "Compare against the 4-week trailing average",
        "id": "trend-compare-month"
      },
      {
        "text": "Did any new policies go live this week?",
        "id": "policy-compare-quarter"
      },
      {
        "text": "Forecast next week",
        "id": "forecast-7d"
      }
    ],
    "kpis": [
      {
        "label": "This week",
        "value": "1,284",
        "delta": "+18%",
        "deltaDir": "up",
        "invertColor": true
      },
      {
        "label": "Last week",
        "value": "1,089"
      },
      {
        "label": "Largest day delta",
        "value": "Sat +52%"
      },
      {
        "label": "Smallest day delta",
        "value": "Tue +4%"
      }
    ],
    "series": [
      {
        "name": "This week",
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
      },
      {
        "name": "Last week",
        "color": "#94a3b8",
        "values": [
          124,
          152,
          158,
          154,
          167,
          147,
          187
        ],
        "dashed": true
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
    ],
    "anomalies": [
      {
        "index": 5,
        "value": 224,
        "label": "+52%"
      }
    ]
  },
  "users-saturday": {
    "title": "Users involved in Saturday's incident spike",
    "chartType": "hbar",
    "summary": "224 Saturday incidents involved 43 unique users. The top 5 users account for 43% of the spike — all are members of the Finance or Customer Success orgs. j.morales is the highest contributor (31 incidents) and is also the top-overall user this month.",
    "followUps": [
      {
        "text": "Show j.morales's incidents in detail",
        "id": "user-detail-jmorales"
      },
      {
        "text": "Were any of these escalated to Critical?",
        "id": "critical-only"
      },
      {
        "text": "What policies did these users trigger?",
        "id": "policies-critical"
      },
      {
        "text": "Send this user list to the #dlp-triage channel",
        "id": "slack-sent"
      }
    ],
    "bars": [
      {
        "label": "j.morales@abc.com",
        "value": 31,
        "color": "#ef4444"
      },
      {
        "label": "n.fernandez@abc.com",
        "value": 22
      },
      {
        "label": "k.tanaka@abc.com",
        "value": 19
      },
      {
        "label": "h.becker@abc.com",
        "value": 14
      },
      {
        "label": "s.aldridge@abc.com",
        "value": 12
      },
      {
        "label": "Other (38 users)",
        "value": 126,
        "color": "#94a3b8"
      }
    ]
  },
  "rca-apr26": {
    "title": "Root cause — Apr 26 incident spike",
    "chartType": "kpi+line",
    "summary": "Apr 26 incidents peaked between 10am–11am UTC (28 in a single hour). The spike traces back to the Finance org's quarterly-close batch, which exported PCI-classified Excel files to a shared Google Drive folder. This is a recurring pattern — the same hour-of-day spike appeared on the prior quarter close.",
    "followUps": [
      {
        "text": "Was the same pattern observed last quarter?",
        "id": "policy-compare-quarter"
      },
      {
        "text": "Show only the PCI incidents from Apr 26",
        "id": "policy-detail-pii"
      },
      {
        "text": "Recommend a policy adjustment for quarter-close",
        "id": "block-recommendation"
      },
      {
        "text": "Acknowledge as expected behavior",
        "id": "ack-acknowledged"
      }
    ],
    "kpis": [
      {
        "label": "Apr 26 incidents",
        "value": "224"
      },
      {
        "label": "vs. 7-day baseline",
        "value": "+45%",
        "deltaDir": "up",
        "delta": "+45%",
        "invertColor": true
      },
      {
        "label": "Top policy",
        "value": "PCI"
      },
      {
        "label": "Top user cohort",
        "value": "Finance"
      }
    ],
    "series": [
      {
        "name": "Apr 26 hourly",
        "color": "#ef4444",
        "values": [
          4,
          3,
          2,
          4,
          3,
          6,
          8,
          11,
          14,
          22,
          28,
          19,
          16,
          13,
          11,
          9,
          14,
          19,
          21,
          4,
          3,
          2,
          1,
          1
        ]
      }
    ],
    "xLabels": [
      "00:00",
      "",
      "",
      "",
      "04:00",
      "",
      "",
      "",
      "08:00",
      "",
      "",
      "",
      "12:00",
      "",
      "",
      "",
      "16:00",
      "",
      "",
      "",
      "20:00",
      "",
      "",
      ""
    ],
    "anomalies": [
      {
        "index": 10,
        "value": 28,
        "label": "Peak 10–11am"
      }
    ]
  },
  "policy-detail-pii": {
    "title": "Confidential — Customer PII · last 7 days",
    "chartType": "kpi+line",
    "summary": "Customer PII violations grew 22% week-over-week. Friday and Saturday concentrated 34% of the volume. 78% of incidents were uploads to personal Google Drive accounts, and the most-frequent data class match was customer email addresses + phone numbers in the same row.",
    "followUps": [
      {
        "text": "Which users triggered this policy most?",
        "id": "top-users"
      },
      {
        "text": "Show the destination breakdown for PII",
        "id": "destinations"
      },
      {
        "text": "Trend over the last 30 days",
        "id": "policy-trend-30d"
      },
      {
        "text": "Recommend a policy update",
        "id": "block-recommendation"
      }
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
    ],
    "anomalies": [
      {
        "index": 5,
        "value": 81,
        "label": "Saturday peak"
      }
    ]
  },
  "apps-source-code": {
    "title": "Apps receiving Source Code uploads — last 7 days",
    "chartType": "hbar",
    "summary": "Source code is leaving the corporate perimeter primarily through Slack DMs to external workspaces (124 incidents) and pushes to public GitHub repos (68). Pastebin and Telegram Web account for a smaller but particularly high-risk channel — typically associated with intent to exfiltrate rather than convenience.",
    "followUps": [
      {
        "text": "Show users uploading to public GitHub",
        "id": "users-wetransfer"
      },
      {
        "text": "Block recommendation for these destinations",
        "id": "block-recommendation"
      },
      {
        "text": "Trend source-code policy over 30 days",
        "id": "policy-trend-30d"
      },
      {
        "text": "Filter to only external Slack workspaces",
        "id": "destinations"
      }
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
  "policy-trend-30d": {
    "title": "Top 4 policies — 30-day violation trend",
    "chartType": "kpi+line",
    "summary": "Customer PII and Source Code policies account for the bulk of the upward drift — Source Code in particular grew 62% over the 30-day window. PCI Financial follows the same growth shape but at lower magnitude. HR Documents is the only top-policy trending down (−14%), likely reflecting onboarding-season ending.",
    "followUps": [
      {
        "text": "What's driving the Source Code growth?",
        "id": "apps-source-code"
      },
      {
        "text": "Show forecast for the next 7 days",
        "id": "forecast-7d"
      },
      {
        "text": "Drill into Customer PII",
        "id": "policy-detail-pii"
      },
      {
        "text": "Compare to last quarter",
        "id": "policy-compare-quarter"
      }
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
  },
  "policy-compare-quarter": {
    "title": "Top policies — this quarter vs. last quarter",
    "chartType": "hbar",
    "summary": "Quarter-over-quarter, Source Code violations are up 71% and Customer PII up 30% — the largest movers. PCI Financial is up modestly (+13%). HR Documents is the only top-policy that declined (−15%). Two new policies went live mid-Q2 that may explain ~12% of the PII increase.",
    "followUps": [
      {
        "text": "Which 2 policies went live mid-Q2?",
        "id": "policy-detail-pii"
      },
      {
        "text": "Show 30-day trend for Source Code",
        "id": "policy-trend-30d"
      },
      {
        "text": "Top users for Source Code violations",
        "id": "top-users"
      },
      {
        "text": "Recommend a policy update",
        "id": "block-recommendation"
      }
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
  "user-detail-jmorales": {
    "title": "j.morales@abc.com · UEBA alert breakdown — last 30 days",
    "chartType": "table",
    "summary": "j.morales's 87 UEBA alerts in the last 30 days are concentrated in bulk uploads to personal Google Drive (34) and unusual access pattern alerts from outbound email (28). All five activity types involve moving data out of corporate controls — Google Drive personal is the dominant exfiltration vector. Most alerts fire Friday afternoons. No previous escalations in the last 90 days.",
    "followUps": [
      {
        "text": "Show the destinations j.morales used",
        "id": "destinations"
      },
      {
        "text": "View full incident timeline",
        "id": "incident-table-jmorales"
      },
      {
        "text": "Compare j.morales vs. team baseline",
        "id": "users-compare-month"
      }
    ],
    "table": {
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
    }
  },
  "incident-table-jmorales": {
    "title": "j.morales — recent UEBA alerts",
    "chartType": "table",
    "summary": "Across recent UEBA alerts, the consistent pattern is end-of-day bulk uploads to personal Google Drive on Fridays. 5 of 7 were Allowed by current policy with a coaching banner. Two were Blocked. No alerts have been formally escalated.",
    "followUps": [
      {
        "text": "Show all of j.morales's blocked uploads",
        "id": "user-detail-jmorales"
      },
      {
        "text": "Open the user's manager workflow",
        "id": "slack-sent"
      },
      {
        "text": "Recommend a coaching action",
        "id": "block-recommendation"
      }
    ],
    "table": {
      "columns": [
        "When",
        "UEBA Alert",
        "App",
        "Severity",
        "Action"
      ],
      "rows": [
        [
          "Apr 27 4:12pm",
          "Bulk upload",
          "Google Drive (personal)",
          "High",
          "Allowed"
        ],
        [
          "Apr 27 3:48pm",
          "Unusual access pattern",
          "Outbound email — Gmail",
          "High",
          "Blocked"
        ],
        [
          "Apr 26 5:02pm",
          "Bulk upload",
          "Google Drive (personal)",
          "High",
          "Allowed"
        ],
        [
          "Apr 26 2:31pm",
          "Data exfiltration",
          "Slack DM (external)",
          "Medium",
          "Coached"
        ],
        [
          "Apr 25 4:55pm",
          "Unusual access pattern",
          "Outbound email — Gmail",
          "Critical",
          "Blocked"
        ],
        [
          "Apr 24 1:14pm",
          "Privilege escalation",
          "OneDrive (corp)",
          "Low",
          "Allowed"
        ],
        [
          "Apr 23 5:20pm",
          "Bulk upload",
          "Google Drive (personal)",
          "High",
          "Allowed"
        ]
      ]
    }
  },
  "user-policies-ktanaka": {
    "title": "k.tanaka@abc.com · UEBA alert breakdown — last 30 days",
    "chartType": "table",
    "summary": "k.tanaka's 64 UEBA alerts span 5 distinct activity types. Data exfiltration alerts (28 total) are the highest-priority signal — external Slack shares and public GitHub pushes indicate data leaving corporate controls. Bulk download alerts on personal Google Drive suggest local repository copies being synced externally. Unusual access pattern on WeTransfer warrants engineering team review.",
    "followUps": [
      {
        "text": "Show the Source Code incidents in detail",
        "id": "apps-source-code"
      },
      {
        "text": "Compare k.tanaka vs. j.morales",
        "id": "user-detail-jmorales"
      },
      {
        "text": "Send a coaching message via Slack",
        "id": "slack-sent"
      }
    ],
    "table": {
      "columns": [
        "Activity",
        "App",
        "UEBA Alert",
        "Alerts"
      ],
      "rows": [
        [
          "File share",
          "Slack (external workspace)",
          "Data exfiltration",
          "21"
        ],
        [
          "File attachment",
          "Outbound email — Outlook",
          "Bulk upload",
          "13"
        ],
        [
          "File upload",
          "Google Drive (personal)",
          "Bulk download",
          "18"
        ],
        [
          "Repository push",
          "GitHub (public)",
          "Data exfiltration",
          "7"
        ],
        [
          "File upload",
          "WeTransfer",
          "Unusual access pattern",
          "5"
        ]
      ]
    }
  },
  "user-detail-rsingh": {
    "title": "r.singh@abc.com · UEBA alert breakdown — last 30 days",
    "chartType": "table",
    "summary": "r.singh's 52 UEBA alerts are spread across personal cloud storage and external sharing. Bulk upload alerts on personal Google Drive are the top signal (19), with bulk download alerts on Dropbox and data exfiltration on public GitHub indicating a broader pattern of data moving outside corporate controls. External Slack shares may be prospect-facing communications triggering alerts inadvertently.",
    "followUps": [
      {
        "text": "Compare r.singh vs. team baseline",
        "id": "users-compare-month"
      },
      {
        "text": "Show top destinations for r.singh",
        "id": "destinations"
      },
      {
        "text": "Send a coaching message via Slack",
        "id": "slack-sent"
      },
      {
        "text": "Back to Risky User Behaviors"
      }
    ],
    "table": {
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
          "19"
        ],
        [
          "File upload",
          "Dropbox (personal)",
          "Bulk download",
          "14"
        ],
        [
          "File share",
          "Slack (external workspace)",
          "Data exfiltration",
          "11"
        ],
        [
          "Email attachment",
          "Outbound email — Gmail",
          "Unusual access pattern",
          "5"
        ],
        [
          "Repository push",
          "GitHub (public)",
          "Data exfiltration",
          "3"
        ]
      ]
    }
  },
  "user-detail-moconnell": {
    "title": "m.oconnell@abc.com · UEBA alert breakdown — last 30 days",
    "chartType": "table",
    "summary": "m.oconnell's 41 UEBA alerts are led by bulk upload alerts on WeTransfer (17), which has no sanctioned use case — these are the highest-priority signals. Shared credentials alerts via Slack external workspaces (12) suggest account access is being shared with external parties. Recommend blocking WeTransfer and reviewing Slack external workspace membership for this user.",
    "followUps": [
      {
        "text": "Block WeTransfer company-wide",
        "id": "block-recommendation"
      },
      {
        "text": "Compare m.oconnell vs. team baseline",
        "id": "users-compare-month"
      },
      {
        "text": "Send a coaching message via Slack",
        "id": "slack-sent"
      },
      {
        "text": "Back to Risky User Behaviors"
      }
    ],
    "table": {
      "columns": [
        "Activity",
        "App",
        "UEBA Alert",
        "Alerts"
      ],
      "rows": [
        [
          "File upload",
          "WeTransfer",
          "Bulk upload",
          "17"
        ],
        [
          "File share",
          "Slack (external workspace)",
          "Shared credentials",
          "12"
        ],
        [
          "File upload",
          "Google Drive (personal)",
          "Bulk upload",
          "8"
        ],
        [
          "Email attachment",
          "Outbound email — Outlook",
          "Unusual access pattern",
          "4"
        ]
      ]
    }
  },
  "user-detail-saldridge": {
    "title": "s.aldridge@abc.com · UEBA alert breakdown — last 30 days",
    "chartType": "table",
    "summary": "s.aldridge's 38 UEBA alerts are concentrated in bulk download and data exfiltration signals — 23 alerts across Dropbox personal and public GitHub indicate active syncing of proprietary code outside corporate controls. Privilege escalation alerts on personal Google Drive (12) suggest access to HR or admin data beyond the user's normal role scope. Department: Engineering.",
    "followUps": [
      {
        "text": "Block pushes to public GitHub repos",
        "id": "block-recommendation"
      },
      {
        "text": "Compare s.aldridge vs. team baseline",
        "id": "users-compare-month"
      },
      {
        "text": "Send a coaching message via Slack",
        "id": "slack-sent"
      },
      {
        "text": "Back to Risky User Behaviors"
      }
    ],
    "table": {
      "columns": [
        "Activity",
        "App",
        "UEBA Alert",
        "Alerts"
      ],
      "rows": [
        [
          "File upload",
          "Dropbox (personal)",
          "Bulk download",
          "16"
        ],
        [
          "File upload",
          "Google Drive (personal)",
          "Privilege escalation",
          "12"
        ],
        [
          "Repository push",
          "GitHub (public)",
          "Data exfiltration",
          "7"
        ],
        [
          "File share",
          "Box (corporate)",
          "Bulk upload",
          "3"
        ]
      ]
    }
  },
  "user-detail-pdiallo": {
    "title": "p.diallo@abc.com · UEBA alert breakdown — last 30 days",
    "chartType": "table",
    "summary": "p.diallo's 29 UEBA alerts are driven by data exfiltration signals on external Slack (13) and unusual access pattern alerts on outbound email (10) — both consistent with a Sales role sharing materials with prospects. These may be partially accidental; a targeted coaching intervention and stricter Slack external-share controls would likely reduce alert volume significantly.",
    "followUps": [
      {
        "text": "Recommend a Slack DLP policy",
        "id": "block-recommendation"
      },
      {
        "text": "Compare p.diallo vs. team baseline",
        "id": "users-compare-month"
      },
      {
        "text": "Send a coaching message via Slack",
        "id": "slack-sent"
      },
      {
        "text": "Back to Risky User Behaviors"
      }
    ],
    "table": {
      "columns": [
        "Activity",
        "App",
        "UEBA Alert",
        "Alerts"
      ],
      "rows": [
        [
          "File share",
          "Slack (external workspace)",
          "Data exfiltration",
          "13"
        ],
        [
          "Email attachment",
          "Outbound email — Gmail",
          "Unusual access pattern",
          "10"
        ],
        [
          "File upload",
          "Google Drive (personal)",
          "Privilege escalation",
          "6"
        ]
      ]
    }
  },
  "user-detail-hbecker": {
    "title": "h.becker@abc.com · UEBA alert breakdown — last 30 days",
    "chartType": "table",
    "summary": "h.becker's 22 UEBA alerts are below the escalation threshold but notable for bulk download signals on personal Google Drive — 11 alerts suggest local repository files being synced externally. Data exfiltration and unusual access pattern alerts on Slack and email are consistent with customer-facing activity. Recommend a low-friction coaching nudge before escalating.",
    "followUps": [
      {
        "text": "Compare h.becker vs. team baseline",
        "id": "users-compare-month"
      },
      {
        "text": "Show top destinations for h.becker",
        "id": "destinations"
      },
      {
        "text": "Send a coaching message via Slack",
        "id": "slack-sent"
      },
      {
        "text": "Back to Risky User Behaviors"
      }
    ],
    "table": {
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
          "Bulk download",
          "11"
        ],
        [
          "File share",
          "Slack (external workspace)",
          "Data exfiltration",
          "7"
        ],
        [
          "Email attachment",
          "Outbound email — Outlook",
          "Unusual access pattern",
          "4"
        ]
      ]
    }
  },
  "users-compare-month": {
    "title": "Top users — this month vs. last month",
    "chartType": "hbar",
    "summary": "Among the top 3 repeat offenders, j.morales is up 67% month-over-month and r.singh up 37% — both moving in the wrong direction. k.tanaka is slightly down (−10%). The team baseline is essentially unchanged, indicating the increase in UEBA alerts is driven by a small number of users rather than a systemic shift.",
    "followUps": [
      {
        "text": "Drill into j.morales",
        "id": "user-detail-jmorales"
      },
      {
        "text": "Show how their destinations have changed",
        "id": "users-destinations"
      },
      {
        "text": "Send a digest to their managers",
        "id": "slack-sent"
      },
      {
        "text": "Recommend coaching",
        "id": "block-recommendation"
      }
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
  "users-destinations": {
    "title": "Top users · destination overlap",
    "chartType": "hbar",
    "summary": "The top users do not share most destinations — their patterns are largely role-driven. However, both j.morales and k.tanaka share files into the same external Slack workspace (9 UEBA alerts). That's a thread worth pulling: it could be a sanctioned customer collaboration channel or an unsanctioned shared workspace.",
    "followUps": [
      {
        "text": "Show the shared Slack workspace details",
        "id": "destinations"
      },
      {
        "text": "Trend the shared destination over time",
        "id": "sanctioned-trend"
      },
      {
        "text": "Recommend blocking that workspace",
        "id": "block-recommendation"
      },
      {
        "text": "Send a digest to security architecture team",
        "id": "slack-sent"
      }
    ],
    "bars": [
      {
        "label": "j.morales → Google Drive (personal)",
        "value": 38,
        "color": "#ef4444"
      },
      {
        "label": "k.tanaka → Slack (external)",
        "value": 24,
        "color": "#f59e0b"
      },
      {
        "label": "j.morales → Outbound email",
        "value": 22
      },
      {
        "label": "k.tanaka → Google Drive (personal)",
        "value": 18
      },
      {
        "label": "r.singh → Dropbox (personal)",
        "value": 16
      },
      {
        "label": "j.morales + k.tanaka → same Slack ws.",
        "value": 9,
        "color": "#dc2626"
      }
    ]
  },
  "filetypes-gdrive": {
    "title": "File types uploaded to personal Google Drive",
    "chartType": "donut",
    "summary": "Of the 284 sensitive files uploaded to personal Google Drive this week, 71% are spreadsheets or PDFs. Spreadsheets dominate (124 .xlsx files) and most match the Customer PII data class — typically customer lists, segmented reports, or campaign exports. PDFs are largely commercial contracts and quote documents.",
    "followUps": [
      {
        "text": "Show users responsible for the .xlsx uploads",
        "id": "users-wetransfer"
      },
      {
        "text": "Block .xlsx uploads to personal GDrive",
        "id": "block-recommendation"
      },
      {
        "text": "Trend file-type movement over 30 days",
        "id": "sanctioned-trend"
      },
      {
        "text": "Compare to corporate-managed Drive",
        "id": "destinations"
      }
    ],
    "slices": [
      {
        "label": ".xlsx (spreadsheets)",
        "value": 124,
        "color": "#0ea5e9"
      },
      {
        "label": ".pdf",
        "value": 78,
        "color": "#6366f1"
      },
      {
        "label": ".docx",
        "value": 42
      },
      {
        "label": ".csv",
        "value": 29
      },
      {
        "label": ".pptx",
        "value": 11
      }
    ]
  },
  "users-wetransfer": {
    "title": "Users uploading to high-risk destinations",
    "chartType": "hbar",
    "summary": "73 sensitive uploads this week went to WeTransfer, public GitHub, or Pastebin. 4 users contributed 70% of those incidents. j.morales and n.fernandez are first-time appearances on this list — worth a manager-level coaching conversation given the destinations involved.",
    "followUps": [
      {
        "text": "Show the file types involved",
        "id": "filetypes-gdrive"
      },
      {
        "text": "Block these destinations entirely",
        "id": "block-recommendation"
      },
      {
        "text": "Send a manager digest",
        "id": "slack-sent"
      },
      {
        "text": "Open user detail for n.fernandez",
        "id": "user-detail-jmorales"
      }
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
  "sanctioned-trend": {
    "title": "Sanctioned vs. unsanctioned destinations · 30 days",
    "chartType": "kpi+line",
    "summary": "Sanctioned-app share has fallen from 58% to 40% over 30 days — meaning more sensitive data is now moving through unsanctioned destinations than sanctioned ones. The crossover happened around Apr 18 and has continued. This trend is worth surfacing to the security architecture team.",
    "followUps": [
      {
        "text": "Which apps drove the crossover?",
        "id": "destinations"
      },
      {
        "text": "Recommend block actions for top unsanctioned apps",
        "id": "block-recommendation"
      },
      {
        "text": "Top users moving data to unsanctioned destinations",
        "id": "users-wetransfer"
      }
    ],
    "kpis": [
      {
        "label": "Sanctioned share (now)",
        "value": "40%"
      },
      {
        "label": "Sanctioned share (30d ago)",
        "value": "58%"
      },
      {
        "label": "Unsanctioned movements",
        "value": "1,847"
      },
      {
        "label": "Trend",
        "value": "Worsening"
      }
    ],
    "series": [
      {
        "name": "Sanctioned",
        "color": "#10b981",
        "values": [
          62,
          60,
          61,
          59,
          58,
          60,
          57,
          55,
          56,
          54,
          52,
          53,
          51,
          50,
          48,
          49,
          46,
          45,
          47,
          44,
          42,
          41,
          43,
          40,
          39,
          38,
          37,
          40,
          38,
          40
        ]
      },
      {
        "name": "Unsanctioned",
        "color": "#ef4444",
        "values": [
          38,
          40,
          39,
          41,
          42,
          40,
          43,
          45,
          44,
          46,
          48,
          47,
          49,
          50,
          52,
          51,
          54,
          55,
          53,
          56,
          58,
          59,
          57,
          60,
          61,
          62,
          63,
          60,
          62,
          60
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
  "block-recommendation": {
    "title": "Recommended policy actions",
    "chartType": "action",
    "summary": "Four recommended changes, ordered by impact-per-friction. Drafting a policy from any of these creates a proposal in your existing review workflow — no automatic enforcement.",
    "followUps": [
      {
        "text": "Show me the affected users for recommendation 1",
        "id": "users-wetransfer"
      },
      {
        "text": "Send the recommendations to security architecture",
        "id": "slack-sent"
      },
      {
        "text": "Compare PCI false-positive rate before vs. after",
        "id": "resolution-time-severity"
      }
    ],
    "action": {
      "kind": "recommendation",
      "title": "Suggested policy & destination changes",
      "recommendations": [
        {
          "title": "Block uploads of Customer PII to personal Google Drive accounts",
          "detail": "Would have prevented 78% of this week's PII incidents (322 of 412). Estimated user impact: 47 unique users; provide an in-product justification flow to reduce friction."
        },
        {
          "title": "Coach (do not block) source-code shares to external Slack workspaces",
          "detail": "Source-code Slack DMs are concentrated in Customer Success role. A coaching banner with manager CC may resolve more cases than blocking, given many are sanctioned customer support."
        },
        {
          "title": "Block all uploads to Pastebin and Telegram Web",
          "detail": "Low volume (34 incidents) but all are High/Critical severity. No legitimate business workflow uses these destinations in your tenant."
        },
        {
          "title": "Reduce false positives on PCI quarter-close batch",
          "detail": "An exception window for the Finance org's quarterly export workflow would suppress ~89 expected incidents per quarter without weakening the policy elsewhere."
        }
      ]
    }
  },
  "critical-only": {
    "title": "Critical incidents only — last 7 days",
    "chartType": "kpi+line",
    "summary": "Critical-severity incidents are up 39% week-over-week, with Saturday's spike (19) being the largest single-day count in the last quarter. PCI policy violations (24) account for the largest share of Criticals; PII (21) is close behind. 75% of Criticals are already resolved — but the remaining 16 have aged past the 4-hour SLA.",
    "followUps": [
      {
        "text": "Show the 16 unresolved Critical incidents",
        "id": "incident-table-jmorales"
      },
      {
        "text": "Which users triggered Critical incidents?",
        "id": "users-saturday"
      },
      {
        "text": "Trend Critical/High over 30 days",
        "id": "severity-trend-30d"
      },
      {
        "text": "Send the Critical list to #dlp-triage",
        "id": "slack-sent"
      }
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
    ],
    "anomalies": [
      {
        "index": 5,
        "value": 19,
        "label": "Spike"
      }
    ]
  },
  "severity-trend-30d": {
    "title": "Severity trend — last 30 days",
    "chartType": "kpi+line",
    "summary": "All severity bands are trending up, but Critical and High are growing fastest in relative terms (+115% and +75% over the 30-day window). The Critical share of total incidents has crept up from 3.8% to 4.9% — a meaningful regression in the severity profile, not just volume growth.",
    "followUps": [
      {
        "text": "What's causing the Critical share to rise?",
        "id": "policies-critical"
      },
      {
        "text": "Top users contributing to Critical incidents",
        "id": "users-saturday"
      },
      {
        "text": "Average resolution time per severity",
        "id": "resolution-time-severity"
      },
      {
        "text": "Forecast Critical for the next 7 days",
        "id": "forecast-7d"
      }
    ],
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
        "label": "Avg daily Crit",
        "value": "7.5"
      }
    ],
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
  "policies-critical": {
    "title": "Policies generating Critical incidents",
    "chartType": "hbar",
    "summary": "Critical-severity incidents are concentrated in regulated data classes — PCI (78) and PII (64) account for 64% of all Criticals over 30 days. Healthcare PHI (41) is the third largest, driven by file shares from a small clinical-services team. M&A and Legal have low absolute counts but every incident there is high impact.",
    "followUps": [
      {
        "text": "Drill into PCI Critical incidents",
        "id": "policy-detail-pii"
      },
      {
        "text": "Show the M&A incident details",
        "id": "incident-table-jmorales"
      },
      {
        "text": "Recommend a Critical-only review SLA",
        "id": "block-recommendation"
      },
      {
        "text": "Trend Critical incidents over 30 days",
        "id": "severity-trend-30d"
      }
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
      {
        "text": "Show Critical incidents that breached SLA",
        "id": "critical-only"
      },
      {
        "text": "Trend resolution time over 30 days",
        "id": "severity-trend-30d"
      },
      {
        "text": "Compare to last quarter's resolution times",
        "id": "policy-compare-quarter"
      },
      {
        "text": "Recommend SLA changes",
        "id": "block-recommendation"
      }
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
  "forecast-7d": {
    "title": "DLP incident forecast — next 7 days",
    "chartType": "kpi+line",
    "summary": "Based on the last 30 days, the model forecasts ~1,510 incidents over the next 7 days (±9% CI) — sustained at roughly the elevated current rate. Critical incidents are forecast at 76 (vs. 64 last week). The forecast assumes no new policy changes; a recommended block on personal Google Drive PII uploads would reduce the forecast by an estimated 22%.",
    "followUps": [
      {
        "text": "Show forecast assuming the recommended PII block",
        "id": "block-recommendation"
      },
      {
        "text": "Compare forecast accuracy vs. last week's projection",
        "id": "compare-week"
      },
      {
        "text": "Drill into forecasted Critical incidents",
        "id": "critical-only"
      }
    ],
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
    ],
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
        "dashed": true,
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
        ]
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
    ],
    "forecastIndex": 30
  },
  "trend-by-policy": {
    "title": "30-day incident trend split by top 4 policies",
    "chartType": "kpi+line",
    "summary": "PII and Source Code are the dominant drivers of overall growth — together they account for ~80% of the 30-day trend's upward slope. PCI is stable; HR Documents is the only top policy in decline. Two policy spikes coincide with Apr 18 and Apr 26 (quarter-close PCI batch).",
    "followUps": [
      {
        "text": "Show forecast for Customer PII",
        "id": "forecast-7d"
      },
      {
        "text": "Drill into Source Code growth",
        "id": "apps-source-code"
      },
      {
        "text": "Compare to last quarter",
        "id": "policy-compare-quarter"
      },
      {
        "text": "Recommend a policy update",
        "id": "block-recommendation"
      }
    ],
    "kpis": [
      {
        "label": "Top contributor",
        "value": "PII"
      },
      {
        "label": "Fastest growing",
        "value": "Code",
        "delta": "+62%",
        "deltaDir": "up",
        "invertColor": true
      },
      {
        "label": "Stable",
        "value": "PCI"
      },
      {
        "label": "Declining",
        "value": "HR"
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
  },
  "trend-compare-month": {
    "title": "30-day trend — this month vs. last month",
    "chartType": "kpi+line",
    "summary": "Month-over-month, every week is up. The gap is largest in the last 7 days (~25% delta), suggesting growth is accelerating rather than stabilizing. Apr 26's spike has no equivalent on the prior month — last month's quarter-close-equivalent date (Mar 27) was within normal range.",
    "followUps": [
      {
        "text": "Why is growth accelerating?",
        "id": "rca-saturday"
      },
      {
        "text": "Show forecast for next month",
        "id": "forecast-7d"
      },
      {
        "text": "Compare top users this month vs. last",
        "id": "users-compare-month"
      },
      {
        "text": "Recommend interventions",
        "id": "block-recommendation"
      }
    ],
    "kpis": [
      {
        "label": "This month",
        "value": "4,612",
        "delta": "+18%",
        "deltaDir": "up",
        "invertColor": true
      },
      {
        "label": "Last month",
        "value": "3,902"
      },
      {
        "label": "Largest delta day",
        "value": "Apr 26"
      },
      {
        "label": "MoM growth",
        "value": "+18%"
      }
    ],
    "series": [
      {
        "name": "This month",
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
          205
        ]
      },
      {
        "name": "Last month",
        "color": "#94a3b8",
        "dashed": true,
        "values": [
          114,
          121,
          128,
          118,
          116,
          124,
          131,
          138,
          134,
          141,
          144,
          138,
          128,
          124,
          131,
          138,
          144,
          148,
          141,
          134,
          138,
          148,
          151,
          144,
          138,
          151,
          162,
          164,
          158,
          154
        ]
      }
    ],
    "xLabels": [
      "Day 1",
      "",
      "",
      "",
      "",
      "Day 6",
      "",
      "",
      "",
      "",
      "Day 11",
      "",
      "",
      "",
      "",
      "Day 16",
      "",
      "",
      "",
      "",
      "Day 21",
      "",
      "",
      "",
      "",
      "Day 26",
      "",
      "",
      "",
      ""
    ],
    "anomalies": [
      {
        "index": 26,
        "value": 224,
        "label": "Apr 26"
      }
    ]
  },
  "last-24h": {
    "title": "DLP activity — last 24 hours",
    "chartType": "kpi+line",
    "summary": "203 incidents in the last 24 hours, with the typical morning ramp peaking 10–11am. 47 remain open, of which 9 are Critical — these are the priority queue. Hourly volume is consistent with the 7-day baseline; no anomalous patterns detected in the past 24h.",
    "followUps": [
      {
        "text": "Show only the 47 open incidents",
        "id": "incident-table-jmorales"
      },
      {
        "text": "Show only Critical and High",
        "id": "critical-only"
      },
      {
        "text": "Group the 24h view by department",
        "id": "by-department"
      },
      {
        "text": "Export this 24h view as CSV",
        "id": "action-export"
      }
    ],
    "kpis": [
      {
        "label": "Incidents (24h)",
        "value": "203"
      },
      {
        "label": "Critical / High",
        "value": "31"
      },
      {
        "label": "Open / unresolved",
        "value": "47"
      },
      {
        "label": "Top destination",
        "value": "GDrive"
      }
    ],
    "series": [
      {
        "name": "Hourly",
        "color": "#2563eb",
        "values": [
          4,
          3,
          2,
          4,
          3,
          6,
          8,
          11,
          14,
          22,
          28,
          19,
          16,
          13,
          11,
          9,
          14,
          19,
          21,
          16,
          12,
          8,
          6,
          3
        ]
      }
    ],
    "xLabels": [
      "00:00",
      "",
      "",
      "",
      "04:00",
      "",
      "",
      "",
      "08:00",
      "",
      "",
      "",
      "12:00",
      "",
      "",
      "",
      "16:00",
      "",
      "",
      "",
      "20:00",
      "",
      "",
      ""
    ],
    "anomalies": [
      {
        "index": 10,
        "value": 28,
        "label": "Peak"
      }
    ]
  },
  "by-department": {
    "title": "DLP incidents by department — last 7 days",
    "chartType": "hbar",
    "summary": "Customer Success leads with 412 incidents (32% of total), driven by customer report emails and Slack DMs. Finance is second (287, 22%) — almost entirely PCI-classified data and concentrated on quarter-close days. Engineering accounts for nearly all Source Code violations (193 of 218). Legal and HR are low volume but high severity.",
    "followUps": [
      {
        "text": "Drill into Customer Success",
        "id": "user-detail-jmorales"
      },
      {
        "text": "Show Finance's PCI incidents",
        "id": "policy-detail-pii"
      },
      {
        "text": "Compare departments to last month",
        "id": "users-compare-month"
      }
    ],
    "bars": [
      {
        "label": "Customer Success",
        "value": 412,
        "color": "#ef4444"
      },
      {
        "label": "Finance",
        "value": 287,
        "color": "#f59e0b"
      },
      {
        "label": "Engineering",
        "value": 218
      },
      {
        "label": "Marketing",
        "value": 142
      },
      {
        "label": "Sales",
        "value": 98
      },
      {
        "label": "HR",
        "value": 64
      },
      {
        "label": "Legal",
        "value": 41
      },
      {
        "label": "Other (4 depts)",
        "value": 22
      }
    ]
  },
  "action-export": {
    "title": "CSV export ready",
    "chartType": "action",
    "summary": "I've prepared a CSV of the most recent DLP result set in scope (1,284 rows, 9 columns). The file is ready to download below — you can also share it with another analyst or schedule it to deliver on a recurring basis.",
    "followUps": [
      {
        "text": "Send to the #dlp-triage Slack channel",
        "id": "slack-sent"
      },
      {
        "text": "Filter to Critical/High before exporting",
        "id": "filter-critical-export"
      }
    ],
    "action": {
      "kind": "export",
      "filename": "DLP_incidents_last_7_days.csv",
      "rows": 1284,
      "columns": [
        "incident_id",
        "timestamp",
        "user",
        "policy",
        "severity",
        "data_class",
        "destination_app",
        "action_taken",
        "status"
      ],
      "sizeKb": 412,
      "format": "CSV"
    }
  },
  "export-pdf": {
    "title": "PDF export ready",
    "chartType": "action",
    "summary": "Generated an executive-friendly PDF (5 pages, 1,284 rows summarized into charts). It includes the KPI scorecard, the severity donut, top-10 policies and users, and an anomaly callout for the Saturday spike. Designed to be readable on tablet and print without losing data fidelity.",
    "followUps": [
      {
        "text": "Send to the #dlp-triage Slack channel",
        "id": "slack-sent"
      },
      {
        "text": "Switch back to CSV format",
        "id": "action-export"
      },
      {
        "text": "Filter to Critical/High before exporting",
        "id": "filter-critical-export"
      }
    ],
    "action": {
      "kind": "export",
      "filename": "DLP_incidents_last_7_days.pdf",
      "rows": 1284,
      "columns": [
        "Cover summary",
        "KPI scorecard",
        "Severity donut",
        "Top policies",
        "Top users",
        "Destination breakdown",
        "Anomaly callouts"
      ],
      "sizeKb": 1842,
      "format": "PDF"
    }
  },
  "filter-critical-export": {
    "title": "Filtered CSV export — Critical/High only",
    "chartType": "action",
    "summary": "Filtered the export to Critical and High severity only — 203 rows across 10 columns. The added sla_breach column flags any incident that aged past its severity-specific SLA target. 16 rows have sla_breach=true.",
    "followUps": [
      {
        "text": "Show the 16 SLA-breach rows in detail",
        "id": "incident-table-jmorales"
      },
      {
        "text": "Send to the #dlp-triage Slack channel",
        "id": "slack-sent"
      },
      {
        "text": "Switch to full CSV (1,284 rows)",
        "id": "action-export"
      }
    ],
    "action": {
      "kind": "export",
      "filename": "DLP_critical_high_last_7_days.csv",
      "rows": 203,
      "columns": [
        "incident_id",
        "timestamp",
        "user",
        "policy",
        "severity",
        "data_class",
        "destination_app",
        "action_taken",
        "status",
        "sla_breach"
      ],
      "sizeKb": 88,
      "format": "CSV"
    }
  },
  "schedule-confirmed": {
    "title": "Schedule recurring delivery",
    "chartType": "action",
    "summary": "Configured a weekly CSV delivery scoped to the last 7 days. You'll receive the first run on Monday May 5 at 09:00 UTC. You can edit the schedule, add recipients, or pause it from the Schedules tab in the header.",
    "followUps": [
      {
        "text": "Send to the #dlp-triage Slack channel as well",
        "id": "slack-sent"
      },
      {
        "text": "Switch the recurring format to PDF",
        "id": "export-pdf"
      },
      {
        "text": "Add additional recipients",
        "id": "schedule-confirmed"
      },
      {
        "text": "Cancel this schedule",
        "id": "ack-cancelled"
      }
    ],
    "action": {
      "kind": "schedule",
      "title": "Weekly DLP CSV → o.park@abc.com",
      "firstRun": "Monday, May 5 at 09:00 UTC",
      "fields": [
        {
          "label": "Frequency",
          "value": "Every Monday at 09:00 UTC"
        },
        {
          "label": "Format",
          "value": "CSV"
        },
        {
          "label": "Recipients",
          "value": "o.park@abc.com"
        },
        {
          "label": "Filters",
          "value": "Last 7 days, all severities"
        },
        {
          "label": "First run",
          "value": "Mon May 5, 09:00 UTC"
        },
        {
          "label": "End date",
          "value": "No end date"
        }
      ]
    }
  },
  "slack-sent": {
    "title": "Send to Slack",
    "chartType": "action",
    "summary": "Drafted a Slack message for #dlp-triage with the week's key DLP metrics and the CSV attached. Review the preview below — you can edit the message text or change the channel before sending.",
    "followUps": [
      {
        "text": "Send to a different channel",
        "id": "slack-sent"
      },
      {
        "text": "Switch to PDF attachment",
        "id": "export-pdf"
      },
      {
        "text": "Cancel",
        "id": "ack-cancelled"
      }
    ],
    "action": {
      "kind": "send",
      "title": "Post to #dlp-triage",
      "channel": "#dlp-triage",
      "preview": "📊 DLP weekly digest (Apr 21 – Apr 27)\n\n• 1,284 incidents (+18% w/w)\n• Critical/High: 203 (+24%)\n• Top policy: Confidential — Customer PII (412)\n• Top user: j.morales@abc.com (87 incidents)\n• Top destination: Google Drive (personal) — 284 files\n\nAttached: DLP_incidents_last_7_days.csv"
    }
  },
  "role-ueba-anomalies": {
    "title": "UEBA anomaly clusters — last 24 hours",
    "chartType": "hbar",
    "summary": "28 impossible-travel events flagged in the last 24h — the highest count in 2 weeks. The most concerning cluster is privilege-escalation (12 events, all Critical) tied to 4 user accounts. Off-hours access volume (24) is consistent with normal weekend on-call traffic.",
    "followUps": [
      {
        "text": "Investigate the privilege-escalation events",
        "id": "rca-saturday"
      },
      {
        "text": "Show the 4 affected user accounts",
        "id": "top-users"
      },
      {
        "text": "Trend UEBA anomalies over 30 days",
        "id": "trend-30d"
      },
      {
        "text": "Send the cluster to #threat-intel",
        "id": "slack-sent"
      }
    ],
    "bars": [
      {
        "label": "Impossible travel",
        "value": 28,
        "color": "#EF4444"
      },
      {
        "label": "Off-hours access",
        "value": 24
      },
      {
        "label": "Unusual data download",
        "value": 19,
        "color": "#EF4444"
      },
      {
        "label": "First-time external share",
        "value": 16
      },
      {
        "label": "Privilege escalation",
        "value": 12,
        "color": "#F43F5E"
      },
      {
        "label": "MFA challenge fatigue",
        "value": 9,
        "color": "#EF4444"
      }
    ]
  },
  "role-exec-scorecard": {
    "title": "Weekly executive scorecard",
    "chartType": "kpi+line",
    "summary": "Top-line security posture for the week. Total incidents are up 18% week-over-week. Critical SLA compliance has slipped from 94% to 76% — the team is missing the 4-hour resolution target on Critical incidents, concentrated in Saturday's quarter-close traffic. Compliance posture is Amber: PII (412) and PCI (196) violations both elevated.",
    "followUps": [
      {
        "text": "Why is Critical SLA slipping?",
        "id": "resolution-time-severity"
      },
      {
        "text": "Compare to last quarter",
        "id": "policy-compare-quarter"
      },
      {
        "text": "Forecast for next week",
        "id": "forecast-7d"
      },
      {
        "text": "Send to leadership",
        "id": "slack-sent"
      }
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
        "label": "Critical SLA",
        "value": "76%",
        "delta": "−18pp",
        "deltaDir": "down",
        "invertColor": true
      },
      {
        "label": "Compliance posture",
        "value": "Amber"
      }
    ],
    "series": [
      {
        "name": "Critical+High",
        "color": "#F43F5E",
        "values": [
          12,
          14,
          16,
          18,
          22,
          28,
          21
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
    ],
    "anomalies": [
      {
        "index": 5,
        "value": 28,
        "label": "Saturday spike",
        "drill": {
          "text": "What caused the Saturday spike?",
          "id": "rca-saturday"
        }
      }
    ]
  },
  "role-failed-logins": {
    "title": "Failed login attempts — last 24 hours",
    "chartType": "kpi+line",
    "summary": "1,847 failed login attempts in the last 24h, up 42% from yesterday. Peaked between 10–11am UTC at 28 attempts in a single hour. 31 of those targeted MFA bypass — concentrated on 5 accounts. Top source IP (203.0.113.42, AS-Hosting) accounts for 31% of failures and is consistent with a credential-stuffing campaign.",
    "followUps": [
      {
        "text": "Show the 5 MFA-bypass targets",
        "id": "top-users"
      },
      {
        "text": "Block the top source IP",
        "id": "block-recommendation"
      },
      {
        "text": "Trend failed logins over 7 days",
        "id": "trend-30d"
      },
      {
        "text": "Send to #access-engineering",
        "id": "slack-sent"
      }
    ],
    "kpis": [
      {
        "label": "Failed attempts",
        "value": "1,847",
        "delta": "+42%",
        "deltaDir": "up",
        "invertColor": true
      },
      {
        "label": "MFA bypass attempts",
        "value": "31"
      },
      {
        "label": "Top source IP",
        "value": "203.0.113.42"
      },
      {
        "label": "Account lockouts",
        "value": "12"
      }
    ],
    "series": [
      {
        "name": "Failed logins",
        "color": "#ef4444",
        "values": [
          4,
          3,
          2,
          4,
          3,
          6,
          8,
          11,
          14,
          22,
          28,
          19,
          16,
          13,
          11,
          9,
          14,
          19,
          21,
          16,
          12,
          8,
          6,
          3
        ]
      }
    ],
    "xLabels": [
      "00:00",
      "",
      "",
      "",
      "04:00",
      "",
      "",
      "",
      "08:00",
      "",
      "",
      "",
      "12:00",
      "",
      "",
      "",
      "16:00",
      "",
      "",
      "",
      "20:00",
      "",
      "",
      ""
    ],
    "anomalies": [
      {
        "index": 10,
        "value": 28,
        "label": "Peak",
        "drill": {
          "text": "What caused the 10am peak?",
          "id": "rca-saturday"
        }
      }
    ]
  },
  "ack-acknowledged": {
    "title": "Acknowledgment recorded",
    "chartType": "ack",
    "summary": "Logged your acknowledgment that this spike was expected behavior. The system will down-weight similar same-day quarter-close patterns going forward and surface them as informational rather than warning.",
    "followUps": [
      {
        "text": "Show me the underlying chart again",
        "id": "weekly-overview"
      },
      {
        "text": "View other recent anomalies",
        "id": "trend-30d"
      },
      {
        "text": "Acknowledge similar future quarter-close spikes",
        "id": "ack-acknowledged"
      }
    ],
    "ackKind": "acknowledged"
  },
  "kpi-row-custom": {
    "title": "Custom KPI row — DLP at a glance",
    "chartType": "kpi",
    "summary": "I built a KPI row with the four metrics you asked for, all compared to last week. Two of them (incidents, Critical/High) are trending up — those are the ones to watch. Triage time improved 9% even with the higher volume, which suggests the team's keeping pace.",
    "followUps": [
      {
        "text": "Add SLA compliance as a fifth metric",
        "id": "kpi-row-with-sla"
      },
      {
        "text": "Compare vs. last month instead",
        "id": "kpi-row-vs-month"
      },
      {
        "text": "Save as widget",
        "id": "freeform"
      },
      {
        "text": "Show the daily trend behind these numbers",
        "id": "weekly-overview"
      }
    ],
    "kpis": [
      {
        "label": "Total incidents",
        "value": "1,284",
        "delta": "+18% vs last week",
        "deltaDir": "up",
        "invertColor": true
      },
      {
        "label": "Critical / High",
        "value": "203",
        "delta": "+24% vs last week",
        "deltaDir": "up",
        "invertColor": true
      },
      {
        "label": "Mean time to triage",
        "value": "42m",
        "delta": "−9% vs last week",
        "deltaDir": "down",
        "invertColor": true
      },
      {
        "label": "Policies firing",
        "value": "12 / 38"
      }
    ]
  },
  "kpi-row-with-sla": {
    "title": "Custom KPI row — with SLA compliance",
    "chartType": "kpi",
    "summary": "Added SLA compliance as a fifth metric. It's at 94.2% — down 1.8 points week-over-week. The dip lines up with the Critical/High volume increase.",
    "followUps": [
      {
        "text": "Drill into SLA misses this week",
        "id": "freeform"
      },
      {
        "text": "Compare vs. last month instead",
        "id": "kpi-row-vs-month"
      },
      {
        "text": "Save as widget",
        "id": "freeform"
      }
    ],
    "kpis": [
      {
        "label": "Total incidents",
        "value": "1,284",
        "delta": "+18% vs last week",
        "deltaDir": "up",
        "invertColor": true
      },
      {
        "label": "Critical / High",
        "value": "203",
        "delta": "+24% vs last week",
        "deltaDir": "up",
        "invertColor": true
      },
      {
        "label": "Mean time to triage",
        "value": "42m",
        "delta": "−9% vs last week",
        "deltaDir": "down",
        "invertColor": true
      },
      {
        "label": "Policies firing",
        "value": "12 / 38"
      },
      {
        "label": "SLA compliance",
        "value": "94.2%",
        "delta": "−1.8 pts vs last week",
        "deltaDir": "down",
        "invertColor": false
      }
    ]
  },
  "kpi-row-vs-month": {
    "title": "Custom KPI row — vs. last month",
    "chartType": "kpi",
    "summary": "Switched the comparison window to last month. The trend is the same direction but smaller magnitude — incidents are up 9% MoM (vs. 18% WoW), suggesting the spike is recent rather than a long-term shift.",
    "followUps": [
      {
        "text": "Compare vs. last week instead",
        "id": "kpi-row-custom"
      },
      {
        "text": "Add SLA compliance as a fifth metric",
        "id": "kpi-row-with-sla"
      },
      {
        "text": "Save as widget",
        "id": "freeform"
      }
    ],
    "kpis": [
      {
        "label": "Total incidents",
        "value": "1,284",
        "delta": "+9% vs last month",
        "deltaDir": "up",
        "invertColor": true
      },
      {
        "label": "Critical / High",
        "value": "203",
        "delta": "+12% vs last month",
        "deltaDir": "up",
        "invertColor": true
      },
      {
        "label": "Mean time to triage",
        "value": "42m",
        "delta": "−14% vs last month",
        "deltaDir": "down",
        "invertColor": true
      },
      {
        "label": "Policies firing",
        "value": "12 / 38"
      }
    ]
  },
  "ack-cancelled": {
    "title": "Cancelled",
    "chartType": "ack",
    "summary": "No changes were applied. Nothing was sent, scheduled, or modified. You can pick another follow-up below or start a new prompt.",
    "followUps": [
      {
        "text": "Back to weekly overview",
        "id": "weekly-overview"
      },
      {
        "text": "Show the last action I attempted",
        "id": "action-export"
      },
      {
        "text": "Show top users",
        "id": "top-users"
      },
      {
        "text": "Show top policies",
        "id": "top-policies"
      }
    ],
    "ackKind": "cancelled"
  }
}

export const getResponse = (id: string): Response | undefined => RESPONSES[id]

/** The catch-all answer, used when nothing more specific matches. */
export const FREEFORM_RESPONSE_ID = "freeform"
