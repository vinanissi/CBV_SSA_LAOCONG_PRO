# AppSheet Admin Panel Security

## Design Source

- 00_META/CBV_APPSHEET_SECURITY_MODEL.md
- 04_APPSHEET/ADMIN_PANEL_DATA_MODEL.md
- 04_APPSHEET/APPSHEET_ADMIN_PANEL.md

---

## 1. Admin-Only Restrictions

### Principle

The Admin Panel is for **ADMIN** role only. OPERATOR and VIEWER must not see or access admin views.

### Implementation

| Method | Configuration |
|--------|---------------|
| **Separate App** | Create a dedicated Admin Panel app. Add only ADMIN accounts to the app. |
| **Or Slice-by-Role** | If same app: Add slice `ADMIN_PANEL_VISIBLE` with condition that restricts to ADMIN. Use AppSheet Account list: only users with role ADMIN get access. Filter admin views by `ADMIN_PANEL_VISIBLE`. |
| **Menu/Navigation** | Admin views (ENUM_*, MASTER_CODE_*, ADMIN_AUDIT_LOG_*) appear only when user has ADMIN role. Use Security Filter or Ref visibility. |

### Recommended

- **Phase 1:** Use a **separate AppSheet app** for the Admin Panel. Share only with ADMIN emails. Main operational app has no admin views.

---

## 2. Security Filters for Admin Tables

If admin tables exist in the same app:

| Table | ADMIN | OPERATOR | VIEWER |
|-------|-------|----------|--------|
| ENUM_DICTIONARY | `TRUE` | (no access) | (no access) |
| MASTER_CODE | `TRUE` | (no access) | (no access) |
| ADMIN_AUDIT_LOG | `TRUE` | (no access) | (no access) |

**Filter expression:** Use AppSheet Account list role. Only add ADMIN users to the admin slice. For tables: `IN(USERROLE(), "ADMIN")` or equivalent. If using separate app, no filter needed — only admins are in the app.

---

## 3. Audit Log Visibility Rules

| Rule | Implementation |
|------|-----------------|
| Read-only | ADMIN_AUDIT_LOG has no add, edit, or delete actions |
| Admin-only | Only users with ADMIN role see ADMIN_AUDIT_LOG views |
| No inline edit | All columns non-editable |
| Sort default | CREATED_AT descending |
| Sensitive data | BEFORE_JSON / AFTER_JSON may contain full record; restrict to ADMIN only |

---

## 4. Role Management Source

| Source | Status | Access |
|--------|--------|--------|
| ENUM_DICTIONARY (ENUM_GROUP=ROLE) | Present | ROLE_LIST, ROLE_DETAIL for display-text editing |
| AppSheet Account list | Present | Role assignment (ADMIN, OPERATOR, VIEWER) |
| USER_DIRECTORY | Not present | N/A |
| USER_ROLE sheet | Not present | N/A |

**Safe path:** ROLE values (ADMIN, OPERATOR, VIEWER) are managed as enum rows. Who has which role is configured in AppSheet Accounts, not in a sheet.

---

## 5. GAS Action Security

| Concern | Mitigation |
|---------|------------|
| Unauthorized caller | GAS runs in context of executing user. AppSheet only invokes for users in the app. If app is admin-only, only admins can trigger. |
| Web app exposure | If Admin Panel is a web app, restrict to specific domain or require sign-in. |
| Service account | Do not expose GAS endpoints publicly; use from AppSheet only. |

---

## 6. Field-Level Protection Summary

| Field Type | Protection |
|------------|------------|
| ID | Non-editable in all admin tables |
| CREATED_AT, CREATED_BY | Non-editable |
| UPDATED_AT, UPDATED_BY | Non-editable |
| IS_SYSTEM, ALLOW_EDIT | Non-editable; used for action visibility |
| ENUM_GROUP, ENUM_VALUE | Non-editable after create |
| MASTER_GROUP, CODE | Non-editable after create |
| ADMIN_AUDIT_LOG | All columns non-editable |

---

## 7. Checklist Before Go-Live

- [ ] CBV_CONFIG.ADMIN_EMAILS configured in 00_CORE_CONFIG.js (add at least one admin email)
- [ ] Admin Panel app shared only with ADMIN accounts
- [ ] ENUM_DICTIONARY, MASTER_CODE, ADMIN_AUDIT_LOG tables added
- [ ] No inline add/edit for ENUM and MASTER_CODE; all writes via GAS actions
- [ ] ADMIN_AUDIT_LOG views are read-only
- [ ] IS_SYSTEM rows have Edit/Status actions hidden
- [ ] ALLOW_EDIT=FALSE rows have Edit action hidden
- [ ] MASTER_CODE_LIST uses MC_ALL slice so IS_SYSTEM rows are visible (with Edit/Status hidden)
- [ ] "Allow other values" disabled for enum-bound fields
