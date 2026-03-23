# DON_VI Schema

**Canonical:** See 01_SCHEMA/DON_VI_SCHEMA.md for final spec. DON_VI is NOT in MASTER_CODE.

## Sheet
DON_VI

## Design Source
- 03_SHARED/ENUM_DICTIONARY_STANDARD.md
- 00_META/CBV_ID_STANDARD.md
- 00_META/CBV_TABLE_STANDARD.md

## Purpose
Organizational unit hierarchy for the system. Supports company (CONG_TY), cooperatives (HTX), business teams (DOI_KINH_DOANH), departments (BO_PHAN), and groups (NHOM). Used for task assignment, finance attribution, and reporting structure.

---

## Columns (Canonical Order)

| # | Column | Type | Required | Notes |
|---|--------|------|----------|-------|
| 1 | ID | Text | Yes | Unique key, DV_YYYYMMDD_<6-8 chars> |
| 2 | DON_VI_TYPE | Text | Yes | CONG_TY, HTX, DOI_KINH_DOANH, BO_PHAN, NHOM |
| 3 | CODE | Text | Yes | Machine-safe; unique per type or globally |
| 4 | NAME | Text | Yes | Full canonical name |
| 5 | DISPLAY_TEXT | Text | No | UI override; empty = use NAME |
| 6 | SHORT_NAME | Text | No | Abbreviated label |
| 7 | PARENT_ID | Text | No | Ref DON_VI; hierarchical parent |
| 8 | STATUS | Text | Yes | ACTIVE \| INACTIVE \| ARCHIVED |
| 9 | SORT_ORDER | Number | No | Display order within parent |
| 10 | MANAGER_USER_ID | Text | No | Ref USER_DIRECTORY |
| 11 | EMAIL | Text | No | Unit contact email |
| 12 | PHONE | Text | No | Unit contact phone |
| 13 | ADDRESS | Text | No | Physical address |
| 14 | NOTE | Text | No | Admin note |
| 15 | CREATED_AT | Datetime | No | |
| 16 | CREATED_BY | Text | No | |
| 17 | UPDATED_AT | Datetime | No | |
| 18 | UPDATED_BY | Text | No | |
| 19 | IS_DELETED | Yes/No | Yes | Soft delete |

---

## DON_VI_TYPE Enum

| Value | Display | Notes |
|-------|---------|-------|
| CONG_TY | Công ty | Top-level company |
| HTX | Hợp tác xã | Cooperative |
| DOI_KINH_DOANH | Đội kinh doanh | Business team |
| BO_PHAN | Bộ phận | Department |
| NHOM | Nhóm | Group |

---

## References

| Ref Field | Target | Notes |
|-----------|--------|-------|
| DON_VI.PARENT_ID | DON_VI | Hierarchical parent unit |
| DON_VI.MANAGER_USER_ID | USER_DIRECTORY | Unit manager |
| TASK_MAIN.DON_VI_ID | DON_VI | Task organizational ownership |

---

## Validation Rules

1. ID is system key and must be stable.
2. CODE is unique per (DON_VI_TYPE, PARENT_ID) or globally as configured.
3. DON_VI_TYPE must be one of: CONG_TY, HTX, DOI_KINH_DOANH, BO_PHAN, NHOM.
4. STATUS must be ACTIVE, INACTIVE, or ARCHIVED.
5. PARENT_ID when provided must reference valid DON_VI row; no circular refs.
6. MANAGER_USER_ID when provided must reference USER_DIRECTORY.
7. Hierarchy: CONG_TY (root) → HTX/DOI_KINH_DOANH → BO_PHAN → NHOM.

---

## ID Format

`DV_YYYYMMDD_<6-8 chars>` — per CBV_ID_STANDARD. DV = DON_VI prefix.

---

## Seed Examples

### 1 Company (CONG_TY)

| ID | DON_VI_TYPE | CODE | NAME | DISPLAY_TEXT | SHORT_NAME | PARENT_ID | STATUS | SORT_ORDER |
|----|-------------|------|------|--------------|------------|-----------|--------|------------|
| DV_20250322_ABC001 | CONG_TY | CT_LAOCONG | Công ty Lao Cộng | Công ty Lao Cộng | CT | | ACTIVE | 1 |

### 2 HTX (Cooperatives)

| ID | DON_VI_TYPE | CODE | NAME | DISPLAY_TEXT | SHORT_NAME | PARENT_ID | STATUS | SORT_ORDER |
|----|-------------|------|------|--------------|------------|-----------|--------|------------|
| DV_20250322_HTX01 | HTX | HTX_A | HTX Lao Cộng A | HTX A | HTX-A | DV_20250322_ABC001 | ACTIVE | 1 |
| DV_20250322_HTX02 | HTX | HTX_B | HTX Lao Cộng B | HTX B | HTX-B | DV_20250322_ABC001 | ACTIVE | 2 |

### 1-2 Business Teams (DOI_KINH_DOANH)

| ID | DON_VI_TYPE | CODE | NAME | DISPLAY_TEXT | SHORT_NAME | PARENT_ID | STATUS | SORT_ORDER |
|----|-------------|------|------|--------------|------------|-----------|--------|------------|
| DV_20250322_DKD01 | DOI_KINH_DOANH | DKD_VANTAI | Đội Vận tải | Đội Vận tải | VT | DV_20250322_ABC001 | ACTIVE | 1 |
| DV_20250322_DKD02 | DOI_KINH_DOANH | DKD_DICHVU | Đội Dịch vụ | Đội Dịch vụ | DV | DV_20250322_ABC001 | ACTIVE | 2 |

### 2-3 Departments (BO_PHAN)

| ID | DON_VI_TYPE | CODE | NAME | DISPLAY_TEXT | SHORT_NAME | PARENT_ID | STATUS | SORT_ORDER |
|----|-------------|------|------|--------------|------------|-----------|--------|------------|
| DV_20250322_BP01 | BO_PHAN | VAN_HANH | Bộ phận Vận hành | Vận hành | VH | DV_20250322_ABC001 | ACTIVE | 1 |
| DV_20250322_BP02 | BO_PHAN | HO_SO | Bộ phận Hồ sơ | Hồ sơ | HS | DV_20250322_ABC001 | ACTIVE | 2 |
| DV_20250322_BP03 | BO_PHAN | THU_CHI | Bộ phận Thu Chi | Thu Chi | TC | DV_20250322_ABC001 | ACTIVE | 3 |

---

## ENUM_GROUP Usage

Add to ENUM_DICTIONARY or MASTER_CODE if DON_VI_TYPE is driven by config:

| ENUM_GROUP | Table.Column |
|------------|--------------|
| DON_VI_TYPE | DON_VI.DON_VI_TYPE |
| DON_VI_STATUS | DON_VI.STATUS |

(Values: ACTIVE, INACTIVE, ARCHIVED — align with MASTER_CODE_STATUS.)
