# PHASE_DATA_REL_14 — Migration Inventory (Read-only) Report

**Result:** GO_WITH_WARNINGS  
**Date:** 2026-06-03  
**Branch:** `phase/data-relationship-refactor-prep`  
**Prerequisites:** Phases 02–04 plans, Phase 13 FE contract audit

---

## 1. Summary

Added **read-only** migration inventory tooling: parse admin-exported CSV tabs and emit JSON counts for user-ref drift, finance FK orphans, and HO_SO relation shape drift. **No workbook or GAS writes.**

When no export folder is provided, the runner still prints **repo baseline** counts from `DATA_RELATIONSHIP_AUDIT_REPORT_20260603.md`.

---

## 2. Scripts

| Script | Purpose |
|--------|---------|
| `runMigrationInventory.mjs` | Orchestrator + repo baseline |
| `migrationInventoryUserRefs.mjs` | `USR-LOCAL-*`, `UAT_OPERATOR`, `system`, invalid `OWNER_ID` / `REPORTER_ID` |
| `migrationInventoryFinance.mjs` | `VP54`, orphan `DON_VI_ID`, orphan / legacy `FINANCE_LOG.FIN_ID` |
| `migrationInventoryHosoRelation.mjs` | Typed graph-only rows, partial `RELATED_*`, master pairs |
| `lib/parseSheetCsv.mjs` | Shared CSV parser |
| `migrationInventoryPhase14Checks.mjs` | Static + fixture smoke |

**Export guide:** `09_AUDIT/templates/migration-inventory/EXPORT_MANIFEST.md`  
**Sample data:** `09_AUDIT/fixtures/migration-inventory-sample/`

---

## 3. Usage

```bash
# Baseline only (audit report numbers + code drift notes)
node 09_AUDIT/scripts/runMigrationInventory.mjs

# Full CSV inventory (production workbook export)
node 09_AUDIT/scripts/runMigrationInventory.mjs --input-dir path/to/csv-folder

# CI / local smoke
node 09_AUDIT/scripts/runMigrationInventory.mjs --input-dir 09_AUDIT/fixtures/migration-inventory-sample
node 09_AUDIT/scripts/migrationInventoryPhase14Checks.mjs
```

---

## 4. Sample fixture results (smoke)

| Domain | Metric | Sample count |
|--------|--------|--------------|
| User | `USR-LOCAL` hits | 2+ |
| User | `UAT_OPERATOR` | 1 |
| Finance | `VP54` on `DON_VI_ID` | 1 |
| Finance | Orphan `FIN_ID` (`FIN_20260418_*`) | 1 |
| HO_SO | Typed-graph-only rows | 1 |
| HO_SO | Partial `RELATED_*` | 1 |

---

## 5. Repo baseline (audit workbook, no CSV)

| Backlog | Documented count | Phase |
|---------|------------------|-------|
| User drift (`USR-LOCAL`, `UAT_OPERATOR`, `system`) | See Phase 02 plan | 02 |
| `VP54` on finance `DON_VI_ID` | 4 | 03 |
| Orphan `FIN_20260418_*` in `FINANCE_LOG` | 8 | 03 |
| HO_SO typed graph vs empty `FROM_HO_SO_ID` | 18 rows | 04 |

---

## 6. Migration apply (out of scope)

Inventory output feeds **CSV templates** in `EXPORT_MANIFEST.md`. Applying changes requires admin sign-off per Phase 02–04 — not automated here.

---

## 7. Tests run

| Command | Result |
|---------|--------|
| `migrationInventoryPhase14Checks.mjs` | **GO** |
| `runMigrationInventory.mjs --input-dir fixtures/...` | **GO** (`csvResult`) |

---

## 8. Next recommended phase

**PHASE_DATA_REL_15 — Clean Repo Closeout** (extend `runDataRelAuditSuite`, full build matrix, `PHASE_CLEAN_REPO_CLOSEOUT_REPORT.md`)
