# Checklist Attachment Authority

**Version:** 1.0  
**Phase:** `PHASE_CHECKLIST_03_ATTACHMENTS`  
**Extends:** `CHECKLIST_SMART_RUNTIME_AUTHORITY.md`, `CHECKLIST_FEEDBACK_AUTHORITY.md`

---

## Rules

1. **Attachment ≠ Task ≠ Case** — refs stay on checklist item context.
2. **Read model first** — local references until durable API is approved.
3. **No broken links** — render name-only when `url` is absent or invalid.
4. **No upload pipeline** in phase 03 — registration/reference only.
5. **Feedback runtime preserved** — attachments are additive; do not replace feedback UX.

---

## Operator UX

- Toggle **📎 N tài liệu** → list + **+ Thêm tài liệu**
- Compact inline composer (no modal workflow)
- Optional pick from task-level attachments when API returns items

---

## Diagnostics

`runChecklistAttachmentRuntimeChecks()` in `checklistAttachmentChecks.ts`

---

## Next phase

`PHASE_CHECKLIST_04_LINKS` — wire `linkCount` (do not remove attachment runtime).
