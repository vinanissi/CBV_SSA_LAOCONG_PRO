# AppSheet Task Phase 1 Configuration

**Model:** Task belongs to HTX; users shared. AppSheet UI only; workflow via GAS.  
**Consolidated reference:** 02_MODULES/TASK_CENTER/TASK_SYSTEM_REFERENCE.md

---

## 1. Table Configuration

| Table | Key | Label | Slice for Ref |
|-------|-----|-------|---------------|
| TASK_MAIN | ID | TITLE | — |
| TASK_CHECKLIST | ID | TITLE | — |
| TASK_ATTACHMENT | ID | TITLE | — |
| TASK_UPDATE_LOG | ID | UPDATE_TYPE | — |

---

## 2. Required Slices

| Slice | Source | Condition |
|-------|--------|-----------|
| ACTIVE_HTX | HO_SO_MASTER | `AND([HO_SO_TYPE] = "HTX", [IS_DELETED] = FALSE)` |
| ACTIVE_USERS | USER_DIRECTORY | `AND([STATUS] = "ACTIVE", [IS_DELETED] = FALSE)` |
| TASK_OPEN | TASK_MAIN | `IN([STATUS], LIST("NEW", "ASSIGNED", "IN_PROGRESS", "WAITING"))` |
| TASK_DONE | TASK_MAIN | `[STATUS] = "DONE"` |

---

## 3. Ref Field Targets

| Table | Column | Ref Target | Allow Adds |
|-------|--------|------------|------------|
| TASK_MAIN | HTX_ID | ACTIVE_HTX | OFF |
| TASK_MAIN | OWNER_ID | ACTIVE_USERS | OFF |
| TASK_MAIN | REPORTER_ID | ACTIVE_USERS | OFF |
| TASK_CHECKLIST | TASK_ID | TASK_MAIN | OFF |
| TASK_CHECKLIST | DONE_BY | ACTIVE_USERS | OFF |
| TASK_ATTACHMENT | TASK_ID | TASK_MAIN | OFF |
| TASK_UPDATE_LOG | TASK_ID | TASK_MAIN | OFF |
| TASK_UPDATE_LOG | ACTOR_ID | ACTIVE_USERS | OFF |

---

## 4. Label Sources

| Ref Column | Label Source | Fallback |
|------------|--------------|----------|
| TASK_MAIN.HTX_ID | ACTIVE_HTX.NAME | CODE |
| TASK_MAIN.OWNER_ID | ACTIVE_USERS.DISPLAY_NAME | FULL_NAME |
| TASK_MAIN.REPORTER_ID | ACTIVE_USERS.DISPLAY_NAME | FULL_NAME |
| TASK_CHECKLIST.TASK_ID | TASK_MAIN.TITLE | TASK_CODE |
| TASK_CHECKLIST.DONE_BY | ACTIVE_USERS.DISPLAY_NAME | FULL_NAME |
| TASK_ATTACHMENT.TASK_ID | TASK_MAIN.TITLE | TASK_CODE |
| TASK_UPDATE_LOG.TASK_ID | TASK_MAIN.TITLE | TASK_CODE |
| TASK_UPDATE_LOG.ACTOR_ID | ACTIVE_USERS.DISPLAY_NAME | FULL_NAME |

---

## 5. REPORTER_ID Initial Value

```
FIRST(SELECT(USER_DIRECTORY[ID], AND([STATUS] = "ACTIVE", [IS_DELETED] = FALSE, LOWER([EMAIL]) = LOWER(USEREMAIL()))))
```

Or if LOOKUP supported:

```
LOOKUP(USER_DIRECTORY[ID], AND([STATUS] = "ACTIVE", [IS_DELETED] = FALSE, LOWER([EMAIL]) = LOWER(USEREMAIL())), "")
```

Apply as **Initial Value** on TASK_FORM for REPORTER_ID. Empty if no match; user selects manually.

---

## 6. STATUS Not Freely Editable

- TASK_MAIN.STATUS: **Editable = OFF**
- Change only via GAS actions (ACT_TASK_START, ACT_TASK_COMPLETE, etc.)
- AppSheet action buttons call GAS webhook

---

## 7. Child Tables in TASK_DETAIL

| Inline View | Table | Filter | IsPartOf |
|-------------|-------|--------|----------|
| TASK_CHECKLIST_INLINE | TASK_CHECKLIST | [TASK_ID] = [TASK_MAIN].[ID] | ON |
| TASK_ATTACHMENT_INLINE | TASK_ATTACHMENT | [TASK_ID] = [TASK_MAIN].[ID] | ON |
| TASK_LOG_INLINE | TASK_UPDATE_LOG | [TASK_ID] = [TASK_MAIN].[ID] | OFF (read-only) |

---

## 8. No Accidental Destructive Behavior

| Safeguard | Setting |
|-----------|---------|
| Allow Adds on HTX_ID, OWNER_ID, REPORTER_ID | OFF |
| Allow Adds on TASK_ID (children) | OFF |
| Allow Adds on DONE_BY, ACTOR_ID | OFF |
| STATUS editable | OFF |
| PROGRESS_PERCENT editable | OFF |
| DONE_AT editable | OFF |
| IS_DONE (TASK_CHECKLIST) editable | OFF |
| TASK_ATTACHMENT Allow Delete | OFF |
| TASK_UPDATE_LOG Add/Edit/Delete | OFF (GAS only) |

---

## 9. Summary

- Task belongs to HTX: HTX_ID → ACTIVE_HTX
- Users shared: OWNER_ID, REPORTER_ID, DONE_BY, ACTOR_ID → ACTIVE_USERS
- User display: DISPLAY_NAME or FULL_NAME
- HTX display: NAME
- Allow Adds = OFF on all operational refs
- STATUS workflow via GAS only
- REPORTER_ID auto-fill from USEREMAIL when available
