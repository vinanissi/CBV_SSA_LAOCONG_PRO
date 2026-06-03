# PHASE_DATA_REL_04 — HO_SO Relation Authority Decision

**Result:** DECISION_LOCKED (hybrid A+B; deprecate C)  
**Date:** 2026-06-03  
**Branch:** `phase/data-relationship-refactor-prep`  
**Prerequisites:** `PHASE_DATA_REL_03_FINANCE_RELATION_REPAIR` (PLAN_ONLY)  
**ADR:** `00_SYSTEM_BRAIN/002_DECISIONS/ADR_HO_SO_RELATION_AUTHORITY.md`

---

## 1. Summary

Audited repo docs, GAS HO_SO services, bootstrap schema, and workbook drift. **Canonical authority** is the **hybrid** already implemented in GAS:

- **Master–master:** `FROM_HO_SO_ID` + `TO_HO_SO_ID` → `HO_SO_MASTER.ID`
- **Polymorphic link:** `HO_SO_ID` + `RELATED_TABLE` + `RELATED_RECORD_ID`

Workbook-only **`FROM_TYPE` / `FROM_ID` / `TO_TYPE` / `TO_ID`** are **not** authority. They must be normalized into the hybrid model (migration plan only — no sheet writes in this phase).

---

## 2. Audit: who uses which model?

| Layer | Model A (FROM/TO master) | Model B (RELATED_*) | Model C (FROM_TYPE/TO_TYPE) |
|-------|--------------------------|---------------------|-----------------------------|
| Workbook (audit) | Columns empty | — | **Populated** (18 rows) |
| `90_BOOTSTRAP_SCHEMA.js` | Required columns | In manifest cols 12–13 | **Absent** |
| `90_BOOTSTRAP_AUDIT_SCHEMA.js` | FK rules on FROM/TO/HO_SO_ID | optionalColumns | **Absent** |
| `10_HOSO_SERVICE.js` `createHoSoRelation` | **Writes** FROM/TO | Optional RELATED_* | No |
| `10_HOSO_SERVICE.js` `addHosoRelation` | Sets FROM; TO if `RELATED_TABLE=HO_SO` | **Requires** RELATED_* | No |
| `10_HOSO_REPOSITORY.js` / `getHosoRelations` | Filter on FROM/TO/HO_SO_ID | Reads RELATED_* | No |
| AppSheet (`APPSHEET_DETAIL_VIEWS`, forms) | Inline filter FROM/TO | Partial | No |
| `02_MODULES/HO_SO/DATA_MODEL.md` | Documented | Documented | **Not documented** |
| Workboard / Worker API | No HO_SO_RELATION writes | No | No |

**Verdict:** Runtime authority = **A+B**. Workbook operational truth today = **C** (drift from repo).

---

## 3. Decision (locked)

See ADR. Short form:

1. **Writes (GAS / future Worker):** Only A and/or B.  
2. **Reads:** Prefer B for external links; A for master–master; resolve display via `RELATED_TABLE` whitelist + `getHosoRelations` filters.  
3. **C columns:** Deprecate; migrate to B (typical) or A (both ends `HO_SO_MASTER`).  
4. **No dual authority:** Do not populate C and A/B with different semantics for the same row.

---

## 4. Workbook vs repo (findings)

| Finding | Class | Action |
|---------|-------|--------|
| `FROM_HO_SO_ID` / `TO_HO_SO_ID` empty, typed cols filled | Naming / authority drift | Migration M-HO-1 (normalize) |
| Satellites (`HO_SO_XA_VIEN`, `HO_SO_PHUONG_TIEN`, `HO_SO_TAI_XE`) as relation endpoints | Valid domain | Extend `HOSO_RELATION_TABLE_TO_SHEET` before validate (M-HO-3) |
| `HO_SO_ID` on relation row | Context anchor | Set to owning `HO_SO_MASTER.ID` when migrating from C |

---

## 5. Migration plan (no execution in this phase)

### M-HO-0 — Inventory

Export `HO_SO_RELATION` with all columns. Classify each row:

| Class | Rule |
|-------|------|
| `MASTER_EDGE` | Both ends resolve to `HO_SO_MASTER.ID` |
| `ANCHOR_LINK` | One master anchor + external target |
| `SATELLITE_EDGE` | One or both ends are satellite sheet ids |
| `UNRESOLVED` | No master anchor found |

### M-HO-1 — Normalize C → B (default)

For each row with `FROM_TYPE` / `FROM_ID` populated:

```
HO_SO_ID          := <master anchor HO_SO_MASTER.ID>
RELATED_TABLE     := map(FROM_TYPE)  -- see table below
RELATED_RECORD_ID := FROM_ID
RELATION_TYPE     := keep existing
STATUS            := keep existing
```

If `TO_TYPE` / `TO_ID` represent the **other** endpoint (not the anchor link target):

- Option 1: Second row (reverse link) with swapped anchor semantics.  
- Option 2: If `TO_TYPE=HO_SO_MASTER`, set `TO_HO_SO_ID=TO_ID` and use model **A** instead.

| `FROM_TYPE` (workbook) | `RELATED_TABLE` (canonical) | Prerequisite |
|------------------------|-----------------------------|--------------|
| `HO_SO_MASTER` | Prefer model **A** (`FROM_HO_SO_ID`/`TO_HO_SO_ID`) | Both ids in master |
| `HO_SO_XA_VIEN` | `HO_SO_XA_VIEN` | Sheet in `CBV_CONFIG.SHEETS` + whitelist |
| `HO_SO_PHUONG_TIEN` | `HO_SO_PHUONG_TIEN` | Same |
| `HO_SO_TAI_XE` | `HO_SO_TAI_XE` | Same |
| `TASK`, `DON_VI`, … | Same token | Already in `HOSO_RELATION_TABLE_TO_SHEET` |

Clear `FROM_TYPE`, `TO_TYPE`, … only **after** validation pass and admin sign-off (optional archive columns).

### M-HO-2 — Normalize C → A (subset)

When audit shows **both** `FROM_TYPE` and `TO_TYPE` = `HO_SO_MASTER` (or equivalent):

```
FROM_HO_SO_ID := FROM_ID
TO_HO_SO_ID   := TO_ID
HO_SO_ID      := FROM_HO_SO_ID
```

### M-HO-3 — Runtime whitelist extension (code phase)

In `10_HOSO_CONSTANTS.js` / `00_CORE_CONFIG.js`:

- Register satellite sheet names.  
- Map to validation in `hosoValidateRelationTarget`.

### M-HO-4 — AppSheet

- Inline views: continue `[FROM_HO_SO_ID]` / `[TO_HO_SO_ID]` for master edges.  
- Add slice or format rule for `RELATED_TABLE` / `RELATED_RECORD_ID` rows where FROM/TO blank.  
- Hide or read-only `FROM_TYPE` columns on forms.

### Rollback

- Keep M-HO-0 CSV; restore typed columns from backup if normalized values wrong.

---

## 6. Authority doc updates (deferred)

| File | Update |
|------|--------|
| `02_MODULES/HO_SO/DATA_MODEL.md` | State C deprecated; point to ADR |
| `04_APPSHEET/APPSHEET_TABLE_READY_CHECKLIST.md` | Add RELATED_* readiness |
| `01_SCHEMA/HO_SO_RELATION_SCHEMA.md` | **Create** when schema pack catches up (missing today) |

---

## 7. Findings fixed

| Finding | Action |
|---------|--------|
| Competing HO_SO relation models | ADR + locked hybrid decision |
| Workbook vs GAS ambiguity | Classified C as non-authority + migration path |
| No ADR | `ADR_HO_SO_RELATION_AUTHORITY.md` |

---

## 8. Findings deferred

| Finding | Phase |
|---------|--------|
| Workbook row normalization | M-HO-1/2 after export |
| Satellite sheets in `CBV_CONFIG` | M-HO-3 / PHASE 05 guards |
| Bidirectional single-row graph | Future schema only if required |
| `01_SCHEMA/HO_SO_RELATION_SCHEMA.md` | Doc pack |

---

## 9. Static inspection

```bash
node 09_AUDIT/scripts/hosoRelationPhase04Checks.mjs
```

**2026-06-03:** `GO_WITH_WARNINGS` — manifest lacks `FROM_TYPE`; GAS paths use A+B only.

---

## 10. Tests run

| Command | Result |
|---------|--------|
| `node 09_AUDIT/scripts/hosoRelationPhase04Checks.mjs` | GO_WITH_WARNINGS |
| Workbook row classification | Not run (xlsx not in repo) |
| `npm run typecheck` | Not required (no code change) |

---

## 11. Risks / rollback

| Risk | Mitigation |
|------|------------|
| Losing satellite edge semantics when forcing master FKs | Use model B, not A, for satellite endpoints |
| AppSheet inline hides RELATED rows | Update filters in M-HO-4 |
| Two-row duplication for undirected edges | Document in operator guide |

---

## 12. Next recommended phase

**PHASE_DATA_REL_05 — Runtime Guard Audit** (user/DON_VI/finance/HO_SO write validation).

---

## 13. Files changed (PHASE 04)

| File | Change |
|------|--------|
| `09_AUDIT/PHASE_DATA_REL_04_HO_SO_RELATION_AUTHORITY_DECISION.md` | **NEW** |
| `00_SYSTEM_BRAIN/002_DECISIONS/ADR_HO_SO_RELATION_AUTHORITY.md` | **NEW** |
| `09_AUDIT/scripts/hosoRelationPhase04Checks.mjs` | **NEW** |
| `00_SYSTEM_BRAIN/006_PHASES/PHASE_REGISTRY.md` | Registry row |
