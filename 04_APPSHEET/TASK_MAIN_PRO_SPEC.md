# TASK_MAIN PRO Architecture Spec

**Purpose:** Canonical spec for TASK_MAIN upgrade. Idempotent, ref-safe, workflow-controlled.

---

## 1. Visible Fields (Form)

| Order | Field | Ref Target | Type | Required | Notes |
|-------|-------|------------|------|----------|-------|
| 1 | DON_VI_ID | ACTIVE_DON_VI | Ref | Yes | Store DON_VI.ID; display DISPLAY_TEXT |
| 2 | TASK_TYPE_ID | ACTIVE_TASK_TYPE | Ref | Yes | MASTER_CODE where MASTER_GROUP=TASK_TYPE |
| 3 | TITLE | — | Text | Yes | Max 500 chars |
| 4 | DESCRIPTION | — | Text | No | |
| 5 | PRIORITY | TASK_PRIORITY | Enum | Yes | CAO, TRUNG_BINH, THAP |
| 6 | START_DATE | — | Date | No | Auto-set by BẮT ĐẦU if blank |
| 7 | DUE_DATE | — | Date | No | |
| 8 | OWNER_ID | ACTIVE_USERS | Ref | Yes | Store USER_DIRECTORY.ID; display FULL_NAME |

**Field order:** DON_VI_ID → TASK_TYPE_ID → TITLE → DESCRIPTION → PRIORITY → START_DATE → DUE_DATE → OWNER_ID

---

## 2. Hidden / Protected Fields

| Field | Show in Form | Editable | Notes |
|-------|---------------|----------|-------|
| ID | No | No | System key |
| STATUS | Detail only | No | Workflow actions only |
| REPORTER_ID | Detail only | No | Auto from USEREMAIL() → USER_DIRECTORY |
| CREATED_AT | No | No | Audit |
| CREATED_BY | No | No | Audit |
| UPDATED_AT | No | No | Audit |
| UPDATED_BY | No | No | Audit |
| DONE_AT | No | No | Set when DONE |
| IS_DELETED | No | No | Slice filter only |

---

## 3. Ref & Slice Mapping

| Column | Source Table | Slice | Display |
|--------|--------------|-------|---------|
| OWNER_ID | USER_DIRECTORY | ACTIVE_USERS | FULL_NAME (or DISPLAY_NAME) |
| DON_VI_ID | DON_VI | ACTIVE_DON_VI | DISPLAY_TEXT |
| TASK_TYPE_ID | MASTER_CODE | ACTIVE_TASK_TYPE | DISPLAY_TEXT (or NAME) |

**Slice conditions:**
- ACTIVE_USERS: `STATUS=ACTIVE AND IS_DELETED=FALSE`
- ACTIVE_DON_VI: `STATUS=ACTIVE AND IS_DELETED=FALSE`
- ACTIVE_TASK_TYPE: `MASTER_GROUP="TASK_TYPE" AND STATUS=ACTIVE AND IS_DELETED=FALSE`

---

## 4. REPORTER_ID Auto-Mapping

- **Source:** `USEREMAIL()` (AppSheet) / `cbvUser()` (GAS)
- **Mapping:** `mapCurrentUserEmailToInternalId()` → USER_DIRECTORY.ID
- **When:** On create; form default hidden/readonly
- **Fallback:** If not found, store email or empty; GAS logs with actor

---

## 5. PRIORITY (Controlled Enum)

| Value | Display |
|-------|---------|
| CAO | Cao |
| TRUNG_BINH | Trung bình |
| THAP | Thấp |

**Valid_If:** `IN([PRIORITY], SELECT(ENUM_DICTIONARY[ENUM_VALUE], AND([ENUM_GROUP]="TASK_PRIORITY", [IS_ACTIVE]=TRUE)))`

---

## 6. STATUS (Not Form-Editable)

- **Rule:** Editable=FALSE in AppSheet form. Change only via workflow actions.
- **Flow:** NEW → IN_PROGRESS → DONE | CANCELLED

---

## 7. Action Specs

### BẮT ĐẦU (Start)
| Property | Value |
|----------|-------|
| GAS function | `taskStartAction(taskId)` |
| When | NEW or ASSIGNED |
| Effect | STATUS → IN_PROGRESS |
| Side effect | If START_DATE blank → set TODAY() |
| Log | TASK_UPDATE_LOG with STATUS_CHANGE |

### HOÀN THÀNH (Complete)
| Property | Value |
|----------|-------|
| GAS function | `taskCompleteAction(taskId, resultSummary)` |
| When | IN_PROGRESS (or WAITING) |
| Effect | STATUS → DONE, DONE_AT = NOW() |
| Validation | Required checklist items must be done (ensureTaskCanComplete) |
| Log | TASK_UPDATE_LOG with STATUS_CHANGE |

### HỦY (Cancel)
| Property | Value |
|----------|-------|
| GAS function | `taskCancelAction(taskId, note)` |
| When | NEW, ASSIGNED, IN_PROGRESS, WAITING |
| Effect | STATUS → CANCELLED |
| Log | TASK_UPDATE_LOG with STATUS_CHANGE |

**AppSheet wiring:** Create action buttons that call webhook → GAS deploy as API; pass `[ID]` as taskId. Do NOT use "Update row" for STATUS.

---

## 8. Visibility & Privacy Control

### Cột IS_PRIVATE

| Property | Value |
|----------|-------|
| Type | Yes/No |
| Default | FALSE |
| Editable | ADMIN only (`USERROLE() = "ADMIN"`) |
| Show in Form | ADMIN only |
| Show in Detail | ADMIN only |

### Cột SHARED_WITH

| Property | Value |
|----------|-------|
| Type | List → Ref USER_DIRECTORY (slice: ACTIVE_USERS) |
| Default | blank |
| Allow Adds | OFF |
| Editable | ADMIN only |
| Show in Form | `AND(USERROLE() = "ADMIN", [IS_PRIVATE] = TRUE)` |

### Security Filter (Row-level)

```
OR(
  USERROLE() = "ADMIN",
  NOT([IS_PRIVATE]),
  AND([IS_PRIVATE], OR(
    [OWNER_ID] = ANY(SELECT(USER_DIRECTORY[ID], AND([STATUS]="ACTIVE", LOWER([EMAIL])=LOWER(USEREMAIL())))),
    [REPORTER_ID] = ANY(SELECT(USER_DIRECTORY[ID], AND([STATUS]="ACTIVE", LOWER([EMAIL])=LOWER(USEREMAIL())))),
    CONTAINS([SHARED_WITH], ANY(SELECT(USER_DIRECTORY[ID], AND([STATUS]="ACTIVE", LOWER([EMAIL])=LOWER(USEREMAIL())))))
  ))
)
```

### Logic tóm tắt

| IS_PRIVATE | Ai thấy |
|------------|---------|
| FALSE (default) | Tất cả user |
| TRUE | ADMIN + OWNER_ID + REPORTER_ID + SHARED_WITH |

---

## 9. GAS Validation Helpers

| Function | Purpose |
|----------|---------|
| `validateTaskPayload(data, isCreate)` | Full validation; returns { valid, errors } |
| `validateTaskForCreate(data)` | Pre-create validation |
| `validateTaskForUpdate(patch)` | Pre-update validation |
| `assertActiveDonViId(id, field)` | Throws if DON_VI_ID invalid |
| `assertActiveTaskTypeId(id, field)` | Throws if TASK_TYPE_ID invalid |
| `mapCurrentUserEmailToInternalId()` | USEREMAIL → USER_DIRECTORY.ID for REPORTER_ID |
| `validateTaskTransition(from, to)` | STATUS transition valid |
| `ensureTaskCanComplete(taskId)` | Checklist required items done |

---

## 10. Field Policy Summary

| Field | Show_Form | Show_Detail | Editable | Valid_If |
|-------|-----------|-------------|----------|----------|
| DON_VI_ID | Yes | Yes | Yes | Ref ACTIVE_DON_VI |
| TASK_TYPE_ID | Yes | Yes | Yes | Ref ACTIVE_TASK_TYPE |
| TITLE | Yes | Yes | Yes | Required, max 500 |
| DESCRIPTION | Yes | Yes | Yes | |
| PRIORITY | Yes | Yes | Yes | TASK_PRIORITY enum |
| START_DATE | Yes | Yes | Yes | |
| DUE_DATE | Yes | Yes | Yes | |
| OWNER_ID | Yes | Yes | Yes | Ref ACTIVE_USERS |
| ID | No | List ref | No | |
| STATUS | No | Yes (badge) | No | |
| REPORTER_ID | No | Yes | No | |
| CREATED_*, UPDATED_*, DONE_AT, IS_DELETED | No | No | No | |

---

## 11. AppSheet UX Spec

### Form Layout
1. **Section: Đơn vị & Phân loại** — DON_VI_ID, TASK_TYPE_ID
2. **Section: Thông tin** — TITLE, DESCRIPTION
3. **Section: Ưu tiên & Thời gian** — PRIORITY, START_DATE, DUE_DATE
4. **Section: Người phụ trách** — OWNER_ID

### Detail Layout
1. **Actions (top)** — BẮT ĐẦU, HOÀN THÀNH, HỦY buttons (Show_If by STATUS)
2. **Header** — TITLE, STATUS (badge), PRIORITY
3. **Meta** — DON_VI_ID, TASK_TYPE_ID, OWNER_ID, REPORTER_ID
4. **Timeline** — START_DATE, DUE_DATE, DONE_AT
5. **Progress** — PROGRESS_PERCENT, checklist summary
6. **Result** — RESULT_SUMMARY (when DONE)
7. **Body** — DESCRIPTION (collapsible)
8. **Inline** — TASK_CHECKLIST, TASK_ATTACHMENT, TASK_UPDATE_LOG
