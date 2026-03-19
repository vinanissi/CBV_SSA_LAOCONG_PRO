# AppSheet Deployment Notes

## Pre-requisites
1. Bootstrap completed: initAll(), selfAuditBootstrap(), installTriggers()
2. Golden dataset seeded: seedGoldenDataset()
3. Google Sheet bound to Apps Script project

## Table Setup Order
1. Add data source: Google Sheets (same spreadsheet as GAS)
2. Add tables in order: HO_SO_MASTER, HO_SO_FILE, HO_SO_RELATION, TASK_MAIN, TASK_CHECKLIST, TASK_UPDATE_LOG, TASK_ATTACHMENT, FINANCE_TRANSACTION, FINANCE_LOG
3. Set Key = ID for all tables
4. Set Label per APPSHEET_KEY_LABEL_MAP.md
5. Configure refs per APPSHEET_REF_MAP.md
6. Configure enum columns from ENUM_DICTIONARY.md

## Critical Rules
- **STATUS columns**: Do NOT make inline editable on main tables. Use AppSheet actions that call GAS (setHoSoStatus, setTaskStatus, setFinanceStatus).
- **Log tables**: Read-only. No add/edit/delete.
- **FINANCE_TRANSACTION**: Only NEW records editable. Use updateDraftTransaction via action.
- **TASK_MAIN DONE**: Requires all required checklist items done. Enforced by setTaskStatus.

## Enum Values (for AppSheet List)
- HO_SO_TYPE: HTX, XA_VIEN, XE, TAI_XE
- HO_SO_STATUS: NEW, ACTIVE, INACTIVE, ARCHIVED
- FILE_GROUP: CCCD, GPLX, DANG_KY_XE, HOP_DONG, KHAC
- TASK_TYPE: GENERAL, HO_SO, FINANCE, OPERATION
- TASK_STATUS: NEW, ASSIGNED, IN_PROGRESS, WAITING, DONE, CANCELLED, ARCHIVED
- PRIORITY: LOW, MEDIUM, HIGH, URGENT
- FIN_TRANS_TYPE: INCOME, EXPENSE
- FIN_STATUS: NEW, CONFIRMED, CANCELLED, ARCHIVED
- FIN_CATEGORY: VAN_HANH, NHIEN_LIEU, SUA_CHUA, LUONG, THU_KHAC, CHI_KHAC
- PAYMENT_METHOD: CASH, BANK, OTHER

## Suggested Views
- HO_SO: List, Detail, Create Form
- TASK: Inbox (NEW/ASSIGNED), My Open, Detail, Create Form
- FINANCE: List, Detail, Create Form, Confirm Queue (NEW)

## Security
- ADMIN: full access
- OPERATOR: filter by OWNER_ID or unit
- VIEWER: read-only
