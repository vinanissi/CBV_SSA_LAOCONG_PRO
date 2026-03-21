# TASK Field Edit Rules — Behavior Lock

Editable only when task is **not** DONE or CANCELLED. User cannot **sửa dữ liệu sai**.

---

## 1. Editable_If (Business Fields)

**Rule:** Business fields editable only when task is open (not DONE, not CANCELLED).

**Expression:**
```
AND(
  [STATUS] <> "DONE",
  [STATUS] <> "CANCELLED"
)
```

---

## 2. TASK_MAIN Field Edit Matrix

| Field           | Editable_If | Notes |
|-----------------|-------------|-------|
| TITLE           | `AND([STATUS] <> "DONE", [STATUS] <> "CANCELLED")` | Business |
| DESCRIPTION     | Same | Business |
| TASK_TYPE       | Same | Business |
| PRIORITY        | Same | Business |
| OWNER_ID        | Same | Reassign: OWNER or ADMIN only |
| REPORTER_ID     | Same | Business |
| RELATED_ENTITY_* | Same | Business |
| START_DATE      | Same | Business |
| DUE_DATE        | Same | Business |
| RESULT_SUMMARY  | `[STATUS] = "DONE"` | Editable when DONE (add note after complete) |
| STATUS          | FALSE | Never; GAS only |
| DONE_AT         | FALSE | GAS only |
| PROGRESS_PERCENT| FALSE | GAS only |
| CREATED_AT      | FALSE | System |
| CREATED_BY      | FALSE | System |
| UPDATED_AT      | FALSE | System |
| UPDATED_BY      | FALSE | System |

---

## 3. TASK_CHECKLIST Field Edit

| Field    | Editable_If | Notes |
|----------|-------------|-------|
| TITLE    | Parent open | `AND([TASK_MAIN].[STATUS] <> "DONE", [TASK_MAIN].[STATUS] <> "CANCELLED")` |
| IS_REQUIRED | Parent open | Same |
| NOTE     | Parent open | Same |
| IS_DONE  | FALSE | GAS only (markChecklistDone) |
| DONE_AT  | FALSE | GAS only |
| DONE_BY  | FALSE | GAS only |

---

## 4. TASK_ATTACHMENT Field Edit

| Field   | Editable_If | Notes |
|---------|-------------|-------|
| TITLE   | Parent open | Same as TASK_MAIN |
| FILE_*  | Parent open | Same |
| TASK_ID | Pre-filled  | From parent; required |

---

## 5. TASK_UPDATE_LOG

| All columns | Editable_If | Notes |
|-------------|------------|-------|
| *          | FALSE      | Append-only; GAS only |

---

## 6. AppSheet Configuration

**TASK_FORM / TASK_DETAIL:**

- Business fields: `Editable_If = AND([STATUS] <> "DONE", [STATUS] <> "CANCELLED")`
- System fields: `Editable_If = FALSE`
- STATUS, DONE_AT, PROGRESS_PERCENT: `Editable_If = FALSE`

**RESULT_SUMMARY exception:**

- When DONE: user may add/edit RESULT_SUMMARY (post-completion note)
- `Editable_If = [STATUS] = "DONE"`

---

## 7. Combined Rule (Single Expression)

For bulk apply to business fields:

```
AND(
  [STATUS] <> "DONE",
  [STATUS] <> "CANCELLED"
)
```

Exclusions: STATUS, DONE_AT, PROGRESS_PERCENT, CREATED_*, UPDATED_* (always FALSE); RESULT_SUMMARY (FALSE when open, TRUE when DONE).
