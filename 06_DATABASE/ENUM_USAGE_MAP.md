# ENUM Usage Map — CBV_SSA_LAOCONG_PRO

Table/column → enum group mapping for usage audit.

## ENUM_USAGE_CONFIG

| Table | Column | Enum Group | Required |
|-------|--------|------------|----------|
| TASK_MAIN | STATUS | TASK_STATUS | true |
| TASK_MAIN | PRIORITY | TASK_PRIORITY | true |
| TASK_MAIN | TASK_TYPE | TASK_TYPE | true |
| TASK_MAIN | RELATED_ENTITY_TYPE | RELATED_ENTITY_TYPE | false |
| MASTER_CODE | PARENT_CODE | ROLE | false |
| MASTER_CODE | STATUS | MASTER_CODE_STATUS | true |
| HO_SO_MASTER | HO_SO_TYPE | HO_SO_TYPE | true |
| HO_SO_MASTER | STATUS | HO_SO_STATUS | true |
| HO_SO_FILE | FILE_GROUP | FILE_GROUP | true |
| FINANCE_TRANSACTION | STATUS | FINANCE_STATUS | true |
| FINANCE_TRANSACTION | TRANS_TYPE | FINANCE_TYPE | true |
| FINANCE_TRANSACTION | CATEGORY | FIN_CATEGORY | true |
| FINANCE_TRANSACTION | PAYMENT_METHOD | PAYMENT_METHOD | false |
| FINANCE_TRANSACTION | RELATED_ENTITY_TYPE | RELATED_ENTITY_TYPE | false |
| TASK_ATTACHMENT | ATTACHMENT_TYPE | TASK_ATTACHMENT_TYPE | false |
| FINANCE_ATTACHMENT | ATTACHMENT_TYPE | FINANCE_ATTACHMENT_TYPE | false |

## ENUM_CONFIG Groups

| Group | Purpose |
|-------|---------|
| ROLE | User roles (ADMIN, OPERATOR, VIEWER) |
| HO_SO_TYPE | Hồ sơ type (HTX, XA_VIEN, XE, TAI_XE) |
| HO_SO_STATUS | Hồ sơ status |
| FILE_GROUP | File groups (CCCD, GPLX, etc.) |
| TASK_TYPE | Task types |
| TASK_STATUS | Task workflow status |
| TASK_PRIORITY | Task priority |
| ATTACHMENT_TYPE | Generic attachment type |
| TASK_ATTACHMENT_TYPE | Task-specific attachment type |
| FINANCE_ATTACHMENT_TYPE | Finance attachment type |
| UPDATE_TYPE | Task update log type |
| FINANCE_TYPE | Income/Expense |
| FINANCE_STATUS | Finance transaction status |
| FIN_CATEGORY | Finance category |
| PAYMENT_METHOD | Payment method |
| MASTER_CODE_STATUS | Master code status |
| RELATED_ENTITY_TYPE | Related entity type |
