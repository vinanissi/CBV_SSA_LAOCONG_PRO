# AppSheet Label Policy — CBV_SSA_LAOCONG_PRO

**Enforcement:** Every Ref shown to users must display human-readable DISPLAY_TEXT. Never display raw ID/CODE to normal users unless explicitly required.

---

## 1. LABEL STRATEGY

| Source | Key (Stored) | Label (Display) | Fallback |
|--------|---------------|-----------------|----------|
| MASTER_CODE | ID | DISPLAY_TEXT | NAME or SHORT_NAME+" - "+NAME or CODE+" - "+NAME |
| ENUM_DICTIONARY | ENUM_VALUE | DISPLAY_TEXT | Humanized ENUM_VALUE |
| HO_SO_MASTER | ID | NAME | CODE |
| TASK_MAIN | ID | TITLE | TASK_CODE |
| FINANCE_TRANSACTION | ID | TRANS_CODE | ID |

---

## 2. MASTER_CODE LABEL RULES

| Rule | Enforcement |
|------|-------------|
| Primary label | **DISPLAY_TEXT** |
| Run ensureDisplayTextForMasterCodeRows() | Before AppSheet config; keeps DISPLAY_TEXT populated |
| Value column for Ref | **ID** (user refs) or **CODE** (other MASTER_GROUP refs) |
| Display column for Ref | **DISPLAY_TEXT** |
| Admin/debug views | May show CODE or ID for troubleshooting only |

**USER group (MASTER_GROUP=USER):**
- Store: ID
- Display: DISPLAY_TEXT or NAME
- SHORT_NAME = email (for USEREMAIL mapping); not used as label

---

## 3. ENUM_DICTIONARY LABEL RULES

| Rule | Enforcement |
|------|-------------|
| Primary label | **DISPLAY_TEXT** |
| Fallback | Humanized ENUM_VALUE (e.g. IN_PROGRESS → "In Progress") |
| Value column | ENUM_VALUE |
| Display column | DISPLAY_TEXT |

---

## 4. TABLE LABEL COLUMNS (AppSheet Data → Tables → Label)

| Table | Label Column | Notes |
|-------|--------------|-------|
| ENUM_DICTIONARY | DISPLAY_TEXT | Or IF(ISBLANK([DISPLAY_TEXT]), [ENUM_VALUE], [DISPLAY_TEXT]) |
| MASTER_CODE | DISPLAY_TEXT | Or IF(ISBLANK([DISPLAY_TEXT]), [NAME], [DISPLAY_TEXT]) |
| HO_SO_MASTER | NAME | |
| HO_SO_FILE | FILE_NAME | |
| HO_SO_RELATION | RELATION_TYPE | |
| TASK_MAIN | TITLE | |
| TASK_CHECKLIST | TITLE | |
| TASK_UPDATE_LOG | ACTION | |
| TASK_ATTACHMENT | TITLE | Or FILE_NAME |
| FINANCE_TRANSACTION | TRANS_CODE | |
| FINANCE_ATTACHMENT | TITLE | |
| FINANCE_LOG | ACTION | |
| ADMIN_AUDIT_LOG | ACTION | Or ENTITY_ID |

---

## 5. REF DISPLAY BEHAVIOR

| Ref Column | Referenced Table/Slice | Display Via | Never Show |
|------------|------------------------|-------------|------------|
| TASK_MAIN.OWNER_ID | ACTIVE_USERS | DISPLAY_TEXT | ID, CODE |
| TASK_MAIN.REPORTER_ID | ACTIVE_USERS | DISPLAY_TEXT | ID, CODE |
| HO_SO_MASTER.OWNER_ID | ACTIVE_USERS | DISPLAY_TEXT | ID, CODE |
| HO_SO_MASTER.HTX_ID | ACTIVE_HTX | NAME | ID |
| TASK_CHECKLIST.DONE_BY | ACTIVE_USERS | DISPLAY_TEXT | ID, CODE |
| FINANCE_TRANSACTION.CONFIRMED_BY | ACTIVE_USERS | DISPLAY_TEXT | ID, CODE |
| TASK_MAIN.RELATED_ENTITY_ID | Polymorphic | Depends on RELATED_ENTITY_TYPE | — |
| HO_SO_FILE.HO_SO_ID | HO_SO_MASTER | NAME | ID |
| TASK_CHECKLIST.TASK_ID | TASK_MAIN | TITLE | ID |
| TASK_ATTACHMENT.TASK_ID | TASK_MAIN | TITLE | ID |
| FINANCE_ATTACHMENT.FINANCE_ID | FINANCE_TRANSACTION | TRANS_CODE | ID |

---

## 6. EXCEPTIONS (Admin/Debug Only)

| Context | Allowed | Notes |
|---------|---------|-------|
| Admin MASTER_CODE list | Show CODE, ID | For ref lookup and troubleshooting |
| Admin ENUM list | Show ENUM_VALUE | For ref lookup |
| Log tables (TASK_UPDATE_LOG, etc.) | ACTOR_ID as stored | Email; no Ref display |
| System diagnostics | Raw IDs | Explicit admin-only views |

---

## 7. IMPLEMENTATION CHECKLIST

- [ ] MASTER_CODE table: Label = DISPLAY_TEXT
- [ ] ENUM_DICTIONARY table: Label = DISPLAY_TEXT
- [ ] All Ref columns: Display column = target table's DISPLAY_TEXT or NAME
- [ ] No "Allow other values" on user/identity Ref dropdowns
- [ ] ensureDisplayTextForMasterCodeRows() run after MASTER_CODE edits
