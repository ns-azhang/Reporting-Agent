import * as React from "react"

/**
 * Prose with its figures set in bold — "**147** incidents are open across
 * **95** objects … rose **18%** to **147**" — so a summary scans like a
 * headline: the eye lands on the numbers, the sentence carries the context.
 *
 * Only volumes and rates count as figures. Durations ("7 days"), dates,
 * years and ordinals are the frame around the data, not the data, and stay
 * in running weight — the same distinction the filter scaling draws.
 */
const FIGURE = /[+−-]?\$?\d(?:[\d,]*\d)?(?:\.\d+)?(?:\s?(?:%|GB|MB|KB|TB|×|x\b))?/g
const MONTH_BEFORE = /(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s*$/i
const FRAME_AFTER = /^\s*(?:st\b|nd\b|rd\b|th\b|:|[-–]\s*(?:day|week|hour|month)|\s*(?:day|week|hour|month|minute|yr|year)s?\b)/i
const FRAME_BEFORE = /(?:last|past|next|top|week|day|q|step|page|rule|widget)\s*$/i

export function KeyFigures({ text }: { text: string }) {
  const parts = React.useMemo(() => split(text), [text])
  return (
    <>
      {parts.map((part, i) =>
        typeof part === "string" ? (
          <React.Fragment key={i}>{part}</React.Fragment>
        ) : (
          <strong key={i} className="font-semibold tabular-nums text-foreground">
            {part.figure}
          </strong>
        )
      )}
    </>
  )
}

function split(text: string): (string | { figure: string })[] {
  const out: (string | { figure: string })[] = []
  let last = 0
  for (const m of text.matchAll(FIGURE)) {
    const start = m.index ?? 0
    const match = m[0]
    const before = text.slice(Math.max(0, start - 12), start)
    const after = text.slice(start + match.length)
    const bare = match.replace(/[^\d]/g, "")
    const isFrame =
      /^\d{4}$/.test(bare) && !/[%,.]/.test(match) || // a year
      /[-–\d.]$/.test(before) || /^[-–]\d/.test(after) || // inside a date or a range
      MONTH_BEFORE.test(before) ||
      FRAME_BEFORE.test(before) ||
      FRAME_AFTER.test(after) ||
      /\w$/.test(before)
    if (isFrame) continue
    if (start > last) out.push(text.slice(last, start))
    out.push({ figure: match })
    last = start + match.length
  }
  if (last < text.length) out.push(text.slice(last))
  return out
}

export default KeyFigures
