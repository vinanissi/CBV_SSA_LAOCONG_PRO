# PHASE_TASK_STATUS_DEADLINE_SLA_SEMANTIC_MODEL_V1 — Report

**Result:** GO_WITH_WARNINGS  
**Date:** 2026-06-02

---

## Summary

Separated operator-facing **TRẠNG THÁI**, **THỜI HẠN**, **SLA**, **ƯU TIÊN**, and **PHỤ TRÁCH** into distinct semantic dimensions with schema + resolver + labeled UI. Fixed conflation where `InboxStatus.today` appeared as workflow status (**Hôm nay**).

---

## Deliverables

| Artifact | Path |
|----------|------|
| Schema | `taskStatusDeadlineSlaSemanticModelSchemas.ts` |
| Resolver | `resolveTaskStatusSemanticSummary.ts` |
| UI | `TaskStatusSemanticSummary.tsx`, `CompactTaskHeader.tsx` |
| Field bag | `resolveTaskChecklistFieldValues.ts` (semantic merge) |
| Panel schema | `taskChecklistInformationModelSchemas.ts` |
| Static checks | `taskStatusDeadlineSlaSemanticModelV1Checks.ts` |
| CSS | `apps/workboard/src/styles/index.css` |
| Authority | `OPERATOR/TASK_STATUS_DEADLINE_SLA_SEMANTIC_MODEL_AUTHORITY.md` |
| ADR | `ADR_TASK_STATUS_DEADLINE_SLA_SEMANTIC_MODEL_V1.md` |

---

## Mapping notes

| Dimension | Primary source | Fallback |
|-----------|----------------|----------|
| workflow_status | `runtimeTask.status` / `taskDetail.status` → `STATUS_LABELS` | Inbox non-due statuses; else **Đang xử lý** when inbox is `today`/`overdue` |
| deadline_state | `item.dueLabel`, `InboxStatus` | **Không có hạn** |
| sla_state | `taskDetail.slaStatus`, urgency | **Đạt** / derived warn-violation |
| priority_state | `item.priority` / runtime | **Bình thường** |
| owner | assignee display fields | **Chưa phân công** |

Removed `WORK_INBOX_STATUS_CHIP[item.status]` from `task_status_label` path.

---

## Preserved

Checklist row focus/checkbox, inline actions, right-panel IA tabs, footer sync/runtime.

---

## Warnings

- Browser smoke not executed (mandatory checklist deferred).
- SLA inference from urgency when `slaStatus` empty is heuristic.
- Workflow default **Đang xử lý** when only due inbox signal — document if API later exposes explicit workflow.

---

## Next

`PHASE_CHECKLIST_OPERATOR_BROWSER_UAT`
