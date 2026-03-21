# AppSheet User Reference Binding

**Purpose:** How USER_DIRECTORY is bound in AppSheet for user ref columns. Use ID as stored value; display DISPLAY_NAME or FULL_NAME.

---

## Slice Definitions

| Slice Name | Table | Filter | Purpose |
|------------|-------|--------|---------|
| ACTIVE_USERS | USER_DIRECTORY | STATUS=ACTIVE, IS_DELETED=FALSE | Dropdowns, refs |

---

## Ref Column Bindings

| Table | Column | Ref Slice | Display Column | Store | Notes |
|-------|--------|-----------|----------------|-------|-------|
| TASK_MAIN | OWNER_ID | ACTIVE_USERS | DISPLAY_NAME or FULL_NAME | ID | Assignee; required |
| TASK_MAIN | REPORTER_ID | ACTIVE_USERS | DISPLAY_NAME or FULL_NAME | ID | Default from current user |
| TASK_CHECKLIST | DONE_BY | ACTIVE_USERS | DISPLAY_NAME or FULL_NAME | ID | GAS-set on checklist done |
| TASK_UPDATE_LOG | ACTOR_ID | — | — | ID or email | No AppSheet Ref; use virtual column + lookup if needed |
| FINANCE_TRANSACTION | CONFIRMED_BY | ACTIVE_USERS | DISPLAY_NAME or FULL_NAME | ID | GAS-set on confirm |
| FINANCE_LOG | ACTOR_ID | — | — | ID or email | No AppSheet Ref; display via virtual column |
| ADMIN_AUDIT_LOG | ACTOR_ID | — | — | ID or email | Same as above |
| HO_SO_MASTER | OWNER_ID | ACTIVE_USERS | DISPLAY_NAME or FULL_NAME | ID | Optional |

---

## ACTOR_ID in Log Tables

TASK_UPDATE_LOG, FINANCE_LOG, ADMIN_AUDIT_LOG store ACTOR_ID as text (USER_DIRECTORY.ID or email).

- Do **not** use AppSheet Ref for ACTOR_ID; mixed ID/email values would break ref validation
- Use virtual column or AppSheet formula: `LOOKUP("USER_DIRECTORY","ID",[ACTOR_ID],"DISPLAY_NAME")` — may fail if ACTOR_ID is email; fallback to ACTOR_ID itself for display
- Alternative: GAS-backed virtual that calls `getUserDisplay(ACTOR_ID)` if exposed

---

## Display Policy

- **Ref columns:** AppSheet Ref → Display column = DISPLAY_NAME (or FULL_NAME if DISPLAY_NAME empty)
- **ACTOR_ID (log tables):** Display via getUserDisplay or simple LOOKUP; fallback to raw ACTOR_ID when not found
