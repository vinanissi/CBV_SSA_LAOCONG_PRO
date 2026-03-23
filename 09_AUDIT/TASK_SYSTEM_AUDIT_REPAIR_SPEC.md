# Task System Audit & Repair Spec

**Scope:** USER_DIRECTORY, DON_VI, MASTER_CODE, ENUM_DICTIONARY, TASK_MAIN, TASK_CHECKLIST, TASK_ATTACHMENT, TASK_UPDATE_LOG

---

## 1. Audit Checks (selfAuditTaskSystemFull)

### 1.1 Table Existence & Schema

| Table | Check | Severity |
|-------|-------|----------|
| USER_DIRECTORY | Exists | HIGH |
| DON_VI | Exists | HIGH |
| MASTER_CODE | Exists | HIGH |
| ENUM_DICTIONARY | Exists | HIGH |
| TASK_MAIN | Exists | CRITICAL |
| TASK_CHECKLIST | Exists | HIGH |
| TASK_ATTACHMENT | Exists | HIGH |
| TASK_UPDATE_LOG | Exists | HIGH |

**Missing columns:** Compare to CBV_SCHEMA_MANIFEST. CRITICAL for TASK_MAIN.STATUS, OWNER_ID, DON_VI_ID.

### 1.2 Enum Consistency

| ENUM_GROUP | Required | Used By |
|------------|----------|---------|
| TASK_STATUS | Yes | TASK_MAIN.STATUS |
| TASK_PRIORITY | Yes | TASK_MAIN.PRIORITY |
| TASK_TYPE | Yes | TASK_MAIN.TASK_TYPE (legacy) |

**Check:** ENUM_DICTIONARY has active (IS_ACTIVE=TRUE) values for each group.

### 1.3 Ref Safety

| Ref | Source | Target | Condition |
|-----|--------|--------|-----------|
| OWNER_ID | TASK_MAIN | USER_DIRECTORY | STATUS=ACTIVE, IS_DELETED=FALSE |
| REPORTER_ID | TASK_MAIN | USER_DIRECTORY | Same |
| DON_VI_ID | TASK_MAIN | DON_VI | STATUS=ACTIVE, IS_DELETED=FALSE |
| TASK_TYPE_ID | TASK_MAIN | MASTER_CODE | MASTER_GROUP=TASK_TYPE, STATUS=ACTIVE |
| TASK_ID | TASK_CHECKLIST, TASK_ATTACHMENT, TASK_UPDATE_LOG | TASK_MAIN | Exists |

**Invalid refs:** Count rows where ref value is non-empty but not in target set.

### 1.4 Status & Priority Validity

| Field | Valid Values |
|-------|--------------|
| TASK_MAIN.STATUS | NEW, ASSIGNED, IN_PROGRESS, WAITING, DONE, CANCELLED, ARCHIVED |
| TASK_MAIN.PRIORITY | CAO, TRUNG_BINH, THAP, LOW, MEDIUM, HIGH, URGENT |

### 1.5 Slice/Spec Check

- **ACTIVE_USERS:** USER_DIRECTORY with STATUS=ACTIVE, IS_DELETED=FALSE
- **ACTIVE_DON_VI:** DON_VI with STATUS=ACTIVE, IS_DELETED=FALSE
- **ACTIVE_TASK_TYPE:** MASTER_CODE with MASTER_GROUP=TASK_TYPE, STATUS=ACTIVE

---

## 2. Repair (repairTaskSystemSafely)

**Safe operations only:**
- Append missing columns per CBV_SCHEMA_MANIFEST
- Append DON_VI columns per DON_VI_HEADERS
- **Never:** delete columns, overwrite data, clear rows

**Options:**
- `dryRun: true` — report what would be appended, no changes

---

## 3. Finding Codes

| Code | Severity | Resolution |
|------|----------|-------------|
| SHEET_MISSING | CRITICAL/HIGH | Create sheet; run bootstrap |
| COL_MISSING | CRITICAL/MEDIUM | Run repairTaskSystemSafely |
| ENUM_MISSING | HIGH/MEDIUM | Seed ENUM_DICTIONARY |
| ENUM_SHEET_EMPTY | HIGH | Create and seed ENUM_DICTIONARY |
| INVALID_USER_REF | HIGH | Fix OWNER_ID/REPORTER_ID; add users or migrate |
| INVALID_DON_VI_REF | MEDIUM | Populate DON_VI; migrate HTX_ID→DON_VI_ID |
| INVALID_TASK_TYPE_REF | MEDIUM | Run ensureSeedTaskType |
| INVALID_STATUS | MEDIUM | Manual fix or migration script |
| INVALID_PRIORITY | LOW | Add enum values or migrate |
| ORPHAN_TASK_REF | LOW | Delete orphan rows or fix TASK_ID |
| ACTIVE_DON_VI_EMPTY | HIGH | Run ensureSeedDonVi |
| ACTIVE_USERS_EMPTY | HIGH | Add USER_DIRECTORY rows |

---

## 4. GAS Functions

| Function | Purpose |
|----------|---------|
| selfAuditTaskSystemFull() | Full audit; returns { ok, findings, stats, summary } |
| selfAuditTaskSystem() | Delegates to Full when available |
| repairTaskSystemSafelyFull(options) | Append missing columns; options.dryRun |
| repairTaskSystemSafely(options) | ensureDonViSheet + repairTaskSystemSafelyFull |
