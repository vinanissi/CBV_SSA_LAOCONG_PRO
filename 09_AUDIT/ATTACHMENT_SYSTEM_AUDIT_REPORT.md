# Attachment System Audit Report — CBV_SSA_LAOCONG_PRO

**Audit date:** 2025-03-18  
**Scope:** Unified file attachment system (HO_SO_FILE, TASK_ATTACHMENT, FINANCE_ATTACHMENT)

---

## 1. DATA MODEL

### Verdict: **PASS**

| Check | Result |
|-------|--------|
| Attachment tables separated from parent | ✓ HO_SO_FILE, TASK_ATTACHMENT, FINANCE_ATTACHMENT are child tables |
| Parent tables not file dumps | ✓ No file columns in HO_SO_MASTER, TASK_MAIN; EVIDENCE_URL in FINANCE_TRANSACTION is legacy only |
| Each row has exactly one parent | ✓ HO_SO_ID, TASK_ID, FINANCE_ID |
| Schema consistency | ✓ Parallel: ID, parent_ref, type_field, TITLE/FILE_NAME, FILE_URL, DRIVE_FILE_ID, NOTE, CREATED_* |

**Note:** HO_SO_FILE uses FILE_GROUP + STATUS; TASK/FINANCE use ATTACHMENT_TYPE. Minor asymmetry from pre-existing HO_SO design; acceptable.

---

## 2. ENUM / MASTER CODE

### Verdict: **PASS**

| Table | Type Field | Enum Group | Bound |
|-------|------------|------------|-------|
| HO_SO_FILE | FILE_GROUP | FILE_GROUP | ✓ |
| TASK_ATTACHMENT | ATTACHMENT_TYPE | TASK_ATTACHMENT_TYPE | ✓ |
| FINANCE_ATTACHMENT | ATTACHMENT_TYPE | FINANCE_ATTACHMENT_TYPE | ✓ |

- No duplication: separate enum groups per module
- ATTACHMENT_TYPE (FILE, IMAGE, LINK) exists but unused by attachment tables; no conflict

---

## 3. APPSHEET READINESS

### Verdict: **PASS**

| Check | Result |
|-------|--------|
| Parent refs defined | ✓ HO_SO_ID, TASK_ID, FINANCE_ID with correct parent table |
| File type documented | ✓ FILE_URL Type = File in APPSHEET_ATTACHMENT_SYSTEM, APPSHEET_ATTACHMENT_POLICY |
| Inline child create explained | ✓ IsPartOf, auto-link, filter syntax in APPSHEET_ATTACHMENT_SYSTEM §4, §5 |
| Hide/readonly rules | ✓ ID, CREATED_*, DRIVE_FILE_ID hidden; parent ref readonly when inline |

---

## 4. STORAGE STRATEGY

### Verdict: **PASS** (after fix)

| Check | Result |
|-------|--------|
| Module-based paths | ✓ 01_HO_SO, 02_TASK_ATTACHMENTS, 03_FINANCE_EVIDENCE |
| Practical and stable | ✓ Documented in 08_STORAGE |
| Avoids chaotic placement | ✓ Clear folder structure |

**Fix applied:** buildHoSoStoragePath fallback changed from "KHAC" (FILE_GROUP value) to "MISC" (valid HO_SO folder fallback). KHAC is not a valid HO_SO_TYPE.

---

## 5. GAS SUPPORT

### Verdict: **PASS**

| Check | Result |
|-------|--------|
| Helpers useful | ✓ Path functions for documentation/hints |
| Not overengineered | ✓ No folder creation, no file moves |
| No binary storage | ✓ GAS handles metadata only; AppSheet handles uploads |

---

## 6. SAFETY

### Verdict: **PASS**

| Check | Result |
|-------|--------|
| Modular | ✓ One table + one create function per module |
| Auditable | ✓ CREATED_AT, CREATED_BY on all |
| Small-scale practical | ✓ Phase 1 ready |
| No fake automation | ✓ AppSheet upload; GAS validates |
| CBV aligned | ✓ Sheets=DB, GAS=runtime, AppSheet=UI |

---

## Fixes Applied

| Issue | Fix |
|-------|-----|
| buildHoSoStoragePath(undefined) returned "KHAC" folder | Changed fallback to "MISC"; added MISC/ to 08_STORAGE |

---

## Final Verdict

**ATTACHMENT SYSTEM SAFE**
