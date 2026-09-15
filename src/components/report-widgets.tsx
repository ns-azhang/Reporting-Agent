import * as React from "react"
import { Sparkles, TrendingDown, TrendingUp } from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ReferenceDot,
  XAxis,
  YAxis,
} from "recharts"

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { WidgetMenu } from "@/components/widget-menu"
import { cn } from "@/lib/utils"
import type {
  DonutWidget,
  GaugeWidget,
  HBarWidget,
  KpiWidget,
  LineWidget,
  TableWidget,
  UnsupportedWidget,
  Widget,
} from "@/data/report-details"

/** Every widget closes with its own insight paragraph, as in the prototype. */
function Insight({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-2 border-t border-border pt-3">
      <Sparkles className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
      <p className="text-xs leading-relaxed text-muted-foreground">{children}</p>
    </div>
  )
}

/** The chrome every renderer passes straight through to WidgetShell. */
type Chrome = {
  /** Drop the card chrome when the widget is already inside one — otherwise a
      chart nested in a response card renders as a card within a card. */
  bare?: boolean
  /** Top-right control, e.g. the per-widget download menu on the canvas. */
  menu?: React.ReactNode
}

function WidgetShell({
  title,
  children,
  insight,
  className,
  bare,
  menu,
}: {
  title?: string
  children: React.ReactNode
  insight: string
  className?: string
} & Chrome) {
  return (
    <section
      className={cn(
        "flex flex-col gap-3",
        !bare &&
          "rounded-xl bg-card p-4 text-card-foreground shadow-xs ring-1 ring-foreground/10",
        className
      )}
    >
      {/* Header row exists when there is a title or a menu; the menu sits at
          the far right whether or not there is a title to share the row with. */}
      {(title || menu) && (
        <div className="flex items-start justify-between gap-2">
          {title ? (
            <h3 className="text-sm font-semibold leading-snug">{title}</h3>
          ) : (
            <span />
          )}
          {menu}
        </div>
      )}
      {children}
      {/* Empty insight means the caller shows the narrative itself (the
          conversation card does), so the block is omitted rather than
          rendering an orphaned icon. */}
      {insight && <Insight>{insight}</Insight>}
    </section>
  )
}

function KpiRow({ widget, bare, menu }: { widget: KpiWidget } & Chrome) {
  return (
    <WidgetShell
      insight={widget.insight}
      bare={bare} menu={menu}
      className={bare ? undefined : "sm:col-span-2"}
    >
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {widget.kpis.map((kpi) => {
          // invertColor marks metrics where "up" is bad (more open incidents),
          // so the arrow direction and the colour have to be decided separately.
          const isBad = kpi.invertColor
            ? kpi.deltaDir === "up"
            : kpi.deltaDir === "down"
          return (
            <div key={kpi.label} className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">{kpi.label}</span>
              <span className="text-2xl font-semibold tracking-tight">
                {kpi.value}
              </span>
              {kpi.delta && (
                <span
                  className={cn(
                    "inline-flex items-center gap-1 text-xs",
                    isBad ? "text-destructive" : "text-muted-foreground"
                  )}
                >
                  {kpi.deltaDir === "up" ? (
                    <TrendingUp className="size-3" />
                  ) : (
                    <TrendingDown className="size-3" />
                  )}
                  {kpi.delta}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </WidgetShell>
  )
}

function DataTable({ widget, bare, menu }: { widget: TableWidget } & Chrome) {
  return (
    <WidgetShell title={widget.title} insight={widget.insight} bare={bare} menu={menu}>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {widget.columns.map((col) => (
                <TableHead key={col} className="text-xs whitespace-nowrap">
                  {col}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {widget.rows.map((row, i) => (
              <TableRow key={i}>
                {row.map((cell, j) => (
                  <TableCell key={j} className="text-xs">
                    {cell}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </WidgetShell>
  )
}

/**
 * One called-out point: a dot on the line and a label above it.
 *
 * The dot is *filled in the series' own colour* with a 2px ring in the surface
 * colour — the standard end-dot treatment, so it reads as "this point on this
 * line" rather than as a foreign ring pasted over the curve. No stroke beyond
 * the ring: an outline is data-weight ink that isn't data.
 *
 * The label wears muted ink, not the series colour. Identity comes from the
 * coloured dot beside it; colouring the text as well says nothing extra and
 * makes small text harder to read. It sits on a surface-coloured plate so it
 * survives crossing a gridline.
 *
 * There is deliberately no dropped line to the axis. It duplicated the
 * gridlines, and on a multi-series chart it crossed the other series on the way
 * down, implying something about values it had nothing to do with.
 */
function AnomalyMarker({
  cx,
  cy,
  label,
  color,
  drillable,
  onClick,
}: {
  cx: number
  cy: number
  label: string
  color: string
  drillable: boolean
  onClick?: () => void
}) {
  const text = drillable ? `${label} ↗` : label
  // SVG can't measure text before it paints, so the plate is sized from the
  // character count. The padding absorbs the error either way.
  const plateWidth = text.length * 5.4 + 10
  const baseline = cy - 14

  return (
    <g
      onClick={drillable ? onClick : undefined}
      style={drillable ? { cursor: "pointer" } : undefined}
    >
      {/* Oversized transparent hit target — an 10px dot is a hard click. */}
      {drillable && <circle cx={cx} cy={cy} r={16} fill="transparent" />}
      <rect
        x={cx - plateWidth / 2}
        y={baseline - 9}
        width={plateWidth}
        height={13}
        rx={3}
        fill="var(--card)"
      />
      <text
        x={cx}
        y={baseline}
        textAnchor="middle"
        fontSize={10}
        fontWeight={500}
        fill="var(--muted-foreground)"
      >
        {text}
      </text>
      <circle
        cx={cx}
        cy={cy}
        r={5}
        fill={color}
        stroke="var(--card)"
        strokeWidth={2}
      />
    </g>
  )
}

function TrendChart({
  widget,
  bare,
  menu,
  onDrill,
}: {
  widget: LineWidget
  onDrill?: (text: string, responseId?: string) => void
} & Chrome) {
  // Recharts wants one row per x value with a key per series, whereas the
  // prototype stores parallel value arrays.
  const data = widget.xLabels.map((label, i) => {
    const row: Record<string, string | number> = { index: i, label }
    for (const s of widget.series) row[s.name] = s.values[i]
    return row
  })

  const config: ChartConfig = Object.fromEntries(
    widget.series.map((s) => [s.name, { label: s.name, color: s.color }])
  )

  const anomalies = widget.anomalies ?? []

  /**
   * Which line does a called-out point sit on? The data records the index and
   * the value but not the series, so match on the value at that index — the dot
   * has to be the colour of the line it lands on, or it reads as a stray mark.
   */
  const seriesColorAt = (index: number, value: number) =>
    (widget.series.find((s) => s.values[index] === value) ?? widget.series[0])
      .color

  /**
   * Most of the prototype's xLabels are sparse — every fifth entry is named and
   * the rest are "". It draws them by index, so blanks cost it nothing; a
   * category axis keyed on the label instead folds all 24 blanks into one
   * repeated category, which also leaves a ReferenceDot with nothing to bind to.
   * So the axis is keyed on the index and the label is only ever displayed.
   */
  const namedTicks = widget.xLabels.flatMap((label, i) => (label ? [i] : []))
  const labelAt = (i: number) => widget.xLabels[Math.round(i)] ?? ""
  /**
   * Ticks are always explicit: left to itself a numeric axis picks round
   * numbers, which can land between two points and format to a blank. Sparse
   * labels are the ones the data names; otherwise thin to ~8, as the prototype
   * does (`i % ceil(n/8) === 0`).
   */
  const ticks =
    namedTicks.length < widget.xLabels.length
      ? namedTicks
      : widget.xLabels.flatMap((_, i) =>
          i % Math.ceil(widget.xLabels.length / 8) === 0 ? [i] : []
        )

  return (
    <WidgetShell title={widget.title} insight={widget.insight} bare={bare} menu={menu}>
      {/* Extra headroom so a marker's label isn't clipped by the plot edge. */}
      <ChartContainer config={config} className="h-[220px] w-full">
        <LineChart data={data} margin={{ left: 4, right: 8, top: anomalies.length ? 24 : 8 }}>
          {/* Solid hairline, not dashed: a dashed grid adds texture that
              competes with the data for attention. Recessive is the job. */}
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="index"
            type="number"
            domain={[0, data.length - 1]}
            ticks={ticks}
            tickFormatter={(i: number) => labelAt(i)}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            fontSize={11}
          />
          <YAxis tickLine={false} axisLine={false} width={28} fontSize={11} />
          <ChartTooltip
            content={
              <ChartTooltipContent
                labelFormatter={(value) => labelAt(Number(value))}
              />
            }
          />
          <ChartLegend content={<ChartLegendContent />} />
          {widget.series.map((s) => (
            <Line
              key={s.name}
              dataKey={s.name}
              type="monotone"
              stroke={s.color}
              strokeWidth={2}
              dot={false}
            />
          ))}

          {anomalies.map((anomaly) => {
            const x = anomaly.index
            if (x < 0 || x >= data.length) return null
            const drillable = !!(anomaly.drill && onDrill)
            return (
              <ReferenceDot
                key={`dot-${anomaly.index}`}
                x={x}
                y={anomaly.value}
                // A `shape` draws the label, the plate, the hit target and the
                // dot as one group; ReferenceDot's own `label` can't carry a
                // click, and the pieces have to move together.
                shape={({ cx, cy }: { cx?: number; cy?: number }) =>
                  cx == null || cy == null ? <g /> : (
                    <AnomalyMarker
                      cx={cx}
                      cy={cy}
                      label={anomaly.label}
                      color={seriesColorAt(anomaly.index, anomaly.value)}
                      drillable={drillable}
                      onClick={() =>
                        anomaly.drill &&
                        onDrill?.(anomaly.drill.text, anomaly.drill.id)
                      }
                    />
                  )
                }
                ifOverflow="visible"
              />
            )
          })}
        </LineChart>
      </ChartContainer>
    </WidgetShell>
  )
}

function HorizontalBars({ widget, bare, menu }: { widget: HBarWidget } & Chrome) {
  const data = widget.bars.map((b) => ({ ...b, short: truncate(b.label, 28) }))
  const config: ChartConfig = { value: { label: "Incidents" } }

  return (
    <WidgetShell title={widget.title} insight={widget.insight} bare={bare} menu={menu}>
      <ChartContainer
        config={config}
        className="w-full"
        style={{ height: Math.max(160, data.length * 30) }}
      >
        <BarChart data={data} layout="vertical" margin={{ left: 4, right: 24 }}>
          {/* Solid hairline — see the note on the trend chart's grid. */}
          <CartesianGrid horizontal={false} />
          <XAxis type="number" tickLine={false} axisLine={false} fontSize={11} />
          <YAxis
            type="category"
            dataKey="short"
            tickLine={false}
            axisLine={false}
            width={150}
            fontSize={11}
          />
          {/* nameKey points the tooltip at the untruncated label. */}
          <ChartTooltip
            content={<ChartTooltipContent nameKey="label" />}
          />
          <Bar dataKey="value" radius={4}>
            {data.map((bar) => (
              <Cell key={bar.label} fill={bar.color ?? "#94a3b8"} />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
    </WidgetShell>
  )
}


function DonutChart({ widget, bare, menu }: { widget: DonutWidget } & Chrome) {
  const total = widget.slices.reduce((sum, s) => sum + s.value, 0)
  const config: ChartConfig = Object.fromEntries(
    widget.slices.map((s) => [s.label, { label: s.label, color: s.color }])
  )

  return (
    <WidgetShell title={widget.title} insight={widget.insight} bare={bare} menu={menu}>
      <div className="flex flex-wrap items-center gap-4">
        <ChartContainer config={config} className="h-[180px] w-[180px] shrink-0">
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent nameKey="label" />} />
            <Pie
              data={widget.slices}
              dataKey="value"
              nameKey="label"
              innerRadius={48}
              outerRadius={72}
              strokeWidth={2}
            >
              {widget.slices.map((slice) => (
                <Cell key={slice.label} fill={slice.color ?? "#94a3b8"} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
        {/* Legend doubles as the value table — the prototype shows counts and
            shares beside the ring rather than relying on hover. */}
        <div className="flex min-w-40 flex-1 flex-col gap-1.5">
          {widget.slices.map((slice) => (
            <div key={slice.label} className="flex items-center gap-2 text-xs">
              <span
                className="size-2.5 shrink-0 rounded-[2px]"
                style={{ background: slice.color ?? "#94a3b8" }}
              />
              <span className="flex-1 truncate">{slice.label}</span>
              <span className="font-medium">{slice.value}</span>
              <span className="w-9 text-right text-muted-foreground">
                {total ? Math.round((slice.value / total) * 100) : 0}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </WidgetShell>
  )
}

function Gauge({ widget, bare, menu }: { widget: GaugeWidget } & Chrome) {
  const config: ChartConfig = { value: { label: widget.label ?? "Value" } }
  return (
    <WidgetShell title={widget.title} insight={widget.insight} bare={bare} menu={menu}>
      <div className="relative">
        <ChartContainer config={config} className="h-[180px] w-full">
          <RadialBarChart
            data={[{ name: "value", value: widget.value }]}
            innerRadius={62}
            outerRadius={86}
            startAngle={90}
            endAngle={-270}
          >
            <PolarAngleAxis
              type="number"
              domain={[0, 100]}
              angleAxisId={0}
              tick={false}
            />
            <RadialBar dataKey="value" cornerRadius={8} fill="#F43F5E" background />
          </RadialBarChart>
        </ChartContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold tracking-tight">
            {widget.value}%
          </span>
          {widget.label && (
            <span className="text-xs text-muted-foreground">{widget.label}</span>
          )}
        </div>
      </div>
    </WidgetShell>
  )
}

/** map / sankey aren't drawn yet — say so rather than dropping the widget. */
function UnsupportedChart({
  widget,
  bare,
  menu,
}: {
  widget: UnsupportedWidget
} & Chrome) {
  return (
    <WidgetShell title={widget.title} insight={widget.insight} bare={bare} menu={menu}>
      <div className="flex h-[160px] items-center justify-center rounded-md bg-muted text-xs text-muted-foreground">
        {widget.type === "map" ? "Map" : "Sankey"} chart not ported yet
      </div>
    </WidgetShell>
  )
}

const truncate = (s: string, n: number) =>
  s.length > n ? `${s.slice(0, n - 1)}…` : s

export function ReportWidget({
  widget,
  bare,
  onDrill,
  downloadable,
}: {
  widget: Widget
  bare?: boolean
  /** Asks a question on behalf of the chart — clicking an anomaly marker. */
  onDrill?: (text: string, responseId?: string) => void
  /** Show the per-widget ⋮ Download menu. Only meaningful on the canvas. */
  downloadable?: boolean
}) {
  // The wrapper is how the menu finds this widget's SVG for the PNG export —
  // `display: contents` keeps it out of the grid layout.
  const host = React.useRef<HTMLDivElement>(null)
  const chrome: Chrome = {
    bare,
    menu:
      downloadable && !bare ? (
        <WidgetMenu
          widget={widget}
          /* Recharts' surface specifically. A bare "svg" matched the first
             one in the section — the ⋮ button's own 16px lucide icon, which
             sits in the header ahead of the chart — and rasterised that. */
          getSvg={() =>
            host.current?.querySelector<SVGSVGElement>("svg.recharts-surface") ??
            null
          }
        />
      ) : undefined,
  }

  const body = (() => {
    switch (widget.type) {
      case "kpi":
        return <KpiRow widget={widget} {...chrome} />
      case "table":
        return <DataTable widget={widget} {...chrome} />
      case "line":
        return <TrendChart widget={widget} {...chrome} onDrill={onDrill} />
      case "hbar":
        return <HorizontalBars widget={widget} {...chrome} />
      case "donut":
        return <DonutChart widget={widget} {...chrome} />
      case "gauge":
        return <Gauge widget={widget} {...chrome} />
      case "map":
      case "sankey":
        return <UnsupportedChart widget={widget} {...chrome} />
    }
  })()

  return chrome.menu ? (
    <div ref={host} className="contents">
      {body}
    </div>
  ) : (
    body
  )
}
