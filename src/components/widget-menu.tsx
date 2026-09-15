import { Download, MoreVertical } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Widget } from "@/data/report-details"
import {
  XLSX_MIME,
  downloadBlob,
  downloadBytes,
  downloadText,
  hasVisualization,
  slug,
  svgToPNG,
  toCSV,
  toHTML,
  toJSON,
  toMarkdown,
  toTSV,
  toXLSX,
  widgetTable,
} from "@/lib/export"

/**
 * The ⋮ on a report-canvas widget — Advanced Analytics' per-tile menu, which is
 * Download in the formats its dialog lists, in the order it lists them. Picking
 * one downloads immediately; there is nothing else to ask.
 *
 * PNG is offered only where there is a chart to capture. A table or KPI row has
 * no SVG, and rasterising HTML would need a library for an image of a table.
 */
export function WidgetMenu({
  widget,
  getSvg,
}: {
  widget: Widget
  /** The widget's chart, looked up at click time — it may not exist at mount. */
  getSvg: () => SVGSVGElement | null
}) {
  // KPI rows carry no title of their own, and "kpi.csv" is not a filename
  // anyone would recognise on their desktop.
  const title = widget.title ?? (widget.type === "kpi" ? "Key metrics" : widget.type)
  const base = slug(title)
  const table = () => widgetTable(widget)

  const formats: { label: string; run: () => void | Promise<void> }[] = [
    {
      label: "TXT (tab-separated values)",
      run: () => downloadText(`${base}.txt`, toTSV(table()), "text/tab-separated-values"),
    },
    {
      label: "Excel Spreadsheet (Excel 2007 or later)",
      run: () =>
        downloadBytes(`${base}.xlsx`, toXLSX([{ name: title, table: table() }]), XLSX_MIME),
    },
    { label: "CSV", run: () => downloadText(`${base}.csv`, toCSV(table()), "text/csv") },
    { label: "JSON", run: () => downloadText(`${base}.json`, toJSON(table()), "application/json") },
    { label: "HTML", run: () => downloadText(`${base}.html`, toHTML(title, table()), "text/html") },
    {
      label: "Markdown",
      run: () => downloadText(`${base}.md`, toMarkdown(title, table()), "text/markdown"),
    },
    ...(hasVisualization(widget)
      ? [
          {
            label: "PNG (Image of Visualization)",
            run: async () => {
              const svg = getSvg()
              if (svg) downloadBlob(`${base}.png`, await svgToPNG(svg))
            },
          },
        ]
      : []),
  ]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Options for ${title}`}
            className="-mt-1 -mr-2 text-muted-foreground"
          />
        }
      >
        <MoreVertical />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Download />
              Download
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-72">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Format</DropdownMenuLabel>
                {formats.map((f) => (
                  <DropdownMenuItem key={f.label} onClick={() => void f.run()}>
                    {f.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default WidgetMenu
