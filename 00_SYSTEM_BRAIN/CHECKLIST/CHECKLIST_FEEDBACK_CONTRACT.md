# Checklist Feedback Contract

**Version:** 1.0  
**Phase:** `PHASE_CHECKLIST_02_FEEDBACK`  
**Status:** ACCEPTED (UI / local runtime — no new persistence tables)

---

## Purpose

Operational **processing notes** attached to a checklist item. Not a task, forum, or workflow object.

---

## ChecklistFeedback

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | string | yes | Unique per feedback entry |
| `checklistItemId` | string | yes | Parent checklist item (`checklistId`) |
| `author` | string \| null | no | Operator display label |
| `message` | string | yes | Processing note text |
| `createdAt` | string \| null | no | ISO timestamp; UI shows `HH:mm` |

---

## SmartChecklistItem extension

```text
SmartChecklistItem {
  ...
  responseCount: number   // = feedback.length when enriched
  feedback?: ChecklistFeedback[]
}
```

Defaults: `feedback = []`, `responseCount = 0`.

---

## Runtime (phase 02)

| Concern | Implementation |
|---------|----------------|
| Storage | Browser `localStorage` key `cbv-checklist-feedback:v1:{taskId}` |
| Add | `useChecklistFeedbackRuntime.addFeedback` |
| Enrich | `enrichSmartChecklistWithFeedback` |
| Clear on item delete | `clearFeedbackForItem` |

Server-side / GAS persistence is **out of scope** for this phase.

---

## Out of scope

Attachments, links, history engine, task promotion, workflow, agents, `CHECKLIST_FEEDBACK_TABLE`.

---

## Implementation reference

- `checklistFeedbackTypes.ts`
- `checklistFeedbackLocalStore.ts`
- `ChecklistFeedbackPanel.tsx`
- `useChecklistFeedbackRuntime.ts`
