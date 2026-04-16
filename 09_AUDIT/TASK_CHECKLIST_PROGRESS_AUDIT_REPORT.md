# TASK Checklist & Progress Audit Report

**Audit date:** 2025-03-18  
**Scope:** Progress derivation, DONE block, manual override prevention

---

## 1. Progress derived from checklist

### Verdict: **PASS**

| Check | Result |
|-------|--------|
| calculateProgress reads TASK_CHECKLIST only | ✓ Lines 44–50 |
| Formula: doneCount / totalCount × 100 | ✓ |
| syncTaskProgress writes to TASK_MAIN.PROGRESS_PERCENT | ✓ |
| No other source for progress | ✓ |
| Triggers: addChecklistItem, markChecklistDone, setTaskStatus(DONE) | ✓ |

---

## 2. DONE blocked if incomplete

### Verdict: **PASS**

| Check | Result |
|-------|--------|
| ensureTaskCanComplete before DONE transition | ✓ setTaskStatus line 122 |
| Checks all required items done | ✓ 03_SHARED_VALIDATION.js |
| Blocks with clear message | ✓ "Required checklist items are not completed" |

---

## 3. No manual override

### Verdict: **FAIL** (1 issue)

| Check | Result |
|-------|--------|
| PROGRESS_PERCENT: GAS never accepts from input | ✓ |
| PROGRESS_PERCENT: AppSheet VISIBLE_READONLY | ✓ csv, json |
| TASK_CHECKLIST.IS_DONE: must change via GAS only | **VIOLATION** |

**Issue:** `APPSHEET_FIELD_POLICY_MAP.csv` sets `TASK_CHECKLIST.IS_DONE` as `VISIBLE_EDITABLE,ON,ON`. Users can edit IS_DONE directly in forms → bypasses `markChecklistDone` → `syncTaskProgress` never runs → progress out of sync. Also bypasses audit (DONE_AT, DONE_BY, CHECKLIST_DONE log).

**Expected:** IS_DONE = VISIBLE_READONLY (or VISIBLE_CONTROLLED) — change only via GAS `markChecklistDone`.

**Reference:** APPSHEET_FIELD_POLICY_MAP.md correctly states "VISIBLE_CONTROLLED (GAS or action)"; APPSHEET_MANUAL_CONFIG_CHECKLIST Step 5 says "Editable? = FALSE: ... IS_DONE ...".

---

## Fixes applied

| Issue | Fix |
|-------|-----|
| TASK_CHECKLIST.IS_DONE editable in AppSheet | Change to VISIBLE_READONLY in csv, json |

---

## Verdict

**CHECKLIST ENGINE READY** (after fix applied)

- Progress derived from checklist; DONE blocked when required incomplete; no manual override.
- APPSHEET_FIELD_POLICY_MAP: TASK_CHECKLIST.IS_DONE → VISIBLE_READONLY.
