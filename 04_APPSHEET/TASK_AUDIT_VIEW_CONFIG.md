# TASK Audit View Config — Full Traceability

TASK_DETAIL must show inline TASK_UPDATE_LOG for audit: **ai làm gì**, **lúc nào**, **thay đổi gì**, **từ trạng thái nào → trạng thái nào**.

---

## 1. Inline View: TASK_LOG_INLINE

| Property | Value |
|----------|-------|
| Parent view | TASK_DETAIL |
| Source table | TASK_UPDATE_LOG |
| Filter | `[TASK_ID] = [TASK_MAIN].[ID]` |
| Sort | `CREATED_AT` **DESC** (newest first) |
| IsPartOf | OFF (read-only; no Add) |

---

## 2. Display Columns

| Column     | Visible | Display | Purpose |
|------------|---------|---------|---------|
| ACTION     | Yes     | 1       | Ai làm gì |
| CREATED_AT | Yes     | 2       | Lúc nào |
| OLD_STATUS | Yes     | 3       | Từ trạng thái nào |
| NEW_STATUS | Yes     | 4       | Thay đổi gì (→ trạng thái nào) |
| NOTE       | Yes     | 5       | Context |
| ACTOR_ID   | Yes     | 6       | Người thực hiện (display DISPLAY_TEXT) |
| TASK_ID    | No      | Hidden  | Filter only |
| ID         | No      | Hidden  | Key |

---

## 3. Column Order (Suggested)

1. CREATED_AT (lúc nào)
2. ACTION (ai làm gì)
3. OLD_STATUS → NEW_STATUS (thay đổi gì)
4. ACTOR_ID (ai)
5. NOTE (ghi chú)

**Virtual display:** `[OLD_STATUS] & " → " & [NEW_STATUS]` when both non-blank; else ACTION only.

---

## 4. Ref Display: ACTOR_ID

- Ref target: MASTER_CODE (ACTIVE_USERS slice)
- Display: DISPLAY_TEXT

---

## 5. Security

| Setting | Value |
|---------|-------|
| Add      | OFF   |
| Edit     | OFF   |
| Delete   | OFF   |
| All columns | Editable_If = FALSE |

---

## 6. AppSheet Configuration Steps

1. **TASK_DETAIL** → Add Related table: TASK_UPDATE_LOG
2. Filter: `[TASK_ID] = [TASK_MAIN].[ID]`
3. Sort: CREATED_AT descending
4. Disable Add, Edit, Delete
5. Set all columns Editable_If = FALSE
6. Column order: CREATED_AT, ACTION, OLD_STATUS, NEW_STATUS, ACTOR_ID, NOTE

---

## 7. Optional: Audit Summary Virtual Column

For TASK_MAIN (audit summary):

```
LAST(SELECT(TASK_UPDATE_LOG[CREATED_AT], [TASK_ID] = [_THISROW].[ID]))
```

Display last activity time.

---

## 8. Final Goal

User viewing TASK_DETAIL sees:

- **Ai làm gì** — ACTION column
- **Lúc nào** — CREATED_AT
- **Thay đổi gì** — NOTE
- **Từ trạng thái nào → trạng thái nào** — OLD_STATUS, NEW_STATUS

No hidden behavior. Full traceability.
