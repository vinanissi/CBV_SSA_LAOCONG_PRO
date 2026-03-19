# AppSheet Key / Label Map

## Primary Tables

| Table               | Key Column | Label Column | Notes                    |
|---------------------|------------|--------------|---------------------------|
| HO_SO_MASTER        | ID         | NAME         | Display in lists, refs    |
| HO_SO_FILE          | ID         | FILE_NAME    | Inline display            |
| HO_SO_RELATION      | ID         | RELATION_TYPE| Inline display            |
| TASK_MAIN           | ID         | TITLE        | Display in lists, inbox   |
| TASK_CHECKLIST      | ID         | TITLE        | Inline display            |
| TASK_UPDATE_LOG     | ID         | ACTION       | Log display               |
| TASK_ATTACHMENT     | ID         | FILE_NAME    | Inline display            |
| FINANCE_TRANSACTION | ID         | TRANS_CODE   | Display in lists          |
| FINANCE_LOG         | ID         | ACTION       | Log display               |

## Ref Display
When showing a reference (e.g. HTX_ID), display the label of the target record:
- HTX_ID -> HO_SO_MASTER.NAME (where HO_SO_TYPE=HTX)
- HO_SO_ID -> HO_SO_MASTER.NAME
- TASK_ID -> TASK_MAIN.TITLE
- FIN_ID -> FINANCE_TRANSACTION.TRANS_CODE
