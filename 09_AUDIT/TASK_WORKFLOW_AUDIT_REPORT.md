# TASK Workflow Audit Report

**Audit date:** 2025-03-18  
**Scope:** TASK status workflow — validation, blocking, logging, bypass prevention

---

## 1. All transitions validated

### Verdict: **PASS**

| Check | Result |
|-------|--------|
| setTaskStatus uses validateTaskTransition | ✓ Before _updateRow |
| TASK_VALID_TRANSITIONS covers all 7 states | ✓ NEW, ASSIGNED, IN_PROGRESS, WAITING, DONE, CANCELLED, ARCHIVED |
| Invalid from/to combinations blocked | ✓ cbvAssert throws |
| ARCHIVED explicit block | ✓ Line 89: `cbvAssert(String(current.STATUS) !== 'ARCHIVED', ...)` |
| DONE requires checklist | ✓ ensureTaskCanComplete before transition |

---

## 2. Invalid transitions blocked

### Verdict: **PASS**

| Blocked transition | Enforced by |
|--------------------|-------------|
| NEW → DONE | TASK_VALID_TRANSITIONS (NEW allows only ASSIGNED, CANCELLED) |
| ARCHIVED → any | ARCHIVED: [] + explicit ensureTaskEditable |
| WAITING → DONE | TASK_VALID_TRANSITIONS (WAITING allows only IN_PROGRESS, CANCELLED) |
| DONE → IN_PROGRESS | TASK_VALID_TRANSITIONS (DONE allows only ARCHIVED) |
| Any jump across flow | Map restricts to adjacent/exit only |

---

## 3. Status changes logged

### Verdict: **PASS**

| Event | Logged | ACTION | OLD_STATUS | NEW_STATUS |
|-------|--------|--------|-----------|------------|
| createTask | ✓ | CREATED | NEW | NEW |
| setTaskStatus | ✓ | STATUS_CHANGED | oldStatus | newStatus |

**TASK_UPDATE_LOG** receives every status change via `addTaskUpdate(taskId, 'STATUS_CHANGED', note, oldStatus, newStatus)`.

---

## 4. No direct bypass

### Verdict: **FAIL** (1 violation)

| Path | Status |
|------|--------|
| GAS: Only setTaskStatus updates STATUS | ✓ No updateTask or other write path |
| createTask: STATUS hardcoded 'NEW' | ✓ |
| AppSheet: STATUS inline editable | **VIOLATION** |

**Violation:** `APPSHEET_FIELD_POLICY_MAP.csv` line 74 sets `TASK_MAIN.STATUS` as `VISIBLE_EDITABLE,ON,ON`. If AppSheet is configured from this CSV, STATUS would be editable in forms → **direct bypass** of GAS workflow.

**Expected:** STATUS = VISIBLE_READONLY (or equivalent) — change only via actions that call setTaskStatus.

**Reference:** APPSHEET_FIELD_POLICY_MAP.md correctly states "VISIBLE_CONTROLLED (GAS action only)"; APPSHEET_MANUAL_CONFIG_CHECKLIST Step 4 says "Editable? = FALSE: ID, STATUS, DONE_AT, ...". CSV is out of sync.

---

## Fixes applied

| Issue | Fix |
|-------|-----|
| TASK_MAIN.STATUS in CSV = VISIBLE_EDITABLE | Change to VISIBLE_READONLY in APPSHEET_FIELD_POLICY_MAP.csv |

---

## Verdict

**WORKFLOW LOCKED** (after fix applied)

- GAS enforces all transitions; invalid transitions blocked; status changes logged.
- APPSHEET_FIELD_POLICY_MAP.csv: TASK_MAIN.STATUS → VISIBLE_READONLY, EDITABLE_DEFAULT=OFF.
