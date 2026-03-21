# TASK Production Gap Closure

**Date:** 2025-03-18  
**Scope:** 4 must-fix items for TASK production readiness

---

## 1. TASK_UPDATE_LOG Read-Only — CLOSED

| Action | File | Change |
|--------|------|--------|
| CSV policy | APPSHEET_FIELD_POLICY_MAP.csv | EDITABLE_IF_EXPRESSION: TRUE → FALSE for TASK_ID, ACTION, OLD_STATUS, NEW_STATUS, NOTE, ACTOR_ID |
| JSON policy | APPSHEET_FIELD_POLICY_MAP.json | Same 6 columns: EDITABLE_IF_EXPRESSION "TRUE" → "FALSE" |
| Manual checklist | APPSHEET_MANUAL_CONFIG_CHECKLIST.md §3.7 | Step 4: "Editable_If = FALSE. Operationally read-only. No add/edit/delete in AppSheet. Only GAS service writes." |

**Result:** TASK_UPDATE_LOG is now explicitly read-only everywhere. Allowed writes: GAS addTaskUpdate only.

---

## 2. PROGRESS_PERCENT Policy + Manual Checklist — CLOSED

| Action | File | Change |
|--------|------|--------|
| Manual checklist | APPSHEET_MANUAL_CONFIG_CHECKLIST.md §3.4 | Step 4: Added PROGRESS_PERCENT to Editable? = FALSE list. Note: "controlled-readonly, checklist-driven (syncTaskProgress), Editable_If = FALSE" |

**Result:** PROGRESS_PERCENT is explicitly locked and documented. Classification: controlled-readonly (derived from checklist).

---

## 3. Sheet Protection — CLOSED

| Action | File | Change |
|--------|------|--------|
| New GAS file | 05_GAS_RUNTIME/90_BOOTSTRAP_PROTECTION.gs | protectSensitiveSheets() — protects TASK_CHECKLIST, TASK_UPDATE_LOG, ENUM_DICTIONARY, MASTER_CODE |
| Menu | 90_BOOTSTRAP_MENU.gs | Added "Protect Sensitive Sheets" → protectSensitiveSheets |
| Deploy checklist | DEPLOY_CHECKLIST_LAOCONG_PRO.md | Added: run protectSensitiveSheets() after initAll() |

**Sheets protected:** TASK_CHECKLIST, TASK_UPDATE_LOG, ENUM_DICTIONARY, MASTER_CODE

**Limitations:**
- UI-level protection; owner can edit. GAS runs as owner.
- Does not protect against AppSheet writes (uses owner connection).
- Does not protect against API access with owner credentials.
- For older spreadsheets, use Data > Protect sheets manually.

---

## 4. Deployment Bypass Protection — CLOSED

| Action | File | Change |
|--------|------|--------|
| Task policy | APPSHEET_TASK_POLICY.md | §3: Deployment Must-Lock table; §5: Deployment Expectations (AppSheet vs GAS vs Webhook) |
| Deploy checklist | DEPLOY_CHECKLIST_LAOCONG_PRO.md | D. AppSheet: TASK workflow lock item |

**Workflow fields tightened:** STATUS, PROGRESS_PERCENT, DONE_AT (TASK_MAIN); IS_DONE, DONE_AT, DONE_BY (TASK_CHECKLIST); TASK_UPDATE_LOG (all columns)

**Deployment rules:**
- AppSheet: Lock all workflow fields; no "Update row" for status/progress.
- GAS: Validates transitions, enforces checklist.
- Webhook permission validation: Document as deployment requirement if not implemented.

---

## Manual AppSheet Actions Still Required

1. Apply APPSHEET_FIELD_POLICY_MAP (or follow APPSHEET_MANUAL_CONFIG_CHECKLIST §3.4, §3.5, §3.7)
2. Ensure TASK_MAIN Step 4 includes PROGRESS_PERCENT
3. Ensure TASK_UPDATE_LOG Step 4: Editable_If = FALSE for all columns
4. Run protectSensitiveSheets() from CBV_SSA menu after initAll()

---

## Functions to Run

| Function | When |
|----------|------|
| initAll() | After schema import |
| protectSensitiveSheets() | After initAll(); run as spreadsheet owner |

---

## Verdict

**TASK FINAL MUST-FIX CLOSED**
