# Checklist Sheet Persistence Contract

**Version:** 1.0  
**Phase:** `PHASE_CHECKLIST_08_SHEET_DRIVE_PERSISTENCE_DECISION`  
**Status:** ACTIVE — schema bootstrap in phase 09; row-level bridge deferred to phase 11+

---

## Principle

```text
Sheet = data / metadata / state / history
Drive = actual files (see CHECKLIST_DRIVE_PERSISTENCE_CONTRACT.md)
```

Never store binary file content in Sheet cells.

---

## Tab map (logical → physical)

| Logical tab | Physical tab (CBV) | Status today |
|-------------|-------------------|--------------|
| `CHECKLIST_ITEMS` | **`TASK_CHECKLIST`** | **Live** — `49_WorkInboxChecklist.js` |
| `CHECKLIST_FEEDBACK` | `CHECKLIST_FEEDBACK` | localStorage → Sheet (phase 09+) |
| `CHECKLIST_ATTACHMENTS` | `CHECKLIST_ATTACHMENTS` | localStorage metadata → Sheet (phase 09+) |
| `CHECKLIST_LINKS` | `CHECKLIST_LINKS` | localStorage → Sheet (phase 09+) |
| `CHECKLIST_HISTORY` | `CHECKLIST_HISTORY` | localStorage → Sheet (phase 09+) |
| `CHECKLIST_TEMPLATES` | `CHECKLIST_TEMPLATES` | static seed → Sheet (phase 09+) |
| `CHECKLIST_TEMPLATE_ITEMS` | `CHECKLIST_TEMPLATE_ITEMS` | static seed → Sheet (phase 09+) |
| `CHECKLIST_LAYOUT_STATE` | `CHECKLIST_LAYOUT_STATE` | localStorage → Sheet (phase 09+) |

---

## CHECKLIST_ITEMS ↔ TASK_CHECKLIST

| Contract column | TASK_CHECKLIST column | Notes |
|-----------------|----------------------|--------|
| `checklist_item_id` | `ID` | Primary key |
| `task_id` | `TASK_ID` | FK TASK_MAIN |
| `title` | `TITLE` | |
| `note` | `NOTE` | |
| `status` | derived from `IS_DONE` | `open` / `done` in FE |
| `sort_order` | `ITEM_NO` | Existing sort field |
| `is_archived` | **`IS_ARCHIVED`** (proposed) or overlay until column added | Phase 06 uses local overlay today |
| `created_by` | `CREATED_BY` | |
| `created_at` | `CREATED_AT` | |
| `updated_by` | `UPDATED_BY` | |
| `updated_at` | `UPDATED_AT` | |
| `source` | optional column | `work_inbox`, `template`, … |
| `schema_version` | optional column | `1` |

Existing soft delete: `IS_DELETED` (Yes/No) — prefer over hard delete; aligns with archive semantics.

---

## CHECKLIST_FEEDBACK

| Column | Type | Required |
|--------|------|----------|
| `feedback_id` | Text | Yes |
| `checklist_item_id` | Text | Yes |
| `task_id` | Text | Yes |
| `message` | Text | Yes |
| `author` | Text | No |
| `created_at` | Datetime | No |
| `source` | Text | No |
| `schema_version` | Text | No |

**Append:** new row per feedback. No in-place edit in v1 bridge.

---

## CHECKLIST_ATTACHMENTS (metadata only)

| Column | Type | Required |
|--------|------|----------|
| `attachment_id` | Text | Yes |
| `checklist_item_id` | Text | Yes |
| `task_id` | Text | Yes |
| `file_name` | Text | Yes |
| `drive_file_id` | Text | No* |
| `drive_url` | Text | No* |
| `mime_type` | Text | No |
| `size` | Number | No |
| `source` | Text | No |
| `created_by` | Text | No |
| `created_at` | Datetime | No |
| `schema_version` | Text | No |

\* Required when `source=drive` after phase 11 upload. URL-only refs may omit `drive_file_id` until registered.

---

## CHECKLIST_LINKS

| Column | Type | Required |
|--------|------|----------|
| `link_id` | Text | Yes |
| `checklist_item_id` | Text | Yes |
| `task_id` | Text | Yes |
| `label` | Text | Yes |
| `url` | Text | Yes |
| `type` | Text | No |
| `description` | Text | No |
| `source` | Text | No |
| `created_by` | Text | No |
| `created_at` | Datetime | No |
| `schema_version` | Text | No |

---

## CHECKLIST_HISTORY (append-only)

| Column | Type | Required |
|--------|------|----------|
| `history_id` | Text | Yes |
| `checklist_item_id` | Text | Yes |
| `task_id` | Text | Yes |
| `event_type` | Text | Yes |
| `message` | Text | Yes |
| `actor` | Text | No |
| `created_at` | Datetime | No |
| `source` | Text | No |
| `ref_id` | Text | No |
| `ref_type` | Text | No |
| `metadata_json` | Text | No | JSON string |
| `schema_version` | Text | No |

**Rule:** inserts only; no updates/deletes except admin tooling with audit.

---

## CHECKLIST_TEMPLATES

| Column | Type | Required |
|--------|------|----------|
| `template_id` | Text | Yes |
| `name` | Text | Yes |
| `description` | Text | No |
| `category` | Text | No |
| `version` | Text | No |
| `is_active` | Yes/No | No (default Yes) |
| `created_by` | Text | No |
| `created_at` | Datetime | No |
| `updated_at` | Datetime | No |
| `schema_version` | Text | No |

---

## CHECKLIST_TEMPLATE_ITEMS

| Column | Type | Required |
|--------|------|----------|
| `template_item_id` | Text | Yes |
| `template_id` | Text | Yes |
| `title` | Text | Yes |
| `note` | Text | No |
| `sort_order` | Number | No |
| `default_status` | Text | No |
| `required` | Yes/No | No |
| `tags_json` | Text | No |
| `schema_version` | Text | No |

---

## CHECKLIST_LAYOUT_STATE

| Column | Type | Required |
|--------|------|----------|
| `layout_state_id` | Text | Yes |
| `task_id` | Text | Yes |
| `checklist_item_id` | Text | No | empty = list-level row |
| `expanded` | Yes/No | No |
| `last_opened_at` | Datetime | No |
| `updated_at` | Datetime | No |
| `source` | Text | No |
| `schema_version` | Text | No |

List-level `archived_visible` may be stored as `checklist_item_id` = `__list__` convention.

---

## Stays local (UI-only) after bridge

| Concern | Reason |
|---------|--------|
| Derived `inlineActions` | Computed read model |
| Panel auto-compose flags | Ephemeral UX |
| Template picker open/closed | Ephemeral UX |

---

## Schema version

All new tabs: `schema_version = "1"` on bootstrap. Breaking changes increment version + migration script (future phase).
