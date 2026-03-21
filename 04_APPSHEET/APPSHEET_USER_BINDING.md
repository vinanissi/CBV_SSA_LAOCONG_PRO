# AppSheet User Binding

## Source
- Table: USER_DIRECTORY
- Filter: STATUS = "ACTIVE", IS_DELETED = FALSE

## Convention
- **ID** = stable row key (UD_YYYYMMDD_xxxxx) — **store this** in Ref fields
- **USER_CODE** = USER_001 (machine-safe)
- **FULL_NAME** = human display name
- **DISPLAY_NAME** = optional UI override
- **EMAIL** = email (for USEREMAIL mapping)
- **ROLE** = ADMIN | OPERATOR | VIEWER

---

## Field Bindings

### TASK_MAIN.OWNER_ID
- **Type:** Ref → USER_DIRECTORY
- **Store:** USER_DIRECTORY.ID
- **Display:** DISPLAY_NAME or FULL_NAME
- **List filter:**
```
AND([STATUS] = "ACTIVE", [IS_DELETED] = FALSE)
```
- **Valid_If:**
```
IN([OWNER_ID], SELECT(USER_DIRECTORY[ID], AND([STATUS] = "ACTIVE", [IS_DELETED] = FALSE)))
```
- **Editable:** Yes (dropdown)
- **Allow other values:** No

### TASK_MAIN.REPORTER_ID
- **Type:** Ref → USER_DIRECTORY
- **Store:** USER_DIRECTORY.ID
- **Display:** DISPLAY_NAME or FULL_NAME
- **Default (optional):** Map current user email to user ID
  - AppSheet: `LOOKUP(USER_DIRECTORY[ID], AND([STATUS] = "ACTIVE", LOWER([EMAIL]) = LOWER(USEREMAIL())), "")`
  - Or leave empty and let GAS default via `mapCurrentUserEmailToInternalId()`
- **Valid_If:** Same as OWNER_ID
- **Editable:** Yes (dropdown)

### HO_SO_MASTER.OWNER_ID
- Same as TASK_MAIN.OWNER_ID

### TASK_CHECKLIST.DONE_BY
- **Type:** Ref → USER_DIRECTORY
- **Store:** USER_DIRECTORY.ID
- **Display:** DISPLAY_NAME or FULL_NAME
- **Filter:** STATUS = "ACTIVE"
- **Editable:** Auto-filled by GAS when marking done

### FINANCE_TRANSACTION.CONFIRMED_BY
- **Type:** Ref → USER_DIRECTORY
- **Store:** USER_DIRECTORY.ID
- **Display:** DISPLAY_NAME or FULL_NAME
- **Filter:** STATUS = "ACTIVE"

---

## USEREMAIL() Mapping

To default REPORTER_ID from current signed-in user:

```
LOOKUP(USER_DIRECTORY[ID], AND([STATUS] = "ACTIVE", LOWER([EMAIL]) = LOWER(USEREMAIL())), "")
```

**Alternative** (if LOOKUP filter form unsupported):
```
FIRST(SELECT(USER_DIRECTORY[ID], AND([STATUS] = "ACTIVE", [EMAIL] = USEREMAIL())))
```

- **EMAIL** = login identity
- If no match, returns empty; user can select manually

---

## Slice/Security Filter Migration

**Before migration** (OWNER_ID stores email): `[OWNER_ID] = USEREMAIL()`

**After migration** (OWNER_ID stores USER_DIRECTORY.ID):
```
[OWNER_ID] = FIRST(SELECT(USER_DIRECTORY[ID], AND([STATUS] = "ACTIVE", LOWER([EMAIL]) = LOWER(USEREMAIL())))
```

Update APPSHEET_SECURITY_FILTERS, APPSHEET_SLICE_SPEC, and any "Is current owner" conditions when migrating.

---

## Selecting Active Users Only

```
SELECT(USER_DIRECTORY[ID], AND([STATUS] = "ACTIVE", [IS_DELETED] = FALSE))
```

Use this for dropdowns. Inactive users do not appear.

---

## Admin-Only Visibility

- USER_DIRECTORY admin: restrict to ADMIN role via AppSheet slice/security
- See APPSHEET_ADMIN_SECURITY.md and APPSHEET_SLICE_SPEC.md

---

## Rules
- Do NOT allow free-text person entry
- Do NOT store email as primary key in OWNER_ID/REPORTER_ID
- Store USER_DIRECTORY.ID (stable machine key)
- Display DISPLAY_NAME or FULL_NAME
- Backend (GAS) validation via `assertValidUserId()` is the real guard
