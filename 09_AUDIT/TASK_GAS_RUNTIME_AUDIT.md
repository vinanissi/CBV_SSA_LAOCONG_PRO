# TASK GAS Runtime Audit

**Audit date:** 2025-03-21  
**Scope:** task_service.gs, task_validation.gs, task_repository.gs

---

## 1. Does createTask require valid HTX_ID and valid users?

| Check | Result | Evidence |
|-------|--------|----------|
| HTX_ID required | ✓ | ensureRequired(data.HTX_ID, 'HTX_ID') — line 71 |
| HTX_ID validated | ✓ | assertActiveHtxId(data.HTX_ID) — line 74 |
| OWNER_ID required | ✓ | ensureRequired(data.OWNER_ID) — line 70 |
| OWNER_ID validated | ✓ | assertActiveUserId(data.OWNER_ID) — line 73 |
| REPORTER_ID validated when present | ✓ | assertActiveUserId(data.REPORTER_ID) — line 75 |

**PASS.**

**Note:** Defensive `if (typeof assertActiveHtxId === 'function')` allows silent bypass if task_validation loads after task_service; load order in .clasp.json prevents this.

---

## 2. Are user validations using USER_DIRECTORY correctly?

| Check | Result | Evidence |
|-------|--------|----------|
| assertActiveUserId source | ✓ | 02_USER_SERVICE.getUserById → _loadUserRows(USER_DIRECTORY) |
| mapCurrentUserEmailToInternalId | ✓ | getUserByEmail(email) → USER_DIRECTORY |
| No HO_SO_MASTER for user lookup | ✓ | User IDs resolved only via USER_DIRECTORY |
| ACTOR_ID / DONE_BY | ⚠ | Fallback to cbvUser() when mapCurrentUserEmailToInternalId returns null; stores email, not ID — may create orphan ref in USER_DIRECTORY slice |

**PASS** for validation path. **INFO:** ACTOR_ID/DONE_BY can store email when current user not in USER_DIRECTORY (audit trail preserved; ref validation may fail).

---

## 3. Are workflow transitions enforced in GAS?

| Check | Result | Evidence |
|-------|--------|----------|
| TASK_VALID_TRANSITIONS defined | ✓ | task_validation.gs lines 8–15 |
| setTaskStatus calls validateTaskTransition | ✓ | task_service.gs line 192 |
| Invalid transition throws | ✓ | cbvAssert(validateTaskTransition(...)) |
| ARCHIVED blocks edits | ✓ | ensureTaskEditable; cbvAssert(STATUS !== 'ARCHIVED') |
| NEW→DONE blocked | ✓ | NEW allows only ASSIGNED, CANCELLED |

**PASS.**

---

## 4. Can checklist completion block task completion where required?

| Check | Result | Evidence |
|-------|--------|----------|
| ensureTaskCanComplete before DONE | ✓ | setTaskStatus line 191: if (newStatus === 'DONE') ensureTaskCanComplete(taskId) |
| Required items filter | ✓ | IS_REQUIRED=true and !IS_DONE |
| Throws on pending required | ✓ | cbvAssert(pendingRequired.length === 0, 'Required checklist...') |
| taskGetChecklistItems excludes deleted | ✓ | IS_DELETED filter in task_repository |

**PASS.**

---

## 5. Are attachment and update logs properly separated?

| Check | Result | Evidence |
|-------|--------|----------|
| Attachments in TASK_ATTACHMENT | ✓ | taskAppendAttachment → TASK_ATTACHMENT |
| No attachments in TASK_MAIN | ✓ | No attachment columns in record/patch |
| Logs in TASK_UPDATE_LOG | ✓ | taskAppendUpdateLog → TASK_UPDATE_LOG |
| No logs in TASK_MAIN | ✓ | No log columns |
| UPDATE_TYPE, CONTENT schema | ✓ | _addTaskUpdateLog uses UPDATE_TYPE, CONTENT |

**PASS.**

---

## 6. Is there any remaining misuse of HO_SO_MASTER as user source?

| Check | Result | Evidence |
|-------|--------|----------|
| HO_SO_MASTER used for | HTX validation only | taskFindHtxById(htxId) — HO_SO_TYPE=HTX |
| OWNER_ID source | USER_DIRECTORY | assertActiveUserId from 02_USER_SERVICE |
| REPORTER_ID source | USER_DIRECTORY | assertActiveUserId |
| DONE_BY source | USER_DIRECTORY or cbvUser fallback | mapCurrentUserEmailToInternalId |
| ACTOR_ID source | USER_DIRECTORY or cbvUser fallback | mapCurrentUserEmailToInternalId |

**PASS.** HO_SO_MASTER used only for HTX (business entity), not for user identity.

---

## 7. Is the runtime deployable by clasp?

| Check | Result | Evidence |
|-------|--------|----------|
| task_*.gs in filePushOrder | ✓ | task_repository, task_validation, task_service, task_bootstrap, task_test |
| Correct load order | ✓ | repository → validation → service → 20_TASK_SERVICE |
| rootDir | ✓ | 05_GAS_RUNTIME |
| Dependencies before task_* | ✓ | 02_USER_SERVICE, 03_SHARED_*, 01_ENUM_SERVICE load first |

**PASS.**

---

## Exact Runtime Issues

| # | Issue | Severity |
|---|-------|----------|
| 1 | Defensive `typeof assertActiveHtxId === 'function'` — validation skipped if load order wrong | LOW |
| 2 | ACTOR_ID/DONE_BY can store email when user not in USER_DIRECTORY — orphan ref possible | INFO |

---

## Exact Fixes Applied

**None.** Audit is read-only. No code changes.

---

## Final Verdict

| Category | Result |
|----------|--------|
| 1. createTask HTX_ID and users | **PASS** |
| 2. USER_DIRECTORY for user validation | **PASS** |
| 3. Workflow transitions enforced | **PASS** |
| 4. Checklist blocks completion | **PASS** |
| 5. Attachments and logs separated | **PASS** |
| 6. No HO_SO_MASTER as user source | **PASS** |
| 7. Deployable by clasp | **PASS** |

---

# **TASK GAS RUNTIME SAFE**

All checks pass. HTX_ID and user validations are correct; workflow enforced; checklist blocks DONE; attachments and logs separated; no misuse of HO_SO_MASTER for users; clasp deployment order is correct.
