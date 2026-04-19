# AppSheet Normalization Audit — CBV_SSA_LAOCONG_PRO

Cross-doc consistency audit after consolidation.

---

## 1. Topic Ownership

| Topic | Master File | Duplicate? |
|-------|-------------|------------|
| Top-level reference | 00_MASTER/APPSHEET_MASTER_REFERENCE | No |
| Deploy checklist | 00_MASTER/APPSHEET_DEPLOY_CHECKLIST_MASTER | No |
| Table config | 01_TABLES/APPSHEET_TABLE_CONFIG_MASTER | No |
| Field policy | 01_TABLES/APPSHEET_FIELD_POLICY_MASTER | No |
| Enum/master binding | 02_BINDING/APPSHEET_ENUM_MASTER_CODE_BINDING | No |
| Expressions | 02_BINDING/APPSHEET_EXPRESSION_MASTER | No |
| Views | 03_VIEWS_ACTIONS/APPSHEET_VIEW_MASTER | No |
| Actions | 03_VIEWS_ACTIONS/APPSHEET_ACTION_MASTER | No |
| Slice/security | 03_VIEWS_ACTIONS/APPSHEET_SLICE_SECURITY_MASTER | No |
| Attachment | 04_SUBSYSTEMS/APPSHEET_ATTACHMENT_SYSTEM_MASTER | No |
| Admin | 04_SUBSYSTEMS/APPSHEET_ADMIN_PANEL_MASTER | No |

**Result:** No duplicate topic ownership.

---

## 2. Deployment Order

- Master Reference: Bootstrap → Tables → Refs → Enum → Views → Verify
- Deploy Checklist: Same order
- Table Config: Key/label/refs align
- **Result:** No contradictory deployment order.

---

## 3. Field Policy

- Field Policy Master references CSV as source
- TASK workflow lock: STATUS, PROGRESS_PERCENT, DONE_AT, IS_DONE, DONE_AT, DONE_BY, TASK_UPDATE_LOG = Editable OFF
- CSV has EDITABLE_IF=FALSE for TASK_UPDATE_LOG
- **Result:** No contradictory field policy.

---

## 4. Enum/Master Binding

- ENUM_DICTIONARY: ENUM_VALUE stored, DISPLAY_TEXT shown
- MASTER_CODE: CODE stored; TASK_GROUP_CODE, CATEGORY_CODE, DOC_GROUP_CODE marked future/optional
- Attachment enums: TASK_ATTACHMENT_TYPE, FINANCE_ATTACHMENT_TYPE, FILE_GROUP
- **Result:** Consistent; non-schema fields marked future.

---

## 5. Admin Guidance

- ADMIN_AUDIT_LOG: read-only everywhere
- Admin Panel Master: separate app, ADMIN_EMAILS, no inline edit
- **Result:** No contradictory admin guidance.

---

## 6. Attachment Guidance

- FILE_URL = File type
- IsPartOf = ON for child attachment tables
- Enum naming: TASK_ATTACHMENT_TYPE, FINANCE_ATTACHMENT_TYPE
- **Result:** Consistent.

---

## 7. Special Corrections Applied

1. **ADMIN_AUDIT_LOG:** Confirmed read-only in all masters.
2. **Non-schema fields:** TASK_GROUP_CODE, CATEGORY_CODE, DOC_GROUP_CODE in MASTER_CODE binding marked future/optional.
3. **Attachment enum naming:** Normalized to TASK_ATTACHMENT_TYPE, FINANCE_ATTACHMENT_TYPE, FILE_GROUP.
4. **Slice syntax:** Consolidated to consistent AppSheet expression format.
5. **Field policy vs CSV:** Master references CSV; no contradiction.

---

## 8. Unresolved Limitations

- RELATION_TYPE: No enum in schema; free text or future MASTER_CODE.
- DON_VI_ID: Ref to DON_VI (ACTIVE_DON_VI) for unit attribution.
- Role assignment: AppSheet Account list; no USER_ROLE sheet.
- Webhook permission validation: Documented as deployment requirement if not implemented.
