# AppSheet Attachment System Master — CBV_SSA_LAOCONG_PRO

Attachment tables, UX, file policy, relation to parent modules.

---

## Attachment Tables

| Table | Parent | Parent Ref | Key | Label | Type Field |
|-------|--------|------------|-----|-------|------------|
| HO_SO_FILE | HO_SO_MASTER | HO_SO_ID | ID | FILE_NAME | FILE_GROUP |
| TASK_ATTACHMENT | TASK_MAIN | TASK_ID | ID | TITLE | TASK_ATTACHMENT_TYPE |
| FINANCE_ATTACHMENT | FINANCE_TRANSACTION | FINANCE_ID | ID | TITLE | FINANCE_ATTACHMENT_TYPE |

---

## File Column

| Table | Column | Type | DRIVE_FILE_ID |
|-------|--------|------|---------------|
| HO_SO_FILE | FILE_URL | File | Readonly |
| TASK_ATTACHMENT | FILE_URL | File | Readonly |
| FINANCE_ATTACHMENT | FILE_URL | File | Readonly |

**AppSheet:** FILE_URL Type = File. AppSheet handles upload; URL stored automatically.

---

## Inline UX

- **Filter:** [PARENT_REF] = [PARENT_TABLE].[ID]
- **IsPartOf:** ON — parent ref auto-linked when adding from parent detail
- **Parent ref:** Hidden in inline form

---

## Attachment Type Enums

| Field | Enum Group | Values |
|-------|------------|--------|
| HO_SO_FILE.FILE_GROUP | FILE_GROUP | CCCD, GPLX, DANG_KY_XE, HOP_DONG, KHAC |
| TASK_ATTACHMENT.ATTACHMENT_TYPE | TASK_ATTACHMENT_TYPE | DRAFT, RESULT, SOP, REFERENCE, OTHER |
| FINANCE_ATTACHMENT.ATTACHMENT_TYPE | FINANCE_ATTACHMENT_TYPE | INVOICE, RECEIPT, CONTRACT, PROOF, OTHER |

---

## Form Field Order

**HO_SO_FILE:** FILE_GROUP, FILE_NAME, FILE_URL, NOTE  
**TASK_ATTACHMENT:** ATTACHMENT_TYPE, TITLE, FILE_URL, NOTE  
**FINANCE_ATTACHMENT:** ATTACHMENT_TYPE, TITLE, FILE_URL, NOTE  

---

## Safety Rules

- Do not allow other values for type dropdowns
- FILE_URL = File type (critical for upload)
- GAS validates when used; AppSheet handles direct add in Phase 1

---

## EVIDENCE_URL (Legacy)

FINANCE_TRANSACTION.EVIDENCE_URL: single URL, legacy. New evidence → FINANCE_ATTACHMENT.
