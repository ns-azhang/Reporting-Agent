import * as React from "react"
import {
  ArrowLeft,
  EllipsisVertical,
  History,
  LibraryBig,
  Plus,
  User,
} from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import netskopeLogo from "@/assets/netskope-logo.svg"

/**
 * Left navigation — ported from Figma `Nav` (node 84:895).
 *
 * The Figma component is itself built on shadcn's Sidebar (its component docs
 * link to ui.shadcn.com/docs/components/sidebar), so this maps onto the real
 * primitives rather than re-implementing the layout.
 *
 * Icons: the Figma layers are named after their lucide glyphs (Icon /
 * ArrowLeft, Icon / EllipsisVertical, ...) and the project already uses lucide,
 * so these are the same glyphs rather than lookalikes. The Netskope mark is
 * brand art and is committed as an asset instead.
 *
 * The entries diverge from the Figma frame per review: the product is now
 * "Reporting", the destinations are the app's own screens, and New Session
 * leads the list as an action (no active state — it resets the thread).
 */

/** Pages the nav can reach. "new-session" is the prompt page. */
export type Page =
  | "new-session"
  | "session-history"
  | "report-library"
  | "my-reports"

/**
 * `disabled` keeps a destination visible but unreachable. Session History is
 * turned off for now — the page and its resume-a-session flow are still in the
 * codebase, just with no way in, the same treatment the out-of-scope actions
 * get in @/data/beta-scope. Drop the flag to bring it back.
 */
const NAV_ITEMS = [
  {
    page: "session-history",
    title: "Session History",
    icon: History,
    disabled: true,
  },
  { page: "report-library", title: "Report Library", icon: LibraryBig },
  { page: "my-reports", title: "My Reports", icon: User },
] as const satisfies readonly {
  page: Page
  title: string
  icon: unknown
  disabled?: boolean
}[]

const USER = {
  name: "Kevin Flyn",
  email: "kflyn@encom.com",
  initials: "KF",
}

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  page: Page
  onNavigate: (page: Page) => void
  onNewSession?: () => void
}

export function AppSidebar({
  className,
  page,
  onNavigate,
  onNewSession,
  ...props
}: AppSidebarProps) {
  return (
    // No divider between nav and content (the Figma nav has none). The stock
    // border is applied as `group-data-[side=left]:border-r`, so the override
    // must carry the same variant — a bare `border-r-0` is a different variant
    // group to tailwind-merge and would not conflict with it.
    <Sidebar
      className={cn("group-data-[side=left]:border-r-0", className)}
      {...props}
    >
      <SidebarContent>
        <SidebarHeader className="gap-2 px-2 pb-2 pt-3">
          {/* Netskope mark */}
          <div className="flex w-full items-center rounded-md pr-2">
            <div className="size-10 shrink-0 p-[4px]">
              <img
                src={netskopeLogo}
                alt="Netskope"
                className="block size-full object-contain"
              />
            </div>
          </div>

          {/* Back + section title */}
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton className="h-8">
                <ArrowLeft />
                <span className="truncate text-lg font-bold">Reporting</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarGroup>
          <SidebarMenu>
            {/* Top option. Renders as a normal nav row but is an action, not a
                destination — so it takes no active state. */}
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={onNewSession}
                tooltip="New Session"
                className="h-8"
              >
                <Plus />
                <span className="truncate">New Session</span>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {NAV_ITEMS.map((item) => {
              const disabled = "disabled" in item && item.disabled
              return (
                <SidebarMenuItem key={item.page}>
                  <SidebarMenuButton
                    isActive={!disabled && page === item.page}
                    /**
                     * A plain `disabled` prop does nothing here. These rows
                     * carry a tooltip, so SidebarMenuButton renders them
                     * through Base UI's TooltipTrigger, which takes `disabled`
                     * as its own prop and — per its docs — "doesn't apply the
                     * `disabled` attribute to the trigger element", telling you
                     * to pass it "via the `render` prop" instead. Without the
                     * native attribute the variants' `disabled:` utilities
                     * never matched, so the row stayed fully live.
                     *
                     * So: `render` puts the real attribute on the element,
                     * which also drops it out of the tab order rather than
                     * leaving a focusable dead control. The two utilities are
                     * still spelled out below so the greying doesn't depend on
                     * that plumbing holding.
                     */
                    render={disabled ? <button type="button" disabled /> : undefined}
                    aria-disabled={disabled || undefined}
                    onClick={disabled ? undefined : () => onNavigate(item.page)}
                    /* Just the title — an inert row never receives hover, so a
                       tooltip explaining the disable could never appear. */
                    tooltip={item.title}
                    className={cn(
                      "h-8",
                      disabled && "pointer-events-none opacity-50"
                    )}
                  >
                    <item.icon />
                    <span className="truncate">{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="h-auto gap-2 p-2">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-300 text-sm text-foreground">
                {USER.initials}
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-0.5 text-left">
                <span className="truncate text-sm font-semibold">
                  {USER.name}
                </span>
                <span className="truncate text-xs">{USER.email}</span>
              </span>
              <EllipsisVertical className="shrink-0" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

export default AppSidebar
