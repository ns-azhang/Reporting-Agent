import * as React from "react"
import { Check, ChevronDown, Plus, Sparkle, X } from "lucide-react"

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
import {
  CATEGORIES,
  DATE_RANGES,
  REGIONS,
  SEVERITIES,
  activeChips,
  chipLabel,
  chipValue,
  dimKey,
  dimName,
  isDefaultFilters,
  removeFilter,
  setFilter,
  type ChipKey,
  type Dimension,
  type FilterSource,
  type FilterState,
  type Scope,
} from "@/lib/filters"
import { cn } from "@/lib/utils"

/**
 * The report's filter bar — where the assistant's assumptions become
 * ordinary controls.
 *
 * Every chip is a menu: its values on top, and beneath them "Applies to" —
 * all widgets, or a chosen few — which is how one bar covers both of Advanced
 * Analytics' tiers. A chip the assistant set carries a sparkle and flashes
 * once as it lands. "+ Add filter" is built from the report itself: the
 * dimensions its tables and charts actually carry, with their real values,
 * so nothing is offered that the canvas can't answer.
 */
export function FilterBar({
  state,
  defaults,
  dimensions,
  widgets,
  onChange,
  flashKey,
  allowAdd = false,
}: {
  state: FilterState
  defaults: FilterState
  /** Discovered on this report — what "+ Add filter" suggests. */
  dimensions: Dimension[]
  /** Canvas order, for "Applies to". */
  widgets: { index: number; title: string }[]
  /** A change made in the bar itself, so it is always user-sourced. */
  onChange: (next: FilterState) => void
  /** Bumped when the assistant applies filters — restarts the flash. */
  flashKey: number
  /**
   * Show "+ Add filter". Off by default: the bar exposes what the
   * conversation set, and adding is done by asking ("add a filter on
   * policy") — a second, parallel way in was one control too many beside
   * the date chip. The menu is kept for when that changes.
   */
  allowAdd?: boolean
}) {
  const { values, sources, scopes } = state

  const optionsFor = (key: ChipKey): string[] => {
    const name = dimName(key)
    if (name !== undefined) return dimensions.find((d) => d.name === name)?.values ?? []
    if (key === "date") return DATE_RANGES.map((d) => d.label)
    if (key === "severity") return [...SEVERITIES]
    if (key === "region") return [...REGIONS]
    return [...CATEGORIES]
  }
  // Date options are shown by label but stored by id.
  const storeValue = (key: ChipKey, option: string) =>
    key === "date" ? DATE_RANGES.find((d) => d.label === option)?.id ?? option : option

  const unsetDimensions = dimensions.filter((d) => !(d.name in (values.dimensions ?? {})))
  const canAdd = !values.severity || !values.region || unsetDimensions.length > 0

  return (
    // No leading filter icon: the chips name themselves ("Date:", "Severity:"),
    // and a bare icon at the head of a row looks like a control that does
    // nothing. The row is labelled for assistive tech instead.
    <div className="flex flex-wrap items-center gap-2" aria-label="Report filters">
      {activeChips(state).map((key) => {
        const current = chipValue(key, values)
        const removable = key !== "date" && key !== "category"
        return (
          <Chip
            key={key}
            label={chipLabel(key)}
            value={current || undefined}
            source={sources[key]}
            scope={scopes?.[key]}
            widgetCount={widgets.length}
            flashKey={flashKey}
            onRemove={removable ? () => onChange(removeFilter(state, key)) : undefined}
          >
            {optionsFor(key).map((option) => (
              <DropdownMenuItem
                key={option}
                onClick={() => onChange(setFilter(state, key, storeValue(key, option)))}
              >
                {option}
                {option === current && <Check className="ml-auto" />}
              </DropdownMenuItem>
            ))}
          </Chip>
        )
      })}

      {allowAdd && canAdd && (
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
          <DropdownMenuContent align="start" className="w-fit min-w-48">
            {unsetDimensions.length > 0 && (
              <DropdownMenuGroup>
                {/* Read off this report's own columns and chart categories,
                    so every suggestion has data behind it. */}
                <DropdownMenuLabel>Suggested for this report</DropdownMenuLabel>
                {unsetDimensions.map((dim) => (
                  <DropdownMenuSub key={dim.name}>
                    <DropdownMenuSubTrigger>{dim.name}</DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="w-fit min-w-44">
                      {dim.values.map((v) => (
                        <DropdownMenuItem
                          key={v}
                          onClick={() => onChange(setFilter(state, dimKey(dim.name), v))}
                        >
                          {v}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                ))}
              </DropdownMenuGroup>
            )}
            {unsetDimensions.length > 0 && (!values.severity || !values.region) && (
              <DropdownMenuSeparator />
            )}
            {!values.severity && (
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Severity</DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="w-fit min-w-40">
                  {SEVERITIES.map((s) => (
                    <DropdownMenuItem key={s} onClick={() => onChange(setFilter(state, "severity", s))}>
                      {s}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            )}
            {!values.region && (
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Region</DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="w-fit min-w-40">
                  {REGIONS.map((r) => (
                    <DropdownMenuItem key={r} onClick={() => onChange(setFilter(state, "region", r))}>
                      {r}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
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

/** "· widgets 1, 2" — how a scoped chip says where it reaches. */
function scopeText(scope: Scope | undefined, total: number) {
  if (!scope || scope.length === 0 || scope.length >= total) return undefined
  if (scope.length === 1) return `widget ${scope[0] + 1}`
  if (scope.length <= 3) return `widgets ${scope.map((i) => i + 1).join(", ")}`
  return `${scope.length} widgets`
}

/**
 * One filter as a pill: "Label: Value ⌄" opens its menu — values, then
 * "Applies to"; the ✕ (when the filter is optional) removes it. A chip with no
 * value yet ("add a filter on application") shows "Choose…" until it has one.
 * `key`ed on flashKey so an assistant-set chip re-runs its landing animation
 * each time a prompt touches it.
 */
function Chip({
  label,
  value,
  source,
  scope,
  widgetCount,
  flashKey,
  onRemove,
  children,
}: {
  label: string
  value?: string
  source?: FilterSource
  scope?: Scope
  widgetCount: number
  flashKey: number
  onRemove?: () => void
  children: React.ReactNode
}) {
  const byAi = source === "ai"
  const pending = !value
  const where = scopeText(scope, widgetCount)
  return (
    <div
      key={byAi ? flashKey : -1}
      className={cn(
        "inline-flex h-7 items-center rounded-full border bg-background text-xs shadow-xs",
        pending ? "border-dashed border-ring" : "border-border",
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
          <span className={cn("font-medium", pending && "font-normal text-muted-foreground italic")}>
            {value ?? "Choose…"}
          </span>
          {where && <span className="text-muted-foreground">· {where}</span>}
          <ChevronDown className="size-3 opacity-60" />
        </DropdownMenuTrigger>
        {/* Values only. Pointing the date at particular widgets is done by
            asking ("apply last 30 days to widgets 1 and 2"); the chip then
            says where it reaches, and each widget's mark can take it off. */}
        <DropdownMenuContent align="start" className="w-fit min-w-48">
          <DropdownMenuGroup>{children}</DropdownMenuGroup>
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
