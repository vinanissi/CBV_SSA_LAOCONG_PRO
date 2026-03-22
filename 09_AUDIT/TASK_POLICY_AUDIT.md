# Task Field Policy and Workflow Enforcement Audit

**Date:** 2025-03-21  
**Scope:** APPSHEET_TASK_FIELD_POLICY.md, APPSHEET_TASK_ACTION_RULES.md, 20_TASK_SERVICE.gs, 20_TASK_VALIDATION.gs

---

## PASS/FAIL by Category

| # | Category | Result |
|---|----------|--------|
| 1 | Dangerous fields protected | **PASS** |
| 2 | STATUS still guarded | **PASS** |
| 3 | DONE_AT protected from manual misuse | **PASS** |
| 4 | REPORTER_ID treated safely | **PASS** |
| 5 | Task logs and attachments handled appropriately | **PASS** (with minor doc gap) |
| 6 | Workflow split AppSheet/GAS safe | **PASS** |
| 7 | Overall policy practical and CBV-compliant | **PASS** |

---

## 1. Dangerous Fields Protected

| Field | Policy | GAS | Verdict |
|-------|--------|-----|---------|
| ID | Editable=OFF | — | ✓ |
| STATUS | Editable=OFF | updateTask strips | ✓ |
| DONE_AT (TASK_MAIN) | Editable=OFF | updateTask strips | ✓ |
| PROGRESS_PERCENT | Editable=OFF | updateTask strips | ✓ |
| CREATED_*, UPDATED_*, IS_DELETED | Editable=OFF | — | ✓ |
| TASK_ID (children) | Editable=OFF; Allow Adds OFF | — | ✓ |
| IS_DONE, DONE_AT, DONE_BY (checklist) | Editable=OFF | markChecklistDone only | ✓ |
| TASK_UPDATE_LOG (all) | Editable=OFF; No Add/Edit/Delete | GAS only | ✓ |

**PASS.** All dangerous fields explicitly non-editable in policy; GAS enforces where applicable.

---

## 2. STATUS Still Guarded

| Check | Evidence |
|-------|----------|
| Policy: STATUS Editable=OFF | APPSHEET_TASK_FIELD_POLICY §1 |
| No direct STATUS edit in AppSheet | APPSHEET_TASK_ACTION_RULES §6 |
| GAS: updateTask blocks STATUS | 20_TASK_SERVICE.gs:123-126 `blocked = ['STATUS', 'DONE_AT', 'PROGRESS_PERCENT']` |
| Only paths: setTaskStatus, assignTask, completeTask, cancelTask | 20_TASK_SERVICE.gs |
| validateTaskTransition blocks invalid transitions | 20_TASK_VALIDATION.gs |
| NEW→DONE blocked | TASK_VALID_TRANSITIONS: NEW→['ASSIGNED','CANCELLED'] |

**PASS.** STATUS fully guarded; no free editing.

---

## 3. DONE_AT Protected from Manual Misuse

| Check | Evidence |
|-------|----------|
| TASK_MAIN.DONE_AT Editable=OFF | APPSHEET_TASK_FIELD_POLICY §1 |
| TASK_CHECKLIST.DONE_AT Editable=OFF | APPSHEET_TASK_FIELD_POLICY §2 |
| GAS: updateTask strips DONE_AT | 20_TASK_SERVICE.gs:123-126 |
| Only setter: completeTask | 20_TASK_SERVICE.gs:201-202 `patch.DONE_AT = cbvNow()` |
| Bypass risks documented | APPSHEET_TASK_FIELD_POLICY §5 |

**PASS.** DONE_AT cannot be manually set; only completion flow writes it.

---

## 4. REPORTER_ID Treated Safely

| Check | Evidence |
|-------|----------|
| Initial Value from USEREMAIL | `FIRST(SELECT(USER_DIRECTORY[ID], AND([STATUS] = "ACTIVE", [IS_DELETED] = FALSE, LOWER([EMAIL]) = LOWER(USEREMAIL()))))` |
| Ref constrained to ACTIVE_USERS | Valid_If; Allow Adds OFF |
| No injection risk | USEREMAIL() only; no user input |
| Editable with ref constraint | User can change to another ACTIVE user; cannot enter free text |

**PASS.** REPORTER_ID safe: auto-fill from current user; ref restricts to valid users.

---

## 5. Task Logs and Attachments Handled Appropriately

### TASK_UPDATE_LOG

| Check | Evidence |
|-------|----------|
| All columns Editable=OFF | Policy §4 |
| No Add/Edit/Delete from AppSheet | Policy §4; APPSHEET_TASK_PHASE1 §8 |
| GAS only | addTaskUpdateLog, setTaskStatus, etc. |

**PASS.**

### TASK_ATTACHMENT

| Check | Evidence |
|-------|----------|
| TASK_ID protected | Editable=OFF; Allow Adds OFF |
| Add allowed | Inline with TASK_ID pre-filled from parent |
| Destructive edits restricted | Policy: "no TASK_ID change" |
| Allow Delete | Not explicitly "OFF" in policy — **minor doc gap** |

**PASS** (intent clear; recommend adding "Allow Delete = OFF" to Phase 1 safeguards for TASK_ATTACHMENT).

---

## 6. Workflow Split AppSheet/GAS Safe

| Layer | Responsibility | Evidence |
|-------|----------------|---------|
| AppSheet | Display; action buttons invoke GAS | No direct STATUS/DONE_*/PROGRESS edit |
| GAS | Execution; validation; protected fields | updateTask strips; validateTaskTransition; ensureTaskCanComplete |
| Split | Buttons → GAS; no form edit of protected fields | Policy enforces Editable=OFF on all workflow fields |

**PASS.** Clear separation; GAS is workflow engine; AppSheet is UI.

---

## 7. Overall Policy Practical and CBV-Compliant

| Check | Evidence |
|-------|----------|
| Task belongs to HTX | HTX_ID → ACTIVE_HTX |
| Users shared | OWNER_ID, REPORTER_ID → ACTIVE_USERS |
| Valid_If constraints | Enum and ref restrictions |
| Small-scale practical | Action buttons; no complex rules |
| No free status editing | ✓ |
| No Done-field abuse | ✓ |

**PASS.**

---

## Exact Policy Issues

| # | Issue | Severity | Location |
|---|-------|----------|----------|
| 1 | TASK_ATTACHMENT "Allow Delete" not explicitly OFF in Phase 1 safeguards | Minor | APPSHEET_TASK_PHASE1 §8; APPSHEET_TASK_FIELD_POLICY §3 |
| 2 | Supporting docs (TASK_LOG_ACTION_MAP, APPSHEET_FIELD_POLICY_MAP, etc.) still reference RESULT_NOTE | Info | Multiple 04_APPSHEET files |
| 3 | APPSHEET_TASK_PHASE1 REPORTER_ID formula omits [IS_DELETED] = FALSE | Minor | APPSHEET_TASK_PHASE1 §5 — Field Policy has correct formula |

---

## Exact Fixes Applied

| # | Fix | Status |
|---|-----|--------|
| 1 | Add TASK_ATTACHMENT Allow Delete = OFF to Phase 1 safeguards | Applied |
| 2 | Align APPSHEET_TASK_PHASE1 REPORTER_ID formula with Field Policy | Applied |
| 3 | RESULT_NOTE → RESULT_SUMMARY in supporting docs | Deferred (separate cleanup) |

---

## Final Verdict

# **TASK POLICY SAFE**

All seven categories **PASS**. Dangerous fields are protected, STATUS is guarded, DONE_AT is protected, REPORTER_ID is safe, logs and attachments are handled appropriately, the AppSheet/GAS split is safe, and the policy is practical and CBV-compliant.

Minor doc fixes applied; supporting-doc RESULT_NOTE cleanup can follow as a separate task.
