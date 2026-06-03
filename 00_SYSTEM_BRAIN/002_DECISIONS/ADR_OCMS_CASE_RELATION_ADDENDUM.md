# ADR Addendum — OCMS Case Relation Model

- **ID**: ADR_OCMS_CASE_RELATION_ADDENDUM
- **Date**: 2026-05-31
- **Status**: **ACCEPTED** (implementation `PHASE_OCMS_01C_CASE_RELATION_MODEL`)
- **Supersedes**: none
- **Extends**: `ADR_OCMS_FOUNDATION.md`, `ADR_OCMS_FOUNDATION_CRM_ADDENDUM.md`, `ADR_OCMS_CASE_TYPE_RESULT_ADDENDUM.md`, `ADR_OCMS_CASE_LIFECYCLE_ADDENDUM.md` (does **not** override)
- **Related**: `OCMS_CASE_RELATION_MODEL.md`, `PHASE_OCMS_01C_CASE_RELATION_MODEL_REPORT.md`

---

## Context

OCMS phases 00–01B established Case, CRM, Case Type, Result, and Lifecycle. Operators and future read models still cannot answer which **business entities** a Case links to (xã viên, hồ sơ, phương tiện, đơn vị, giao dịch, hóa đơn, tài liệu) or which relation is **primary** vs secondary.

**Module Projection** reads module data for display. **Attachment** holds evidence in Memory. **Case Key** identifies a Case. None of these substitute for explicit **Case Relation** semantics.

---

## Decision

1. **Case Relation** is a **conceptual link layer** (V0/V0C/V0D): `{ targetType, targetId, role }` binding a Case to business entities — not persisted in this phase.

2. **Four-way separation (binding):**

   | Layer | Purpose | Example |
   |-------|---------|---------|
   | **Case Key** | Case identity convention | `HO_SO:HS-2026-001` |
   | **Case Relation** | Link to business entity | `XA_VIEN:XV-0001` role PRIMARY |
   | **Module Projection** | Read model for UI | Row from `HO_SO_MASTER` |
   | **Attachment (Memory)** | Evidence file/ref | CCCD scan in task attachments |

3. **Target types** (12): XA_VIEN, HO_SO, PHUONG_TIEN, DON_VI, FINANCE_TRANSACTION, INVOICE, DOCUMENT, PERSON, ORGANIZATION, PROJECT, ALERT, TASK — defined in `OCMS_CASE_RELATION_MODEL.md`.

4. **Relation roles** (10): PRIMARY, SECONDARY, SOURCE, TARGET, EVIDENCE_REF, DEPENDENCY, DUPLICATE_OF, CHILD_OF, PARENT_OF, BLOCKED_BY.

5. **Cardinality:** One Case → many Relations; one target → many Cases; at most one PRIMARY per main target **group** per Case (guideline); TASK relation does not replace Work Item model.

6. **No persistence** — no `CASE_MAIN`, `CASE_RELATION` sheet, relation columns on `TASK_MAIN` / attachments.

7. **Work Inbox V3 unchanged** — task links remain task runtime; relations appear in future case read model only.

8. **Future read model** must expose `relations[]` separate from projections and attachments.

---

## Non-goals

- CASE_RELATION table or TASK_MAIN foreign keys
- Replacing HO_SO_ID on task row with relation engine (future binding phase)
- Conflating attachment rows with DOCUMENT relations
- Overriding prior OCMS ADRs

---

## Risks

| Risk | Mitigation |
|------|------------|
| Relation vs projection duplication | Projection = read; Relation = link semantics |
| Too many PRIMARY relations | One PRIMARY per target type group rule |
| TASK relation = Work Item | Document TASK relation as pointer only |
| Case Key encodes all relations | Key ≠ full relation graph |

---

## Future phase impact

| Phase | Impact |
|-------|--------|
| `PHASE_OCMS_01_CASE_KEY_CONVENTION` | Key may reference PRIMARY relation target |
| `PHASE_OCMS_02_READ_MODEL_CONTRACT` | `relations[]`, `primaryRelation` fields |
| `PHASE_OCMS_03_FOCUS_CASE_CONTEXT_STRIP` | Entity chips from PRIMARY relations |
| `PHASE_OCMS_05_CASE_REGISTRY_EVAL` | Persist relations vs derive from task/HO_SO fields |

---

## Consequences

**Positive**

- Cross-module case context without schema shock.
- Clear primary entity for search and dashboards.

**Negative / residual**

- Relations not in production until read-model phase.
- Derivation from legacy task fields needs mapping ADR later.

---

*Append-only ADR addendum.*
