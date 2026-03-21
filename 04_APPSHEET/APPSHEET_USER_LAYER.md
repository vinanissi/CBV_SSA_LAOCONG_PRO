# AppSheet User Layer

**Purpose:** Define the AppSheet-facing user layer for USER_DIRECTORY. Ensures user dropdowns and refs work correctly without accidental creation of unrelated records.

---

## 1. Source of Truth

| Item | Value |
|------|-------|
| **Table** | USER_DIRECTORY |
| **NOT** | HO_SO_MASTER, MASTER_CODE (MASTER_GROUP=USER) |
| **Primary key** | ID (UD_YYYYMMDD_xxxxx) |
| **Stored in refs** | USER_DIRECTORY.ID only |

---

## 2. ACTIVE_USERS Slice

| Property | Value |
|----------|-------|
| **Slice name** | ACTIVE_USERS |
| **Source table** | USER_DIRECTORY |
| **Filter** | `AND([STATUS] = "ACTIVE", [IS_DELETED] = FALSE)` |
| **Purpose** | Dropdowns for OWNER_ID, REPORTER_ID, DONE_BY, CONFIRMED_BY, HO_SO_MASTER.OWNER_ID |

**Important:** ACTIVE_USERS must reference USER_DIRECTORY. Do **not** point ACTIVE_USERS at MASTER_CODE or HO_SO_MASTER.

---

## 3. Label / Display Strategy

| Strategy | Implementation |
|---------|----------------|
| **Preferred** | Virtual column `USER_DISPLAY` = `IF(ISNOTBLANK([DISPLAY_NAME]), [DISPLAY_NAME], [FULL_NAME])` |
| **Alternative** | Use `FULL_NAME` as display column (simpler; DISPLAY_NAME override not shown) |
| **Never** | Use FULL_NAME as **stored** value; store ID only |
| **Never** | Use HO_SO_MASTER.NAME for people selection |

**AppSheet Ref configuration:**
- **Value column:** ID
- **Display column:** USER_DISPLAY (virtual) or FULL_NAME
- **Sort column (optional):** FULL_NAME or USER_CODE

---

## 4. User-Related Fields Summary

| Table | Field | Ref Target | Editable | Allow Adds | Notes |
|-------|-------|------------|----------|------------|-------|
| TASK_MAIN | OWNER_ID | ACTIVE_USERS | Yes | **No** | Assignee; required |
| TASK_MAIN | REPORTER_ID | ACTIVE_USERS | Yes | **No** | Optional; default from current user |
| TASK_CHECKLIST | DONE_BY | ACTIVE_USERS | No (GAS) | **No** | GAS-set on checklist done |
| TASK_UPDATE_LOG | ACTOR_ID | — | No (GAS) | N/A | Text; no Ref; display via virtual |
| FINANCE_TRANSACTION | CONFIRMED_BY | ACTIVE_USERS | No (GAS) | **No** | GAS-set on confirm |
| FINANCE_LOG | ACTOR_ID | — | No | N/A | Text; display via virtual |
| ADMIN_AUDIT_LOG | ACTOR_ID | — | No | N/A | Text; display via virtual |
| HO_SO_MASTER | OWNER_ID | ACTIVE_USERS | Yes | **No** | Optional |

**Schema note:** TASK_MAIN has **OWNER_ID** as assignee. There is no ASSIGNEE_ID column; OWNER_ID = assignee.

---

## 5. Allow-Adds Policy

| Context | Allow Adds | Rationale |
|---------|------------|-----------|
| TASK_MAIN.OWNER_ID | **OFF** | Users must not create USER_DIRECTORY rows from task form |
| TASK_MAIN.REPORTER_ID | **OFF** | Same |
| HO_SO_MASTER.OWNER_ID | **OFF** | Same |
| TASK_CHECKLIST.DONE_BY | **OFF** | GAS-set; readonly |
| FINANCE_TRANSACTION.CONFIRMED_BY | **OFF** | GAS-set; readonly |
| USER_DIRECTORY admin view | **ON** (admin only) | Only ADMIN role can add users; separate app/view |

---

## 6. Valid-If Strategy (Optional Guard)

For ref columns that accept user selection, Valid_If can enforce that only ACTIVE users from USER_DIRECTORY are stored:

```
IN([OWNER_ID], SELECT(USER_DIRECTORY[ID], AND([STATUS] = "ACTIVE", [IS_DELETED] = FALSE)))
```

Apply to OWNER_ID, REPORTER_ID, HO_SO_MASTER.OWNER_ID when using Ref → ACTIVE_USERS. The slice filter already restricts options; Valid_If adds an extra guard against invalid values.

---

## 7. TASK_UPDATE_LOG.ACTOR_ID

ACTOR_ID is **not** a Ref column:
- GAS writes USER_DIRECTORY.ID or email (fallback)
- Mixed ID/email values; AppSheet Ref would fail validation
- **Display:** Virtual column or formula that shows user-friendly text
  - Option: `LOOKUP("USER_DIRECTORY", "ID", [ACTOR_ID], "USER_DISPLAY")` — fails when ACTOR_ID is email; then show `[ACTOR_ID]` as fallback
  - Or: use a formula that tries LOOKUP and falls back: `IF(LOOKUP(...) <> "", LOOKUP(...), [ACTOR_ID])` (AppSheet formula syntax may vary)

---

## 8. Default for REPORTER_ID (Current User)

To default REPORTER_ID from signed-in user:

```
LOOKUP(USER_DIRECTORY[ID], AND([STATUS] = "ACTIVE", LOWER([EMAIL]) = LOWER(USEREMAIL())), "")
```

Or:

```
FIRST(SELECT(USER_DIRECTORY[ID], AND([STATUS] = "ACTIVE", LOWER([EMAIL]) = LOWER(USEREMAIL()))))
```

Leave empty if GAS will set via `mapCurrentUserEmailToInternalId()`.

---

## 9. References

- 03_SHARED/USER_SYSTEM_STANDARD.md
- 03_SHARED/USER_TASK_FINANCE_MAPPING.md
- 04_APPSHEET/APPSHEET_USER_BINDING.md
- 04_APPSHEET/APPSHEET_USER_REF_RULES.md
- 04_APPSHEET/APPSHEET_USER_SECURITY_NOTES.md
