# ADMIN_AUDIT_LOG Schema

## Sheet
ADMIN_AUDIT_LOG

## Design Source
- 04_APPSHEET/ADMIN_PANEL_DATA_MODEL.md

## Purpose
Audit trail for admin operations: ENUM_DICTIONARY edits, MASTER_CODE edits, and future role management.

## Columns (Canonical Order)

| # | Column | Type | Required | Notes |
|---|--------|------|----------|-------|
| 1 | ID | Text | Yes | AAL_YYYYMMDD_xxxxx |
| 2 | AUDIT_TYPE | Text | Yes | ENUM_EDIT, MASTER_CODE_EDIT, ROLE_ASSIGN |
| 3 | ENTITY_TYPE | Text | Yes | ENUM_DICTIONARY, MASTER_CODE, USER_ROLE |
| 4 | ENTITY_ID | Text | No | Row ID when applicable |
| 5 | ACTION | Text | Yes | CREATE, UPDATE, ACTIVATE, INACTIVATE |
| 6 | BEFORE_JSON | Text | No | Snapshot before change |
| 7 | AFTER_JSON | Text | No | Snapshot after change |
| 8 | NOTE | Text | No | Optional note |
| 9 | ACTOR_ID | Text | Yes | cbvUser() — email or system |
| 10 | CREATED_AT | Datetime | Yes | |

## Relationship
- Append-only; no foreign keys
- Created by initCoreSheets(); logAdminAudit() appends rows
