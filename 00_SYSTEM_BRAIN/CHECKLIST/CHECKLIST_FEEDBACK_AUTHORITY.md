# Checklist Feedback Authority

**Version:** 1.0  
**Phase:** `PHASE_CHECKLIST_02_FEEDBACK`  
**Extends:** `CHECKLIST_SMART_RUNTIME_AUTHORITY.md`

---

## Definition

**Checklist feedback** = short operational notes recorded **in context of one checklist item** while processing work.

---

## Authority rules

1. **Task remains execution root** — feedback does not create tasks or change `TASK_MAIN`.
2. **Checklist ≠ Task** — feedback is not a substitute for assignment, deadline, or ownership.
3. **Read model first** — phase 02 uses client-local storage; server contract may follow in a later phase without redesigning this UI.
4. **Not a comment system** — no threads, @mentions, or global discussion module required for routine notes.
5. **Not timeline replacement** — optional future sync to timeline is additive; not implemented here.

---

## Operator UX authority

- Expand/collapse via **💬 N phản hồi** control (inline, no modal).
- **+ Thêm phản hồi** opens compact composer in place.
- Timestamps shown as **HH:mm** in stream order (ascending).

---

## Diagnostics

`runChecklistFeedbackRuntimeChecks()` in `checklistFeedbackChecks.ts`.

---

## Next phase

`PHASE_CHECKLIST_03_ATTACHMENTS` — wire `attachmentCount` (do not remove feedback runtime).
