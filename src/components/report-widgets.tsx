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

function WidgetShell({
  title,
  children,
  insight,
  className,
  bare,
}: {
  title?: string
  children: React.ReactNode
  insight: string
  className?: string
  /** Drop the card chrome when the widget is already inside one — otherwise a
      chart nested in a response card renders as a card within a card. */
  bare?: boolean
}) {
  return (
    <section
      className={cn(
        "flex flex-col gap-3",
        !bare &&
          "rounded-xl bg-card p-4 text-card-foreground shadow-xs ring-1 ring-foreground/10",
        className
      )}
    >
      {title && <h3 className="text-sm font-semibold leading-snug">{title}</h3>}
      {children}
      {/* Empty insight means the caller shows the narrative itself (the
          conversation card does), so the block is omitted rather than
          rendering an orphaned icon. */}
      {insight && <Insight>{insight}</Insight>}
    </section>
  )
}

function KpiRow({ widget, bare }: { widget: KpiWidget; bare?: boolean }) {
  return (
    <WidgetShell
      insight={widget.insight}
      bare={bare}
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

function DataTable({ widget, bare }: { widget: TableWidget; bare?: boolean }) {
  return (
    <WidgetShell title={widget.title} insight={widget.insight} bare={bare}>
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

function TrendChart({ widget, bare }: { widget: LineWidget; bare?: boolean }) {
  // Recharts wants one row per x value with a key per series, whereas the
  // prototype stores parallel value arrays.
  const data = widget.xLabels.map((label, i) => {
    const row: Record<string, string | number> = { label }
    for (const s of widget.series) row[s.name] = s.values[i]
    return row
  })

  const config: ChartConfig = Object.fromEntries(
    widget.series.map((s) => [s.name, { label: s.name, color: s.color }])
  )

  return (
    <WidgetShell title={widget.title} insight={widget.insight} bare={bare}>
      <ChartContainer config={config} className="h-[220px] w-full">
        <LineChart data={data} margin={{ left: 4, right: 8, top: 8 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            fontSize={11}
          />
          <YAxis tickLine={false} axisLine={false} width={28} fontSize={11} />
          <ChartTooltip content={<ChartTooltipContent />} />
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
        </LineChart>
      </ChartContainer>
    </WidgetShell>
  )
}

function HorizontalBars({ widget, bare }: { widget: HBarWidget; bare?: boolean }) {
  const data = widget.bars.map((b) => ({ ...b, short: truncate(b.label, 28) }))
  const config: ChartConfig = { value: { label: "Incidents" } }

  return (
    <WidgetShell title={widget.title} insight={widget.insight} bare={bare}>
      <ChartContainer
        config={config}
        className="w-full"
        style={{ height: Math.max(160, data.length * 30) }}
      >
        <BarChart data={data} layout="vertical" margin={{ left: 4, right: 24 }}>
          <CartesianGrid horizontal={false} strokeDasharray="3 3" />
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


function DonutChart({ widget, bare }: { widget: DonutWidget; bare?: boolean }) {
  const total = widget.slices.reduce((sum, s) => sum + s.value, 0)
  const config: ChartConfig = Object.fromEntries(
    widget.slices.map((s) => [s.label, { label: s.label, color: s.color }])
  )

  return (
    <WidgetShell title={widget.title} insight={widget.insight} bare={bare}>
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

function Gauge({ widget, bare }: { widget: GaugeWidget; bare?: boolean }) {
  const config: ChartConfig = { value: { label: widget.label ?? "Value" } }
  return (
    <WidgetShell title={widget.title} insight={widget.insight} bare={bare}>
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
}: {
  widget: UnsupportedWidget
  bare?: boolean
}) {
  return (
    <WidgetShell title={widget.title} insight={widget.insight} bare={bare}>
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
}: {
  widget: Widget
  bare?: boolean
}) {
  switch (widget.type) {
    case "kpi":
      return <KpiRow widget={widget} bare={bare} />
    case "table":
      return <DataTable widget={widget} bare={bare} />
    case "line":
      return <TrendChart widget={widget} bare={bare} />
    case "hbar":
      return <HorizontalBars widget={widget} bare={bare} />
    case "donut":
      return <DonutChart widget={widget} bare={bare} />
    case "gauge":
      return <Gauge widget={widget} bare={bare} />
    case "map":
    case "sankey":
      return <UnsupportedChart widget={widget} bare={bare} />
  }
}
