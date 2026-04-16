# Seed Data Audit Report

**Audit date:** 2025-03-22  
**Scope:** 02_SEED (seed_don_vi.tsv, seed_user_directory.tsv, seed_enum_dictionary.tsv, seed_master_code.tsv)

---

## 1. SUMMARY

| Metric | Value |
|--------|-------|
| **Overall health** | WARNING |
| **Total issues** | 1 |
| **HIGH** | 0 |
| **MEDIUM** | 1 |
| **LOW** | 0 |

---

## 2. HIGH PRIORITY ISSUES

None. All enum values, refs, and hierarchy checks pass for 02_SEED.

---

## 3. MEDIUM PRIORITY ISSUES

### M-1: Duplicate seed locations (02_SEED vs 06_DATABASE/SEED)

| Property | Value |
|----------|-------|
| Tables | DON_VI, MASTER_CODE, ENUM_DICTIONARY |
| Problem | Two seed locations exist with different ID schemes and structure |
| 02_SEED | DV_20250322_001..009, MC_TASK_GENERAL, full enum with LANG/COLOR_HEX/IS_DEFAULT |
| 06_DATABASE/SEED | DV_20250322_ABC001, DV_20250322_HTX01, MC_TASK_TYPE_001, simpler enum |
| Impact | Risk of loading wrong set; GAS bootstrap (95/96) uses DON_VI_SEED in code, not TSV |
| Suggested fix | Standardize on one canonical seed location; document which is source of truth; align GAS seed to TSV if needed |

---

## 4. LOW PRIORITY ISSUES

None detected.

---

## 5. HIERARCHY ANALYSIS (DON_VI)

### Tree structure

```
DV_20250322_001 (CONG_TY) [ROOT]
├── DV_20250322_002 (HTX)
├── DV_20250322_003 (HTX)
├── DV_20250322_004 (DOI_KINH_DOANH)
├── DV_20250322_005 (DOI_KINH_DOANH)
├── DV_20250322_006 (BO_PHAN)
│   └── DV_20250322_009 (NHOM)
├── DV_20250322_007 (BO_PHAN)
└── DV_20250322_008 (BO_PHAN)
```

### Hierarchy validation

| Check | Result |
|-------|--------|
| Root node exists | ✓ 1 root (DV_20250322_001) |
| All PARENT_ID refs valid | ✓ |
| Circular reference | ✓ None |
| Self-reference | ✓ None |
| Orphan nodes | ✓ None |
| Max depth | 3 levels (CONG_TY → BO_PHAN → NHOM) |
| Deep chain warning (>5) | ✓ N/A |

---

## 6. ENUM CONSISTENCY REPORT

### ENUM_GROUP summary

| ENUM_GROUP | Active values | Default | Status |
|------------|---------------|---------|--------|
| TASK_STATUS | 4 | NEW | ✓ |
| PRIORITY | 3 | TRUNG_BINH | ✓ |
| DON_VI_TYPE | 5 | (none) | ✓ |
| USER_ROLE | 3 | OPERATOR | ✓ |
| RECORD_STATUS | 2 | ACTIVE | ✓ |
| YES_NO | 2 | Y | ✓ |

### Default value check

- Each group has at most 1 IS_DEFAULT=TRUE ✓
- TASK_STATUS, PRIORITY, USER_ROLE, RECORD_STATUS, YES_NO have exactly 1 default ✓
- DON_VI_TYPE has no default (acceptable for type selector) ✓

### Enum usage mismatches

None. USER_DIRECTORY.ROLE uses ADMIN, OPERATOR, VIEWER correctly.

---

## 7. CROSS-TABLE CONSISTENCY REPORT

| Ref | Source → Target | Valid | Issues |
|-----|-----------------|-------|--------|
| DON_VI.MANAGER_USER_ID | → USER_DIRECTORY.ID | ✓ | All 9 refs exist |
| DON_VI.PARENT_ID | → DON_VI.ID | ✓ | All refs exist |
| USER_DIRECTORY.DON_VI_ID | → DON_VI.ID | ✓ | All 9 non-blank refs exist |
| DON_VI.DON_VI_TYPE | → ENUM (DON_VI_TYPE) | ✓ | CONG_TY, HTX, DOI_KINH_DOANH, BO_PHAN, NHOM |
| USER_DIRECTORY.ROLE | → ENUM (USER_ROLE) | ✓ | ADMIN, OPERATOR, VIEWER |
| DON_VI.STATUS | ACTIVE | ✓ | Matches RECORD_STATUS |
| USER_DIRECTORY.STATUS | ACTIVE | ✓ | Matches RECORD_STATUS |
| MASTER_CODE.STATUS | ACTIVE | ✓ | Consistent |

---

## 8. AUTO-FIX SUGGESTIONS

1. **Resolve M-1 (duplicate seeds):**
   - Choose 02_SEED or 06_DATABASE/SEED as canonical.
   - Update GAS `DON_VI_SEED` in 95_TASK_SYSTEM_BOOTSTRAP.js to match chosen TSV, or document that GAS seed is independent.
   - Add README in 02_SEED and 06_DATABASE/SEED stating which is authoritative.

---

## 9. FINAL VERDICT

| Verdict | READY FOR USE |
|---------|---------------|
| Note | 02_SEED is internally consistent. M-1 (duplicate locations) is informational only. |
