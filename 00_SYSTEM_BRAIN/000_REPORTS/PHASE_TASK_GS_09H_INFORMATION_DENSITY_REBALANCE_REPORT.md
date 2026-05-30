# PHASE_TASK_GS_09H — Information Density Rebalance — Report

**Date:** 2026-05-25  
**Branch:** `phase/from-v2.4.1-TASK-FIN-runtime-freeze`  
**Status:** GO  
**Build:** `npm run build` — PASS

---

## Summary

Rebalanced CBV Workboard queue information density on the GS_09G light operational theme. Reduced metadata repetition, normalized card scan rhythm, strengthened action hierarchy, and reordered the right panel for execution-first parsing — without redesigning layout or reducing operational throughput density.

---

## Density issues identified (before)

| Issue | Symptom |
|-------|---------|
| Metadata sprawl | Card line 2 showed primary + secondary + metaShort as separate spans |
| Signal noise | Escalation, stale, overdue, owner, queue labels competed equally |
| Uneven card height | Variable meta rows broke eye tracking |
| Flat action weight | Icon cluster and inline buttons similar visual priority |
| Panel dump | Right panel duplicated "next step" + execution + full meta before timeline |
| Context strip noise | "Recent context" / "Quick Focus" labels added scan overhead |
| Bold overload | `font-semibold` on dominant signals + uppercase section labels |

---

## Metadata compression strategy

**New utility:** `informationBalance.ts` → `buildCompactCardLine()`

| Mode | Card shows |
|------|------------|
| **Compact (default)** | Dominant signal + due + owner (max 3 parts, one line) |
| **Expanded (focus/hover)** | Above + secondary signal (e.g. stale days) |

Example target achieved:

```
⚠ Escalation · hạn 04/22 · Trần Thị B
```

Suppressed signals moved to `title` tooltip and right panel only.

---

## Signal prioritization model

**New utility:** `signalPriority.ts`

| Level | Signals |
|-------|---------|
| L1 | Critical / blocking |
| L2 | Escalation / overdue |
| L3 | Waiting / follow-up |
| L4 | Stale / awareness / passive metadata |

Secondary signals (L4) hidden on default cards; shown on expanded disclosure or panel.

---

## Scan optimization changes

| Change | File |
|--------|------|
| Single operational line replaces multi-span meta | `TaskCard.tsx` |
| `task-card-scan-row` min-height 2.75rem | `index.css` |
| `task-group-body` spacing tightened (`space-y-0.5 p-1`) | `index.css` |
| Passive icon actions fade until hover | `TaskCard.tsx` |
| Primary accept uses `inline-action-primary` tier | `TaskCard.tsx` |
| Progressive disclosure via `scanRhythm.cardDisclosureMode()` | `scanRhythm.ts` |

---

## Typography rebalance

| Element | Before | After |
|---------|--------|-------|
| Card title | `font-medium text-slate-100` | `.task-card-title` — `font-semibold text-operational-text` |
| Meta line | Multiple semibold spans | `.task-card-operational-line` — `font-normal text-operational-muted` |
| Dominant label (panel) | `font-semibold tracking-wide` | `font-medium tracking-normal` |
| Panel zone labels | Mixed uppercase bold | `.panel-zone-label` — medium weight, muted |

---

## Operational rhythm improvements

- **Queue cards:** predictable 2-line structure (title + operational line) + action zone
- **Group spacing:** reduced vertical gap between cards for stable scan rows
- **Quick Focus:** icon-only chips; label shown only when filter active
- **Recent context:** removed uppercase section label; chips inline only

---

## Right panel hierarchy (execution-first)

**New zones:** `.panel-execution-zone` → `.panel-coordination-zone` → `.panel-reference-zone`

| Zone | Content |
|------|---------|
| **Top — Execution** | Next action, SLA, critical signal, owner/due meta, inline quick actions, waiting |
| **Middle — Coordination** | Handoff chain, escalation, dependencies |
| **Bottom — Reference** | Title, status, timeline, files, update form |

Removed duplicate "1 · Làm gì tiếp theo" section; merged into execution zone.

---

## Before / after

| Aspect | Before (GS_09G) | After (GS_09H) |
|--------|-----------------|----------------|
| Card meta | 3+ separate spans | 1 compact operational line |
| Secondary signals | Always visible on card | Progressive disclosure |
| Card height | Variable | `min-h-[2.75rem]` normalized |
| Primary action | Icon same weight as passive | Blue primary tier prominent |
| Right panel | Meta dump mid-panel | Execution → coordination → reference |
| Quick Focus | Icon + label always | Icon-only; label when active |
| Recent context | Uppercase label row | Chips only |

**Screenshots:** capture `/tasks` queue + selected task panel after `npm run dev` — compare card meta density and panel section order.

---

## Files changed

| Path | Change |
|------|--------|
| `shared/utils/informationBalance.ts` | **NEW** — compact line builder |
| `shared/utils/signalPriority.ts` | **NEW** — 4-level signal hierarchy |
| `shared/utils/scanRhythm.ts` | **NEW** — disclosure mode + scan constants |
| `components/ui/TaskCard.tsx` | Single operational line, progressive disclosure |
| `components/ui/OperationalContextPanel.tsx` | Execution-first panel zones |
| `components/ui/RecentContextStrip.tsx` | Label removed |
| `components/ui/QuickFocusFilters.tsx` | Icon-only inactive chips |
| `styles/index.css` | Scan row, panel zones, typography, action tier |
| `modules/task/taskGs09hChecks.ts` | **NEW** — validation suite |

---

## Test console

```typescript
import { runTaskGs09hChecks } from '@/modules/task/taskGs09hChecks';
runTaskGs09hChecks();
```

Checks: compact line format, metadata ≤3 parts, secondary hidden when collapsed, signal levels, CSS classes, panel execution meta.

---

## Acceptance criteria

| # | Criterion | Status |
|---|-----------|--------|
| 1 | Queue scan speed improved | GO |
| 2 | Metadata repetition reduced | GO |
| 3 | Card rhythm stable | GO |
| 4 | Primary actions clearer | GO |
| 5 | Light theme readability preserved | GO |
| 6 | Cognitive noise reduced | GO |
| 7 | Right panel easier to parse | GO |
| 8 | Execution throughput maintained | GO |
| 9 | FE build PASS | GO |
| 10 | No redesign regression | GO |
| 11 | Report/handoff completed | GO |
