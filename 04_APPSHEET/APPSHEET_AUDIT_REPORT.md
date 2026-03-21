# AppSheet Audit Report — Label + Ref + Slice + Field Policy Enforcement

**Date:** 2025-03-18  
**Scope:** CBV_SSA_LAOCONG_PRO full system  
**Phase:** Label, Ref, Slice, Field Policy enforcement pack

---

## 1. REPOSITORY / FILE AUDIT SUMMARY

| Category | Count | Notes |
|----------|-------|-------|
| Tables (schema_manifest) | 13 | Excludes ENUM_DICTIONARY (initAll) |
| MASTER_CODE columns | 17 | SHORT_NAME=email for USER; PARENT_CODE=role |
| User-related Ref columns | 5 | OWNER_ID (x2), REPORTER_ID, DONE_BY, CONFIRMED_BY |
| Log tables | 3 | TASK_UPDATE_LOG, FINANCE_LOG, ADMIN_AUDIT_LOG |
| Existing docs | 50+ | 04_APPSHEET/*.md |

**Schema note:** MASTER_CODE has SHORT_NAME (not EMAIL) and PARENT_CODE (not ROLE_CODE). For USER group: SHORT_NAME=email, PARENT_CODE=role. CBV convention documented in USER_SYSTEM_ARCHITECTURE.

---

## 2. ARCHITECTURE DECISIONS

| Decision | Value |
|----------|-------|
| MASTER_CODE key | ID |
| MASTER_CODE label | DISPLAY_TEXT |
| User ref storage | MASTER_CODE.ID |
| User ref display | DISPLAY_TEXT or NAME |
| USEREMAIL mapping | SHORT_NAME = USEREMAIL() → ID |
| Active user slice | ACTIVE_USERS |
| Log tables | Readonly; no Add/Edit/Delete |
| Workflow fields | Not directly editable in forms |

---

## 3. CURRENT FINDINGS

### 3.1 Label Inconsistencies

| Item | Before | After |
|------|--------|-------|
| MASTER_CODE label | NAME or CODE | DISPLAY_TEXT |
| ENUM_DICTIONARY label | ENUM_VALUE | DISPLAY_TEXT |
| User Ref display | Raw ID/email | DISPLAY_TEXT |

### 3.2 Ref Inconsistencies

| Column | Before | After |
|--------|--------|-------|
| TASK_MAIN.OWNER_ID | Text (email) | Ref → ACTIVE_USERS |
| TASK_MAIN.REPORTER_ID | Text (email) | Ref → ACTIVE_USERS |
| HO_SO_MASTER.OWNER_ID | Text | Ref → ACTIVE_USERS |
| TASK_CHECKLIST.DONE_BY | Text | Ref → ACTIVE_USERS |
| FINANCE_TRANSACTION.CONFIRMED_BY | Text | Ref → ACTIVE_USERS |
| HO_SO_MASTER.HTX_ID | Ref to HO_SO_MASTER | Ref → ACTIVE_HTX slice |

### 3.3 Slice Gaps

| Slice | Status |
|-------|--------|
| ACTIVE_USERS | **NEW** — required for user refs |
| ACTIVE_MASTER_CODES | **NEW** — generic active master |
| ACTIVE_HTX | **NEW** — HTX dropdown |
| HO_SO_ACTIVE | Exists (HO_SO_ACTIVE) |
| TASK_OPEN | Exists |
| TASK_DONE | Exists |
| FIN_DRAFT | Exists (FIN_DRAFT) |
| FIN_CONFIRMED | Exists |

### 3.4 Field Policy Gaps

| Item | Status |
|------|--------|
| System fields hidden | Documented; verify in AppSheet |
| Workflow fields readonly | STATUS, IS_DONE, DONE_AT, DONE_BY, PROGRESS_PERCENT |
| Log tables readonly | TASK_UPDATE_LOG, FINANCE_LOG, ADMIN_AUDIT_LOG |
| FINANCE Editable_If | [STATUS] <> "CONFIRMED" |

### 3.5 Security Filter Migration

| Filter | Before (email) | After (user ID) |
|--------|----------------|-----------------|
| TASK_MY_OPEN | [OWNER_ID] = USEREMAIL() | [OWNER_ID] = FIRST(SELECT(MASTER_CODE[ID], AND([MASTER_GROUP]="USER", [SHORT_NAME]=USEREMAIL()))) |
| Is current owner | [OWNER_ID] = USEREMAIL() | Same as above |

---

## 4. RISK LIST

| Risk | Severity | Mitigation |
|------|----------|------------|
| OWNER_ID/REPORTER_ID still text in live app | High | Apply Ref config; migrate existing data |
| No USER rows in MASTER_CODE | High | Create USER rows via admin before Ref config |
| Slice filter syntax varies by AppSheet version | Low | Verify in editor; use APPSHEET_SLICE_MAP formulas |
| LOOKUP/FIRST(SELECT) syntax | Low | Alternative formulas in APPSHEET_USER_BINDING |
| Log tables editable | Medium | Disable Add/Edit/Delete in UX |

---

## 5. FIXES APPLIED (This Pack)

| Artifact | Action |
|----------|--------|
| APPSHEET_LABEL_POLICY.md | Created |
| APPSHEET_REF_MAP.csv | Created (replaces/extends APPSHEET_REF_MAP.md) |
| APPSHEET_SLICE_MAP.md | Created |
| APPSHEET_FIELD_POLICY_MAP.csv | Created |
| APPSHEET_FIELD_POLICY_MAP.json | Created |
| APPSHEET_VIEW_ARCHITECTURE.md | Updated (Ref display, TASK_FORM, inline rules) |
| APPSHEET_MANUAL_CONFIG_CHECKLIST.md | Updated (slices, OWNER_ID/REPORTER_ID Ref, DONE_BY, CONFIRMED_BY) |

---

## 6. MUST-FIX vs OPTIONAL

### Must-Fix (Production Blockers)

1. Create ACTIVE_USERS slice before user Ref columns
2. Convert OWNER_ID, REPORTER_ID to Ref → ACTIVE_USERS
3. Set MASTER_CODE Label = DISPLAY_TEXT
4. Run ensureDisplayTextForMasterCodeRows() for USER rows
5. Create USER rows in MASTER_CODE (MASTER_GROUP=USER)
6. TASK_UPDATE_LOG, FINANCE_LOG: no Add/Edit/Delete

### Optional Improvements

1. ACTIVE_HTX slice for HTX_ID (can use table filter)
2. CONFIRMED_BY Ref (can stay text during migration)
3. DONE_BY Ref (GAS sets; can stay text during migration)
4. TASK_MY_OPEN filter migration (after user-ID migration)

---

## 7. CROSS-CHECK CONSISTENCY

| Check | Status |
|-------|--------|
| MASTER_CODE schema vs policy | ✓ SHORT_NAME, PARENT_CODE documented |
| ENUM_DICTIONARY vs policy | ✓ |
| GAS assertValidUserId | ✓ createTask, assignTask, createHoSo |
| APPSHEET_USER_BINDING | ✓ Valid_If, USEREMAIL formula |
| schema_manifest vs policy | ✓ All 13 tables covered |
| CLASP push order | ✓ 02_USER_SERVICE included |

---

## 8. FINAL VERDICT

**ENFORCEMENT PACK COMPLETE**

- All 8 required artifacts generated or updated
- Label policy: DISPLAY_TEXT primary
- Ref policy: user refs → ACTIVE_USERS; store ID
- Slice policy: ACTIVE_USERS, ACTIVE_HTX, etc. defined
- Field policy: system hidden, workflow readonly, logs readonly
- Manual checklist: step-by-step with exact formulas

**Next steps:** Apply in AppSheet Editor per APPSHEET_MANUAL_CONFIG_CHECKLIST. Create USER rows. Migrate existing email values to user ID if needed.
