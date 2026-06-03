# ADR — OCMS Case Strip Visibility Rules

- **ID**: ADR_OCMS_CASE_STRIP_VISIBILITY_RULES
- **Date**: 2026-05-31
- **Status**: **ACCEPTED** (implementation `PHASE_OCMS_02A_CASE_STRIP_VISIBILITY_RULES`)
- **Supersedes**: none
- **Extends**: `ADR_OCMS_READ_MODEL_CONTRACT_ADDENDUM.md`, Work Inbox V3 module authority (strip is secondary UI)
- **Related**: `OCMS_CASE_STRIP_VISIBILITY_RULES.md`, `OCMS_READ_MODEL_CONTRACT.md`

---

## Context

`PHASE_OCMS_02_READ_MODEL_CONTRACT` defined **`CaseReadModel`** for derived case context. **OCMS_03** will render a **Case Context Strip** in Focus Mode. Without visibility rules, implementers risk:

- Replacing task header with case metadata
- Showing fake or debug data to operators
- Overwhelming operators with relations/projections
- Leaking private finance fields

---

## Decision

1. **Case Strip is secondary context** — Work Inbox Focus task header remains primary execution UI. Strip sits below or beside header per module authority; never renames task row to "case".

2. **Feature flag required for OCMS_03:** `OCMS_CASE_STRIP_ENABLED` — strip hidden when false.

3. **Four visibility levels:** HIDDEN, MINIMAL, STANDARD, EXPANDED — defined in `OCMS_CASE_STRIP_VISIBILITY_RULES.md`.

4. **Inputs:** Strip consumes **subset** of `CaseReadModel` only — never raw `projections.data`, full `relations[]`, or `diagnostics` JSON in operator view.

5. **Permission gates:**
   - `permissions.canView === false` → **HIDDEN**
   - `permissions.canOpenRelated === false` → labels only, no deep links
   - `permissions.canSeePrivateFields === false` → suppress finance-sensitive labels/summaries

6. **Confidence gates:**
   - `diagnostics.confidence` LOW/UNKNOWN → **MINIMAL** or fallback message
   - MANUAL_CASE_KEY with confidence &lt; MEDIUM → "Chưa đủ dữ liệu case."

7. **No fake data** — missing PRIMARY relation → warning text, not invented HO_SO/finance entity.

8. **Source-specific profiles** — TASK_ANCHORED/OPERATIONS compact; HO_SO/FINANCE may use EXPANDED when confidence MEDIUM/HIGH.

9. **DOC-ONLY this phase** — no FE component, hook, API, schema, or `CASE_STRIP` sheet.

---

## Visibility levels (summary)

| Level | When |
|-------|------|
| HIDDEN | canView false; flag off; ALERT orphan with no strip value |
| MINIMAL | LOW confidence; task-only optional compact |
| STANDARD | Default — title, type, lifecycle, primary relation, 1 recent memory |
| EXPANDED | HO_SO/FINANCE MEDIUM+ — target, result, roles, 2–3 recent |

---

## Field display (summary)

**Always eligible:** caseType label, lifecycle.label, title (if ≠ task title duplicate), primary relation label.

**Never in operator strip:** raw caseKey, projection raw data, confidence enum, full diagnostics, debug runtimeState in prod.

Detail: visibility spec §6–§7.

---

## Non-goals

- Case Strip React component (OCMS_03)
- `useCaseReadModel` hook
- Worker/GAS routes
- CASE_MAIN / CASE_STRIP persistence
- Work Inbox route `/inbox` change

---

## Risks

| Risk | Mitigation |
|------|------------|
| Strip competes with task header | ADR + module authority placement |
| Operator confusion task vs case | Vietnamese labels; no "Case" as row title |
| Finance leak | canSeePrivateFields gate |
| Over-display on OPERATIONS | MINIMAL/STANDARD only |

---

## Impact for OCMS_03

Implementers **must** follow `OCMS_CASE_STRIP_VISIBILITY_RULES.md` field matrix and source profiles. Deviations require ADR amend.

Suggested component contract:

```text
resolveStripVisibility(model: CaseReadModel, flags) → { level, fields[], warnings[] }
```

---

*Append-only ADR.*
