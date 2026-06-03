# ADR — OCMS Case Discovery Authority

- **ID**: ADR_OCMS_CASE_DISCOVERY_AUTHORITY
- **Date**: 2026-05-31
- **Status**: **ACCEPTED** (implementation `PHASE_OCMS_02C_CASE_DISCOVERY_AUTHORITY`)
- **Supersedes**: none
- **Extends**: `ADR_OCMS_READ_MODEL_CONTRACT_ADDENDUM.md`, `ADR_OCMS_CASE_STRIP_VISIBILITY_RULES.md`, `ADR_OCMS_CASE_STRIP_LAYOUT_AUTHORITY.md`
- **Related**: `OCMS_CASE_DISCOVERY_AUTHORITY.md`, `PHASE_OCMS_02C_CASE_DISCOVERY_AUTHORITY_REPORT.md`

---

## Context

`CaseReadModel` contract (OCMS_02) defines **what** to expose after discovery. Visibility (02A) and layout (02B) define **how** to show it. **Discovery** — determining **whether** a case context exists, **from which anchor**, and **with what confidence** — was implicit in mapping docs but not authoritative.

OCMS_03 implementers need binding rules before `useCaseReadModel` / derive logic ships.

---

## Decision

1. **Case Discovery** is the **read-only resolution step** that produces zero or one **primary** `CaseReadModel` candidate for a Focus task session — no persistence, no write model.

2. **Discovery entry point (binding):** Work Inbox **Focus Mode** with active `taskId` (+ optional explicit `caseKey` override in future). Not inbox list rows; not Right Panel alone.

3. **Discovery sources** (`CaseReadSource`): TASK_ANCHORED, HO_SO_ANCHORED, FINANCE_ANCHORED, ALERT_ANCHORED, MANUAL_CASE_KEY, MIXED — resolved per precedence in `OCMS_CASE_DISCOVERY_AUTHORITY.md`.

4. **One primary context per Focus view** — one task may **candidate** multiple anchors; discovery emits **one winner** + optional `diagnostics.discoveryCandidates[]` (descriptive only).

5. **When context must exist:** Focus open + `permissions.canView` + at least TASK_ANCHORED minimum (task readable).

6. **When context must not surface to operator:** `OCMS_CASE_STRIP_ENABLED` off (no strip; discovery may be skipped in OCMS_03), `canView` false, or discovery outcome `NONE` with no fake fill.

7. **Low confidence:** Surface model with `diagnostics.confidence` LOW/UNKNOWN + warnings; strip visibility → MINIMAL or HIDDEN per visibility ADR — **never** invent HO_SO/finance rows.

8. **No silent fallback** in production — missing anchor → explicit diagnostics; OPERATIONS TASK_ANCHORED only when no higher anchor wins.

9. **DOC-ONLY this phase** — no apps/workers/GAS changes, no CASE_MAIN, no API.

---

## Non-goals

- CASE_MAIN / discovery table
- Multi-case persistence
- OCMS_03 UI implementation
- Automatic case creation writes

---

## Risks

| Risk | Mitigation |
|------|------------|
| Ambiguous MIXED anchors | Precedence table |
| Multiple case keys per task | Single winner + candidates in diagnostics |
| Discovery without live runtime | confidence UNKNOWN + NOT_WIRED |

---

## Impact

| Consumer | Uses discovery |
|----------|----------------|
| OCMS_03 derive | Entry + precedence |
| CaseReadModel mapping | Source field population |
| Strip visibility | Input confidence |

---

*Append-only ADR.*
