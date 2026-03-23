# CBV Deployment Checklist

Use this checklist before and after running `runFullDeployment()`.

---

## Pre-Deployment

- [ ] **Spreadsheet access:** You have edit access to the CBV spreadsheet
- [ ] **Apps Script:** Script is linked (Extensions → Apps Script)
- [ ] **Config:** `CBV_CONFIG.ADMIN_EMAILS` has at least one admin email (for audit logging)

---

## Deployment Run

- [ ] **Run:** CBV_SSA → Full Deployment (One-Click)
- [ ] **Verdict:** PASS or WARNING (FAIL = fix and re-run)

---

## Post-Deployment Verification

### Schema

- [ ] All required sheets exist: USER_DIRECTORY, DON_VI, MASTER_CODE, ENUM_DICTIONARY, TASK_MAIN, TASK_CHECKLIST, TASK_ATTACHMENT, TASK_UPDATE_LOG, ADMIN_AUDIT_LOG
- [ ] No header mismatch errors in deployment report

### Seed

- [ ] DON_VI has at least one root row (PARENT_ID blank)
- [ ] ENUM_DICTIONARY has TASK_STATUS, TASK_PRIORITY, DON_VI_TYPE, USER_ROLE (or ROLE)
- [ ] MASTER_CODE has TASK_TYPE group with at least GENERAL
- [ ] USER_DIRECTORY: add users manually or via seed if configured

### Enum Synced

- [ ] No enum mismatch findings in report
- [ ] TASK_MAIN.STATUS values are valid (NEW, ASSIGNED, IN_PROGRESS, etc.)
- [ ] TASK_MAIN.PRIORITY values are valid (LOW, MEDIUM, HIGH, URGENT)

### Ref Safe

- [ ] TASK_MAIN.OWNER_ID resolves to USER_DIRECTORY (or empty)
- [ ] TASK_MAIN.DON_VI_ID resolves to DON_VI (or empty)
- [ ] TASK_MAIN.TASK_TYPE_ID resolves to MASTER_CODE (or empty)
- [ ] TASK_CHECKLIST.TASK_ID resolves to TASK_MAIN
- [ ] TASK_ATTACHMENT.TASK_ID resolves to TASK_MAIN

### Hierarchy Valid

- [ ] DON_VI: no self-parent (PARENT_ID ≠ ID)
- [ ] DON_VI: no circular references
- [ ] DON_VI: at least one root (PARENT_ID blank)
- [ ] DON_VI: no orphan nodes (PARENT_ID resolves or blank)

### Test Passed

- [ ] Schema integrity: OK
- [ ] Seed consistency: OK
- [ ] Enum consistency: OK
- [ ] Ref integrity: OK
- [ ] DON_VI hierarchy: OK
- [ ] Workflow rules: OK
- [ ] Field policy: OK (if applicable)
- [ ] AppSheet readiness: OK (if using AppSheet)

### AppSheet Ready (if applicable)

- [ ] All tables added to AppSheet app
- [ ] Ref columns bound to correct tables
- [ ] Enum slices configured
- [ ] Run `verifyAppSheetReadiness()` — no blockers

---

## ADMIN_AUDIT_LOG

- [ ] Deployment run appears in ADMIN_AUDIT_LOG (AUDIT_TYPE = DEPLOYMENT_RUN)
- [ ] ACTION = PASS / WARNING / FAIL
- [ ] AFTER_JSON contains full report (if needed for debugging)
