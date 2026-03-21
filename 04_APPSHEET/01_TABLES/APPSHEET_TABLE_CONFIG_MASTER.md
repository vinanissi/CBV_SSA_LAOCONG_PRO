# AppSheet Table Config Master — CBV_SSA_LAOCONG_PRO

Per-table canonical config: key, label, refs, enum fields, risks.

---

## Key / Label Map

| Table | Key | Label |
|-------|-----|-------|
| HO_SO_MASTER | ID | NAME |
| HO_SO_FILE | ID | FILE_NAME |
| HO_SO_RELATION | ID | RELATION_TYPE |
| TASK_MAIN | ID | TITLE |
| TASK_CHECKLIST | ID | TITLE |
| TASK_UPDATE_LOG | ID | ACTION |
| TASK_ATTACHMENT | ID | TITLE |
| FINANCE_TRANSACTION | ID | TRANS_CODE |
| FINANCE_ATTACHMENT | ID | TITLE |
| FINANCE_LOG | ID | ACTION |
| ENUM_DICTIONARY | ID | ENUM_VALUE |
| MASTER_CODE | ID | NAME |
| ADMIN_AUDIT_LOG | ID | ACTION |

---

## Ref Map

| Table | Column | Ref Table | Filter/Notes |
|-------|--------|-----------|--------------|
| HO_SO_MASTER | HTX_ID | HO_SO_MASTER | HO_SO_TYPE = "HTX" |
| HO_SO_FILE | HO_SO_ID | HO_SO_MASTER | |
| HO_SO_RELATION | FROM_HO_SO_ID, TO_HO_SO_ID | HO_SO_MASTER | |
| TASK_MAIN | RELATED_ENTITY_ID | Polymorphic | By RELATED_ENTITY_TYPE |
| TASK_CHECKLIST | TASK_ID | TASK_MAIN | |
| TASK_UPDATE_LOG | TASK_ID | TASK_MAIN | |
| TASK_ATTACHMENT | TASK_ID | TASK_MAIN | |
| FINANCE_TRANSACTION | RELATED_ENTITY_ID | Polymorphic | |
| FINANCE_ATTACHMENT | FINANCE_ID | FINANCE_TRANSACTION | |
| FINANCE_LOG | FIN_ID | FINANCE_TRANSACTION | |

OWNER_ID, REPORTER_ID, CREATED_BY, CONFIRMED_BY: User (email), not table ref.

---

## Enum Fields by Table

| Table | Field | ENUM_GROUP |
|-------|-------|------------|
| HO_SO_MASTER | HO_SO_TYPE, STATUS | HO_SO_TYPE, HO_SO_STATUS |
| HO_SO_FILE | FILE_GROUP, STATUS | FILE_GROUP, HO_SO_STATUS |
| HO_SO_RELATION | STATUS | HO_SO_STATUS |
| TASK_MAIN | TASK_TYPE, STATUS, PRIORITY, RELATED_ENTITY_TYPE | TASK_TYPE, TASK_STATUS, TASK_PRIORITY, RELATED_ENTITY_TYPE |
| TASK_CHECKLIST | IS_REQUIRED, IS_DONE | — (Yes/No) |
| TASK_ATTACHMENT | ATTACHMENT_TYPE | TASK_ATTACHMENT_TYPE |
| FINANCE_TRANSACTION | TRANS_TYPE, STATUS, CATEGORY, PAYMENT_METHOD, RELATED_ENTITY_TYPE | FINANCE_TYPE, FINANCE_STATUS, FIN_CATEGORY, PAYMENT_METHOD, RELATED_ENTITY_TYPE |
| FINANCE_ATTACHMENT | ATTACHMENT_TYPE | FINANCE_ATTACHMENT_TYPE |

---

## Critical Risks

| Table | Risk | Mitigation |
|-------|------|------------|
| TASK_MAIN | STATUS editable | Editable=FALSE; GAS action only |
| TASK_MAIN | PROGRESS_PERCENT editable | Editable=FALSE; checklist-derived |
| TASK_CHECKLIST | IS_DONE, DONE_AT, DONE_BY editable | Editable=FALSE; markChecklistDone only |
| TASK_UPDATE_LOG | Any column editable | ALL Editable=FALSE; GAS only |
| FINANCE_TRANSACTION | STATUS editable | Editable=FALSE |
| FINANCE_TRANSACTION | Business fields when CONFIRMED | Editable_If = [STATUS] <> "CONFIRMED" |
| FINANCE_LOG | Any column editable | Read-only |
| ADMIN_AUDIT_LOG | Any column editable | Read-only |

---

## Initial View Recommendations

| Table | Initial View |
|-------|--------------|
| HO_SO_MASTER | List, Detail |
| TASK_MAIN | Inbox/List, Detail |
| FINANCE_TRANSACTION | List, Detail, Confirm Queue |
| Child tables | Inline under parent Detail |
| Log tables | Inline, read-only |
