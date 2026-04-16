# TASK Schema Pack Audit

**Audit date:** 2025-03-21  
**Scope:** Schema pack (DATA_MODEL.md, BUSINESS_SPEC.md, TASK_SCHEMA.md, schema_manifest, 90_BOOTSTRAP_*)

---

## 1. Does TASK_MAIN clearly belong to HTX?

| Check | Result | Evidence |
|-------|--------|----------|
| HTX_ID column present | ✓ | schema_manifest, TASK_SCHEMA, DATA_MODEL |
| HTX_ID required | ✓ | 90_BOOTSTRAP_AUDIT_SCHEMA requiredColumns |
| HTX_ID → HO_SO_MASTER | ✓ | refColumns, CBV_AUDIT_REFS |
| ACTIVE_HTX slice documented | ✓ | TASK_SCHEMA Notes, BUSINESS_SPEC |

**PASS.** TASK_MAIN.HTX_ID required; refs HO_SO_MASTER (ACTIVE_HTX = HO_SO_TYPE=HTX, IS_DELETED=FALSE).

**Minor:** TASK_SCHEMA Note says "STATUS active"; ACTIVE_HTX slice uses `IS_DELETED=FALSE` (no STATUS filter). Doc imprecision only.

---

## 2. Are OWNER_ID and REPORTER_ID correctly tied to shared users?

| Check | Result | Evidence |
|-------|--------|----------|
| OWNER_ID → USER_DIRECTORY | ✓ | refColumns, Ref Mapping Summary |
| REPORTER_ID → USER_DIRECTORY | ✓ | refColumns, Ref Mapping Summary |
| No HTX-scoped user table | ✓ | Users shared; USER_DIRECTORY is system-wide |
| DONE_BY, ACTOR_ID → USER_DIRECTORY | ✓ | TASK_CHECKLIST, TASK_UPDATE_LOG |

**PASS.** OWNER_ID, REPORTER_ID, DONE_BY, ACTOR_ID all ref USER_DIRECTORY. Shared-user model preserved.

---

## 3. Are checklist, attachment, and update log correctly normalized?

| Check | Result | Evidence |
|-------|--------|----------|
| No attachments in TASK_MAIN | ✓ | No attachment columns; TASK_ATTACHMENT separate |
| No logs in TASK_MAIN | ✓ | No log columns; TASK_UPDATE_LOG separate |
| TASK_CHECKLIST.TASK_ID → TASK_MAIN | ✓ | Child table; TASK_ID ref |
| TASK_ATTACHMENT.TASK_ID → TASK_MAIN | ✓ | Child table |
| TASK_UPDATE_LOG.TASK_ID → TASK_MAIN | ✓ | Child table |
| Each has own ID, audit trail | ✓ | ID, CREATED_AT, CREATED_BY, UPDATED_AT, UPDATED_BY |

**PASS.** Fully normalized; no embedded attachments or logs in TASK_MAIN.

---

## 4. Are all required audit fields present?

| Table | CREATED_AT | CREATED_BY | UPDATED_AT | UPDATED_BY |
|-------|------------|------------|------------|------------|
| TASK_MAIN | ✓ | ✓ | ✓ | ✓ |
| TASK_CHECKLIST | ✓ | ✓ | ✓ | ✓ |
| TASK_ATTACHMENT | ✓ | ✓ | ✓ | ✓ |
| TASK_UPDATE_LOG | ✓ | ✓ | ✓ | ✓ |

CBV standard: CREATED_AT, CREATED_BY, UPDATED_AT, UPDATED_BY.

**PASS.** All four task tables have full audit columns. 90_BOOTSTRAP_AUDIT_SCHEMA auditColumns aligned.

---

## 5. Are ref directions correct?

| Child | Column | Parent | Direction |
|-------|--------|--------|-----------|
| TASK_MAIN | HTX_ID | HO_SO_MASTER | Child→Parent ✓ |
| TASK_MAIN | OWNER_ID | USER_DIRECTORY | Child→Parent ✓ |
| TASK_MAIN | REPORTER_ID | USER_DIRECTORY | Child→Parent ✓ |
| TASK_CHECKLIST | TASK_ID | TASK_MAIN | Child→Parent ✓ |
| TASK_CHECKLIST | DONE_BY | USER_DIRECTORY | Child→Parent ✓ |
| TASK_ATTACHMENT | TASK_ID | TASK_MAIN | Child→Parent ✓ |
| TASK_UPDATE_LOG | TASK_ID | TASK_MAIN | Child→Parent ✓ |
| TASK_UPDATE_LOG | ACTOR_ID | USER_DIRECTORY | Child→Parent ✓ |

**PASS.** All refs child→parent. CBV_AUDIT_REFS includes TASK_MAIN.HTX_ID and child→TASK_MAIN.

**INFO:** CBV_AUDIT_REFS does not list USER_DIRECTORY refs (OWNER_ID, REPORTER_ID, DONE_BY, ACTOR_ID); they are in refColumns. Audit may not validate these refs unless extended.

---

## 6. Is the schema AppSheet-ready and GAS-ready?

| Check | Result | Notes |
|-------|--------|-------|
| schema_manifest.json | ✓ | All 4 tables, columns match TASK_SCHEMA |
| 90_BOOTSTRAP_SCHEMA.js | ✓ | CBV_SCHEMA_MANIFEST aligned |
| 90_BOOTSTRAP_AUDIT_SCHEMA.js | ✓ | required/optional, refs, enums |
| _generated_schema/*.csv | ✓ | Headers match manifest |
| Copy-paste headers | ✓ | TASK_SCHEMA.md has CSV-style headers |
| GAS 20_TASK_SERVICE.js | ✗ | Still uses RESULT_NOTE, no HTX_ID, addTaskUpdate uses ACTION/OLD_STATUS/NEW_STATUS/NOTE |

**PASS for schema pack.** Structure, manifest, and bootstrap files are ready.

**Implementation gap:** GAS 20_TASK_SERVICE.js must be updated per TASK_SCHEMA.md "Next Implementation Step" before runtime will work with new schema.

---

## 7. Is the schema aligned with locked CBV standards?

| Standard | Result | Evidence |
|----------|--------|----------|
| Task belongs to HTX | ✓ | HTX_ID required |
| Users shared | ✓ | USER_DIRECTORY refs |
| No attachments in TASK_MAIN | ✓ | TASK_ATTACHMENT normalized |
| No logs in TASK_MAIN | ✓ | TASK_UPDATE_LOG normalized |
| TASK_PRO_OPERATIONAL_LOCK | ⚠ | Still cites ACTION, RESULT_NOTE; should cite UPDATE_TYPE, RESULT_SUMMARY, HTX_ID |
| ENUM_DICTIONARY / UPDATE_TYPE | ✓ | UPDATE_TYPE exists (01_ENUM_SEED) |

**PASS** for locked principles. **Minor:** TASK_PRO_OPERATIONAL_LOCK.md should be updated to reflect new column names.

---

## Exact Schema Issues

| # | Issue | Severity |
|---|-------|----------|
| 1 | TASK_SCHEMA Note: "ACTIVE_HTX... STATUS active" — slice uses IS_DELETED=FALSE | LOW (doc) |
| 2 | TASK_PRO_OPERATIONAL_LOCK: ACTION, RESULT_NOTE — should be UPDATE_TYPE, RESULT_SUMMARY | LOW (doc sync) |
| 3 | GAS 20_TASK_SERVICE: RESULT_NOTE, no HTX_ID, ACTION/OLD_STATUS/NEW_STATUS/NOTE | HIGH (implementation) |

---

## Exact Fixes Applied

**None in this audit.** Audit is read-only. Recommended fixes:

1. **TASK_SCHEMA.md** (line ~141): Change "STATUS active" → "IS_DELETED=FALSE" for ACTIVE_HTX note.
2. **TASK_PRO_OPERATIONAL_LOCK.md**: Update to use UPDATE_TYPE, RESULT_SUMMARY, HTX_ID.
3. **20_TASK_SERVICE.js**: Implement Next Implementation Step from TASK_SCHEMA.md.

---

## Final Verdict

| Category | Result |
|----------|--------|
| 1. TASK_MAIN belongs to HTX | **PASS** |
| 2. OWNER_ID, REPORTER_ID tied to shared users | **PASS** |
| 3. Checklist, attachment, log normalized | **PASS** |
| 4. Audit fields present | **PASS** |
| 5. Ref directions correct | **PASS** |
| 6. AppSheet/GAS ready | **PASS** (schema); GAS impl pending |
| 7. CBV standards aligned | **PASS** |

---

# **TASK SCHEMA SAFE**

The schema pack is structurally correct, normalized, and aligned with locked CBV standards. All refs are correct; audit columns present. GAS implementation update is required before runtime use; schema itself is production-ready.
