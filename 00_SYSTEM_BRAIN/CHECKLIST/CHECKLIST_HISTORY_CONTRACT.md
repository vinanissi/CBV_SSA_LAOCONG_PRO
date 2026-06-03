# Checklist History Contract

**Version:** 1.0  
**Phase:** `PHASE_CHECKLIST_05_HISTORY`  
**Status:** ACCEPTED (local append-only runtime)

---

## ChecklistHistoryEntry

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | string | yes | Unique entry id |
| `checklistItemId` | string | yes | Parent checklist item |
| `type` | string | yes | See event types below |
| `message` | string | yes | Operator-facing summary |
| `actor` | string \| null | no | Display name / user id |
| `createdAt` | string \| null | no | ISO timestamp |
| `source` | string | no | `local`, `feedback_runtime`, … |
| `refId` | string \| null | no | Related entity id |
| `refType` | string \| null | no | `feedback`, `attachment`, `link`, `checklist` |
| `metadata` | object | no | Optional extension bag |

### Event types (minimum)

```text
checklist_status_changed
feedback_added
attachment_added
attachment_removed
link_added
link_removed
note_updated
manual_history_note_added
```

---

## SmartChecklistItem extension

```text
history?: ChecklistHistoryEntry[]
historyCount?: number
latestHistoryAt?: string | null
```

Defaults: `history = []`, `historyCount = 0`, `latestHistoryAt = null`.

---

## Storage

`localStorage` key: `cbv-checklist-history:v1:{taskId}`

Append-only per item. Clearing on checklist item delete is allowed.

---

## Out of scope

Global event store, audit DB, workflow engine, agent memory, new tables/APIs.
