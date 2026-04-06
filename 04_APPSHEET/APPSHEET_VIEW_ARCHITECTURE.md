# AppSheet View Architecture — CBV_SSA_LAOCONG_PRO

Complete view plan for Phase 1 manual AppSheet configuration. Aligned with CBV rules, field policy, and attachment architecture.

**Enforcement:** Label=DISPLAY_TEXT for Ref; workflow fields readonly; log tables readonly; system fields hidden.

---

## PART 1 — TABLES DISCOVERED

| # | Table | Role | Parent | Child Of |
|---|-------|------|--------|----------|
| 1 | ENUM_DICTIONARY | Admin/Shared | — | — |
| 2 | MASTER_CODE | Admin/Shared | — | — |
| 3 | ADMIN_AUDIT_LOG | Admin | — | — |
| 4 | HO_SO_MASTER | Parent | — | — |
| 5 | HO_SO_FILE | Child | HO_SO_MASTER | HO_SO_ID |
| 6 | HO_SO_RELATION | Child | HO_SO_MASTER | FROM_HO_SO_ID, TO_HO_SO_ID |
| 7 | TASK_MAIN | Parent | — | — |
| 8 | TASK_CHECKLIST | Child | TASK_MAIN | TASK_ID |
| 9 | TASK_UPDATE_LOG | Child | TASK_MAIN | TASK_ID |
| 10 | TASK_ATTACHMENT | Child | TASK_MAIN | TASK_ID |
| 11 | FINANCE_TRANSACTION | Parent | — | — |
| 12 | FINANCE_ATTACHMENT | Child | FINANCE_TRANSACTION | FINANCE_ID |
| 13 | FINANCE_LOG | Child | FINANCE_TRANSACTION | FIN_ID |

**Source:** schema_manifest.json, ENUM_DICTIONARY_SCHEMA.md, APPSHEET_REF_MAP.md

---

## PART 2 — PARENT-CHILD CONFIRMATION

| Parent | Detail View Required | Child Tables | Inline View Required |
|--------|---------------------|--------------|----------------------|
| HO_SO_MASTER | Yes (HO_SO_DETAIL) | HO_SO_FILE, HO_SO_RELATION | Yes |
| TASK_MAIN | Yes (TASK_DETAIL) | TASK_CHECKLIST, TASK_ATTACHMENT, TASK_UPDATE_LOG | Yes |
| FINANCE_TRANSACTION | Yes (FINANCE_DETAIL) | FINANCE_ATTACHMENT, FINANCE_LOG | Yes |

**All child tables have proper Ref fields.** No missing refs reported.

---

## PART 3 — VIEW ARCHITECTURE PRINCIPLES

1. **LIST/TABLE** — Browsing; minimal columns; slice-filtered
2. **DETAIL** — Record context; core business fields; inline children
3. **FORM** — Create/edit; controlled field exposure; no system fields
4. **INLINE** — Child records under parent; 3–5 columns; readable at a glance
5. **Phase 1 minimal** — No extra dashboards; operational focus
6. **Admin tables** — Separate app; not exposed to normal users
7. **Simple and readable** — No clutter; clean labels

---

## PART 4 — FULL VIEW INVENTORY

### HO_SO Module

| View | Type | Table | Usage |
|------|------|-------|-------|
| HO_SO_LIST | Table | HO_SO_MASTER | Browse records |
| HO_SO_DETAIL | Detail | HO_SO_MASTER | Record detail + inline children |
| HO_SO_FORM | Form | HO_SO_MASTER | Create/edit |
| HO_SO_FILE_INLINE | Inline | HO_SO_FILE | Under HO_SO_DETAIL |
| HO_SO_RELATION_INLINE | Inline | HO_SO_RELATION | Under HO_SO_DETAIL |
| HO_SO_FILE_FORM | Form | HO_SO_FILE | Child form (inline add) |
| HO_SO_RELATION_FORM | Form | HO_SO_RELATION | Child form (inline add) |

### TASK Module

| View | Type | Table | Usage |
|------|------|-------|-------|
| TASK_LIST | Table | TASK_MAIN | Browse tasks |
| TASK_DETAIL | Detail | TASK_MAIN | Task detail + inline children |
| TASK_FORM | Form | TASK_MAIN | Create/edit task |
| TASK_CHECKLIST_INLINE | Inline | TASK_CHECKLIST | Under TASK_DETAIL |
| TASK_ATTACHMENT_INLINE | Inline | TASK_ATTACHMENT | Under TASK_DETAIL |
| TASK_LOG_INLINE | Inline | TASK_UPDATE_LOG | Under TASK_DETAIL |
| TASK_CHECKLIST_FORM | Form | TASK_CHECKLIST | Child form (inline add) |
| TASK_ATTACHMENT_FORM | Form | TASK_ATTACHMENT | Child form (inline add) |
| TASK_UPDATE_LOG | Read-only | TASK_UPDATE_LOG | No form; log only |

### FINANCE Module

| View | Type | Table | Usage |
|------|------|-------|-------|
| FINANCE_LIST | Table | FINANCE_TRANSACTION | Browse transactions |
| FINANCE_DETAIL | Detail | FINANCE_TRANSACTION | Transaction detail + inline children |
| FINANCE_FORM | Form | FINANCE_TRANSACTION | Create/edit transaction |
| FIN_ATTACHMENT_INLINE | Inline | FINANCE_ATTACHMENT | Under FINANCE_DETAIL |
| FIN_LOG_INLINE | Inline | FINANCE_LOG | Under FINANCE_DETAIL |
| FINANCE_ATTACHMENT_FORM | Form | FINANCE_ATTACHMENT | Child form (inline add) |
| FINANCE_LOG | Read-only | FINANCE_LOG | No form; log only |

### Admin / Shared (Admin app only)

| View | Type | Table | Usage |
|------|------|-------|-------|
| ENUM_LIST | Table | ENUM_DICTIONARY | Browse enums |
| ENUM_DETAIL | Detail | ENUM_DICTIONARY | Enum row detail |
| ENUM_FORM | Form | ENUM_DICTIONARY | Create (edit via GAS) |
| MASTER_CODE_LIST | Table | MASTER_CODE | Browse master codes |
| MASTER_CODE_DETAIL | Detail | MASTER_CODE | Master code detail |
| MASTER_CODE_FORM | Form | MASTER_CODE | Create (edit via GAS) |
| ADMIN_AUDIT_LOG_LIST | Table | ADMIN_AUDIT_LOG | Browse audit log |
| ADMIN_AUDIT_LOG_DETAIL | Detail | ADMIN_AUDIT_LOG | Audit log detail |

**Admin tables:** read-only or GAS-only edit; no inline add for ADMIN_AUDIT_LOG.

---

## PART 5 — DASHBOARD VIEWS (Phase 1 Minimal)

| View | Type | Purpose |
|------|------|---------|
| HO_SO_DASHBOARD | Dashboard | Optional; link to HO_SO_LIST |
| TASK_DASHBOARD | Dashboard | Optional; link to TASK_LIST, TASK_INBOX |
| TASK_INBOX | Table | My open tasks; filter: [OWNER_ID] = FIRST(SELECT(USER_DIRECTORY[ID], AND([STATUS]="ACTIVE", LOWER([EMAIL])=LOWER(USEREMAIL())))) |
| TASK_MY_OPEN | Table | Alias or variant of TASK_INBOX |
| FIN_DASHBOARD | Dashboard | Optional; link to FINANCE_LIST |
| FIN_CONFIRM_QUEUE | Table | Pending confirmation (STATUS = "NEW") |

**Rule:** Do not overload Phase 1 with dashboard complexity. Prefer LIST + DETAIL + FORM.

---

## PART 6 — INLINE RELATIONS SUMMARY

| Parent Detail | Inline Child | Filter | IsPartOf |
|---------------|--------------|--------|----------|
| HO_SO_DETAIL | HO_SO_FILE_INLINE | [HO_SO_ID] = [HO_SO_MASTER].[ID] | ON |
| HO_SO_DETAIL | HO_SO_RELATION_INLINE | [FROM_HO_SO_ID] = [HO_SO_MASTER].[ID] OR [TO_HO_SO_ID] = [HO_SO_MASTER].[ID] | OFF* |
| TASK_DETAIL | TASK_CHECKLIST_INLINE | [TASK_ID] = [TASK_MAIN].[ID] | ON |
| TASK_DETAIL | TASK_ATTACHMENT_INLINE | [TASK_ID] = [TASK_MAIN].[ID] | ON |
| TASK_DETAIL | TASK_LOG_INLINE | [TASK_ID] = [TASK_MAIN].[ID] | OFF (read-only) |
| FINANCE_DETAIL | FIN_ATTACHMENT_INLINE | [FINANCE_ID] = [FINANCE_TRANSACTION].[ID] | ON |
| FINANCE_DETAIL | FIN_LOG_INLINE | [FIN_ID] = [FINANCE_TRANSACTION].[ID] | OFF (read-only) |

*HO_SO_RELATION has two refs (FROM, TO); IsPartOf typically applies to single-parent ref. For FROM_HO_SO_ID = current row, IsPartOf can be ON when adding "from" this HO_SO. For TO_HO_SO_ID, user selects. Phase 1: IsPartOf OFF or partial; document behavior.

---

## PART 7 — MISSING / DEPENDENCY NOTES

| Item | Note |
|------|------|
| ENUM_DICTIONARY | Not in schema_manifest; created by initAll(). Must exist before AppSheet config. |
| HO_SO_RELATION | Dual ref (FROM, TO); inline filter uses OR. Add form may need explicit FROM or TO selection. |
| TASK_UPDATE_LOG | Read-only; no Add. GAS creates rows. |
| FINANCE_LOG | Read-only; no Add. GAS creates rows. |
| RELATION_TYPE | No enum in schema; free text or MASTER_CODE if added later. |

---

## PART 8 — VIEW-TO-TABLE MAPPING

See APPSHEET_VIEW_MAP.csv for machine-readable mapping.

---

## PART 9 — PHASE 1 SAFETY

- No business logic in views
- STATUS change via GAS actions only
- Log tables read-only
- Admin tables in separate app
- System fields hidden by default
- Enum/master-code fields controlled

---

## PART 10 — FIELD ORDERING SUMMARY

| View | Table | Visible Fields (order) |
|------|-------|------------------------|
| HO_SO_DETAIL | HO_SO_MASTER | NAME, CODE, HO_SO_TYPE, HO_SO_TYPE_ID, STATUS, HTX_ID, OWNER_ID, PHONE, EMAIL, ID_NO, ADDRESS, START_DATE, END_DATE, NOTE, TAGS_TEXT |
| HO_SO_FORM | HO_SO_MASTER | HO_SO_TYPE_ID, HO_SO_TYPE, CODE, NAME, HTX_ID, OWNER_ID, PHONE, EMAIL, ID_NO, ADDRESS, START_DATE, END_DATE, NOTE, TAGS_TEXT, STATUS |
| TASK_DETAIL | TASK_MAIN | TITLE, TASK_CODE, TASK_TYPE_ID, STATUS, PRIORITY, DON_VI_ID, OWNER_ID, REPORTER_ID, RELATED_*, START_DATE, DUE_DATE, DONE_AT, RESULT_SUMMARY, DESCRIPTION |
| TASK_FORM | TASK_MAIN | TASK_TYPE_ID, TITLE, TASK_CODE, PRIORITY, DON_VI_ID, OWNER_ID, REPORTER_ID, RELATED_*, START_DATE, DUE_DATE, DESCRIPTION, RESULT_SUMMARY, STATUS |
| FINANCE_DETAIL | FINANCE_TRANSACTION | TRANS_CODE, TRANS_DATE, TRANS_TYPE, STATUS, CATEGORY, AMOUNT, DON_VI_ID, COUNTERPARTY, PAYMENT_METHOD, REFERENCE_NO, RELATED_*, DESCRIPTION, EVIDENCE_URL |
| FINANCE_FORM | FINANCE_TRANSACTION | TRANS_TYPE, TRANS_DATE, CATEGORY, AMOUNT, DON_VI_ID, COUNTERPARTY, PAYMENT_METHOD, REFERENCE_NO, RELATED_*, DESCRIPTION, EVIDENCE_URL, TRANS_CODE, STATUS |

See APPSHEET_DETAIL_VIEWS.md and APPSHEET_FORM_VIEWS.md for full specs.

---

## PART 11 — HIDDEN/READONLY POLICY SUMMARY

### Always Hidden (all views)

ID, CREATED_AT, CREATED_BY, UPDATED_AT, UPDATED_BY, IS_DELETED, BEFORE_JSON, AFTER_JSON, CONFIRMED_AT, CONFIRMED_BY, DRIVE_FILE_ID

**Ref display:** OWNER_ID, REPORTER_ID, DONE_BY, CONFIRMED_BY, DON_VI_ID → display DISPLAY_TEXT or NAME; never raw ID.

### Always Readonly

- STATUS (all tables) — GAS action only
- TASK_UPDATE_LOG, FINANCE_LOG — all columns
- ADMIN_AUDIT_LOG — all columns
- DONE_AT, DONE_BY, IS_DONE (TASK_CHECKLIST) — GAS or action

### Conditional Readonly (Editable_If)

- FINANCE_TRANSACTION business fields: `[STATUS] <> "CONFIRMED"`

### Parent Ref (inline child forms)

- HO_SO_ID, TASK_ID, FINANCE_ID — hidden when opened inline; auto-linked by IsPartOf

---

## PART 12 — FINAL REQUIRED OUTPUT

### 1. Full View Inventory

27 views total: 7 HO_SO, 9 TASK, 7 FINANCE, 6 ADMIN. See PART 4.

### 2. Parent Detail Views

- HO_SO_DETAIL, TASK_DETAIL, FINANCE_DETAIL

### 3. Child Inline Views

- HO_SO_FILE_INLINE, HO_SO_RELATION_INLINE
- TASK_CHECKLIST_INLINE, TASK_ATTACHMENT_INLINE, TASK_LOG_INLINE
- FIN_ATTACHMENT_INLINE, FIN_LOG_INLINE

### 4. Form Views

- HO_SO_FORM, HO_SO_FILE_FORM, HO_SO_RELATION_FORM
- TASK_FORM, TASK_CHECKLIST_FORM, TASK_ATTACHMENT_FORM
- FINANCE_FORM, FINANCE_ATTACHMENT_FORM
- ENUM_FORM, MASTER_CODE_FORM (Admin)

### 5. Field Ordering Summary

See PART 10 and APPSHEET_DETAIL_VIEWS.md, APPSHEET_FORM_VIEWS.md.

### 6. Hidden/Readonly Policy Summary

See PART 11 and APPSHEET_FIELD_POLICY_MAP.md.

### 7. Missing Schema/View Dependency Issues

- ENUM_DICTIONARY not in schema_manifest; created by initAll()
- HO_SO_RELATION dual ref; inline filter uses OR
- RELATION_TYPE no enum; free text

### 8. TASK FORM / DETAIL / INLINE UX RULES

**TASK_FORM visible fields:** TITLE, DESCRIPTION, TASK_TYPE_ID, DON_VI_ID, PRIORITY, OWNER_ID, REPORTER_ID, RELATED_ENTITY_TYPE, RELATED_ENTITY_ID, START_DATE, DUE_DATE, NOTE.

**TASK_FORM hidden/readonly:** ID, TASK_CODE, STATUS, DONE_AT, PROGRESS_PERCENT, RESULT_NOTE, CREATED_*, UPDATED_*, IS_DELETED.

**TASK_DETAIL inline sections:**
- TASK_CHECKLIST_INLINE: editable add; IS_DONE via GAS action only
- TASK_ATTACHMENT_INLINE: upload via child form; parent TASK_ID auto-linked
- TASK_LOG_INLINE: **readonly**; no Add; GAS creates rows

**FINANCE_DETAIL inline sections:**
- FIN_ATTACHMENT_INLINE: editable add
- FIN_LOG_INLINE: **readonly**; no Add; GAS creates rows

**Log tables:** TASK_UPDATE_LOG, FINANCE_LOG, ADMIN_AUDIT_LOG — no Add/Edit/Delete in normal UX.

### 9. Final Statement

**VIEW ARCHITECTURE SAFE**

Ready for manual AppSheet configuration. All tables identified. Parent-child confirmed. Detail, form, and inline views defined. Field policy aligned. Ref display = DISPLAY_TEXT. Log tables readonly.
