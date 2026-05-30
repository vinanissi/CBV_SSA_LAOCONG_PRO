# PHASE_TASK_GS_09J — Visual Stability Runtime — Report

**Date:** 2026-05-25  
**Branch:** `phase/from-v2.4.1-TASK-FIN-runtime-freeze`  
**Status:** GO  
**Build:** `npm run build` — PASS

---

## Summary

Refined CBV Task runtime from “UI displaying tasks” toward **operational execution runtime** — stable scan rhythm, instant attention hierarchy via thin hot-signal bars, unified control strip, fixed action alignment, execution-gravity panel, and Focus Queue endurance mode. No layout redesign, no animation inflation, density preserved.

**Baseline preserved:** GS_09H information density + GS_09I typography readability.

---

## Problems addressed

| Problem | Solution |
|---------|----------|
| Flat visual weight — all rows equal | 3px left hot-signal bar by severity |
| Weak urgency differentiation | Color-coded border: amber/red/slate/orange |
| Horizontal fragmentation (3+ strips) | Unified `operational-control-strip` |
| Floating action alignment | Fixed `4.25rem` action zone + slot placeholders |
| Passive right panel | `panel-execution-gravity` command zone |
| Long-queue eye fatigue | Focus Queue mode toggle |

---

## Hot task signal system

**New utility:** `hotSignalRuntime.ts`

| Signal | Class | Border |
|--------|-------|--------|
| Escalation | `.task-signal-hot` | amber-500 |
| Overdue | `.task-signal-overdue` | red-500 |
| Waiting / follow-up | `.task-signal-waiting` | slate-400 |
| Blocked / critical | `.task-signal-blocked` | orange-600 |
| Normal | `.task-signal-neutral` | transparent |

**Rules enforced:**
- 3px left border only — **no full-card saturated background**
- No glow, no badge spam
- White card surface retained (`bg-surface-content`)
- Legacy `signal-pattern-*` classes updated to border-only for degraded fallback

---

## Queue visual stability

| Change | Implementation |
|--------|----------------|
| Fixed action column | `.task-card-action-zone` — `w-[4.25rem]` |
| Slot placeholders | `.task-action-slot-empty` — keeps ▶ / ✓ / → baseline aligned |
| Row structure | `.task-card-row` — flex center, stable min-height |
| Icon consistency | `.task-action-slot` — `h-6 w-6 text-xs` uniform |

**Effect:** subconscious scan consistency — action targets always in same column.

---

## Toolbar compression

**Before:** `TaskControlSurface` + `ExecutionMemoryStrip` + `ResumeFlowCard` + `RecentContextStrip` (4 stacked blocks)

**After:** Single `.operational-control-strip`:
- **Primary row:** filter tabs · group select · quick focus · ◎ Focus toggle
- **Context row** (when not in Focus mode): resume chip · execution memory · recent tasks — inline chips only

Functionality preserved; vertical fragmentation reduced by ~2 strip heights.

---

## Right panel — execution gravity

**New zone:** `.panel-execution-gravity`

Hierarchy (top → bottom):
1. **Làm ngay** — `panel-next-action-primary` (text-base semibold)
2. SLA + critical signal chips
3. Owner / due meta line
4. Inline quick actions + micro/handoff strips
5. Waiting dependency (if any)
6. Coordination zone (handoff, escalation, deps)
7. Reference zone (title, timeline, files)

**Rationale:** panel functions as operational brain extension — next action dominates visually without dashboard aesthetics.

---

## Focus Queue mode

**Toggle:** `◎ Focus` in unified control strip  
**Persistence:** `sessionStorage` (`cbv_focus_queue_mode`) + `TaskWorkingContext.focusQueueMode`

When enabled:
- Context row hidden (resume / exec memory / recent)
- Card operational line collapsed to dominant signal only (or hidden if none)
- Next-action chips suppressed
- Page class: `task-runtime-zone focus-queue-mode`
- Progressive disclosure disabled until hover/focus on individual card

**Purpose:** long-queue endurance — reduce visual noise while preserving hot-signal urgency cues.

---

## Signal hierarchy decisions

Operator identifies urgency **without reading full text** via:

1. **Left hot bar color** — primary pre-attentive cue
2. **Title typography** (GS_09I) — scan anchor
3. **Operational line** — secondary parse (collapsed in Focus mode)
4. **Fixed action column** — execution target stability

No heavy card tints, no animation, no extra badges on queue rows.

---

## Changed CSS classes

| Class | Role |
|-------|------|
| `.task-signal-hot/overdue/waiting/blocked/neutral` | Hot signal bars |
| `.task-card-row` | Stable row flex |
| `.task-card-action-zone` | Fixed-width actions |
| `.task-action-slot` | Uniform icon slots |
| `.operational-control-strip` | Unified toolbar |
| `.operational-control-context` | Inline context chips |
| `.focus-queue-toggle` | Focus mode control |
| `.panel-execution-gravity` | Panel command zone |
| `.panel-next-action-primary` | Dominant next action |

---

## Queue scan improvements

| Aspect | Before | After |
|--------|--------|-------|
| Urgency cue | Full-card tint OR text only | 3px left color bar |
| Action position | Variable width | Fixed 4.25rem column |
| Control strips | 4 stacked | 1 unified (+ optional context row) |
| Panel top | Chip-sized next action | text-base command headline |
| Long session | Same noise level | Focus mode available |

**Density:** card min-height unchanged at scan row level; no giant spacing added.

---

## Before / after screenshots requested

Capture `/tasks` after `npm run dev`:

1. Queue with mixed escalation/overdue/waiting — verify left bars
2. Action column alignment across 10+ rows
3. Unified control strip (normal vs Focus mode)
4. Selected task — panel execution gravity zone

---

## Validation

```typescript
import { runTaskGs09jChecks } from '@/modules/task/taskGs09jChecks';
runTaskGs09jChecks();
```

Checks: hot signal classes, escalation mapping, action zone width, control strip, focus toggle + persistence, panel gravity, no saturated card bg, scan rhythm classes.

---

## Files changed

| Path | Change |
|------|--------|
| `shared/utils/hotSignalRuntime.ts` | **NEW** — hot signal class resolver |
| `shared/utils/focusQueueMode.ts` | **NEW** — focus mode persistence |
| `shared/utils/scanRhythm.ts` | Focus disclosure + constants |
| `shared/utils/workingContext.ts` | `focusQueueMode` field |
| `shared/utils/informationBalance.ts` | Focus mode compact line |
| `components/ui/TaskCard.tsx` | Hot signal + fixed action zone |
| `components/ui/TaskControlSurface.tsx` | Unified strip + focus toggle |
| `components/ui/OperationalContextPanel.tsx` | Execution gravity zone |
| `components/ui/TaskGroupSection.tsx` | `focusQueueMode` prop |
| `modules/task/TasksPage.tsx` | Wire focus mode, remove separate strips |
| `styles/index.css` | Hot signals, control strip, panel gravity |
| `modules/task/taskGs09jChecks.ts` | **NEW** validation suite |

---

## Acceptance criteria

| # | Criterion | Status |
|---|-----------|--------|
| 1 | Queue attention hierarchy improved | GO |
| 2 | Dangerous tasks identifiable instantly | GO |
| 3 | Visual vibration reduced | GO |
| 4 | Queue scan rhythm stabilized | GO |
| 5 | Toolbar fragmentation reduced | GO |
| 6 | Action alignment stabilized | GO |
| 7 | Right panel execution gravity improved | GO |
| 8 | Focus mode operational | GO |
| 9 | Density preserved | GO |
| 10 | No redesign regression | GO |
| 11 | Long-session readability improved | GO |
| 12 | Build PASS | GO |
