# AppSheet Task Reference Map

**Model:** Task belongs to HTX; users shared. Ref targets use slices; Allow Adds = OFF.

---

## TASK_MAIN

| Column | Ref Target | Valid_If | Display | Allow Adds |
|--------|------------|----------|---------|------------|
| HTX_ID | ACTIVE_HTX | `IN([HTX_ID], SELECT(HO_SO_MASTER[ID], AND([HO_SO_TYPE] = "HTX", [IS_DELETED] = FALSE)))` | NAME | OFF |
| OWNER_ID | ACTIVE_USERS | `IN([OWNER_ID], SELECT(USER_DIRECTORY[ID], AND([STATUS] = "ACTIVE", [IS_DELETED] = FALSE)))` | DISPLAY_NAME or FULL_NAME | OFF |
| REPORTER_ID | ACTIVE_USERS | Same as OWNER_ID | DISPLAY_NAME or FULL_NAME | OFF |
| SHARED_WITH | ACTIVE_USERS | `IN([SHARED_WITH], SELECT(USER_DIRECTORY[ID], AND([STATUS]="ACTIVE", [IS_DELETED]=FALSE)))` | DISPLAY_NAME or FULL_NAME | OFF |
| RELATED_ENTITY_ID | Polymorphic | — | By RELATED_ENTITY_TYPE | — |

### ACTIVE_HTX Slice

- Source: HO_SO_MASTER
- Filter: `AND([HO_SO_TYPE] = "HTX", [IS_DELETED] = FALSE)`
- Label column: NAME

### ACTIVE_USERS Slice

- Source: USER_DIRECTORY
- Filter: `AND([STATUS] = "ACTIVE", [IS_DELETED] = FALSE)`
- Label column: `IF(ISNOTBLANK([DISPLAY_NAME]), [DISPLAY_NAME], [FULL_NAME])`

---

## TASK_CHECKLIST

| Column | Ref Target | Valid_If | Display | Allow Adds |
|--------|------------|----------|---------|------------|
| TASK_ID | TASK_MAIN | — | TITLE | OFF |
| DONE_BY | ACTIVE_USERS | Same as OWNER_ID | DISPLAY_NAME or FULL_NAME | OFF |

---

## TASK_ATTACHMENT

| Column | Ref Target | Valid_If | Display | Allow Adds |
|--------|------------|----------|---------|------------|
| TASK_ID | TASK_MAIN | — | TITLE | OFF |

---

## TASK_UPDATE_LOG

| Column | Ref Target | Valid_If | Display | Allow Adds |
|--------|------------|----------|---------|------------|
| TASK_ID | TASK_MAIN | — | TITLE | OFF |
| ACTOR_ID | ACTIVE_USERS | Same as OWNER_ID | DISPLAY_NAME or FULL_NAME | OFF |

**Note:** TASK_UPDATE_LOG is GAS-created; no Add from AppSheet. ACTOR_ID display for read-only view.

---

## Ref Configuration Summary

| From Table | Column | To Slice/Table | Label Source |
|------------|--------|----------------|--------------|
| TASK_MAIN | HTX_ID | ACTIVE_HTX | NAME |
| TASK_MAIN | OWNER_ID | ACTIVE_USERS | DISPLAY_NAME or FULL_NAME |
| TASK_MAIN | REPORTER_ID | ACTIVE_USERS | DISPLAY_NAME or FULL_NAME |
| TASK_MAIN | SHARED_WITH | ACTIVE_USERS | DISPLAY_NAME or FULL_NAME |
| TASK_CHECKLIST | TASK_ID | TASK_MAIN | TITLE |
| TASK_CHECKLIST | DONE_BY | ACTIVE_USERS | DISPLAY_NAME or FULL_NAME |
| TASK_ATTACHMENT | TASK_ID | TASK_MAIN | TITLE |
| TASK_UPDATE_LOG | TASK_ID | TASK_MAIN | TITLE |
| TASK_UPDATE_LOG | ACTOR_ID | ACTIVE_USERS | DISPLAY_NAME or FULL_NAME |
