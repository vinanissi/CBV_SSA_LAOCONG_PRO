# AppSheet Documentation Classification Matrix

**Date:** 2025-03-18  
**Purpose:** Classify all AppSheet docs for normalization; record disposition.

---

## Topic Groups

| Group | Topic | Target Master File |
|-------|-------|--------------------|
| master/spec | Top-level reference, architecture, deployment flow | 00_MASTER/APPSHEET_MASTER_REFERENCE.md |
| deploy/checklist | Operator/build checklist, step-by-step | 00_MASTER/APPSHEET_DEPLOY_CHECKLIST_MASTER.md |
| field policy | Per-field hidden/readonly/editable | 01_TABLES/APPSHEET_FIELD_POLICY_MASTER.md |
| table config | Per-table key, label, refs, risks | 01_TABLES/APPSHEET_TABLE_CONFIG_MASTER.md |
| enum/master binding | ENUM_DICTIONARY, MASTER_CODE, display mapping | 02_BINDING/APPSHEET_ENUM_MASTER_CODE_BINDING.md |
| expressions | Valid_If, Editable_If, Show_If, filters | 02_BINDING/APPSHEET_EXPRESSION_MASTER.md |
| views/actions | View design, action catalog | 03_VIEWS_ACTIONS/APPSHEET_VIEW_MASTER.md, APPSHEET_ACTION_MASTER.md |
| slice/security | Slices, security filters, role visibility | 03_VIEWS_ACTIONS/APPSHEET_SLICE_SECURITY_MASTER.md |
| attachment subsystem | Attachment tables, UX, policy | 04_SUBSYSTEMS/APPSHEET_ATTACHMENT_SYSTEM_MASTER.md |
| admin subsystem | Admin tables, views, operational checklist | 04_SUBSYSTEMS/APPSHEET_ADMIN_PANEL_MASTER.md |

---

## File-by-File Classification

| # | Original File | Current Purpose | Primary Topic | Overlaps | Disposition | Target Master |
|---|---------------|-----------------|---------------|----------|-------------|---------------|
| 1 | APPSHEET_BUILD_SPEC_LAOCONG_PRO.md | High-level build spec | master/spec | BUILD_SPEC, PHASE1_CONFIG | Absorb | APPSHEET_MASTER_REFERENCE |
| 2 | APPSHEET_MANUAL_CONFIG_CHECKLIST.md | Step-by-step operator checklist | deploy/checklist | TABLE_READY, DEPLOYMENT_NOTES | Absorb | APPSHEET_DEPLOY_CHECKLIST_MASTER |
| 3 | APPSHEET_FIELD_POLICY_MAP.md | Per-field policy reference | field policy | TASK_MODULE_FIELD_POLICY, APPSHEET_TASK_POLICY | Absorb | APPSHEET_FIELD_POLICY_MASTER |
| 4 | APPSHEET_FIELD_POLICY_MAP.csv | Machine-readable field policy | field policy | — | Keep as source data | (referenced by APPSHEET_FIELD_POLICY_MASTER) |
| 5 | APPSHEET_FIELD_POLICY_MAP.json | Machine-readable field policy | field policy | — | Keep as source data | (referenced) |
| 6 | APPSHEET_TASK_POLICY.md | TASK workflow lock, bypass risk | field policy + deploy | FIELD_POLICY_MAP | Absorb | APPSHEET_FIELD_POLICY_MASTER, APPSHEET_DEPLOY_CHECKLIST |
| 7 | TASK_MODULE_FIELD_POLICY.md | TASK-specific field policy | field policy | FIELD_POLICY_MAP | Absorb | APPSHEET_FIELD_POLICY_MASTER |
| 8 | APPSHEET_ENUM_BINDING.md | ENUM_DICTIONARY binding | enum binding | — | Absorb | APPSHEET_ENUM_MASTER_CODE_BINDING |
| 9 | APPSHEET_MASTER_CODE_BINDING.md | MASTER_CODE binding | master binding | DISPLAY_MAPPING | Absorb | APPSHEET_ENUM_MASTER_CODE_BINDING |
| 10 | APPSHEET_DISPLAY_MAPPING.md | Display value rules | enum/master binding | — | Absorb | APPSHEET_ENUM_MASTER_CODE_BINDING |
| 11 | APPSHEET_EXPRESSION_PACK_LAOCONG_PRO.md | Reusable expressions | expressions | — | Absorb | APPSHEET_EXPRESSION_MASTER |
| 12 | APPSHEET_TABLE_READY_CHECKLIST.md | Per-table verification | table config | MANUAL_CONFIG | Absorb | APPSHEET_TABLE_CONFIG_MASTER |
| 13 | APPSHEET_DEPLOYMENT_NOTES.md | Deployment order, rules | deploy | MANUAL_CONFIG | Absorb | APPSHEET_DEPLOY_CHECKLIST_MASTER |
| 14 | APPSHEET_PHASE1_CONFIG.md | Phase 1 table/view/slice config | table config + views | BUILD_SPEC, VIEW_ARCHITECTURE | Absorb | APPSHEET_TABLE_CONFIG_MASTER, APPSHEET_VIEW_MASTER |
| 15 | APPSHEET_REF_MAP.md | Ref field mappings | table config | — | Absorb | APPSHEET_TABLE_CONFIG_MASTER |
| 16 | APPSHEET_KEY_LABEL_MAP.md | Key/label per table | table config | — | Absorb | APPSHEET_TABLE_CONFIG_MASTER |
| 17 | APPSHEET_VIEW_ARCHITECTURE.md | Full view inventory | views | VIEW_MAP_MASTER, DETAIL_VIEWS, FORM_VIEWS | Absorb | APPSHEET_VIEW_MASTER |
| 18 | APPSHEET_VIEW_MAP_MASTER.md | View list by module | views | VIEW_ARCHITECTURE | Absorb | APPSHEET_VIEW_MASTER |
| 19 | APPSHEET_VIEW_MAP.csv | View mapping data | views | — | Keep as source | (referenced) |
| 20 | APPSHEET_DETAIL_VIEWS.md | Detail view specs | views | — | Absorb | APPSHEET_VIEW_MASTER |
| 21 | APPSHEET_FORM_VIEWS.md | Form view specs | views | — | Absorb | APPSHEET_VIEW_MASTER |
| 22 | APPSHEET_INLINE_VIEWS.md | Inline view specs | views | INLINE_ATTACHMENT_UX | Absorb | APPSHEET_VIEW_MASTER |
| 23 | APPSHEET_ACTION_MAP_MASTER.md | Action catalog | actions | — | Absorb | APPSHEET_ACTION_MASTER |
| 24 | APPSHEET_SLICE_SPEC.md | Slice conditions | slice/security | PHASE1_CONFIG | Absorb | APPSHEET_SLICE_SECURITY_MASTER |
| 25 | APPSHEET_SECURITY_FILTERS.md | Security filters per table | slice/security | — | Absorb | APPSHEET_SLICE_SECURITY_MASTER |
| 26 | APPSHEET_ATTACHMENT_SYSTEM.md | Attachment architecture | attachment | ATTACHMENT_POLICY, ATTACHMENT_VIEWS | Absorb | APPSHEET_ATTACHMENT_SYSTEM_MASTER |
| 27 | APPSHEET_ATTACHMENT_POLICY.md | Attachment field policy | attachment | — | Absorb | APPSHEET_ATTACHMENT_SYSTEM_MASTER |
| 28 | APPSHEET_ATTACHMENT_VIEWS.md | Attachment inline columns | attachment | — | Absorb | APPSHEET_ATTACHMENT_SYSTEM_MASTER |
| 29 | APPSHEET_ATTACHMENT_FORMS.md | Attachment form field order | attachment | — | Absorb | APPSHEET_ATTACHMENT_SYSTEM_MASTER |
| 30 | APPSHEET_INLINE_ATTACHMENT_UX.md | Inline attachment UX | attachment | — | Absorb | APPSHEET_ATTACHMENT_SYSTEM_MASTER |
| 31 | ATTACHMENT_SYSTEM_DELIVERABLES.md | Implementation summary | attachment | — | Absorb (summary only) | APPSHEET_ATTACHMENT_SYSTEM_MASTER |
| 32 | APPSHEET_ADMIN_PANEL.md | Admin panel config | admin | ADMIN_PANEL_DATA_MODEL, ADMIN_PANEL_SERVICE | Absorb | APPSHEET_ADMIN_PANEL_MASTER |
| 33 | APPSHEET_ADMIN_SECURITY.md | Admin security | admin | — | Absorb | APPSHEET_ADMIN_PANEL_MASTER |
| 34 | ADMIN_PANEL_DATA_MODEL.md | Admin data model | admin | — | Absorb | APPSHEET_ADMIN_PANEL_MASTER |
| 35 | ADMIN_PANEL_SERVICE_REFERENCE.md | Admin GAS functions | admin | — | Absorb | APPSHEET_ADMIN_PANEL_MASTER |
| 36 | ADMIN_OPERATING_CHECKLIST.md | Admin operational checklist | admin | — | Absorb | APPSHEET_ADMIN_PANEL_MASTER |
| 37 | APPSHEET_UX_MASTER.md | UX principles | master/spec | — | Absorb (principles only) | APPSHEET_MASTER_REFERENCE |
| 38 | APPSHEET_BUILD_MAPPING_MASTER.csv | Build mapping data | — | — | Keep as source | (referenced) |

---

## Data Files (Not Archived)

| File | Role |
|------|------|
| APPSHEET_FIELD_POLICY_MAP.csv | Authoritative field policy data; referenced by docs |
| APPSHEET_FIELD_POLICY_MAP.json | Same as CSV; machine consumption |
| APPSHEET_VIEW_MAP.csv | View mapping data |
| APPSHEET_BUILD_MAPPING_MASTER.csv | Build mapping data |

---

## Special Corrections Applied

1. **ADMIN_AUDIT_LOG:** Confirmed operationally read-only in all absorbed content.
2. **Non-schema fields:** TASK_GROUP_CODE, CATEGORY_CODE, DOC_GROUP_CODE marked as future/optional in MASTER_CODE binding.
3. **Attachment enum naming:** Normalized to TASK_ATTACHMENT_TYPE, FINANCE_ATTACHMENT_TYPE, FILE_GROUP.
4. **Slice/security syntax:** Consolidated to consistent AppSheet expression format.
5. **Field policy vs CSV/JSON:** Master doc references CSV as source; no contradiction introduced.
