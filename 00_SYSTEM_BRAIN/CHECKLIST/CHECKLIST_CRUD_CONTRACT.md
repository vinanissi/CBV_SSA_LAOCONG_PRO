# Checklist CRUD Contract

**Version:** 1.0  
**Phase:** `PHASE_CHECKLIST_06_CRUD_AND_LAYOUT_RUNTIME`  
**Status:** ACCEPTED

---

## Operations

| Operation | Runtime |
|-----------|---------|
| `create_item` | API `createWorkInboxChecklistItem` |
| `edit_item` / `save_item` | API `updateWorkInboxChecklistItem` (title, sortOrder) |
| `toggle_status` | API `toggleWorkInboxChecklistItem` |
| `move_up` / `move_down` | API reorder via `sortOrder` swap |
| `archive_item` / `restore_item` | Local overlay `isArchived` |

---

## SmartChecklistItem fields (phase 06)

| Field | Source |
|-------|--------|
| `sortOrder` | API `WorkInboxChecklistItem.sortOrder` |
| `note` | API note + local overlay |
| `isArchived` | Local overlay (default false) |
| `layoutExpanded` | Local layout state (default false) |

---

## Storage

| Concern | Key |
|---------|-----|
| Archive + note overlay | `cbv-checklist-crud-overlay:v1:{taskId}` |

No new database tables in this phase.

---

## Out of scope

Workflow engine, templates, global checklist repo, schema migration, hard delete as default UX.
