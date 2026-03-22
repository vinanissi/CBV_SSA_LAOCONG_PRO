# AppSheet User Migration Notes

**Purpose:** AppSheet-specific steps and configuration changes for migrating from mixed people sources to USER_DIRECTORY.

**Related:** 09_AUDIT/USER_MIGRATION_PLAN.md, 04_APPSHEET/APPSHEET_USER_LAYER.md

---

## 1. Pre-Migration AppSheet State

| Item | Current (Before) | Target (After) |
|------|------------------|----------------|
| ACTIVE_USERS slice source | MASTER_CODE | **USER_DIRECTORY** |
| ACTIVE_USERS filter | `AND([MASTER_GROUP]="USER", [STATUS]="ACTIVE", [IS_DELETED]=FALSE)` | `AND([STATUS]="ACTIVE", [IS_DELETED]=FALSE)` |
| OWNER_ID Valid_If | `SELECT(MASTER_CODE[ID]...)` | `SELECT(USER_DIRECTORY[ID], AND([STATUS]="ACTIVE", [IS_DELETED]=FALSE))` |
| REPORTER_ID default | `FIRST(SELECT(MASTER_CODE[ID], [SHORT_NAME]=USEREMAIL()))` | `FIRST(SELECT(USER_DIRECTORY[ID], AND([STATUS]="ACTIVE", LOWER([EMAIL])=LOWER(USEREMAIL()))))` |
| Display column | DISPLAY_TEXT (MASTER_CODE) | USER_DISPLAY or FULL_NAME (USER_DIRECTORY) |
| Allow Adds on user refs | Possibly ON | **OFF** |

---

## 2. Migration Order (AppSheet Perspective)

**Do not change AppSheet config until data migration is complete.** If you switch ACTIVE_USERS to USER_DIRECTORY before migrating data:
- Existing OWNER_ID/REPORTER_ID values (email or MC_*) would appear as broken refs or blank
- Dropdown would show wrong options
- Users might see empty or invalid selections

**Correct order:**
1. Run data migration (03_USER_MIGRATION_HELPER.gs) so all values are USER_DIRECTORY.ID
2. Then update AppSheet slice and ref config

---

## 3. Config Files to Update

| File | Change |
|------|--------|
| APPSHEET_SLICE_SPEC.md | ACTIVE_USERS: Source = USER_DIRECTORY |
| APPSHEET_REF_MAP.csv | User refs: Valid_If, Initial, REF_TARGET |
| APPSHEET_FIELD_POLICY_MAP.json | slices.ACTIVE_USERS.source = USER_DIRECTORY |
| APPSHEET_FIELD_POLICY_MAP.csv | Valid_If formulas for OWNER_ID, REPORTER_ID, DONE_BY, CONFIRMED_BY, HO_SO_MASTER.OWNER_ID |
| TASK_VALIDATION_RULES.csv | OWNER_ID RefConstraint |
| TASK_FORM_VALIDATION_MAP.csv | REPORTER_ID default |
| APPSHEET_MANUAL_CONFIG_CHECKLIST.md | All ACTIVE_USERS references |
| APPSHEET_SLICE_MAP.md | TASK_MY_OPEN, filters |
| APPSHEET_VIEW_ARCHITECTURE.md | TASK_INBOX filter |
| APPSHEET_SECURITY_FILTERS.md | Row filters (after data stores ID) |

---

## 4. USER_DIRECTORY Virtual Column (Optional)

For consistent display across refs, add a virtual column to USER_DIRECTORY in AppSheet:

| Column name | Type | Formula |
|-------------|------|---------|
| USER_DISPLAY | Virtual | `IF(ISNOTBLANK([DISPLAY_NAME]), [DISPLAY_NAME], [FULL_NAME])` |

Use USER_DISPLAY as the Ref display column for all user refs.

---

## 5. Security Filter Migration

**Before (email stored):**
```
[OWNER_ID] = USEREMAIL()
```

**After (USER_DIRECTORY.ID stored):**
```
[OWNER_ID] = FIRST(SELECT(USER_DIRECTORY[ID], AND([STATUS]="ACTIVE", LOWER([EMAIL])=LOWER(USEREMAIL()))))
```

Update in:
- TASK_MAIN row filters (OPERATOR view)
- HO_SO_MASTER row filters
- Any slice that filters by "current user"

---

## 6. Allow Adds Checklist

Before go-live, verify **Allow Adds = OFF** on:

| Table | Column |
|-------|--------|
| TASK_MAIN | OWNER_ID |
| TASK_MAIN | REPORTER_ID |
| HO_SO_MASTER | OWNER_ID |
| TASK_CHECKLIST | DONE_BY |
| FINANCE_TRANSACTION | CONFIRMED_BY |

---

## 7. Testing After Migration

| Test | Expected |
|------|----------|
| Create task | OWNER_ID dropdown shows USER_DIRECTORY names |
| Assign task | Can select from ACTIVE users only |
| REPORTER_ID default | Current user auto-filled when in USER_DIRECTORY |
| TASK_MY_OPEN / TASK_INBOX | Shows only current user's tasks |
| Mark checklist done | DONE_BY set by GAS to current user ID |
| Confirm finance | CONFIRMED_BY set by GAS |
| No "New" on user dropdown | Allow Adds OFF; cannot create from form |

---

## 8. Rollback (If Needed)

If migration must be rolled back:
1. Restore sheet data from backup (OWNER_ID, REPORTER_ID, etc.)
2. Revert AppSheet config: ACTIVE_USERS → MASTER_CODE
3. Revert security filters to email-based
4. Do not run GAS that assumes USER_DIRECTORY.ID (assertActiveUserId will fail on email)

---

## 9. References

- 09_AUDIT/USER_MIGRATION_PLAN.md
- 04_APPSHEET/APPSHEET_USER_LAYER.md
- 04_APPSHEET/APPSHEET_USER_REF_RULES.md
- 04_APPSHEET/APPSHEET_USER_SECURITY_NOTES.md
- 05_GAS_RUNTIME/03_USER_MIGRATION_HELPER.gs
