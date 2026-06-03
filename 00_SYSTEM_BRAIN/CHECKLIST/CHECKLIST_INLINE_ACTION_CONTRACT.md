# Checklist Inline Action Contract

**Version:** 1.0  
**Phase:** `PHASE_CHECKLIST_03B_INLINE_ACTIONS`  
**Status:** ACCEPTED (derived UI only — not persisted)

---

## Purpose

Direct affordances on each checklist item that **open or trigger** existing feedback/attachment runtime. Not a workflow or command engine.

---

## ChecklistInlineAction (derived)

| Field | Type | Notes |
|-------|------|-------|
| `id` | string | Stable per item + type |
| `checklistItemId` | string | Parent item |
| `type` | `add_feedback` \| `view_feedback` \| `add_attachment` \| `view_attachment` | |
| `label` | string | e.g. `Phản hồi 2` |
| `enabled` | boolean | |
| `reasonDisabled` | string \| null | |

**Not stored.** Computed via `deriveChecklistInlineActions()`.

---

## SmartChecklistItem extension

```text
inlineActions?: ChecklistInlineAction[]
```

Enriched in `enrichSmartChecklistWithInlineActions` after feedback/attachment merge.

---

## UX rules

1. Visible chips: `[💬 Phản hồi N] [📎 Tài liệu N]`
2. One click → expand panel + auto-compose when `allowMutate`
3. Latest preview when panels collapsed
4. Links / updated-at as secondary meta (not primary actions)

---

## Out of scope

Workflow engine, agent runtime, `CHECKLIST_ACTION_TABLE`, new APIs.
