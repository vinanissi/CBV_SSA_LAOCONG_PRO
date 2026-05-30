# PHASE_TASK_GS_09M — Runtime Status Bar Relocation — Report

**Date:** 2026-05-25  
**Branch:** `phase/from-v2.4.1-TASK-FIN-runtime-freeze`  
**Status:** GO  
**Build:** `npm run build` (apps/workboard) — **PASS**

---

## Summary

Relocated runtime telemetry from the **main queue content area** into a **fixed bottom operational status bar** (IDE / terminal footer pattern). Execution hierarchy is restored: center = queue + coordination; bottom = peripheral runtime awareness.

**Baseline preserved:** GS_09H density · GS_09I–09L readability/contrast · GS_09J visual stability.

This phase is **not** a visual redesign — it is telemetry relocation for an execution-first operational workspace.

---

## Hierarchy rationale

| Zone | Role after GS_09M |
|------|-------------------|
| **Top** | Navigation, search, mode switching (`TopBar`, sidebar) |
| **Center** | Queue, execution runtime, coordination, detail panel |
| **Bottom** | Runtime telemetry, connection state, sync/worker, metrics, warnings |

Telemetry is **peripheral awareness**, not primary operational content. The queue no longer competes with a full-width runtime card.

---

## Before / after layout

### Before (queue area)

```
┌─ TopBar ─────────────────────────────────────────┐
│ TopRuntimeStrip (module/worker thin strip)       │
├─ Sidebar ─┬─ Việc vận hành ──────────────────────┤
│           │ ┌─ RuntimeTelemetryStrip (CARD) ────┐ │  ← cut flow
│           │ │ ● Connected · counts · warnings │ │
│           │ └─────────────────────────────────┘ │
│           │ TaskControlSurface                   │
│           │ Task queue…                          │
├───────────┴──────────────────────────────────────┤
│ QuickActionBar (+ Việc · Hồ sơ · … · session)   │
└──────────────────────────────────────────────────┘
```

### After (execution-first)

```
┌─ TopBar ─────────────────────────────────────────┐
├─ Sidebar ─┬─ Việc vận hành ──────────────────────┤
│           │ TaskControlSurface                   │  ← queue starts higher
│           │ Task queue…                          │
│           │ (more vertical space)                │
├───────────┴──────────────────────────────────────┤
│ + Việc │ + Hồ sơ │ … │ ● Connected · 📦 N việc … │  ← 48px status bar
└──────────────────────────────────────────────────┘
```

**Screenshots:** Capture manually from `npm run dev` → `/tasks` — before state no longer in tree; after shows compact bottom bar with inline metrics.

---

## Telemetry restructuring

| Item | Before | After |
|------|--------|-------|
| Component | `RuntimeTelemetryStrip` in `TasksPage` | `RuntimeTelemetryInline` in `RuntimeStatusBar` |
| Shell | Rounded card, amber/red warning blocks | Flat inline strip, color-coded metrics only |
| Data flow | Props inline on page | `TaskRuntimeTelemetryContext` — TasksPage publishes, status bar consumes |
| Top strip | `TopRuntimeStrip` under TopBar | Removed — merged into bottom telemetry |
| Footer | `QuickActionBar` only | `RuntimeStatusBar` — actions left, telemetry right |

### Bottom bar content (inline)

- **Left:** `+ Việc`, `+ Hồ sơ`, Upload, Search, SLA (unchanged quick-launch)
- **Right:** `● TASK_MAIN Connected` · `📦 N việc` · `❗ N quá hạn` · `⚠ N cảnh báo` · `↻ Worker OK` · `🖥 Phiên làm việc local`
- **Progressive disclosure:** “Chi tiết” expands diagnostics upward (popover), not a second queue row

### Status colors (spec)

| Signal | Token |
|--------|-------|
| Connected | `green-700` |
| Overdue | `red-700` |
| Warnings | `amber-700` |
| Worker | `blue-700` |
| Session | `slate-800` |

Typography: **14px** (`text-sm`), **semibold** metric values, `slate-900` base — no washed gray.

---

## Files changed / added

| File | Change |
|------|--------|
| `runtime/TaskRuntimeTelemetryContext.tsx` | **New** — publish/subscribe bridge |
| `components/runtime/RuntimeTelemetryInline.tsx` | **New** — compact inline telemetry |
| `components/runtime/RuntimeStatusBar.tsx` | **New** — bottom bar (actions + telemetry) |
| `components/layout/AppShell.tsx` | Replace `QuickActionBar` + remove `TopRuntimeStrip` → `RuntimeStatusBar` |
| `app/App.tsx` | Wrap shell with `TaskRuntimeTelemetryProvider` |
| `modules/task/TasksPage.tsx` | Remove `RuntimeTelemetryStrip`; publish telemetry via context |
| `styles/index.css` | `.operational-status-bar` + `.runtime-status-*` tokens |
| `modules/task/taskRuntimeStatusBarChecks.ts` | **New** — validation suite |

**Legacy (retained, unused in queue):** `RuntimeTelemetryStrip.tsx`, `QuickActionBar.tsx`, `TopRuntimeStrip.tsx` — safe to delete in a follow-up cleanup PR.

---

## Execution flow impact

1. **Queue load:** Skeleton only — no telemetry card flash in center.
2. **Operator scan path:** Title → control strip → cards — uninterrupted vertical rhythm.
3. **Runtime awareness:** Always visible in footer without stealing focus from hot-signal task rows (GS_09J).
4. **Non-task routes:** Fallback worker connection label when task telemetry context is empty.

---

## Vertical space improvement

Removed from queue stack:
- `RuntimeTelemetryStrip` card (~32–80px depending on warnings/expand)
- Loading-state telemetry skeleton row

Gained: **~1 strip height** directly above `TaskControlSurface`, making the queue feel cleaner and more execution-focused.

---

## Operator focus improvement

| Before | After |
|--------|-------|
| Yellow/red runtime card competed with overdue task signals | Telemetry calm, peripheral |
| Session label duplicated (footer + telemetry) | Session in telemetry strip only |
| Two runtime layers (top strip + card) | Single bottom source of truth |

---

## Validation results

**Suite:** `runTaskRuntimeStatusBarChecks()` — `taskRuntimeStatusBarChecks.ts`

| Check | Expected |
|-------|----------|
| `oldTelemetryCardRemoved` | No `RuntimeTelemetryStrip` in TasksPage |
| `telemetryPublisherWired` | Context publish on workspace load |
| `statusBarInAppShell` | `RuntimeStatusBar` footer; no QuickActionBar/TopRuntimeStrip |
| `statusBarFixedBottom` | `shrink-0` + `border-t` compact bar |
| `telemetryInlineStyles` | green/red/amber/blue metric classes |
| `quickActionsPreserved` | Left-side action cluster |
| `noYellowAlertBlock` | No `runtime-telemetry-strip` in queue |
| `telemetryContextProvider` | Provider wraps AppShell |

Run in browser console on `/tasks`:

```js
import { runTaskRuntimeStatusBarChecks } from './src/modules/task/taskRuntimeStatusBarChecks.ts';
runTaskRuntimeStatusBarChecks();
```

---

## Build result

```
> @cbv/workboard@0.1.0 build
> tsc --noEmit && vite build
✓ built in ~8s — PASS
```

---

## Manual test plan

- [ ] Open `/tasks` — no runtime card between title and control strip
- [ ] Bottom bar shows quick actions + live metrics after workspace load
- [ ] Overdue/warning counts use red/amber when present
- [ ] “Chi tiết” expands diagnostics above bar without overlapping queue scroll
- [ ] Navigate away from tasks — bar shows worker fallback label
- [ ] Queue scroll area does not overlap status bar
- [ ] Refresh dev server if CSS cache stale

---

## Next (optional)

- Delete unused `RuntimeTelemetryStrip`, `QuickActionBar`, `TopRuntimeStrip`
- Wire `runTaskRuntimeStatusBarChecks` into existing dev diagnostics panel
