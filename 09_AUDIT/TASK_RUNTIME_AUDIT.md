# TASK Runtime Audit

**Audit date:** 2025-03-21  
**Scope:** GAS task runtime layer — 20_TASK_SERVICE, 20_TASK_VALIDATION, 20_TASK_REPOSITORY, 90_BOOTSTRAP_TASK, 99_DEBUG_TASK_TEST

## Load Order (.clasp.json filePushOrder)

20_TASK_REPOSITORY.gs → 20_TASK_VALIDATION.gs → 20_TASK_SERVICE.gs → 20_TASK_MIGRATION_HELPER.gs
90_BOOTSTRAP_TASK.gs (after 90_BOOTSTRAP_INIT)
99_DEBUG_TASK_TEST.gs (before 99_DEBUG_TEST_TASK)

---

## 1. Files Changed

| File | Action |
|------|--------|
| 20_TASK_REPOSITORY.gs | Created |
| 20_TASK_VALIDATION.gs | Created |
| 20_TASK_SERVICE.gs | Created |
| 90_BOOTSTRAP_TASK.gs | Created |
| 99_DEBUG_TASK_TEST.gs | Created |
| 20_TASK_SERVICE.gs | Replaced with stub; implementation in task_*.gs |
| 99_DEBUG_TEST_TASK.gs | Replaced with stub; runTaskTests in 99_DEBUG_TASK_TEST.gs |

---

## 2. Functions Added

### 20_TASK_REPOSITORY.gs
| Function | Purpose |
|----------|---------|
| taskFindById(taskId) | Find task by ID |
| taskGetChecklistItems(taskId) | Checklist items for task (excludes IS_DELETED) |
| taskFindChecklistById(checklistId) | Find checklist item |
| taskFindHtxById(htxId) | Validate HTX in HO_SO_MASTER |
| taskAppendMain(record) | Append TASK_MAIN row |
| taskUpdateMain(rowNumber, patch) | Update TASK_MAIN row |
| taskAppendChecklist(record) | Append TASK_CHECKLIST row |
| taskUpdateChecklist(rowNumber, patch) | Update TASK_CHECKLIST row |
| taskAppendAttachment(record) | Append TASK_ATTACHMENT row |
| taskAppendUpdateLog(record) | Append TASK_UPDATE_LOG row |

### 20_TASK_VALIDATION.gs
| Function | Purpose |
|----------|---------|
| assertActiveHtxId(htxId, fieldName) | HTX_ID → active HTX |
| validateTaskTransition(from, to) | STATUS transition check |
| ensureTaskEditable(taskId) | Block ARCHIVED edits |
| ensureTaskCanComplete(taskId) | Block DONE if required checklist incomplete |
| assertValidUpdateType(updateType) | UPDATE_TYPE enum |

### 20_TASK_SERVICE.gs (Public API)
| Function | Purpose |
|----------|---------|
| createTask(data) | Create task; HTX_ID, OWNER_ID required |
| updateTask(id, patch) | Partial update; STATUS/DONE_AT/PROGRESS protected |
| assignTask(taskId, ownerId) | Assign; NEW→ASSIGNED |
| setTaskStatus(taskId, newStatus, note) | Enforced transition |
| completeTask(taskId, resultSummary) | Mark DONE |
| cancelTask(taskId, note) | Mark CANCELLED |
| updateTaskStatus(taskId, newStatus, note) | Alias |
| addChecklistItem(data) | Add checklist |
| markChecklistDone(checklistId, note) | Mark item done |
| addTaskAttachment(data) | Add attachment |
| addTaskUpdateLog(data) | Add NOTE/QUESTION/ANSWER |
| addTaskLogEntry(taskId, action, note) | Legacy alias |
| createTaskAttachment(data) | Legacy alias |

### 90_BOOTSTRAP_TASK.gs
| Function | Purpose |
|----------|---------|
| taskBootstrapSheets() | Ensure TASK sheets exist with headers |

### 99_DEBUG_TASK_TEST.gs
| Function | Purpose |
|----------|---------|
| runTaskTests() | Full test suite |

---

## 3. Runtime Validation Summary

| # | Validation | Enforced By |
|---|------------|-------------|
| 1 | HTX_ID → active HTX | assertActiveHtxId (createTask, updateTask) |
| 2 | OWNER_ID → active user | assertActiveUserId |
| 3 | REPORTER_ID → active user | assertActiveUserId |
| 4 | TASK_ID child refs valid | taskFindById before addChecklistItem, addTaskAttachment, etc. |
| 5 | STATUS transitions | validateTaskTransition; setTaskStatus |
| 6 | DONE_AT only in valid flow | setTaskStatus(DONE) only; updateTask blocks DONE_AT |
| 7 | PROGRESS_PERCENT derived | syncTaskProgress; updateTask blocks PROGRESS_PERCENT |
| 8 | Required checklist blocks DONE | ensureTaskCanComplete before setTaskStatus(DONE) |

---

## 4. Workflow Enforcement Summary

| Rule | Implementation |
|------|----------------|
| NEW → ASSIGNED, CANCELLED only | TASK_VALID_TRANSITIONS |
| No NEW → DONE jump | validateTaskTransition blocks |
| ARCHIVED terminal | ensureTaskEditable blocks all edits |
| DONE requires checklist | ensureTaskCanComplete |
| PROGRESS from checklist | calculateProgress, syncTaskProgress |
| STATUS/DONE_AT/PROGRESS protected | updateTask strips blocked fields |
| All actions logged | _addTaskUpdateLog (UPDATE_TYPE, CONTENT) |

---

## 5. Exact Run Order for Test Functions

1. **runTaskTests()** — single entry point
   - Prerequisites: HTX and active user
   - Create task with HTX_ID
   - Add checklist
   - Block complete (required item not done)
   - Mark checklist done
   - Complete task
   - Workflow enforced (NEW→DONE blocked on fresh task)
   - Log written
   - Required fields enforced
   - HTX_ID required

**Dependencies before runTaskTests():**
- At least one HO_SO_MASTER row with HO_SO_TYPE=HTX, IS_DELETED=false
- At least one USER_DIRECTORY row with STATUS=ACTIVE, or signed-in user mapped

---

## 6. Strict Rules Compliance

| Rule | Status |
|------|--------|
| No uncontrolled direct sheet mutation | ✓ All via 20_TASK_REPOSITORY |
| No business logic in AppSheet | ✓ GAS-only workflow |
| No fake completion bypass | ✓ ensureTaskCanComplete |
| No HO_SO_MASTER as user source | ✓ USER_DIRECTORY only |
| Full copy-paste-ready code | ✓ |

---

## 7. Schema Alignment

| Schema | Runtime |
|--------|---------|
| TASK_MAIN.HTX_ID | ✓ Required, assertActiveHtxId |
| TASK_MAIN.RESULT_SUMMARY | ✓ (not RESULT_NOTE) |
| TASK_UPDATE_LOG.UPDATE_TYPE, CONTENT | ✓ |
| TASK_CHECKLIST (no SORT_ORDER) | ✓ ITEM_NO used |
| TASK_ATTACHMENT (no FILE_NAME) | ✓ TITLE only |
