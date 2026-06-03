# Task → Checklist Information Model — Authority

**Status:** LOCKED (PHASE_TASK_CHECKLIST_INFORMATION_MODEL_V1)  
**Scope:** Work Inbox focus runtime — no CASE layer in this model

---

## Model

```text
TASK → CHECKLIST
TASK = work item to handle (one row in TASK_MAIN / focus queue)
CHECKLIST = operational steps to complete the task
```

CASE is **out of scope** for this authority. Optional OCMS case strip/workspace may coexist but does not redefine TASK/CHECKLIST boundaries.

---

## Schema config (UI-only)

| Config | File |
|--------|------|
| `TASK_DETAIL_SCHEMA` | `taskChecklistInformationModelSchemas.ts` |
| Field resolution | `resolveTaskChecklistFieldValues.ts` |

Controls: label, source path, fallback sources, order, visibility, operator vs technical.

---

## TASK conceptual fields (mapped)

| Field | Primary source |
|-------|----------------|
| task_title | `item.title`, `taskDetail.title` |
| task_description | `taskDetail.description` |
| task_context | `pendingAction`, `blockReason`, `item.summary` |
| task_expected_result | `taskDetail.nextStep` |
| task_ai_summary | `item.summary` (not task title) |

Empty sections hidden unless `showWhenEmpty` + placeholder in schema.

---

## CHECKLIST item

Rendered via existing `SmartChecklistItemRow` runtime. `CHECKLIST_ITEM_SCHEMA` documents counters and inline panels.

Focus context pattern: **ĐANG LÀM:** + Hoàn thành bước / Ghi chú / Thêm tài liệu / Bỏ focus.

---

## Right panel

Chi tiết summary uses `OPERATOR_DETAIL_PANEL_SCHEMA` (friendly labels). Timeline / Kỹ thuật remain separate tabs per `OPERATOR_PANEL_INFORMATION_ARCHITECTURE_AUTHORITY.md`.
