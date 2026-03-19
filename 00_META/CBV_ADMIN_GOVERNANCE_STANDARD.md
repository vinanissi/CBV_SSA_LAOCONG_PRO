# CBV Admin Governance Standard

## Design Source

- 00_META/CBV_GOVERNANCE_HIERARCHY.md
- 00_META/CBV_SERVICE_CONTRACT_STANDARD.md
- 04_APPSHEET/ADMIN_PANEL_DATA_MODEL.md
- 04_APPSHEET/APPSHEET_ADMIN_SECURITY.md

---

## 1. Who Can Edit ENUM_DICTIONARY

| Operation | Authorized Role | Enforcement |
|-----------|----------------|-------------|
| Create enum row | ADMIN only | assertAdminAuthority() + AppSheet app access |
| Update enum row (DISPLAY_TEXT, SORT_ORDER, NOTE) | ADMIN only | assertAdminAuthority() + AppSheet app access |
| Activate/Inactivate enum (IS_ACTIVE) | ADMIN only | assertAdminAuthority() + AppSheet app access |

**Rule:** Only users in CBV_CONFIG.ADMIN_EMAILS may call admin enum functions. AppSheet Admin Panel must be a separate app shared only with those emails.

---

## 2. Who Can Edit MASTER_CODE

| Operation | Authorized Role | Enforcement |
|-----------|----------------|-------------|
| Create master code row | ADMIN only | assertAdminAuthority() + AppSheet app access |
| Update master code row (NAME, DISPLAY_TEXT, SHORT_NAME, NOTE, SORT_ORDER) | ADMIN only; row must have ALLOW_EDIT=TRUE, IS_SYSTEM=FALSE | assertAdminAuthority() + service guards |
| Activate/Inactivate/Archive (STATUS) | ADMIN only; row must have ALLOW_EDIT=TRUE, IS_SYSTEM=FALSE | assertAdminAuthority() + service guards |

**Rule:** Same as ENUM_DICTIONARY. IS_SYSTEM and ALLOW_EDIT are enforced by GAS regardless of caller; authority check is additional.

---

## 3. Who Can Activate/Inactivate Values

| Entity | Field | Authorized | Notes |
|--------|-------|------------|-------|
| ENUM_DICTIONARY | IS_ACTIVE | ADMIN only | No delegation |
| MASTER_CODE | STATUS | ADMIN only; !IS_SYSTEM, ALLOW_EDIT | Service rejects protected rows |

**Rule:** No OPERATOR or VIEWER may change active/inactive status of enums or master codes.

---

## 4. Who Can Edit DISPLAY_TEXT

| Entity | Authorized | Notes |
|--------|------------|-------|
| ENUM_DICTIONARY.DISPLAY_TEXT | ADMIN only | Via adminUpdateEnumRow |
| MASTER_CODE.DISPLAY_TEXT | ADMIN only; ALLOW_EDIT=TRUE, !IS_SYSTEM | Via adminUpdateMasterCodeRow |

**Rule:** DISPLAY_TEXT is runtime display; changes affect UI immediately. Restricted to ADMIN.

---

## 5. Who Can Assign Roles (If Role Source Supports)

| Source | Status | Who Can Assign |
|--------|--------|----------------|
| AppSheet Account list | Present | AppSheet app owner / account manager only. No GAS control. |
| USER_ROLE sheet | Not present | N/A |
| ENUM_DICTIONARY (ROLE values) | Present | ADMIN can edit DISPLAY_TEXT of ROLE enum rows. Assignment of users to roles is AppSheet-side only. |

**Rule:** Role assignment = who has ADMIN/OPERATOR/VIEWER. That is configured in AppSheet Accounts. GAS has no role-assignment API. Do not create fake USER_ROLE automation.

---

## 6. Actions That Must Always Be Audited

| Action | AUDIT_TYPE | ENTITY_TYPE | ACTION |
|--------|------------|-------------|--------|
| adminCreateEnumRow | ENUM_EDIT | ENUM_DICTIONARY | CREATE |
| adminUpdateEnumRow | ENUM_EDIT | ENUM_DICTIONARY | UPDATE |
| adminSetEnumActive | ENUM_EDIT | ENUM_DICTIONARY | ACTIVATE / INACTIVATE |
| adminCreateMasterCodeRow | MASTER_CODE_EDIT | MASTER_CODE | CREATE |
| adminUpdateMasterCodeRow | MASTER_CODE_EDIT | MASTER_CODE | UPDATE |
| adminSetMasterCodeStatus | MASTER_CODE_EDIT | MASTER_CODE | ACTIVATE / INACTIVATE |

**Rule:** Every admin mutating operation writes to ADMIN_AUDIT_LOG before returning. No exceptions.

---

## 7. Records Protected From Casual Edits

| Protection | Scope | Behavior |
|------------|-------|----------|
| MASTER_CODE.IS_SYSTEM = TRUE | Row | No edit, no status change. Read-only. |
| MASTER_CODE.ALLOW_EDIT = FALSE | Row | No edit, no status change. Read-only. |
| ENUM_DICTIONARY / MASTER_CODE identity | ENUM_GROUP, ENUM_VALUE / MASTER_GROUP, CODE | Non-editable after create. |
| ADMIN_AUDIT_LOG | All rows | Append-only. No edit, no delete. |
| ID, CREATED_*, UPDATED_* | All admin tables | Non-editable. |

---

## 8. Admin Authority Check

### Source Limitation

GAS cannot read AppSheet Account list or roles. The only reliable authority source in GAS is an explicit whitelist.

### Implementation

| Component | Location | Purpose |
|-----------|----------|---------|
| CBV_CONFIG.ADMIN_EMAILS | 00_CORE_CONFIG.gs | Array of email strings. Required for admin ops. |
| assertAdminAuthority() | 00_CORE_UTILS.gs | Throws if cbvUser() not in ADMIN_EMAILS or if ADMIN_EMAILS empty. |
| isAdminUser() | 00_CORE_UTILS.gs | Returns true if cbvUser() in ADMIN_EMAILS. |

### Behavior

- When cbvUser() is 'system' or blank: assertAdminAuthority() throws. Message: "Admin operations require a signed-in user. System/trigger context not allowed."
- When ADMIN_EMAILS is undefined or empty: assertAdminAuthority() throws. Message: "Admin operations require CBV_CONFIG.ADMIN_EMAILS. Add admin email(s) to 00_CORE_CONFIG.gs."
- When ADMIN_EMAILS has values: assertAdminAuthority() throws if cbvUser() is not in the list. Message: "Not authorized for admin operations."
- seedEnumDictionary and bootstrap init do NOT call assertAdminAuthority (setup context).

---

## 9. Limitations and Manual Controls

| Limitation | Mitigation |
|------------|------------|
| Role not readable in GAS | Use ADMIN_EMAILS whitelist. Manually keep in sync with AppSheet Accounts. |
| No USER_ROLE sheet | Role assignment remains in AppSheet. Document who manages it. |
| ADMIN_EMAILS in code | Update requires deploy. Prefer small, stable admin set. |
| Audit log append-only | No automated purge. Plan retention policy (manual export/archive if needed). |
| GAS runs as executing user | If Admin Panel is web app, restrict sharing. |

---

## 10. Operating Recommendations

1. **Configure ADMIN_EMAILS** before first admin panel use. Add at least one admin email.
2. **Use separate Admin Panel app.** Share only with ADMIN_EMAILS. Do not mix with operational app.
3. **Review ADMIN_AUDIT_LOG periodically.** Spot anomalies (wrong actor, unexpected changes).
4. **Keep ADMIN_EMAILS minimal.** Add only trusted admins.
5. **Do not inline-edit** ENUM_DICTIONARY or MASTER_CODE in sheets. Use Admin Panel → GAS actions.
6. **Document role assignment owner.** Who adds/removes users in AppSheet Accounts.
7. **Before deactivating enum/master code:** Check no active references. GAS does not cascade.
