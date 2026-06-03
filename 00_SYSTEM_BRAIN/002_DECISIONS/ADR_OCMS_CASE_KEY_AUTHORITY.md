# ADR — OCMS Case Key Authority

- **ID**: ADR_OCMS_CASE_KEY_AUTHORITY
- **Date**: 2026-05-31
- **Status**: **ACCEPTED** (implementation `PHASE_OCMS_02D_CASE_KEY_AUTHORITY`)
- **Supersedes**: deferred `PHASE_OCMS_01_CASE_KEY_CONVENTION` (identity rules now authoritative here)
- **Extends**: `ADR_OCMS_READ_MODEL_CONTRACT_ADDENDUM.md`, `ADR_OCMS_CASE_DISCOVERY_AUTHORITY.md`
- **Related**: `OCMS_CASE_KEY_AUTHORITY.md`, `PHASE_OCMS_02D_CASE_KEY_AUTHORITY_REPORT.md`

---

## Context

OCMS read model, discovery, and strip specs referenced **Case Key** patterns (`OPERATIONS:TASK:{id}`, `HO_SO:{id}`, …) without a binding identity authority. `PHASE_OCMS_01_CASE_KEY_CONVENTION` remained on the roadmap unexecuted. OCMS_03 implementers need unambiguous rules before derive logic ships.

---

## Decision

1. **Case Key** is a **logical, read-session identity string** on `CaseReadModel.caseKey` — **not** a persisted column, **not** CASE_MAIN, **not** a generated UUID service.

2. **Canonical form:** `{NAMESPACE}:{KIND}:{SOURCE_ID}` — machine-readable ASCII; operator meaning via `title` and relations, **not** raw key in strip (visibility ADR).

3. **Assignment timing:** At **discovery + derive** when a primary `CaseReadModel` is produced; stable for the Focus session unless anchors or explicit manual override change.

4. **Derivation is default; manual override is exceptional** — `MANUAL_CASE_KEY` wins discovery precedence when valid; otherwise key is **derived** from winning anchor per `OCMS_CASE_DISCOVERY_AUTHORITY.md`.

5. **Immutability (V0 read model):** Case Key is **not operator-editable** and has **no write API**. Re-derivation on Focus task switch or anchor refresh may yield a different key — not a “migration” event.

6. **Shared keys allowed:** Multiple source records (e.g. several TASK rows) **may** map to the same Case Key when they share the same winning anchor (e.g. same `HO_SO_ID`).

7. **Unresolved key:** Do not invent IDs. Discovery outcome `NONE` or omit `caseKey` with `diagnostics.warnings` including `CASE_KEY_UNRESOLVED` semantics — no primary model with fake key.

8. **Generation authority:** **OCMS Case Key Authority** (`OCMS_CASE_KEY_AUTHORITY.md`) owns namespace table and validation rules. **Discovery** selects anchor; **derive** composes key. No separate identifier microservice in V0.

9. **DOC-ONLY this phase** — no schema, API, persistence, runtime code.

---

## Non-goals

- CASE_MAIN, CASE_TABLE, CASE_SERVICE, CASE_API
- Key generation service / UUID allocator
- Migration scripts
- Operator-facing key editor

---

## Risks

| Risk | Mitigation |
|------|------------|
| Legacy IDs not matching pattern | Validation + warnings; allow passthrough ID segment |
| OCMS_01 roadmap duplicate | 02D supersedes 01 for identity; 01 row retained with note |
| Key drift on re-read | Document session stability + re-derive rules |

---

## Impact

| Consumer | Uses Case Key authority |
|----------|-------------------------|
| OCMS_03 derive | Compose `caseKey` after discovery |
| Discovery (02C) | Winner → key pattern |
| Read model contract §4.1 | Binding reference |
| Future persistence eval (OCMS_05) | Logical key precedes storage decision |

---

*Append-only ADR.*
