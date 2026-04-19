# Deprecated Old Design Items

**Purpose:** Explicit list of removed design elements. Do NOT reintroduce these.

---

## Removed Tables

| Item | Note |
|------|------|
| Separate HTX table | HTX is a DON_VI_TYPE in DON_VI. No standalone HTX table. |

---

## Removed Fields

### TASK_MAIN
| Field | Replacement |
|-------|-------------|
| TASK_TYPE | TASK_TYPE_ID (REF to MASTER_CODE) |
| HTX_ID | DON_VI_ID |
| RESULT_NOTE | RESULT_SUMMARY |

### TASK_CHECKLIST
| Field | Note |
|-------|------|
| DESCRIPTION | Removed. Use TITLE, NOTE. |
| SORT_ORDER | Use ITEM_NO for order. |

### TASK_UPDATE_LOG
| Field | Replacement |
|-------|-------------|
| CONTENT | ACTION, OLD_STATUS, NEW_STATUS, NOTE |

---

## Removed Hybrid Logic

| Logic | Status |
|-------|--------|
| DON_VI stored in MASTER_CODE | Removed. DON_VI is separate table. |
| USER stored in MASTER_CODE | Removed. USER_DIRECTORY is separate table. |
| TASK_MAIN accepts both TASK_TYPE and TASK_TYPE_ID | Removed. TASK_TYPE_ID only. |
| TASK_MAIN accepts both HTX_ID and DON_VI_ID | Removed. DON_VI_ID only. |
| FINANCE unit via MASTER_CODE | Removed. DON_VI_ID → DON_VI only. |
| USER_DIRECTORY depends on HTX | Removed. Users are global. |
| HTX exists as core organization table | Removed. DON_VI with DON_VI_TYPE=HTX. |

---

## Removed Documentation Assumptions

- "DON_VI is in MASTER_CODE"
- "HTX must exist as separate core table"
- "USER_DIRECTORY depends on HTX"
- "Hybrid schema is acceptable"
- "Legacy architecture is still current"

---

## Enforcement

When updating schema, GAS, or AppSheet:

1. Do NOT add TASK_TYPE to TASK_MAIN.
2. Do NOT add HTX_ID to TASK_MAIN.
3. Do NOT add a second “unit” column on FINANCE_TRANSACTION; use DON_VI_ID only.
4. Do NOT store DON_VI rows in MASTER_CODE.
5. Do NOT store USER rows in MASTER_CODE.
6. Do NOT create a separate HTX table.
7. Do NOT link USER_DIRECTORY to HTX.

---

## Reference

- **Final architecture:** 00_OVERVIEW/CBV_FINAL_ARCHITECTURE.md
- **Schema specs:** 01_SCHEMA/*.md
- **Changelog:** 09_AUDIT/ARCHITECTURE_CHANGELOG.md
