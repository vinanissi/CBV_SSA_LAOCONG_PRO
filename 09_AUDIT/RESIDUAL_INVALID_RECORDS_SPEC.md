# Residual Invalid Records — Inspection & Repair Spec

## Purpose

Identify and repair real records with blank required fields that cause audit blockers. Reports by **stable ID**, not row number.

## Helpers

| Function | Purpose |
|----------|---------|
| `inspectResidualInvalidRecords()` | Finds records with blank blocker columns; outputs by ID |
| `repairResidualInvalidRecords()` | Repairs those records using safe defaults or inference |

## Blocker Columns (per table)

| Table | Blocker Columns |
|-------|-----------------|
| TASK_MAIN | STATUS, PRIORITY, TASK_TYPE |
| USER_DIRECTORY | ROLE, STATUS |
| HO_SO_MASTER | HO_SO_TYPE, STATUS |
| FINANCE_TRANSACTION | STATUS, TRANS_TYPE, CATEGORY |
| ADMIN_AUDIT_LOG | ENTITY_ID |

## Safe Defaults

| Table.Column | Default |
|--------------|---------|
| TASK_MAIN.STATUS | NEW |
| TASK_MAIN.PRIORITY | MEDIUM |
| TASK_MAIN.TASK_TYPE | GENERAL |
| USER_DIRECTORY.ROLE | OPERATOR |
| USER_DIRECTORY.STATUS | ACTIVE |
| HO_SO_MASTER.STATUS | ACTIVE (if has HO_SO_FILE rows) else NEW |
| HO_SO_MASTER.HO_SO_TYPE | Inferred from ID prefix (HTX_, XV_, XE_, TX_) or manual review |
| FINANCE_TRANSACTION.STATUS | NEW |
| FINANCE_TRANSACTION.TRANS_TYPE | Inferred from CATEGORY or AMOUNT sign, else manual review |
| FINANCE_TRANSACTION.CATEGORY | Manual review (no safe inference) |
| ADMIN_AUDIT_LOG.ENTITY_ID | SYSTEM |

## ADMIN_AUDIT_LOG Writer Fix

- **writeAuditLog** (90_BOOTSTRAP_AUDIT): `ENTITY_ID: 'SYSTEM'` when `ENTITY_TYPE: 'SYSTEM'`
- **logAdminAudit** (03_SHARED_LOGGER): When `entityId` empty → `ENTITY_TYPE: 'SYSTEM'`, `ENTITY_ID: 'SYSTEM'`

## Rerun Order

1. `inspectResidualInvalidRecords()`
2. `repairResidualInvalidRecords()`
3. `selfAuditBootstrap()`
4. `verifyAppSheetReadiness()`
