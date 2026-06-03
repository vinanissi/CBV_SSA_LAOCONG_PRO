# PHASE_DATA_REL_12 — Schema / Authority Doc Sweep Report

**Result:** GO_WITH_WARNINGS  
**Date:** 2026-06-03  
**Branch:** `phase/data-relationship-refactor-prep`  
**Prerequisites:** Phases 01–04 contracts/ADR, Phase 11 GAS coverage

---

## 1. Summary

Aligned **authority documentation** with **`90_BOOTSTRAP_SCHEMA.js`** and **`90_BOOTSTRAP_AUDIT_SCHEMA.js`**. Added a single cross-link hub (`03_SHARED/DATA_REL_AUTHORITY_INDEX.md`). Updated `01_SCHEMA/TASK_MAIN_SCHEMA.md` for **SHARED_WITH**, **IS_PRIVATE**, and manifest column order. No workbook or GAS behavior changes.

**Manifest wins** when legacy dictionaries drift.

---

## 2. Doc changes

| File | Change |
|------|--------|
| `03_SHARED/DATA_REL_AUTHORITY_INDEX.md` | **NEW** — index of contracts, ADR, manifests, audit reports |
| `01_SCHEMA/TASK_MAIN_SCHEMA.md` | Manifest-aligned columns; visibility + `PENDING_ACTION` |
| `03_SHARED/TASK_KEY_CONTRACT.md` | Related authority table |
| `03_SHARED/USER_TASK_FINANCE_MAPPING.md` | Index links; SHARED_WITH; HO_SO guard accuracy |
| `02_MODULES/HO_SO/DATA_MODEL.md` | `FROM_TYPE` not authority (ADR) |
| `00_SYSTEM_BRAIN/002_DECISIONS/ADR_HO_SO_RELATION_AUTHORITY.md` | Link to authority index |
| `09_AUDIT/scripts/schemaAuthorityPhase12Checks.mjs` | **NEW** static checks |
| `09_AUDIT/PHASE_DATA_REL_12_SCHEMA_AUTHORITY_DOC_SWEEP_REPORT.md` | **NEW** this report |

---

## 3. Alignment verified

| Check | Status |
|-------|--------|
| `TASK_MAIN.ID` first column in manifest | OK |
| No `TASK_ID` on `TASK_MAIN` manifest row | OK |
| `SHARED_WITH` / `IS_PRIVATE` after `REPORTER_ID` | OK |
| Audit `refColumns`: child `TASK_ID` → `TASK_MAIN` `ID` | OK |
| HO_SO_RELATION hybrid columns in manifest | OK |
| No `FROM_TYPE` in manifest | OK |
| `TASK_MAIN_SCHEMA.md` documents visibility cols | OK |
| ADR + DATA_MODEL deny typed-graph authority | OK |

---

## 4. Drift deferred (warnings)

| Doc | Issue | Policy |
|-----|-------|--------|
| `03_SHARED/SHEET_DICTIONARY_MASTER.md` | Legacy `TASK_TYPE`, `RESULT_NOTE`; no SHARED_WITH | Manifest wins; bulk refresh out of scope |
| `06_DATABASE/TASK_SCHEMA.md` | Legacy phrasing (Phase 01 warning) | Same |
| AppSheet / module copies | May lag `01_SCHEMA` | Update when slice docs touched |

---

## 5. Authority stack (after sweep)

```text
90_BOOTSTRAP_SCHEMA.js          ← column order (physical)
90_BOOTSTRAP_AUDIT_SCHEMA.js    ← FK / required / optional
03_SHARED/TASK_KEY_CONTRACT.md  ← TASK PK contract
03_SHARED/USER_TASK_FINANCE_MAPPING.md
ADR_HO_SO_RELATION_AUTHORITY.md
01_SCHEMA/TASK_MAIN_SCHEMA.md   ← human schema (aligned)
03_SHARED/DATA_REL_AUTHORITY_INDEX.md ← navigation
```

---

## 6. Tests run

```bash
node 09_AUDIT/scripts/schemaAuthorityPhase12Checks.mjs
node 09_AUDIT/scripts/runDataRelAuditSuite.mjs
```

| Script | Result |
|--------|--------|
| `schemaAuthorityPhase12Checks.mjs` | **GO_WITH_WARNINGS** (dictionary drift) |
| `runDataRelAuditSuite.mjs` | **GO_WITH_WARNINGS** |

---

## 7. Next recommended phase

**PHASE_DATA_REL_13 — Frontend Data Contract Audit** (Workboard `USR-LOCAL-*`, `taskId` = `TASK_MAIN.ID`, forms vs GAS)
