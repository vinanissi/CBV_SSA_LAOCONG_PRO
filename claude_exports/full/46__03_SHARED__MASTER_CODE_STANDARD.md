# MASTER_CODE Standard

## Purpose
MASTER_CODE is the central runtime sheet for **dynamic business codes** and **dynamic master data** that admin can manage safely. It does NOT replace:
- System IDs (entity keys)
- Locked workflow enums (ENUM_DICTIONARY)

## Use Cases
- Provinces, districts, wards
- Cost centers, departments
- Currency codes, unit types
- Custom lookup groups defined by admin

## What MASTER_CODE Is NOT
- Not for HO_SO_MASTER entities (cooperatives, vehicles, drivers)
- Not for workflow enums (TASK_STATUS, FIN_STATUS, etc.)
- Not for system configuration that belongs in code

---

## Sheet Structure

| Column | Type | Required | Notes |
|--------|------|----------|-------|
| ID | Text | Yes | Unique per row, format MC_YYYYMMDD_xxxxx |
| MASTER_GROUP | Text | Yes | Family: PROVINCE, DISTRICT, COST_CENTER, etc. |
| CODE | Text | Yes | Machine-safe value within group. Unique per (MASTER_GROUP, CODE) |
| NAME | Text | Yes | Full canonical name. Primary human-readable label |
| DISPLAY_TEXT | Text | No | Optional UI override. If empty, use NAME |
| SHORT_NAME | Text | No | Abbreviated label for compact UI (tables, reports) |
| PARENT_CODE | Text | No | Parent code for hierarchy. Empty = root |
| STATUS | Text | Yes | ACTIVE | INACTIVE | ARCHIVED |
| SORT_ORDER | Number | No | Display order within group |
| IS_SYSTEM | Yes/No | Yes | True = seeded by system, not editable by admin |
| ALLOW_EDIT | Yes/No | Yes | True = admin can edit this row |
| NOTE | Text | No | Optional note |
| CREATED_AT | Datetime | No | |
| CREATED_BY | Text | No | |
| UPDATED_AT | Datetime | No | |
| UPDATED_BY | Text | No | |
| IS_DELETED | Yes/No | Yes | Soft delete |

---

## Column Roles

### CODE
- **Machine-safe identifier** within MASTER_GROUP
- Used for lookup, storage, validation, foreign keys
- Unique per (MASTER_GROUP, CODE)
- Examples: `"01"`, `"HN"`, `"VN-VND"`, `"CC-VANHANH"`

### NAME
- **Full canonical name**
- Primary human-readable label
- Examples: `"Hà Nội"`, `"Vietnamese Dong"`, `"Vận hành"`

### DISPLAY_TEXT
- **Optional override** for UI display
- If empty, use NAME
- Use for localized or formatted display (e.g. "VNĐ" vs "Vietnamese Dong")

### SHORT_NAME
- **Abbreviated label** for compact UI
- Use in tables, reports, dropdowns
- Examples: `"HN"`, `"VND"`, `"VH"`

---

## STATUS Values

| Value | Meaning |
|-------|---------|
| ACTIVE | Usable in dropdowns and validation |
| INACTIVE | Hidden from new selections; existing refs remain valid |
| ARCHIVED | No longer used; historical only |

---

## Hierarchy

- **PARENT_CODE** allows future hierarchy (e.g. District → Province)
- Empty PARENT_CODE = root level
- Validation: PARENT_CODE must exist in same MASTER_GROUP when non-empty

---

## GAS Validation
- `getMasterCodeValues(group)` — active codes for group
- `isValidMasterCode(group, code)` — check validity
- `assertValidMasterCode(group, code, fieldName)` — throw if invalid

---

## AppSheet Binding
- Add MASTER_CODE table
- Filter: `AND([MASTER_GROUP] = "X", [STATUS] = "ACTIVE", [IS_DELETED] = FALSE)`
- Display: DISPLAY_TEXT or NAME
- Value: CODE

---

## Audit Policy
- Duplicate (MASTER_GROUP, CODE) detected
- Orphan PARENT_CODE reported
- IS_SYSTEM vs ALLOW_EDIT consistency
