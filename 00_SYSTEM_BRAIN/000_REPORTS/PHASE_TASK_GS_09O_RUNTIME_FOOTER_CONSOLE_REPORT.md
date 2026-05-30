# PHASE_TASK_GS_09O — Runtime Footer Console — Report

**Date:** 2026-05-25  
**Branch:** `phase/from-v2.4.1-TASK-FIN-runtime-freeze`  
**Status:** GO  
**Build:** `npm run build` (apps/workboard) — **PASS** (~13s)  
**Baseline:** GS_09M relocation · GS_09N 3-zone polish · CBV Operational Ecosystem Standard V1

---

## Summary

Evolved the bottom footer from **operational status bar** → **Runtime Footer Console** — a persistent dark operational rail with runtime-shell identity (VSCode status bar / terminal footer feel). No app redesign, no flashy UI — machine-grade, execution-oriented peripheral awareness.

---

## Runtime rail rationale

| Before (GS_09N) | After (GS_09O) |
|-----------------|----------------|
| Light SaaS footer strip | Dark `slate-900` runtime rail |
| Status widget feel | Dispatch / infra console feel |
| Popover detail above bar | Slide-up **Runtime Console** drawer |
| No sync clock | **Sync HH:mm:ss** in RIGHT zone |
| No operator hints | Compact **J/K · Enter · R** hints |

Queue remains central. Footer reads as **runtime shell**, not business web footer.

---

## Dark / light rail evaluation

| Option | Decision |
|--------|----------|
| **A — Dark rail** (`bg-slate-900`, `border-slate-700`) | **Selected** — clear runtime-shell identity, contrasts with light operational workspace |
| B — Light rail + stronger typography | Rejected — insufficient console differentiation |

Dark rail is scoped to `.runtime-footer-console` only — main canvas unchanged.

---

## Footer visual structure (3 zones preserved)

```
┌─ LEFT (actions) ──┐ │ ┌─ CENTER (telemetry) ──────────────────────┐ │ ┌─ RIGHT (runtime state) ─────────────┐
│ + Việc + Hồ sơ …   │ │ │ ● Connected  📦97  ❗20  ⚠2  ↻ Worker OK  │ │ │ Sync 09:14:22 · 🖥 Session · J/K… [Console] │
└────────────────────┘ │ └───────────────────────────────────────────┘ │ └─────────────────────────────────────┘
         slate-600 sep                              dark rail bg-slate-900
```

---

## Pulse indicator behavior

| State | Visual |
|-------|--------|
| Connected + healthy | `.runtime-dot-live` — **3.2s opacity pulse** (1 → 0.45 → 1) |
| Refreshing | `.runtime-dot-busy` — reduced opacity, **no pulse** |
| Degraded / critical | Static dot color (amber/red) |

**Not used:** glow, ping, bounce, scale transforms.  
**Accessibility:** `prefers-reduced-motion: reduce` disables all footer animations.

---

## Worker indicator

| State | Visual |
|-------|--------|
| Worker OK | Blue `↻` icon (`.runtime-worker-active`) |
| Refreshing | Slow **4s rotation** on icon only (`.runtime-worker-busy`) |

Rotation only during active refresh — not continuous idle spin.

---

## Runtime clock behavior

**Utility:** `shared/utils/runtimeClock.ts`

- Source: `runtime.lastSyncAt` → fallback `runtime.generatedAt`
- Format: `Sync HH:mm:ss` (vi-VN locale, 24h)
- Placement: RIGHT zone, `runtime-console-clock`
- Refresh: 30s interval tick (re-reads timestamp; no fake live clock)

---

## Keyboard hint rationale

```
J/K queue · Enter open · R refresh
```

- Operator-oriented, not tutorial copy
- `runtime-console-shortcuts` — visible **xl+** only
- Hidden on narrow widths before telemetry collapse

---

## Runtime drawer architecture

**Component:** `RuntimeFooterDrawer.tsx`

- Trigger: telemetry clicks, **Console** button (RIGHT zone)
- Pattern: fixed slide-up panel above footer (`bottom-11`), dark console styling
- Sections:
  - Health (state, connected, latency)
  - Queue metrics (from snapshot counts)
  - Worker / sync diagnostics
  - Warnings (focus highlight when opened from ⚠)
  - **TODO:** SLA pressure (not wired)
  - **TODO:** Memory / runtime state (not wired)

No fake data in TODO sections — placeholders only.

---

## Typography & metrics (dark rail)

| Metric | Style |
|--------|-------|
| Base telemetry | 15px, medium, `slate-100` |
| Connected | semibold `green-400` |
| Total count | semibold `slate-100` |
| Overdue | semibold `red-400` + `red-950/50` chip + ring |
| Warning | semibold `amber-400` |
| Worker | semibold `blue-400` |
| Session / clock | `slate-300` / `slate-400` |

Icons normalized: 15px, 16px optical box, consistent baseline gap.

---

## Responsive collapse priority

| Breakpoint | Hidden first → last |
|------------|---------------------|
| ≤1280px | “ việc” suffix |
| ≤1024px | Total count, sync clock |
| ≤768px | Session label, keyboard hints |

**Always retained:** Connected, overdue, warning, worker.

---

## Changed files

| File | Change |
|------|--------|
| `components/runtime/RuntimeStatusBar.tsx` | Dark rail, clock, hints, drawer orchestration |
| `components/runtime/RuntimeTelemetryInline.tsx` | Console metrics, live pulse, drawer triggers |
| `components/runtime/RuntimeFooterDrawer.tsx` | **New** — slide-up runtime console |
| `shared/utils/runtimeClock.ts` | **New** — sync timestamp formatting |
| `styles/index.css` | GS_09O dark rail, pulse keyframes, drawer styles |
| `modules/task/taskRuntimeFooterConsoleChecks.ts` | **New** — validation suite |

---

## Validation results

**Suite:** `runTaskRuntimeFooterConsoleChecks()`

| Check | Result |
|-------|--------|
| Footer rail exists (dark) | ✅ |
| Telemetry readable ≥14px | ✅ |
| Pulse subtle only | ✅ |
| Runtime clock renders | ✅ |
| Keyboard hints safe | ✅ |
| Drawer scaffold + TODOs | ✅ |
| Footer height 42–46px | ✅ |
| No queue overlap | ✅ |
| No flashy animation | ✅ |
| No queue telemetry card | ✅ |

---

## Build result

```
> tsc --noEmit && vite build
✓ 143 modules — PASS
```

---

## Screenshots requested

Capture after `npm run dev`:

1. Full `/tasks` with dark runtime footer console  
2. Footer close-up (3 zones + metric colors)  
3. Expanded runtime drawer (Console open)  
4. Dark rail readability vs light queue  
5. Narrow-width footer (overdue/warning priority)  

---

## Acceptance criteria

| # | Criterion | Status |
|---|-----------|--------|
| 1 | Footer feels like runtime console | ✅ dark rail + console drawer |
| 2 | Runtime telemetry clearer | ✅ 400-level metric colors on dark |
| 3 | Overdue/warnings dominant | ✅ red/amber semibold + overdue chip |
| 4 | Pulse subtle and stable | ✅ 3.2s opacity only |
| 5 | Runtime clock improves confidence | ✅ Sync HH:mm:ss |
| 6 | Keyboard hints non-intrusive | ✅ xl-only compact line |
| 7 | No visual noise explosion | ✅ no glow/bounce/ping |
| 8 | Queue remains central | ✅ footer-only change |
| 9 | Footer compact + stable | ✅ 44px height |
| 10 | Build PASS | ✅ |

---

## Operator scan impact

Peripheral footer now reads as **live runtime infrastructure**: connection pulse → risk metrics → worker state → sync clock → session context. Execution queue above stays light and execution-first; footer provides machine-grade operational confidence without dashboard noise.
