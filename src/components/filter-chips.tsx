import { X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

/**
 * Filter chip row, matching the Aurora product's pattern: unselected is a flat
 * grey fill with muted text and no border; selected is a solid dark fill with
 * light text. The stock Toggle only shifts to bg-muted when pressed, which
 * reads as barely-changed next to Aurora's chips.
 *
 * Styling hangs off `aria-pressed:` because that is what Base UI sets — the
 * `data-[state=on]` selector in toggle-group.tsx is dead Radix leftover and
 * never matches.
 */
const CHIP =
  "rounded-md border-0 bg-muted px-3 text-muted-foreground shadow-none " +
  "hover:bg-muted/70 hover:text-foreground " +
  "aria-pressed:bg-primary aria-pressed:text-primary-foreground " +
  "aria-pressed:hover:bg-primary/90"

export type FilterChipOption = {
  value: string
  label: string
  /** Absolute count, shown before the label like Aurora's "4 Crit + high". */
  count: number
  icon?: React.ReactNode
}

type FilterChipsProps = {
  options: FilterChipOption[]
  value: string[]
  onValueChange: (value: string[]) => void
}

export function FilterChips({
  options,
  value,
  onValueChange,
}: FilterChipsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* ToggleGroup rather than looped buttons with manual active state —
          this is a multi-select option set. Base UI spells the flag
          `multiple`, not Radix's type="multiple". */}
      <ToggleGroup
        multiple
        size="sm"
        value={value}
        onValueChange={onValueChange}
        className="flex-wrap justify-start"
      >
        {options.map((option) => (
          <ToggleGroupItem
            key={option.value}
            value={option.value}
            className={CHIP}
          >
            {option.icon}
            <span className="font-semibold">{option.count}</span>
            {option.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      {/* Only offered when there's something to clear, so it isn't a
          permanently dead control. */}
      {value.length > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onValueChange([])}
          className="text-muted-foreground"
        >
          <X />
          Clear
        </Button>
      )}
    </div>
  )
}
