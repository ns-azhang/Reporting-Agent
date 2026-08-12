import { Sparkles, TrendingDown, TrendingUp } from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
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
  HBarWidget,
  KpiWidget,
  LineWidget,
  TableWidget,
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
}: {
  title?: string
  children: React.ReactNode
  insight: string
  className?: string
}) {
  return (
    <section
      className={cn(
        "flex flex-col gap-3 rounded-xl bg-card p-4 text-card-foreground shadow-xs ring-1 ring-foreground/10",
        className
      )}
    >
      {title && (
        <h3 className="text-sm font-semibold leading-snug">{title}</h3>
      )}
      {children}
      <Insight>{insight}</Insight>
    </section>
  )
}

function KpiRow({ widget }: { widget: KpiWidget }) {
  return (
    <WidgetShell insight={widget.insight} className="sm:col-span-2">
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

function DataTable({ widget }: { widget: TableWidget }) {
  return (
    <WidgetShell title={widget.title} insight={widget.insight}>
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

function TrendChart({ widget }: { widget: LineWidget }) {
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
    <WidgetShell title={widget.title} insight={widget.insight}>
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

function HorizontalBars({ widget }: { widget: HBarWidget }) {
  const data = widget.bars.map((b) => ({ ...b, short: truncate(b.label, 28) }))
  const config: ChartConfig = { value: { label: "Incidents" } }

  return (
    <WidgetShell title={widget.title} insight={widget.insight}>
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
              <Cell key={bar.label} fill={bar.color} />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
    </WidgetShell>
  )
}

const truncate = (s: string, n: number) =>
  s.length > n ? `${s.slice(0, n - 1)}…` : s

export function ReportWidget({ widget }: { widget: Widget }) {
  switch (widget.type) {
    case "kpi":
      return <KpiRow widget={widget} />
    case "table":
      return <DataTable widget={widget} />
    case "line":
      return <TrendChart widget={widget} />
    case "hbar":
      return <HorizontalBars widget={widget} />
  }
}
