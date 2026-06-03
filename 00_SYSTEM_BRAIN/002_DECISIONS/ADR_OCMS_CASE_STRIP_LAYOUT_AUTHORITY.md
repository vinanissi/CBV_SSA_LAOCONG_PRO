# ADR — OCMS Case Strip Layout Authority

- **ID**: ADR_OCMS_CASE_STRIP_LAYOUT_AUTHORITY
- **Date**: 2026-05-31
- **Status**: **ACCEPTED** (implementation `PHASE_OCMS_02B_CASE_STRIP_LAYOUT_AUTHORITY`)
- **Supersedes**: none
- **Extends**: `ADR_OCMS_CASE_STRIP_VISIBILITY_RULES.md`, `ADR_OCMS_READ_MODEL_CONTRACT_ADDENDUM.md`, Work Inbox V3 Focus layout authority
- **Related**: `OCMS_CASE_STRIP_LAYOUT_AUTHORITY.md`, `OCMS_CASE_STRIP_VISIBILITY_RULES.md`

---

## Context

`PHASE_OCMS_02A` defined **what** the Case Context Strip shows (visibility levels, fields, permissions). **OCMS_03** implementers still need binding answers for **where** the strip lives, **how much space** it uses, and **how** it interacts with Focus Main Area vs Right Panel.

Without layout authority, risk includes: strip in Right Panel (hidden context), checklist pushed down excessively, redesign of Focus Mode, or permanent EXPANDED state cluttering operators.

---

## Decision

1. **Default placement:** **Main Area** — immediately **below `CompactTaskHeader`**, **above** AI Summary / Checklist / Attachments / Action Bar.

2. **Not default in Right Panel** for OCMS_03 — Right Panel retains Chi tiết / Timeline / Handoff / Tài liệu. Future "Case" tab requires separate ADR; out of OCMS_03 scope.

3. **Layout stack (binding):**

```text
[CompactTaskHeader]
[CaseContextStrip]          ← OCMS_03, flag-gated
[AI Summary / compact]
[Checklist]
[Attachments / Activity Feed]
[Action Bar]
```

4. **Height budgets by visibility level** (from visibility rules):
   - HIDDEN: 0 — no placeholder
   - MINIMAL: 28–36px, single row
   - STANDARD: 48–72px, 1–2 rows, collapsible
   - EXPANDED: 96–128px, HO_SO/FINANCE MEDIUM+ only, collapsible to STANDARD

5. **Compact-first:** EXPANDED never permanent default after operator collapse; local collapse state allowed (optional localStorage).

6. **Read-only strip:** no mutation buttons; deep links only if `permissions.canOpenRelated`.

7. **Feature flag:** `OCMS_CASE_STRIP_ENABLED === false` → **zero layout delta** (identical to pre-OCMS_03 Focus).

8. **No new surfaces:** no modal, drawer, or separate scroll region for strip in OCMS_03.

9. **DOC-ONLY this phase** — no FE component, hook, or layout code.

---

## Main Area boundary

- Task Header unchanged and primary.
- Case Strip secondary — does not replace header title/actions.
- Checklist remains primary work zone — strip must not dominate vertical space.
- AI Summary not removed.

---

## Right Panel boundary (OCMS_03)

**Must not:** add Case tab, move Timeline/Handoff, change Right Panel IA, embed full CaseReadModel in panel.

---

## Non-goals

- Right Panel Case tab
- Focus Mode redesign
- FE `WorkInboxCaseContextStrip` (OCMS_03)
- Responsive breakpoints beyond documented rules
- CASE_STRIP sheet / persistence

---

## Risks

| Risk | Mitigation |
|------|------------|
| Strip pushes checklist below fold | Height caps + MINIMAL default for OPERATIONS |
| Implementer places strip in Right Panel | ADR placement binding |
| EXPANDED sticky clutter | Collapse to STANDARD + local state |
| Double title with task header | Visibility rules skip duplicate title |

---

## Impact for OCMS_03

Implementers **must** follow `OCMS_CASE_STRIP_LAYOUT_AUTHORITY.md`. Component mounts in Main Area slot only. CSS max-height per level. No layout deviation without ADR amend.

---

*Append-only ADR.*
