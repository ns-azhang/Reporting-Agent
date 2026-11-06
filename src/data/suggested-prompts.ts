/**
 * Tagged prompts — the category pill reduces scan cost in the dropdown, so the
 * label doesn't repeat it. Each names the answer it leads to: a short label
 * like "7-day DLP alert trend" would otherwise open the DLP report on the bare
 * word "dlp", or land on a near miss. Edit the label (its time range, say)
 * and it is classified like any typed prompt.
 */
export const SUGGESTED_PROMPTS = [
  { tag: "Alerts", text: "7-day alert volume by type", responseId: "soc-weekly-categories" },
  { tag: "Alerts", text: "7-day alert volume trend", responseId: "weekly-overview" },
  { tag: "Blocked", text: "Top blocked apps in past 7 days", responseId: "soc-weekly-top-apps" },
  { tag: "DLP", text: "Top users with DLP violations", responseId: "top-users" },
  { tag: "DLP", text: "App violations by rule severity", responseId: "soc-top-apps" },
  { tag: "DLP", text: "7-day DLP alert trend", responseId: "weekly-overview" },
  { tag: "DLP", text: "Teams with most DLP alerts", responseId: "by-department" },
  { tag: "Policies", text: "Top triggered policies & actions", responseId: "soc-policy-actions" },
  // No malware or site-category answer yet: the nearest ones stand in.
  { tag: "Malware", text: "Users with most malware blocks", responseId: "soc-weekly-risky-users" },
  { tag: "Risky Sites", text: "Top malicious site categories", responseId: "soc-weekly-categories" },
  { tag: "AI Apps", text: "Top AI apps by users & events", responseId: "ai-risk-top-apps" },
  { tag: "AI Apps", text: "Policy actions on AI traffic", responseId: "ai-risk-user-activities" },
  { tag: "Data", text: "Top users by upload file size", responseId: "soc-weekly-storage-users" },
  { tag: "Shadow IT", text: "Unsanctioned apps moving files", responseId: "destinations" },
] as const

/** The suggested prompt a text is, when it is sent as written. */
export const suggestedPrompt = (text: string) =>
  SUGGESTED_PROMPTS.find((p) => p.text.toLowerCase() === text.trim().toLowerCase())

/** The answer a suggested prompt leads to, when it is sent as written. */
export const suggestedAnswer = (text: string) => suggestedPrompt(text)?.responseId
