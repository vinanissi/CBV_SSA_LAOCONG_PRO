# AppSheet Inline Views — CBV_SSA_LAOCONG_PRO

Inline child view specifications. 3–5 columns; readable at a glance. Aligned with APPSHEET_INLINE_ATTACHMENT_UX.md and APPSHEET_ATTACHMENT_VIEWS.md.

---

## HO_SO_FILE_INLINE

| Property | Value |
|----------|-------|
| View | HO_SO_FILE_INLINE |
| Table | HO_SO_FILE |
| Parent | HO_SO_DETAIL |
| Filter | [HO_SO_ID] = [HO_SO_MASTER].[ID] |
| IsPartOf | ON |

### Visible Columns (3–5)

| Column | Show | Purpose |
|--------|------|---------|
| FILE_GROUP | Yes | Document type |
| FILE_NAME | Yes | Display label |
| FILE_URL | Yes | File link/preview; Type = File |
| NOTE | Yes | Optional |

### Hidden

ID, HO_SO_ID, DRIVE_FILE_ID, STATUS, CREATED_AT, CREATED_BY

---

## HO_SO_RELATION_INLINE

| Property | Value |
|----------|-------|
| View | HO_SO_RELATION_INLINE |
| Table | HO_SO_RELATION |
| Parent | HO_SO_DETAIL |
| Filter | [FROM_HO_SO_ID] = [HO_SO_MASTER].[ID] OR [TO_HO_SO_ID] = [HO_SO_MASTER].[ID] |
| IsPartOf | OFF (dual ref) |

### Visible Columns (3–5)

| Column | Show | Purpose |
|--------|------|---------|
| RELATION_TYPE | Yes | Relation type |
| FROM_HO_SO_ID | Yes | From HO_SO (display NAME) |
| TO_HO_SO_ID | Yes | To HO_SO (display NAME) |
| START_DATE | Yes | |
| NOTE | Yes | Optional |

### Hidden

ID, END_DATE, STATUS, CREATED_AT, CREATED_BY

---

## TASK_CHECKLIST_INLINE

| Property | Value |
|----------|-------|
| View | TASK_CHECKLIST_INLINE |
| Table | TASK_CHECKLIST |
| Parent | TASK_DETAIL |
| Filter | [TASK_ID] = [TASK_MAIN].[ID] |
| IsPartOf | ON |

### Visible Columns (3–5)

| Column | Show | Purpose |
|--------|------|---------|
| ITEM_NO | Yes | Item number |
| SORT_ORDER | Yes | Display order |
| TITLE | Yes | Item title |
| IS_REQUIRED | Yes | Yes/No |
| IS_DONE | Yes | Yes/No (GAS or action) |
| NOTE | Yes | Optional |

### Hidden

ID, TASK_ID, DONE_AT, DONE_BY, CREATED_AT, CREATED_BY

---

## TASK_ATTACHMENT_INLINE

| Property | Value |
|----------|-------|
| View | TASK_ATTACHMENT_INLINE |
| Table | TASK_ATTACHMENT |
| Parent | TASK_DETAIL |
| Filter | [TASK_ID] = [TASK_MAIN].[ID] |
| IsPartOf | ON |

### Visible Columns (3–5)

| Column | Show | Purpose |
|--------|------|---------|
| ATTACHMENT_TYPE | Yes | DRAFT/RESULT/SOP/REFERENCE/OTHER |
| TITLE | Yes | Display label |
| FILE_URL | Yes | File link/preview; Type = File |
| NOTE | Yes | Optional |

### Hidden

ID, TASK_ID, FILE_NAME, DRIVE_FILE_ID, CREATED_AT, CREATED_BY

---

## TASK_LOG_INLINE

| Property | Value |
|----------|-------|
| View | TASK_LOG_INLINE |
| Table | TASK_UPDATE_LOG |
| Parent | TASK_DETAIL |
| Filter | [TASK_ID] = [TASK_MAIN].[ID] |
| IsPartOf | OFF (read-only) |

### Visible Columns (3–5)

| Column | Show | Purpose |
|--------|------|---------|
| ACTION | Yes | Update type |
| OLD_STATUS | Yes | |
| NEW_STATUS | Yes | |
| NOTE | Yes | Optional |
| CREATED_AT | Yes | When |

### Hidden

ID, TASK_ID, ACTOR_ID

### Readonly

All (no Add; GAS creates)

---

## FIN_ATTACHMENT_INLINE

| Property | Value |
|----------|-------|
| View | FIN_ATTACHMENT_INLINE |
| Table | FINANCE_ATTACHMENT |
| Parent | FINANCE_DETAIL |
| Filter | [FINANCE_ID] = [FINANCE_TRANSACTION].[ID] |
| IsPartOf | ON |

### Visible Columns (3–5)

| Column | Show | Purpose |
|--------|------|---------|
| ATTACHMENT_TYPE | Yes | INVOICE/RECEIPT/CONTRACT/PROOF/OTHER |
| TITLE | Yes | Display label |
| FILE_URL | Yes | File link/preview; Type = File |
| NOTE | Yes | Optional |

### Hidden

ID, FINANCE_ID, FILE_NAME, DRIVE_FILE_ID, CREATED_AT, CREATED_BY

---

## FIN_LOG_INLINE

| Property | Value |
|----------|-------|
| View | FIN_LOG_INLINE |
| Table | FINANCE_LOG |
| Parent | FINANCE_DETAIL |
| Filter | [FIN_ID] = [FINANCE_TRANSACTION].[ID] |
| IsPartOf | OFF (read-only) |

### Visible Columns (3–5)

| Column | Show | Purpose |
|--------|------|---------|
| ACTION | Yes | Log action |
| NOTE | Yes | Optional |
| ACTOR_ID | Yes | Who |
| CREATED_AT | Yes | When |

### Hidden

ID, FIN_ID, BEFORE_JSON, AFTER_JSON

### Readonly

All (no Add; GAS creates)

---

## Summary: Inline View Requirements

1. **3–5 useful columns** — ✓ All inline views use 4–5 columns
2. **Prioritize readability** — ✓ Type, title/name, key info
3. **Clear what child record is** — ✓ Type/group + label
4. **Internal IDs hidden** — ✓ ID, parent ref hidden in list
5. **Understandable at a glance** — ✓ Minimal clutter
