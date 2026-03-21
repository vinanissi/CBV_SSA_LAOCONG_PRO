# TASK System — Realistic Test Scenarios

**Purpose:** Simulate real human usage, expose weaknesses before production  
**Mode:** User simulation (Staff, Manager, Admin, Careless)  
**Date:** 2025-03-18

---

# PART 1 — NORMAL OPERATION SCENARIOS

---

## SCENARIO 1 — Create Task

| Field | Value |
|-------|-------|
| **Name** | Create Task |
| **Role** | Staff (reporter) |
| **Precondition** | AppSheet configured; user has create permission |
| **Severity** | LOW |
| **Must fix before production?** | NO |

### Step-by-step actions

1. Staff opens AppSheet Task form
2. Enters TITLE: "Kiểm tra hồ sơ HTX A"
3. Selects OWNER_ID: "user_a@example.com" (initial assignee)
4. Selects PRIORITY: "HIGH"
5. Sets DUE_DATE: "2025-03-25"
6. Clicks Save → createTask() called
7. Staff realizes wrong person; clicks "Assign" → assignTask(taskId, "user_b@example.com") — **reassign flow**
8. Staff adds checklist: "Xác minh giấy tờ", "Kiểm tra sổ sách"
9. Staff uploads attachment (SOP type): "Quy trình kiểm tra.pdf"

### Expected system behavior

- Task created with STATUS=NEW
- assignTask: if NEW→ASSIGNED (or no change if same owner); reassign when same status logs NOTE
- Checklist items added; PROGRESS_PERCENT = 0
- Attachment added with ATTACHMENT_TYPE=SOP
- TASK_UPDATE_LOG has entries for create, assign, checklist, attachment

### Potential failure points

| # | Failure | Cause |
|---|---------|-------|
| 1 | OWNER_ID "user_b@example.com" does not exist | assignTask does not validate user exists |
| 2 | DUE_DATE in past | No validation; accepts any date |
| 3 | Attachment FILE_URL invalid/broken | No URL format or reachability check |

### Required fix

- **#1:** Optional: warn if OWNER_ID not in known list
- **#2:** Optional: DUE_DATE >= today (configurable)
- **#3:** Optional: FILE_URL format validation

### Severity: **LOW**

---

## SCENARIO 2 — Execute Task

| Field | Value |
|-------|-------|
| **Name** | Execute Task |
| **Role** | Staff (assignee) |
| **Precondition** | Task has 2 checklist items (item 1, item 2) |
| **Severity** | LOW |
| **Must fix before production?** | NO |

### Step-by-step actions

1. Assignee opens task (STATUS=ASSIGNED)
2. Clicks "Start" → updateTaskStatus(taskId, 'IN_PROGRESS', '')
3. **Wrong checklist click:** User intends to mark item 2 done but UI passes checklistId of item 1 (e.g. row order mismatch) → markChecklistDone(checklistId1, '')
4. Adds note: addTaskLogEntry(taskId, 'NOTE', 'Đã xác minh giấy tờ')
5. Uploads result attachment → createTaskAttachment({ TASK_ID, FILE_URL, ATTACHMENT_TYPE: 'RESULT' })
6. Marks remaining checklist item done
7. PROGRESS_PERCENT auto-updates to 100

### Expected system behavior

- STATUS: ASSIGNED → IN_PROGRESS
- markChecklistDone succeeds for passed ID (item 1 marked; user may have meant item 2)
- Progress syncs correctly from actual checklist state
- Log entries created
- Attachment with RESULT type stored

### Potential failure points

| # | Failure | Cause |
|---|---------|-------|
| 1 | Wrong item marked done | UI passes wrong checklistId; no confirmation dialog |
| 2 | User uploads wrong file (DRAFT instead of RESULT) | ATTACHMENT_TYPE is user-selected |
| 3 | No undo for mistaken mark | markChecklistUndone not implemented |

### Required fix

- **#1:** UI must pass correct row ID; show checklist with clear labels
- **#2:** UX guidance
- **#3:** Add markChecklistUndone (optional enhancement)

### Severity: **LOW**

---

## SCENARIO 3 — Complete Task

| Field | Value |
|-------|-------|
| **Name** | Complete Task |
| **Role** | Manager |
| **Precondition** | Task IN_PROGRESS; all required checklist done |
| **Severity** | LOW |
| **Must fix before production?** | NO |

### Step-by-step actions

1. Manager opens task (STATUS=IN_PROGRESS, PROGRESS=100%)
2. **Manager mistake:** Manager does NOT review checklist; clicks "Archive" before "Complete" — updateTaskStatus(taskId, 'ARCHIVED', '')
3. System rejects: DONE→ARCHIVED only; current is IN_PROGRESS
4. Manager corrects: clicks "Complete" → completeTask(taskId, 'Đã kiểm tra xong')
5. Task STATUS → DONE, DONE_AT set
6. Manager archives → updateTaskStatus(taskId, 'ARCHIVED', '')
7. Task STATUS → ARCHIVED

### Expected system behavior

- IN_PROGRESS→ARCHIVED invalid; validateTaskTransition fails
- completeTask calls ensureTaskCanComplete (required checklist done)
- DONE_AT, PROGRESS_PERCENT=100 set
- ARCHIVED transition allowed from DONE
- No further edits possible (ensureTaskEditable blocks)

### Potential failure points

| # | Failure | Cause |
|---|---------|-------|
| 1 | Manager archives before complete | Blocked by workflow; IN_PROGRESS→ARCHIVED invalid |
| 2 | No confirmation before Archive | Single action; no review period |
| 3 | Cannot reopen ARCHIVED task | By design |

### Required fix

- **#2:** Optional: confirmation dialog before Archive
- **#3:** By design; document

### Severity: **LOW**

---

# PART 2 — REALISTIC MISTAKES

---

## SCENARIO 4 — Wrong Input

| Field | Value |
|-------|-------|
| **Name** | Wrong Input |
| **Role** | Careless user |
| **Precondition** | Create/edit form open |
| **Severity** | MEDIUM |
| **Must fix before production?** | NO |

### Step-by-step actions

1. User creates task with TITLE="" (empty)
2. User creates task with OWNER_ID="" (empty)
3. User creates task with PRIORITY="SUPER_URGENT" (invalid enum)
4. User tries to edit STATUS field directly in AppSheet form
5. User leaves ATTACHMENT_TYPE empty when adding attachment
6. User adds log entry with action="" and note="test"

### Expected system behavior

| Action | Expected |
|--------|----------|
| TITLE empty | cbvAssert fails: "TITLE is required" |
| OWNER_ID empty | cbvAssert fails: "OWNER_ID is required" |
| PRIORITY invalid | assertValidEnumValue fails |
| Edit STATUS in form | AppSheet field readonly; no edit possible (if policy applied) |
| ATTACHMENT_TYPE empty | ensureRequired fails |
| Log action empty | addTaskLogEntry requires action in NOTE/QUESTION/ANSWER |

### Potential failure points

| # | Failure | Cause |
|---|---------|-------|
| 1 | AppSheet allows STATUS edit | Field policy not applied; Editable=ON |
| 2 | User bypasses form, calls API with bad data | Service validates; fails correctly |
| 3 | Error message not user-friendly | "TITLE is required" — technical; no i18n |
| 4 | DUE_DATE empty accepted | createTask allows empty DUE_DATE |
| 5 | OWNER_ID="unknown_user_123" accepted | No user existence check |

### Required fix

- **#1:** Verify APPSHEET_FIELD_POLICY_MAP applied; STATUS Editable=OFF
- **#3:** Add user-facing error messages; consider i18n
- **#4:** Optional: require DUE_DATE for certain TASK_TYPE
- **#5:** Optional: validate OWNER_ID against user list

### Severity: **MEDIUM**

---

## SCENARIO 5 — Workflow Violation

| Field | Value |
|-------|-------|
| **Name** | Workflow Violation |
| **Role** | Careless user / power user |
| **Precondition** | Task exists; AppSheet field policy may or may not be applied |
| **Severity** | **CRITICAL** (if bypass occurs) / HIGH (if blocked) |
| **Must fix before production?** | **YES** — verify field policy; sheet protection |

### Step-by-step actions

1. User has task STATUS=NEW; tries completeTask(taskId, 'Done') — NEW→DONE
2. User has task STATUS=DONE; tries addChecklistItem({ TASK_ID, TITLE: 'Extra' })
3. User has task STATUS=ARCHIVED; tries addTaskLogEntry(taskId, 'NOTE', 'Reopen?')
4. User deletes checklist row directly in Google Sheet (bypass)
5. User tries updateTaskStatus(taskId, 'IN_PROGRESS', '') when STATUS=DONE — DONE→IN_PROGRESS

### Expected system behavior

| Action | Expected |
|--------|----------|
| NEW→DONE | validateTaskTransition fails: "Invalid transition: NEW -> DONE" |
| Add checklist when DONE | ensureTaskEditable checks STATUS; DONE is editable (not ARCHIVED) — **GAP** |
| Add log when ARCHIVED | ensureTaskEditable fails: "Cannot edit ARCHIVED task" |
| Delete checklist in Sheet | No service protection; direct sheet edit — **BYPASS** |
| DONE→IN_PROGRESS | validateTaskTransition fails: "Invalid transition: DONE -> IN_PROGRESS" |

### Potential failure points

| # | Failure | Cause | Severity if occurs |
|---|---------|-------|-------------------|
| 1 | Add checklist when DONE | **FIXED** — addChecklistItem now blocks when STATUS=DONE | — |
| 2 | Delete checklist in Sheet | No GAS protection; user can delete rows directly | **CRITICAL** |
| 3 | AppSheet "Update row" action with STATUS=DONE | If action bypasses GAS, invalid transition possible | **CRITICAL** |
| 4 | Edit PROGRESS_PERCENT in form | Field policy should block; verify | **CRITICAL** |

### Required fix

- **#2:** MUST FIX — Sheet protection for TASK_CHECKLIST; or soft delete + service
- **#3:** MUST FIX — AppSheet actions MUST call GAS; no direct STATUS update
- **#4:** MUST FIX — Verify field policy: PROGRESS_PERCENT Editable=OFF

### Severity: **CRITICAL** (workflow bypass, data integrity); **HIGH** (if all blocks in place)

---

## SCENARIO 6 — Data Corruption

| Field | Value |
|-------|-------|
| **Name** | Data Corruption |
| **Role** | Careless user |
| **Precondition** | Create task / add attachment form |
| **Severity** | MEDIUM |
| **Must fix before production?** | NO |

### Step-by-step actions

1. User creates two tasks with identical TITLE and OWNER_ID (duplicate intent)
2. User adds attachment with FILE_URL="https://invalid-url-that-404s.com/file.pdf"
3. User assigns task to OWNER_ID="typo_user@examle.com" (typo)
4. User creates task with RELATED_ENTITY_ID="FAKE_ID_999" (non-existent reference)
5. User creates task with DUE_DATE="2020-01-01" (past date)

### Expected system behavior

| Action | Expected |
|--------|----------|
| Duplicate tasks | Both created; no duplicate check on TITLE |
| Invalid FILE_URL | Stored; no validation |
| Typo OWNER_ID | Stored; no user validation |
| Invalid RELATED_ENTITY_ID | Stored; no referential integrity check |
| Past DUE_DATE | Stored; no date validation |

### Potential failure points

| # | Failure | Cause |
|---|---------|-------|
| 1 | Duplicate tasks clutter list | No duplicate detection |
| 2 | Broken attachment links | No URL validation |
| 3 | Task assigned to non-existent user | No user lookup |
| 4 | Orphan references | No FK validation |
| 5 | Late tasks not flagged | No DUE_DATE vs today check |

### Required fix

- **#1:** Optional: warn on similar TITLE + OWNER within N days
- **#2:** Add URL format validation; optional HEAD check
- **#3:** Optional: validate OWNER_ID against user table/slice
- **#4:** Optional: validate RELATED_ENTITY_ID exists
- **#5:** Optional: DUE_DATE >= today or configurable

### Severity: **MEDIUM**

---

# PART 3 — EDGE CASES

---

## SCENARIO 7 — Missing Checklist

| Field | Value |
|-------|-------|
| **Name** | Missing Checklist |
| **Role** | Staff |
| **Precondition** | Task created; no checklist added |
| **Severity** | MEDIUM |
| **Must fix before production?** | NO |

### Step-by-step actions

1. User creates task with TITLE, OWNER_ID, PRIORITY
2. User does NOT add any checklist items
3. User assigns, starts task (NEW→ASSIGNED→IN_PROGRESS)
4. User clicks "Complete" → completeTask(taskId, 'No checklist needed')

### Expected system behavior

- ensureTaskCanComplete checks: pending required items
- If no checklist items: items.length=0; pendingRequired=[]; passes
- **DONE allowed with zero checklist items**

### Potential failure points

| # | Failure | Cause |
|---|---------|-------|
| 1 | Task completed without deliverable evidence | No checklist = no required items; DONE allowed |
| 2 | Progress = 0% but task DONE | When DONE, PROGRESS_PERCENT forced to 100 |
| 3 | Business expects checklist for certain TASK_TYPE | No rule: "TASK_TYPE=X requires checklist" |

### Required fix

- **#1:** Business rule: require at least 1 checklist item for certain TASK_TYPE
- **#2:** N/A — DONE sets 100%
- **#3:** Add ensureTaskHasChecklistIfRequired(taskId) for specific types

### Severity: **MEDIUM**

---

## SCENARIO 8 — Partial Completion

| Field | Value |
|-------|-------|
| **Name** | Partial Completion |
| **Role** | Careless user |
| **Precondition** | Task has required checklist; 50% done |
| **Severity** | HIGH |
| **Must fix before production?** | NO |

### Step-by-step actions

1. Task has 4 checklist items; 2 marked IS_REQUIRED=true
2. User marks 1 of 2 required items done (50% progress)
3. User clicks "Complete" → completeTask(taskId, 'Trying to finish early')

### Expected system behavior

- ensureTaskCanComplete filters: IS_REQUIRED=true AND IS_DONE=false
- pendingRequired.length > 0
- cbvAssert fails: "Required checklist items are not completed"
- **DONE blocked**

### Potential failure points

| # | Failure | Cause |
|---|---------|-------|
| 1 | User marks required item done by mistake | No undo (markChecklistUndone missing) |
| 2 | User adds new required item after partial completion | addChecklistItem allows; progress recalculates |
| 3 | User unmarks required item via sheet edit | Direct sheet edit bypasses service |

### Required fix

- **#1:** Add markChecklistUndone(checklistId) with ensureTaskEditable; sync progress
- **#2:** Consider blocking addChecklistItem when STATUS=DONE
- **#3:** Sheet protection; or audit for direct edits

### Severity: **HIGH**

---

## SCENARIO 9 — Late Task

| Field | Value |
|-------|-------|
| **Name** | Late Task |
| **Role** | Staff |
| **Precondition** | Task DUE_DATE in past; STATUS=IN_PROGRESS |
| **Severity** | LOW |
| **Must fix before production?** | NO |

### Step-by-step actions

1. Task has DUE_DATE="2025-03-10"; today is 2025-03-18
2. Task STATUS=IN_PROGRESS
3. User continues to edit task: add note, mark checklist, upload attachment
4. User completes task (late)

### Expected system behavior

- No DUE_DATE validation on edit
- All operations allowed (task not ARCHIVED)
- completeTask succeeds if checklist done
- **No "overdue" flag or block**

### Potential failure points

| # | Failure | Cause |
|---|---------|-------|
| 1 | Late tasks not visually flagged | No computed "OVERDUE" in UI |
| 2 | Manager cannot filter overdue | No slice/column for DUE_DATE < today |
| 3 | No escalation for overdue | No trigger or notification |
| 4 | User can set DUE_DATE to past when creating | No validation |

### Required fix

- **#1, #2:** Add virtual column or slice: OVERDUE = (DUE_DATE < TODAY() AND STATUS != DONE AND STATUS != CANCELLED)
- **#3:** Optional: time-driven trigger to notify
- **#4:** Optional: DUE_DATE >= today on create

### Severity: **LOW**

---

# PART 4 — ADMIN SCENARIOS

---

## SCENARIO 10 — Enum Change

| Field | Value |
|-------|-------|
| **Name** | Enum Change |
| **Role** | Admin |
| **Precondition** | Admin has ENUM_DICTIONARY access; tasks exist with old value |
| **Severity** | HIGH |
| **Must fix before production?** | NO |

### Step-by-step actions

1. Admin opens ENUM_DICTIONARY
2. Admin changes TASK_PRIORITY value "HIGH" → "CRITICAL" (or deactivates "HIGH")
3. Existing tasks have PRIORITY="HIGH"
4. User opens task list; filter by PRIORITY
5. User edits task; PRIORITY dropdown shows new values

### Expected system behavior

| Action | Expected |
|--------|----------|
| Enum value renamed | Existing rows keep old value; display may break |
| Enum value deactivated (IS_ACTIVE=false) | Valid_If filters inactive; old value may not show in dropdown |
| Task with PRIORITY="HIGH" | Stored value unchanged; display mapping may return empty or old |
| assertValidEnumValue on update | If "HIGH" removed from enum, validation fails on next edit |

### Potential failure points

| # | Failure | Cause |
|---|---------|-------|
| 1 | Orphan enum values | Tasks show blank or "HIGH" if display not updated |
| 2 | Cannot edit task with old enum | assertValidEnumValue fails |
| 3 | Bulk migration needed | No admin tool to migrate PRIORITY HIGH→CRITICAL |
| 4 | Display mapping cache | clearEnumCache may not run after admin edit |

### Required fix

- **#1:** Display mapping: show raw value if no display; or "Unknown (HIGH)"
- **#2:** Migration script or admin bulk update
- **#3:** Admin action: migrateEnumValue(TABLE, COLUMN, oldVal, newVal)
- **#4:** Admin enum edit must call clearEnumCache

### Severity: **HIGH**

---

## SCENARIO 11 — Master Code Change

| Field | Value |
|-------|-------|
| **Name** | Master Code Change |
| **Role** | Admin |
| **Precondition** | Task has RELATED_ENTITY_ID; admin has MASTER_CODE access |
| **Severity** | MEDIUM |
| **Must fix before production?** | NO |

### Step-by-step actions

1. Task has RELATED_ENTITY_TYPE="HTX", RELATED_ENTITY_ID="HTX_001"
2. Admin renames MASTER_CODE (MASTER_GROUP=HTX, CODE=HTX_001) NAME "HTX A" → "HTX Alpha"
3. Admin changes CODE from "HTX_001" to "HTX_001_V2"
4. User views task; RELATED_ENTITY_ID shows in detail

### Expected system behavior

| Action | Expected |
|--------|----------|
| NAME change | Display mapping uses NAME/DISPLAY_TEXT; shows "HTX Alpha" |
| CODE change | Task still has RELATED_ENTITY_ID="HTX_001"; broken reference if CODE is key |
| Display | getMasterCodeDisplay(MASTER_GROUP, CODE) — if CODE changed, lookup fails |

### Potential failure points

| # | Failure | Cause |
|---|---------|-------|
| 1 | Orphan RELATED_ENTITY_ID | Task points to old CODE; display shows code or blank |
| 2 | No referential integrity | RELATED_ENTITY_ID not validated against MASTER_CODE |
| 3 | Admin deletes master code | Task has dangling reference |

### Required fix

- **#1:** Display: show CODE if NAME not found; or "Unknown"
- **#2:** Optional: validate RELATED_ENTITY_ID on create/update
- **#3:** Soft delete (IS_DELETED); do not hard-delete referenced codes

### Severity: **MEDIUM**

---

## SCENARIO 12 — Audit Review

| Field | Value |
|-------|-------|
| **Name** | Audit Review |
| **Role** | Admin |
| **Precondition** | Task TASK_xyz completed; admin has access to TASK_UPDATE_LOG |
| **Severity** | LOW |
| **Must fix before production?** | NO |

### Step-by-step actions

1. Admin receives report: "Task TASK_xyz was completed but checklist looks wrong"
2. Admin opens TASK_UPDATE_LOG for TASK_ID=TASK_xyz
3. Admin traces: created → assigned → checklist added → checklist done → status DONE
4. **Admin mistake:** Admin tries to edit TASK_UPDATE_LOG NOTE field directly in AppSheet form (to "correct" a typo)
5. **Audit gap:** Admin finds TASK_CHECKLIST has 3 items but log shows only 2 "checklist done" entries; suspects one item was deleted via sheet
6. Admin verifies ACTOR_ID, CREATED_AT for each log entry

### Expected system behavior

- TASK_UPDATE_LOG fields VISIBLE_READONLY; edit blocked by field policy
- If policy not applied: direct edit would corrupt audit trail
- Log missing for "checklist deleted" — no service path for delete; direct sheet bypass
- Admin cannot trace who deleted checklist row

### Potential failure points

| # | Failure | Cause |
|---|---------|-------|
| 1 | Admin can edit log | Field policy not applied; TASK_UPDATE_LOG editable |
| 2 | Log missing for delete | Direct sheet delete; no CHECKLIST_REMOVED log |
| 3 | ACTOR_ID = "" or invalid | cbvUser() empty in webhook context |
| 4 | Audit trail incomplete | Bypass leaves gap |

### Required fix

- **#1:** MUST FIX — Apply field policy: TASK_UPDATE_LOG all columns readonly
- **#2:** MUST FIX — Sheet protection; or soft delete + service log
- **#3:** Ensure cbvUser() returns valid ID in webhook
- **#4:** Enforce all writes via service

### Severity: **LOW** (audit); **CRITICAL** if #1 or #2 occurs

---

# PART 5 — SYSTEM STRESS

---

## SCENARIO 13 — Multiple Users

| Field | Value |
|-------|-------|
| **Name** | Multiple Users |
| **Role** | Staff A, Staff B, Manager |
| **Precondition** | Task IN_PROGRESS; 2+ checklist items |
| **Severity** | HIGH |
| **Must fix before production?** | NO |

### Step-by-step actions

1. Task STATUS=IN_PROGRESS; PROGRESS=50%
2. User A opens task, marks checklist item 3 done (progress → 75%)
3. User B opens task (cached view), marks checklist item 2 done (progress → 75% in their view)
4. User A saves first → syncTaskProgress runs, PROGRESS=75%
5. User B saves second → syncTaskProgress runs, recalculates from current checklist state
6. Manager opens task, clicks Complete

### Expected system behavior

- Google Sheets: last write wins; no row-level locking
- syncTaskProgress reads current checklist, writes PROGRESS_PERCENT
- Both users' markChecklistDone succeed; order depends on timing
- Progress = 100% when all done; completeTask may run after

### Potential failure points

| # | Failure | Cause |
|---|---------|-------|
| 1 | Lost update | User B's markChecklistDone overwrites User A's if same row? No — different rows |
| 2 | Progress inconsistency | Brief window where progress lags; eventual consistency |
| 3 | CompleteTask race | Both users click Complete; idempotent — second returns TASK_NO_CHANGE |
| 4 | Checklist item marked done twice | markChecklistDone idempotent; returns success |
| 5 | _rows reads stale data | SpreadsheetApp has no transaction; read-your-writes not guaranteed |

### Required fix

- **#2:** Accept eventual consistency; progress syncs on next action
- **#5:** Document: "Avoid concurrent edit of same task when possible"
- Consider: lock task when user opens for edit (complex)

### Severity: **HIGH**

---

## SCENARIO 14 — Rapid Updates

| Field | Value |
|-------|-------|
| **Name** | Rapid Updates |
| **Role** | Careless user |
| **Precondition** | Task ASSIGNED; checklist complete |
| **Severity** | MEDIUM |
| **Must fix before production?** | NO |

### Step-by-step actions

1. User has task STATUS=ASSIGNED
2. User clicks Start → IN_PROGRESS
3. User immediately clicks Waiting → WAITING
4. User immediately clicks Resume → IN_PROGRESS
5. User clicks Complete (checklist done)
6. User double-clicks Archive (two rapid clicks)

### Expected system behavior

- Each transition validated
- Idempotent: same status returns TASK_NO_CHANGE
- Double Archive: first ARCHIVED; second would be updateTaskStatus(ARCHIVED) — but task is ARCHIVED, ensureTaskEditable blocks? No — updateTaskStatus checks current.STATUS !== ARCHIVED before idempotent check. If already ARCHIVED, ensureTaskEditable throws. So second Archive fails.
- Actually: updateTaskStatus(ARCHIVED) when current=ARCHIVED. ensureTaskEditable throws "Cannot edit ARCHIVED task". So second call fails. Good.

### Potential failure points

| # | Failure | Cause |
|---|---------|-------|
| 1 | Quota exceeded | Many GAS calls in short time; Apps Script daily quota |
| 2 | Webhook timeout | AppSheet action → GAS; slow response if many calls |
| 3 | Log flooded | Many TASK_UPDATE_LOG rows; may slow reads |
| 4 | User confused by rapid state change | UX: disable buttons during request |

### Required fix

- **#1:** Monitor quota; batch operations if needed
- **#2:** Optimize GAS; return quickly
- **#4:** Disable action button until response; or debounce

### Severity: **MEDIUM**

---

# PART 5B — ADDITIONAL SCENARIOS (Audit Remediation)

---

## SCENARIO 15 — Cancel by Mistake

| Field | Value |
|-------|-------|
| **Name** | Cancel by Mistake |
| **Role** | Careless user |
| **Precondition** | Task IN_PROGRESS; user intends to pause |
| **Severity** | MEDIUM |
| **Must fix before production?** | NO |

### Steps

1. User has task IN_PROGRESS
2. User clicks "Cancel" instead of "Waiting" → cancelTask(taskId, '')
3. Task STATUS → CANCELLED
4. User realizes mistake; no undo — CANCELLED is terminal for workflow (only ARCHIVED next)

### Expected behavior

- cancelTask succeeds; validateTaskTransition allows IN_PROGRESS→CANCELLED
- No un-cancel; CANCELLED→IN_PROGRESS not in TASK_VALID_TRANSITIONS
- Log: STATUS_CHANGE CANCELLED

### Failure points

| # | Failure | Cause |
|---|---------|-------|
| 1 | User cancels by mistake | No confirmation; no undo |
| 2 | Task lost for reuse | Must create new task |

### Severity: **MEDIUM**

---

## SCENARIO 16 — WAITING→DONE Direct

| Field | Value |
|-------|-------|
| **Name** | WAITING→DONE Direct |
| **Role** | Careless user |
| **Precondition** | Task STATUS=WAITING |
| **Severity** | LOW (blocked) |
| **Must fix before production?** | NO |

### Steps

1. Task STATUS=WAITING (user had clicked "Waiting")
2. User clicks "Complete" without resuming → completeTask(taskId, 'Done')
3. Service calls setTaskStatus(taskId, 'DONE', '')
4. validateTaskTransition('WAITING', 'DONE') → false (WAITING allows only IN_PROGRESS, CANCELLED)

### Expected behavior

- cbvAssert fails: "Invalid transition: WAITING -> DONE"
- Task remains WAITING
- No state change; no log for failed attempt

### Failure points

| # | Failure | Cause |
|---|---------|-------|
| 1 | If transition allowed | Service bug; TASK_VALID_TRANSITIONS must block |

### Severity: **LOW** (correctly blocked)

---

## SCENARIO 17 — ASSIGNED→DONE Direct

| Field | Value |
|-------|-------|
| **Name** | ASSIGNED→DONE Direct |
| **Role** | Careless user |
| **Precondition** | Task STATUS=ASSIGNED |
| **Severity** | LOW (blocked) |
| **Must fix before production?** | NO |

### Steps

1. Task STATUS=ASSIGNED
2. User clicks "Complete" without starting → completeTask(taskId, '')
3. validateTaskTransition('ASSIGNED', 'DONE') → false (ASSIGNED allows only IN_PROGRESS, CANCELLED)

### Expected behavior

- cbvAssert fails: "Invalid transition: ASSIGNED -> DONE"
- Task remains ASSIGNED

### Severity: **LOW** (correctly blocked)

---

## SCENARIO 18 — assignTask Blocked States

| Field | Value |
|-------|-------|
| **Name** | assignTask Blocked States |
| **Role** | Manager |
| **Precondition** | Task STATUS=WAITING or DONE |
| **Severity** | LOW (blocked) |
| **Must fix before production?** | NO |

### Steps

1. Task STATUS=WAITING; Manager calls assignTask(taskId, 'new_owner@example.com')
2. Service checks: ['NEW','ASSIGNED','IN_PROGRESS'].indexOf('WAITING') === -1
3. cbvAssert fails: "Cannot assign task in status: WAITING"
4. Repeat with STATUS=DONE → same failure

### Expected behavior

- assignTask blocks when STATUS not in NEW, ASSIGNED, IN_PROGRESS
- WAITING, DONE, CANCELLED, ARCHIVED all blocked

### Severity: **LOW** (correctly blocked)

---

## SCENARIO 19 — Form Edit Attempts on Workflow Fields

| Field | Value |
|-------|-------|
| **Name** | Form Edit Attempts on Workflow Fields |
| **Role** | Careless user |
| **Precondition** | AppSheet form open; field policy applied or not |
| **Severity** | **CRITICAL** (if editable) |
| **Must fix before production?** | **YES** |

### Steps

1. User opens task detail form
2. User tries to edit STATUS dropdown — expected: disabled or readonly
3. User tries to edit PROGRESS_PERCENT — expected: disabled
4. User tries to edit IS_DONE in checklist inline — expected: disabled
5. User tries to edit DONE_AT, DONE_BY in checklist — expected: disabled

### Expected behavior

| Field | Expected | If editable |
|-------|----------|-------------|
| STATUS | Editable=OFF | **CRITICAL** — workflow bypass |
| PROGRESS_PERCENT | Editable=OFF | **CRITICAL** — progress override |
| IS_DONE | Editable=OFF | **CRITICAL** — checklist bypass |
| DONE_AT, DONE_BY | Editable=OFF | **CRITICAL** — audit bypass |

### Failure points

| # | Failure | Cause |
|---|---------|-------|
| 1 | Any workflow field editable | Field policy not applied; APPSHEET_FIELD_POLICY_MAP not deployed |

### Required fix

- **MUST FIX:** Apply APPSHEET_FIELD_POLICY_MAP; verify each field Editable=OFF per checklist

### Severity: **CRITICAL** if any field editable

---

## SCENARIO 20 — Permission / Slice Bypass Attempt

| Field | Value |
|-------|-------|
| **Name** | Permission / Slice Bypass Attempt |
| **Role** | Careless user (VIEWER or restricted slice) |
| **Precondition** | AppSheet slice limits task visibility; user has limited role |
| **Severity** | HIGH |
| **Must fix before production?** | YES |

### Steps

1. User with VIEWER slice opens app; sees only tasks they own
2. User obtains taskId of another user's task (e.g. from URL, report, or shared link)
3. User calls completeTask(taskId, '') via webhook or custom action
4. GAS service has no role check — completes task if checklist done

### Expected behavior

- If webhook/action checks slice: request rejected
- If no check: task completed by unauthorized user
- Service layer does not enforce ownership; AppSheet slice is primary control

### Failure points

| # | Failure | Cause |
|---|---------|-------|
| 1 | User completes task they shouldn't see | Webhook does not validate requester vs task OWNER/slice |
| 2 | Direct API call bypasses slice | Service assumes caller authorized |

### Required fix

- **MUST FIX:** Webhook must validate: requester in allowed roles; task visible per slice
- Document: slice is primary; service has no role model

### Severity: **HIGH**

---

## SCENARIO 21 — Reassign While IN_PROGRESS

| Field | Value |
|-------|-------|
| **Name** | Reassign While IN_PROGRESS |
| **Role** | Manager |
| **Precondition** | Task IN_PROGRESS; assignee user_a working |
| **Severity** | MEDIUM |
| **Must fix before production?** | NO |

### Steps

1. User A has task IN_PROGRESS; marking checklist items
2. Manager calls assignTask(taskId, 'user_b@example.com')
3. assignTask allows (IN_PROGRESS in allowed list)
4. OWNER_ID changes to user_b; log: "Reassigned to user_b@example.com"
5. User A may have stale view; User B sees task assigned to them

### Expected behavior

- assignTask succeeds; OWNER_ID updated
- Log created
- No lock; both users could have had form open
- Progress unchanged; checklist state preserved

### Failure points

| # | Failure | Cause |
|---|---------|-------|
| 1 | Assignee confusion | No notification; user A may continue editing |
| 2 | Duplicate work | Both users might mark same item |

### Severity: **MEDIUM**

---

## SCENARIO 22 — Long / Special TITLE Input

| Field | Value |
|-------|-------|
| **Name** | Long / Special TITLE Input |
| **Role** | Careless user |
| **Precondition** | Create task form |
| **Severity** | LOW |
| **Must fix before production?** | NO |

### Steps

1. User creates task with TITLE = 600 characters (exceeds 500)
2. createTask calls ensureMaxLength(data.TITLE, 500, 'TITLE')
3. cbvAssert fails: "TITLE must be at most 500 characters"
4. User tries TITLE = "<script>alert(1)</script>" — stored as-is (no XSS in AppSheet display if escaped)
5. User tries TITLE = "A" (single char) — ensureRequired passes; created

### Expected behavior

- TITLE > 500: rejected
- Special chars: stored; display layer must escape
- Single char: allowed

### Failure points

| # | Failure | Cause |
|---|---------|-------|
| 1 | XSS in display | AppSheet typically escapes; verify |
| 2 | Very long TITLE before fix | ensureMaxLength added in service |

### Severity: **LOW**

---

## SCENARIO 23 — Bulk Create (Optional)

| Field | Value |
|-------|-------|
| **Name** | Bulk Create |
| **Role** | Staff |
| **Precondition** | User needs to create 15 tasks |
| **Severity** | MEDIUM |
| **Must fix before production?** | NO |

### Steps

1. User creates 15 tasks in sequence via form
2. Each createTask() appends row, logs
3. 15 × (1 TASK_MAIN append + 1 TASK_UPDATE_LOG append) = 30 sheet writes
4. Apps Script quota: 50,000 URL fetches, 20,000 sheet operations/day

### Expected behavior

- All tasks created
- Quota sufficient for typical use
- No batch API; each create separate

### Failure points

| # | Failure | Cause |
|---|---------|-------|
| 1 | Quota exceeded | Many users bulk creating same day |
| 2 | Slow UX | 15 sequential webhook calls |

### Severity: **MEDIUM** (optional scenario)

---

# PART 6 — OUTPUT SUMMARY (per scenario)

| # | Scenario | Role | Severity | Must fix? |
|---|----------|------|----------|-----------|
| 1 | Create Task | Staff | LOW | NO |
| 2 | Execute Task | Staff | LOW | NO |
| 3 | Complete Task | Manager | LOW | NO |
| 4 | Wrong Input | Careless | MEDIUM | NO |
| 5 | Workflow Violation | Careless | CRITICAL/HIGH | **YES** |
| 6 | Data Corruption | Careless | MEDIUM | NO |
| 7 | Missing Checklist | Staff | MEDIUM | NO |
| 8 | Partial Completion | Careless | HIGH | NO |
| 9 | Late Task | Staff | LOW | NO |
| 10 | Enum Change | Admin | HIGH | NO |
| 11 | Master Code Change | Admin | MEDIUM | NO |
| 12 | Audit Review | Admin | LOW/CRITICAL | **YES** (if gaps) |
| 13 | Multiple Users | Staff/Manager | HIGH | NO |
| 14 | Rapid Updates | Careless | MEDIUM | NO |
| 15 | Cancel by Mistake | Careless | MEDIUM | NO |
| 16 | WAITING→DONE Direct | Careless | LOW | NO |
| 17 | ASSIGNED→DONE Direct | Careless | LOW | NO |
| 18 | assignTask Blocked | Manager | LOW | NO |
| 19 | Form Edit Workflow Fields | Careless | **CRITICAL** | **YES** |
| 20 | Permission Bypass | Careless | HIGH | **YES** |
| 21 | Reassign While IN_PROGRESS | Manager | MEDIUM | NO |
| 22 | Long/Special TITLE | Careless | LOW | NO |
| 23 | Bulk Create | Staff | MEDIUM | NO |

---

# PART 7 — FINAL SUMMARY

## 1. System Weaknesses Discovered

| # | Weakness | Scenario |
|---|----------|----------|
| 1 | No OWNER_ID validation (user exists) | 1, 4, 6 |
| 2 | No FILE_URL validation | 1, 6 |
| 3 | No DUE_DATE validation (past date) | 1, 6, 9 |
| 4 | No duplicate task detection | 6 |
| 5 | addChecklistItem allowed when DONE | 5 |
| 6 | Direct sheet edit bypasses service (delete checklist) | 5, 12 |
| 7 | No markChecklistUndone | 8 |
| 8 | Task completable with zero checklist | 7 |
| 9 | Enum change orphans existing data | 10 |
| 10 | Master code change orphans RELATED_ENTITY_ID | 11 |
| 11 | Race condition with concurrent users | 13 |
| 12 | No OVERDUE flag for late tasks | 9 |

## 2. Missing Validations

| Validation | Priority |
|------------|----------|
| OWNER_ID in user list | MEDIUM |
| FILE_URL format / reachability | LOW |
| DUE_DATE >= today (configurable) | LOW |
| RELATED_ENTITY_ID exists | LOW |
| TASK_TYPE requires checklist | MEDIUM |
| Block addChecklistItem when DONE | MEDIUM |

## 3. Workflow Gaps

| Gap | Fix |
|-----|-----|
| Can add checklist when DONE | **FIXED** — addChecklistItem blocks when STATUS=DONE |
| No unarchive | By design; document |
| No markChecklistUndone | Add with ensureTaskEditable, syncProgress |
| assignTask when WAITING | Currently blocked; document |

## 4. Data Integrity Risks

| Risk | Mitigation |
|------|------------|
| Direct sheet edit (delete row) | Sheet protection; audit for anomalies |
| Orphan enum values | Migration script; display fallback |
| Orphan RELATED_ENTITY_ID | Optional FK validation |
| Concurrent write conflict | Document; eventual consistency |

## 5. UI/UX Issues

| Issue | Fix |
|-------|-----|
| Error messages technical | i18n; user-friendly text |
| No OVERDUE indicator | Virtual column or slice |
| Rapid clicks cause multiple calls | Debounce; disable during request |
| Wrong checklist item marked | Clear row identification in UI |

## 6. Recommended Fixes (Priority Order)

| Priority | Fix |
|----------|-----|
| P0 | Verify AppSheet field policy applied (STATUS, PROGRESS, IS_DONE readonly) |
| P1 | Block addChecklistItem when STATUS=DONE — **DONE** |
| P1 | Add markChecklistUndone |
| P1 | Optional: require checklist for TASK_TYPE when business needs |
| P2 | OWNER_ID validation (warn if unknown) |
| P2 | DUE_DATE validation (configurable) |
| P2 | Enum change: migration path + display fallback |
| P3 | FILE_URL format validation |
| P3 | OVERDUE virtual column |
| P3 | Sheet protection for TASK_CHECKLIST |

---

# PART 8 — PRODUCTION GATE

## MUST FIX BEFORE PRODUCTION

| # | Issue | Scenario | Fix |
|---|-------|----------|-----|
| 1 | Workflow fields editable in form | 5, 19 | Apply APPSHEET_FIELD_POLICY_MAP: STATUS, PROGRESS_PERCENT, IS_DONE, DONE_AT, DONE_BY Editable=OFF |
| 2 | Direct sheet delete of checklist | 5, 12 | Sheet protection for TASK_CHECKLIST; or soft delete + service |
| 3 | AppSheet action bypasses GAS | 5 | All status changes via GAS webhook; no "Update row" for STATUS |
| 4 | TASK_UPDATE_LOG editable | 12 | All columns VISIBLE_READONLY |
| 5 | Permission/slice bypass | 20 | Webhook validates requester; task visible per slice |
| 6 | cbvUser() empty in webhook | 12 | Ensure ACTOR_ID populated in AppSheet→GAS context |

## OPTIONAL ENHANCEMENTS

| # | Enhancement | Scenario |
|---|-------------|----------|
| 1 | markChecklistUndone | 2, 8 |
| 2 | OWNER_ID validation | 1, 4, 6 |
| 3 | DUE_DATE validation | 1, 6, 9 |
| 4 | FILE_URL format validation | 1, 6 |
| 5 | OVERDUE virtual column | 9 |
| 6 | Require checklist for TASK_TYPE | 7 |
| 7 | Confirmation before Cancel/Archive | 3, 15 |
| 8 | User-friendly error messages | 4 |

---

# PART 9 — CRITICAL RISK RECLASSIFICATION

## Risks Elevated to CRITICAL

| Risk | Reasoning |
|------|-----------|
| **Workflow bypass via UI misconfiguration** | If STATUS, PROGRESS_PERCENT, IS_DONE, DONE_AT, DONE_BY are editable in AppSheet form, user can set DONE directly, bypass ensureTaskCanComplete, set PROGRESS=100 without checklist, mark IS_DONE without markChecklistDone. Full workflow and audit bypass. |
| **Direct sheet delete of checklist** | User deletes TASK_CHECKLIST row. Progress wrong (calculateProgress excludes deleted item). ensureTaskCanComplete may pass if required item was deleted. No log of who deleted. Data integrity + traceability broken. |
| **TASK_UPDATE_LOG editable** | If admin or user can edit log, audit trail corrupted. ACTOR_ID, NOTE, ACTION falsifiable. |

## Severity Matrix

| Condition | Severity |
|-----------|----------|
| Field policy applied; sheet protected; webhook validates | LOW–MEDIUM |
| Field policy NOT applied | **CRITICAL** |
| Sheet NOT protected | **CRITICAL** |
| Webhook does not validate permission | HIGH |

---

# PART 10 — IMPLEMENTATION OUTPUT SUMMARY

## 1. Updated Files

| File | Change |
|------|--------|
| 05_GAS_RUNTIME/03_SHARED_VALIDATION.gs | Added ensureMaxLength(value, maxLen, fieldName) |
| 05_GAS_RUNTIME/20_TASK_SERVICE.gs | TITLE max 500; block addChecklistItem when STATUS=DONE |
| 09_AUDIT/TASK_REALISTIC_TEST_SCENARIOS.md | 9 new scenarios; strengthened 1,2,3,12; CRITICAL reclassification; PRODUCTION GATE |
| 04_APPSHEET/APPSHEET_TASK_POLICY.md | **New** — workflow lock checklist, bypass risk |
| 04_APPSHEET/TASK_MODULE_FIELD_POLICY.md | Added Section 5: Bypass Risk |
| 04_APPSHEET/APPSHEET_FIELD_POLICY_MAP.md | Added TASK Bypass Risk (CRITICAL) callout |

## 2. Exact Scenarios Added

| # | Scenario | Role | Severity |
|---|----------|------|----------|
| 15 | Cancel by Mistake | Careless | MEDIUM |
| 16 | WAITING→DONE Direct | Careless | LOW |
| 17 | ASSIGNED→DONE Direct | Careless | LOW |
| 18 | assignTask Blocked States | Manager | LOW |
| 19 | Form Edit Attempts on Workflow Fields | Careless | **CRITICAL** |
| 20 | Permission / Slice Bypass Attempt | Careless | HIGH |
| 21 | Reassign While IN_PROGRESS | Manager | MEDIUM |
| 22 | Long / Special TITLE Input | Careless | LOW |
| 23 | Bulk Create (Optional) | Staff | MEDIUM |

## 3. Exact Service Rules Tightened

| Rule | Implementation |
|------|----------------|
| Block addChecklistItem when STATUS=DONE | cbvAssert(String(task.STATUS) !== 'DONE', 'Cannot add checklist when task is DONE') |
| TITLE max length 500 | ensureMaxLength(data.TITLE, 500, 'TITLE') in createTask, addChecklistItem |
| WAITING→DONE | Already blocked by TASK_VALID_TRANSITIONS |
| ASSIGNED→DONE | Already blocked by TASK_VALID_TRANSITIONS |
| assignTask when WAITING/DONE | Already blocked by cbvAssert status in NEW, ASSIGNED, IN_PROGRESS |

## 4. Exact AppSheet Policies Tightened

| Policy | Document |
|--------|----------|
| STATUS, PROGRESS_PERCENT, DONE_AT Editable=OFF | APPSHEET_FIELD_POLICY_MAP.csv (already) |
| IS_DONE, DONE_AT, DONE_BY Editable=OFF | APPSHEET_FIELD_POLICY_MAP.csv (already) |
| TASK_UPDATE_LOG all readonly | APPSHEET_FIELD_POLICY_MAP.csv (already) |
| Bypass risk documented | APPSHEET_TASK_POLICY.md, TASK_MODULE_FIELD_POLICY.md |
| Deployment checklist | APPSHEET_TASK_POLICY.md Section 3 |

## 5. CRITICAL Risks Now Identified

| Risk | Scenario | Mitigation |
|------|----------|------------|
| Workflow bypass via UI misconfiguration | 5, 19 | Apply field policy; verify Editable=OFF |
| Direct sheet delete of checklist | 5, 12 | Sheet protection; or soft delete + service |
| TASK_UPDATE_LOG editable | 12 | All columns readonly |
| Form edit of STATUS, PROGRESS, IS_DONE, DONE_AT, DONE_BY | 19 | Field policy; deployment verification |

## 6. MUST FIX BEFORE PRODUCTION

1. Apply APPSHEET_FIELD_POLICY_MAP: STATUS, PROGRESS_PERCENT, IS_DONE, DONE_AT, DONE_BY Editable=OFF
2. Sheet protection for TASK_CHECKLIST (or soft delete + service)
3. AppSheet actions call GAS webhook; no direct "Update row" for STATUS
4. TASK_UPDATE_LOG all columns readonly
5. Webhook validates requester permission / slice
6. cbvUser() returns valid ACTOR_ID in webhook context

## 7. Final Verdict

**TASK TEST COVERAGE SUFFICIENT**

- Workflow violations: WAITING→DONE, ASSIGNED→DONE, assignTask blocked — covered (Scenarios 16, 17, 18)
- Form edit attempts: Scenario 19
- CRITICAL risks: identified and documented
- MUST FIX / OPTIONAL: distinguished in PRODUCTION GATE
- Service: addChecklistItem when DONE blocked; TITLE max length
- 23 scenarios total; 9 new; 4 strengthened

**Remaining dependency:** Production deployment must apply field policy and sheet protection. Test coverage documents what to verify.

---

**Document status:** Complete. Use for pre-production testing and remediation.
