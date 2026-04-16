# Admin Operating Checklist

Single checklist for admin panel deployment and operations. See 00_META/CBV_ADMIN_GOVERNANCE_STANDARD.md for rules.

---

## Before First Use

- [ ] **ADMIN_EMAILS** configured in 00_CORE_CONFIG.js — add at least one admin email
- [ ] **initAll()** run — ADMIN_AUDIT_LOG sheet exists
- [ ] **Admin Panel app** created (separate from operational app)
- [ ] **Share** Admin Panel app only with ADMIN_EMAILS
- [ ] Tables added: ENUM_DICTIONARY, MASTER_CODE, ADMIN_AUDIT_LOG

---

## AppSheet Admin Panel Config

- [ ] No inline add/edit for ENUM_DICTIONARY or MASTER_CODE — all writes via GAS actions
- [ ] ADMIN_AUDIT_LOG views read-only (no add, edit, delete actions)
- [ ] IS_SYSTEM rows: Edit and Status actions hidden
- [ ] ALLOW_EDIT=FALSE rows: Edit and Status actions hidden
- [ ] MASTER_CODE_LIST uses MC_ALL slice (so IS_SYSTEM rows visible)
- [ ] "Allow other values" disabled for enum-bound fields

---

## Before Each Admin Session

- [ ] Signed in as user in ADMIN_EMAILS
- [ ] Using Admin Panel app (not operational app)

---

## After Admin Changes

- [ ] Review ADMIN_AUDIT_LOG for unexpected entries
- [ ] Verify changed enum/master code in operational app

---

## Ongoing

- [ ] Keep ADMIN_EMAILS minimal; add only trusted admins
- [ ] Do not inline-edit ENUM_DICTIONARY or MASTER_CODE in Google Sheets
- [ ] Document who manages role assignment (AppSheet Accounts)
- [ ] Plan retention for ADMIN_AUDIT_LOG (manual export/archive if needed)

---

## Callable Admin Functions (from AppSheet Actions)

| Function | Use |
|----------|-----|
| adminCreateEnumRow(data) | Create enum row |
| adminUpdateEnumRow(id, patch) | Update DISPLAY_TEXT, SORT_ORDER, NOTE |
| adminSetEnumActive(id, isActive) | Activate/inactivate enum |
| adminCreateMasterCodeRow(data) | Create master code row |
| adminUpdateMasterCodeRow(id, patch) | Update NAME, DISPLAY_TEXT, etc. |
| adminSetMasterCodeStatus(id, status) | Set STATUS (ACTIVE, INACTIVE, ARCHIVED) |
