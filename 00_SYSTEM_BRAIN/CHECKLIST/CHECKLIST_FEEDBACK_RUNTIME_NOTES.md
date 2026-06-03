# Checklist Feedback Runtime Notes

**Phase:** `PHASE_CHECKLIST_02_FEEDBACK`

---

## Data flow

```text
Operator → + Thêm phản hồi
  → useChecklistFeedbackRuntime.addFeedback
  → checklistFeedbackLocalStore (localStorage)
  → enrichSmartChecklistList
  → SmartChecklistItemRow + ChecklistFeedbackPanel
```

Case projection (`projectChecklist`) loads the same local map when `localStorage` is available so `responseCount` stays consistent in read model slices.

---

## Empty states

| State | UI |
|-------|-----|
| 0 feedback, collapsed | `💬 0 phản hồi` only |
| 0 feedback, expanded | "Chưa có phản hồi xử lý." + composer |
| N feedback | Time + message list |

---

## Compatibility

- Legacy checklist rows without feedback: `responseCount = 0`, `feedback = []`.
- Deleting checklist item clears local feedback for that `checklistItemId`.

---

## Limitations (documented)

- Feedback is **per browser** until server API exists.
- Clearing site data removes feedback.
- No edit/delete of individual feedback entries in phase 02 (append-only).

---

## Follow-up

1. GAS/Worker API for durable feedback (optional ADR).  
2. Optional timeline mirror (`CHECKLIST_FEEDBACK` event type) — additive only.  
3. `PHASE_CHECKLIST_03_ATTACHMENTS`.
