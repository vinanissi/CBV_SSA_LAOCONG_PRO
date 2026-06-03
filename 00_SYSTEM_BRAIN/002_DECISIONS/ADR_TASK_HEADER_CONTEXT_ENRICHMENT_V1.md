# ADR: Task Header Context Enrichment V1

**Status:** Accepted  
**Phase:** `PHASE_TASK_HEADER_CONTEXT_ENRICHMENT_V1`  
**Date:** 2026-06-02

---

## Context

Task header showed title + semantic status but not enough TASK context (Mô tả, bối cảnh, kết quả, AI summary). Operators inferred intent from checklist alone. Inbox summary was mixed into context fields.

---

## Decision

1. Add `TASK_HEADER_CONTEXT_SCHEMA` with labeled sections: MÔ TẢ, THÔNG TIN THÊM, KẾT QUẢ CẦN ĐẠT, TÓM TẮT AI.
2. Resolve via `resolveTaskHeaderContextRows()` with dedupe guards (title ≠ description ≠ context ≠ AI).
3. Render context block above semantic status summary in `CompactTaskHeader`.
4. Map from existing TaskDetail / runtime fields — no DB migration.
5. Extend `TaskCardModel` with optional `summary` / `module` for focus typing.

---

## Consequences

- Header expresses TASK part of TASK → CHECKLIST before checklist steps.
- Empty sections omitted (no layout noise).
- Some conceptual fields empty until backend adds columns — documented as warnings.
- Browser UAT deferred.

---

## Out of scope

CASE runtime, new persistence, automatic AI generation.
