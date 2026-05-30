# PHASE_TASK_GS_08 — Signal Collapse Runtime — Report

**Date:** 2026-05-25  
**Branch:** `phase/from-v2.4.1-TASK-FIN-runtime-freeze`  
**Status:** GO  
**Build:** `npm run build` — PASS

---

## Summary

Phase chuyển task list sang **Signal-Collapsed Operational Runtime**: mỗi card chỉ hiện **1 dominant signal** + optional **1 secondary subtle**, pattern-first border colors, metadata tối giản; chi tiết đầy đủ ở right panel.

## Dominant signal engine

`collapseTaskSignals(task, ctx)` → `{ primary, secondary, metaShort, suppressed }`

Mỗi card render tối đa:
- Title
- Dominant label (pattern color)
- Secondary subtle (stale/awareness only)
- metaShort (owner OR due — không cả hai verbose)

Removed from card layer:
- Inline waiting/dependency chips
- Separate escalation chips
- Duplicate critical signal in meta
- `⚠ quá tải` text stack
- Next-action chip when dominant signal present

## Signal hierarchy

Priority (high → low):

1. CRITICAL_BLOCK  
2. ESCALATION  
3. OVERDUE  
4. WAITING_DEPENDENCY  
5. FOLLOW_UP  
6. STALE  
7. AWARENESS  
8. BACKGROUND  

Higher priority collapses lower — task với Escalation + Overdue + Stale chỉ hiện **Escalation**, secondary có thể **14d**.

## Escalation saturation control

`buildSignalCollapseContext(tasks)` counts queue escalations.

When `escalationCount / total > 25%`:
- HIGH escalations → `intensity: muted`

When operator đã mở task (`markTaskSignalViewed`):
- non-critical escalation → `intensity: minimal`

## Pattern-first scanning

Left border + subtle bg tint:
- Red — critical/block
- Violet — escalation
- Amber — overdue
- Sky — waiting
- Slate — stale
- Fade — awareness/minimal

## Metadata collapse

Card: `getCollapsedMetaShort()` — owner (10 chars) for urgent, due date otherwise.

Panel: `getFullMetaLine()` + all signals in "Signals (collapsed on list)" section.

## Visual noise reduction

- Card padding `py-1.5` → `py-1`
- Group gap `space-y-1` → `space-y-0.5`
- Action icons default `opacity-60`
- No chip stack on title row

## Throughput

Denser list rows without removing task awareness — scan target 1–2s per card.

## Files

| New | Updated |
|-----|---------|
| signalHierarchy.ts, signalCollapse.ts, visualPriority.ts | TaskCard.tsx, taskSignalFiltering.ts |
| taskGs08Checks.ts | TaskGroupSection.tsx, TasksPage.tsx |
| | OperationalContextPanel.tsx, index.css, taskOperatorObservation.ts |

## Limitations

- Saturation thresholds fixed (25%, viewed session)
- Secondary only STALE/AWARENESS kinds
- Hidden rhythm/coordination modes still in runtime, not on cards

## Next recommendations

1. Per-operator saturation tuning from observation log
2. Hover reveal secondary on desktop (optional, no new badges)
3. GAS snapshot `dominantSignal` precompute for large queues
