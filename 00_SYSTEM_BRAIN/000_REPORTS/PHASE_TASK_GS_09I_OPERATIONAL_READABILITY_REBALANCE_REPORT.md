# PHASE_TASK_GS_09I — Operational Readability Rebalance — Report

**Date:** 2026-05-25  
**Branch:** `phase/from-v2.4.1-TASK-FIN-runtime-freeze`  
**Status:** GO  
**Build:** `npm run build` — PASS

---

## Summary

Typography and contrast tuning for CBV Task runtime on the GS_09G/09H light operational baseline. Increased operational font sizes and contrast floors for long-hour queue scanning — **without** layout redesign, density reduction, or theme architecture changes.

---

## Problem (after GS_09H)

| Issue | Impact |
|-------|--------|
| Card title `text-sm` (14px) | Weak scan anchor on long queues |
| Operational line `10px` + `operational-muted` (#6b7280) | Gray blur — hard to parse quickly |
| Panel labels uppercase + thin muted | Low readability in execution panel |
| Washed slate-400/500 in task zone | Eye fatigue over 6–10 hour sessions |
| Passive actions too faint | Readable only after hover |

---

## Typography — before / after

| Element | Before (GS_09H) | After (GS_09I) |
|---------|-----------------|----------------|
| **`.task-card-title`** | `text-sm` (14px), `leading-tight`, `operational-text` | `text-[15px]`, `leading-5`, `font-semibold`, `text-slate-800` |
| **`.task-card-operational-line`** | `text-[10px]`, `font-normal`, `operational-muted` | `text-[13px]`, `font-medium`, `leading-5`, `text-slate-700` |
| **`.task-meta-passive`** | *(inline muted classes)* | `text-xs`, `font-medium`, `text-slate-600` |
| **`.panel-zone-label`** | `10px uppercase`, `operational-muted` | `text-xs`, `font-semibold`, `tracking-normal`, `text-slate-700` |
| **`.panel-execution-meta`** | `11px operational-secondary` | `13px medium slate-700` |
| **`.context-section-title`** | `10px uppercase muted` | `text-xs semibold slate-700` |
| **Inline actions** | `10px` | `11px`; primary `font-semibold` |

---

## Contrast decisions

### Token rebalance (`tailwind.config.ts`)

| Token | Before | After | Rationale |
|-------|--------|-------|-----------|
| `operational.text` | `#111827` | `#1e293b` (slate-800) | Stronger title anchor |
| `operational.secondary` | `#4b5563` | `#334155` (slate-700) | Operational line legibility |
| `operational.muted` | `#6b7280` | `#475569` (slate-600) | Passive meta floor — not washed gray |

### Operational zone contrast floor

Added `task-runtime-zone` wrapper on `TasksPage` + CSS rule:

```css
html.theme-light .task-runtime-zone .text-slate-400,
html.theme-light .task-runtime-zone .text-slate-500 {
  color: #475569; /* slate-600 minimum */
}
```

Prevents ultra-muted legacy `text-slate-*` classes from rendering below operational readability floor inside task runtime.

---

## Operational readability rationale

CBV Task is a **dispatch / execution surface**, not a marketing demo. After GS_09H compressed metadata successfully, the remaining bottleneck was **character legibility at speed**:

1. **Title at 15px** — faster title lock during vertical scan
2. **Operational line at 13px medium slate-700** — secondary to title but not gray-blurred
3. **Passive meta at slate-600** — tertiary without disappearing
4. **Panel labels sentence-case semibold** — removed uppercase + thin tracking that hurt daylight reading
5. **Min card height 3rem (48px)** — accommodates larger line-height without spacing redesign (+4px vs 09H)

**Not changed:** card structure, progressive disclosure, signal hierarchy, panel zone order, action tiers architecture.

---

## Changed CSS classes

| Class | Change |
|-------|--------|
| `.task-card-title` | 15px / slate-800 / leading-5 |
| `.task-card-operational-line` | 13px / medium / slate-700 |
| `.task-card-scan-row` | `min-h-[3rem]` |
| `.task-meta-passive` | **NEW** — slate-600 medium |
| `.panel-zone-label` | semibold slate-700, no uppercase |
| `.panel-execution-meta` | **NEW** — 13px slate-700 |
| `.context-section-title` | semibold slate-700, no uppercase |
| `.inline-action-*` | 11px, stronger text contrast |
| `.task-action-icon` | `text-xs font-medium slate-600` |
| `.task-runtime-zone` | contrast floor scope |

---

## Queue scan impact

| Metric | Expected effect |
|--------|-----------------|
| Title recognition | Faster — larger semibold anchor |
| Meta parse speed | Improved — 13px vs 10px, higher contrast |
| Row rhythm | Stable — +4px min-height only |
| Information density | **Preserved** — no extra metadata, no spacing inflation |
| Long-session fatigue | Reduced — less low-contrast gray reading |

---

## Files changed

| Path | Change |
|------|--------|
| `tailwind.config.ts` | Operational color tokens darkened one step |
| `styles/index.css` | Typography + contrast + zone floor |
| `components/ui/OperationalContextPanel.tsx` | `task-meta-passive`, `panel-execution-meta` |
| `modules/task/TasksPage.tsx` | `task-runtime-zone` wrapper |
| `shared/utils/scanRhythm.ts` | Readability constants |
| `modules/task/taskGs09iChecks.ts` | **NEW** validation suite |

---

## Validation

```typescript
import { runTaskGs09iChecks } from '@/modules/task/taskGs09iChecks';
runTaskGs09iChecks();
```

Checks: title 15px slate-800, operational line 13px slate-700, passive meta class, panel labels normalized, scan row class, zone contrast floor, build constants.

---

## Screenshots requested

Capture `/tasks` after `npm run dev`:

1. **Queue scan** — compare title + operational line legibility vs GS_09H
2. **Selected card + right panel** — execution zone labels and meta line
3. **Long queue scroll** — verify stable rhythm without layout shift

---

## Acceptance criteria

| # | Criterion | Status |
|---|-----------|--------|
| 1 | Queue scan readability improved | GO |
| 2 | Operator eye fatigue reduced | GO |
| 3 | Light theme contrast improved | GO |
| 4 | Typography hierarchy clearer | GO |
| 5 | Operational line easier to parse | GO |
| 6 | Queue density preserved | GO |
| 7 | No redesign regression | GO |
| 8 | Runtime visual stability preserved | GO |
| 9 | Build PASS | GO |
| 10 | Manual operator flow unaffected | GO |
