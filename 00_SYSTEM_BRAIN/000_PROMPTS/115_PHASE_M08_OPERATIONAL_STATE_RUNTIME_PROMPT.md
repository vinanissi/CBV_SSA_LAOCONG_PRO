# CURSOR PROMPT — M08_OPS_STATE_RUNTIME (archived)

**Archived:** 2026-05-14  
**Repo:** `D:\Workspace\projects\CBV_SSA_LAOCONG_PRO`  
**Branch:** `phase/from-v2.4.1-TASK-FIN`

This file captures the execution brief for **MILESTONE_08_OPERATIONAL_STATE_RUNTIME** (Operational State Runtime Layer). The authoritative checklist for acceptance was the original Cursor task message; implementation artifacts live under:

- `05_GAS_RUNTIME/999D_MILESTONE_08_OPERATIONAL_STATE_RUNTIME.js`
- `05_GAS_RUNTIME/999E_MILESTONE_08_OPERATIONAL_STATE_TEST_CONSOLE.js`
- `00_SYSTEM_BRAIN/000_TEST_CONSOLE/CBV_TCS_V1/contracts/CBV_M08_OPERATIONAL_STATE_MARKER_CONTRACT.json`
- `00_SYSTEM_BRAIN/000_REPORTS/115_MILESTONE_08_OPERATIONAL_STATE_RUNTIME_LOCAL_REPORT.md`
- `00_SYSTEM_BRAIN/001_HANDOFF/115_MILESTONE_08_OPERATIONAL_STATE_RUNTIME_AI_HANDOFF.md`

## Product result (target)

“Hệ thống bắt đầu điều hành công việc thật, theo dõi trạng thái thật, phát hiện nghẽn thật, và tạo operational memory thật.” — **read-first / manual-first**, no auto-resolve / auto-assign / auto-escalate / auto-DONE in this phase.

## Core deliverables (M08)

1. Runtime state engine: registry (TODO→CANCELLED), transition rules, safe transition **preview** (contract object), no production mutation from preview.
2. Transition contract fields: `fromState`, `toState`, `allowed`, `actor`, `reason`, `timestamp`, `traceId`, `taskId`, `source`, `warnings`, `errors`.
3. Operational timeline: append-only event model + renderer + empty state; no overwrite API.
4. SLA runtime: warning-only severities; flags (not_started, overdue, blocked_too_long, waiting_too_long, review_pending, missing_evidence, stale_task); **no** auto escalation.
5. Today operational state dashboard markers + Vietnamese copy (“Trạng thái vận hành”, “Đang xử lý”, “Bị chặn”, …).
6. Supervisor summary: read-only aggregates.
7. Event hook: **SAFE_DISABLED** stub.
8. Test Console **999E** + menu under **🧪 CBV Test Console**; Drive six-file bundle (`CbvTcsDriveReport_exportMilestoneFullTestBundle`, tagStem `MILESTONE_08_OPERATIONAL_STATE_RUNTIME`); marker preflight; regressions M04–M07.
9. Marker contract + `scripts/cbv-marker-contract-self-check.mjs` M08 entry; HTML probe fallbacks including `cbv-m08-operational-state-empty`.

## Standards

- CBV Operational Ecosystem Standard V1  
- `00_SYSTEM_BRAIN/000_TEST_CONSOLE/CBV_TCS_V1/docs/CBV_TCS_V1_STANDARD.md`  
- Drive folder ID: `1wQhgcq6An8YTu_6WD91p1nJLJ0gtChwG`

## Post-implementation verification (operator)

`clasp push` → menu **M08 — Run Operational State Runtime Test** → confirm Drive bundle + `envelopeOk=true` + no ERROR/CRITICAL before tag / production GO.
