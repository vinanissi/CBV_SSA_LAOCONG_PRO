# Checklist Inline Action Runtime Notes

**Phase:** `PHASE_CHECKLIST_03B_INLINE_ACTIONS`

---

## Components

| Component | Role |
|-----------|------|
| `ChecklistInlineActionRow` | Chip toolbar |
| `ChecklistItemLatestPreview` | Collapsed latest feedback/attachment |
| `SmartChecklistItemRow` | Orchestrates expand + autoCompose |
| `deriveChecklistInlineActions` | Read-model derivation |

---

## Interaction flow

```text
Click 💬 Phản hồi
  → feedbackExpanded=true, attachmentExpanded=false
  → feedbackAutoCompose=true (if allowMutate)
  → ChecklistFeedbackPanel autoCompose opens textarea

Click latest preview line
  → opens view-only (no autoCompose)
```

---

## Regression scope

- Feedback localStorage unchanged
- Attachment localStorage unchanged
- Task checklist API unchanged
