# ADR: Task → Checklist Information Model V1

**Status:** Accepted  
**Phase:** `PHASE_TASK_CHECKLIST_INFORMATION_MODEL_V1`  
**Date:** 2026-06-02

---

## Context

Task title doubled as description and AI summary. Right panel felt like raw DB columns. TASK vs CHECKLIST boundaries were implicit.

---

## Decision

1. Formalize **TASK → CHECKLIST** (no CASE in this model).
2. Introduce UI schemas: `TASK_DETAIL_SCHEMA`, `OPERATOR_DETAIL_PANEL_SCHEMA`, `CHECKLIST_ITEM_SCHEMA`.
3. Resolve display values via `buildTaskChecklistFieldBag` + field mapping (no DB migration).
4. Enrich `CompactTaskHeader` with schema-driven description/context/expected result/AI blocks.
5. Refocus checklist bar as **ĐANG LÀM:** with step actions.

---

## Consequences

- Readable task header without new columns.
- Operator detail uses labels like **Công việc**, **Phụ trách** (not only technical names).
- Some conceptual fields may be empty until backend adds columns (safe fallbacks).
- AI summary no longer falls back to task title in `WorkInboxFocusRuntime`.

---

## Out of scope

CASE runtime, new permissions, major persistence redesign.
