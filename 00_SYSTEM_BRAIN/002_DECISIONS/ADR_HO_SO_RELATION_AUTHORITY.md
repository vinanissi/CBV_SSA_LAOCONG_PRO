# ADR: HO_SO_RELATION authority model

**Status:** Accepted  
**Date:** 2026-06-03  
**Phase:** `PHASE_DATA_REL_04_HO_SO_RELATION_AUTHORITY`  
**Context:** `09_AUDIT/DATA_RELATIONSHIP_AUDIT_REPORT_20260603.md`

---

## Context

`HO_SO_RELATION` (18 rows in audited workbook) exposes **three** overlapping shapes:

| Shape | Columns | Repo / workbook |
|-------|---------|-----------------|
| A. Master–master | `FROM_HO_SO_ID`, `TO_HO_SO_ID` | In `90_BOOTSTRAP_SCHEMA.js`, GAS `createHoSoRelation`, AppSheet inline filters |
| B. Polymorphic link | `HO_SO_ID`, `RELATED_TABLE`, `RELATED_RECORD_ID` | GAS `addHosoRelation`, `10_HOSO_VALIDATION.js` whitelist |
| C. Typed graph (workbook) | `FROM_TYPE`, `FROM_ID`, `TO_TYPE`, `TO_ID` | Populated in workbook; **empty** `FROM_HO_SO_ID` / `TO_HO_SO_ID`; **not** in schema manifest |

Keeping A, B, and C as competing write authorities causes orphan refs and split read paths.

---

## Decision

**Single canonical model = A + B (hybrid), not C.**

1. **Master–master edges** use `FROM_HO_SO_ID` and `TO_HO_SO_ID` (both → `HO_SO_MASTER.ID`). Optional `HO_SO_ID` = context (default `FROM_HO_SO_ID`).
2. **Links to non-master entities** use anchor `HO_SO_ID` (→ `HO_SO_MASTER.ID`) plus `RELATED_TABLE` + `RELATED_RECORD_ID` (validated whitelist in `HOSO_RELATION_TABLE_TO_SHEET`).
3. **`FROM_TYPE` / `FROM_ID` / `TO_TYPE` / `TO_ID`** are **not** authority. They are workbook-local columns to be **normalized** into (1) or (2) via migration, then treated read-only/deprecated.

**Do not** run a migration that only fills `FROM_HO_SO_ID`/`TO_HO_SO_ID` from master ids when the edge is satellite↔satellite — that would misrepresent the graph.

---

## Consequences

### Positive

- Aligns production writes with existing GAS (`10_HOSO_SERVICE.js`) and audit FK rules (`90_BOOTSTRAP_AUDIT_SCHEMA.js`).
- AppSheet docs (`FROM_HO_SO_ID` / `TO_HO_SO_ID` filters) remain valid for master–master rows.
- Workbook typed graph can be preserved semantically via `RELATED_TABLE` extension.

### Negative / follow-up

- Extend `HOSO_RELATION_TABLE_TO_SHEET` + `CBV_CONFIG.SHEETS` for satellite sheets (`HO_SO_XA_VIEN`, `HO_SO_PHUONG_TIEN`, `HO_SO_TAI_XE`) before validating migrated rows.
- Bidirectional typed edges may require **one relation row per direction** or a future `TO_RELATED_*` pair (out of scope unless graph queries need single-row bidirectional).
- `02_MODULES/HO_SO/DATA_MODEL.md` should add explicit “no FROM_TYPE authority” note (doc sweep).

---

## Rejected alternatives

| Alternative | Why rejected |
|-------------|--------------|
| **C only** (typed graph as canonical) | No GAS write path; contradicts bootstrap manifest and audit FK definitions |
| **A only** (master–master) | Cannot represent vehicle/driver/member edges without fake `HO_SO_MASTER` rows |
| **Dual authority (A+B+C)** | Workbook already shows empty master FK columns while typed cols are filled — guarantees drift |

---

## Migration principle (data)

Normalize workbook rows **C → B** (preferred) or **C → A** when both endpoints are `HO_SO_MASTER`:

| Workbook `FROM_TYPE` | Canonical `RELATED_TABLE` (anchor = `HO_SO_ID`) |
|----------------------|--------------------------------------------------|
| `HO_SO_MASTER` | Use `createHoSoRelation` / fill `FROM_HO_SO_ID`+`TO_HO_SO_ID` instead |
| `HO_SO_XA_VIEN` | `HO_SO_XA_VIEN` (after sheet registered in config) |
| `HO_SO_PHUONG_TIEN` | `HO_SO_PHUONG_TIEN` |
| `HO_SO_TAI_XE` | `HO_SO_TAI_XE` |

Details: `09_AUDIT/PHASE_DATA_REL_04_HO_SO_RELATION_AUTHORITY_DECISION.md`.

---

## References

- `05_GAS_RUNTIME/90_BOOTSTRAP_SCHEMA.js` — `HO_SO_RELATION` column order
- `05_GAS_RUNTIME/10_HOSO_SERVICE.js` — `addHosoRelation`, `createHoSoRelation`
- `02_MODULES/HO_SO/DATA_MODEL.md`
- `09_AUDIT/DATA_RELATIONSHIP_AUDIT_REPORT_20260603.md`
