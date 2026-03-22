# Task System Reference — Consolidated CBV-Compliant Structure

**Single entry point for TASK_CENTER.** Task belongs to HTX; users shared system-wide. GAS is the workflow engine.

---

## 1. Model (Invariant)

| Principle | Implementation |
|-----------|----------------|
| Task belongs to HTX | TASK_MAIN.HTX_ID → HO_SO_MASTER (ACTIVE_HTX) |
| Users shared system-wide | OWNER_ID, REPORTER_ID, DONE_BY, ACTOR_ID → USER_DIRECTORY |
| USER_DIRECTORY canonical | Ref source; no per-module user tables |
| HO_SO_MASTER business entities | HTX = HO_SO_TYPE=HTX |
| Normalized child tables | TASK_MAIN, TASK_CHECKLIST, TASK_ATTACHMENT, TASK_UPDATE_LOG |

---

## 2. Schema (Source of Truth)

| Document | Purpose |
|----------|---------|
| **06_DATABASE/TASK_SCHEMA.md** | Canonical schema; column list; refs; enums |
| **06_DATABASE/schema_manifest.json** | Machine-readable headers (used by bootstrap) |
| **06_DATABASE/_generated_schema/TASK_*.csv** | Copy-paste headers |

---

## 3. GAS Runtime

| File | Role |
|------|------|
| 20_TASK_REPOSITORY.gs | Low-level: taskFindById, taskAppendMain, taskUpdateMain, taskAppendChecklist, taskAppendAttachment, taskAppendUpdateLog |
| 20_TASK_VALIDATION.gs | Guards: assertActiveHtxId, validateTaskTransition, ensureTaskEditable, ensureTaskCanComplete |
| 20_TASK_SERVICE.gs | Public API: createTask, updateTask, assignTask, setTaskStatus, completeTask, cancelTask, addChecklistItem, markChecklistDone, addTaskAttachment, addTaskUpdateLog |
| 20_TASK_MIGRATION_HELPER.gs | Migration: analyzeTaskMigrationSource, buildTaskMigrationReport, runTaskMigration |
| 90_BOOTSTRAP_TASK.gs | taskBootstrapSheets() — ensures TASK sheets exist |
| 99_DEBUG_TASK_TEST.gs | runTaskTests() |

**Dependencies:** 00_CORE_CONFIG, 00_CORE_UTILS, 03_SHARED_REPOSITORY, 03_SHARED_VALIDATION, 02_USER_SERVICE, 01_ENUM_SERVICE

---

## 4. AppSheet (UI Only)

| Document | Purpose |
|----------|---------|
| **04_APPSHEET/APPSHEET_TASK_FIELD_POLICY.md** | Editable/non-editable; Valid_If |
| **04_APPSHEET/APPSHEET_TASK_ACTION_RULES.md** | Workflow actions; GAS calls; Show_If |
| **04_APPSHEET/APPSHEET_TASK_PHASE1.md** | Slices; ref targets; safeguards |
| **04_APPSHEET/APPSHEET_TASK_REF_MAP.md** | HTX_ID, OWNER_ID, REPORTER_ID ref mapping |
| **04_APPSHEET/APPSHEET_TASK_VIEW_MAP.md** | TASK_LIST, TASK_DETAIL, inlines |

**Refs:** ACTIVE_HTX (HO_SO_MASTER), ACTIVE_USERS (USER_DIRECTORY). Allow Adds = OFF on all operational refs.

---

## 5. Key Guards (GAS-Only)

| Field | AppSheet | GAS |
|-------|----------|-----|
| STATUS | Editable=OFF | setTaskStatus, assignTask, completeTask, cancelTask |
| DONE_AT | Editable=OFF | completeTask |
| PROGRESS_PERCENT | Editable=OFF | syncTaskProgress, completeTask |
| IS_DONE (checklist) | Editable=OFF | markChecklistDone |
| DONE_AT, DONE_BY (checklist) | Editable=OFF | markChecklistDone |
| TASK_UPDATE_LOG | No Add/Edit/Delete | addTaskUpdateLog, _addTaskUpdateLog |

---

## 6. Tables

| Table | Key | Parent | Notes |
|-------|-----|--------|-------|
| TASK_MAIN | ID | — | HTX_ID, OWNER_ID required |
| TASK_CHECKLIST | ID | TASK_MAIN | TASK_ID ref |
| TASK_ATTACHMENT | ID | TASK_MAIN | TASK_ID ref |
| TASK_UPDATE_LOG | ID | TASK_MAIN | Append-only via GAS |

---

## 7. Related Documents

| Area | Document |
|------|----------|
| Business rules | 02_MODULES/TASK_CENTER/BUSINESS_SPEC.md |
| Data model | 02_MODULES/TASK_CENTER/DATA_MODEL.md |
| Migration | 09_AUDIT/TASK_MIGRATION_PLAN.md |
| Policy audit | 09_AUDIT/TASK_POLICY_AUDIT.md |

---

## 8. Deployment Order (GAS)

See **05_GAS_RUNTIME/CLASP_PUSH_ORDER.md** and `.clasp.json`. Task files load after shared, before 20_TASK_SERVICE:

```
… 03_SHARED_* → 20_TASK_REPOSITORY → 20_TASK_VALIDATION → 20_TASK_SERVICE → 20_TASK_MIGRATION_HELPER → …
```

---

## 9. Final Deployment Order and Exact Functions to Run

### GAS filePushOrder (from .clasp.json)

```
00_CORE_* → 01_ENUM_* → 02_MASTER_CODE → 02_USER_* → 03_SHARED_* → 03_USER_MIGRATION_HELPER
→ 90_BOOTSTRAP_SCHEMA → 90_BOOTSTRAP_AUDIT_SCHEMA → 90_BOOTSTRAP_LIFECYCLE
→ 10_HOSO_SERVICE → 20_TASK_REPOSITORY → 20_TASK_VALIDATION → 20_TASK_SERVICE → 20_TASK_MIGRATION_HELPER
→ 30_FINANCE_SERVICE → 40_DISPLAY_* → 90_BOOTSTRAP_INIT → 90_BOOTSTRAP_TASK
→ 90_BOOTSTRAP_AUDIT → 50_APPSHEET_VERIFY → 99_DEBUG_* → 99_DEBUG_TASK_TEST → 90_BOOTSTRAP_MENU → …
```

### Exact Functions to Run (in order)

| Step | Function | Purpose |
|------|----------|---------|
| 1 | `clasp push` | Deploy GAS |
| 2 | `initAll()` | Creates all sheets (incl. TASK_MAIN, TASK_CHECKLIST, TASK_ATTACHMENT, TASK_UPDATE_LOG) from schema_manifest |
| 3 | `protectSensitiveSheets()` | Protects TASK_CHECKLIST, TASK_UPDATE_LOG, ENUM_DICTIONARY, USER_DIRECTORY, MASTER_CODE |
| 4 | `runTaskTests()` | Validates task workflow (requires HTX and active user) |
| 5 | `verifyAppSheetReadiness()` | Verifies tables, keys, enum coverage |

### AppSheet Setup (after GAS)

- Add tables: TASK_MAIN, TASK_CHECKLIST, TASK_ATTACHMENT, TASK_UPDATE_LOG
- Apply 04_APPSHEET/APPSHEET_TASK_FIELD_POLICY.md (Editable=OFF on STATUS, DONE_AT, PROGRESS_PERCENT, IS_DONE, etc.)
- Apply 04_APPSHEET/APPSHEET_TASK_PHASE1.md (slices, ref targets, safeguards)
