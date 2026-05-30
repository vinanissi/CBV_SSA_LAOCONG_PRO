# PHASE_TASK_GS_09P — Remove Dark Runtime Rail / Light Console — Report

**Date:** 2026-05-25  
**Branch:** `phase/from-v2.4.1-TASK-FIN-runtime-freeze`  
**Status:** GO  
**Build:** `npm run build` (apps/workboard) — **PASS** (~8s)  
**Baseline:** GS_09O runtime console architecture · CBV Operational Ecosystem Standard V1

---

## Summary

Corrected GS_09O visual language: removed **dark runtime rail + dark drawer**, converted to **Industrial Light Runtime Console** while preserving all runtime architecture (3-zone footer, telemetry, clock, hints, drawer, interactions).

---

## Why dark rail was removed

| Issue (GS_09O dark) | Impact |
|---------------------|--------|
| `bg-slate-900` footer | Detached from light operational workspace |
| Dark drawer + muted text | Unreadable, production-unfriendly |
| High contrast footer band | Stole attention from execution queue |
| Dev-tool / terminal feel | Wrong mental model for CBV operators |
| Long-hour use | Eye strain from dark-on-light boundary |

**Core insight:** CBV needs **operational clarity in a light system**, not infra-only dark console aesthetics.

---

## What was preserved from GS_09O

| Capability | Status |
|------------|--------|
| `RuntimeStatusBar` 3-zone layout | ✅ |
| `RuntimeTelemetryInline` + click interactions | ✅ |
| `RuntimeFooterDrawer` slide-up detail | ✅ |
| Runtime sync clock | ✅ |
| Keyboard hints (J/K · Enter · R) | ✅ |
| Subtle connected pulse (opacity only) | ✅ |
| Worker spin on refresh only | ✅ |
| Footer fixed bottom, no queue overlap | ✅ |
| Responsive collapse priorities | ✅ |
| TODO scaffolds (SLA, memory) | ✅ |

---

## Light console visual decisions

### Footer rail

| Token | Value |
|-------|-------|
| Background | `bg-slate-100` |
| Border | `border-t border-slate-300` |
| Shadow | Subtle upward shadow only |
| Primary text | `text-slate-900` |
| Secondary | `text-slate-800` / `text-slate-700` |
| Class marker | `.runtime-light-console` |

### Metrics (unchanged semantics, light palette)

| Metric | Style |
|--------|-------|
| Connected | `green-700` semibold + `green-600` dot |
| Overdue | `red-700` semibold + `red-50` chip + `ring-red-200` |
| Warning | `amber-700` semibold + `amber-50` bg |
| Worker | `blue-700` semibold |
| Session / clock | `slate-800` / `slate-700` |

### Drawer

| Element | Style |
|---------|-------|
| Surface | `bg-slate-50` + white header |
| Border | `border-slate-300` |
| Section cards | `bg-white border-slate-200 rounded-md` |
| Labels | `text-slate-700` medium |
| Values | `text-slate-900` semibold |
| Warnings | `bg-amber-50 border-amber-200`, title `amber-800`, body `slate-900` |
| Backdrop | Light `slate-900/15` (not heavy dark overlay) |

---

## Footer before / after

### Before (GS_09O — dark)

```
████████████████████████████████████████████████  ← bg-slate-900
+ Việc │ ● Connected (green-400) │ … │ Sync (slate-400)
```

### After (GS_09P — light industrial)

```
▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  ← bg-slate-100, border-slate-300
+ Việc │ ● Connected (green-700) │ … │ Sync (slate-700)
```

Footer integrates with light workspace; still reads as **runtime rail** via structure and telemetry density, not dark chrome.

---

## Drawer before / after

| Before | After |
|--------|-------|
| `bg-slate-900`, `text-slate-100` | `bg-slate-50`, white section cards |
| Labels `slate-400` (muted) | Labels `slate-700` |
| Warnings `amber-300` on dark | Warnings `slate-900` on `amber-50` |
| Heavy dark shadow | Light operational shadow |

---

## Contrast rules

**Forbidden in footer/drawer runtime console CSS:**
- `text-slate-400`, `text-slate-500`
- `bg-slate-900`, `bg-slate-950` on footer/drawer surfaces

**Required:**
- Metric colors at `-700` level on light backgrounds
- Section titles `slate-900` semibold
- Pulse: opacity only, `prefers-reduced-motion` respected

---

## Changed files

| File | Change |
|------|--------|
| `styles/index.css` | Full light industrial footer + drawer tokens |
| `RuntimeStatusBar.tsx` | Added `runtime-light-console` class |
| `RuntimeFooterDrawer.tsx` | Section cards, light warning styling |
| `taskLightRuntimeConsoleChecks.ts` | **New** — 15 validation checks |
| `taskRuntimeFooterConsoleChecks.ts` | Updated rail check for light console |

---

## Validation results

**Suite:** `runTaskLightRuntimeConsoleChecks()`

| # | Check | Intent |
|---|-------|--------|
| 1 | No dark footer rail | No slate-900/950 |
| 2 | Light drawer | bg-slate-50 / white cards |
| 3 | Light industrial footer | slate-100 + slate-300 |
| 4 | Telemetry contrast | slate-900/800/700 |
| 5 | No muted text | no slate-400/500 |
| 6–9 | Metric colors | green/red/amber/blue -700 |
| 10 | Runtime clock | preserved |
| 11 | Keyboard hints | preserved |
| 12 | Drawer expands | preserved |
| 13–14 | Height / overlap | 42–46px, shrink-0 |
| 15 | No queue card | GS_09M preserved |

---

## Build result

```
> tsc --noEmit && vite build
✓ 143 modules — PASS
```

---

## Screenshots requested

1. Full `/tasks` with light runtime footer  
2. Footer close-up (3 zones)  
3. Expanded light runtime drawer  
4. Warnings section readability  
5. Narrow-width responsive footer  

---

## Acceptance criteria

| # | Criterion | Status |
|---|-----------|--------|
| 1 | No dark runtime rail | ✅ |
| 2 | No dark drawer | ✅ |
| 3 | Still feels like runtime console | ✅ structure + telemetry |
| 4 | Fits light operational workspace | ✅ |
| 5 | Telemetry readable | ✅ -700 on light |
| 6 | Drawer production-usable | ✅ card sections |
| 7 | Clock/hints/drawer preserved | ✅ |
| 8 | Queue remains central | ✅ |
| 9 | Footer compact + stable | ✅ 44px |
| 10 | Build PASS | ✅ |

---

## Design direction confirmed

**LIGHT INDUSTRIAL OPERATIONAL CONSOLE** — not dark dev tool, not SaaS gray minimalism. Runtime architecture from GS_09O retained; visual language corrected for CBV long-hour operational use.
