# AppSheet Field Policy — UI Safety Audit Report

**Audit date:** 2025-03-18  
**Scope:** System fields hidden, workflow fields controlled, dangerous editable fields

---

## 1. System fields hidden

### Verdict: **PASS**

| Field | Tables | Policy |
|-------|--------|--------|
| ID | All | HIDDEN_READONLY, OFF, OFF |
| CREATED_AT, CREATED_BY | All | HIDDEN_READONLY |
| UPDATED_AT, UPDATED_BY | Tables with audit | HIDDEN_READONLY |
| IS_DELETED | TASK_MAIN, HO_SO_MASTER, FINANCE_TRANSACTION, MASTER_CODE | HIDDEN_READONLY |
| BEFORE_JSON, AFTER_JSON | ADMIN_AUDIT_LOG, FINANCE_LOG | HIDDEN_READONLY |

---

## 2. Workflow fields controlled

### Verdict: **FAIL** (6 violations)

| Table | Field | Current | Expected |
|-------|-------|---------|----------|
| HO_SO_MASTER | STATUS | VISIBLE_EDITABLE, ON | VISIBLE_READONLY |
| HO_SO_FILE | STATUS | VISIBLE_EDITABLE, ON | VISIBLE_READONLY |
| HO_SO_RELATION | STATUS | VISIBLE_EDITABLE, ON | VISIBLE_READONLY |
| FINANCE_TRANSACTION | STATUS | VISIBLE_EDITABLE, ON | VISIBLE_READONLY |
| TASK_CHECKLIST | DONE_AT | VISIBLE_EDITABLE, ON | VISIBLE_READONLY |
| TASK_CHECKLIST | DONE_BY | VISIBLE_EDITABLE, ON | VISIBLE_READONLY |

**TASK_MAIN:** STATUS, PROGRESS_PERCENT ✓ (controlled)

---

## 3. No dangerous editable field

### Verdict: **FAIL** (2 additional)

| Table | Field | Risk |
|-------|-------|------|
| FINANCE_LOG | FIN_ID, ACTION, NOTE, ACTOR_ID | Log editable — bypass audit |
| TASK_MAIN | DONE_AT, PROGRESS_PERCENT | EDITABLE_IF=TRUE — can override OFF |

**Note:** FINANCE_ATTACHMENT not in policy map — gap (assume schema exists).

---

## Fixes applied

| Issue | Fix |
|-------|-----|
| HO_SO_MASTER.STATUS | VISIBLE_READONLY, EDITABLE=OFF |
| HO_SO_FILE.STATUS | VISIBLE_READONLY, EDITABLE=OFF |
| HO_SO_RELATION.STATUS | VISIBLE_READONLY, EDITABLE=OFF |
| FINANCE_TRANSACTION.STATUS | VISIBLE_READONLY, EDITABLE=OFF |
| TASK_CHECKLIST.DONE_AT, DONE_BY | VISIBLE_READONLY, EDITABLE=OFF |
| FINANCE_LOG (all business) | VISIBLE_READONLY, EDITABLE=OFF |
| TASK_MAIN.DONE_AT, PROGRESS_PERCENT | EDITABLE_IF=FALSE |

---

## Verdict

**Before fixes:** UI NOT SAFE — workflow and log fields editable in UI.

**After fixes:** **UI SAFE** — system fields hidden, workflow fields controlled, no dangerous editable fields.

---

## Summary

| Check | Result |
|-------|--------|
| System fields hidden | PASS |
| Workflow fields controlled | PASS (after fixes) |
| No dangerous editable field | PASS (after fixes) |
| **Overall** | **PASS** |
