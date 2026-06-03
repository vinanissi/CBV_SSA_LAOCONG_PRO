# Data Relationship Audit Report - DEV_FIN_CBV_SSA_LAOCONG_DB

**Date:** 2026-06-03  
**Workbook:** `C:\Users\tchcm\Downloads\DEV_FIN_CBV_SSA_LAOCONG_DB (1).xlsx`  
**Scope:** Audit quan he du lieu thuc te trong workbook va doi chieu voi thiet ke da co trong repo.

## 1. Authority Sources

- `00_OVERVIEW/CBV_FINAL_ARCHITECTURE.md`
- `01_SCHEMA/*_SCHEMA.md`
- `03_SHARED/USER_TASK_FINANCE_MAPPING.md`
- `09_AUDIT/VIEW_ARCHITECTURE_AUDIT_REPORT.md`
- Runtime contracts in `workers/api/src` and `apps/workboard/src`

## 2. Core Row Counts

| Sheet | Rows | Notes |
|---|---:|---|
| USER_DIRECTORY | 8 | Canonical user table, but workbook has expanded runtime columns beyond final schema |
| DON_VI | 17 | Canonical organization/unit table |
| MASTER_CODE | 45 | Static/semi-static master data |
| ENUM_DICTIONARY | 230 | Workflow enum dictionary |
| HO_SO_MASTER | 4 | Core dossier/business entity table |
| HO_SO_XA_VIEN | 4 | Dossier satellite |
| HO_SO_PHUONG_TIEN | 4 | Dossier satellite |
| HO_SO_TAI_XE | 3 | Dossier satellite |
| HO_SO_RELATION | 18 | Entity relation graph |
| TASK_MAIN | 106 | Core task table |
| TASK_CHECKLIST | 88 | Task child table |
| TASK_ATTACHMENT | 106 | Task child table |
| TASK_UPDATE_LOG | 259 | Task audit/update log |
| FINANCE_TRANSACTION | 9 | Core finance table |
| FINANCE_LOG | 20 | Finance audit log |
| HOME_ALERT | 29 | Operational alert runtime |

No duplicate primary `ID` values were found in the checked canonical sheets.

## 3. Confirmed Relationships

These relationships are consistent with current DB values:

| Relationship | Status |
|---|---|
| DON_VI.PARENT_ID -> DON_VI.ID | OK |
| TASK_MAIN.DON_VI_ID -> DON_VI.ID | OK |
| TASK_MAIN.TASK_TYPE_ID -> MASTER_CODE.ID | OK |
| TASK_CHECKLIST.TASK_ID -> TASK_MAIN.ID | OK |
| TASK_ATTACHMENT.TASK_ID -> TASK_MAIN.ID | OK |
| TASK_UPDATE_LOG.TASK_ID -> TASK_MAIN.ID | OK |
| CHECKLIST_FEEDBACK.TASK_ID -> TASK_MAIN.ID | OK |
| CHECKLIST_ATTACHMENTS.TASK_ID -> TASK_MAIN.ID | OK |
| CHECKLIST_LINKS.TASK_ID -> TASK_MAIN.ID | OK |
| CHECKLIST_LAYOUT_STATE.TASK_ID -> TASK_MAIN.ID | OK |

Important naming note: the final design says child `TASK_ID` references `TASK_MAIN`, but the actual workbook uses `TASK_MAIN.ID` as the parent key. Data is valid when checked against `TASK_MAIN.ID`; it fails only if a runtime expects a physical `TASK_MAIN.TASK_ID` column.

## 4. Broken or Weak Relationships

| Severity | Relationship | Finding |
|---|---|---|
| High | TASK_MAIN.OWNER_ID -> USER_DIRECTORY.ID | 2 rows contain non-canonical local/UAT users: `USR-LOCAL-STAFF`, `UAT_OPERATOR` |
| High | TASK_MAIN.REPORTER_ID -> USER_DIRECTORY.ID | 2 rows contain non-canonical local/UAT users: `USR-LOCAL-MGR`, `UAT_OPERATOR` |
| Medium | TASK_CHECKLIST.DONE_BY -> USER_DIRECTORY.ID | 3 rows contain local/UAT user ids |
| Medium | FINANCE_TRANSACTION.DON_VI_ID -> DON_VI.ID | 4 rows use `VP54`, which is not a DON_VI.ID |
| Medium | FINANCE_LOG.FIN_ID -> FINANCE_TRANSACTION.ID | 8 rows reference old finance ids like `FIN_20260418_*`, not current `FINANCE_TRANSACTION.ID` |
| Low/Expected fallback | TASK_UPDATE_LOG.ACTOR_ID -> USER_DIRECTORY.ID | 132 rows use `system` or local/UAT actors. Design allows email fallback, but `system` should be formalized as a system user or reserved actor |
| Low/Expected fallback | FINANCE_LOG.ACTOR_ID -> USER_DIRECTORY.ID | 12 rows use `system`. Same fallback/system-user issue |
| Low | CHECKLIST_HISTORY.TASK_ID -> TASK_MAIN.ID | 1 bootstrap/test row uses `CBV_BOOTSTRAP_TEST` |

## 5. Design vs Workbook Drift

### USER_DIRECTORY expanded beyond final design

Final design says USER_DIRECTORY is independent from DON_VI/HTX. Workbook currently includes runtime/team columns such as:

- `DON_VI_ID`
- `TEAM_ID`
- `SUPERVISOR_ID`
- `ROLE_CODE`
- `WORKLOAD_LIMIT`
- `ACTIVE_QUEUE_COUNT`
- operator/admin capability flags

This may be intentional for operational runtime, but it conflicts with the final architecture wording: "Users are global; they do NOT depend on HTX or DON_VI." If retained, these should be documented as runtime assignment metadata, not canonical identity dependency.

### TASK_MAIN key naming

Design and child tables use semantic `TASK_ID`, while `TASK_MAIN` physical key is `ID`. Current data is internally consistent if child `TASK_ID` points to `TASK_MAIN.ID`. Runtime contracts should make this explicit:

- Physical parent key: `TASK_MAIN.ID`
- Child foreign key: `TASK_ID`
- Display code: `TASK_CODE`

Avoid adding a second physical `TASK_ID` column unless all GAS/Worker/AppSheet contracts are migrated together.

### HO_SO relation model has two layers

Old design expects `HO_SO_RELATION.FROM_HO_SO_ID` and `TO_HO_SO_ID` to point to `HO_SO_MASTER.ID`. Workbook has no values in those columns, while newer columns `FROM_TYPE/FROM_ID/TO_TYPE/TO_ID` are populated and can point to satellites such as vehicles, drivers, or members.

Decision needed: either restore simple HO_SO_MASTER-only relation refs, or document the newer typed polymorphic graph as canonical.

### Finance historical ids

`FINANCE_LOG.FIN_ID` mixes current short ids (`19c98be5`, etc.) with older generated ids (`FIN_20260418_*`). Since current `FINANCE_TRANSACTION.ID` is short-form, historical logs are orphaned unless a migration map exists.

## 6. Value Set Observations

| Field | Actual values |
|---|---|
| TASK_MAIN.STATUS | `CANCELLED`, `DONE`, `IN_PROGRESS`, `NEW`, `ON_HOLD`, `WAITING` |
| TASK_MAIN.PRIORITY | `HIGH`, `MEDIUM` |
| FINANCE_TRANSACTION.STATUS | `ARCHIVED`, `CANCELLED`, `CONFIRMED` |
| FINANCE_TRANSACTION.TRANS_TYPE | `EXPENSE`, `INCOME` |
| DON_VI.DON_VI_TYPE | `BO_PHAN`, `CONG_TY`, `DOI_KINH_DOANH`, `HTX`, `NHOM` |
| USER_DIRECTORY.ROLE | `ADMIN`, `MANAGER`, `OPERATOR`, `USER` |

Design docs still show some older value labels in places, for example task priority `CAO/TRUNG_BINH/THAP`. Runtime currently uses English-style values. Pick one canonical enum source and update docs/contracts accordingly.

## 7. Recommended Fix Order

1. Normalize user references:
   - Add formal system/runtime users to USER_DIRECTORY, or document `system` as a reserved non-user actor.
   - Replace `USR-LOCAL-*` and `UAT_OPERATOR` in production rows with valid USER_DIRECTORY.ID values.

2. Fix finance unit references:
   - Map `VP54` to the correct `DON_VI.ID`.
   - Add a validation guard before finance writes.

3. Repair finance log parent references:
   - Build migration map from old `FIN_20260418_*` ids to current `FINANCE_TRANSACTION.ID`.
   - If no map exists, mark those rows as historical orphan logs with explicit `REF_STATUS=ORPHANED` or archive them.

4. Lock the task key contract:
   - `TASK_MAIN.ID` is the parent PK.
   - Child `TASK_ID` columns reference `TASK_MAIN.ID`.
   - Runtime DTO may expose `taskId`, but sheet schema should not imply a missing physical `TASK_MAIN.TASK_ID`.

5. Decide HO_SO relation authority:
   - Simple model: `FROM_HO_SO_ID/TO_HO_SO_ID`.
   - Typed graph model: `FROM_TYPE/FROM_ID/TO_TYPE/TO_ID`.
   - Do not keep both as competing authorities.

## 8. Audit Verdict

Overall schema is usable and most task/checklist/attachment relationships are healthy. The main production risks are:

- user reference drift from local/UAT runtime ids,
- finance records referencing a non-existent unit id,
- finance logs containing orphan historical finance ids,
- ambiguous HO_SO relation authority,
- mismatch between semantic `TASK_ID` naming and physical `TASK_MAIN.ID`.

These should be corrected before treating this workbook as a locked production DB.
