# AppSheet Inline Attachment UX — CBV_SSA_LAOCONG_PRO

Production-safe inline attachment UX for HO_SO, TASK, and FINANCE. Users upload and view related files directly from parent detail screens.

**Phase 1:** Minimal, stable, manual AppSheet configuration. No advanced automation.

---

## PART 1 — VERIFIED PARENT-CHILD MODEL

### A. HO_SO

| Role | Table | Key | Parent Ref | File Column | Type Field |
|------|-------|-----|------------|-------------|------------|
| Parent | HO_SO_MASTER | ID | — | — | — |
| Child | HO_SO_FILE | ID | HO_SO_ID → HO_SO_MASTER | FILE_URL | FILE_GROUP |

**Child table verification:**
1. Key column = ID ✓
2. Parent ref = HO_SO_ID → HO_SO_MASTER ✓
3. File column = FILE_URL (AppSheet Type = File) ✓
4. Type field = FILE_GROUP (CCCD, GPLX, DANG_KY_XE, HOP_DONG, KHAC) ✓
5. Safe for inline create ✓

---

### B. TASK

| Role | Table | Key | Parent Ref | File Column | Type Field |
|------|-------|-----|------------|-------------|------------|
| Parent | TASK_MAIN | ID | — | — | — |
| Child | TASK_ATTACHMENT | ID | TASK_ID → TASK_MAIN | FILE_URL | ATTACHMENT_TYPE |

**Child table verification:**
1. Key column = ID ✓
2. Parent ref = TASK_ID → TASK_MAIN ✓
3. File column = FILE_URL (AppSheet Type = File) ✓
4. Type field = ATTACHMENT_TYPE (DRAFT, RESULT, SOP, REFERENCE, OTHER) ✓
5. Safe for inline create ✓

---

### C. FINANCE

| Role | Table | Key | Parent Ref | File Column | Type Field |
|------|-------|-----|------------|-------------|------------|
| Parent | FINANCE_TRANSACTION | ID | — | — | — |
| Child | FINANCE_ATTACHMENT | ID | FINANCE_ID → FINANCE_TRANSACTION | FILE_URL | ATTACHMENT_TYPE |

**Child table verification:**
1. Key column = ID ✓
2. Parent ref = FINANCE_ID → FINANCE_TRANSACTION ✓
3. File column = FILE_URL (AppSheet Type = File) ✓
4. Type field = ATTACHMENT_TYPE (INVOICE, RECEIPT, CONTRACT, PROOF, OTHER) ✓
5. Safe for inline create ✓

**Note:** FINANCE_TRANSACTION.EVIDENCE_URL is legacy single-URL; new evidence uses FINANCE_ATTACHMENT.

---

## PART 2 — APPSHEET INLINE RELATION DESIGN

### Required Ref Configuration

| Child Table | Ref Field | Parent Table | Display Column | Filter for Inline |
|-------------|-----------|--------------|----------------|-------------------|
| HO_SO_FILE | HO_SO_ID | HO_SO_MASTER | NAME | `[HO_SO_ID] = [HO_SO_MASTER].[ID]` |
| TASK_ATTACHMENT | TASK_ID | TASK_MAIN | TITLE | `[TASK_ID] = [TASK_MAIN].[ID]` |
| FINANCE_ATTACHMENT | FINANCE_ID | FINANCE_TRANSACTION | TRANS_CODE | `[FINANCE_ID] = [FINANCE_TRANSACTION].[ID]` |

### IsPartOf Recommendation

| Child Table | IsPartOf | Reason |
|-------------|----------|--------|
| HO_SO_FILE | **ON** | Add from HO_SO_DETAIL auto-links HO_SO_ID to current row |
| TASK_ATTACHMENT | **ON** | Add from TASK_DETAIL auto-links TASK_ID to current row |
| FINANCE_ATTACHMENT | **ON** | Add from FINANCE_DETAIL auto-links FINANCE_ID to current row |

**When IsPartOf = ON:** User taps Add on parent detail → child form opens → parent ref is pre-filled; user does not select parent.

### Inline List Columns (visible in inline view)

| Child Table | Visible Columns |
|-------------|-----------------|
| HO_SO_FILE | FILE_GROUP, FILE_NAME, FILE_URL, NOTE |
| TASK_ATTACHMENT | ATTACHMENT_TYPE, TITLE, FILE_URL, NOTE |
| FINANCE_ATTACHMENT | ATTACHMENT_TYPE, TITLE, FILE_URL, NOTE |

### Child Form Hidden Columns (when opened inline)

| Child Table | Hidden |
|-------------|--------|
| All | ID, CREATED_AT, CREATED_BY, DRIVE_FILE_ID |
| HO_SO_FILE | HO_SO_ID (readonly when inline; auto-linked) |
| TASK_ATTACHMENT | TASK_ID (readonly when inline; auto-linked) |
| FINANCE_ATTACHMENT | FINANCE_ID (readonly when inline; auto-linked) |

### Parent Linking Auto-Fill

- **AppSheet behavior:** When child table is shown as inline view of parent and IsPartOf is enabled, the Add action sets the parent ref to the current parent row.
- **No custom action needed** for Phase 1; default inline Add is sufficient.

---

## PART 3 — CHILD FORM UX

### HO_SO_FILE Form (inline from HO_SO_DETAIL)

| Field | Visible | Editable | Order |
|-------|---------|----------|-------|
| FILE_GROUP | Yes | Yes | 1 |
| FILE_NAME | Yes | Yes | 2 |
| FILE_URL | Yes | Yes | 3 |
| NOTE | Yes | Yes | 4 |
| HO_SO_ID | No (inline) | No | — |
| ID, DRIVE_FILE_ID, STATUS, CREATED_AT, CREATED_BY | No | No | — |

**Note:** HO_SO_FILE has no TITLE; use FILE_NAME. STATUS is controlled (Phase 1: hide or readonly).

---

### TASK_ATTACHMENT Form (inline from TASK_DETAIL)

| Field | Visible | Editable | Order |
|-------|---------|----------|-------|
| ATTACHMENT_TYPE | Yes | Yes | 1 |
| TITLE | Yes | Yes | 2 |
| FILE_URL | Yes | Yes | 3 |
| NOTE | Yes | Yes | 4 |
| TASK_ID | No (inline) | No | — |
| ID, FILE_NAME, DRIVE_FILE_ID, CREATED_AT, CREATED_BY | No | No | — |

**Note:** FILE_NAME can be hidden; TITLE is the label. AppSheet File upload may auto-populate FILE_NAME.

---

### FINANCE_ATTACHMENT Form (inline from FINANCE_DETAIL)

| Field | Visible | Editable | Order |
|-------|---------|----------|-------|
| ATTACHMENT_TYPE | Yes | Yes | 1 |
| TITLE | Yes | Yes | 2 |
| FILE_URL | Yes | Yes | 3 |
| NOTE | Yes | Yes | 4 |
| FINANCE_ID | No (inline) | No | — |
| ID, FILE_NAME, DRIVE_FILE_ID, CREATED_AT, CREATED_BY | No | No | — |

---

## PART 4 — INLINE VIEW UX

### HO_SO_FILE Inline (HO_SO_FILE_INLINE)

| Column | Show | Purpose |
|--------|------|---------|
| FILE_GROUP | Yes | Document type |
| FILE_NAME | Yes | Display label |
| FILE_URL | Yes | File link/preview |
| NOTE | Yes | Optional note |
| ID, HO_SO_ID, DRIVE_FILE_ID, STATUS, CREATED_* | No | Internal |

---

### TASK_ATTACHMENT Inline (TASK_ATTACHMENT_INLINE)

| Column | Show | Purpose |
|--------|------|---------|
| ATTACHMENT_TYPE | Yes | DRAFT/RESULT/SOP/REFERENCE/OTHER |
| TITLE | Yes | Display label |
| FILE_URL | Yes | File link/preview |
| NOTE | Yes | Optional note |
| ID, TASK_ID, DRIVE_FILE_ID, CREATED_* | No | Internal |

---

### FINANCE_ATTACHMENT Inline (FIN_ATTACHMENT_INLINE)

| Column | Show | Purpose |
|--------|------|---------|
| ATTACHMENT_TYPE | Yes | INVOICE/RECEIPT/CONTRACT/PROOF/OTHER |
| TITLE | Yes | Display label |
| FILE_URL | Yes | File link/preview |
| NOTE | Yes | Optional note |
| ID, FINANCE_ID, DRIVE_FILE_ID, CREATED_* | No | Internal |

---

## PART 5 — FIELD POLICY FOR INLINE UX

### Child Table Field Policy Summary

| Field | Policy |
|-------|--------|
| ID | Hidden, readonly |
| Parent ref (HO_SO_ID, TASK_ID, FINANCE_ID) | Hidden or readonly when opened inline |
| FILE_URL | Visible, editable, Type = File |
| Type/group field | Visible, controlled (Valid_If enum) |
| TITLE / FILE_NAME | Visible, editable |
| NOTE | Visible, editable |
| CREATED_AT, CREATED_BY | Hidden, readonly |
| DRIVE_FILE_ID | Hidden, readonly |
| STATUS (HO_SO_FILE) | Hidden or readonly (Phase 1) |

### Alignment with APPSHEET_FIELD_POLICY_MAP

- See 04_APPSHEET/APPSHEET_FIELD_POLICY_MAP.md for full schema.
- Attachment tables: HO_SO_FILE, TASK_ATTACHMENT, FINANCE_ATTACHMENT — policy aligned.

---

## PART 6 — ENUM / MASTER CODE BINDING

### HO_SO_FILE.FILE_GROUP

- **Source:** ENUM_DICTIONARY
- **Filter:** ENUM_GROUP = "FILE_GROUP", IS_ACTIVE = TRUE
- **Valid_If:**
```
IN([FILE_GROUP], SELECT(ENUM_DICTIONARY[ENUM_VALUE], AND(ENUM_DICTIONARY[ENUM_GROUP] = "FILE_GROUP", ENUM_DICTIONARY[IS_ACTIVE] = TRUE)))
```
- **Values:** CCCD, GPLX, DANG_KY_XE, HOP_DONG, KHAC
- **Do not allow other values**

---

### TASK_ATTACHMENT.ATTACHMENT_TYPE

- **Source:** ENUM_DICTIONARY
- **Filter:** ENUM_GROUP = "TASK_ATTACHMENT_TYPE", IS_ACTIVE = TRUE
- **Valid_If:**
```
IN([ATTACHMENT_TYPE], SELECT(ENUM_DICTIONARY[ENUM_VALUE], AND(ENUM_DICTIONARY[ENUM_GROUP] = "TASK_ATTACHMENT_TYPE", ENUM_DICTIONARY[IS_ACTIVE] = TRUE)))
```
- **Values:** DRAFT, RESULT, SOP, REFERENCE, OTHER
- **Do not allow other values**

---

### FINANCE_ATTACHMENT.ATTACHMENT_TYPE

- **Source:** ENUM_DICTIONARY
- **Filter:** ENUM_GROUP = "FINANCE_ATTACHMENT_TYPE", IS_ACTIVE = TRUE
- **Valid_If:**
```
IN([ATTACHMENT_TYPE], SELECT(ENUM_DICTIONARY[ENUM_VALUE], AND(ENUM_DICTIONARY[ENUM_GROUP] = "FINANCE_ATTACHMENT_TYPE", ENUM_DICTIONARY[IS_ACTIVE] = TRUE)))
```
- **Values:** INVOICE, RECEIPT, CONTRACT, PROOF, OTHER
- **Do not allow other values**

---

## PART 7 — ACTIONS / ENTRY POINTS

### User Flow

1. User opens parent detail (HO_SO_DETAIL, TASK_DETAIL, FIN_DETAIL)
2. Inline view shows related attachments
3. User taps **Add**
4. Child form opens with parent ref auto-linked
5. User selects type, uploads file (FILE_URL), adds note
6. Save → child row appears under parent

### Entry Point Configuration

| Question | Answer |
|----------|--------|
| Default inline Add enough? | **Yes** — no custom Add action needed |
| Custom Add action needed? | **No** for Phase 1 |
| Child form standalone visible? | **Optional** — can hide from nav; primary use is inline |
| Safest Phase 1 approach? | Inline Add only; child form only from parent detail |

### Recommended Phase 1

- **HO_SO_DETAIL:** Inline HO_SO_FILE; Add opens HO_SO_FILE form; HO_SO_ID auto-linked
- **TASK_DETAIL:** Inline TASK_ATTACHMENT; Add opens TASK_ATTACHMENT form; TASK_ID auto-linked
- **FIN_DETAIL:** Inline FINANCE_ATTACHMENT; Add opens FINANCE_ATTACHMENT form; FINANCE_ID auto-linked

---

## PART 8 — APPSHEET CONFIGURATION CHECKLIST

### Per Parent Detail View

1. Add **Inline view** from child attachment table
2. Set **Filter** to `[PARENT_REF] = [PARENT_TABLE].[ID]`
3. Enable **IsPartOf** on child table
4. Configure inline list columns (type, title/name, FILE_URL, NOTE)
5. Configure child form: show FILE_GROUP/ATTACHMENT_TYPE, TITLE/FILE_NAME, FILE_URL, NOTE; hide ID, parent ref, CREATED_*, DRIVE_FILE_ID
6. Set FILE_URL column **Type = File** in data editor
7. Add Valid_If for type/group fields (see Part 6)

### FILE_URL Type = File

- In AppSheet Data → HO_SO_FILE / TASK_ATTACHMENT / FINANCE_ATTACHMENT → FILE_URL column
- Set **Type** = **File**
- AppSheet handles upload to Drive; URL stored automatically

---

## PART 9 — PHASE 1 SAFETY RULES

1. No advanced automation required
2. No OCR or file processing logic
3. No complicated role logic beyond existing
4. No upload logic outside AppSheet standard file workflow
5. No unsafe editable system fields (ID, CREATED_*, DRIVE_FILE_ID hidden)
6. No misleading UI clutter

---

## PART 10 — SCHEMA MISMATCH / NOTES

### Module DATA_MODEL vs Schema

- **02_MODULES/TASK_CENTER/DATA_MODEL.md** lists TASK_ATTACHMENT without ATTACHMENT_TYPE, TITLE. **Actual schema** (schema_manifest.json, _generated_schema) has ATTACHMENT_TYPE, TITLE. Use schema as authoritative.
- **02_MODULES/FINANCE/DATA_MODEL.md** does not list FINANCE_ATTACHMENT. **Actual schema** includes FINANCE_ATTACHMENT. Use schema as authoritative.

### REF_MAP Update

- FINANCE_ATTACHMENT added to 04_APPSHEET/APPSHEET_REF_MAP.md: FINANCE_ID → FINANCE_TRANSACTION.

---

## FINAL OUTPUT SUMMARY

### 1. Parent-Child Inline Mapping

| Parent | Child | Ref | Filter |
|--------|-------|-----|--------|
| HO_SO_MASTER | HO_SO_FILE | HO_SO_ID | `[HO_SO_ID] = [HO_SO_MASTER].[ID]` |
| TASK_MAIN | TASK_ATTACHMENT | TASK_ID | `[TASK_ID] = [TASK_MAIN].[ID]` |
| FINANCE_TRANSACTION | FINANCE_ATTACHMENT | FINANCE_ID | `[FINANCE_ID] = [FINANCE_TRANSACTION].[ID]` |

### 2. AppSheet Configuration Requirements

- Ref: HO_SO_ID→HO_SO_MASTER, TASK_ID→TASK_MAIN, FINANCE_ID→FINANCE_TRANSACTION
- IsPartOf: ON for all three child tables
- FILE_URL: Type = File
- Valid_If: enum binding for FILE_GROUP, TASK_ATTACHMENT_TYPE, FINANCE_ATTACHMENT_TYPE

### 3. Child Form Field List

| Table | Visible Fields (order) |
|-------|------------------------|
| HO_SO_FILE | FILE_GROUP, FILE_NAME, FILE_URL, NOTE |
| TASK_ATTACHMENT | ATTACHMENT_TYPE, TITLE, FILE_URL, NOTE |
| FINANCE_ATTACHMENT | ATTACHMENT_TYPE, TITLE, FILE_URL, NOTE |

### 4. Inline List Field List

| Table | Visible Columns |
|-------|-----------------|
| HO_SO_FILE | FILE_GROUP, FILE_NAME, FILE_URL, NOTE |
| TASK_ATTACHMENT | ATTACHMENT_TYPE, TITLE, FILE_URL, NOTE |
| FINANCE_ATTACHMENT | ATTACHMENT_TYPE, TITLE, FILE_URL, NOTE |

### 5. Field Hide/Readonly Policy

- **Hidden:** ID, CREATED_AT, CREATED_BY, DRIVE_FILE_ID; parent ref when inline
- **Readonly:** Parent ref when inline (auto-linked); STATUS (HO_SO_FILE) if shown

### 6. Enum/Type Bindings

- FILE_GROUP → ENUM_DICTIONARY FILE_GROUP
- TASK_ATTACHMENT_TYPE → ENUM_DICTIONARY TASK_ATTACHMENT_TYPE
- FINANCE_ATTACHMENT_TYPE → ENUM_DICTIONARY FINANCE_ATTACHMENT_TYPE

### 7. IsPartOf

| Child Table | IsPartOf |
|-------------|----------|
| HO_SO_FILE | ON |
| TASK_ATTACHMENT | ON |
| FINANCE_ATTACHMENT | ON |

### 8. Schema Mismatch Issues

- TASK_CENTER DATA_MODEL.md outdated (missing ATTACHMENT_TYPE, TITLE)
- FINANCE DATA_MODEL.md missing FINANCE_ATTACHMENT
- No blocking issues; schema is authoritative

---

## FINAL STATEMENT

**INLINE ATTACHMENT UX SAFE**

Ready to configure manually in AppSheet. Parent-child model verified. Ref and IsPartOf defined. Child forms and inline views minimal. Field policy aligned. Enum bindings documented. Phase 1 stable.
