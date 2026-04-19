# AppSheet Field Policy Map — Audit Report

**Audit date:** 2025-03-18  
**Scope:** 04_APPSHEET/APPSHEET_FIELD_POLICY_MAP.md  
**Reference:** schema_manifest.json, 01_ENUM_SEED.js, APPSHEET_PHASE1_CONFIG.md, APPSHEET_ENUM_BINDING.md

---

## 1. All Tables Covered

### Verdict: **PASS**

| Schema Table | In Policy Map |
|--------------|---------------|
| ADMIN_AUDIT_LOG | ✓ |
| MASTER_CODE | ✓ |
| HO_SO_MASTER | ✓ |
| HO_SO_FILE | ✓ |
| HO_SO_RELATION | ✓ |
| TASK_MAIN | ✓ |
| TASK_CHECKLIST | ✓ |
| TASK_UPDATE_LOG | ✓ |
| TASK_ATTACHMENT | ✓ |
| FINANCE_TRANSACTION | ✓ |
| FINANCE_LOG | ✓ |
| ENUM_DICTIONARY (seed) | ✓ |

**Fix applied:** Table count corrected from 13 to 12.

---

## 2. System and Audit Fields Hidden and Readonly

### Verdict: **PASS**

| Field | Policy | Correct |
|-------|--------|---------|
| ID | HIDDEN_READONLY, EDITABLE OFF | ✓ |
| CREATED_AT | HIDDEN_READONLY (or VISIBLE_READONLY for log tables) | ✓ |
| CREATED_BY | HIDDEN_READONLY | ✓ |
| UPDATED_AT | HIDDEN_READONLY | ✓ |
| UPDATED_BY | HIDDEN_READONLY | ✓ |
| IS_DELETED | HIDDEN_READONLY | ✓ |
| BEFORE_JSON | HIDDEN_READONLY | ✓ |
| AFTER_JSON | HIDDEN_READONLY | ✓ |
| CONFIRMED_AT | HIDDEN_READONLY | ✓ |
| CONFIRMED_BY | HIDDEN_READONLY | ✓ |

**Note:** ADMIN_AUDIT_LOG, TASK_UPDATE_LOG, FINANCE_LOG show CREATED_AT as VISIBLE_READONLY for sort/filter; acceptable for read-only log tables.

---

## 3. Enum-Backed Fields Classified as Controlled-Visible

### Verdict: **PASS**

| Table | Field | ENUM_GROUP | Policy | Correct |
|-------|-------|------------|--------|---------|
| HO_SO_MASTER | HO_SO_TYPE | HO_SO_TYPE | VISIBLE_CONTROLLED | ✓ |
| HO_SO_MASTER | STATUS | HO_SO_STATUS | VISIBLE_CONTROLLED (GAS only) | ✓ |
| HO_SO_FILE | FILE_GROUP | FILE_GROUP | VISIBLE_CONTROLLED | ✓ |
| HO_SO_FILE | STATUS | HO_SO_STATUS | VISIBLE_CONTROLLED | ✓ |
| HO_SO_RELATION | STATUS | HO_SO_STATUS | VISIBLE_CONTROLLED | ✓ |
| TASK_MAIN | TASK_TYPE | TASK_TYPE | VISIBLE_CONTROLLED | ✓ |
| TASK_MAIN | STATUS | TASK_STATUS | VISIBLE_CONTROLLED | ✓ |
| TASK_MAIN | PRIORITY | TASK_PRIORITY | VISIBLE_CONTROLLED | ✓ |
| TASK_MAIN | RELATED_ENTITY_TYPE | RELATED_ENTITY_TYPE | VISIBLE_CONTROLLED | ✓ |
| TASK_CHECKLIST | IS_DONE | — | VISIBLE_CONTROLLED | ✓ |
| TASK_UPDATE_LOG | ACTION | UPDATE_TYPE | VISIBLE_READONLY | ✓ |
| FINANCE_TRANSACTION | TRANS_TYPE | FINANCE_TYPE | VISIBLE_CONTROLLED | ✓ |
| FINANCE_TRANSACTION | STATUS | FINANCE_STATUS | VISIBLE_CONTROLLED | ✓ |
| FINANCE_TRANSACTION | CATEGORY | FIN_CATEGORY | VISIBLE_CONTROLLED | ✓ |
| FINANCE_TRANSACTION | PAYMENT_METHOD | PAYMENT_METHOD | VISIBLE_CONTROLLED | ✓ |
| FINANCE_TRANSACTION | RELATED_ENTITY_TYPE | RELATED_ENTITY_TYPE | VISIBLE_CONTROLLED | ✓ |
| MASTER_CODE | STATUS | MASTER_CODE_STATUS | VISIBLE_CONTROLLED | ✓ |

---

## 4. Master-Code-Backed Fields Classified Correctly

### Verdict: **PASS**

| Field | Classification | Notes |
|-------|----------------|-------|
| DON_VI_ID | REF_FIELD, VISIBLE_CONTROLLED | Ref to DON_VI (ACTIVE_DON_VI) |
| HTX_ID | REF_FIELD | Ref to HO_SO_MASTER |
| TASK_GROUP_CODE, CATEGORY_CODE, DOC_GROUP_CODE | Not in schema | Correctly excluded |

---

## 5. Finance Lock Fields Protected

### Verdict: **PASS** (after fixes)

| Field | Editable_If | Correct |
|-------|-------------|---------|
| TRANS_CODE | [STATUS] <> "CONFIRMED" | ✓ (added) |
| TRANS_DATE | [STATUS] <> "CONFIRMED" | ✓ (added) |
| TRANS_TYPE | [STATUS] <> "CONFIRMED" | ✓ |
| CATEGORY | [STATUS] <> "CONFIRMED" | ✓ |
| AMOUNT | [STATUS] <> "CONFIRMED" | ✓ |
| PAYMENT_METHOD | [STATUS] <> "CONFIRMED" | ✓ |
| DON_VI_ID | [STATUS] <> "CONFIRMED" | ✓ |
| COUNTERPARTY | [STATUS] <> "CONFIRMED" | ✓ |
| REFERENCE_NO | [STATUS] <> "CONFIRMED" | ✓ |
| RELATED_ENTITY_TYPE, RELATED_ENTITY_ID | [STATUS] <> "CONFIRMED" | ✓ |
| DESCRIPTION | [STATUS] <> "CONFIRMED" | ✓ |
| EVIDENCE_URL | [STATUS] <> "CONFIRMED" | ✓ |

**Fix applied:** TRANS_CODE and TRANS_DATE added to lock list for consistency with "Edit block after CONFIRMED".

---

## 6. Admin-Only Tables and Fields Identified

### Verdict: **PASS**

| Table | Admin-Only | Correct |
|-------|------------|---------|
| ENUM_DICTIONARY | Yes | ✓ |
| MASTER_CODE | Yes | ✓ |
| ADMIN_AUDIT_LOG | Yes | ✓ |

All edits via GAS; no inline add/edit for sensitive fields.

---

## 7. Business-Critical Fields Not Hidden Incorrectly

### Verdict: **PASS**

| Field | Policy | Correct |
|-------|--------|---------|
| NAME, CODE (HO_SO_MASTER) | VISIBLE_EDITABLE | ✓ |
| TITLE, DESCRIPTION (TASK_MAIN) | VISIBLE_EDITABLE | ✓ |
| TRANS_CODE, AMOUNT (FINANCE) | VISIBLE_EDITABLE / CONTROLLED | ✓ |
| FILE_NAME, FILE_URL | VISIBLE_EDITABLE | ✓ |

No business-critical field incorrectly hidden.

---

## 8. Field Names Aligned with Schema

### Verdict: **PASS**

All columns in policy map match schema_manifest.json and ENUM_DICTIONARY_HEADERS from 01_ENUM_SEED.js. No invented fields.

---

## 9. AppSheet Recommendations Practical for Phase 1

### Verdict: **PASS**

- Editable_If expressions use standard AppSheet syntax.
- Valid_If references ENUM_DICTIONARY with AND(ENUM_GROUP, IS_ACTIVE).
- No role-based column visibility assumed (no USER_ROLE sheet).
- Safe defaults provided per table.

---

## 10. Aligned with Locked CBV Rules

### Verdict: **PASS**

| CBV Rule | Policy Map |
|-----------|------------|
| Google Sheets as DB | ✓ |
| GAS as runtime | ✓ |
| AppSheet as UI | ✓ |
| ENUM_DICTIONARY as enum source | ✓ |
| MASTER_CODE as dynamic code source | ✓ |
| STATUS change via GAS only | ✓ |
| No inline edit of workflow fields | ✓ |
| Log tables read-only | ✓ |

---

## Fixes Applied

| Issue | Fix |
|-------|-----|
| Table count "13" | Corrected to 12 |
| TRANS_CODE, TRANS_DATE not locked when CONFIRMED | Added Editable_If `[STATUS] <> "CONFIRMED"` |
| PART 4 FINANCE_LOG: FIN_ID in Hidden | Moved FIN_ID to Visible (align with PART 1) |

---

## Final Verdict

**FIELD POLICY MAP SAFE**

All checks pass. Fixes applied. Ready for Phase 1 deployment.
