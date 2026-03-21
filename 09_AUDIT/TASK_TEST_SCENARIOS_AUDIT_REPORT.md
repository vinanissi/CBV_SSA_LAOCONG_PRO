# TASK Test Scenarios — Audit Report

**Audit date:** 2025-03-18  
**Subject:** TASK_REALISTIC_TEST_SCENARIOS.md  
**Auditor:** Self-audit against 7 criteria

---

## 1. Are scenarios realistic?

### Verdict: **PASS** (with gaps)

| Scenario | Assessment |
|----------|------------|
| 1 Create Task | ✓ Realistic flow; Vietnamese context; create → assign → checklist → attachment |
| 2 Execute Task | ✓ Assignee workflow; marks done, adds note, uploads result |
| 3 Complete Task | ✓ Manager review → complete → archive |
| 4 Wrong Input | ✓ Common mistakes: empty fields, invalid enum, edit restricted field |
| 5 Workflow Violation | ✓ Attempts NEW→DONE, edit ARCHIVED, direct sheet delete |
| 6 Data Corruption | ✓ Typos, invalid URLs, past dates, fake IDs |
| 7 Missing Checklist | ✓ User skips checklist, completes anyway |
| 8 Partial Completion | ✓ 50% done, tries DONE |
| 9 Late Task | ✓ Overdue task; user continues working |
| 10 Enum Change | ✓ Admin changes enum; impact on existing tasks |
| 11 Master Code Change | ✓ Admin renames code; orphan reference |
| 12 Audit Review | ✓ Admin traces history; passive verification |
| 13 Multiple Users | ✓ Two users mark different checklist items; race |
| 14 Rapid Updates | ✓ Rapid status changes; double-click |

**Gaps:** Scenario 1 has createTask with OWNER_ID then assignTask — redundant (owner already set). Realistic would be: create with OWNER_A, then reassign to OWNER_B. Scenario 12 is passive (admin reads logs) rather than simulating admin mistakes.

---

## 2. Do they include real human mistakes?

### Verdict: **PASS** (partial)

| Mistake type | Covered? | Scenario |
|--------------|----------|----------|
| Empty required fields | ✓ | 4 |
| Invalid enum | ✓ | 4 |
| Edit restricted field | ✓ | 4 |
| Wrong workflow (NEW→DONE) | ✓ | 5 |
| Direct sheet bypass | ✓ | 5 |
| Typo in email | ✓ | 6 |
| Invalid URL | ✓ | 6 |
| Past date | ✓ | 6 |
| Complete without checklist | ✓ | 7 |
| Complete with partial checklist | ✓ | 8 |
| Mark wrong checklist item | Mentioned | 2 (failure point only) |
| Double-click / rapid click | ✓ | 14 |
| Wrong ATTACHMENT_TYPE selected | Mentioned | 2 (failure point only) |

**Missing mistakes:**
- User cancels task by mistake (no undo for CANCELLED)
- User assigns to wrong person, then reassigns
- User creates task with TITLE = "test" or single character
- User creates task with TITLE = 10,000 characters (overflow)
- User adds log with NOTE = "" (empty)
- User uploads attachment with FILE_URL = "not-a-url"
- User tries to complete from WAITING (skipping IN_PROGRESS)
- User filters by deleted/non-existent user

---

## 3. Are workflow violations properly tested?

### Verdict: **FAIL** (incomplete coverage)

| Transition / action | Tested? | Scenario |
|--------------------|---------|----------|
| NEW→DONE | ✓ | 5 |
| DONE→IN_PROGRESS | ✓ | 5 |
| ARCHIVED→edit (log) | ✓ | 5 |
| Add checklist when DONE | ✓ | 5 |
| Delete checklist (sheet) | ✓ | 5 |
| WAITING→DONE | **No** | — |
| ASSIGNED→DONE | **No** | — |
| CANCELLED→IN_PROGRESS | **No** | — |
| ARCHIVED→ARCHIVED (double archive) | Partial | 14 (logic discussed) |
| assignTask when WAITING | **No** | — |
| assignTask when DONE | **No** | — |
| Edit PROGRESS_PERCENT in form | Mentioned | 5 (verify policy) |
| Edit IS_DONE in form | **No** | — |
| Edit DONE_AT in form | **No** | — |

**Missing:** Explicit test of WAITING→DONE, ASSIGNED→DONE, CANCELLED→IN_PROGRESS, assignTask from WAITING/DONE. No explicit test that AppSheet form blocks STATUS, PROGRESS_PERCENT, IS_DONE, DONE_AT, DONE_BY.

---

## 4. Are edge cases meaningful?

### Verdict: **PASS**

| Edge case | Meaningful? | Reveals |
|-----------|-------------|---------|
| Zero checklist | ✓ | DONE allowed; business risk |
| Partial checklist (50%) | ✓ | DONE blocked; ensureTaskCanComplete works |
| Late task | ✓ | No OVERDUE flag; UX gap |
| Enum change | ✓ | Orphan values; migration needed |
| Master code change | ✓ | Orphan RELATED_ENTITY_ID |
| Multiple users | ✓ | Race; eventual consistency |
| Rapid updates | ✓ | Quota, timeout, UX |

**Weak:** Scenario 9 (Late Task) is low severity; could add "user sets DUE_DATE before START_DATE" or "DUE_DATE = CREATED_AT - 1 day".

---

## 5. Are failure points clearly identified?

### Verdict: **PASS**

- Each scenario has "Potential failure points" table
- Cause column explains root cause
- Expected vs actual behavior distinguished
- Severity assigned per scenario

**Weakness:** Some failure points are "potential" (might not occur if policy applied) vs "definite" (will occur). E.g. "AppSheet allows STATUS edit" — depends on deployment. Could add "Precondition: field policy NOT applied" for clarity.

---

## 6. Are fixes practical?

### Verdict: **PASS**

| Fix type | Assessment |
|----------|------------|
| Add validation | ✓ ensureRequired, assertValidEnumValue, etc. |
| Block in service | ✓ addChecklistItem when DONE |
| Add function | ✓ markChecklistUndone |
| Field policy | ✓ Verify Editable=OFF |
| Sheet protection | ✓ Protect TASK_CHECKLIST |
| Display fallback | ✓ Show raw value if enum missing |
| Migration script | ✓ migrateEnumValue |

**Weakness:** "Consider: lock task when user opens for edit (complex)" — vague; no concrete design. "Optional" used often — could distinguish "must fix" vs "nice to have" more clearly.

---

## 7. Are critical risks identified?

### Verdict: **FAIL**

- **No CRITICAL severity** in any scenario
- Highest is HIGH (4 scenarios)

**Potential CRITICAL risks not elevated:**
1. **AppSheet misconfiguration:** If STATUS editable in form, user can set DONE directly → full workflow bypass. Should be CRITICAL.
2. **Direct sheet delete of checklist:** User deletes row → progress wrong, ensureTaskCanComplete may pass incorrectly if required item deleted. Data integrity + audit broken. Should be CRITICAL.
3. **cbvUser() empty in webhook:** If ACTOR_ID="" for all log entries, audit trail useless. Should be HIGH at minimum.

**Recommendation:** Add CRITICAL severity for: (a) workflow bypass via UI misconfiguration, (b) direct sheet edit causing data corruption.

---

## Missing Scenarios

| # | Missing scenario | Role | Rationale |
|---|------------------|------|-----------|
| 1 | Cancel task by mistake | Careless | No undo for CANCELLED; common regret |
| 2 | Reassign while assignee working | Manager | assignTask from IN_PROGRESS; assignee confusion |
| 3 | WAITING→DONE direct | Careless | User tries to complete from WAITING without resuming |
| 4 | assignTask when DONE/WAITING | Manager | Explicit test of blocked states |
| 5 | Edit IS_DONE, DONE_AT in form | Careless | Verify AppSheet blocks (not just STATUS) |
| 6 | Very long TITLE / special chars | Careless | Truncation, XSS, schema limit |
| 7 | Empty NOTE in addTaskLogEntry | Careless | ensureRequired(note) — but action=STATUS_CHANGE? |
| 8 | Bulk create (10+ tasks) | Staff | Quota, performance |
| 9 | Mobile / slow connection | Staff | Timeout, partial save |
| 10 | Permission / slice bypass | Careless | User sees task they shouldn't; tries to complete |

---

## Weak Scenarios

| Scenario | Weakness | Improvement |
|----------|----------|-------------|
| 1 | Create then Assign redundant (owner already set) | Change to: create with OWNER_A, reassign to OWNER_B |
| 2 | "Marks wrong checklist item" not simulated | Add step: user clicks item 3 but UI passes item 2 ID |
| 3 | Too smooth; no manager mistake | Add: manager archives before reviewing checklist |
| 12 | Passive; admin only reads | Add: admin tries to edit log; admin finds gap in trace |
| 13 | Some failure points are "No — different rows" | Remove or reframe as "clarification" not failure |
| 14 | Double Archive logic is convoluted | Simplify: "Second Archive fails with Cannot edit ARCHIVED" |

---

## Improvements

| # | Improvement |
|---|-------------|
| 1 | Add 3–5 missing scenarios (Cancel by mistake, WAITING→DONE, assignTask blocked states, form field edit test) |
| 2 | Introduce CRITICAL severity for workflow bypass and direct sheet corruption |
| 3 | Add "Precondition" column where behavior depends on deployment (e.g. field policy) |
| 4 | Strengthen Scenario 1: reassign flow; Scenario 2: wrong checklist click |
| 5 | Add explicit test: "User opens task form, tries to edit STATUS dropdown — expected: disabled/readonly" |
| 6 | Add scenario: User with VIEWER role tries to complete task (permission) |
| 7 | Distinguish "Must fix before production" vs "Optional enhancement" in fixes |

---

## Summary by Category

| # | Category | Verdict |
|---|----------|---------|
| 1 | Realistic scenarios | PASS (gaps) |
| 2 | Real human mistakes | PASS (partial) |
| 3 | Workflow violations tested | FAIL (incomplete) |
| 4 | Edge cases meaningful | PASS |
| 5 | Failure points identified | PASS |
| 6 | Fixes practical | PASS |
| 7 | Critical risks identified | FAIL |

---

## Final Verdict

**TEST COVERAGE NOT SUFFICIENT**

**Rationale:**
- Workflow violation coverage incomplete (WAITING→DONE, ASSIGNED→DONE, assignTask blocked states, form field edit)
- No CRITICAL severity despite workflow bypass and data corruption risks
- Missing scenarios: cancel by mistake, reassign, permission, bulk, long input
- Weak scenarios: 1, 2, 3, 12 need strengthening

**To reach SUFFICIENT:**
1. Add 4–5 missing scenarios (cancel mistake, WAITING→DONE, assignTask blocked, form edit test, permission)
2. Elevate 2 risks to CRITICAL (workflow bypass via UI, direct sheet delete)
3. Strengthen weak scenarios (reassign flow, wrong checklist click, manager mistake)
4. Add precondition column for deployment-dependent behavior
