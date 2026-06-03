# Checklist History Runtime Notes

**Phase:** `PHASE_CHECKLIST_05_HISTORY`

---

## Captured events (automatic)

| Action | Type | Source |
|--------|------|--------|
| Toggle done/open | `checklist_status_changed` | `checklist_runtime` |
| Add feedback | `feedback_added` | `feedback_runtime` |
| Add/remove attachment | `attachment_added` / `attachment_removed` | `attachment_runtime` |
| Add/remove link | `link_added` / `link_removed` | `link_runtime` |
| Manual note in history panel | `manual_history_note_added` | `local` |

## Not captured in this phase

- `note_updated` (checklist item note field edits)
- Backend-synced audit trail
- Cross-device history

## UX

- Inline chip: `🕒 Lịch sử N` (fifth chip after feedback, attachment, link)
- Panel lists newest-first; `+ Thêm ghi chú lịch sử` for operator notes
- Latest preview line when all panels collapsed

## Limitations

- Data is per-browser `localStorage`; clearing site data loses history
- Delete checklist item clears history for that item id
