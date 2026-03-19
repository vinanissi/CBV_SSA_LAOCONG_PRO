# AppSheet Attachment System — CBV_SSA_LAOCONG_PRO

Unified file attachment architecture for HO_SO, TASK, and FINANCE. Metadata in Sheets; files in Drive/storage.

---

## 1. Attachment Tables Overview

| Table | Parent | Parent Ref | Key | Label | Enum Type |
|-------|--------|------------|-----|-------|-----------|
| HO_SO_FILE | HO_SO_MASTER | HO_SO_ID | ID | FILE_NAME | FILE_GROUP |
| TASK_ATTACHMENT | TASK_MAIN | TASK_ID | ID | TITLE | TASK_ATTACHMENT_TYPE |
| FINANCE_ATTACHMENT | FINANCE_TRANSACTION | FINANCE_ID | ID | TITLE | FINANCE_ATTACHMENT_TYPE |

---

## 2. Ref Mapping

| Ref Field | Parent Table | Display Column | Filter for Inline |
|-----------|--------------|----------------|-------------------|
| HO_SO_ID | HO_SO_MASTER | NAME | HO_SO_ID = [HO_SO_MASTER].ID |
| TASK_ID | TASK_MAIN | TITLE | TASK_ID = [TASK_MAIN].ID |
| FINANCE_ID | FINANCE_TRANSACTION | TRANS_CODE | FINANCE_ID = [FINANCE_TRANSACTION].ID |

---

## 3. File Column Mapping

| Table | File URL Column | Type | DRIVE_FILE_ID |
|-------|-----------------|------|----------------|
| HO_SO_FILE | FILE_URL | File | Readonly |
| TASK_ATTACHMENT | FILE_URL | File | Readonly |
| FINANCE_ATTACHMENT | FILE_URL | File | Readonly |

**AppSheet:** Set FILE_URL column Type = File. AppSheet handles uploads to Drive; URL is stored automatically.

---

## 4. Inline Views

### HO_SO Detail
- Add **Inline view** from HO_SO_FILE
- Filter: `[HO_SO_ID] = [HO_SO_MASTER].[ID]`
- IsPartOf: Yes (enables add from parent)
- When adding from HO_SO detail, HO_SO_ID is auto-linked to current row

### TASK Detail
- Add **Inline view** from TASK_ATTACHMENT
- Filter: `[TASK_ID] = [TASK_MAIN].[ID]`
- IsPartOf: Yes
- TASK_ID auto-linked when adding from TASK detail

### FINANCE Detail
- Add **Inline view** from FINANCE_ATTACHMENT
- Filter: `[FINANCE_ID] = [FINANCE_TRANSACTION].[ID]`
- IsPartOf: Yes
- FINANCE_ID auto-linked when adding from FINANCE detail

---

## 5. Parent Linking (IsPartOf)

When IsPartOf is enabled and the attachment table is shown as inline child of parent:
- **Add** action: parent ref (HO_SO_ID, TASK_ID, FINANCE_ID) is automatically set to the current parent row
- User does not need to select parent
- Parent ref column can be hidden in create form

---

## 6. GAS Functions

| Function | File | Use |
|----------|------|-----|
| attachHoSoFile(hoSoId, fileMeta) | 10_HOSO_SERVICE.gs | Create HO_SO_FILE row |
| createTaskAttachment(data) | 20_TASK_SERVICE.gs | Create TASK_ATTACHMENT row |
| createFinanceAttachment(data) | 30_FINANCE_SERVICE.gs | Create FINANCE_ATTACHMENT row |

**AppSheet flow:** Option A: Direct add to Sheet (AppSheet handles). Option B: Form action that calls GAS with file data. Phase 1: prefer direct add; GAS validates when used.

---

## 7. EVIDENCE_URL (Legacy)

FINANCE_TRANSACTION has EVIDENCE_URL (single URL). For multi-file evidence, use FINANCE_ATTACHMENT. EVIDENCE_URL remains for backward compatibility; new evidence should go to FINANCE_ATTACHMENT.
