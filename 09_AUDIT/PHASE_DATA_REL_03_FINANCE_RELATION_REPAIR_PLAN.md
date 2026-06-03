# PHASE_DATA_REL_03 — Finance Relationship Repair Plan

**Result:** PLAN_ONLY (no workbook mutation in this phase)  
**Date:** 2026-06-03  
**Branch:** `phase/data-relationship-refactor-prep`  
**Prerequisites:** `PHASE_DATA_REL_02_USER_REFERENCE_CLEANUP` (PLAN_ONLY)  
**Audit basis:** `09_AUDIT/DATA_RELATIONSHIP_AUDIT_REPORT_20260603.md`

---

## 1. Summary

Finance data in the audited workbook has two FK weaknesses: **`FINANCE_TRANSACTION.DON_VI_ID = VP54`** (4 rows) does not match any **`DON_VI.ID`**, and **`FINANCE_LOG.FIN_ID`** (8 rows) points at legacy transaction ids (`FIN_20260418_*`) while current transactions use shorter **`FINANCE_TRANSACTION.ID`** values. GAS **`createTransaction`** does **not** validate `DON_VI_ID`; **`logFinance`** only checks that the parent id exists at write time — historical orphans remain readable but break join integrity.

This plan inventories evidence, proposes `VP54` resolution paths, defines log orphan handling, and schedules guards for PHASE 05 — **no sheet writes**.

---

## 2. Workbook findings (audit)

| Issue | Severity | Count | Detail |
|-------|----------|------:|--------|
| `FINANCE_TRANSACTION.DON_VI_ID` → `DON_VI.ID` | Medium | 4 | Value `VP54` not in `DON_VI.ID` set (17 units) |
| `FINANCE_LOG.FIN_ID` → `FINANCE_TRANSACTION.ID` | Medium | 8 | Legacy `FIN_20260418_*` vs current short ids (e.g. `19c98be5`) |
| `FINANCE_LOG.ACTOR_ID` → user | Low | 12× `system` | Covered in PHASE 02 (`UD_SYSTEM` proposal) |

Healthy observations (same audit):

- `FINANCE_TRANSACTION` has 9 rows; statuses `ARCHIVED`, `CANCELLED`, `CONFIRMED`
- Types `EXPENSE`, `INCOME`
- No duplicate `FINANCE_TRANSACTION.ID`

---

## 3. Repo evidence: `VP54`

**No occurrence of `VP54` in repository source** (grep 2026-06-03). It exists only in the external workbook audit export.

### Likely interpretation (hypothesis — requires workbook proof)

| Hypothesis | Evidence in repo | Verification step |
|------------|------------------|-------------------|
| **A. `DON_VI.CODE`** (machine-safe code) | `01_SCHEMA/DON_VI_SCHEMA.md`: column `CODE` is required; `DON_VI_ID` FK doc says target `DON_VI` without specifying ID vs CODE | In workbook: `=FILTER(DON_VI!A:Z, DON_VI!C:C="VP54")` on **CODE** column |
| **B. Legacy short label / AppSheet display** | `83_OPERATIONAL_REFERENCE_RUNTIME.js` resolves teams by `DON_VI_CODE` | Match `VP54` against runtime `DON_VI_CODE` column if present on expanded sheet |
| **C. Obsolete unit id** | Pre-migration shorthand before `DV_*` ids | If no CODE match, treat as **orphan unit ref** |

**Authority rule:** `FINANCE_TRANSACTION.DON_VI_ID` must store **`DON_VI.ID`** per `01_SCHEMA/FINANCE_TRANSACTION_SCHEMA.md` — not `CODE`. If `VP54` is a valid **CODE**, migration maps `VP54` → `DON_VI.ID` for the matching row.

### Proposed mapping procedure (M1)

1. Export `DON_VI` tab: columns `ID`, `CODE`, `SHORT_NAME`, `NAME`, `STATUS`, `IS_DELETED`.
2. Search exact match: `CODE = VP54` OR `SHORT_NAME = VP54` OR `ID = VP54`.
3. If single ACTIVE match by CODE → set `FINANCE_TRANSACTION.DON_VI_ID` := that row’s **`ID`**.
4. If no match → leave row unchanged; set `NOTE` / admin flag `REF_STATUS=ORPHAN_UNIT` (new optional column **only** if approved in schema phase) or document in migration CSV.
5. Re-run audit: all non-empty `DON_VI_ID` ∈ `DON_VI.ID`.

**Do not** auto-map `VP54` without workbook proof — repo has no seed row.

---

## 4. Repo evidence: finance ID generations

Current GAS id factory (`05_GAS_RUNTIME/00_CORE_UTILS.js`):

```javascript
// cbvMakeId('FIN') → FIN_YYYYMMDD_<8 hex>
```

`30_FINANCE_SERVICE.js` `createTransaction` uses `ID: cbvMakeId('FIN')`.

Audit states **current** transaction ids are **short** (8-char style). That implies either:

1. **Manual / import** ids on sheet differ from `cbvMakeId('FIN')`, or  
2. **Id strategy changed** after logs were written, or  
3. **Different environment** wrote transactions vs logs.

**Implication:** Orphan logs are **historical** relative to current PK format — not necessarily a live bug in today’s `logFinance` if parent rows still exist under old ids (unlikely if parents were re-keyed).

### FINANCE_LOG orphan handling (M2)

| Strategy | When to use |
|----------|-------------|
| **Map** | Backup/export shows same transaction row with both old `FIN_20260418_*` and new short `ID` (migration spreadsheet) |
| **Archive** | No parent row for old id; log is read-only history |
| **Synthetic parent** | **Not recommended** — creates fake transactions |

#### Proposed migration map template

```text
old_fin_id,new_fin_id,match_evidence,action
FIN_20260418_xxxxxxxx,19c98be5,TRANS_CODE+AMOUNT+TRANS_DATE,MAP
FIN_20260418_yyyyyyyy,,no parent row,ARCHIVE
```

#### Optional column (future schema phase only)

| Column | Table | Purpose |
|--------|-------|---------|
| `REF_STATUS` | `FINANCE_LOG` | `OK` \| `ORPHANED` \| `MIGRATED` |
| `LEGACY_FIN_ID` | `FINANCE_LOG` | Preserve old `FIN_ID` after remap |

**Do not add columns** without manifest + audit schema update.

#### Rows with valid short `FIN_ID`

Leave unchanged. AppSheet inline: `[FIN_ID] = [FINANCE_TRANSACTION].[ID]` (`04_APPSHEET/03_VIEWS_ACTIONS/APPSHEET_VIEW_MASTER.md`).

---

## 5. Runtime validation audit

**Snapshot at plan write (pre–Phase 05).** Current GAS (after Phase 05): `createTransaction` / `updateDraftTransaction` use `financeAssertOptionalDonViId_`; `logFinance` requires parent row.

| Write path | File | At plan write | After Phase 05 (current) |
|------------|------|---------------|---------------------------|
| `createTransaction` | `30_FINANCE_SERVICE.js` | No DON_VI validate | **`financeAssertOptionalDonViId_`** when non-empty |
| `updateDraftTransaction` | same | No | **`financeAssertOptionalDonViId_`** on patch |
| `logFinance` | same | No parent check | **`_findById(FINANCE_TRANSACTION, finId)`** |
| `createFinanceAttachment` | same | N/A | **Yes** — `_findById(FINANCE_TRANSACTION, data.FINANCE_ID)` |
| `createTask` | `20_TASK_SERVICE.js` | **Yes** — `assertActiveDonViId` | N/A |
| Task system audit | `96_TASK_SYSTEM_AUDIT_REPAIR.js` | TASK_MAIN only | **Does not scan FINANCE_TRANSACTION** |

`donViFindById` (`20_TASK_REPOSITORY.js`) uses `_findById` on **`ID`** column only — passing `VP54` as CODE would fail task validation even if CODE exists.

### PHASE 05 guard proposals

**Items 1–2: implemented in Phase 05.** Remaining:

3. **Extend `96_TASK_SYSTEM_AUDIT_REPAIR` or new `auditFinanceReferences_`:**  
   - `INVALID_FIN_DON_VI_REF`  
   - `ORPHAN_FINANCE_LOG`  
4. **Optional resolver:** `resolveDonViRef_(idOrCode)` → canonical `DON_VI.ID` for imports only (narrow scope).

Worker (`workers/api/src/modules/finance.ts`) uses **mock data** — no sheet FK validation; not production finance authority.

---

## 6. Migration phases

| Step | Action | Mutates data? |
|------|--------|---------------|
| F0 | Export `FINANCE_TRANSACTION`, `FINANCE_LOG`, `DON_VI` | No |
| F1 | Resolve `VP54` → `DON_VI.ID` (§3) | Yes (≤4 cells) |
| F2 | Build old→new `FIN_ID` map or mark orphans (§4) | Yes (≤8 log rows) or metadata only |
| F3 | Deploy GAS guards (PHASE 05) | No |
| F4 | Re-run finance audit function | No |

### Rollback

- F1: Restore `DON_VI_ID` from F0 CSV.  
- F2: Restore `FIN_ID` column snapshot; drop `REF_STATUS` if added.

---

## 7. Findings fixed (this phase)

| Finding | Action |
|---------|--------|
| No finance FK repair plan | This document |
| `VP54` meaning undocumented | Hypothesis table + workbook verification steps |
| Log orphan strategy undefined | MAP vs ARCHIVE decision tree |
| Finance write gaps undocumented | §5 audit table |

---

## 8. Findings deferred

| Finding | Target |
|---------|--------|
| Workbook cell updates | F1–F2 after admin sign-off |
| Finance section in `96_TASK_SYSTEM_AUDIT_REPAIR` | Dedicated audit (still open) |
| `REF_STATUS` column | Schema migration phase |
| `FINANCE_LOG` actor `system` | PHASE 02 `UD_SYSTEM` |

---

## 9. Static inspection

```bash
node 09_AUDIT/scripts/financeRelationPhase03Checks.mjs
```

**Current-state note (post–Phase 05):** This script validates the **repair plan** (`VP54`, `FIN_20260418_*`, schema refs). Runtime guards (`financeAssertOptionalDonViId_`, `logFinance` parent lookup) were implemented in `PHASE_DATA_REL_05`. The Phase 03 script **passes** when guards exist (detail: `guard present after PHASE_DATA_REL_05`) or when guards are absent but documented as deferred in this plan.

---

## 10. Tests run

| Command | Result |
|---------|--------|
| `node 09_AUDIT/scripts/financeRelationPhase03Checks.mjs` | Re-run after `PHASE_DATA_REL_06A` (expect **GO** when Phase 05 guards present) |
| Workbook re-validation | Not run (xlsx not in repo) |
| `npm run typecheck` | Not required — no runtime code change |

---

## 11. Risks

| Risk | Mitigation |
|------|------------|
| Wrong `VP54` → unit mapping | Require CODE match in export before update |
| Remapping `FIN_ID` breaks audit trail | Keep `LEGACY_FIN_ID` or CSV backup |
| New transactions still use wrong id format | Confirm single id factory in GAS; align sheet with `cbvMakeId('FIN')` |

---

## 12. Next recommended phase

**PHASE_DATA_REL_04 — HO_SO Relation Authority Decision** (`FROM_HO_SO_ID` vs typed graph).

---

## 13. Files changed (PHASE 03)

| File | Change |
|------|--------|
| `09_AUDIT/PHASE_DATA_REL_03_FINANCE_RELATION_REPAIR_PLAN.md` | **NEW** |
| `09_AUDIT/scripts/financeRelationPhase03Checks.mjs` | **NEW** |
| `00_SYSTEM_BRAIN/006_PHASES/PHASE_REGISTRY.md` | Registry row |
