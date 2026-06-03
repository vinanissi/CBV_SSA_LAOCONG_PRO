# Smart Checklist Item Contract

**Version:** 1.0  
**Phase:** `PHASE_CHECKLIST_01_SMART_CHECKLIST`  
**Status:** ACCEPTED (foundation — UI / read-model only)

---

## Purpose

Define the **first-class Smart Checklist Item** shape for Work Inbox / Case Workspace rendering. This contract does **not** introduce new persistence tables.

---

## SmartChecklistItem

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | string | yes | Maps from `checklistId` (legacy) |
| `taskId` | string | yes | Parent task — execution root unchanged |
| `title` | string | yes | Operator-visible label |
| `status` | `todo` \| `done` \| `blocked` \| `skipped` \| string | yes | Legacy `open` → `todo`; `isDone` → `done` |
| `note` | string | no | Summary / NOTE column when present |
| `responseCount` | number | yes | Default `0` until feedback phase |
| `attachmentCount` | number | yes | Default `0` until attachment phase |
| `linkCount` | number | yes | Default `0` until link phase |
| `updatedBy` | string \| null | no | From row when available |
| `updatedAt` | string \| null | no | ISO timestamp; UI shows `chưa có` when absent |

---

## Adapter rules

- **Source:** `WorkInboxChecklistItem` (Worker / GAS `TASK_CHECKLIST` projection).
- **Non-destructive:** Does not mutate API payloads or sheet rows.
- **Idempotent:** `adapt(adapt(x))` equivalent to `adapt(x)` for supported fields.
- **Null-safe:** Missing optional fields use defaults above.

---

## Out of scope (later phases)

- Feedback threads (`PHASE_CHECKLIST_02_FEEDBACK`)
- Attachment upload (`PHASE_CHECKLIST_03_ATTACHMENTS`)
- Link editor (`PHASE_CHECKLIST_04_LINKS`)
- History engine (`PHASE_CHECKLIST_05_HISTORY`)
- Action runtime (`PHASE_CHECKLIST_06_ACTION_RUNTIME`)
- `CHECKLIST_*` tables / schema migration

---

## Governance

- **Task** remains execution root.
- **Case** remains projection layer.
- **Checklist ≠ Task** — do not promote checklist items to tasks without separate owner, deadline, status, follow-up, and responsibility.

---

## Implementation reference

- Types: `apps/workboard/src/modules/task/inbox/checklist/smartChecklistTypes.ts`
- Adapter: `apps/workboard/src/modules/task/inbox/checklist/adaptToSmartChecklistItem.ts`
- UI row: `apps/workboard/src/modules/task/inbox/checklist/SmartChecklistItemRow.tsx`
