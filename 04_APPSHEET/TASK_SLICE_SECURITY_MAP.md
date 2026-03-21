# TASK Slice Security Map — Behavior Lock

Users must only **see what they should see**, **do what they are allowed to do**.

---

## 1. Row-Level Control

### USER_ID() Convention

**After migration** (OWNER_ID stores MASTER_CODE.ID):
```
USER_ID() = FIRST(SELECT(MASTER_CODE[ID], AND([MASTER_GROUP] = "USER", [SHORT_NAME] = USEREMAIL())))
```

**Before migration** (OWNER_ID stores email):
```
USER_ID() = USEREMAIL()
```

**Note:** Schema uses OWNER_ID (assignee). ASSIGNEE_ID = OWNER_ID if schema differs.

**ISADMIN():** Use `USERROLE() = "ADMIN"` or AppSheet Account list role check. Configure in Security settings.

---

## 2. MY_TASKS Slice

**Purpose:** Tasks visible to current user (owner, assignee, or reporter).

**Row filter:**
```
OR(
  [OWNER_ID] = USER_ID(),
  [ASSIGNEE_ID] = USER_ID(),
  [REPORTER_ID] = USER_ID()
)
```

**Schema note:** If no ASSIGNEE_ID column, use:
```
OR(
  [OWNER_ID] = USER_ID(),
  [REPORTER_ID] = USER_ID()
)
```

---

## 3. Role-Based Slices

| Role     | TASK_MAIN Row Filter | Access |
|----------|----------------------|--------|
| ADMIN    | `TRUE`               | Full access; all tasks |
| OPERATOR | `OR([OWNER_ID] = USER_ID(), [REPORTER_ID] = USER_ID())` | Only own tasks (owner or reporter) |
| VIEWER   | Same as OPERATOR or `TRUE` | Read-only; no add/edit |

---

## 4. Slice Definitions

| Slice      | Table    | Condition |
|------------|----------|------------|
| TASK_ALL   | TASK_MAIN| (no filter; ADMIN) |
| TASK_MY_OPEN | TASK_MAIN | `AND(IN([STATUS], LIST("NEW","ASSIGNED","IN_PROGRESS","WAITING")), OR([OWNER_ID] = USER_ID(), [REPORTER_ID] = USER_ID()))` |
| TASK_OPEN  | TASK_MAIN| `IN([STATUS], LIST("NEW","ASSIGNED","IN_PROGRESS","WAITING"))` |
| TASK_DONE  | TASK_MAIN| `[STATUS] = "DONE"` |

---

## 5. View → Slice Mapping

| View       | Slice (ADMIN) | Slice (OPERATOR) | Slice (VIEWER) |
|------------|---------------|------------------|----------------|
| TASK_LIST  | TASK_OPEN     | TASK_MY_OPEN     | TASK_MY_OPEN   |
| TASK_INBOX | TASK_OPEN     | TASK_MY_OPEN     | TASK_MY_OPEN   |
| TASK_DETAIL| —             | Row from slice   | Row from slice |

---

## 6. Child Table Row Filter

TASK_CHECKLIST, TASK_ATTACHMENT, TASK_UPDATE_LOG inherit parent visibility:

- Filter: `[TASK_ID] = [TASK_MAIN].[ID]`
- Parent row must pass TASK_MAIN slice
- User cannot see child if parent not visible

---

## 7. Hidden Data Rules

User must **not** see:

- Other users' tasks (OPERATOR: only OWNER_ID or REPORTER_ID = self)
- System logs beyond scope (TASK_UPDATE_LOG: read-only; no sensitive fields exposed)
- ADMIN_AUDIT_LOG (separate app; ADMIN only)
