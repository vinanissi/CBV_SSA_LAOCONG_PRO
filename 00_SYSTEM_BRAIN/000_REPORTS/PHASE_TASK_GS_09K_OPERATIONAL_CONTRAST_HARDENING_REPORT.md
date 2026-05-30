# PHASE_TASK_GS_09K — Operational Contrast Hardening — Report

**Date:** 2026-05-25  
**Branch:** `phase/from-v2.4.1-TASK-FIN-runtime-freeze`  
**Type:** HOTFIX  
**Status:** GO  
**Build:** `npm run build` — PASS

---

## Summary

Eliminated washed gray / low-contrast typography from CBV Task runtime. Replaced muted SaaS-style text with **confident operational contrast** — black/slate-900 titles, slate-800 operational lines, slate-700 passive meta, strong hot-signal colors, readable buttons. No layout redesign.

**Preserved:** GS_09H density · GS_09I typography scale · GS_09J visual stability architecture.

---

## Problem

| Issue | Operator impact |
|-------|-----------------|
| `slate-400/500` in queue + panel | Squint to read |
| `operational-muted` too light (#475569+) | Gray blur on light theme |
| Pastel hot-signal borders (500) | Weak urgency pre-attention |
| Faded tabs/chips | Control strip lacks confidence |
| Panel next action at slate-800 | Execution zone not dominant enough |

---

## Typography contrast map (after)

| Role | Class / token | Spec |
|------|---------------|------|
| **Primary title** | `.task-card-title`, `.panel-next-action-primary` | `text-slate-900` · `font-semibold` |
| **Secondary operational** | `.task-card-operational-line`, `.panel-execution-meta` | `text-slate-800` · `font-medium` |
| **Passive meta** | `.task-meta-passive` | `text-slate-700` · `font-medium` |
| **Panel labels** | `.panel-zone-label`, `.context-section-title` | `text-slate-900` · `font-semibold` |
| **Control tabs inactive** | `.task-control-tab` | `text-slate-700` |
| **Control tabs active** | `.task-control-tab.active` | `text-slate-900` · `font-semibold` |

### Token rebalance (`tailwind.config.ts`)

| Token | Before | After |
|-------|--------|-------|
| `operational.text` | `#1e293b` | `#0f172a` (slate-900) |
| `operational.secondary` | `#334155` | `#1e293b` (slate-800) |
| `operational.muted` | `#475569` | `#334155` (slate-700) |
| `accent` | `#2563eb` | `#1d4ed8` (blue-700) |

---

## Removed muted colors

### CSS classes hardened
- All `task-card-*`, `panel-*`, `task-control-*`, `quick-focus-*`, `inline-action-*`
- Dominant signal labels — removed opacity wash (`dominant-muted`, `dominant-minimal`)
- Hot signals — `amber-700`, `red-700`, `orange-700`, `slate-700` borders (not 400/500)

### Runtime zone override (legacy TSX safety net)
```css
.task-runtime-zone / .operational-panel-zone
  .text-slate-400, .text-slate-500, .text-gray-400, .text-gray-500
  → #334155 (slate-700 floor)
```

### Component TSX updates (task path)
| File | Change |
|------|--------|
| `TaskGroupSection.tsx` | Collapse arrow → slate-700 |
| `GroupModeSelect.tsx` | Label → slate-700 medium |
| `TasksPage.tsx` | Queue header → `task-meta-passive` |
| `OperationalContextPanel.tsx` | `operational-panel-zone` wrapper |
| `TimelineList.tsx` | Compact timeline → slate-700/800 |
| `HandoffChain.tsx` | Chain text → slate-800, amber/blue-700 |
| `NextStepCompletionPrompt.tsx` | Panel label classes |
| `FileList.tsx` | Empty state → `task-meta-passive` |

---

## Hot signal colors (strong operational)

| Signal | Before | After |
|--------|--------|-------|
| Escalation | `amber-500` | **`amber-700`** |
| Overdue | `red-500` | **`red-700`** |
| Blocked | `orange-600` | **`orange-700`** |
| Waiting | `slate-400` | **`slate-700`** |

No pastel fills. White card surface retained.

---

## Buttons

| Tier | After |
|------|-------|
| Primary (`btn-primary`, `inline-action-primary`) | `bg-blue-700` · `font-semibold` · white text |
| Secondary | `text-slate-800` · medium weight |
| Passive | `text-slate-700` · visible border |

---

## Right panel execution visibility

- `.panel-execution-gravity` — stronger border (`blue-400/90`), more padding
- `.panel-next-action-primary` — **`text-lg`** · `slate-900`
- `.panel-zone-label` — **`slate-900`** semibold (not muted gray)

---

## Readability rationale

CBV Task is a **dispatch console**, not a Dribbble minimal demo. Operators scan queues for hours — contrast failure = fatigue + errors.

This hotfix applies one principle: **CONFIDENT OPERATIONAL CONTRAST**
- Dark text on white cards
- No gray blur for operational content
- Strong signal colors for pre-attentive urgency
- Buttons that read instantly

No gradients, glow, or dashboard color inflation.

---

## Before / after contrast

| Element | Before | After |
|---------|--------|-------|
| Card title | slate-800 | **slate-900** |
| Operational line | slate-700 | **slate-800** |
| Passive meta | slate-600 | **slate-700** |
| Panel next action | text-base slate-800 | **text-lg slate-900** |
| Inactive tabs | operational-muted | **slate-700** |
| Hot bar escalation | amber-500 | **amber-700** |
| Primary button | blue-600 | **blue-700 semibold** |

**Screenshots:** capture `/tasks` queue + selected panel — verify text reads without squinting.

---

## Validation

```typescript
import { runTaskContrastHardeningChecks } from '@/modules/task/taskContrastHardeningChecks';
runTaskContrastHardeningChecks();
```

Checks: slate-900 titles, slate-800 operational, slate-700 passive, no slate-400/500 in task CSS classes, hot signal 700 colors, blue-700 buttons, runtime zone override.

---

## Files changed

| Path | Change |
|------|--------|
| `tailwind.config.ts` | Darker operational + accent tokens |
| `styles/index.css` | Full contrast hardening |
| `OperationalContextPanel.tsx` | Panel zone class + title |
| `TaskGroupSection.tsx` | Group chevron |
| `GroupModeSelect.tsx` | Label contrast |
| `TasksPage.tsx` | Header meta class |
| `TimelineList.tsx` | Panel timeline contrast |
| `HandoffChain.tsx` | Chain contrast |
| `NextStepCompletionPrompt.tsx` | Prompt contrast |
| `FileList.tsx` | Empty state |
| `modules/task/taskContrastHardeningChecks.ts` | **NEW** validation |

---

## Acceptance

| Criterion | Status |
|-----------|--------|
| No washed gray in task runtime | GO |
| Primary titles black/slate-900 | GO |
| Operational text slate-800+ | GO |
| Buttons readable & confident | GO |
| Hot signals strong | GO |
| Layout unchanged | GO |
| Build PASS | GO |
