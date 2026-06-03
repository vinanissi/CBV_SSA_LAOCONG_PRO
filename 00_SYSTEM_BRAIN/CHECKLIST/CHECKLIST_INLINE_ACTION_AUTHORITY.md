# Checklist Inline Action Authority

**Version:** 1.0  
**Phase:** `PHASE_CHECKLIST_03B_INLINE_ACTIONS`  
**Extends:** `CHECKLIST_FEEDBACK_AUTHORITY.md`, `CHECKLIST_ATTACHMENT_AUTHORITY.md`

---

## Rules

1. **Inline Action ≠ Workflow ≠ Agent** — UI triggers only.
2. **Reuse existing runtimes** — feedback/attachment local stores unchanged.
3. **One-click operator rule** — chip click opens panel with composer ready (when mutable).
4. **No new persistence** — actions derived at render time.
5. **Preserve phase 02/03** — no regression to feedback or attachment data paths.

---

## Diagnostics

`runChecklistInlineActionChecks()` in `checklistInlineActionChecks.ts`

---

## Next phase

`PHASE_CHECKLIST_04_LINKS`
