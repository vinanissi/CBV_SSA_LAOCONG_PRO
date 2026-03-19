# AppSheet Form Views — CBV_SSA_LAOCONG_PRO

Form view specifications. Field order, visibility, hidden/readonly. Aligned with APPSHEET_FIELD_POLICY_MAP.md and APPSHEET_INLINE_ATTACHMENT_UX.md.

---

## HO_SO_FORM

| Property | Value |
|----------|-------|
| View | HO_SO_FORM |
| Table | HO_SO_MASTER |
| Type | Form |
| Usage | Create/edit HO_SO record |

### Field Order (visible)

| Order | Field | Visible | Editable | Notes |
|-------|-------|---------|----------|-------|
| 1 | HO_SO_TYPE | Yes | Yes | Enum; Valid_If ENUM_DICTIONARY |
| 2 | CODE | Yes | Yes | GAS validates duplicate |
| 3 | NAME | Yes | Yes | |
| 4 | HTX_ID | Yes | Yes | Ref HO_SO_MASTER (HO_SO_TYPE=HTX) |
| 5 | OWNER_ID | Yes | Yes | |
| 6 | PHONE | Yes | Yes | |
| 7 | EMAIL | Yes | Yes | |
| 8 | ID_NO | Yes | Yes | |
| 9 | ADDRESS | Yes | Yes | |
| 10 | START_DATE | Yes | Yes | |
| 11 | END_DATE | Yes | Yes | |
| 12 | NOTE | Yes | Yes | |
| 13 | TAGS | Yes | Yes | |
| 14 | STATUS | Yes | No | GAS action only |

### Hidden Fields

ID, CREATED_AT, CREATED_BY, UPDATED_AT, UPDATED_BY, IS_DELETED

---

## HO_SO_FILE_FORM (child; inline from HO_SO_DETAIL)

| Property | Value |
|----------|-------|
| View | HO_SO_FILE_FORM |
| Table | HO_SO_FILE |
| Type | Form |
| Usage | Add file inline from HO_SO_DETAIL; parent ref auto-linked |

### Field Order (visible)

| Order | Field | Visible | Editable | Notes |
|-------|-------|---------|----------|-------|
| 1 | FILE_GROUP | Yes | Yes | Enum; Valid_If FILE_GROUP |
| 2 | FILE_NAME | Yes | Yes | |
| 3 | FILE_URL | Yes | Yes | Type = File |
| 4 | NOTE | Yes | Yes | |

### Hidden (inline)

HO_SO_ID (auto-linked), ID, DRIVE_FILE_ID, STATUS, CREATED_AT, CREATED_BY

---

## HO_SO_RELATION_FORM (child; inline from HO_SO_DETAIL)

| Property | Value |
|----------|-------|
| View | HO_SO_RELATION_FORM |
| Table | HO_SO_RELATION |
| Type | Form |
| Usage | Add relation inline; FROM or TO = current HO_SO |

### Field Order (visible)

| Order | Field | Visible | Editable | Notes |
|-------|-------|---------|----------|-------|
| 1 | FROM_HO_SO_ID | Yes | Yes | Ref; or pre-fill if adding "from" |
| 2 | TO_HO_SO_ID | Yes | Yes | Ref |
| 3 | RELATION_TYPE | Yes | Yes | No enum; free text |
| 4 | START_DATE | Yes | Yes | |
| 5 | END_DATE | Yes | Yes | |
| 6 | NOTE | Yes | Yes | |

### Hidden

ID, STATUS, CREATED_AT, CREATED_BY

### Readonly

STATUS (if shown)

---

## TASK_FORM

| Property | Value |
|----------|-------|
| View | TASK_FORM |
| Table | TASK_MAIN |
| Type | Form |
| Usage | Create/edit task |

### Field Order (visible)

| Order | Field | Visible | Editable | Notes |
|-------|-------|---------|----------|-------|
| 1 | TASK_TYPE | Yes | Yes | Enum |
| 2 | TITLE | Yes | Yes | |
| 3 | TASK_CODE | Yes | Yes | GAS may generate |
| 4 | PRIORITY | Yes | Yes | Enum |
| 5 | OWNER_ID | Yes | Yes | |
| 6 | REPORTER_ID | Yes | Yes | |
| 7 | RELATED_ENTITY_TYPE | Yes | Yes | Enum |
| 8 | RELATED_ENTITY_ID | Yes | Yes | Ref |
| 9 | START_DATE | Yes | Yes | |
| 10 | DUE_DATE | Yes | Yes | |
| 11 | DESCRIPTION | Yes | Yes | |
| 12 | RESULT_NOTE | Yes | Yes | |
| 13 | STATUS | Yes | No | GAS action only |

### Hidden

ID, DONE_AT, CREATED_AT, CREATED_BY, UPDATED_AT, UPDATED_BY, IS_DELETED

---

## TASK_CHECKLIST_FORM (child; inline from TASK_DETAIL)

| Property | Value |
|----------|-------|
| View | TASK_CHECKLIST_FORM |
| Table | TASK_CHECKLIST |
| Type | Form |
| Usage | Add checklist item inline; TASK_ID auto-linked |

### Field Order (visible)

| Order | Field | Visible | Editable | Notes |
|-------|-------|---------|----------|-------|
| 1 | ITEM_NO | Yes | Yes | |
| 2 | TITLE | Yes | Yes | |
| 3 | IS_REQUIRED | Yes | Yes | Yes/No |
| 4 | NOTE | Yes | Yes | |

### Hidden (inline)

TASK_ID (auto-linked), ID, IS_DONE, DONE_AT, DONE_BY, CREATED_AT, CREATED_BY

### Readonly

IS_DONE, DONE_AT, DONE_BY (GAS only)

---

## TASK_ATTACHMENT_FORM (child; inline from TASK_DETAIL)

| Property | Value |
|----------|-------|
| View | TASK_ATTACHMENT_FORM |
| Table | TASK_ATTACHMENT |
| Type | Form |
| Usage | Add attachment inline; TASK_ID auto-linked |

### Field Order (visible)

| Order | Field | Visible | Editable | Notes |
|-------|-------|---------|----------|-------|
| 1 | ATTACHMENT_TYPE | Yes | Yes | Enum; Valid_If TASK_ATTACHMENT_TYPE |
| 2 | TITLE | Yes | Yes | |
| 3 | FILE_URL | Yes | Yes | Type = File |
| 4 | NOTE | Yes | Yes | |

### Hidden (inline)

TASK_ID (auto-linked), ID, FILE_NAME, DRIVE_FILE_ID, CREATED_AT, CREATED_BY

---

## FINANCE_FORM

| Property | Value |
|----------|-------|
| View | FINANCE_FORM |
| Table | FINANCE_TRANSACTION |
| Type | Form |
| Usage | Create/edit transaction; safe for draft/open state |

### Field Order (visible)

| Order | Field | Visible | Editable | Notes |
|-------|-------|---------|----------|-------|
| 1 | TRANS_TYPE | Yes | When STATUS <> CONFIRMED | Enum |
| 2 | TRANS_DATE | Yes | When STATUS <> CONFIRMED | |
| 3 | CATEGORY | Yes | When STATUS <> CONFIRMED | Enum |
| 4 | AMOUNT | Yes | When STATUS <> CONFIRMED | |
| 5 | UNIT_ID | Yes | When STATUS <> CONFIRMED | Ref |
| 6 | COUNTERPARTY | Yes | When STATUS <> CONFIRMED | |
| 7 | PAYMENT_METHOD | Yes | When STATUS <> CONFIRMED | Enum |
| 8 | REFERENCE_NO | Yes | When STATUS <> CONFIRMED | |
| 9 | RELATED_ENTITY_TYPE | Yes | When STATUS <> CONFIRMED | Enum |
| 10 | RELATED_ENTITY_ID | Yes | When STATUS <> CONFIRMED | Ref |
| 11 | DESCRIPTION | Yes | When STATUS <> CONFIRMED | |
| 12 | EVIDENCE_URL | Yes | When STATUS <> CONFIRMED | Legacy |
| 13 | TRANS_CODE | Yes | When STATUS <> CONFIRMED | GAS may generate |
| 14 | STATUS | Yes | No | GAS action only |

### Hidden

ID, CREATED_AT, CREATED_BY, UPDATED_AT, UPDATED_BY, IS_DELETED, CONFIRMED_AT, CONFIRMED_BY

### Editable_If

`[STATUS] <> "CONFIRMED"` for all business fields except STATUS

---

## FINANCE_ATTACHMENT_FORM (child; inline from FINANCE_DETAIL)

| Property | Value |
|----------|-------|
| View | FINANCE_ATTACHMENT_FORM |
| Table | FINANCE_ATTACHMENT |
| Type | Form |
| Usage | Add evidence inline; FINANCE_ID auto-linked |

### Field Order (visible)

| Order | Field | Visible | Editable | Notes |
|-------|-------|---------|----------|-------|
| 1 | ATTACHMENT_TYPE | Yes | Yes | Enum; Valid_If FINANCE_ATTACHMENT_TYPE |
| 2 | TITLE | Yes | Yes | |
| 3 | FILE_URL | Yes | Yes | Type = File |
| 4 | NOTE | Yes | Yes | |

### Hidden (inline)

FINANCE_ID (auto-linked), ID, FILE_NAME, DRIVE_FILE_ID, CREATED_AT, CREATED_BY

---

## ENUM_FORM (Admin)

| Property | Value |
|----------|-------|
| View | ENUM_FORM |
| Table | ENUM_DICTIONARY |
| Type | Form |
| Usage | Create enum row; edit via GAS only |

### Field Order (visible)

ENUM_GROUP, ENUM_VALUE, DISPLAY_TEXT, SORT_ORDER, IS_ACTIVE, NOTE

### Hidden

ID, CREATED_AT, CREATED_BY, UPDATED_AT, UPDATED_BY

### Readonly

All (or create-only; edit via adminUpdateEnumRow)

---

## MASTER_CODE_FORM (Admin)

| Property | Value |
|----------|-------|
| View | MASTER_CODE_FORM |
| Table | MASTER_CODE |
| Type | Form |
| Usage | Create master code; edit via GAS only |

### Field Order (visible)

MASTER_GROUP, CODE, NAME, DISPLAY_TEXT, SHORT_NAME, NOTE

### Hidden

ID, PARENT_CODE, STATUS, SORT_ORDER, IS_SYSTEM, ALLOW_EDIT, CREATED_*, UPDATED_*, IS_DELETED

### Readonly

All (or create-only; edit via adminUpdateMasterCodeRow)

---

## ADMIN_AUDIT_LOG

No form. Read-only table.
