import type { ReportDetail } from "@/data/report-details"

/**
 * The two Application Events dashboards, transcribed from Advanced Analytics
 * exports (Sep 2026): figures, column sets and widget order follow the PDFs;
 * weekly series are read off the charts to the nearest gridline.
 *
 * Application Category Dashboard carries AA's dashboard-level Category filter
 * (default Cloud Storage), so its `filters` seed the filter bar with a Category
 * chip.
 */
export const APP_DETAILS: Record<string, Omit<ReportDetail, "id">> = {
  "app-activity": {
    title: "Application Activity Summary",
    description:
      "Files uploaded and downloaded across your applications — who moved them, which activities carried the volume, and how alerts trended — over the last 90 days.",
    summary:
      "Here's your application activity for the last 90 days. 12 GB moved across 252 users, almost all of it downloads — 11 GB over 18,255 download events against 607 MB over 31,688 uploads. Two accounts (swarke and swarke+web) account for most of the volume, including one 8 GB download week at the end of July. CASB API scans covered a further 183 MB. Alert volume held steady week to week and is dominated by policy alerts; DLP alerts are a small, flat share.",
    examplePrompts: [
      "Who downloaded the most data?",
      "What drove the Jul 27 download spike?",
      "Which applications carried the most file volume?",
    ],
    about: {
      blurb:
        "Use this report to see how much file data is moving through your applications, which users and activities are behind it, and whether alert volume is moving with it.",
      questions: [
        "How much data was uploaded and downloaded, and by how many users?",
        "Which users moved the most data, and to which application instances?",
        "Which activities carry the volume — downloads, uploads, API scans?",
        "How are alerts trending alongside file activity?",
      ],
    },
    widgets: [
      {
        type: "kpi",
        size: "full",
        kpis: [
          { label: "Data moved", value: "12 GB", neutral: true },
          { label: "Users", value: "252" },
          { label: "Upload events", value: "31,688", neutral: true },
          { label: "Download events", value: "18,255", neutral: true },
        ],
        insight:
          "12 GB moved across 252 users this period. Downloads carry the volume — 11 GB over 18,255 events — while uploads are far more frequent (31,688 events) but small, totalling 607 MB. Volume is concentrated: two accounts account for the large majority of bytes.",
      },
      {
        type: "table",
        size: "full",
        title: "Top Users by Total Size of Files Uploaded/Downloaded",
        columns: ["User", "# Events", "# Objects", "Uploaded", "Downloaded"],
        rows: [
          ["swarke+web@netskope.com", "61", "6", "402 MB", "1 MB"],
          ["swarke@netskope.com", "39", "7", "336 MB", "8,053 MB"],
          ["vsundaram+web@netskope.com", "151", "39", "46 MB", "71 MB"],
          ["gpilz+web@netskope.com", "56,297", "28", "6 MB", "25 MB"],
          ["pvalenzuela+web@netskope.com", "29", "14", "2 MB", "350 MB"],
          ["pamin+web@netskope.com", "304", "51", "3 MB", "95 MB"],
          ["jatkins@netskope.com", "399", "39", "2 MB", "3 MB"],
          ["sjalal+web@netskope.com", "12", "5", "1 MB", "36 MB"],
        ],
        insight:
          "swarke@netskope.com moved 8 GB of downloads in 39 events — two thirds of all volume this period from one account. gpilz+web is the opposite pattern: 56,297 events for 31 MB, which is automated traffic rather than a person. Both are worth a look for different reasons.",
      },
      {
        type: "hbar",
        size: "half",
        title: "Top Application Activities by File Size (MB)",
        bars: [
          { label: "Download", value: 11072, color: "#0ea5e9" },
          { label: "Upload", value: 607, color: "#f59e0b" },
          { label: "Preview", value: 339, color: "#94a3b8" },
          { label: "Download Installer", value: 195, color: "#94a3b8" },
          { label: "CASB API Scan", value: 183, color: "#94a3b8" },
        ],
        insight:
          "Downloads are 11,072 MB — 18× the upload volume. Preview and Download Installer are small but notable: 195 MB of installers is software arriving from cloud apps, which is a different risk than documents.",
      },
      {
        type: "donut",
        size: "half",
        title: "Activity Mix by # Events",
        slices: [
          { label: "Upload", value: 31688, color: "#f59e0b" },
          { label: "Download", value: 18255, color: "#0ea5e9" },
          { label: "CASB API Scan", value: 4558, color: "#6366f1" },
          { label: "Post", value: 781, color: "#10b981" },
          { label: "Other", value: 2315, color: "#94a3b8" },
        ],
        insight:
          "By count the picture inverts: uploads are 55% of events but 5% of bytes. Many small uploads and a few very large downloads — the download side is where a single event can move gigabytes.",
      },
      {
        type: "line",
        size: "half",
        title: "Trend of Files Uploaded/Downloaded (GB)",
        xLabels: [
          "Jun 8", "Jun 15", "Jun 22", "Jun 29", "Jul 6", "Jul 13", "Jul 20",
          "Jul 27", "Aug 3", "Aug 10", "Aug 17", "Aug 24", "Aug 31", "Sep 7",
        ],
        series: [
          {
            name: "Download (GB)",
            color: "#0ea5e9",
            values: [0.3, 0.2, 0.4, 0.3, 0.5, 0.2, 0.4, 7.9, 0.2, 0.3, 0.1, 0.2, 0.3, 0.2],
          },
          {
            name: "Upload (GB)",
            color: "#f59e0b",
            values: [0.05, 0.03, 0.06, 0.04, 0.05, 0.03, 0.04, 0.06, 0.04, 0.05, 0.03, 0.04, 0.05, 0.04],
          },
        ],
        anomalies: [
          {
            index: 7,
            value: 7.9,
            label: "Jul 27 spike",
            drill: { text: "What drove the Jul 27 download spike?" },
          },
        ],
        insight:
          "Downloads run at 0.2–0.5 GB a week, except the week of Jul 27 at 7.9 GB — that single week is 70% of the period's volume and traces to one account. Uploads are flat at around 50 MB a week.",
      },
      {
        type: "line",
        size: "half",
        title: "Trend of Alerts",
        xLabels: [
          "Jun 8", "Jun 15", "Jun 22", "Jun 29", "Jul 6", "Jul 13", "Jul 20",
          "Jul 27", "Aug 3", "Aug 10", "Aug 17", "Aug 24", "Aug 31", "Sep 7",
        ],
        series: [
          {
            name: "# Total Alerts",
            color: "#6366f1",
            values: [21000, 19500, 22800, 20100, 24300, 18900, 23500, 26800, 22100, 20400, 19800, 21700, 20900, 10200],
          },
          {
            name: "# Policy Alerts",
            color: "#0ea5e9",
            values: [12600, 11700, 13700, 12100, 14600, 11300, 14100, 16100, 13300, 12200, 11900, 13000, 12500, 6100],
          },
          {
            name: "# DLP Alerts",
            color: "#ef4444",
            values: [400, 380, 450, 390, 470, 360, 455, 520, 430, 410, 395, 420, 405, 200],
          },
        ],
        insight:
          "Alerts hold between 19k and 27k a week with no trend; policy alerts are ~60% of the total throughout. DLP alerts stay around 400 a week and did not move with the Jul 27 download spike — that volume was not flagged as sensitive.",
      },
      {
        type: "table",
        size: "full",
        title: "Organization Unit & Application Instance by # Objects",
        columns: ["Organization Unit", "Application", "Instance", "# Objects", "File Size"],
        rows: [
          ["NT SERVICE", "Microsoft Office 365 Outlook.com", "mynetskopedemo.onmicrosoft.com", "318", "0 MB"],
          ["SHAREPOINT", "Microsoft Office 365 Sharepoint Online", "mynetskopedemo.onmicrosoft.com", "21", "0 MB"],
          ["clouddapii.com", "Dropbox", "gmailcom", "5", "1.6 MB"],
          ["clouddapii.com", "ChatGPT", "netskope.com", "3", "13 KB"],
          ["clouddapii.com", "Amazon Systems Manager", "466336652445", "0", "0 MB"],
        ],
        insight:
          "Most objects sit in the corporate Microsoft tenant with no file volume — metadata activity, not transfers. The clouddapii.com unit is small but reaches a personal Dropbox instance (gmailcom), which is where the 1.6 MB of unmanaged movement went.",
      },
    ],
  },

  "app-category": {
    title: "Application Category Dashboard",
    description:
      "Applications detected in each category — top used, managed vs. unmanaged, risky traffic and data movement, and the policies and alerts they trigger. Last 7 days, Cloud Storage category.",
    summary:
      "Here's Cloud Storage for the last 7 days. 5 applications, 10 users, 940 events and 0.08 GB of file volume. OneDrive for Business leads by users and events; GCP Storage leads by sessions and file size. 4 of the 5 apps are managed — Dropbox is the one unmanaged app — and 99.99% of file volume went to managed instances. Box is the only medium-CCL app in use. Alerts are led by OneDrive (16) and the PII sensitivity-label policy (6). Change the Category chip to see the same view for another category.",
    examplePrompts: [
      "Which unmanaged apps are in use?",
      "Show the same view for Generative AI",
      "Which policies fired most in this category?",
    ],
    about: {
      blurb:
        "Use this report to understand the applications in a category: the top used apps, managed against unmanaged, risky traffic and data movement, and the policies and alerts they trigger. Managed / unmanaged follows sanctioned / unsanctioned.",
      questions: [
        "Which applications are used most in this category, and are they managed?",
        "How much traffic goes to risky (medium, low, poor CCL) applications?",
        "Is sensitive data moving to unmanaged applications in this category?",
        "Which policies and applications generate the alerts?",
      ],
    },
    filters: { category: "Cloud Storage" },
    widgets: [
      {
        type: "kpi",
        size: "full",
        kpis: [
          { label: "Applications", value: "5", neutral: true },
          { label: "Users", value: "10", neutral: true },
          { label: "Events", value: "940", neutral: true },
          { label: "Total file size", value: "0.08 GB", neutral: true },
        ],
        insight:
          "5 Cloud Storage applications in use by 10 users, generating 940 events and 0.08 GB of file movement this week. Usage is concentrated in OneDrive for Business (479 events) and Box (428); the other three apps together account for 33 events.",
      },
      {
        type: "donut",
        size: "half",
        title: "Managed vs. Unmanaged Applications",
        slices: [
          { label: "Managed", value: 4, color: "#10b981" },
          { label: "Unmanaged", value: 1, color: "#ef4444" },
        ],
        insight:
          "Four of five apps are sanctioned. The exception is Dropbox — one user, 10 events, no file volume — so unmanaged use exists but is small, and 99.99% of bytes went to managed instances.",
      },
      {
        type: "hbar",
        size: "half",
        title: "Category Breakdown by Application CCL",
        bars: [
          { label: "excellent", value: 1, color: "#10b981" },
          { label: "high", value: 3, color: "#0ea5e9" },
          { label: "medium", value: 1, color: "#f59e0b" },
        ],
        insight:
          "One excellent-rated app (OneDrive), three rated high, and one medium — Box. Box is also the second most used app by events, so the category's risk sits in a heavily used, managed app rather than in shadow IT.",
      },
      {
        type: "table",
        size: "full",
        title: "Application Usage Details",
        columns: ["Application", "CCL", "Managed", "File Size (GB)", "# Users", "# Events", "# Sessions"],
        rows: [
          ["GCP Storage", "high", "Yes", "0.08 GB", "4", "20", "4"],
          ["Microsoft Office 365 OneDrive for Business", "excellent", "Yes", "0.00 GB", "5", "479", "2"],
          ["Box", "medium", "Yes", "0.00 GB", "2", "428", "0"],
          ["Dropbox", "high", "No", "0.00 GB", "1", "10", "1"],
          ["Google Drive", "high", "Yes", "0.00 GB", "1", "3", "1"],
        ],
        insight:
          "GCP Storage carries essentially all the file volume (0.08 GB) from 4 users in 20 events — large objects, few actions. OneDrive and Box are the opposite: hundreds of events with no measurable file size, which is browsing and metadata activity.",
      },
      {
        type: "line",
        size: "half",
        title: "Trend of Application Usage",
        xLabels: ["Sep 1", "Sep 2", "Sep 3", "Sep 4", "Sep 5", "Sep 6", "Sep 7"],
        series: [
          {
            name: "# Events",
            color: "#6366f1",
            values: [98, 142, 160, 131, 155, 124, 130],
          },
        ],
        insight:
          "Daily events run between 98 and 160 with a mid-week peak on Sep 3. No day stands out — usage in this category is routine rather than event-driven.",
      },
      {
        type: "hbar",
        size: "half",
        title: "Top Applications by # Alerts",
        bars: [
          { label: "Microsoft Office 365 OneDrive for Business", value: 16, color: "#ef4444" },
          { label: "Amazon S3", value: 8, color: "#f59e0b" },
          { label: "Google Drive", value: 6, color: "#f59e0b" },
          { label: "Box", value: 5, color: "#f59e0b" },
          { label: "Dropbox", value: 2, color: "#94a3b8" },
          { label: "GCP Storage", value: 1, color: "#94a3b8" },
        ],
        insight:
          "OneDrive generates 16 of 38 alerts — a function of its usage, and mostly the PII sensitivity-label policy doing its job. Amazon S3 (8) is notable because it doesn't appear in the usage table: alerts from API-connected storage, not user sessions.",
      },
      {
        type: "table",
        size: "half",
        title: "Top Policies by # Alerts",
        columns: ["Policy Name", "# Alerts"],
        rows: [
          ["Scan for PII violations in OneDrive - Apply Sensitivity Label", "6"],
          ["Detect Financial Information in managed SaaS", "3"],
          ["Bulk Failed Logins", "3"],
          ["[Context DLP] High Severity PII Block", "2"],
          ["ML - Spike in encrypted files uploaded via API", "2"],
          ["ML - Spike in malware uploads", "2"],
        ],
        insight:
          "The top policy is remediation, not blocking — applying sensitivity labels to PII found in OneDrive. Bulk Failed Logins (3) is the one credential signal in the set and worth correlating with the S3 anomaly alerts.",
      },
      {
        type: "table",
        size: "full",
        title: "Allowed Data Movement Details",
        columns: ["Application", "Activity", "File Size", "# Users", "# Objects"],
        rows: [
          ["Microsoft Office 365 OneDrive for Business", "CASB API Scan", "72 KB", "1", "2"],
          ["Box", "CASB API Scan", "32 KB", "1", "2"],
          ["Microsoft Office 365 OneDrive for Business", "Edit", "0 KB", "2", "5"],
          ["Microsoft Office 365 OneDrive for Business", "PageViewed", "0 KB", "1", "5"],
          ["Box", "Upload", "0 KB", "1", "4"],
          ["Box", "Delete", "0 KB", "1", "3"],
        ],
        insight:
          "No sensitive data moved to unmanaged applications this week, and allowed movement to managed apps is tiny — 104 KB, all of it CASB API scans. The user-driven rows (Edit, Upload, Delete) carry no file size at all.",
      },
    ],
  },
}
