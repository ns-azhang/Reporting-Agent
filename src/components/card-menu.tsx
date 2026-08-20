import * as React from "react"
import { MoreVertical, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"

/**
 * The ⋮ menu on a response card. Save to is the only thing in it — Download and
 * Copy share link are out of beta scope — so it opens straight onto the report
 * picker rather than making you step through a submenu to reach the sole option.
 *
 * The caller only mounts this when the card has a chart worth saving, so there
 * is no empty state here: a menu whose only content is "nothing to save" is a
 * dead control, and hiding it says the same thing more clearly.
 */

export type SavableReport = {
  id: string
  title: string
  /** Who it is shared with, when it is — these group separately. */
  sharedWith?: string
}

export function CardMenu({
  reports,
  title,
  onNote,
  onSaveTo,
}: {
  reports: SavableReport[]
  /** The card's own title — the default name for a new report. */
  title: string
  /** Record a finished action in the thread. */
  onNote?: (text: string, link?: { reportId: string; label: string }) => void
  /**
   * Which report was picked. Saving lives with the caller because only it holds
   * the response the widgets come from — this menu just knows the target.
   */
  onSaveTo?: (report: SavableReport) => void
}) {
  const [name, setName] = React.useState("")
  // Controlled, because Create is a plain button rather than a menu item —
  // menu items dismiss on select, an arbitrary button inside the popup doesn't.
  const [open, setOpen] = React.useState(false)

  const dismiss = () => {
    setName("")
    setOpen(false)
  }
  const create = () => {
    onNote?.(`Created “${name.trim() || title}” with this chart.`)
    dismiss()
  }
  const saveTo = (report: SavableReport) => {
    onSaveTo?.(report)
    dismiss()
  }

  const owned = reports.filter((r) => !r.sharedWith)
  const shared = reports.filter((r) => r.sharedWith)

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="icon-sm" aria-label="Save to a report" />}
      >
        <MoreVertical />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuGroup>
          {/* Names the panel, since the kebab no longer says what it opens. */}
          <DropdownMenuLabel>Save to</DropdownMenuLabel>
          {/* A field inside a menu: stop keys here so the menu's own typeahead
              and arrow navigation don't eat what you type. */}
          <div
            className="flex items-center gap-1.5 px-2 py-1"
            onKeyDown={(e) => {
              e.stopPropagation()
              if (e.key === "Enter") create()
            }}
          >
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={title}
              className="h-7 min-w-0 flex-1 text-xs"
            />
            <Button size="sm" className="h-7" onClick={create}>
              Create
            </Button>
          </div>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {reports.length === 0 ? (
          <DropdownMenuGroup>
            <DropdownMenuLabel>My reports</DropdownMenuLabel>
            <DropdownMenuItem disabled>
              No reports yet — create one above.
            </DropdownMenuItem>
          </DropdownMenuGroup>
        ) : (
          <>
            {owned.length > 0 && (
              <DropdownMenuGroup>
                <DropdownMenuLabel>My reports</DropdownMenuLabel>
                {owned.map((report) => (
                  <DropdownMenuItem
                    key={report.id}
                    onClick={() => saveTo(report)}
                  >
                    <span className="truncate">{report.title}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            )}
            {shared.length > 0 && (
              <>
                {owned.length > 0 && <DropdownMenuSeparator />}
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Shared with edit access</DropdownMenuLabel>
                  {shared.map((report) => (
                    <DropdownMenuItem
                      key={report.id}
                      title={`Shared with ${report.sharedWith}`}
                      onClick={() => saveTo(report)}
                    >
                      <Users className="text-muted-foreground" />
                      <span className="truncate">{report.title}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default CardMenu
