# Service Layer Safety Audit Report

**Audit date:** 2025-03-18  
**Scope:** TASK, HO_SO, FINANCE service layers

---

## 1. No Direct Write Bypass

### Verdict: **FAIL**

| Issue | Location | Risk |
|-------|----------|------|
| updateHoSo allows patch.STATUS | 10_HOSO_SERVICE.gs | Caller can set STATUS directly (e.g. NEW→ARCHIVED) bypassing setHoSoStatus workflow |
| 40_DISPLAY_MAPPING_SERVICE direct setValue | ensureDisplayTextForEnumRows, ensureDisplayTextForMasterCodeRows | Bypasses ENUM_ADMIN, MASTER_CODE_ADMIN; batch fill-only, lower risk |

**TASK, FINANCE:** All writes via service; no STATUS patch bypass.

---

## 2. Validation Always Applied

### Verdict: **FAIL**

| Issue | Location | Fix |
|-------|----------|-----|
| updateHoSo validates STATUS as enum but not as transition | 10_HOSO_SERVICE.gs | Block STATUS in patch; require setHoSoStatus for status changes |
| updateDraftTransaction allows AMOUNT patch without ensurePositiveNumber | 30_FINANCE_SERVICE.gs | If patch.AMOUNT present, ensurePositiveNumber |

**TASK:** ✓ All functions validated.

---

## 3. Logs Always Created

### Verdict: **FAIL**

| Module | Function | Logs? |
|--------|----------|-------|
| HO_SO | createHoSo | **No** |
| HO_SO | updateHoSo | **No** |
| HO_SO | setHoSoStatus | **No** |
| HO_SO | attachHoSoFile | **No** |
| FINANCE | createFinanceAttachment | **No** |
| TASK | All | ✓ addTaskUpdate |
| FINANCE | createTransaction, updateDraftTransaction, setFinanceStatus | ✓ logFinance |

**Note:** No HO_SO_LOG table in schema. Recommend ADMIN_AUDIT_LOG or new HO_SO_LOG for traceability.

---

## 4. Functions Idempotent

### Verdict: **FAIL**

| Function | Idempotent? |
|----------|-------------|
| setHoSoStatus | **No** — same status throws ensureTransition |
| setFinanceStatus | **No** — same status throws ensureTransition |
| setTaskStatus | ✓ |
| completeTask, cancelTask, assignTask | ✓ |
| markChecklistDone | ✓ |

---

## Fixes

| # | Fix |
|---|-----|
| 1 | updateHoSo: exclude STATUS from patch; document "use setHoSoStatus for status" |
| 2 | setHoSoStatus: add idempotent check (if same status return success) |
| 3 | setFinanceStatus: add idempotent check (if same status return success) |
| 4 | HO_SO: add logAdminAudit or create HO_SO_LOG; log create, update, status, attach |
| 5 | createFinanceAttachment: add logFinance(id, 'ATTACHMENT_ADDED', ...) |
| 6 | updateDraftTransaction: if patch.AMOUNT != null, ensurePositiveNumber(patch.AMOUNT, 'AMOUNT') |

---

## Summary

| Check | Result |
|-------|--------|
| No direct write bypass | FAIL (updateHoSo STATUS patch) |
| Validation always applied | FAIL (updateHoSo STATUS, updateDraftTransaction AMOUNT) |
| Logs always created | FAIL (HO_SO none, createFinanceAttachment none) |
| Functions idempotent | FAIL (setHoSoStatus, setFinanceStatus) |

---

## Verdict

**SERVICE NOT SAFE** — workflow bypass, missing logs, non-idempotent status changes.

After fixes: **SERVICE SAFE**.
