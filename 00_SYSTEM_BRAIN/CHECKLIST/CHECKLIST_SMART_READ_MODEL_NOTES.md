# Smart Checklist Read Model Notes

**Phase:** `PHASE_CHECKLIST_01_SMART_CHECKLIST`

---

## Derivation path

```text
TASK_CHECKLIST row (GAS / sheet)
  → WorkInboxChecklistItem (Worker contract)
  → adaptToSmartChecklistItem()
  → SmartChecklistItem (UI)
  → projectChecklist() → CaseChecklistItem (Case runtime slice)
```

---

## Case projection extensions

`CaseChecklistItem` gains optional fields aligned with smart foundation:

- `note`, `responseCount`, `attachmentCount`, `linkCount`, `updatedAt`

Values come from the same adapter; counts remain `0` until later phases.

---

## Empty states

| Condition | UI behavior |
|-----------|-------------|
| No items | Hint: add first item |
| No note | Note line hidden |
| No `updatedAt` | Meta shows `Cập nhật: chưa có` |
| Missing counts | Treated as `0` |

---

## Diagnostics codes (Case)

Existing `NO_CHECKLIST` unchanged. Smart metadata does not add new blocking diagnostics in this phase.

---

## Testing

- `runSmartChecklistFoundationChecks()` — adapter + UI contract
- `runCaseReadModelChecks()` — should still pass with extended checklist projection
- `runWorkInboxChecklistRuntimeChecks()` — includes `CHECKLIST_SMART_ROW`
