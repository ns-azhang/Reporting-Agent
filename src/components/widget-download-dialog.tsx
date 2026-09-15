import * as React from "react"
import { ChevronDown, Download, ExternalLink } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Widget } from "@/data/report-details"
import {
  DEFAULT_DOWNLOAD_OPTIONS,
  WIDGET_FORMATS,
  buildWidgetFile,
  downloadBlob,
  hasVisualization,
  slug,
  widgetTable,
  type WidgetDownloadOptions,
  type WidgetFormat,
} from "@/lib/export"

/**
 * Advanced Analytics' per-widget Download dialog: a Format select, then
 * "Advanced data options" — Results, Data values, Number of rows — with the
 * same three groups and the same wording. "All results" is the one that
 * matters most to the team: the export isn't capped by what the tile shows.
 *
 * In this prototype the seeded data holds exactly what each tile draws, so
 * Current and All yield the same rows — the counts beside them say so rather
 * than hiding it. The option is wired through; the difference arrives with a
 * backend that can page.
 */

type RowsChoice = "current" | "all" | "custom"

function OptionGroup<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: T
  onChange: (v: T) => void
  options: { value: T; label: React.ReactNode }[]
}) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-1.5 text-xs font-medium text-muted-foreground">
        {label}
      </legend>
      <RadioGroup value={value} onValueChange={(v) => onChange(v as T)}>
        {options.map((o) => (
          <label
            key={o.value}
            className="flex cursor-pointer items-center gap-2.5 text-sm"
          >
            <RadioGroupItem value={o.value} />
            <span>{o.label}</span>
          </label>
        ))}
      </RadioGroup>
    </fieldset>
  )
}

export function WidgetDownloadDialog({
  open,
  onOpenChange,
  widget,
  title,
  getSvg,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  widget: Widget
  title: string
  /** The widget's chart, looked up when the file is built. */
  getSvg: () => SVGSVGElement | null
}) {
  const formats = React.useMemo(
    () => WIDGET_FORMATS.filter((f) => !f.needsSvg || hasVisualization(widget)),
    [widget]
  )
  const rowCount = widgetTable(widget).rows.length

  const [formatId, setFormatId] = React.useState<WidgetFormat["id"]>("csv")
  const [results, setResults] = React.useState(DEFAULT_DOWNLOAD_OPTIONS.results)
  const [values, setValues] = React.useState(DEFAULT_DOWNLOAD_OPTIONS.values)
  const [rows, setRows] = React.useState<RowsChoice>("current")
  const [customRows, setCustomRows] = React.useState(rowCount)
  const [busy, setBusy] = React.useState(false)

  const format = formats.find((f) => f.id === formatId) ?? formats[0]
  const options: WidgetDownloadOptions = {
    results,
    values,
    rows: rows === "custom" ? customRows : rows,
  }

  const build = async () => {
    setBusy(true)
    try {
      return await buildWidgetFile(widget, title, format, options, getSvg())
    } finally {
      setBusy(false)
    }
  }
  const download = async () => {
    const blob = await build()
    if (blob) downloadBlob(`${slug(title)}.${format.ext}`, blob)
    onOpenChange(false)
  }
  /* AA's "Open in Browser": the same file, shown in a new tab instead of saved. */
  const openInBrowser = async () => {
    const blob = await build()
    if (!blob) return
    const url = URL.createObjectURL(blob)
    window.open(url, "_blank", "noopener")
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Download</DialogTitle>
          <DialogDescription className="truncate">{title}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium">Format</span>
          {/* Base UI's Select.Value renders the raw value, so the id is shown
              through a formatter; onValueChange can emit null on clear. */}
          <Select
            value={formatId}
            onValueChange={(v) => v && setFormatId(v as WidgetFormat["id"])}
          >
            <SelectTrigger className="w-full">
              <SelectValue>
                {(v: WidgetFormat["id"] | null) =>
                  formats.find((f) => f.id === v)?.label ?? "Choose a format"
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {formats.map((f) => (
                <SelectItem key={f.id} value={f.id}>
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Collapsible>
          <CollapsibleTrigger
            render={
              <Button
                variant="ghost"
                size="sm"
                className="group -ml-2.5 w-fit gap-1 text-sm font-medium"
              />
            }
          >
            <ChevronDown className="transition-transform duration-200 group-aria-expanded:rotate-180" />
            Advanced data options
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="flex flex-col gap-5 pt-3 pl-1">
              <OptionGroup
                label="Results"
                value={results}
                onChange={setResults}
                options={[
                  { value: "viz", label: "With visualizations options applied" },
                  { value: "table", label: "As displayed in the data table" },
                ]}
              />
              <OptionGroup
                label="Data values"
                value={values}
                onChange={setValues}
                options={[
                  { value: "formatted", label: "Formatted" },
                  {
                    value: "unformatted",
                    label: "Unformatted (no rounding, special characters, etc.)",
                  },
                ]}
              />
              <OptionGroup<RowsChoice>
                label="Number of rows to include"
                value={rows}
                onChange={setRows}
                options={[
                  {
                    value: "current",
                    label: (
                      <>
                        Current result table{" "}
                        <span className="text-muted-foreground">({rowCount} rows)</span>
                      </>
                    ),
                  },
                  {
                    value: "all",
                    label: (
                      <>
                        All results{" "}
                        <span className="text-muted-foreground">({rowCount} rows)</span>
                      </>
                    ),
                  },
                  { value: "custom", label: "Custom" },
                ]}
              />
              {rows === "custom" && (
                <div className="-mt-2 flex items-center gap-2 pl-6">
                  <Input
                    type="number"
                    min={1}
                    max={rowCount}
                    value={customRows}
                    onChange={(e) =>
                      setCustomRows(
                        Math.max(1, Math.min(rowCount, Number(e.target.value) || 1))
                      )
                    }
                    className="h-8 w-24"
                    aria-label="Number of rows"
                  />
                  <span className="text-xs text-muted-foreground">of {rowCount}</span>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>

        <DialogFooter className="sm:justify-between">
          {format.openable ? (
            <Button variant="ghost" size="sm" onClick={openInBrowser} disabled={busy}>
              <ExternalLink />
              Open in Browser
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <DialogClose render={<Button variant="outline" size="sm" />}>
              Cancel
            </DialogClose>
            <Button size="sm" onClick={download} disabled={busy}>
              <Download />
              Download
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default WidgetDownloadDialog
