import * as React from "react"
import {
  Download,
  FileText,
  Link2,
  MoreVertical,
  Save,
  Users,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"

/**
 * The ⋮ menu on a response card, ported from the prototype's ResponseCard menu
 * in its `saveToMode` form — the one the conversation thread uses, which is
 * just Save to and Download. (The dashboard-canvas variant also carries Share,
 * Copy insight, Add to dashboard and Remove; those belong to a surface v6 does
 * not have.)
 *
 * Save to needs a chart to save, and Download has nothing to export from a
 * prepared action, so each hides when it has nothing to act on rather than
 * offering a dead item.
 *
 * Every item here completes its action outright. Download used to send "Export
 * this as a CSV" into the chat, which answered with an export card offering
 * CSV, PDF and a share link all over again — asking the same question twice.
 * The formats live here, so the answer does too, and the share link joins them
 * as its own item rather than hiding under "Download as".
 *
 * Confirmation lands in the thread via `onNote`, since there is no toaster.
 * The copy lives here so all of this menu's wording sits in one place.
 */

export type SavableReport = {
  id: string
  title: string
  /** Who it is shared with, when it is — these group separately. */
  sharedWith?: string
}

/** "DLP Incident Trend — Last 30 Days" -> "DLP_Incident_Trend_Last_30_Days" */
const filenameFor = (title: string, extension: string) =>
  `${title.replace(/[^\w]+/g, "_").replace(/^_+|_+$/g, "")}.${extension}`

export function CardMenu({
  reports,
  hasChart,
  isAction,
  title,
  onNote,
}: {
  reports: SavableReport[]
  /** False on a card with nothing chart-shaped to save. */
  hasChart: boolean
  /** True for prepared actions and acknowledgements. */
  isAction: boolean
  /** The card's own title — names the download and the new report. */
  title: string
  /** Record a finished action in the thread. */
  onNote: (text: string) => void
}) {
  const [name, setName] = React.useState("")
  // Controlled, because Create is a plain button rather than a menu item —
  // menu items dismiss on select, an arbitrary button inside the popup doesn't.
  const [open, setOpen] = React.useState(false)

  const act = (note: string) => {
    onNote(note)
    setName("")
    setOpen(false)
  }
  const create = () =>
    act(`Created “${name.trim() || title}” with this chart.`)

  const owned = reports.filter((r) => !r.sharedWith)
  const shared = reports.filter((r) => r.sharedWith)

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="icon-sm" aria-label="More" />}
      >
        <MoreVertical />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Save />
              Save to
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-64">
              {!hasChart ? (
                <DropdownMenuGroup>
                  <DropdownMenuItem disabled>
                    Nothing to save from this card.
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              ) : (
                <>
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>New report</DropdownMenuLabel>
                    {/* A field inside a menu: stop keys here so the menu's own
                        typeahead and arrow navigation don't eat what you type. */}
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
                              onClick={() => act(`Added “${title}” to ${report.title}.`)}
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
                            <DropdownMenuLabel>
                              Shared with edit access
                            </DropdownMenuLabel>
                            {shared.map((report) => (
                              <DropdownMenuItem
                                key={report.id}
                                title={`Shared with ${report.sharedWith}`}
                                onClick={() => act(`Added “${title}” to ${report.title}.`)}
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
                </>
              )}
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          {!isAction && (
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Download />
                Download
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-40">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Download as</DropdownMenuLabel>
                  {(["csv", "pdf"] as const).map((extension) => (
                    <DropdownMenuItem
                      key={extension}
                      onClick={() =>
                        act(`Downloaded ${filenameFor(title, extension)}.`)
                      }
                    >
                      <FileText />
                      {extension.toUpperCase()}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          )}

          {/* Its own item, not a third entry under "Download as" — a link is
              not a file format. */}
          <DropdownMenuItem
            onClick={() => act(`Copied a share link to “${title}”.`)}
          >
            <Link2 />
            Copy share link
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default CardMenu
