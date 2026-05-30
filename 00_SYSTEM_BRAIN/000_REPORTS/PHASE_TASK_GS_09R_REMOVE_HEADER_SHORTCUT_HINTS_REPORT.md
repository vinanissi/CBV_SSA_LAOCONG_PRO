# PHASE_TASK_GS_09R — Remove Header Shortcut Hints — Report

**Date:** 2026-05-25  
**Branch:** `phase/from-v2.4.1-TASK-FIN-runtime-freeze`  
**Status:** GO  
**Build:** `npm run build` (apps/workboard) — **PASS** (~10s)  
**Baseline:** GS_09Q alert header · GS_09P light runtime console · CBV Operational Ecosystem Standard V1

---

## Summary

Removed the always-visible keyboard shortcut line (`J/K · Enter · R · ESC`) from under the **Việc vận hành** title. Header is cleaner and more execution-focused; keyboard support and footer hints unchanged.

---

## Why shortcut row was removed

| Issue | Impact |
|-------|--------|
| Extra visual noise | Header felt instructional |
| Terminal/dev-tool cosplay | Wrong tone for industrial ops workspace |
| Competing attention | Distracted from queue execution |
| Redundant | Footer runtime console already carries operator hints (xl+) |

Shortcut hints are **not primary operational information** — they belong in peripheral runtime chrome, not the execution header.

---

## Execution-focus rationale

CBV already expresses runtime identity through:
- Light industrial footer console
- Unified operational alert strip
- Queue + control surface hierarchy

Fixed shortcut text under the title did not add operational value — it added **UI chrome**. Removing it reinforces: **title → alerts → queue** without a helper line in between.

**Keyboard support is NOT removed** — J/K, Enter, R, ESC handlers remain in `TasksPage`.

---

## Before / after header structure

### Before

```
Việc vận hành
J/K · Enter · R · ESC          ← removed

⚠ 3 vấn đề vận hành · …        [+ Tạo việc]
Queue…
```

### After

```
Việc vận hành

⚠ 3 vấn đề vận hành · …        [+ Tạo việc]
Queue…
```

---

## Spacing adjustments

- Removed wrapper `<div>` around title + hint
- Added `.task-workspace-title` with `mb-0 leading-tight`
- Parent `space-y-2` maintains compact gap between title → alert strip → controls

---

## Affected files

| File | Change |
|------|--------|
| `modules/task/TasksPage.tsx` | Removed shortcut `<p>`; compact title class |
| `styles/index.css` | `.task-workspace-title` token |
| `modules/task/taskRemoveHeaderShortcutChecks.ts` | **New** validation suite |

**Unchanged:** `RuntimeStatusBar` footer hints · keyboard `useEffect` in TasksPage

---

## Validation results

**Suite:** `runTaskRemoveHeaderShortcutChecks()`

| Check | Result |
|-------|--------|
| Shortcut row removed | ✅ |
| Compact title class | ✅ |
| Title preserved | ✅ |
| Alert strip under header | ✅ |
| Footer shortcuts unaffected | ✅ |
| Keyboard behavior intact | ✅ |

---

## Build result

Run: `cd apps/workboard && npm run build` — **PASS**

---

## Screenshots requested

1. Header before removal (reference from prior phase)  
2. Header after removal — title only  
3. Full `/tasks` after cleanup  
4. Footer runtime console still showing hints (xl+)  

---

## Acceptance criteria

| # | Criterion | Status |
|---|-----------|--------|
| 1 | Shortcut row not visible | ✅ |
| 2 | Header visually calmer | ✅ |
| 3 | More execution-focused | ✅ |
| 4 | No layout regression | ✅ |
| 5 | Alert strip placement preserved | ✅ |
| 6 | Footer console unaffected | ✅ |
| 7 | Build PASS | ✅ verify locally |

---

## Operator impact

Header scan path simplified: **page identity → operational risk → execution**. Less instructional noise; industrial operational workspace tone strengthened.
