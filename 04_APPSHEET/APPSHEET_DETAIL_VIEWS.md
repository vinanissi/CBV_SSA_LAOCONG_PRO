# AppSheet Detail Views — CBV_SSA_LAOCONG_PRO

Detail view specifications. Field order, visibility, inline children. Aligned with APPSHEET_FIELD_POLICY_MAP.md.

---

## HO_SO_DETAIL

| Property | Value |
|----------|-------|
| View | HO_SO_DETAIL |
| Table | HO_SO_MASTER |
| Type | Detail |
| Slice | HO_SO_ALL (IS_DELETED = FALSE) |
| Usage | Record detail; core business fields; inline files and relations |

### Field Order (visible)

| Order | Field | Visible | Readonly | Notes |
|-------|-------|---------|----------|-------|
| 1 | NAME | Yes | No | Label |
| 2 | CODE | Yes | No | |
| 3 | HO_SO_TYPE | Yes | No | Enum dropdown |
| 4 | STATUS | Yes | Yes | GAS action only |
| 5 | HTX_ID | Yes | No | Ref to HO_SO_MASTER |
| 6 | OWNER_ID | Yes | No | |
| 7 | PHONE | Yes | No | |
| 8 | EMAIL | Yes | No | |
| 9 | ID_NO | Yes | No | |
| 10 | ADDRESS | Yes | No | |
| 11 | START_DATE | Yes | No | |
| 12 | END_DATE | Yes | No | |
| 13 | NOTE | Yes | No | |
| 14 | TAGS | Yes | No | |

### Hidden Fields

ID, CREATED_AT, CREATED_BY, UPDATED_AT, UPDATED_BY, IS_DELETED

### Inline Child Views

| Inline View | Table | Filter |
|-------------|-------|--------|
| HO_SO_FILE_INLINE | HO_SO_FILE | [HO_SO_ID] = [HO_SO_MASTER].[ID] |
| HO_SO_RELATION_INLINE | HO_SO_RELATION | [FROM_HO_SO_ID] = [HO_SO_MASTER].[ID] OR [TO_HO_SO_ID] = [HO_SO_MASTER].[ID] |

### Order: Business fields first, then inline children. No JSON/internal clutter.

---

## TASK_DETAIL

| Property | Value |
|----------|-------|
| View | TASK_DETAIL |
| Table | TASK_MAIN |
| Type | Detail |
| Slice | TASK_OPEN or all |
| Usage | Task detail; core fields; inline checklist, attachments, log |

### Field Order (visible)

| Order | Field | Visible | Readonly | Notes |
|-------|-------|---------|----------|-------|
| 1 | TITLE | Yes | No | Label |
| 2 | TASK_CODE | Yes | No | |
| 3 | TASK_TYPE | Yes | No | Enum |
| 4 | STATUS | Yes | Yes | GAS action only |
| 5 | PRIORITY | Yes | No | Enum |
| 6 | OWNER_ID | Yes | No | |
| 7 | REPORTER_ID | Yes | No | |
| 8 | RELATED_ENTITY_TYPE | Yes | No | Enum |
| 9 | RELATED_ENTITY_ID | Yes | No | Ref |
| 10 | START_DATE | Yes | No | |
| 11 | DUE_DATE | Yes | No | |
| 12 | DONE_AT | Yes | Yes | Set by GAS |
| 13 | RESULT_NOTE | Yes | No | |
| 14 | DESCRIPTION | Yes | No | |

### Hidden Fields

ID, CREATED_AT, CREATED_BY, UPDATED_AT, UPDATED_BY, IS_DELETED

### Inline Child Views

| Inline View | Table | Filter |
|-------------|-------|--------|
| TASK_CHECKLIST_INLINE | TASK_CHECKLIST | [TASK_ID] = [TASK_MAIN].[ID] |
| TASK_ATTACHMENT_INLINE | TASK_ATTACHMENT | [TASK_ID] = [TASK_MAIN].[ID] |
| TASK_LOG_INLINE | TASK_UPDATE_LOG | [TASK_ID] = [TASK_MAIN].[ID] |

---

## FINANCE_DETAIL

| Property | Value |
|----------|-------|
| View | FINANCE_DETAIL |
| Table | FINANCE_TRANSACTION |
| Type | Detail |
| Slice | FINANCE_PENDING or FINANCE_CONFIRMED |
| Usage | Transaction detail; core fields; inline attachments, log |

### Field Order (visible)

| Order | Field | Visible | Readonly | Notes |
|-------|-------|---------|----------|-------|
| 1 | TRANS_CODE | Yes | When CONFIRMED | |
| 2 | TRANS_DATE | Yes | When CONFIRMED | |
| 3 | TRANS_TYPE | Yes | When CONFIRMED | Enum |
| 4 | STATUS | Yes | Yes | GAS action only |
| 5 | CATEGORY | Yes | When CONFIRMED | Enum |
| 6 | AMOUNT | Yes | When CONFIRMED | |
| 7 | DON_VI_ID | Yes | When CONFIRMED | Ref |
| 8 | COUNTERPARTY | Yes | When CONFIRMED | |
| 9 | PAYMENT_METHOD | Yes | When CONFIRMED | Enum |
| 10 | REFERENCE_NO | Yes | When CONFIRMED | |
| 11 | RELATED_ENTITY_TYPE | Yes | When CONFIRMED | Enum |
| 12 | RELATED_ENTITY_ID | Yes | When CONFIRMED | Ref |
| 13 | DESCRIPTION | Yes | When CONFIRMED | |
| 14 | EVIDENCE_URL | Yes | When CONFIRMED | Legacy |

### Hidden Fields

ID, CREATED_AT, CREATED_BY, UPDATED_AT, UPDATED_BY, IS_DELETED, CONFIRMED_AT, CONFIRMED_BY

### Editable_If (conditional)

```
[STATUS] <> "CONFIRMED"
```
For: TRANS_CODE, TRANS_DATE, TRANS_TYPE, CATEGORY, AMOUNT, DON_VI_ID, COUNTERPARTY, PAYMENT_METHOD, REFERENCE_NO, RELATED_ENTITY_TYPE, RELATED_ENTITY_ID, DESCRIPTION, EVIDENCE_URL

### Inline Child Views

| Inline View | Table | Filter |
|-------------|-------|--------|
| FIN_ATTACHMENT_INLINE | FINANCE_ATTACHMENT | [FINANCE_ID] = [FINANCE_TRANSACTION].[ID] |
| FIN_LOG_INLINE | FINANCE_LOG | [FIN_ID] = [FINANCE_TRANSACTION].[ID] |

---

## ENUM_DETAIL (Admin)

| Property | Value |
|----------|-------|
| View | ENUM_DETAIL |
| Table | ENUM_DICTIONARY |
| Type | Detail |
| Usage | Admin; enum row detail |

### Field Order (visible)

ENUM_GROUP, ENUM_VALUE, DISPLAY_TEXT, SORT_ORDER, IS_ACTIVE, NOTE

### Hidden

ID, CREATED_AT, CREATED_BY, UPDATED_AT, UPDATED_BY

### Readonly

All (edit via GAS) or ENUM_GROUP, ENUM_VALUE readonly; others via GAS only

---

## MASTER_CODE_DETAIL (Admin)

| Property | Value |
|----------|-------|
| View | MASTER_CODE_DETAIL |
| Table | MASTER_CODE |
| Type | Detail |
| Usage | Admin; master code detail |

### Field Order (visible)

MASTER_GROUP, CODE, NAME, DISPLAY_TEXT, SHORT_NAME, STATUS, SORT_ORDER, IS_SYSTEM, ALLOW_EDIT, NOTE

### Hidden

ID, CREATED_AT, CREATED_BY, UPDATED_AT, UPDATED_BY, IS_DELETED, PARENT_CODE

### Readonly

All (edit via GAS)

---

## ADMIN_AUDIT_LOG_DETAIL (Admin)

| Property | Value |
|----------|-------|
| View | ADMIN_AUDIT_LOG_DETAIL |
| Table | ADMIN_AUDIT_LOG |
| Type | Detail |
| Usage | Admin; audit log entry; read-only |

### Field Order (visible)

AUDIT_TYPE, ENTITY_TYPE, ENTITY_ID, ACTION, NOTE, ACTOR_ID, CREATED_AT

### Hidden

ID, BEFORE_JSON, AFTER_JSON

### Readonly

All
