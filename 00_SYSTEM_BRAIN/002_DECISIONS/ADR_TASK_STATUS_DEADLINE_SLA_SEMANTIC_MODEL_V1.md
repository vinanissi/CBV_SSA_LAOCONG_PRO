# ADR: Task Status / Deadline / SLA Semantic Model V1

**Status:** Accepted  
**Phase:** `PHASE_TASK_STATUS_DEADLINE_SLA_SEMANTIC_MODEL_V1`  
**Date:** 2026-06-02

---

## Context

Operators saw **TRẠNG THÁI = Hôm nay** because `InboxStatus` (`today`, `overdue`) was reused as workflow status via inbox chips. Deadline, SLA, priority, and owner were mixed in header pills and duplicate meta lines.

---

## Decision

1. Introduce `TASK_STATUS_SUMMARY_SCHEMA` with five semantic keys: `workflow_status`, `deadline_state`, `sla_state`, `priority_state`, `owner`.
2. Resolve values in `buildTaskSemanticSummaryBag()` — split workflow from inbox due signals.
3. Render labeled summary via `TaskStatusSemanticSummary` in compact task header.
4. Feed the same bag into `OPERATOR_DETAIL_PANEL_SCHEMA` operator summary (Chi tiết).
5. No DB/API migration; mapping-only with documented fallbacks.

---

## Consequences

- TRẠNG THÁI shows workflow (API `status` / `STATUS_LABELS`, or safe default **Đang xử lý** when only due inbox status exists).
- THỜI HẠN shows `dueLabel` / inbox due state.
- Ambiguous API SLA strings normalized to Đạt / Cảnh báo / Vi phạm / Không áp dụng.
- Browser UAT deferred; static checks gate source separation.

---

## Out of scope

New SLA engine, CASE layer, backend redesign.
