# PHASE_TASK_STATUS_DEADLINE_SLA_SEMANTIC_MODEL_V1 — Test Evidence

**Result:** GO_WITH_WARNINGS  
**Date:** 2026-06-02

---

## Static

`runTaskStatusDeadlineSlaSemanticModelV1Checks()` — suite `PHASE_TASK_STATUS_DEADLINE_SLA_SEMANTIC_MODEL_V1`.

Checks include: schema present, `buildTaskSemanticSummaryBag`, no `WORK_INBOX_STATUS_CHIP` for workflow, header uses `TaskStatusSemanticSummary`, panel sources `workflow_status` / `deadline_state`, authority + ADR on disk.

---

## Typecheck / lint

Run in `apps/workboard` as part of phase closeout (workboard package).

---

## Browser (deferred)

| Check | Status |
|-------|--------|
| TRẠNG THÁI label + workflow value | NOT RUN |
| THỜI HẠN shows Hôm nay / Quá hạn / Không có hạn | NOT RUN |
| SLA / ƯU TIÊN / PHỤ TRÁCH labels | NOT RUN |
| Chi tiết same separation | NOT RUN |
| Checklist focus/checkbox/tabs/footer | NOT RUN |

Follow-up: `PHASE_CHECKLIST_OPERATOR_BROWSER_UAT`.

---

## Source-level assertions

- `DEADLINE_INBOX_STATUSES` excludes `today`/`overdue` from `mapWorkflowFromInboxStatus` return for workflow chip path.
- `normalizeDeadlineLabel` maps inbox `today` → **Hôm nay** on `deadline_state` only.
