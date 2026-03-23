# Test Seed Corruption Cases

**Purpose:** Intentionally broken data samples for validation testing. Used by `test_corrupted_seed_samples.tsv` and `task_system_mock_data.gs`.

---

## 1. Invalid Enum Value

| Table | Row ID | Field | Bad Value | Good Value |
|-------|--------|-------|-----------|------------|
| USER_DIRECTORY | UD_CORRUPT_001 | ROLE | Admin | ADMIN |
| USER_DIRECTORY | UD_CORRUPT_002 | ROLE | operator | OPERATOR |
| DON_VI | DV_CORRUPT_001 | DON_VI_TYPE | HOP_TAC_XA | HTX |
| TASK_MAIN | TASK_CORRUPT_001 | STATUS | COMPLETED | DONE |
| TASK_MAIN | TASK_CORRUPT_002 | PRIORITY | High | CAO |

---

## 2. Duplicate ID

| Table | Row ID | Problem |
|-------|--------|---------|
| USER_DIRECTORY | UD_20250322_001 | Same ID appears twice |
| DON_VI | DV_20250322_001 | Same ID appears twice |

---

## 3. Blank Required Field

| Table | Row ID | Field | Problem |
|-------|--------|-------|---------|
| USER_DIRECTORY | UD_CORRUPT_003 | EMAIL | Empty |
| USER_DIRECTORY | UD_CORRUPT_004 | ID | Empty |
| DON_VI | DV_CORRUPT_002 | CODE | Empty |
| TASK_MAIN | TASK_CORRUPT_003 | OWNER_ID | Empty |
| TASK_MAIN | TASK_CORRUPT_004 | TITLE | Empty |

---

## 4. Broken Reference (USER_DIRECTORY → DON_VI)

| Table | Row ID | Field | Bad Ref | Problem |
|-------|--------|-------|---------|---------|
| USER_DIRECTORY | UD_CORRUPT_005 | DON_VI_ID | DV_NONEXISTENT | Ref does not exist |

---

## 5. Broken Reference (DON_VI → Parent)

| Table | Row ID | Field | Bad Ref | Problem |
|-------|--------|-------|---------|---------|
| DON_VI | DV_CORRUPT_003 | PARENT_ID | DV_GHOST | Parent does not exist |

---

## 6. Circular Hierarchy

| Table | Row ID | Field | Problem |
|-------|--------|-------|---------|
| DON_VI | DV_CORRUPT_004 | PARENT_ID | A→B→C→A cycle (DV_C → DV_A) |
| DON_VI | DV_CORRUPT_005 | PARENT_ID | Self-ref: PARENT_ID = own ID |

---

## 7. Invalid TASK_MAIN Status

| Table | Row ID | Field | Bad Value | Problem |
|-------|--------|-------|-----------|---------|
| TASK_MAIN | TASK_CORRUPT_005 | STATUS | FINISHED | Not in TASK_STATUS |
| TASK_MAIN | TASK_CORRUPT_006 | STATUS | 1 | Numeric instead of code |

---

## 8. DONE Without DONE_AT

| Table | Row ID | STATUS | DONE_AT | Problem |
|-------|--------|--------|---------|---------|
| TASK_MAIN | TASK_CORRUPT_007 | DONE | (empty) | Should set DONE_AT when DONE |

---

## 9. Invalid TASK_TYPE_ID

| Table | Row ID | Field | Bad Ref | Problem |
|-------|--------|-------|---------|---------|
| TASK_MAIN | TASK_CORRUPT_008 | TASK_TYPE_ID | MC_NONEXISTENT | Not in MASTER_CODE |
| TASK_MAIN | TASK_CORRUPT_009 | TASK_TYPE_ID | MC_HOSO_HTX | Wrong MASTER_GROUP (HO_SO_TYPE, not TASK_TYPE) |

---

## 10. Invalid OWNER_ID

| Table | Row ID | Field | Bad Ref | Problem |
|-------|--------|-------|---------|---------|
| TASK_MAIN | TASK_CORRUPT_010 | OWNER_ID | UD_NONEXISTENT | User does not exist |
| TASK_MAIN | TASK_CORRUPT_011 | OWNER_ID | UD_INACTIVE | User STATUS=INACTIVE |

---

## 11. Invalid IS_DELETED

| Table | Row ID | Field | Bad Value | Good Value |
|-------|--------|-------|-----------|------------|
| USER_DIRECTORY | UD_CORRUPT_006 | IS_DELETED | 1 | FALSE |
| DON_VI | DV_CORRUPT_006 | IS_DELETED | yes | FALSE |

---

## Corruption Matrix by Severity

| Severity | Case Count |
|----------|------------|
| HIGH | 9 |
| MEDIUM | 7 |
| LOW | 2 |
