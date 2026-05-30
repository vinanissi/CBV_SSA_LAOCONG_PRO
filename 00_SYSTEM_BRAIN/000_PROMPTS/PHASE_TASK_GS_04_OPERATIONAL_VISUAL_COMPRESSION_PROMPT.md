# PHASE_TASK_GS_04 — Operational Visual Compression (Prompt)

READ FIRST:

00_SYSTEM_BRAIN/000_RUNTIME_ENTRYPOINT.md

---

**Phase ID:** `PHASE_TASK_GS_04_OPERATIONAL_VISUAL_COMPRESSION`  
**Branch:** `phase/from-v2.4.1-TASK-FIN-runtime-freeze`  
**Baseline:** GS_03 runtime performance + GS_02 operational usage

## Goal

Transform CBV TASK from "list of tall cards" into an **Operational Coordination Workspace** with fast scanning, focus support, and reduced cognitive load.

## Priorities

1. Dense operational mode — compact task cards (~40–60% height reduction)
2. Visual urgency hierarchy — CRITICAL / HIGH / MEDIUM / NORMAL
3. Focus mode — highlight selected, dim others
4. Operational grouping — overdue, blocked, waiting, approval, today, upcoming, stale, mine
5. Right panel compression — sections, timeline limit, sticky quick actions
6. Scanning UX — J/K, sticky group headers, compact counters
7. Runtime-aware UI — stale/degraded warnings without panic screens

## Constraints

- No full app redesign, no kanban, no charts
- Keep dark operational theme
- No TASK runtime rewrite
- FE-only phase

## Test

`runTaskGs04Checks()` in `apps/workboard/src/modules/task/taskGs04Checks.ts`

## Artifacts

- Report: `PHASE_TASK_GS_04_OPERATIONAL_VISUAL_COMPRESSION_REPORT.md`
- Handoff: `PHASE_TASK_GS_04_OPERATIONAL_VISUAL_COMPRESSION_HANDOFF.md`
