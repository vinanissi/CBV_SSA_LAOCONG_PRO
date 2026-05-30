# PHASE_TASK_GS_09Q — Operational Alert Header Unification — Report

**Date:** 2026-05-25  
**Branch:** `phase/from-v2.4.1-TASK-FIN-runtime-freeze`  
**Status:** GO  
**Build:** `npm run build` (apps/workboard) — **PASS** (~9s)  
**Baseline:** GS_09P light runtime console · CBV Operational Ecosystem Standard V1

---

## Summary

Unified fragmented alert pills above **Việc vận hành** into a **single operational alert strip** with one readable sentence. Moved **+ Tạo việc** to a stable right-side execution anchor on the same header row — semantically separated from alerts.

---

## Before / after alert structure

### Before

```
AppShell FocusStrip (4 separate pills):
[⚠ 1 việc quá hạn] [⚠ 1 hồ sơ thiếu GPLX] [⚠ 1 khoản chờ xác nhận] [○ 0 việc chưa phân công]

TasksPage title row:
Việc vận hành                                    [+ Tạo việc]  ← small, misaligned
```

Problems: fragmented attention, SaaS micro-badge feel, create button not anchored with alerts.

### After

```
Việc vận hành
J/K · Enter · R · ESC

┌────────────────────────────────────────────────────────────────────────────┐
│ ⚠ 3 vấn đề vận hành · 1 quá hạn · 1 GPLX thiếu · 1 chờ xác nhận  Chi tiết │  + Tạo việc │
└────────────────────────────────────────────────────────────────────────────┘
```

All-clear state:

```
│ ✓ Không có vấn đề vận hành quan trọng                              Chi tiết │  + Tạo việc │
```

FocusStrip **hidden on `/tasks`** — unified header owns alert UX on task workspace.

---

## Why pills were unified

| Issue | Fix |
|-------|-----|
| Operator parses 4 boxes | One operational sentence |
| Dashboard SaaS clutter | Single amber strip |
| Competing attention | Risk summarized, passive deferred |
| No operational narrative | `N vấn đề vận hành · …` pattern |

Target: **runtime sentences**, not micro-badge dashboard.

---

## Semantic split

| Category | Examples | Treatment |
|----------|----------|-----------|
| **Risk alerts** | Quá hạn, GPLX thiếu, Chờ xác nhận | In summary sentence |
| **Passive status** | 0 việc chưa phân công | Detail expand only, not in risk summary |
| **Primary action** | + Tạo việc | Right column, never inside strip |

`buildOperationalAlertSummary()` enforces: `count === 0` excluded from risk; `severity: 'passive'` never inflates `riskCount`.

---

## Primary action placement rationale

- **Muscle memory:** create always top-right of alert header row
- **Semantic clarity:** blue-700 primary button outside amber alert strip
- **Execution anchor:** stable across risk / all-clear states
- Removed small inline `btn-primary` from title flex row

Class: `.operational-header-primary-action`

---

## Detail / expand behavior

- Strip click or **Chi tiết** toggles inline list
- Risk items: navigable to `/tasks?filter=overdue`, `/hoso`, `/finance`
- Passive unassigned: shown in detail with ○ icon; disabled when count = 0

---

## Changed files

| File | Change |
|------|--------|
| `shared/utils/operationalAlertSummary.ts` | **New** — summary builder |
| `components/ui/OperationalAlertStrip.tsx` | **New** — unified strip + expand |
| `components/ui/OperationalAlertHeader.tsx` | **New** — strip + create button row |
| `modules/task/TasksPage.tsx` | Uses `OperationalAlertHeader`, title simplified |
| `components/ui/FocusStrip.tsx` | Hidden on `/tasks` routes |
| `styles/index.css` | GS_09Q alert header tokens |
| `modules/task/taskOperationalAlertHeaderChecks.ts` | **New** — validation suite |

---

## Validation results

**Suite:** `runTaskOperationalAlertHeaderChecks()`

| Check | Result |
|-------|--------|
| No fragmented pills on /tasks | ✅ |
| Unified strip exists | ✅ |
| Risk summary sentence | ✅ |
| Passive not in risk summary | ✅ |
| + Tạo việc right header | ✅ |
| Create not in strip | ✅ |
| Detail expand affordance | ✅ |
| Compact layout | ✅ |
| TasksPage no inline create | ✅ |

---

## Build result

```
> tsc --noEmit && vite build
✓ 146 modules — PASS
```

---

## Screenshots requested

1. Full `/tasks` with unified alert header  
2. Alert header close-up (risk state)  
3. Expanded alert details  
4. All-clear state (mock/zero counts)  
5. + Tạo việc fixed on right  

---

## Acceptance criteria

| # | Criterion | Status |
|---|-----------|--------|
| 1 | No fragmented pill row | ✅ |
| 2 | One operational sentence | ✅ |
| 3 | + Tạo việc stable right | ✅ |
| 4 | Alert/action not mixed | ✅ |
| 5 | Passive doesn't compete | ✅ |
| 6 | Header compact | ✅ |
| 7 | Queue central | ✅ |
| 8 | No layout regression | ✅ |
| 9 | Build PASS | ✅ |

---

## Operator impact

Operator reads **one line** of operational risk before scanning queue. Create action is a fixed execution anchor — alerts inform, button acts.
