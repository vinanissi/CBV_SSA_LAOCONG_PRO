# AppSheet Slice Map — CBV_SSA_LAOCONG_PRO

Reusable slices for Ref targets, filters, and UI consistency. Prefer slice reuse over repeated SELECT.

---

## REQUIRED SLICES

### A. ACTIVE_USERS

| Property | Value |
|----------|-------|
| Slice name | ACTIVE_USERS |
| Source table | USER_DIRECTORY |
| Row filter | `AND([STATUS] = "ACTIVE", [IS_DELETED] = FALSE)` |
| Purpose | User dropdowns; OWNER_ID, REPORTER_ID, DONE_BY, CONFIRMED_BY |
| Columns used | ID, FULL_NAME, DISPLAY_NAME, EMAIL |
| Referenced by | TASK_MAIN.OWNER_ID, TASK_MAIN.REPORTER_ID, HO_SO_MASTER.OWNER_ID, TASK_CHECKLIST.DONE_BY, FINANCE_TRANSACTION.CONFIRMED_BY |

---

### B. ACTIVE_MASTER_CODES

| Property | Value |
|----------|-------|
| Slice name | ACTIVE_MASTER_CODES |
| Source table | MASTER_CODE |
| Row filter | `AND([STATUS] = "ACTIVE", [IS_DELETED] = FALSE)` |
| Purpose | Generic active master codes; UNIT_ID, future MASTER_GROUP refs |
| Columns used | ID, CODE, DISPLAY_TEXT, NAME, MASTER_GROUP |
| Referenced by | FINANCE_TRANSACTION.UNIT_ID (when MASTER_GROUP=UNIT exists) |

---

### C. ACTIVE_HTX

| Property | Value |
|----------|-------|
| Slice name | ACTIVE_HTX |
| Source table | HO_SO_MASTER |
| Row filter | `AND([HO_SO_TYPE] = "HTX", [IS_DELETED] = FALSE)` |
| Purpose | HTX dropdown for HO_SO_MASTER.HTX_ID |
| Columns used | ID, NAME, CODE |
| Referenced by | HO_SO_MASTER.HTX_ID |

---

### D. HO_SO_ACTIVE

| Property | Value |
|----------|-------|
| Slice name | HO_SO_ACTIVE |
| Source table | HO_SO_MASTER |
| Row filter | `[IS_DELETED] = FALSE` |
| Purpose | Browse; RELATED_ENTITY_ID when type=HO_SO |
| Columns used | All |
| Referenced by | HO_SO_LIST, inline parents |

---

### E. TASK_OPEN

| Property | Value |
|----------|-------|
| Slice name | TASK_OPEN |
| Source table | TASK_MAIN |
| Row filter | `IN([STATUS], LIST("NEW", "ASSIGNED", "IN_PROGRESS", "WAITING"))` |
| Purpose | Open tasks; TASK_INBOX base |
| Columns used | All |
| Referenced by | TASK_LIST, TASK_INBOX |

---

### F. TASK_DONE

| Property | Value |
|----------|-------|
| Slice name | TASK_DONE |
| Source table | TASK_MAIN |
| Row filter | `[STATUS] = "DONE"` |
| Purpose | Completed tasks |
| Columns used | All |
| Referenced by | TASK_DONE_VIEW |

---

### G. TASK_MY_OPEN (Security/Filter)

| Property | Value |
|----------|-------|
| Slice name | TASK_MY_OPEN |
| Source table | TASK_MAIN |
| Row filter | `AND(OR(USERROLE()="ADMIN", [OWNER_ID]=ANY(SELECT(USER_DIRECTORY[ID], AND([STATUS]="ACTIVE", LOWER([EMAIL])=LOWER(USEREMAIL())))), [REPORTER_ID]=ANY(SELECT(USER_DIRECTORY[ID], AND([STATUS]="ACTIVE", LOWER([EMAIL])=LOWER(USEREMAIL())))), CONTAINS([SHARED_WITH], ANY(SELECT(USER_DIRECTORY[ID], AND([STATUS]="ACTIVE", LOWER([EMAIL])=LOWER(USEREMAIL())))))), IN([STATUS], LIST("NEW","ASSIGNED","IN_PROGRESS","WAITING")))` |
| Purpose | Task của tôi đang mở (owner + reporter + shared) |
| Columns used | All |
| Referenced by | TASK_INBOX |

**Note:** Security Filter trên TASK_MAIN đã xử lý IS_PRIVATE — slice không cần lặp lại.

**Before migration** (OWNER_ID=email): `AND(IN([STATUS], LIST("NEW", "ASSIGNED", "IN_PROGRESS", "WAITING")), [OWNER_ID] = USEREMAIL())`

---

### H. TASK_MY_TASKS

| Property | Value |
|----------|-------|
| Slice name | TASK_MY_TASKS |
| Source table | TASK_MAIN |
| Row filter | `OR([OWNER_ID]=ANY(SELECT(USER_DIRECTORY[ID], AND([STATUS]="ACTIVE", LOWER([EMAIL])=LOWER(USEREMAIL())))), [REPORTER_ID]=ANY(SELECT(USER_DIRECTORY[ID], AND([STATUS]="ACTIVE", LOWER([EMAIL])=LOWER(USEREMAIL())))), CONTAINS([SHARED_WITH], ANY(SELECT(USER_DIRECTORY[ID], AND([STATUS]="ACTIVE", LOWER([EMAIL])=LOWER(USEREMAIL()))))))` |
| Purpose | Tất cả task liên quan đến tôi (mọi status) |
| Referenced by | Personal view tùy chọn |

---

### I. FIN_DRAFT

| Property | Value |
|----------|-------|
| Slice name | FIN_DRAFT |
| Source table | FINANCE_TRANSACTION |
| Row filter | `[STATUS] = "NEW"` |
| Purpose | Pending confirmation |
| Columns used | All |
| Referenced by | FIN_CONFIRM_QUEUE |

---

### J. FIN_CONFIRMED

| Property | Value |
|----------|-------|
| Slice name | FIN_CONFIRMED |
| Source table | FINANCE_TRANSACTION |
| Row filter | `[STATUS] = "CONFIRMED"` |
| Purpose | Confirmed transactions |
| Columns used | All |
| Referenced by | FINANCE_CONFIRMED_VIEW |

---

## SLICE CREATION ORDER

1. ACTIVE_USERS (MASTER_CODE)
2. ACTIVE_MASTER_CODES (MASTER_CODE)
3. ACTIVE_HTX (HO_SO_MASTER)
4. HO_SO_ACTIVE (HO_SO_MASTER)
5. TASK_OPEN, TASK_DONE, TASK_MY_OPEN, TASK_MY_TASKS (TASK_MAIN)
6. FIN_DRAFT, FIN_CONFIRMED (FINANCE_TRANSACTION)

---

## APP SHEET CONFIGURATION

**Data → Slices → Add slice**

- Name: exact slice name above
- Table: source table
- Row filter: exact formula above
