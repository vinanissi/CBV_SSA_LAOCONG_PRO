# CBV Test Fixture Cases

**Clean fixtures:** `fixtures_clean_*.tsv` — valid data, all checks pass.  
**Corrupted fixtures:** `fixtures_corrupted_*.tsv` — injected for negative testing.

---

## 1. Clean Fixtures (Expected: PASS)

| Table | File | Row count | Purpose |
|-------|------|-----------|---------|
| DON_VI | fixtures_clean_don_vi.tsv | 4 | Valid tree: root → HTX/BP → NHOM |
| USER_DIRECTORY | fixtures_clean_user_directory.tsv | 5 | Valid ROLE, unique EMAIL, valid DON_VI_ID refs |
| ENUM_DICTIONARY | fixtures_clean_enum_dictionary.tsv | 13 | TASK_STATUS, PRIORITY, DON_VI_TYPE, USER_ROLE |
| MASTER_CODE | fixtures_clean_master_code.tsv | 3 | TASK_TYPE group for TASK_MAIN |
| TASK_MAIN | fixtures_clean_task_main.tsv | 4 | NEW, IN_PROGRESS, DONE (with DONE_AT), CANCELLED |

**Expected runAllSystemTests() result:** `verdict: PASS`, `mustFixBeforeDeploy: []`

---

## 2. Corrupted Cases — Descriptions & Expected Detection

### DON_VI

| Case ID | Row ID | Corruption | Expected detection |
|---------|--------|------------|-------------------|
| **C-SELF** | DV_CORRUPT_SELF | Self-parent: PARENT_ID = own ID | `SELF_PARENT` (HIGH), testDonViHierarchy |
| **C-CIRC-A** | DV_CORRUPT_A | Circular: A→B | `CIRCULAR` (HIGH), testDonViHierarchy |
| **C-CIRC-B** | DV_CORRUPT_B | Circular: B→A | `CIRCULAR` (HIGH), testDonViHierarchy |
| **C-ORPHAN** | DV_CORRUPT_ORPH | PARENT_ID=DV_GHOST (nonexistent) | `ORPHAN_PARENT` (HIGH), testDonViHierarchy / BAD_REF testRefIntegrity |
| **C-DV-BADENUM** | DV_CORRUPT_ENUM | DON_VI_TYPE=PHONG_BAN (invalid) | `INVALID_ENUM` (HIGH), testEnumConsistency |
| **C-DV-BADMGR** | DV_CORRUPT_MGR | MANAGER_USER_ID=UD_GHOST (nonexistent) | `BAD_REF` (HIGH), testRefIntegrity |

### USER_DIRECTORY

| Case ID | Row ID | Corruption | Expected detection |
|---------|--------|------------|-------------------|
| **C-UD-BADENUM** | UD_CORRUPT_ROLE | ROLE=Admin (display text, not ADMIN) | `INVALID_ENUM` (HIGH), testEnumConsistency |
| **C-UD-BLANKEMAIL** | UD_CORRUPT_EMAIL | EMAIL blank | `BLANK_EMAIL` (HIGH), testSeedConsistency |
| **C-UD-BADREF** | UD_CORRUPT_REF | DON_VI_ID=DV_GHOST (nonexistent) | `BAD_REF` (MEDIUM), testRefIntegrity |
| **C-UD-DUP** | UD_FIX_001 (2nd row) | Duplicate ID (same as first user) | `DUP_ID` (HIGH), testSeedConsistency |

*Note: C-UD-BLANKID (blank ID) — simulate by adding a row with empty ID cell; expected `BLANK_ID` (HIGH).*

### TASK_MAIN

| Case ID | Row ID | Corruption | Expected detection |
|---------|--------|------------|-------------------|
| **C-TM-BADSTATUS** | TASK_CORRUPT_STATUS | STATUS=FINISHED (invalid) | `INVALID_ENUM` / `INVALID_STATUS` (HIGH), testEnumConsistency, testTaskWorkflowRules |
| **C-TM-BADPRIO** | TASK_CORRUPT_PRIO | PRIORITY=High (display text, not CAO) | `INVALID_ENUM` (MEDIUM), testEnumConsistency |
| **C-TM-DONENOTS** | TASK_CORRUPT_DONE | STATUS=DONE, DONE_AT empty | `DONE_NO_TS` (MEDIUM), testEnumConsistency, testTaskWorkflowRules |
| **C-TM-BADOWNER** | TASK_CORRUPT_OWNER | OWNER_ID=UD_GHOST (nonexistent) | `BAD_REF` (HIGH), testRefIntegrity |
| **C-TM-BADTYPE** | TASK_CORRUPT_TYPE | TASK_TYPE_ID=MC_GHOST (nonexistent) | `BAD_REF` (HIGH), testRefIntegrity |
| **C-TM-BADDV** | TASK_CORRUPT_DVID | DON_VI_ID=DV_GHOST (nonexistent) | `BAD_REF` (MEDIUM), testRefIntegrity |
| **C-TM-BLANKTITLE** | TASK_CORRUPT_BLANK | TITLE blank | Manual / schema: TITLE required; testSeedConsistency may not check TITLE — document for custom tests |
| **C-TM-DUP** | TASK_FIX_001 (2nd row) | Duplicate ID (same as TASK_FIX_001) | `DUP_ID` (HIGH), testSeedConsistency |
| **C-TM-WRONGMC** | TASK_CORRUPT_WRONGMC | TASK_TYPE_ID=MC_CORRUPT_WRONG (MASTER_GROUP=HO_SO_TYPE, not TASK_TYPE) | `BAD_REF` (HIGH), testRefIntegrity |

### ENUM_DICTIONARY

| Case ID | Row ID | Corruption | Expected detection |
|---------|--------|------------|-------------------|
| **C-ENUM-MULTIDEF** | E_CORRUPT_DEF2 | Second IS_DEFAULT=TRUE for TASK_STATUS | `MULTI_DEFAULT` (MEDIUM), testEnumConsistency |

### MASTER_CODE

| Case ID | Row ID | Corruption | Expected detection |
|---------|--------|------------|-------------------|
| **C-MC-GHOST** | (not imported) | TASK_CORRUPT_TYPE references MC_GHOST (nonexistent) | `BAD_REF` (HIGH), testRefIntegrity |
| **C-MC-WRONGGROUP** | MC_CORRUPT_WRONG | MASTER_GROUP=HO_SO_TYPE; TASK_CORRUPT_WRONGMC references it | `BAD_REF` (HIGH), testRefIntegrity |

---

## 3. Expected Detection Result Summary

| Test category | Detects |
|---------------|---------|
| testSeedConsistency | DUP_ID (C-UD-DUP, C-TM-DUP), BLANK_EMAIL (C-UD-BLANKEMAIL) |
| testEnumConsistency | INVALID_ENUM for ROLE (C-UD-BADENUM), DON_VI_TYPE (C-DV-BADENUM), STATUS (C-TM-BADSTATUS), PRIORITY (C-TM-BADPRIO); DONE_NO_TS (C-TM-DONENOTS) |
| testRefIntegrity | BAD_REF for DON_VI_ID (C-UD-BADREF, C-TM-BADDV), MANAGER_USER_ID (C-DV-BADMGR), PARENT_ID (C-ORPHAN), OWNER_ID (C-TM-BADOWNER), TASK_TYPE_ID (C-TM-BADTYPE) |
| testDonViHierarchy | SELF_PARENT (C-SELF), CIRCULAR (C-CIRC-A/B), ORPHAN_PARENT (C-ORPHAN) |
| testTaskWorkflowRules | INVALID_STATUS (C-TM-BADSTATUS), DONE_NO_TS (C-TM-DONENOTS) |

---

## 4. How to Use

### Clean run
1. Load `fixtures_clean_*.tsv` into respective sheets.
2. Run `runAllSystemTests()`.
3. Expected: `verdict: PASS`.

### Corrupted run (per case)
1. Load clean fixtures first.
2. Append or replace with specific corrupted rows from `fixtures_corrupted_*.tsv`.
3. Run `runAllSystemTests()`.
4. Verify findings match expected detection (see tables above).

### Batch corrupted run
1. Load clean fixtures.
2. Append all corrupted rows (ensure refs like DV_GHOST, UD_GHOST, MC_GHOST are not expected to exist; orphan/badref cases will fire).
3. For circular/self: add both DV_CORRUPT_A and DV_CORRUPT_B.
4. Run tests; expect `verdict: FAIL` with multiple HIGH findings.

---

## 5. Fixture File Index

| File | Table | Rows |
|------|-------|------|
| fixtures_clean_don_vi.tsv | DON_VI | 4 |
| fixtures_clean_user_directory.tsv | USER_DIRECTORY | 5 |
| fixtures_clean_enum_dictionary.tsv | ENUM_DICTIONARY | 13 |
| fixtures_clean_master_code.tsv | MASTER_CODE | 3 |
| fixtures_clean_task_main.tsv | TASK_MAIN | 4 |
| fixtures_corrupted_don_vi.tsv | DON_VI | 6 |
| fixtures_corrupted_user_directory.tsv | USER_DIRECTORY | 4 |
| fixtures_corrupted_task_main.tsv | TASK_MAIN | 9 |
| fixtures_corrupted_enum_dictionary.tsv | ENUM_DICTIONARY | 1 |
| fixtures_corrupted_master_code.tsv | MASTER_CODE | 2 |
