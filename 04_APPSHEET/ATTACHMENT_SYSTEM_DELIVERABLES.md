# Attachment System — Final Deliverables

---

## 1. Architecture Summary

| Component | Implementation |
|-----------|----------------|
| HO_SO | HO_SO_FILE (existing); attachHoSoFile() |
| TASK | TASK_ATTACHMENT (extended with ATTACHMENT_TYPE, TITLE); createTaskAttachment() |
| FINANCE | FINANCE_ATTACHMENT (new); createFinanceAttachment(); EVIDENCE_URL legacy |

---

## 2. Files Created/Updated

| File | Change |
|------|--------|
| 06_DATABASE/schema_manifest.json | TASK_ATTACHMENT +ATTACHMENT_TYPE, TITLE; +FINANCE_ATTACHMENT |
| 05_GAS_RUNTIME/90_BOOTSTRAP_SCHEMA.gs | Same |
| 05_GAS_RUNTIME/00_CORE_CONFIG.gs | +FINANCE_ATTACHMENT sheet |
| 05_GAS_RUNTIME/01_ENUM_SEED.gs | +TASK_ATTACHMENT_TYPE, FINANCE_ATTACHMENT_TYPE |
| 05_GAS_RUNTIME/20_TASK_SERVICE.gs | +createTaskAttachment() |
| 05_GAS_RUNTIME/30_FINANCE_SERVICE.gs | +createFinanceAttachment() |
| 05_GAS_RUNTIME/03_SHARED_FILE_HELPER.gs | New: path helpers |
| 05_GAS_RUNTIME/50_APPSHEET_VERIFY.gs | +FINANCE_ATTACHMENT, TASK_ATTACHMENT refs |
| .clasp.json | +03_SHARED_FILE_HELPER.gs |
| 04_APPSHEET/APPSHEET_ATTACHMENT_SYSTEM.md | New |
| 04_APPSHEET/APPSHEET_ATTACHMENT_POLICY.md | New |
| 04_APPSHEET/APPSHEET_FIELD_POLICY_MAP.md | TASK_ATTACHMENT, +FINANCE_ATTACHMENT |
| 04_APPSHEET/APPSHEET_ENUM_BINDING.md | TASK_ATTACHMENT_TYPE, FINANCE_ATTACHMENT_TYPE |
| 04_APPSHEET/APPSHEET_PHASE1_CONFIG.md | +FINANCE_ATTACHMENT inline |
| 08_STORAGE/STORAGE_STRUCTURE.md | Path logic |
| 09_AUDIT/ATTACHMENT_SYSTEM_AUDIT.md | New |
| 06_DATABASE/_generated_schema/*.csv | Regenerated |

---

## 3. Final Sheet Schemas

### HO_SO_FILE
ID, HO_SO_ID, FILE_GROUP, FILE_NAME, FILE_URL, DRIVE_FILE_ID, STATUS, NOTE, CREATED_AT, CREATED_BY

### TASK_ATTACHMENT
ID, TASK_ID, ATTACHMENT_TYPE, TITLE, FILE_NAME, FILE_URL, DRIVE_FILE_ID, NOTE, CREATED_AT, CREATED_BY

### FINANCE_ATTACHMENT
ID, FINANCE_ID, ATTACHMENT_TYPE, TITLE, FILE_NAME, FILE_URL, DRIVE_FILE_ID, NOTE, CREATED_AT, CREATED_BY

---

## 4. Enum Binding

| Field | Enum Group | Values |
|-------|------------|--------|
| HO_SO_FILE.FILE_GROUP | FILE_GROUP | CCCD, GPLX, DANG_KY_XE, HOP_DONG, KHAC |
| TASK_ATTACHMENT.ATTACHMENT_TYPE | TASK_ATTACHMENT_TYPE | DRAFT, RESULT, SOP, REFERENCE, OTHER |
| FINANCE_ATTACHMENT.ATTACHMENT_TYPE | FINANCE_ATTACHMENT_TYPE | INVOICE, RECEIPT, CONTRACT, PROOF, OTHER |

---

## 5. AppSheet Configuration

- Add FINANCE_ATTACHMENT table
- Extend TASK_ATTACHMENT with ATTACHMENT_TYPE, TITLE
- Inline views: HO_SO_FILE, TASK_ATTACHMENT, FINANCE_ATTACHMENT on parent detail
- IsPartOf: Yes for parent linking
- FILE_URL: Type = File
- Valid_If for type fields per APPSHEET_ATTACHMENT_POLICY.md

---

## 6. Field Policy

- ID, CREATED_AT, CREATED_BY: hidden + readonly
- Parent ref: readonly when inline (auto-linked)
- FILE_URL: visible + editable (Type = File)
- DRIVE_FILE_ID: hidden
- ATTACHMENT_TYPE / FILE_GROUP: Valid_If from ENUM_DICTIONARY

---

## 7. Storage Paths

- HO_SO: CBV_STORAGE/01_HO_SO/{HO_SO_TYPE}/
- TASK: CBV_STORAGE/02_TASK_ATTACHMENTS/
- FINANCE: CBV_STORAGE/03_FINANCE_EVIDENCE/

---

## 8. GAS Functions

| Function | File |
|----------|------|
| attachHoSoFile(hoSoId, fileMeta) | 10_HOSO_SERVICE.gs |
| createTaskAttachment(data) | 20_TASK_SERVICE.gs |
| createFinanceAttachment(data) | 30_FINANCE_SERVICE.gs |
| buildHoSoStoragePath(hoSoType, hoSoId) | 03_SHARED_FILE_HELPER.gs |
| buildTaskStoragePath(taskId) | 03_SHARED_FILE_HELPER.gs |
| buildFinanceStoragePath(financeId) | 03_SHARED_FILE_HELPER.gs |

---

## 9. Audit Checks

- 09_AUDIT/ATTACHMENT_SYSTEM_AUDIT.md
- Parent ref integrity
- Type validation
- No enum drift
- No duplication

---

## 10. Final Statement

**ATTACHMENT SYSTEM SAFE**

Ready for manual AppSheet configuration. Run initAll() to create FINANCE_ATTACHMENT sheet; run seedEnumDictionary() to add TASK_ATTACHMENT_TYPE and FINANCE_ATTACHMENT_TYPE. For existing TASK_ATTACHMENT sheet, add ATTACHMENT_TYPE and TITLE columns manually or via initAll() header extend.
