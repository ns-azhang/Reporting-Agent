import {
  FREEFORM_RESPONSE_ID,
  getResponse,
  type Response,
} from "@/data/responses"

/**
 * What beta doesn't ship yet.
 *
 * These answers stay in the data — they are complete and we want them back
 * after beta — they are just unreachable. Everything listed here takes data
 * *out* of the product: a file download, a Slack post, a recurring delivery.
 * That is the line the beta scope draws, and it is why Download and Copy share
 * link came off the card menu.
 *
 * Deliberately still in scope: `block-recommendation`. A suggested policy
 * change is analysis, the same as any other answer — it doesn't send or export
 * anything. Move it in here if beta says otherwise; it's one line.
 *
 * To un-hide after beta, empty this set. Nothing else has to change.
 */
export const HIDDEN_RESPONSE_IDS: ReadonlySet<string> = new Set([
  "action-export", // CSV export
  "export-pdf", // PDF export
  "filter-critical-export", // filtered CSV export
  "slack-sent", // post to a Slack channel
  "schedule-confirmed", // recurring emailed delivery
])

export const isHiddenResponse = (id: string | undefined): boolean =>
  !!id && HIDDEN_RESPONSE_IDS.has(id)

/**
 * A response with its out-of-scope follow-ups stripped, so a chip can never
 * offer a route to something beta doesn't have. Reached only through here and
 * `classifyPrompt`, which are the two ways a response is ever selected.
 */
export function getVisibleResponse(id: string): Response | undefined {
  if (isHiddenResponse(id)) return getResponse(FREEFORM_RESPONSE_ID)
  const response = getResponse(id)
  if (!response) return undefined
  const followUps = response.followUps.filter((f) => !isHiddenResponse(f.id))
  return followUps.length === response.followUps.length
    ? response
    : { ...response, followUps }
}
