# AppSheet Field Policy Master — CBV_SSA_LAOCONG_PRO

Per-field policy: hidden/readonly/controlled/editable. **Source data:** APPSHEET_FIELD_POLICY_MAP.csv (authoritative).

---

## Policy Types

| Type | Show | Editable | Use |
|------|------|----------|-----|
| HIDDEN_READONLY | OFF | OFF | ID, audit fields, system |
| VISIBLE_READONLY | ON | OFF | Display only |
| VISIBLE_CONTROLLED | ON | OFF or conditional | GAS/action only |
| VISIBLE_EDITABLE | ON | ON | User input |

---

## Always-Hidden Fields

ID, CREATED_AT, CREATED_BY, UPDATED_AT, UPDATED_BY, IS_DELETED, BEFORE_JSON, AFTER_JSON, CONFIRMED_AT, CONFIRMED_BY

---

## Always Readonly (Editable=FALSE)

- **STATUS** (all tables): GAS action only
- **TASK_UPDATE_LOG, FINANCE_LOG, ADMIN_AUDIT_LOG:** all columns
- **TASK_MAIN:** STATUS, PROGRESS_PERCENT, DONE_AT
- **TASK_CHECKLIST:** IS_DONE, DONE_AT, DONE_BY
- **DRIVE_FILE_ID:** Set by GAS/upload
- **Parent refs when inline:** HO_SO_ID, TASK_ID, FINANCE_ID (IsPartOf auto-fill)

---

## TASK Bypass Risk (CRITICAL)

If any of these are editable in form, workflow and audit are bypassed:

| Table | Field | Policy |
|-------|-------|--------|
| TASK_MAIN | STATUS | Editable=OFF, Editable_If=FALSE |
| TASK_MAIN | PROGRESS_PERCENT | Editable=OFF, Editable_If=FALSE |
| TASK_MAIN | DONE_AT | Editable=OFF, Editable_If=FALSE |
| TASK_CHECKLIST | IS_DONE | Editable=OFF, Editable_If=FALSE |
| TASK_CHECKLIST | DONE_AT | Editable=OFF, Editable_If=FALSE |
| TASK_CHECKLIST | DONE_BY | Editable=OFF, Editable_If=FALSE |
| TASK_UPDATE_LOG | All | Editable=OFF, Editable_If=FALSE |

---

## Conditional Editable (Editable_If)

**FINANCE_TRANSACTION** business fields when STATUS = "CONFIRMED":
- Editable_If: `[STATUS] <> "CONFIRMED"`
- Applies to: TRANS_CODE, TRANS_DATE, TRANS_TYPE, CATEGORY, AMOUNT, DON_VI_ID, COUNTERPARTY, PAYMENT_METHOD, REFERENCE_NO, RELATED_ENTITY_TYPE, RELATED_ENTITY_ID, DESCRIPTION, EVIDENCE_URL

---

## Per-Table Summary

See APPSHEET_FIELD_POLICY_MAP.csv for full per-column policy. Key rules:
- Admin tables (ENUM_DICTIONARY, MASTER_CODE): all edits via GAS
- Log tables: read-only
- Workflow fields: GAS only
- FILE_URL: Type = File for attachment tables
