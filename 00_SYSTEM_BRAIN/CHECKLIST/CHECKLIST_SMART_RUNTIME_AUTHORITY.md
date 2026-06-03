# Smart Checklist Runtime Authority

**Version:** 1.0  
**Phase:** `PHASE_CHECKLIST_01_SMART_CHECKLIST`  
**Extends:** `CASE_RUNTIME_AUTHORITY_V1.md`, existing Work Inbox checklist runtime

---

## Layer model

| Layer | Role | This phase |
|-------|------|------------|
| Task | Execution root | Unchanged — mutations via existing checklist API |
| Case | Operational context / projection | Checklist slice may include smart metadata (counts as placeholders) |
| Checklist | Execution support | Smart item foundation in UI + adapter |

---

## Authority rules

1. **No new persistence tables** — `CHECKLIST_MAIN`, `CHECKLIST_RESPONSE_TABLE`, etc. are forbidden unless a future ADR approves them.
2. **Read model first** — `SmartChecklistItem` is derived at render/projection time from existing `WorkInboxChecklistItem` rows.
3. **Placeholder counts** — `responseCount`, `attachmentCount`, `linkCount` default to `0` until dedicated phases wire real sources.
4. **Backward compatibility** — Legacy checkbox-only rows must render without errors.
5. **Operator UX** — Compact metadata line under title; note shown only when non-empty.

---

## Allowed mutations (unchanged)

Create / update title / toggle done / soft-delete via existing Work Inbox checklist endpoints. This phase does **not** add note-edit UI or count mutations.

---

## Diagnostics

Static suite: `runSmartChecklistFoundationChecks()` in `smartChecklistChecks.ts`.

---

## Next phases (not executed here)

`PHASE_CHECKLIST_02_FEEDBACK` → `PHASE_CHECKLIST_06_ACTION_RUNTIME` per checklist roadmap manifest.
