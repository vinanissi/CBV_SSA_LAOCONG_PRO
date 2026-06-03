# PHASE_OCMS_00A_CASE_RESPONSIBILITY_MEMORY_MODEL — Handoff

**Status:** DOC-ONLY complete  
**Date:** 2026-05-31  
**Branch:** `phase/ocms-foundation-v1`  
**Verdict:** **GO**

---

## What was delivered

- **CRM strategic core** documented: Case + Responsibility + Memory (internal triad — not Customer Relationship Management).
- ADR addendum extending `ADR_OCMS_FOUNDATION.md` without override.
- Extended domain doc: `OCMS_CASE_RESPONSIBILITY_MEMORY_MODEL.md`.
- Roadmap v0.2 with `PHASE_OCMS_00A` before `PHASE_OCMS_01`.
- No runtime, schema, API, or UI changes.

---

## Key files for next agent

| Role | Path |
|------|------|
| CRM ADR addendum | `00_SYSTEM_BRAIN/002_DECISIONS/ADR_OCMS_FOUNDATION_CRM_ADDENDUM.md` |
| CRM model | `00_SYSTEM_BRAIN/OCMS/OCMS_CASE_RESPONSIBILITY_MEMORY_MODEL.md` |
| Baseline domain (V0.1) | `00_SYSTEM_BRAIN/OCMS/OCMS_DOMAIN_MODEL.md` |
| Roadmap | `00_SYSTEM_BRAIN/OCMS/OCMS_ROADMAP.md` |
| Foundation ADR (unchanged) | `00_SYSTEM_BRAIN/002_DECISIONS/ADR_OCMS_FOUNDATION.md` |
| Work Inbox authority | `00_SYSTEM_BRAIN/UI_UX/CBV_WORK_INBOX_V3/900_AUTHORITY/000_DESIGN_AUTHORITY.md` |

---

## Constraints to preserve

1. Work Inbox V3 — `/inbox`, groups, Focus unchanged unless separate charter.
2. No `CASE_MAIN` until `PHASE_OCMS_05_CASE_REGISTRY_EVAL` + new ADR.
3. Task writes remain `TASK_MAIN` per task ADR.
4. CRM roles are not reducible to `ASSIGNEE_ID` in design docs or future UI copy.
5. Memory views must include checklist + attachments, not timeline-only.

---

## Suggested next phase

`PHASE_OCMS_01_CASE_KEY_CONVENTION` — define Case Key with CRM Case definition:

- Anchor examples: `HO_SO_ID`, task cluster, alert-only matter.
- Document mapping table Case Key ↔ Work Items ↔ Memory sources.

---

## Operator review (optional)

1. Confirm five responsibility roles match org practice (Vietnamese labels for UI later).
2. Confirm eight memory types cover pilot workflows (add Decision/Handoff conventions if needed).
3. Approve proceeding to Case Key convention.

---

## Runtime / deploy

**None** — documentation only. `RUNTIME_STATE: NOT_WIRED`.

---

*Handoff for OCMS foundation branch.*
