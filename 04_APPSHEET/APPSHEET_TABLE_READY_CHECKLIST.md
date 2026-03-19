# AppSheet Table Ready Checklist

## Verification Summary

| Table              | Key   | Label     | Enum Fields                    | Ref Candidates     | Editable Risk              | Initial View   |
|--------------------|-------|-----------|--------------------------------|--------------------|---------------------------|----------------|
| HO_SO_MASTER       | ID    | NAME      | HO_SO_TYPE, STATUS            | HTX_ID             | STATUS via action only    | List/Detail    |
| HO_SO_FILE         | ID    | FILE_NAME | FILE_GROUP, STATUS             | HO_SO_ID           | Low                       | Inline         |
| HO_SO_RELATION     | ID    | RELATION_TYPE | STATUS                      | FROM_HO_SO_ID, TO_HO_SO_ID | Low              | Inline         |
| TASK_MAIN          | ID    | TITLE     | TASK_TYPE, STATUS, PRIORITY    | RELATED_ENTITY_ID  | STATUS via action only    | Inbox/List     |
| TASK_CHECKLIST     | ID    | TITLE     | IS_REQUIRED, IS_DONE           | TASK_ID            | Low                       | Inline         |
| TASK_UPDATE_LOG    | ID    | ACTION    | -                              | TASK_ID            | Read-only                 | Inline         |
| TASK_ATTACHMENT    | ID    | FILE_NAME | -                              | TASK_ID            | Low                       | Inline         |
| FINANCE_TRANSACTION| ID    | TRANS_CODE| TRANS_TYPE, STATUS, CATEGORY, PAYMENT_METHOD | RELATED_ENTITY_ID | STATUS via action only; NEW only editable | List/Detail |
| FINANCE_LOG        | ID    | ACTION    | -                              | FIN_ID             | Read-only                 | Inline         |

## Table-by-Table

### HO_SO_MASTER
- **Key**: ID
- **Label**: NAME
- **Enum**: HO_SO_TYPE (HTX, XA_VIEN, XE, TAI_XE), STATUS (NEW, ACTIVE, INACTIVE, ARCHIVED)
- **Ref**: HTX_ID -> HO_SO_MASTER (filter HO_SO_TYPE=HTX)
- **Editable risk**: STATUS must change via setHoSoStatus, not inline
- **View**: HO_SO_LIST, HO_SO_DETAIL

### HO_SO_FILE
- **Key**: ID
- **Label**: FILE_NAME
- **Enum**: FILE_GROUP, STATUS
- **Ref**: HO_SO_ID -> HO_SO_MASTER
- **View**: Inline under HO_SO_DETAIL

### HO_SO_RELATION
- **Key**: ID
- **Label**: RELATION_TYPE
- **Ref**: FROM_HO_SO_ID, TO_HO_SO_ID -> HO_SO_MASTER
- **View**: Inline

### TASK_MAIN
- **Key**: ID
- **Label**: TITLE
- **Enum**: TASK_TYPE, STATUS, PRIORITY
- **Ref**: RELATED_ENTITY_ID (polymorphic)
- **Editable risk**: STATUS via setTaskStatus; DONE requires checklist complete
- **View**: TASK_INBOX, TASK_MY_OPEN, TASK_DETAIL

### TASK_CHECKLIST
- **Key**: ID
- **Label**: TITLE
- **Ref**: TASK_ID -> TASK_MAIN
- **View**: Inline under TASK_DETAIL

### TASK_UPDATE_LOG
- **Key**: ID
- **Label**: ACTION
- **Ref**: TASK_ID
- **Editable risk**: Read-only
- **View**: Inline

### TASK_ATTACHMENT
- **Key**: ID
- **Label**: FILE_NAME
- **Ref**: TASK_ID
- **View**: Inline

### FINANCE_TRANSACTION
- **Key**: ID
- **Label**: TRANS_CODE
- **Enum**: TRANS_TYPE, STATUS, CATEGORY, PAYMENT_METHOD
- **Ref**: RELATED_ENTITY_ID (polymorphic)
- **Editable risk**: Only NEW editable via updateDraftTransaction; STATUS via setFinanceStatus
- **View**: FIN_LIST, FIN_DETAIL, FIN_CONFIRM_QUEUE

### FINANCE_LOG
- **Key**: ID
- **Label**: ACTION
- **Ref**: FIN_ID
- **Editable risk**: Read-only
- **View**: Inline
