# AppSheet User Security Notes

**Purpose:** Security and protection for USER_DIRECTORY and user-related refs in AppSheet.

---

## 1. USER_DIRECTORY Table Protection

### Sensitive Columns

| Column | Sensitivity | Recommendation |
|--------|-------------|-----------------|
| ID | System key | Read-only; never user-editable |
| USER_CODE | Business key | Admin-only edit |
| FULL_NAME | PII | Admin-only edit |
| DISPLAY_NAME | PII | Admin-only edit |
| EMAIL | PII, login identity | Admin-only edit |
| PHONE | PII | Admin-only edit |
| ROLE | Security-relevant | Admin-only edit |
| STATUS | Lifecycle | Admin-only edit |
| IS_SYSTEM | System flag | Read-only |
| ALLOW_LOGIN | Access control | Admin-only edit |
| HTX_ID | Org assignment | Admin-only edit |
| NOTE | Admin note | Admin-only edit |

### Visibility Recommendation

- **USER_DIRECTORY** as a table should appear only in an **Admin Panel** app or admin-only view.
- Operational app users (OPERATOR, VIEWER) should NOT have a direct USER_DIRECTORY list/form.
- User selection in task/finance forms uses **Ref → ACTIVE_USERS** slice; users see dropdown of names, not the raw USER_DIRECTORY table.

---

## 2. Allow Adds Policy (Critical)

| Context | Allow Adds | Risk if ON |
|---------|------------|------------|
| TASK_MAIN.OWNER_ID | **OFF** | User creates fake USER_DIRECTORY rows from task form |
| TASK_MAIN.REPORTER_ID | **OFF** | Same |
| HO_SO_MASTER.OWNER_ID | **OFF** | Same |
| TASK_CHECKLIST.DONE_BY | **OFF** | GAS-set; rarely exposed as dropdown |
| FINANCE_TRANSACTION.CONFIRMED_BY | **OFF** | Same |
| USER_DIRECTORY admin form | ON (admin only) | Intended; only admins add users |

**Rule:** Any Ref to ACTIVE_USERS used in task, finance, or HO_SO forms must have **Allow Adds = OFF**.

---

## 3. Source of User Dropdowns

| Correct | Incorrect |
|---------|-----------|
| ACTIVE_USERS slice of **USER_DIRECTORY** | ACTIVE_USERS slice of MASTER_CODE |
| ACTIVE_USERS slice of **USER_DIRECTORY** | Ref to HO_SO_MASTER for people |
| Store USER_DIRECTORY.ID | Store email, FULL_NAME, or HO_SO_MASTER.ID |

---

## 4. Security Filters After USER_DIRECTORY Migration

When OWNER_ID and REPORTER_ID store USER_DIRECTORY.ID (not email), row-level security must use ID comparison:

**Current (email-based):**
```
[OWNER_ID] = USEREMAIL()
```

**After migration (ID-based):**
```
[OWNER_ID] = FIRST(SELECT(USER_DIRECTORY[ID], AND([STATUS] = "ACTIVE", LOWER([EMAIL]) = LOWER(USEREMAIL()))))
```

**OPERATOR filter for TASK_MAIN:**
```
OR(
  [OWNER_ID] = FIRST(SELECT(USER_DIRECTORY[ID], AND([STATUS] = "ACTIVE", LOWER([EMAIL]) = LOWER(USEREMAIL())))),
  [REPORTER_ID] = FIRST(SELECT(USER_DIRECTORY[ID], AND([STATUS] = "ACTIVE", LOWER([EMAIL]) = LOWER(USEREMAIL()))))
)
```

**OPERATOR filter for HO_SO_MASTER:**
```
OR(
  ISBLANK([OWNER_ID]),
  [OWNER_ID] = FIRST(SELECT(USER_DIRECTORY[ID], AND([STATUS] = "ACTIVE", LOWER([EMAIL]) = LOWER(USEREMAIL()))))
)
```

Update APPSHEET_SECURITY_FILTERS.md when migrating.

---

## 5. Role and Account Management

| Item | Where | Who |
|------|-------|-----|
| ROLE enum values | ENUM_DICTIONARY (ROLE) | Admin |
| Who has ADMIN/OPERATOR/VIEWER | AppSheet Account list | App owner |
| USER_DIRECTORY rows | USER_DIRECTORY table | Admin (separate app or admin view) |

USER_DIRECTORY.ROLE can mirror AppSheet role for display and GAS logic. Role enforcement in AppSheet is via Account list, not sheet data.

---

## 6. ACTOR_ID in Logs

- ACTOR_ID stores USER_DIRECTORY.ID or email (fallback).
- Log tables are read-only.
- No Ref; no Allow Adds.
- Display formulas may LOOKUP USER_DIRECTORY; if ACTOR_ID is email (legacy or fallback), LOOKUP fails — show raw ACTOR_ID.

---

## 7. Final AppSheet Safety Statement

**When configured per APPSHEET_USER_LAYER.md and APPSHEET_USER_REF_RULES.md:**

1. **User dropdowns** reference USER_DIRECTORY via ACTIVE_USERS slice.
2. **Stored value** is always USER_DIRECTORY.ID (except ACTOR_ID, which may store email as fallback).
3. **Allow Adds = OFF** on all operational user ref dropdowns; no accidental user creation from task/finance/HO_SO forms.
4. **HO_SO_MASTER** is not used as user source; people selection comes from USER_DIRECTORY only.
5. **FULL_NAME** is used for display only; never as stored value in ref columns.
6. **USER_DIRECTORY** table itself is admin-only; operational users see only Ref dropdowns.

**AppSheet user layer is safe** when these conditions hold. Audit during deployment to confirm ACTIVE_USERS points to USER_DIRECTORY and Allow Adds is OFF on all user refs.
