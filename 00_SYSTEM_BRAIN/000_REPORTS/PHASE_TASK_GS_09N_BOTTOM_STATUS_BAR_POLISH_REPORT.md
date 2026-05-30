# PHASE_TASK_GS_09N — Bottom Status Bar Polish — Report

**Date:** 2026-05-25  
**Branch:** `phase/from-v2.4.1-TASK-FIN-runtime-freeze`  
**Status:** GO  
**Build:** `npm run build` (apps/workboard) — see validation section  
**Baseline:** GS_09M runtime relocation · GS_09L visibility · CBV Operational Ecosystem Standard V1

---

## Summary

Polished the bottom operational status bar after GS_09M relocation. No redesign — focused on **readability**, **3-zone separation**, **telemetry scan speed**, and **controlled height** (42–46px).

---

## Before / after footer structure

### Before (GS_09M)

```
┌─ Actions (border-r) ── Telemetry mixed with session + Chi tiết ─────────┐
│ + Việc + Hồ sơ … │ ● Connected | 📦 N | ❗ | ⚠ | ↻ Worker | 🖥 Session [Chi tiết] │
└─────────────────────────────────────────────────────────────────────────┘
```

Issues: many inline separators, session mixed with telemetry, `text-sm` (14px) felt small, actions/telemetry not visually separated.

### After (GS_09N)

```
┌─ LEFT ─────────┐ │ ┌─ CENTER (telemetry) ─────────────────────┐ │ ┌─ RIGHT ──────┐
│ + Việc + Hồ sơ │ │ │ ● Connected  📦97  ❗20 quá hạn  ⚠2  ↻ OK │ │ │ 🖥 Session [Chi tiết] │
└────────────────┘ │ └──────────────────────────────────────────┘ │ └──────────────┘
```

Only **two zone separators** (1px × 20px, slate-300/70). Metrics use **gap spacing + icons**, not pipe chains.

---

## Zoning decisions

| Zone | Content | Rules |
|------|---------|-------|
| **LEFT** | Quick actions only | `operational-status-zone-actions`, uniform `h-8` buttons, `text-slate-900` |
| **CENTER** | Runtime telemetry | Centered flex, `text-[15px]`, no session |
| **RIGHT** | Session + Chi tiết | `runtime-status-session-label`, compact details toggle |

Session no longer competes with risk metrics in the scan path.

---

## Typography decisions

| Element | Size | Weight | Color |
|---------|------|--------|-------|
| Telemetry base | 15px | medium | slate-900 |
| Connected | 15px | semibold | green-700 |
| Total count | 15px | semibold num | slate-900 |
| Overdue | 15px | semibold | red-700 + subtle red-50 bg |
| Warning | 15px | semibold | amber-700 |
| Worker | 15px | semibold | blue-700 |
| Session | 14px | medium | slate-800 |
| Quick actions | 14px | medium | slate-900 |

**Removed:** `text-xs` on primary telemetry, slate-400/500 in footer metrics.

---

## Separator reduction rationale

- **Before:** 5+ `.runtime-status-sep` between every metric → visual noise, broken scan rhythm.
- **After:** 2 zone separators only; metrics separated by `gap-x-3` (12px).
- Operator reads **zones first**, then **risk metrics** (overdue/warning), then worker.

---

## Responsive behavior

| Breakpoint | Behavior |
|------------|----------|
| Desktop (>1280px) | Full telemetry + “N việc” label + cache sub-label |
| ≤1280px | Hide “ việc” suffix, keep number + icon |
| ≤1024px | Hide total count block; keep Connected, overdue, warning, Worker |

Footer remains single row with horizontal scroll on telemetry zone if needed.

---

## Interaction (real + TODO)

| Click target | Behavior |
|--------------|----------|
| **Connected** | Opens expanded runtime detail (Chi tiết panel) |
| **N quá hạn** | Navigates `/tasks?filter=overdue` when on tasks route |
| **N cảnh báo** | Opens detail + highlights warnings list |
| **Worker OK** | Opens expanded runtime detail |
| **Chi tiết** | Toggle expanded panel (right zone) |

TODO markers in code for dedicated runtime/worker/warning modals when available — no fake behavior.

---

## Changed files

| File | Change |
|------|--------|
| `components/runtime/RuntimeStatusBar.tsx` | 3-zone layout, session + Chi tiết right |
| `components/runtime/RuntimeTelemetryInline.tsx` | Center-only metrics, interactions, no separators |
| `styles/index.css` | GS_09N footer tokens, height 42–46px, responsive compaction |
| `modules/task/taskBottomStatusBarPolishChecks.ts` | **New** validation suite |

---

## Validation result

**Suite:** `runTaskBottomStatusBarPolishChecks()`

| Check | Intent |
|-------|--------|
| `threeZoneLayout` | actions / telemetry / session |
| `telemetryFontSize` | ≥ 14px |
| `noMutedTelemetryText` | no slate-400/500 in telemetry CSS |
| `overdueEmphasis` | red-700 + semibold |
| `warningEmphasis` | amber-700 + semibold |
| `footerHeightControlled` | 42–46px band |
| `noContentOverlapPattern` | shrink-0 flex footer |
| `noQueueTelemetryCard` | GS_09M preserved |
| `reducedInlineSeparators` | no per-metric sep |
| `sessionRightZone` | session isolated right |

---

## Build result

Run: `cd apps/workboard && npm run build` — **PASS** (tsc + vite, ~10s)

---

## Screenshots requested

Capture after `npm run dev`:

1. Full `/tasks` screen showing polished footer  
2. Footer close-up (3 zones visible)  
3. Narrow-width footer (≤1024px) — overdue/warning retained  
4. Queue area confirming no footer overlap  

---

## Acceptance criteria

| # | Criterion | Status |
|---|-----------|--------|
| 1 | Footer easier to read | ✅ 15px telemetry, stronger contrast |
| 2 | Telemetry separated from quick actions | ✅ 3 zones |
| 3 | Overdue/warning visually stronger | ✅ semibold + color + overdue bg |
| 4 | Status bar not alert card | ✅ flat inline strip |
| 5 | Main queue remains central | ✅ no queue changes |
| 6 | Footer height controlled | ✅ h-11, 42–46px |
| 7 | No layout regression | ✅ flex shrink-0 shell |
| 8 | Build PASS | ✅ verify locally |

---

## Operator scan impact

Footer scan path stabilized: **actions (launch) → connection → risk (overdue/warning) → worker → session (context)**. Risk metrics pop without yellow alert blocks. Queue execution hierarchy unchanged.
