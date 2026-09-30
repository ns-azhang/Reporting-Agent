import * as React from "react"

/**
 * Widget titles inside chat text, set in bold so they read as references to
 * things on the canvas rather than as a run of words — "apply last 30 days to
 * **Weekly Incident Count**". Hovering a name highlights that widget on the
 * left, so the link is shown, not inferred.
 *
 * Longest titles are matched first so a title that contains another isn't
 * split in two. Matching is case-insensitive: the user may have typed it.
 */
export function WidgetNames({
  text,
  widgets,
  onHover,
}: {
  text: string
  widgets: { index: number; title: string }[]
  /** Called with the widget under the pointer, or null when it leaves. */
  onHover?: (index: number | null) => void
}) {
  const parts = React.useMemo(() => split(text, widgets), [text, widgets])
  return (
    <>
      {parts.map((part, i) =>
        typeof part === "string" ? (
          <React.Fragment key={i}>{part}</React.Fragment>
        ) : (
          <strong
            key={i}
            className="font-semibold"
            onMouseEnter={() => onHover?.(part.index)}
            onMouseLeave={() => onHover?.(null)}
          >
            {part.text}
          </strong>
        )
      )}
    </>
  )
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

/** Text broken into plain runs and named-widget runs, in order. */
function split(
  text: string,
  widgets: { index: number; title: string }[]
): (string | { text: string; index: number })[] {
  const titled = widgets.filter((w) => w.title.length >= 4)
  if (!titled.length) return [text]
  const byLength = [...titled].sort((a, b) => b.title.length - a.title.length)
  const re = new RegExp(byLength.map((w) => escapeRe(w.title)).join("|"), "gi")

  const out: (string | { text: string; index: number })[] = []
  let last = 0
  for (const m of text.matchAll(re)) {
    const start = m.index ?? 0
    if (start > last) out.push(text.slice(last, start))
    const hit = byLength.find((w) => w.title.toLowerCase() === m[0].toLowerCase())
    out.push(hit ? { text: m[0], index: hit.index } : m[0])
    last = start + m[0].length
  }
  if (last < text.length) out.push(text.slice(last))
  return out
}

export default WidgetNames
