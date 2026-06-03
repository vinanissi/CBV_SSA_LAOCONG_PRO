# Checklist Template Contract

**Version:** 1.0  
**Phase:** `PHASE_CHECKLIST_07_TEMPLATE_RUNTIME`

---

## ChecklistTemplate

| Field | Type | Required |
|-------|------|----------|
| `id` | string | yes |
| `name` | string | yes |
| `description` | string \| null | no |
| `category` | string \| null | no |
| `version` | string \| null | no |
| `items` | ChecklistTemplateItem[] | yes (default `[]`) |
| `isActive` | boolean | no (default true) |
| `createdBy` | string \| null | no |
| `createdAt` | string \| null | no |
| `updatedAt` | string \| null | no |

---

## ChecklistTemplateItem

| Field | Type | Default |
|-------|------|---------|
| `id` | string | required |
| `title` | string | required |
| `note` | string \| null | — |
| `sortOrder` | number | template index |
| `defaultStatus` | string | `todo` |
| `required` | boolean | false |
| `tags` | string[] | `[]` |

---

## ChecklistTemplateApplyOperation

| Field | Notes |
|-------|-------|
| `mode` | `append` only in phase 07 |
| `createdChecklistItemIds` | IDs created on task checklist |

---

## Apply rules

- **Default:** `append` — never delete existing checklist items
- Creates rows via existing `createWorkInboxChecklistItem` API
- Optional note → CRUD overlay; `defaultStatus: done` → toggle API

---

## Storage

Static seed: `checklistTemplateLibrary.ts` (in-bundle read model). No `CHECKLIST_TEMPLATE_TABLE` in this phase.
