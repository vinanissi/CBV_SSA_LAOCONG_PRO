# AppSheet Phase 1 Configuration Plan — CBV_SSA_LAOCONG_PRO

## Schema Alignment

**Locked schema tables (9):**
- HO_SO_MASTER, HO_SO_FILE, HO_SO_RELATION
- TASK_MAIN, TASK_CHECKLIST, TASK_UPDATE_LOG, TASK_ATTACHMENT
- FINANCE_TRANSACTION, FINANCE_LOG

**Not in schema (excluded):**
- TASK_RELATION — not in 06_DATABASE/schema_manifest.json
- FINANCE_CATEGORY — not a table; CATEGORY is an enum column in FINANCE_TRANSACTION

---

## PART 1 — TABLE CONFIGURATION

| Table | Key | Label | Data Type | Audit Fields Non-Editable |
|-------|-----|-------|-----------|---------------------------|
| HO_SO_MASTER | ID | NAME | Text | ID, CREATED_AT, CREATED_BY, UPDATED_AT, UPDATED_BY, IS_DELETED |
| HO_SO_FILE | ID | FILE_NAME | Text | ID, CREATED_AT, CREATED_BY |
| HO_SO_RELATION | ID | RELATION_TYPE | Text | ID, CREATED_AT, CREATED_BY |
| TASK_MAIN | ID | TITLE | Text | ID, CREATED_AT, CREATED_BY, UPDATED_AT, UPDATED_BY, IS_DELETED |
| TASK_CHECKLIST | ID | TITLE | Text | ID, CREATED_AT, CREATED_BY |
| TASK_UPDATE_LOG | ID | ACTION | Text | All (read-only) |
| TASK_ATTACHMENT | ID | FILE_NAME | Text | ID, CREATED_AT, CREATED_BY |
| FINANCE_TRANSACTION | ID | TRANS_CODE | Text | ID, CREATED_AT, CREATED_BY, UPDATED_AT, UPDATED_BY, IS_DELETED, CONFIRMED_AT, CONFIRMED_BY |
| FINANCE_LOG | ID | ACTION | Text | All (read-only) |

---

## PART 2 — KEY & LABEL CONFIG

| Table | Key | Label | Notes |
|-------|-----|-------|-------|
| HO_SO_MASTER | ID | NAME | Stable, human-readable |
| TASK_MAIN | ID | TITLE | Stable, human-readable |
| FINANCE_TRANSACTION | ID | TRANS_CODE | Stable; DESCRIPTION not used as label (long text) |

- No duplicate keys
- Key = ID for all tables
- Label = human-readable display column

---

## PART 3 — ENUM & DATA TYPES

| Field | Table | Type | Allowed Values |
|-------|-------|------|----------------|
| HO_SO_TYPE | HO_SO_MASTER | Enum (List) | HTX, XA_VIEN, XE, TAI_XE |
| STATUS | HO_SO_MASTER | Enum | NEW, ACTIVE, INACTIVE, ARCHIVED |
| FILE_GROUP | HO_SO_FILE | Enum | CCCD, GPLX, DANG_KY_XE, HOP_DONG, KHAC |
| STATUS | HO_SO_FILE | Enum | ACTIVE, ARCHIVED |
| STATUS | HO_SO_RELATION | Enum | ACTIVE, ARCHIVED |
| TASK_TYPE | TASK_MAIN | Enum | GENERAL, HO_SO, FINANCE, OPERATION |
| STATUS | TASK_MAIN | Enum | NEW, ASSIGNED, IN_PROGRESS, WAITING, DONE, CANCELLED, ARCHIVED |
| PRIORITY | TASK_MAIN | Enum | LOW, MEDIUM, HIGH, URGENT |
| IS_REQUIRED | TASK_CHECKLIST | Yes/No | true, false |
| IS_DONE | TASK_CHECKLIST | Yes/No | true, false |
| TRANS_TYPE | FINANCE_TRANSACTION | Enum | INCOME, EXPENSE |
| STATUS | FINANCE_TRANSACTION | Enum | NEW, CONFIRMED, CANCELLED, ARCHIVED |
| CATEGORY | FINANCE_TRANSACTION | Enum | VAN_HANH, NHIEN_LIEU, SUA_CHUA, LUONG, THU_KHAC, CHI_KHAC |
| PAYMENT_METHOD | FINANCE_TRANSACTION | Enum | CASH, BANK, OTHER |
| RELATED_ENTITY_TYPE | TASK_MAIN | Enum | NONE, HO_SO, FINANCE_TRANSACTION, TASK |
| RELATED_ENTITY_TYPE | FINANCE_TRANSACTION | Enum | NONE, HO_SO, TASK, UNIT |

**Rule:** No free text where enum is defined.

---

## PART 3B — REF COLUMNS (HO_SO_MASTER)

| Column | Ref to | Slice / notes |
|--------|--------|----------------|
| HO_SO_TYPE_ID | MASTER_CODE | **ACTIVE_HO_SO_TYPE** — `MASTER_GROUP=HO_SO_TYPE`, `STATUS=ACTIVE`; required PRO |
| HTX_ID | HO_SO_MASTER | ACTIVE_HTX (HO_SO_TYPE=HTX) |
| OWNER_ID | USER_DIRECTORY | ACTIVE_USERS |
| TAGS_TEXT | — | Text (không phải TAGS); tags tìm kiếm, phân cách dấu phẩy |

---

## PART 4 — SLICE DESIGN (MINIMAL)

### HO_SO
| Slice | Condition | Purpose |
|-------|-----------|---------|
| HO_SO_ACTIVE | STATUS = "ACTIVE" | Active records only |
| HO_SO_ALL | IS_DELETED = FALSE | All non-deleted |
| ACTIVE_HO_SO_TYPE | MASTER_CODE: `MASTER_GROUP=HO_SO_TYPE`, `STATUS=ACTIVE`, `IS_DELETED=FALSE` | Dropdown cho `HO_SO_TYPE_ID` |

### TASK
| Slice | Condition | Purpose |
|-------|-----------|---------|
| TASK_OPEN | STATUS != "DONE" AND STATUS != "ARCHIVED" | Open tasks |
| TASK_MY | OWNER_ID = USEREMAIL() | My tasks (if OWNER_ID stores email) |
| TASK_DONE_RECENT | STATUS = "DONE" | Completed tasks |

### FINANCE
| Slice | Condition | Purpose |
|-------|-----------|---------|
| FINANCE_PENDING | STATUS = "NEW" | Pending confirmation |
| FINANCE_CONFIRMED | STATUS = "CONFIRMED" | Confirmed transactions |

---

## PART 5 — VIEW DESIGN (PHASE 1)

### HO_SO
| View | Type | Slice | Purpose |
|------|------|-------|---------|
| HO_SO_LIST | Table | HO_SO_ALL | List view |
| HO_SO_DETAIL | Detail | HO_SO_ALL | Record detail |
| HO_SO_FORM | Form | - | Create new |

### TASK
| View | Type | Slice | Purpose |
|------|------|-------|---------|
| TASK_LIST | Table | TASK_OPEN | List view |
| TASK_DETAIL | Detail | TASK_OPEN | Record detail |
| TASK_FORM | Form | - | Create new |

### FINANCE
| View | Type | Slice | Purpose |
|------|------|-------|---------|
| FINANCE_LIST | Table | FINANCE_PENDING or FINANCE_CONFIRMED | List view |
| FINANCE_DETAIL | Detail | - | Record detail |
| FINANCE_FORM | Form | - | Create new |

---

## PART 6 — INLINE RELATIONS

### HO_SO_DETAIL
- HO_SO_FILE (filter: HO_SO_ID = [HO_SO_MASTER].ID)
- HO_SO_RELATION (filter: FROM_HO_SO_ID = [HO_SO_MASTER].ID OR TO_HO_SO_ID = [HO_SO_MASTER].ID)

### TASK_DETAIL
- TASK_CHECKLIST (filter: TASK_ID = [TASK_MAIN].ID)
- TASK_UPDATE_LOG (filter: TASK_ID = [TASK_MAIN].ID)
- TASK_ATTACHMENT (filter: TASK_ID = [TASK_MAIN].ID)

### FINANCE_DETAIL
- FINANCE_LOG (filter: FIN_ID = [FINANCE_TRANSACTION].ID)
- FINANCE_ATTACHMENT (filter: FINANCE_ID = [FINANCE_TRANSACTION].ID)

---

## PART 7 — ACTIONS (UI SAFE ONLY)

### HO_SO_MASTER
| Action | Condition | Effect |
|--------|-----------|--------|
| ACT_HO_SO_ACTIVATE | STATUS = "NEW" | **MUST call GAS** setHoSoStatus(id, "ACTIVE") |
| ACT_HO_SO_DEACTIVATE | STATUS = "ACTIVE" | **MUST call GAS** setHoSoStatus(id, "INACTIVE") |
| ACT_HO_SO_ARCHIVE | STATUS = "ACTIVE" OR "INACTIVE" | **MUST call GAS** setHoSoStatus(id, "ARCHIVED") |

### TASK_MAIN
| Action | Condition | Effect |
|--------|-----------|--------|
| ACT_TASK_START | STATUS = "ASSIGNED" | **MUST call GAS** setTaskStatus(id, "IN_PROGRESS", "") |
| ACT_TASK_COMPLETE | STATUS = "IN_PROGRESS" | **MUST call GAS** setTaskStatus(id, "DONE", note) — enforces checklist |
| ACT_TASK_CANCEL | STATUS IN ("NEW","ASSIGNED","IN_PROGRESS","WAITING") | **MUST call GAS** setTaskStatus(id, "CANCELLED", "") |

### FINANCE_TRANSACTION
| Action | Condition | Effect |
|--------|-----------|--------|
| ACT_FIN_CONFIRM | STATUS = "NEW" | **MUST call GAS** setFinanceStatus(id, "CONFIRMED", note) — sets CONFIRMED_AT, CONFIRMED_BY, log |
| ACT_FIN_CANCEL | STATUS = "NEW" | **MUST call GAS** setFinanceStatus(id, "CANCELLED", "") |

**Rule:** Direct status update is NOT allowed. All status-changing actions MUST invoke GAS for audit trail and validation.

---

## PART 8 — SECURITY (PHASE 1 BASIC)

### Hidden Fields
- CREATED_AT, CREATED_BY, UPDATED_AT, UPDATED_BY, IS_DELETED (hide from forms/lists where not needed)

### Non-Editable
- ID (all tables)
- All audit fields
- STATUS (edit only via actions)
- AMOUNT, TRANS_TYPE, CATEGORY when STATUS = "CONFIRMED"

### Filter (Optional Phase 1)
- TASK_MY: `OWNER_ID = USEREMAIL()` — only if OWNER_ID stores email

---

## PART 9 — EDIT RULES

| Rule | Enforcement |
|------|-------------|
| STATUS not freely editable | Column = Read-only; change via actions only |
| AMOUNT not editable after CONFIRMED | Conditional: editable only when STATUS = "NEW" |
| ID never editable | Column = Read-only |
| Audit fields never editable | Column = Read-only |
| Log tables read-only | TASK_UPDATE_LOG, FINANCE_LOG = no add/edit/delete |

---

## PART 10 — VALIDATION (LIGHT ONLY)

- Required: NAME, CODE, HO_SO_TYPE (HO_SO_MASTER); TITLE, OWNER_ID, PRIORITY (TASK_MAIN); TRANS_TYPE, CATEGORY, AMOUNT (FINANCE_TRANSACTION)
- Enum: restrict to allowed values only
- AMOUNT > 0 for FINANCE_TRANSACTION

Heavy validation (workflow, duplicate, checklist) stays in GAS.

---

## PART 11 — OUTPUT SUMMARY

### 1. Table Configuration Summary
| Table | Key | Label | Enum Fields | Ref Fields |
|-------|-----|-------|-------------|------------|
| HO_SO_MASTER | ID | NAME | HO_SO_TYPE, STATUS | HTX_ID |
| HO_SO_FILE | ID | FILE_NAME | FILE_GROUP, STATUS | HO_SO_ID |
| HO_SO_RELATION | ID | RELATION_TYPE | STATUS | FROM_HO_SO_ID, TO_HO_SO_ID |
| TASK_MAIN | ID | TITLE | TASK_TYPE, STATUS, PRIORITY, RELATED_ENTITY_TYPE | RELATED_ENTITY_ID |
| TASK_CHECKLIST | ID | TITLE | IS_REQUIRED, IS_DONE | TASK_ID |
| TASK_UPDATE_LOG | ID | ACTION | - | TASK_ID |
| TASK_ATTACHMENT | ID | TITLE | ATTACHMENT_TYPE | TASK_ID |
| FINANCE_TRANSACTION | ID | TRANS_CODE | TRANS_TYPE, STATUS, CATEGORY, PAYMENT_METHOD, RELATED_ENTITY_TYPE | RELATED_ENTITY_ID |
| FINANCE_ATTACHMENT | ID | TITLE | ATTACHMENT_TYPE | FINANCE_ID |
| FINANCE_LOG | ID | ACTION | - | FIN_ID |

### 2. Slice List
- HO_SO_ACTIVE, HO_SO_ALL
- TASK_OPEN, TASK_MY, TASK_DONE_RECENT
- FINANCE_PENDING, FINANCE_CONFIRMED

### 3. View List
- HO_SO_LIST, HO_SO_DETAIL, HO_SO_FORM
- TASK_LIST, TASK_DETAIL, TASK_FORM
- FINANCE_LIST, FINANCE_DETAIL, FINANCE_FORM

### 4. Action List with Conditions
| Action | Table | Condition |
|--------|-------|-----------|
| ACT_HO_SO_ACTIVATE | HO_SO_MASTER | STATUS = "NEW" |
| ACT_HO_SO_DEACTIVATE | HO_SO_MASTER | STATUS = "ACTIVE" |
| ACT_HO_SO_ARCHIVE | HO_SO_MASTER | STATUS IN ("ACTIVE","INACTIVE") |
| ACT_TASK_START | TASK_MAIN | STATUS = "ASSIGNED" |
| ACT_TASK_COMPLETE | TASK_MAIN | STATUS = "IN_PROGRESS" |
| ACT_TASK_CANCEL | TASK_MAIN | STATUS IN ("NEW","ASSIGNED","IN_PROGRESS","WAITING") |
| ACT_FIN_CONFIRM | FINANCE_TRANSACTION | STATUS = "NEW" |
| ACT_FIN_CANCEL | FINANCE_TRANSACTION | STATUS = "NEW" |

### 5. Security Rules Summary
- ID, audit fields: non-editable
- STATUS: editable only via actions
- Log tables: read-only
- Hide system fields where not needed
- OWNER_ID = USEREMAIL() filter optional for TASK_MY

### 6. Known Limitations (Phase 1)
- No complex RBAC; basic USEREMAIL filter only if applicable
- ACT_TASK_COMPLETE: direct status update may bypass checklist validation — prefer GAS webhook
- ACT_FIN_CONFIRM, ACT_HO_SO_*: direct update works but GAS gives full audit trail
- OWNER_ID may not store email; TASK_MY filter may need adjustment

### 7. What MUST Be Handled by GAS (Not AppSheet)
- Workflow transitions (setHoSoStatus, setTaskStatus, setFinanceStatus)
- Duplicate CODE validation (HO_SO)
- Required checklist before DONE (TASK)
- Edit block after CONFIRMED (FINANCE)
- Log creation (TASK_UPDATE_LOG, FINANCE_LOG)
- ID generation

---

## PART 12 — RESPONSIBILITY SEPARATION

| Responsibility | AppSheet | GAS |
|----------------|----------|-----|
| Display data | ✓ | |
| Create form (light validation) | ✓ | |
| Required fields | ✓ | |
| Enum restriction | ✓ | |
| Workflow rules | | ✓ |
| Status change with guard | | ✓ |
| Duplicate check | | ✓ |
| Checklist complete | | ✓ |
| Audit log | | ✓ |

---

## FINAL STATEMENT

**SYSTEM IS SAFE FOR PHASE 1 USE** provided that

1. STATUS is not inline-editable; change only via actions that **MUST call GAS**
2. FINANCE_TRANSACTION: AMOUNT, TRANS_TYPE, CATEGORY non-editable when STATUS = "CONFIRMED"
3. Log tables (TASK_UPDATE_LOG, FINANCE_LOG) are read-only
4. All status-changing actions invoke GAS (setHoSoStatus, setTaskStatus, setFinanceStatus) — no direct status update
