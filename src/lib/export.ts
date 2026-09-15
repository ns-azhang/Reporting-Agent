import { strToU8, zipSync } from "fflate"

import type { ReportDetail, Widget } from "@/data/report-details"

/**
 * Export, mirroring what Advanced Analytics offers today:
 *
 *   report  Export      -> a ZIP of JSON files describing the report
 *   report  Download    -> PDF or CSV of the whole report
 *   widget  Download    -> TXT, Excel, CSV, JSON, HTML, Markdown, or PNG
 *
 * Every function here produces a real file. A button that only latches to
 * "Downloaded" demonstrates nothing; a file landing in ~/Downloads does.
 *
 * Everything but the two container formats is hand-rolled. XLSX and ZIP are
 * both zip archives, so `fflate` covers both; PDF is emitted directly (a
 * text-only PDF is ~60 lines of format, not worth a 300 KB library); PNG comes
 * from the chart's own SVG via a canvas.
 */

// ---------------------------------------------------------------- basics --

/** "DLP Incident Trend — Last 30 Days" -> "DLP_Incident_Trend_Last_30_Days" */
export const slug = (s: string) =>
  s.replace(/[^\w]+/g, "_").replace(/^_+|_+$/g, "") || "export"

/** Hand a Blob to the browser as a named download. */
export function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  // Revoke after the click has been handled, not before.
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000)
}

export const downloadText = (filename: string, text: string, mime: string) =>
  downloadBlob(filename, new Blob([text], { type: `${mime};charset=utf-8` }))

export const downloadBytes = (filename: string, bytes: Uint8Array, mime: string) =>
  downloadBlob(filename, new Blob([bytes as BlobPart], { type: mime }))

// ------------------------------------------------------- widget -> table --

export type Table = { columns: string[]; rows: string[][] }

/**
 * Every widget as a flat table, which is what every text format wants. Charts
 * export the numbers behind them; a KPI row becomes metric / value / delta.
 */
export function widgetTable(widget: Widget): Table {
  switch (widget.type) {
    case "table":
      return { columns: widget.columns, rows: widget.rows }
    case "kpi":
      return {
        columns: ["Metric", "Value", "Change"],
        rows: widget.kpis.map((k) => [k.label, k.value, k.delta ?? ""]),
      }
    case "line":
      return {
        columns: ["Period", ...widget.series.map((s) => s.name)],
        rows: widget.xLabels.map((label, i) => [
          label || String(i + 1),
          ...widget.series.map((s) => String(s.values[i] ?? "")),
        ]),
      }
    case "hbar":
      return {
        columns: ["Label", "Value"],
        rows: widget.bars.map((b) => [b.label, String(b.value)]),
      }
    case "donut": {
      const total = widget.slices.reduce((sum, s) => sum + s.value, 0)
      return {
        columns: ["Label", "Value", "Share"],
        rows: widget.slices.map((s) => [
          s.label,
          String(s.value),
          total ? `${Math.round((s.value / total) * 100)}%` : "",
        ]),
      }
    }
    case "gauge":
      return {
        columns: ["Label", "Value"],
        rows: [[widget.label ?? "Value", `${widget.value}%`]],
      }
    case "map":
    case "sankey":
      // Not drawn yet, and there's no flat shape for them; export the title only.
      return { columns: ["Widget"], rows: [[widget.title ?? widget.type]] }
  }
}

// -------------------------------------------- AA's "Advanced data options" --

export type WidgetDownloadOptions = {
  /**
   * "viz" applies the chart's own display choices — for a bar chart, the label
   * truncation it draws with. "table" is the underlying labels in full.
   */
  results: "viz" | "table"
  /** "unformatted" turns "1,284" into 1284 and "+18%" into 0.18. */
  values: "formatted" | "unformatted"
  /**
   * How many rows. "current" is what the widget displays; "all" is everything
   * behind it. In this prototype those are the same set — the seeded data holds
   * exactly what is drawn — so the distinction is carried but not yet felt. A
   * number caps the count.
   */
  rows: "current" | "all" | number
}

export const DEFAULT_DOWNLOAD_OPTIONS: WidgetDownloadOptions = {
  results: "viz",
  values: "formatted",
  rows: "current",
}

/** The bar chart truncates labels at this width; the "viz" option mirrors it. */
const VIZ_LABEL_WIDTH = 28
const truncateLabel = (s: string) =>
  s.length > VIZ_LABEL_WIDTH ? `${s.slice(0, VIZ_LABEL_WIDTH - 1)}…` : s

/** "1,284" -> "1284", "+18%" -> "0.18", "−14%" -> "-0.14"; anything else as is. */
export const unformat = (v: string): string => {
  const t = v.trim().replace(/−/g, "-")
  const m = /^([+-]?)([\d,]*\.?\d+)(%?)$/.exec(t)
  if (!m) return v
  const n = Number(m[2].replace(/,/g, ""))
  if (Number.isNaN(n)) return v
  const signed = m[1] === "-" ? -n : n
  return String(m[3] ? signed / 100 : signed)
}

export function applyDownloadOptions(
  widget: Widget,
  table: Table,
  opts: WidgetDownloadOptions
): Table {
  let rows = table.rows
  if (opts.results === "viz" && widget.type === "hbar") {
    rows = rows.map(([label, ...rest]) => [truncateLabel(label), ...rest])
  }
  if (opts.values === "unformatted") {
    rows = rows.map((r) => r.map(unformat))
  }
  if (typeof opts.rows === "number") {
    rows = rows.slice(0, Math.max(0, opts.rows))
  }
  return { columns: table.columns, rows }
}

// ------------------------------------------------- widget format list --

export type WidgetFormat = {
  id: "txt" | "xlsx" | "csv" | "json" | "html" | "md" | "png"
  label: string
  ext: string
  mime: string
  /** Needs the chart's SVG; only offered where one exists. */
  needsSvg?: boolean
  /** Text the browser can show directly — AA's "Open in Browser". */
  openable?: boolean
}

/** AA's dialog list, in AA's order. */
export const WIDGET_FORMATS: WidgetFormat[] = [
  { id: "txt", label: "TXT (tab-separated values)", ext: "txt", mime: "text/plain", openable: true },
  { id: "xlsx", label: "Excel Spreadsheet (Excel 2007 or later)", ext: "xlsx", mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" },
  { id: "csv", label: "CSV", ext: "csv", mime: "text/csv", openable: true },
  { id: "json", label: "JSON", ext: "json", mime: "application/json", openable: true },
  { id: "html", label: "HTML", ext: "html", mime: "text/html", openable: true },
  { id: "md", label: "Markdown", ext: "md", mime: "text/markdown", openable: true },
  { id: "png", label: "PNG (Image of Visualization)", ext: "png", mime: "image/png", needsSvg: true, openable: true },
]

/** Build the file for one widget in one format, honouring the options. */
export async function buildWidgetFile(
  widget: Widget,
  title: string,
  format: WidgetFormat,
  opts: WidgetDownloadOptions,
  svg: SVGSVGElement | null
): Promise<Blob | null> {
  const table = applyDownloadOptions(widget, widgetTable(widget), opts)
  const text = (body: string) => new Blob([body], { type: `${format.mime};charset=utf-8` })
  switch (format.id) {
    case "txt":
      return text(toTSV(table))
    case "csv":
      return text(toCSV(table))
    case "json":
      return text(toJSON(table))
    case "html":
      return text(toHTML(title, table))
    case "md":
      return text(toMarkdown(title, table))
    case "xlsx":
      return new Blob([toXLSX([{ name: title, table }]) as BlobPart], { type: format.mime })
    case "png":
      return svg ? svgToPNG(svg) : null
  }
}

/** Charts have an SVG to capture; tables and KPI rows don't. */
export const hasVisualization = (widget: Widget) =>
  widget.type === "line" ||
  widget.type === "hbar" ||
  widget.type === "donut" ||
  widget.type === "gauge"

// -------------------------------------------------------- text formats --

const csvCell = (v: string) =>
  /[",\r\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v

export const toCSV = ({ columns, rows }: Table) =>
  [columns, ...rows].map((r) => r.map(csvCell).join(",")).join("\r\n") + "\r\n"

export const toTSV = ({ columns, rows }: Table) =>
  [columns, ...rows]
    .map((r) => r.map((v) => v.replace(/[\t\r\n]+/g, " ")).join("\t"))
    .join("\n") + "\n"

export const toJSON = ({ columns, rows }: Table) =>
  JSON.stringify(
    rows.map((r) => Object.fromEntries(columns.map((c, i) => [c, r[i] ?? ""]))),
    null,
    2
  )

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")

export const toHTML = (title: string, { columns, rows }: Table) =>
  `<!doctype html>
<meta charset="utf-8">
<title>${esc(title)}</title>
<style>body{font:14px system-ui,sans-serif;margin:24px}table{border-collapse:collapse}th,td{padding:6px 10px;border:1px solid #ddd;text-align:left}th{background:#f5f5f5}</style>
<h1>${esc(title)}</h1>
<table>
<thead><tr>${columns.map((c) => `<th>${esc(c)}</th>`).join("")}</tr></thead>
<tbody>
${rows.map((r) => `<tr>${r.map((v) => `<td>${esc(v)}</td>`).join("")}</tr>`).join("\n")}
</tbody>
</table>
`

export const toMarkdown = (title: string, { columns, rows }: Table) => {
  const cell = (v: string) => v.replace(/\|/g, "\\|").replace(/\r?\n/g, " ")
  return [
    `# ${title}`,
    "",
    `| ${columns.map(cell).join(" | ")} |`,
    `| ${columns.map(() => "---").join(" | ")} |`,
    ...rows.map((r) => `| ${r.map(cell).join(" | ")} |`),
    "",
  ].join("\n")
}

// -------------------------------------------------------------- xlsx --

/** Excel's sheet-name rules: ≤31 chars, none of []:*?/\ */
const sheetName = (s: string) =>
  (s.replace(/[[\]:*?/\\]/g, " ").trim() || "Sheet1").slice(0, 31)

const colRef = (i: number) => {
  let n = i + 1
  let ref = ""
  while (n > 0) {
    const r = (n - 1) % 26
    ref = String.fromCharCode(65 + r) + ref
    n = Math.floor((n - 1) / 26)
  }
  return ref
}

/**
 * A minimal but valid .xlsx: one worksheet per table, strings inline, numbers
 * as numbers so Excel can sum them. No shared-strings part or styles — Excel
 * neither needs nor misses them.
 */
export function toXLSX(sheets: { name: string; table: Table }[]): Uint8Array {
  const sheetXml = ({ columns, rows }: Table) => {
    const cell = (v: string, c: number, r: number) => {
      const ref = `${colRef(c)}${r}`
      const n = Number(v.replace(/,/g, ""))
      return v !== "" && !Number.isNaN(n) && /^-?[\d,]*\.?\d+%?$/.test(v) && !v.endsWith("%")
        ? `<c r="${ref}"><v>${n}</v></c>`
        : `<c r="${ref}" t="inlineStr"><is><t xml:space="preserve">${esc(v)}</t></is></c>`
    }
    const row = (cells: string[], r: number) =>
      `<row r="${r}">${cells.map((v, c) => cell(v, c, r)).join("")}</row>`
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${[
      row(columns, 1),
      ...rows.map((r, i) => row(r, i + 2)),
    ].join("")}</sheetData></worksheet>`
  }

  const files: Record<string, Uint8Array> = {
    "[Content_Types].xml": strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
${sheets.map((_, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join("\n")}
</Types>`),
    "_rels/.rels": strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`),
    "xl/workbook.xml": strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<sheets>${sheets.map((s, i) => `<sheet name="${esc(sheetName(s.name))}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join("")}</sheets>
</workbook>`),
    "xl/_rels/workbook.xml.rels": strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
${sheets.map((_, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join("\n")}
</Relationships>`),
  }
  sheets.forEach((s, i) => {
    files[`xl/worksheets/sheet${i + 1}.xml`] = strToU8(sheetXml(s.table))
  })
  return zipSync(files)
}

export const XLSX_MIME =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

// --------------------------------------------------------------- pdf --

/**
 * A text-only PDF: Helvetica 10pt, wrapped at ~95 columns, paginated. Enough to
 * carry a report's titles, insights and figures; charts are not drawn.
 *
 * Strings are restricted to Latin-1 so one character is one byte, which keeps
 * the xref offsets honest without a byte-counting pass.
 */
export function toPDF(lines: string[]): Uint8Array {
  const latin1 = (s: string) =>
    s
      .replace(/[—–]/g, "-")
      .replace(/[‘’]/g, "'")
      .replace(/[“”]/g, '"')
      .replace(/•/g, "-")
      .replace(/…/g, "...")
      .replace(/→/g, "->")
      .replace(/≥/g, ">=")
      .replace(/≤/g, "<=")
      .replace(/ /g, " ")
      .replace(/[^\x20-\x7E\xA0-\xFF]/g, "?")
  const pdfString = (s: string) =>
    latin1(s).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)")

  const WIDTH = 95
  const PER_PAGE = 58
  const wrapped: string[] = []
  for (const line of lines) {
    if (line.length <= WIDTH) {
      wrapped.push(line)
      continue
    }
    let rest = line
    while (rest.length > WIDTH) {
      const cut = rest.lastIndexOf(" ", WIDTH)
      const at = cut > WIDTH / 2 ? cut : WIDTH
      wrapped.push(rest.slice(0, at))
      rest = rest.slice(at).trimStart()
    }
    wrapped.push(rest)
  }
  const pages: string[][] = []
  for (let i = 0; i < Math.max(wrapped.length, 1); i += PER_PAGE) {
    pages.push(wrapped.slice(i, i + PER_PAGE))
  }

  // Objects: 1 catalog, 2 pages, 3 font, then (page, content) pairs.
  const objects: string[] = []
  objects.push("<< /Type /Catalog /Pages 2 0 R >>")
  const pageIds = pages.map((_, i) => 4 + i * 2)
  objects.push(
    `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pages.length} >>`
  )
  objects.push(
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>"
  )
  pages.forEach((page, i) => {
    const contentId = pageIds[i] + 1
    objects.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents ${contentId} 0 R /Resources << /Font << /F1 3 0 R >> >> >>`
    )
    const body = [
      "BT",
      "/F1 10 Tf",
      "12 TL",
      "40 752 Td",
      ...page.map((l, j) => `${j ? "T* " : ""}(${pdfString(l)}) Tj`),
      "ET",
    ].join("\n")
    objects.push(`<< /Length ${body.length} >>\nstream\n${body}\nendstream`)
  })

  let out = "%PDF-1.4\n"
  const offsets: number[] = []
  objects.forEach((obj, i) => {
    offsets.push(out.length)
    out += `${i + 1} 0 obj\n${obj}\nendobj\n`
  })
  const xref = out.length
  out += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  for (const off of offsets) out += `${String(off).padStart(10, "0")} 00000 n \n`
  out += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`

  const bytes = new Uint8Array(out.length)
  for (let i = 0; i < out.length; i++) bytes[i] = out.charCodeAt(i) & 0xff
  return bytes
}

// --------------------------------------------------------------- png --

/**
 * Rasterise a chart's SVG. Recharts fills and strokes resolve through CSS
 * custom properties (the --sev-* ramp, for one), which a detached SVG can't
 * see — so the computed values are copied onto the clone first.
 */
export async function svgToPNG(svg: SVGSVGElement, scale = 2): Promise<Blob> {
  const clone = svg.cloneNode(true) as SVGSVGElement
  const src = [svg, ...svg.querySelectorAll("*")]
  const dst = [clone, ...clone.querySelectorAll("*")]
  const PROPS = [
    "fill",
    "fill-opacity",
    "stroke",
    "stroke-width",
    "stroke-dasharray",
    "stroke-opacity",
    "opacity",
    "font-family",
    "font-size",
    "font-weight",
  ]
  src.forEach((el, i) => {
    const cs = getComputedStyle(el)
    const target = dst[i] as SVGElement
    for (const p of PROPS) {
      const v = cs.getPropertyValue(p)
      if (v) target.style.setProperty(p, v)
    }
  })
  const { width, height } = svg.getBoundingClientRect()
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg")
  clone.setAttribute("width", String(width))
  clone.setAttribute("height", String(height))

  const xml = new XMLSerializer().serializeToString(clone)
  const url = URL.createObjectURL(
    new Blob([xml], { type: "image/svg+xml;charset=utf-8" })
  )
  try {
    const img = new Image()
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = () => reject(new Error("SVG did not rasterise"))
      img.src = url
    })
    const canvas = document.createElement("canvas")
    canvas.width = Math.round(width * scale)
    canvas.height = Math.round(height * scale)
    const ctx = canvas.getContext("2d")
    if (!ctx) throw new Error("no 2d context")
    // Opaque white: a transparent PNG shows black in some viewers.
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.scale(scale, scale)
    ctx.drawImage(img, 0, 0)
    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/png")
    )
  } finally {
    URL.revokeObjectURL(url)
  }
}

// ------------------------------------------------------ whole report --

/** Everything a report is, as JSON files in a ZIP — the AA "Export". */
export function reportBundle(report: ReportDetail, widgets: Widget[]): Uint8Array {
  const dir = slug(report.title)
  const files: Record<string, Uint8Array> = {
    [`${dir}/report.json`]: strToU8(
      JSON.stringify(
        {
          id: report.id,
          title: report.title,
          description: report.description,
          summary: report.summary,
          about: report.about,
          examplePrompts: report.examplePrompts,
          widgetCount: widgets.length,
          exportedAt: new Date().toISOString(),
        },
        null,
        2
      )
    ),
  }
  widgets.forEach((w, i) => {
    const name = `${String(i + 1).padStart(2, "0")}-${slug(w.title ?? w.type)}.json`
    files[`${dir}/widgets/${name}`] = strToU8(JSON.stringify(w, null, 2))
  })
  return zipSync(files)
}

/** One CSV, a section per widget, blank line between. */
export function reportCSV(report: ReportDetail, widgets: Widget[]): string {
  const sections = widgets.map((w) => {
    const t = widgetTable(w)
    return `# ${w.title ?? w.type}\r\n${toCSV(t)}`
  })
  return `# ${report.title}\r\n# ${report.description}\r\n\r\n${sections.join("\r\n")}`
}

/** Titles, insights and figures, as lines for the PDF. */
export function reportPDFLines(report: ReportDetail, widgets: Widget[]): string[] {
  const lines: string[] = [report.title, report.description, "", report.summary, ""]
  for (const w of widgets) {
    const t = widgetTable(w)
    lines.push("", (w.title ?? w.type).toUpperCase(), "")
    if (w.insight) lines.push(w.insight, "")
    lines.push(t.columns.join("  |  "))
    for (const r of t.rows) lines.push(r.join("  |  "))
  }
  return lines
}
