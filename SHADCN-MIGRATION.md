# shadcn/ui restyle — `workflow-v5.html`

Restyling the Reporting Agent prototype to match [ui.shadcn.com](https://ui.shadcn.com/docs/components).

`workflows.html` is **untouched** — it stays the stable demo (it's what GitHub Pages serves).
All work happens in `workflow-v5.html`, so the two can be compared side by side:

| | URL |
|---|---|
| current | `http://localhost:8743/workflows.html` |
| restyled | `http://localhost:8745/workflow-v5.html` |
| primitives kitchen sink | `http://localhost:8745/workflow-v5.html?styleguide` |

## Why they didn't look alike

Both use Tailwind, but shadcn's defaults differ in five specific ways. From shadcn's
actual `globals.css` — note **every neutral has chroma `0`**, i.e. zero saturation:

```
--primary:          oklch(0 0 0)        ← pure BLACK
--muted / --accent: oklch(0.97 0 0)     ← neutral, chroma 0
--muted-foreground: oklch(0.556 0 0)
--border / --input: oklch(0.922 0 0)
--radius:           0.625rem            ← 10px
```

| | shadcn | prototype (before) |
|---|---|---|
| Primary | black | `bg-blue-600` (×37) |
| Grays | neutral, chroma 0 | `slate` — **blue-tinted** (`slate-500` = `#64748b`) |
| Hover | `hover:bg-muted` (neutral) | `hover:bg-blue-50 hover:text-blue-700` |
| Type | `text-sm` / `text-xs` only | arbitrary `text-[12.5px]`, `[13.5px]`, `[11.5px]`, `[10.5px]` |
| Focus | `focus-visible:ring-ring/50 ring-[3px]` | `outline: 2px solid brand-600` |

The two that dominate are **blue vs black primary** and **slate vs neutral grays** —
slate reads cool/blue, so the whole UI looked bluer than shadcn even where classes matched.

> **Netskope brand blue is intentionally dropped in v5** per direction — v5 uses stock
> shadcn defaults (black primary). To restore brand, exactly one line changes:
> `--primary: 0.488 0.243 264.376;`
>
> Known cosmetic side effect: `Nav.svg` / `Top Bar.svg` are baked assets containing
> Netskope blue, so a brand-blue logo will sit above a black-button UI until/unless
> those are re-exported.

## Progress metric

Hardcoded palette classes remaining (definition of done = **0**):

```bash
grep -o "\(bg\|text\|border\)-\(slate\|blue\|rose\|emerald\|amber\|indigo\|violet\)-[0-9]\{2,3\}" workflow-v5.html | wc -l
```

Baseline: **1057**

## Phases

- [x] **Phase 0 — Duplicate.** `workflow-v5.html` created from `workflows.html`; baseline recorded.
- [x] **Phase 1 — Token foundation.** shadcn's default light tokens added to `:root` as bare
      OKLCH components; registered with Tailwind CDN via inline `tailwind.config` using the
      `<alpha-value>` pattern (the documented Tailwind-3 path) so opacity modifiers work.
      *Purely additive — renders identically.* Verified: `bg-primary` → `oklch(0 0 0)`,
      `bg-primary/80` → `oklch(0 0 0 / 0.8)`, `border-border` → `oklch(0.922 0 0)`.
      Radius scale deliberately **not** remapped here, to keep this step visually inert.
- [x] **Phase 2 — Primitives + kitchen sink.** `cn()` helper plus `Button` (6 variants ×
      7 sizes), `Input`, `Badge`, `Card` family, `Separator`, `Skeleton`, `MenuItem`,
      `MenuLabel` — ported from `style-vega.css` (the style the docs' registry imports
      first, and the one with the familiar `h-9` / `rounded-md` geometry; `nova` uses
      `h-8` / `rounded-lg`). Rendered at `?styleguide`. Main app verified unaffected.
      `Tabs` and `Table` deferred to Phase 4, when a screen actually needs them.
- [ ] **Phase 3 — Systematic token swap.** One commit per mapping so each is revertable:
  - [ ] 3a `text-slate-400/500` → `text-muted-foreground` (~203)
  - [ ] 3b `text-slate-700/900` → `text-foreground` (~124)
  - [ ] 3c `border-slate-200/300` → `border-border` (~140)
  - [ ] 3d `bg-slate-50/100` → `bg-muted` / `bg-accent` (~125)
  - [ ] 3e `bg-blue-600` → `bg-primary`, `text-blue-700` → `text-primary`, `bg-blue-50` → `bg-accent` (~142)
  - [ ] 3f arbitrary `text-[N px]` → `text-sm` / `text-xs`
  - [ ] 3g `.card-shadow` → `shadow-sm`; `.focus-ring` → `focus-visible:ring-ring/50 ring-[3px]`; remap radius scale
- [ ] **Phase 4 — Screen-by-screen.** Swap ad-hoc markup for the primitives, one screen per
      commit. Map custom SVG chart hex onto `--chart-1..5`.
- [ ] **Phase 5 — Dark mode.** Near-free once tokens are in place: add the `.dark` block
      (values to be taken from shadcn's source, not guessed) plus a toggle.
- [ ] **Phase 6 — Ship.** Full pass, console clean, then decide whether v5 replaces
      `workflows.html` and sync `gh-pages`.

Each phase boundary is a safe stopping point — Phases 1–2 leave the app fully working.

## Notes / gotchas

- **Tailwind CDN is JIT.** It only emits CSS for classes present in the DOM, and regenerates
  asynchronously. Probing a freshly-injected element in the same tick reads the *pre*-generation
  value — inject, then measure in a separate step.
- **shadcn's current registries ship a CSS layer** (`.cn-button-variant-default { @apply … }`)
  rather than inline utility strings, and it's authored in Tailwind **v4** syntax
  (`ring-3`, `in-data-[…]`, `color-mix()`). Those get translated to v3 equivalents
  (`ring-[3px]`, etc.) when ported here.
- Radius remap (`rounded-lg`/`xl`) affects 1000+ existing usages at once — that's why it's
  isolated in 3g rather than bundled into Phase 1.
