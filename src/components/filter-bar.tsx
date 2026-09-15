import * as React from "react"
import { Check, ChevronDown, ListFilter, Plus, Sparkle, X } from "lucide-react"

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
import {
  DATE_RANGES,
  FILTER_LABELS,
  REGIONS,
  SEVERITIES,
  filterValueLabel,
  isDefaultFilters,
  type FilterKey,
  type FilterSource,
  type FilterState,
} from "@/lib/filters"
import { cn } from "@/lib/utils"

/**
 * The report's global filter bar — where the assistant's assumptions become
 * ordinary controls.
 *
 * Every chip is a menu: click "Date: Last 7 days" and pick Last 30 days
 * instead, no prompt needed. A chip the assistant set carries a sparkle and
 * flashes once as it lands, so it is clear which constraints came from the
 * conversation and which from a click. Filters persist across prompts until
 * removed here or cleared — the conversation narrows the view, it doesn't
 * reset it each turn.
 */
export function FilterBar({
  state,
  defaults,
  onChange,
  flashKey,
}: {
  state: FilterState
  defaults: FilterState
  /** A change made in the bar itself, so it is always user-sourced. */
  onChange: (next: FilterState) => void
  /** Bumped when the assistant applies filters — restarts the flash. */
  flashKey: number
}) {
  const { values, sources } = state

  const set = <K extends FilterKey>(key: K, value: FilterState["values"][K]) =>
    onChange({
      values: { ...values, [key]: value },
      sources: { ...sources, [key]: "user" },
    })
  const remove = (key: "severity" | "region") => {
    const next = { ...values }
    delete next[key]
    const nextSources = { ...sources }
    delete nextSources[key]
    onChange({ values: next, sources: nextSources })
  }

  const canAdd = !values.severity || !values.region

  return (
    <div className="flex flex-wrap items-center gap-2" aria-label="Report filters">
      <ListFilter className="size-4 text-muted-foreground" aria-hidden />

      <Chip
        label={FILTER_LABELS.date}
        value={filterValueLabel("date", values)!}
        source={sources.date}
        flashKey={flashKey}
      >
        <DropdownMenuGroup>
          {DATE_RANGES.map((d) => (
            <DropdownMenuItem key={d.id} onClick={() => set("date", d.id)}>
              {d.label}
              {d.id === values.date && <Check className="ml-auto" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </Chip>

      {values.severity && (
        <Chip
          label={FILTER_LABELS.severity}
          value={values.severity}
          source={sources.severity}
          flashKey={flashKey}
          onRemove={() => remove("severity")}
        >
          <DropdownMenuGroup>
            {SEVERITIES.map((s) => (
              <DropdownMenuItem key={s} onClick={() => set("severity", s)}>
                {s}
                {s === values.severity && <Check className="ml-auto" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </Chip>
      )}

      {values.region && (
        <Chip
          label={FILTER_LABELS.region}
          value={values.region}
          source={sources.region}
          flashKey={flashKey}
          onRemove={() => remove("region")}
        >
          <DropdownMenuGroup>
            {REGIONS.map((r) => (
              <DropdownMenuItem key={r} onClick={() => set("region", r)}>
                {r}
                {r === values.region && <Check className="ml-auto" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </Chip>
      )}

      {/* Manual additions, so the bar isn't only writable through the chat.
          Flat groups rather than submenus: two short lists don't need a
          second level. */}
      {canAdd && (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="xs"
                className="h-7 rounded-full text-muted-foreground"
              />
            }
          >
            <Plus />
            Add filter
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-44">
            {!values.severity && (
              <DropdownMenuGroup>
                <DropdownMenuLabel>Severity</DropdownMenuLabel>
                {SEVERITIES.map((s) => (
                  <DropdownMenuItem key={s} onClick={() => set("severity", s)}>
                    {s}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            )}
            {!values.severity && !values.region && <DropdownMenuSeparator />}
            {!values.region && (
              <DropdownMenuGroup>
                <DropdownMenuLabel>Region</DropdownMenuLabel>
                {REGIONS.map((r) => (
                  <DropdownMenuItem key={r} onClick={() => set("region", r)}>
                    {r}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {!isDefaultFilters(state, defaults) && (
        <Button
          variant="link"
          size="xs"
          className="text-muted-foreground hover:text-foreground"
          onClick={() => onChange(defaults)}
        >
          Clear all
        </Button>
      )}
    </div>
  )
}

/**
 * One filter as a pill: "Label: Value ⌄" opens its menu; the ✕ (when the
 * filter is optional) removes it. `key`ed on flashKey so an assistant-set chip
 * re-runs its landing animation each time a prompt touches it.
 */
function Chip({
  label,
  value,
  source,
  flashKey,
  onRemove,
  children,
}: {
  label: string
  value: string
  source?: FilterSource
  flashKey: number
  onRemove?: () => void
  children: React.ReactNode
}) {
  const byAi = source === "ai"
  return (
    <div
      key={byAi ? flashKey : -1}
      className={cn(
        "inline-flex h-7 items-center rounded-full border border-border bg-background text-xs shadow-xs",
        byAi && "animate-filter-flash"
      )}
    >
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button
              type="button"
              className={cn(
                "flex h-full items-center gap-1 rounded-full pl-2.5 outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50",
                onRemove ? "pr-1.5" : "pr-2"
              )}
            />
          }
        >
          {byAi && (
            <Sparkle
              className="size-3 text-primary"
              aria-label="Applied from your prompt"
            />
          )}
          <span className="text-muted-foreground">{label}:</span>
          <span className="font-medium">{value}</span>
          <ChevronDown className="size-3 opacity-60" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-44">
          {children}
        </DropdownMenuContent>
      </DropdownMenu>
      {onRemove && (
        <button
          type="button"
          aria-label={`Remove ${label} filter`}
          onClick={onRemove}
          className="mr-1 flex size-5 items-center justify-center rounded-full text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <X className="size-3" />
        </button>
      )}
    </div>
  )
}

export default FilterBar
