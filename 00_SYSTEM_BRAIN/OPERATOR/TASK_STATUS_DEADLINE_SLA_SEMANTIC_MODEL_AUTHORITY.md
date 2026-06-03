# Task Status / Deadline / SLA Semantic Model — Authority

**Status:** LOCKED (PHASE_TASK_STATUS_DEADLINE_SLA_SEMANTIC_MODEL_V1)  
**Scope:** Work Inbox focus runtime — operator-facing labels only (no DB/API contract change)

---

## Semantic dimensions

| Label (VI) | semanticType | Meaning | Must NOT display |
|------------|--------------|---------|------------------|
| TRẠNG THÁI | `workflow_state` | Workflow stage | Hôm nay, Quá hạn, relative due text |
| THỜI HẠN | `deadline_state` | Deadline proximity | Workflow labels, SLA breach as status |
| SLA | `service_level_state` | Service level | Workflow or priority |
| ƯU TIÊN | `business_priority` | Business priority | Deadline/SLA |
| PHỤ TRÁCH | `owner` | Primary accountability | — |

---

## Config (UI-only)

| Config | File |
|--------|------|
| `TASK_STATUS_SUMMARY_SCHEMA` | `taskStatusDeadlineSlaSemanticModelSchemas.ts` |
| Resolver bag | `resolveTaskStatusSemanticSummary.ts` → `buildTaskSemanticSummaryBag` |
| Header UI | `TaskStatusSemanticSummary.tsx`, `CompactTaskHeader.tsx` |
| Panel fields | `taskChecklistInformationModelSchemas.ts` (`workflow_status`, `deadline_state`, …) |

`InboxStatus` values `today` / `overdue` are **deadline signals only**. They must not map to TRẠNG THÁI unless an explicit API `status` field confirms workflow.

When inbox is `today`/`overdue` and API workflow status is absent, default workflow display: **Đang xử lý** (not **Hôm nay** / **Quá hạn**).

---

## Presentation

Labeled rows (not mixed chips). Icons from schema config; values from resolver bag only — no hardcoded business values in JSX.

---

## Preserved

Checklist focus/checkbox, inline panels, right-panel tabs (Chi tiết / Timeline / Handoff / Hồ sơ / Kỹ thuật), footer sync ownership.

---

## Out of scope

CASE runtime, DB migration, new SLA/deadline engines, permission changes.
