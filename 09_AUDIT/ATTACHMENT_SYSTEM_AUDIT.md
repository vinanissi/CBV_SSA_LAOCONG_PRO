# Attachment System Audit — CBV_SSA_LAOCONG_PRO

## 1. Attachment Tables Present

| Table | Parent | Status |
|-------|--------|--------|
| HO_SO_FILE | HO_SO_MASTER | ✓ |
| TASK_ATTACHMENT | TASK_MAIN | ✓ |
| FINANCE_ATTACHMENT | FINANCE_TRANSACTION | ✓ |

## 2. Parent Ref Integrity

- Each attachment row has exactly one parent ref (HO_SO_ID, TASK_ID, FINANCE_ID)
- GAS create functions validate parent exists before append
- No orphan attachment rows if created via GAS

## 3. Type/Group Validation

| Table | Type Field | Enum Group | Validated |
|-------|------------|------------|-----------|
| HO_SO_FILE | FILE_GROUP | FILE_GROUP | assertValidEnumValue |
| TASK_ATTACHMENT | ATTACHMENT_TYPE | TASK_ATTACHMENT_TYPE | assertValidEnumValue |
| FINANCE_ATTACHMENT | ATTACHMENT_TYPE | FINANCE_ATTACHMENT_TYPE | assertValidEnumValue |

## 4. File Metadata Columns

| Table | FILE_URL | DRIVE_FILE_ID | FILE_NAME |
|-------|----------|---------------|-----------|
| HO_SO_FILE | ✓ | ✓ | ✓ |
| TASK_ATTACHMENT | ✓ | ✓ | ✓ |
| FINANCE_ATTACHMENT | ✓ | ✓ | ✓ |

## 5. No Enum Drift

- All type/group fields use ENUM_DICTIONARY
- Valid_If in AppSheet; GAS asserts on create
- No free-text for type fields

## 6. No Duplication

- Single attachment pattern per module
- HO_SO_FILE, TASK_ATTACHMENT, FINANCE_ATTACHMENT — parallel structure
- EVIDENCE_URL in FINANCE_TRANSACTION: legacy; new evidence → FINANCE_ATTACHMENT

## 7. Auditability

- CREATED_AT, CREATED_BY on all attachment tables
- GAS create functions log via append
- No inline edit of audit fields

## 8. AppSheet Inline Behavior

- Documented in APPSHEET_ATTACHMENT_SYSTEM.md
- IsPartOf for parent linking
- Parent ref auto-set when adding from parent detail
