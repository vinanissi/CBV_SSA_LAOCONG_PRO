# Migration inventory — CSV export manifest

**Phase:** `PHASE_DATA_REL_14_MIGRATION_INVENTORY`  
**Mode:** Read-only — no writes to workbook from these scripts.

## Export steps (admin)

1. Open target Google Sheet workbook.
2. For each tab below: **File → Download → Comma-separated values (.csv)** or copy tab to a single folder.
3. Name files **exactly** as listed (headers row = row 1).

## Required files

| File | Used for |
|------|----------|
| `USER_DIRECTORY.csv` | Valid user id set |
| `TASK_MAIN.csv` | `OWNER_ID`, `REPORTER_ID` drift |
| `FINANCE_TRANSACTION.csv` | `DON_VI_ID`, transaction ids |
| `DON_VI.csv` | Valid `ID` / `CODE` for finance FK check |
| `HO_SO_RELATION.csv` | Typed graph vs hybrid columns |

## Optional files

| File | Fields scanned |
|------|----------------|
| `TASK_CHECKLIST.csv` | `DONE_BY` |
| `TASK_UPDATE_LOG.csv` | `ACTOR_ID` |
| `FINANCE_LOG.csv` | `FIN_ID`, `ACTOR_ID` |
| `HO_SO_MASTER.csv` | `OWNER_ID` |

## Run inventory

```bash
node 09_AUDIT/scripts/runMigrationInventory.mjs --input-dir path/to/export-folder
```

Or sample fixture (CI/local smoke):

```bash
node 09_AUDIT/scripts/runMigrationInventory.mjs --input-dir 09_AUDIT/fixtures/migration-inventory-sample
```

## Output templates (migration apply — separate admin phase)

```text
user_ref_inventory.csv
  sheet,row_id,field,current_value,class,proposed_target_id,approved_by,applied_at

finance_don_vi_migration.csv
  transaction_id,current_don_vi_id,proposed_don_vi_id,match_basis,approved_by,applied_at

finance_log_fin_id_migration.csv
  log_id,current_fin_id,proposed_fin_id,action,approved_by,applied_at

hoso_relation_migration.csv
  relation_id,from_type,from_id,to_type,to_id,proposed_related_table,proposed_related_record_id,approved_by,applied_at
```

Do **not** apply rows until Phase 02–04 plans are signed off.
