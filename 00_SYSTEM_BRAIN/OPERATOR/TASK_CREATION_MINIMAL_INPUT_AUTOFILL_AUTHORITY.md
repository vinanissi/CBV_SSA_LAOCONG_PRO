# Task Creation Minimal Input / Autofill — Authority

**Status:** LOCKED (PHASE_TASK_CREATION_MINIMAL_INPUT_AUTOFILL_V1)  
**Scope:** Work Inbox create dialog + GAS `taskDbCreateTask_` autofill (no DB migration)

---

## User input (minimum)

| Field | Required |
|-------|----------|
| Tên việc (TITLE) | Yes |
| Mô tả (DESCRIPTION) | Encouraged, optional |
| Loại việc (TASK_TYPE_ID) | Yes when catalog exists |
| Đơn vị (DON_VI_ID) | Yes when multiple units; auto when exactly one |
| Người phụ trách (OWNER_ID) | Default current user (Work Inbox USER create) |
| Hạn xử lý (DUE_DATE) | Optional |
| Ưu tiên (PRIORITY) | Default Bình thường / NORMAL |

User must **not** enter ID, TASK_CODE, CREATED_*, UPDATED_*, flags, PROGRESS_PERCENT.

---

## Autofill (system)

Delegated to `buildTaskCreationPayload` (FE preview) + `taskDbCreateTask_` (GAS persistence):

| Field | Default |
|-------|---------|
| ID | UUID (`taskDbMakeId_`) |
| TASK_CODE | `taskDbMakeTaskCode_` |
| STATUS | NEW |
| REPORTER_ID | Current user |
| CREATED_AT / UPDATED_AT | Now |
| CREATED_BY / UPDATED_BY | Current user |
| PROGRESS_PERCENT | 0 |
| IS_* flags | false |
| PENDING_ACTION | empty |
| SHARED_WITH | empty |

---

## DON_VI_ID rules

- **Multiple units:** user must select — no silent guess.
- **Single unit:** auto-select (documented).
- **Operator donViId:** prefill hint only when it matches catalog entry.

---

## Config

| Schema | File |
|--------|------|
| `TASK_CREATION_INPUT_SCHEMA` | `taskCreationMinimalInputSchemas.ts` |
| `TASK_CREATION_AUTOFILL_SCHEMA` | same |
| `TASK_CREATION_VALIDATION_SCHEMA` | same |
| Builder | `buildTaskCreationPayload.ts` |
| Catalog | `resolveTaskCreationCatalog.ts` |
| UI | `WorkInboxCreateTaskDialog.tsx` |

---

## Out of scope

CASE runtime, AI pending action, automatic checklist generation.
