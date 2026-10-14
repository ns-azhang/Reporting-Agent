import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * The one mark for "the assistant did this": lucide's Sparkles with the small
 * dot at bottom-left removed — the large four-point star and the small cross
 * at top-right. Used for the AI Assistant header, the Summary label, chat
 * notes and insights, and assistant-set filter chips, so generated content
 * carries the same glyph everywhere.
 */
export function AiMark({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cn("lucide lucide-ai-mark", className)}
      {...props}
    >
      <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z" />
      <path d="M20 2v4" />
      <path d="M22 4h-4" />
    </svg>
  )
}

export default AiMark
