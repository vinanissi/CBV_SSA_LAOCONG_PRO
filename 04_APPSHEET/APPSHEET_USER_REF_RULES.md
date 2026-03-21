# AppSheet User Ref Rules

**Purpose:** Per-field configuration for USER_DIRECTORY refs. Use for manual AppSheet setup and validation.

---

## Schema Note: ASSIGNEE_ID vs OWNER_ID

- **TASK_MAIN.OWNER_ID** = assignee (person responsible for the task)
- **No ASSIGNEE_ID column** in schema — OWNER_ID serves that role
- If external docs mention ASSIGNEE_ID, treat as OWNER_ID

---

## Ref Fields (User Selection Dropdowns)

### TASK_MAIN.OWNER_ID

| Property | Value |
|----------|-------|
| Table | TASK_MAIN |
| Field | OWNER_ID |
| Ref target | ACTIVE_USERS (slice of USER_DIRECTORY) |
| Stored value | USER_DIRECTORY.ID |
| Label source | USER_DISPLAY (virtual) or FULL_NAME |
| Valid_If | `IN([OWNER_ID], SELECT(USER_DIRECTORY[ID], AND([STATUS] = "ACTIVE", [IS_DELETED] = FALSE)))` |
| Editable | Yes (dropdown) |
| Allow Adds | **OFF** |
| Allow other values | No |

**Editable risk note:** If Allow Adds were ON, users could create bogus USER_DIRECTORY rows from the task form. Must stay OFF.

---

### TASK_MAIN.REPORTER_ID

| Property | Value |
|----------|-------|
| Table | TASK_MAIN |
| Field | REPORTER_ID |
| Ref target | ACTIVE_USERS |
| Stored value | USER_DIRECTORY.ID |
| Label source | USER_DISPLAY (virtual) or FULL_NAME |
| Valid_If | Same as OWNER_ID |
| Initial value (optional) | `LOOKUP(USER_DIRECTORY[ID], AND([STATUS] = "ACTIVE", LOWER([EMAIL]) = LOWER(USEREMAIL())), "")` |
| Editable | Yes (dropdown) |
| Allow Adds | **OFF** |
| Allow other values | No |

**Editable risk note:** Same as OWNER_ID. Do not allow creation of users from task form.

---

### TASK_MAIN.ASSIGNEE_ID (N/A)

| Property | Value |
|----------|-------|
| Status | **No such column** |
| Note | Schema uses OWNER_ID as assignee. Use TASK_MAIN.OWNER_ID. |

---

### HO_SO_MASTER.OWNER_ID

| Property | Value |
|----------|-------|
| Table | HO_SO_MASTER |
| Field | OWNER_ID |
| Ref target | ACTIVE_USERS |
| Stored value | USER_DIRECTORY.ID |
| Label source | USER_DISPLAY (virtual) or FULL_NAME |
| Valid_If | Same as TASK_MAIN.OWNER_ID |
| Editable | Yes (dropdown) |
| Allow Adds | **OFF** |
| Allow other values | No |

**Editable risk note:** Creating users from HO_SO form would pollute USER_DIRECTORY. Keep OFF.

---

### TASK_CHECKLIST.DONE_BY

| Property | Value |
|----------|-------|
| Table | TASK_CHECKLIST |
| Field | DONE_BY |
| Ref target | ACTIVE_USERS |
| Stored value | USER_DIRECTORY.ID |
| Label source | USER_DISPLAY (virtual) or FULL_NAME |
| Valid_If | Same as OWNER_ID |
| Editable | No (GAS-set when marking checklist done) |
| Allow Adds | **OFF** |
| Allow other values | No |

**Editable risk note:** Read-only. GAS populates on checklist done. No dropdown edit; Allow Adds irrelevant but must be OFF if ever exposed.

---

### FINANCE_TRANSACTION.CONFIRMED_BY

| Property | Value |
|----------|-------|
| Table | FINANCE_TRANSACTION |
| Field | CONFIRMED_BY |
| Ref target | ACTIVE_USERS |
| Stored value | USER_DIRECTORY.ID |
| Label source | USER_DISPLAY (virtual) or FULL_NAME |
| Valid_If | Same as OWNER_ID |
| Editable | No (GAS-set on confirm) |
| Allow Adds | **OFF** |
| Allow other values | No |

**Editable risk note:** GAS populates on status CONFIRMED. Should not be user-editable.

---

## Non-Ref Fields (Log Actor — Display Only)

### TASK_UPDATE_LOG.ACTOR_ID

| Property | Value |
|----------|-------|
| Table | TASK_UPDATE_LOG |
| Field | ACTOR_ID |
| Ref target | **None** (do not use AppSheet Ref) |
| Stored value | USER_DIRECTORY.ID or email (fallback) |
| Display | Virtual column or formula; fallback to raw ACTOR_ID when LOOKUP fails |

**Config:** Column type = Text. Do NOT configure as Ref. GAS writes value. For display in grid/detail, use virtual:

```
IF(
  ISNOTBLANK(LOOKUP("USER_DIRECTORY", "ID", [ACTOR_ID], "USER_DISPLAY")),
  LOOKUP("USER_DIRECTORY", "ID", [ACTOR_ID], "USER_DISPLAY"),
  [ACTOR_ID]
)
```

(Adjust for actual AppSheet LOOKUP syntax.)

**Editable risk note:** Read-only. GAS sets on each log entry. No user edit.

---

### FINANCE_LOG.ACTOR_ID

| Property | Value |
|----------|-------|
| Table | FINANCE_LOG |
| Field | ACTOR_ID |
| Ref target | **None** |
| Display | Same pattern as TASK_UPDATE_LOG.ACTOR_ID |

---

### ADMIN_AUDIT_LOG.ACTOR_ID

| Property | Value |
|----------|-------|
| Table | ADMIN_AUDIT_LOG |
| Field | ACTOR_ID |
| Ref target | **None** |
| Display | Same pattern as above |

---

## Quick Reference Table

| Table | Field | Ref | Allow Adds | Editable |
|-------|-------|-----|------------|----------|
| TASK_MAIN | OWNER_ID | ACTIVE_USERS | **OFF** | Yes |
| TASK_MAIN | REPORTER_ID | ACTIVE_USERS | **OFF** | Yes |
| TASK_MAIN | ASSIGNEE_ID | N/A | — | — |
| HO_SO_MASTER | OWNER_ID | ACTIVE_USERS | **OFF** | Yes |
| TASK_CHECKLIST | DONE_BY | ACTIVE_USERS | **OFF** | No (GAS) |
| FINANCE_TRANSACTION | CONFIRMED_BY | ACTIVE_USERS | **OFF** | No (GAS) |
| TASK_UPDATE_LOG | ACTOR_ID | — (no Ref) | N/A | No |
| FINANCE_LOG | ACTOR_ID | — (no Ref) | N/A | No |
| ADMIN_AUDIT_LOG | ACTOR_ID | — (no Ref) | N/A | No |
