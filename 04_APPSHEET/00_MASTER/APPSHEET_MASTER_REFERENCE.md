# AppSheet Master Reference — CBV_SSA_LAOCONG_PRO

**Top-level authoritative AppSheet reference.** Scope, architecture, deployment flow, boundaries with GAS.

---

## 1. Scope

| Component | Role |
|-----------|------|
| **Google Sheets** | Database; source of truth |
| **GAS** | Runtime; validation, workflow, audit |
| **AppSheet** | UI; forms, views, actions |
| **ENUM_DICTIONARY** | Runtime enum source (GAS seed) |
| **MASTER_CODE** | Dynamic code source |
| **AppSheet** | UI restriction only; GAS is backend truth |

---

## 2. Architecture Summary

### Table Families

| Family | Tables | Purpose |
|--------|--------|---------|
| HO_SO | HO_SO_MASTER, HO_SO_FILE, HO_SO_RELATION | Hồ sơ (records) |
| TASK | TASK_MAIN, TASK_CHECKLIST, TASK_UPDATE_LOG, TASK_ATTACHMENT | Tasks |
| FINANCE | FINANCE_TRANSACTION, FINANCE_ATTACHMENT, FINANCE_LOG | Finance |
| Admin | ENUM_DICTIONARY, MASTER_CODE, ADMIN_AUDIT_LOG | Admin panel (separate app) |

### Key Principles

- **Key = ID** for all tables
- **Label** per table: NAME (HO_SO), TITLE (TASK), TRANS_CODE (FINANCE)
- **Log tables** (TASK_UPDATE_LOG, FINANCE_LOG, ADMIN_AUDIT_LOG): read-only; GAS writes only
- **STATUS columns**: GAS action only; never inline editable
- **Workflow fields**: STATUS, PROGRESS_PERCENT, DONE_AT, IS_DONE, DONE_AT, DONE_BY — Editable=OFF, Editable_If=FALSE

---

## 3. Deployment Flow

1. **Bootstrap:** initAll(), protectSensitiveSheets()
2. **Add tables** in order (see APPSHEET_DEPLOY_CHECKLIST_MASTER)
3. **Set keys/labels** per APPSHEET_TABLE_CONFIG_MASTER
4. **Bind refs** per APPSHEET_REF_MAP (in TABLE_CONFIG)
5. **Bind enum/master-code** per APPSHEET_ENUM_MASTER_CODE_BINDING
6. **Configure views/actions/slices** per APPSHEET_VIEW_MASTER, APPSHEET_ACTION_MASTER, APPSHEET_SLICE_SECURITY_MASTER
7. **Verify** via verifyAppSheetReadiness()

---

## 4. Boundaries with GAS

| AppSheet | GAS |
|----------|-----|
| Valid_If, Editable_If | assertValidEnumValue, validateTaskTransition |
| UI restriction | Real enforcement |
| Actions call webhook | Webhook validates, writes, logs |
| Display mapping | getEnumDisplay(), getMasterCodeDisplay() |

**Rule:** AppSheet cannot enforce workflow. All status/progress changes MUST go through GAS.

---

## 5. Map to Other AppSheet Docs

| Doc | Purpose |
|-----|---------|
| **01_TABLES/APPSHEET_TABLE_CONFIG_MASTER** | Per-table key, label, refs, risks |
| **01_TABLES/APPSHEET_FIELD_POLICY_MASTER** | Per-field hidden/readonly/editable |
| **02_BINDING/APPSHEET_ENUM_MASTER_CODE_BINDING** | ENUM_DICTIONARY, MASTER_CODE, display |
| **02_BINDING/APPSHEET_EXPRESSION_MASTER** | Valid_If, Editable_If, filters |
| **03_VIEWS_ACTIONS/APPSHEET_VIEW_MASTER** | View design |
| **03_VIEWS_ACTIONS/APPSHEET_ACTION_MASTER** | Action catalog |
| **03_VIEWS_ACTIONS/APPSHEET_SLICE_SECURITY_MASTER** | Slices, security filters |
| **04_SUBSYSTEMS/APPSHEET_ATTACHMENT_SYSTEM_MASTER** | Attachment subsystem |
| **04_SUBSYSTEMS/APPSHEET_ADMIN_PANEL_MASTER** | Admin subsystem |
| **00_MASTER/APPSHEET_DEPLOY_CHECKLIST_MASTER** | Operator/build checklist |

---

## 6. UX Principles (from APPSHEET_UX_MASTER)

- Detail is operational center
- Form simple; default/suggest for difficult fields
- Checklist and log always visible in TASK detail
- Finance confirmation in separate queue
- HO_SO: inline file and relation
- Minimize clicks; avoid duplicate entry; prevent accidental edits

---

## 7. Critical Rules

- **TASK_UPDATE_LOG:** Operationally read-only. Editable_If=FALSE for all columns.
- **PROGRESS_PERCENT:** Controlled-readonly; checklist-derived; Editable_If=FALSE.
- **ADMIN_AUDIT_LOG:** Operationally read-only.
- **Actions:** Call GAS webhook — NOT "Update row" for workflow.
