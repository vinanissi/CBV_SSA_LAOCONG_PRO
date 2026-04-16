# USER SYSTEM AUDIT REPORT

**Date:** 2025-03-18  
**Scope:** USER_SYSTEM_ARCHITECTURE, APPSHEET_USER_BINDING, 02_USER_SERVICE.js, USER_ROLE_PERMISSION_SPEC, business table bindings

---

## 1. ARCHITECTURE

| Check | Result | Evidence |
|-------|--------|----------|
| Chosen path justified correctly? | **PASS** | USER_SYSTEM_ARCHITECTURE: MASTER_CODE reuse, no schema change, single dynamic master-data system |
| Simple enough for current CBV scale? | **PASS** | No USER_DIRECTORY; convention-based mapping; minimal role model |
| Avoids parallel identity systems? | **PASS** | Single source: MASTER_CODE. ADMIN_EMAILS (GAS) + AppSheet Accounts are complementary, not parallel |

**Verdict: PASS**

---

## 2. IDENTITY SAFETY

| Check | Result | Evidence |
|-------|--------|----------|
| Machine IDs separated from display names? | **PASS** | Stored: MASTER_CODE.ID. Display: NAME or DISPLAY_TEXT |
| Email as identity mapping, not raw business key? | **PASS** | SHORT_NAME=email for lookup; business tables store ID. ACTOR_ID in logs = email for audit (explicit choice) |
| OWNER_ID / REPORTER_ID protected from free-text drift? | **PASS** | assertValidUserId rejects unknown values; getUserById accepts only ID, CODE, or email from registry |

**Gap:** REPORTER_ID not validated in GAS when provided; relies on AppSheet Valid_If.  
**Fix:** Optional assertValidUserId(REPORTER_ID) when non-empty — hardening only.

**Verdict: PASS**

---

## 3. ROLE MODEL

| Check | Result | Evidence |
|-------|--------|----------|
| Minimal and usable? | **PASS** | ADMIN, OPERATOR, VIEWER only |
| Role storage consistent? | **PASS** | ENUM_DICTIONARY (ROLE); USER rows PARENT_CODE; adminUpdateMasterCodeRow validates PARENT_CODE for USER |
| Role display and validation clear? | **PASS** | getEnumDisplay, getUserRole; assertRoleAllowed available |

**Gap:** adminCreateMasterCodeRow does not validate PARENT_CODE when MASTER_GROUP=USER. Invalid role (e.g. SUPERADMIN) could be created.  
**Fix:** Add assertValidEnumValue('ROLE', data.PARENT_CODE, 'PARENT_CODE') when MASTER_GROUP=USER and PARENT_CODE provided.

**Verdict: PASS** (with fix applied)

---

## 4. APPSHEET BINDING

| Check | Result | Evidence |
|-------|--------|----------|
| User dropdowns show human-friendly labels? | **PASS** | Display: NAME or DISPLAY_TEXT |
| Stored values machine-safe? | **PASS** | Store MASTER_CODE.ID |
| USEREMAIL() mapping documented clearly? | **PASS** | APPSHEET_USER_BINDING: LOOKUP formula with LOWER for case-insensitivity |

**Gap:** AppSheet LOOKUP(column, filter, default) syntax may vary. Alternative: `FIRST(SELECT(MASTER_CODE[ID], AND([MASTER_GROUP]="USER", [SHORT_NAME]=USEREMAIL())))` if LOOKUP filter form unsupported.

**Gap:** Existing slice/security filters use `[OWNER_ID] = USEREMAIL()` — assumes email. After migration to user ID, must change to: `[OWNER_ID] = FIRST(SELECT(MASTER_CODE[ID], AND([MASTER_GROUP]="USER", [SHORT_NAME]=USEREMAIL())))`. Document in migration steps.

**Verdict: PASS** (with migration note)

---

## 5. GAS SUPPORT

| Check | Result | Evidence |
|-------|--------|----------|
| Reusable helpers present? | **PASS** | getActiveUsers, getUserByEmail, getUserById, getUserDisplay, getUserRole, assertValidUserId, assertRoleAllowed, mapCurrentUserEmailToInternalId |
| Backend validation the true guard? | **PASS** | assertValidUserId in createTask, assignTask |
| Users/roles not hardcoded? | **PASS** | Loaded from MASTER_CODE; roles from ENUM_DICTIONARY |

**Gap:** createHoSo does not validate OWNER_ID when provided.  
**Gap:** setFinanceStatus uses cbvUser() for CONFIRMED_BY; should use mapCurrentUserEmailToInternalId() || cbvUser() for consistency.

**Verdict: PASS** (with fixes applied)

---

## 6. PERMISSION GOVERNANCE

| Check | Result | Evidence |
|-------|--------|----------|
| Permission model conservative and real? | **PASS** | ADMIN via ADMIN_EMAILS; OPERATOR/VIEWER via AppSheet slice; no fake RBAC |
| Limitations stated honestly? | **PASS** | USER_ROLE_PERMISSION_SPEC: "Role enforcement is partial"; "No GAS assertRoleAllowed in task/finance flows yet" |
| Admin control separated from normal operation? | **PASS** | assertAdminAuthority for admin ops; MASTER_CODE/ENUM edits restricted |

**Verdict: PASS**

---

## 7. CBV COMPLIANCE

| Check | Result | Evidence |
|-------|--------|----------|
| Aligned with locked CBV architecture? | **PASS** | Uses MASTER_CODE, ENUM_DICTIONARY, admin panel, display mapping |
| Practical for small-scale real usage? | **PASS** | No overengineering; migration path documented |

**Verdict: PASS**

---

## EXACT USER-SYSTEM ISSUES

| # | Issue | Severity | Location |
|---|-------|----------|----------|
| 1 | adminCreateMasterCodeRow does not validate PARENT_CODE for USER rows | Medium | 02_MASTER_CODE_ADMIN_SERVICE.js |
| 2 | createHoSo does not validate OWNER_ID when provided | Medium | 10_HOSO_SERVICE.js |
| 3 | setFinanceStatus uses cbvUser() for CONFIRMED_BY; should prefer user ID | Low | 30_FINANCE_SERVICE.js |
| 4 | REPORTER_ID not validated in createTask when provided | Low | 20_TASK_SERVICE.js |
| 5 | Slice/security filters assume [OWNER_ID]=USEREMAIL(); breaks after migration | Medium | APPSHEET_SECURITY_FILTERS, APPSHEET_SLICE_SPEC |
| 6 | AppSheet LOOKUP formula syntax may need verification | Low | APPSHEET_USER_BINDING |

---

## FIXES APPLIED

| # | Fix | File |
|---|-----|------|
| 1 | Add PARENT_CODE validation in adminCreateMasterCodeRow when MASTER_GROUP=USER | 02_MASTER_CODE_ADMIN_SERVICE.js |
| 2 | Add assertValidUserId for OWNER_ID in createHoSo when provided | 10_HOSO_SERVICE.js |
| 3 | Use mapCurrentUserEmailToInternalId() \|\| cbvUser() for CONFIRMED_BY in setFinanceStatus | 30_FINANCE_SERVICE.js |
| 4 | Add assertValidUserId for REPORTER_ID in createTask when provided | 20_TASK_SERVICE.js |
| 5 | Document slice filter migration in APPSHEET_USER_BINDING | APPSHEET_USER_BINDING.md |
| 6 | Add alternative LOOKUP formula (FIRST+SELECT) in APPSHEET_USER_BINDING | APPSHEET_USER_BINDING.md |

---

## FINAL VERDICT

**USER SYSTEM SAFE** — after fixes applied.

Remaining action: Update slice/security filters when migrating OWNER_ID to user ID (see APPSHEET_USER_BINDING migration note).
