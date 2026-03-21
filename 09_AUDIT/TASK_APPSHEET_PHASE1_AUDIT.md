# Task AppSheet Phase 1 Audit

**Audit date:** 2025-03-21  
**Scope:** APPSHEET_TASK_PHASE1, APPSHEET_TASK_REF_MAP, APPSHEET_TASK_FIELD_POLICY, APPSHEET_TASK_VIEW_MAP

---

## 1. Does HTX_ID point to active HTX only?

| Check | Result | Evidence |
|-------|--------|----------|
| Ref target = ACTIVE_HTX | ✓ | APPSHEET_TASK_REF_MAP, APPSHEET_TASK_PHASE1 |
| ACTIVE_HTX filter | ✓ | `AND([HO_SO_TYPE] = "HTX", [IS_DELETED] = FALSE)` |
| Valid_If restricts to slice | ✓ | `IN([HTX_ID], SELECT(HO_SO_MASTER[ID], AND([HO_SO_TYPE] = "HTX", [IS_DELETED] = FALSE)))` |

**PASS.**

**INFO:** ACTIVE_HTX does not filter HO_SO_MASTER.STATUS. INACTIVE or ARCHIVED HTX may appear in dropdown. If business requires STATUS=ACTIVE only, add to filter.

---

## 2. Do OWNER_ID and REPORTER_ID point to ACTIVE_USERS only?

| Check | Result | Evidence |
|-------|--------|----------|
| Ref target = ACTIVE_USERS | ✓ | All docs |
| ACTIVE_USERS filter | ✓ | `AND([STATUS] = "ACTIVE", [IS_DELETED] = FALSE)` |
| Valid_If restricts to slice | ✓ | `IN([OWNER_ID], SELECT(USER_DIRECTORY[ID], AND([STATUS] = "ACTIVE", [IS_DELETED] = FALSE)))` |

**PASS.**

---

## 3. Is Allow Adds OFF for operational refs?

| Ref | Allow Adds | Evidence |
|-----|------------|----------|
| HTX_ID | OFF | APPSHEET_TASK_PHASE1 §3, §8; APPSHEET_TASK_FIELD_POLICY |
| OWNER_ID | OFF | Same |
| REPORTER_ID | OFF | Same |
| TASK_ID (children) | OFF | Same |
| DONE_BY | OFF | Same |
| ACTOR_ID | OFF | Same |

**PASS.**

---

## 4. Does REPORTER_ID have safe initial value logic?

| Check | Result | Evidence |
|-------|--------|----------|
| Formula exists | ✓ | `FIRST(SELECT(USER_DIRECTORY[ID], AND([STATUS] = "ACTIVE", LOWER([EMAIL]) = LOWER(USEREMAIL()))))` |
| Scoped to ACTIVE users | ✓ | STATUS = "ACTIVE" in filter |
| Case-insensitive email | ✓ | LOWER([EMAIL]) = LOWER(USEREMAIL()) |
| No user input injection | ✓ | Uses USEREMAIL() only |
| Empty when no match | ✓ | FIRST of empty → empty; user selects manually |

**PASS.**

---

## 5. Are task child tables set up for inline usage?

| Child | Parent | Filter | IsPartOf | Read-only |
|-------|--------|--------|----------|-----------|
| TASK_CHECKLIST_INLINE | TASK_DETAIL | [TASK_ID] = [TASK_MAIN].[ID] | ON | No (Add allowed for checklist) |
| TASK_ATTACHMENT_INLINE | TASK_DETAIL | [TASK_ID] = [TASK_MAIN].[ID] | ON | No |
| TASK_LOG_INLINE | TASK_DETAIL | [TASK_ID] = [TASK_MAIN].[ID] | OFF | Yes |

**PASS.** All three children configured with correct filter; TASK_LOG read-only.

---

## 6. Is STATUS protected from uncontrolled editing?

| Check | Result | Evidence |
|-------|--------|----------|
| TASK_MAIN.STATUS Editable = OFF | ✓ | APPSHEET_TASK_FIELD_POLICY line 16 |
| Documented in safeguards | ✓ | APPSHEET_TASK_PHASE1 §6, §8 |
| Change via GAS only | ✓ | APPSHEET_TASK_PHASE1 §6 |

**PASS.**

---

## 7. Is the design minimal, safe, and CBV-compliant?

| Check | Result | Evidence |
|-------|--------|----------|
| Minimal | ✓ | 6 views; 4 slices; no extra tables |
| USER_DIRECTORY for users | ✓ | ACTIVE_USERS from USER_DIRECTORY |
| HO_SO_MASTER for HTX only | ✓ | ACTIVE_HTX slice; no user lookup from HO_SO |
| Workflow via GAS | ✓ | STATUS, PROGRESS_PERCENT, DONE_AT, IS_DONE, TASK_UPDATE_LOG non-editable |
| Bypass risks documented | ✓ | APPSHEET_TASK_FIELD_POLICY §5 |

**PASS.**

---

## Exact AppSheet Issues

| # | Issue | Severity |
|---|-------|----------|
| 1 | ACTIVE_HTX does not filter HO_SO_MASTER.STATUS — INACTIVE/ARCHIVED HTX may appear | INFO |
| 2 | USER_SYSTEM_ARCHITECTURE notes "ACTOR_ID remains email" — config uses ACTIVE_USERS ref; GAS may store email fallback | INFO |

---

## Exact Fixes Applied

**None.** Audit is read-only.

**Optional:** Add `AND([STATUS] = "ACTIVE")` to ACTIVE_HTX filter if INACTIVE/ARCHIVED HTX must not appear.

---

## Final Verdict

| Category | Result |
|----------|--------|
| 1. HTX_ID → active HTX | **PASS** |
| 2. OWNER_ID, REPORTER_ID → ACTIVE_USERS | **PASS** |
| 3. Allow Adds OFF | **PASS** |
| 4. REPORTER_ID initial value safe | **PASS** |
| 5. Child tables inline | **PASS** |
| 6. STATUS protected | **PASS** |
| 7. Minimal, safe, CBV-compliant | **PASS** |

---

# **TASK APPSHEET PHASE 1 SAFE**

All checks pass. HTX_ID, user refs, Allow Adds, REPORTER_ID default, inline children, STATUS protection, and CBV alignment are correctly configured.
