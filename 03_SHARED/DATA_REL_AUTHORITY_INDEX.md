# Data Relationship Authority Index

**Status:** LOCKED index — `PHASE_DATA_REL_12_SCHEMA_AUTHORITY_DOC_SWEEP`  
**Runtime source of truth:** `05_GAS_RUNTIME/90_BOOTSTRAP_SCHEMA.js`, `05_GAS_RUNTIME/90_BOOTSTRAP_AUDIT_SCHEMA.js`

---

## Contracts (03_SHARED)

| Doc | Topic |
|-----|--------|
| [TASK_KEY_CONTRACT.md](./TASK_KEY_CONTRACT.md) | `TASK_MAIN.ID` PK; child `TASK_ID` FK |
| [USER_TASK_FINANCE_MAPPING.md](./USER_TASK_FINANCE_MAPPING.md) | User refs on TASK / FINANCE / HO_SO |
| [USER_RUNTIME_STANDARD.md](./USER_RUNTIME_STANDARD.md) | Session → internal id mapping |

---

## Decisions (00_SYSTEM_BRAIN)

| Doc | Topic |
|-----|--------|
| [ADR_HO_SO_RELATION_AUTHORITY.md](../00_SYSTEM_BRAIN/002_DECISIONS/ADR_HO_SO_RELATION_AUTHORITY.md) | HO_SO hybrid **A+B**; `FROM_TYPE` graph not authority |

---

## Schema manifests (GAS)

| File | Role |
|------|------|
| `05_GAS_RUNTIME/90_BOOTSTRAP_SCHEMA.js` | Column order per sheet |
| `05_GAS_RUNTIME/90_BOOTSTRAP_AUDIT_SCHEMA.js` | Required columns + `refColumns` FK map |

---

## Module schema (01_SCHEMA)

| Doc | Align with manifest |
|-----|---------------------|
| [TASK_MAIN_SCHEMA.md](../01_SCHEMA/TASK_MAIN_SCHEMA.md) | TASK_MAIN + visibility columns |

---

## Audit reports (09_AUDIT)

| Phase | Report |
|-------|--------|
| 01 | `PHASE_DATA_REL_01_TASK_KEY_CONTRACT_REPORT.md` |
| 02 | `PHASE_DATA_REL_02_USER_REFERENCE_CLEANUP_PLAN.md` |
| 03 | `PHASE_DATA_REL_03_FINANCE_RELATION_REPAIR_PLAN.md` |
| 04 | `PHASE_DATA_REL_04_HO_SO_RELATION_AUTHORITY_DECISION.md` |
| 05 | `PHASE_DATA_REL_05_RUNTIME_GUARD_AUDIT_REPORT.md` |
| 07 | `PHASE_DATA_REL_07_HO_SO_RELATED_PAIR_GUARD_REPORT.md` |
| 11 | `PHASE_GAS_WRITE_GUARD_COVERAGE_REPORT.md` |
| 12 | `PHASE_DATA_REL_12_SCHEMA_AUTHORITY_DOC_SWEEP_REPORT.md` |
| 13 | `PHASE_DATA_REL_13_FRONTEND_DATA_CONTRACT_AUDIT_REPORT.md` |
| 14 | `PHASE_DATA_REL_14_MIGRATION_INVENTORY_REPORT.md` |
| 15 | `PHASE_CLEAN_REPO_CLOSEOUT_REPORT.md` |

**Unified audit (01–05, 10–14):** `node 09_AUDIT/scripts/runDataRelAuditSuite.mjs`  
**Final closeout matrix:** `node 09_AUDIT/scripts/runCleanRepoCloseout.mjs`  
**Phase 14 inventory:** `node 09_AUDIT/scripts/runMigrationInventory.mjs [--input-dir <csv-export>]`

---

## Drift policy

When `01_SCHEMA/*` or `03_SHARED/SHEET_DICTIONARY_MASTER.md` disagree with `90_BOOTSTRAP_SCHEMA.js`, **manifest wins** until a migration phase updates the workbook.
