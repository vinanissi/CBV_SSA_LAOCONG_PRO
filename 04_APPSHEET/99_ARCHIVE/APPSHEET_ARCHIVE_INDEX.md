# AppSheet Archive Index — CBV_SSA_LAOCONG_PRO

Disposition of original AppSheet docs after normalization. **Absorbed** = content merged into master; **Kept** = retained as source data; **Archived** = superseded by master.

---

## Absorbed → Master Mapping

| Original File | Absorbed Into | Role Previously |
|---------------|---------------|-----------------|
| APPSHEET_BUILD_SPEC_LAOCONG_PRO.md | APPSHEET_MASTER_REFERENCE | High-level spec |
| APPSHEET_MANUAL_CONFIG_CHECKLIST.md | APPSHEET_DEPLOY_CHECKLIST_MASTER | Operator checklist |
| APPSHEET_FIELD_POLICY_MAP.md | APPSHEET_FIELD_POLICY_MASTER | Field policy reference |
| APPSHEET_TASK_POLICY.md | APPSHEET_FIELD_POLICY_MASTER, APPSHEET_DEPLOY_CHECKLIST_MASTER | TASK workflow lock |
| TASK_MODULE_FIELD_POLICY.md | APPSHEET_FIELD_POLICY_MASTER | TASK field policy |
| APPSHEET_ENUM_BINDING.md | APPSHEET_ENUM_MASTER_CODE_BINDING | Enum binding |
| APPSHEET_MASTER_CODE_BINDING.md | APPSHEET_ENUM_MASTER_CODE_BINDING | Master code binding |
| APPSHEET_DISPLAY_MAPPING.md | APPSHEET_ENUM_MASTER_CODE_BINDING | Display rules |
| APPSHEET_EXPRESSION_PACK_LAOCONG_PRO.md | APPSHEET_EXPRESSION_MASTER | Expressions |
| APPSHEET_TABLE_READY_CHECKLIST.md | APPSHEET_TABLE_CONFIG_MASTER | Table verification |
| APPSHEET_DEPLOYMENT_NOTES.md | APPSHEET_DEPLOY_CHECKLIST_MASTER | Deployment order |
| APPSHEET_PHASE1_CONFIG.md | APPSHEET_TABLE_CONFIG_MASTER, APPSHEET_VIEW_MASTER | Phase 1 config |
| APPSHEET_REF_MAP.md | APPSHEET_TABLE_CONFIG_MASTER | Ref mappings |
| APPSHEET_KEY_LABEL_MAP.md | APPSHEET_TABLE_CONFIG_MASTER | Key/label |
| APPSHEET_VIEW_ARCHITECTURE.md | APPSHEET_VIEW_MASTER | View inventory |
| APPSHEET_VIEW_MAP_MASTER.md | APPSHEET_VIEW_MASTER | View list |
| APPSHEET_DETAIL_VIEWS.md | APPSHEET_VIEW_MASTER | Detail specs |
| APPSHEET_FORM_VIEWS.md | APPSHEET_VIEW_MASTER | Form specs |
| APPSHEET_INLINE_VIEWS.md | APPSHEET_VIEW_MASTER | Inline specs |
| APPSHEET_ACTION_MAP_MASTER.md | APPSHEET_ACTION_MASTER | Action catalog |
| APPSHEET_SLICE_SPEC.md | APPSHEET_SLICE_SECURITY_MASTER | Slices |
| APPSHEET_SECURITY_FILTERS.md | APPSHEET_SLICE_SECURITY_MASTER | Security filters |
| APPSHEET_ATTACHMENT_SYSTEM.md | APPSHEET_ATTACHMENT_SYSTEM_MASTER | Attachment architecture |
| APPSHEET_ATTACHMENT_POLICY.md | APPSHEET_ATTACHMENT_SYSTEM_MASTER | Attachment field policy |
| APPSHEET_ATTACHMENT_VIEWS.md | APPSHEET_ATTACHMENT_SYSTEM_MASTER | Attachment inline |
| APPSHEET_ATTACHMENT_FORMS.md | APPSHEET_ATTACHMENT_SYSTEM_MASTER | Attachment forms |
| APPSHEET_INLINE_ATTACHMENT_UX.md | APPSHEET_ATTACHMENT_SYSTEM_MASTER | Inline attachment UX |
| ATTACHMENT_SYSTEM_DELIVERABLES.md | APPSHEET_ATTACHMENT_SYSTEM_MASTER | Implementation summary |
| APPSHEET_ADMIN_PANEL.md | APPSHEET_ADMIN_PANEL_MASTER | Admin config |
| APPSHEET_ADMIN_SECURITY.md | APPSHEET_ADMIN_PANEL_MASTER | Admin security |
| ADMIN_PANEL_DATA_MODEL.md | APPSHEET_ADMIN_PANEL_MASTER | Admin data model |
| ADMIN_PANEL_SERVICE_REFERENCE.md | APPSHEET_ADMIN_PANEL_MASTER | Admin GAS ref |
| ADMIN_OPERATING_CHECKLIST.md | APPSHEET_ADMIN_PANEL_MASTER | Admin ops checklist |
| APPSHEET_UX_MASTER.md | APPSHEET_MASTER_REFERENCE | UX principles |

---

## Kept (Source Data)

| File | Reason |
|------|--------|
| APPSHEET_FIELD_POLICY_MAP.csv | Authoritative field policy data |
| APPSHEET_FIELD_POLICY_MAP.json | Machine consumption |
| APPSHEET_VIEW_MAP.csv | View mapping data |
| APPSHEET_BUILD_MAPPING_MASTER.csv | Build mapping data |

---

## Archived (Superseded)

All absorbed files are superseded by their target masters. Original files remain in 04_APPSHEET/ root for historical reference until explicitly moved to 99_ARCHIVE or removed.

**Recommendation:** After validation period, move absorbed .md files to 99_ARCHIVE/legacy/ or delete. CSV/JSON stay in place.

---

## Intentionally Dropped

- Redundant overlap (e.g. duplicate enum binding in multiple files)
- Contradictory guidance (resolved in favor of current locked system)
- Future/optional fields (TASK_GROUP_CODE, etc.) marked as such, not removed
