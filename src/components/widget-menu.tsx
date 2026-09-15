import * as React from "react"
import { Download, MoreVertical } from "lucide-react"

import { WidgetDownloadDialog } from "@/components/widget-download-dialog"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Widget } from "@/data/report-details"

/**
 * The ⋮ on a report-canvas widget — Advanced Analytics' per-tile menu. Its one
 * item, Download…, opens AA's dialog: a Format select plus the Advanced data
 * options (Results, Data values, Number of rows). The dialog is where the
 * formats live now; a flat submenu couldn't carry "All results".
 */
export function WidgetMenu({
  widget,
  getSvg,
}: {
  widget: Widget
  /** The widget's chart, looked up at download time — it may not exist at mount. */
  getSvg: () => SVGSVGElement | null
}) {
  // KPI rows carry no title of their own, and "kpi.csv" is not a filename
  // anyone would recognise on their desktop.
  const title = widget.title ?? (widget.type === "kpi" ? "Key metrics" : widget.type)
  const [open, setOpen] = React.useState(false)

  return (
    <>
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
            <DropdownMenuItem onClick={() => setOpen(true)}>
              <Download />
              Download…
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <WidgetDownloadDialog
        open={open}
        onOpenChange={setOpen}
        widget={widget}
        title={title}
        getSvg={getSvg}
      />
    </>
  )
}

export default WidgetMenu
