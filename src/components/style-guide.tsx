import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  Download,
  FileText,
  MoreVertical,
  Search,
  Share2,
  Trash2,
} from "lucide-react"

const BUTTON_VARIANTS = [
  "default",
  "outline",
  "secondary",
  "ghost",
  "destructive",
  "link",
] as const
const BUTTON_SIZES = ["xs", "sm", "default", "lg"] as const
const BADGE_VARIANTS = [
  "default",
  "secondary",
  "outline",
  "destructive",
  "ghost",
] as const

const TOKENS = [
  ["background", "bg-background"],
  ["foreground", "bg-foreground"],
  ["primary", "bg-primary"],
  ["secondary", "bg-secondary"],
  ["muted", "bg-muted"],
  ["accent", "bg-accent"],
  ["destructive", "bg-destructive"],
  ["border", "bg-border"],
  ["ring", "bg-ring"],
] as const

function Row({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  )
}

export function StyleGuide() {
  return (
    <div className="min-h-svh bg-background text-foreground">
      <div className="mx-auto flex max-w-3xl flex-col gap-8 px-8 py-10">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Real shadcn/ui — v6
          </h1>
          <p className="text-sm text-muted-foreground">
            Stock CLI components (preset: vega) on Tailwind v4 + Radix. Compare
            against the hand-port at workflow-v5.html?styleguide.
          </p>
        </div>

        <Separator />

        <Row label="Button — variants">
          {BUTTON_VARIANTS.map((v) => (
            <Button key={v} variant={v}>
              {v}
            </Button>
          ))}
        </Row>

        <Row label="Button — sizes">
          {BUTTON_SIZES.map((s) => (
            <Button key={s} size={s}>
              {s}
            </Button>
          ))}
          <Button size="icon" aria-label="icon">
            <MoreVertical />
          </Button>
          <Button size="icon-sm" variant="outline" aria-label="icon-sm">
            <Search />
          </Button>
        </Row>

        <Row label="Button — with icon / disabled">
          <Button>
            <Download /> Download
          </Button>
          <Button variant="outline">
            <Share2 /> Share
          </Button>
          <Button disabled>Disabled</Button>
        </Row>

        <Row label="Badge">
          {BADGE_VARIANTS.map((v) => (
            <Badge key={v} variant={v}>
              {v}
            </Badge>
          ))}
        </Row>

        {/* The focus ring is the thing to compare — the first input autofocuses. */}
        <Row label="Input — focus ring (Tab through these)">
          <div className="flex w-full max-w-sm flex-col gap-2">
            <Input placeholder="Search by case ID, title, user…" autoFocus />
            <Input placeholder="Disabled" disabled />
          </div>
        </Row>

        <Row label="Select">
          <Select>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All assignees" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All assignees</SelectItem>
                <SelectItem value="me">Assigned to me</SelectItem>
                <SelectItem value="unassigned">Unassigned</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All rules" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All rules</SelectItem>
                <SelectItem value="dlp">DLP</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </Row>

        <Row label="Dropdown menu (⋮)">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button variant="outline" size="icon-sm" aria-label="More" />}
            >
              <MoreVertical />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Download as</DropdownMenuLabel>
                <DropdownMenuItem>
                  <FileText /> CSV
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <FileText /> PDF
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem variant="destructive">
                  <Trash2 /> Remove from thread
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </Row>

        <Row label="Skeleton">
          <div className="flex w-full max-w-sm flex-col gap-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </Row>

        <div className="flex flex-col gap-2">
          <div className="text-xs font-medium text-muted-foreground">Card</div>
          <Card className="max-w-sm">
            <CardHeader>
              <CardTitle>DLP Incident Summary</CardTitle>
              <CardDescription>
                Generated · 1.2s · scoped to abc-corp
              </CardDescription>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              147 DLP incidents are open this period across 95 objects with
              violations.
            </CardContent>
            <CardFooter className="gap-2">
              <Button size="sm">Save to</Button>
              <Button size="sm" variant="outline">
                Download
              </Button>
            </CardFooter>
          </Card>
        </div>

        <Separator />

        <div className="flex flex-col gap-2">
          <div className="text-xs font-medium text-muted-foreground">Tokens</div>
          <div className="flex flex-wrap gap-2">
            {TOKENS.map(([name, cls]) => (
              <div key={name} className="flex flex-col items-center gap-1">
                <div
                  className={`size-12 rounded-md ring-1 ring-foreground/10 ${cls}`}
                />
                <div className="text-[10px] text-muted-foreground">{name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default StyleGuide
