# AppSheet Task View Map

**Model:** Task belongs to HTX; users shared. Child tables inline in TASK_DETAIL.

---

## 1. View List

| View | Type | Slice/Table | Purpose |
|------|------|--------------|---------|
| TASK_LIST | Table | TASK_OPEN | List open tasks |
| TASK_DETAIL | Detail | TASK_MAIN | Single task with inline children |
| TASK_FORM | Form | TASK_MAIN | Create task |
| TASK_CHECKLIST_INLINE | Inline | TASK_CHECKLIST | Child of TASK_DETAIL |
| TASK_ATTACHMENT_INLINE | Inline | TASK_ATTACHMENT | Child of TASK_DETAIL |
| TASK_LOG_INLINE | Inline | TASK_UPDATE_LOG | Child of TASK_DETAIL (read-only) |

---

## 2. TASK_LIST

| Property | Value |
|----------|-------|
| Type | Table |
| Slice | TASK_OPEN |
| Condition | `IN([STATUS], LIST("NEW", "ASSIGNED", "IN_PROGRESS", "WAITING"))` |

### Visible Columns (4–6)

| Column | Show | Display |
|--------|------|---------|
| TITLE | Yes | |
| HTX_ID | Yes | NAME (ACTIVE_HTX) |
| OWNER_ID | Yes | DISPLAY_NAME or FULL_NAME |
| STATUS | Yes | |
| PRIORITY | Yes | |
| DUE_DATE | Yes | |
| OVERDUE_HINT | Yes | Virtual column; see `TASK_HINT_COLUMNS.md` — hiển thị **Quá hạn** khi có `DUE_DATE` trước hôm nay và task còn mở |

---

## 3. TASK_DETAIL

| Property | Value |
|----------|-------|
| Type | Detail |
| Table | TASK_MAIN |

### Main Section

| Column | Show |
|--------|------|
| TITLE | Yes |
| HTX_ID | Yes (label: NAME) |
| OWNER_ID | Yes (label: DISPLAY_NAME or FULL_NAME) |
| REPORTER_ID | Yes |
| STATUS | Yes |
| PRIORITY | Yes |
| TASK_TYPE | Yes |
| START_DATE | Yes |
| DUE_DATE | Yes |
| OVERDUE_HINT | Yes | Virtual; cảnh báo quá hạn (cùng công thức `TASK_HINT_COLUMNS.md`) |
| DONE_AT | Yes |
| PROGRESS_PERCENT | Yes |
| RESULT_SUMMARY | Yes |
| DESCRIPTION | Yes |
| RELATED_ENTITY_TYPE | Yes |
| RELATED_ENTITY_ID | Yes |

### Inline Children (render in TASK_DETAIL)

| Inline View | Table | Filter | IsPartOf |
|-------------|-------|--------|----------|
| TASK_CHECKLIST_INLINE | TASK_CHECKLIST | [TASK_ID] = [TASK_MAIN].[ID] | ON |
| TASK_ATTACHMENT_INLINE | TASK_ATTACHMENT | [TASK_ID] = [TASK_MAIN].[ID] | ON |
| TASK_LOG_INLINE | TASK_UPDATE_LOG | [TASK_ID] = [TASK_MAIN].[ID] | OFF |

---

## 4. TASK_CHECKLIST_INLINE

| Property | Value |
|----------|-------|
| Parent | TASK_DETAIL |
| Filter | [TASK_ID] = [TASK_MAIN].[ID] |
| IsPartOf | ON |

### Visible Columns

| Column | Show |
|--------|------|
| ITEM_NO | Yes |
| TITLE | Yes |
| DESCRIPTION | Yes |
| IS_REQUIRED | Yes |
| IS_DONE | Yes |
| NOTE | Yes |

**Hidden:** ID, TASK_ID, DONE_AT, DONE_BY, CREATED_*, UPDATED_*, IS_DELETED

**Note:** IS_DONE, DONE_AT, DONE_BY editable = OFF; GAS marks done.

---

## 5. TASK_ATTACHMENT_INLINE

| Property | Value |
|----------|-------|
| Parent | TASK_DETAIL |
| Filter | [TASK_ID] = [TASK_MAIN].[ID] |
| IsPartOf | ON |

### Visible Columns

| Column | Show |
|--------|------|
| ATTACHMENT_TYPE | Yes |
| TITLE | Yes |
| FILE_URL | Yes |
| NOTE | Yes |

**Hidden:** ID, TASK_ID, DRIVE_FILE_ID, CREATED_*, UPDATED_*, IS_DELETED

---

## 6. TASK_LOG_INLINE

| Property | Value |
|----------|-------|
| Parent | TASK_DETAIL |
| Filter | [TASK_ID] = [TASK_MAIN].[ID] |
| IsPartOf | OFF |
| Read-only | Yes |

### Visible Columns

| Column | Show |
|--------|------|
| UPDATE_TYPE | Yes |
| CONTENT | Yes |
| ACTOR_ID | Yes (display user) |
| CREATED_AT | Yes |

**Hidden:** ID, TASK_ID, CREATED_BY, UPDATED_*, IS_DELETED

**Note:** No Add. GAS creates via addTaskUpdateLog, setTaskStatus, etc.

---

## 7. TASK_FORM

| Property | Value |
|----------|-------|
| Type | Form |
| Table | TASK_MAIN |

### Required Fields

- TITLE
- HTX_ID
- OWNER_ID
- PRIORITY

### Initial Values

| Field | Initial Value |
|-------|---------------|
| REPORTER_ID | `FIRST(SELECT(USER_DIRECTORY[ID], AND([STATUS] = "ACTIVE", LOWER([EMAIL]) = LOWER(USEREMAIL()))))` |
| TASK_TYPE | GENERAL |
| STATUS | NEW |

---

## 8. Summary

- TASK_LIST: TASK_OPEN slice; key columns + HTX, OWNER
- TASK_DETAIL: Full task; inline TASK_CHECKLIST, TASK_ATTACHMENT, TASK_UPDATE_LOG
- TASK_FORM: Create with HTX_ID, OWNER_ID required; REPORTER_ID auto from USEREMAIL
- Child inlines: Filter [TASK_ID] = parent; TASK_LOG read-only
