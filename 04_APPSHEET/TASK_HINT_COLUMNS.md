# TASK Hint Columns — User Guidance UX

Virtual columns to guide user to correct action. Add to TASK_MAIN.

---

## 1. NEXT_ACTION_HINT

**Type:** Text (Virtual column / Formula)

**Expression:**
```
SWITCH([STATUS],
  "NEW", "Nhấn GIAO TASK để giao việc",
  "ASSIGNED", "Nhấn BẮT ĐẦU để làm việc",
  "IN_PROGRESS", "Tiếp tục hoặc hoàn thành công việc",
  "WAITING", "Đang chờ — nhấn TIẾP TỤC khi sẵn sàng",
  "DONE", "Công việc đã hoàn thành",
  "CANCELLED", "Công việc đã huỷ",
  "ARCHIVED", "Đã lưu trữ",
  "Bước tiếp theo"
)
```

**Display:** TASK_DETAIL (above or below action buttons)

---

## 2. CHECKLIST_HINT

**Type:** Text (Virtual column)

**Prerequisite:** Add virtual columns CHECKLIST_TOTAL and CHECKLIST_DONE first.

**CHECKLIST_TOTAL:**
```
COUNT(SELECT(TASK_CHECKLIST[ID], [TASK_ID] = [_THISROW].[ID]))
```

**CHECKLIST_DONE:**
```
COUNT(SELECT(TASK_CHECKLIST[ID], AND([TASK_ID] = [_THISROW].[ID], [IS_DONE] = TRUE)))
```

**CHECKLIST_HINT:**
```
IF(
  [CHECKLIST_TOTAL] > [CHECKLIST_DONE],
  "Chưa hoàn thành checklist",
  IF([CHECKLIST_TOTAL] = 0, "Chưa có checklist", "Checklist đã hoàn thành")
)
```

**Display:** TASK_DETAIL (near checklist inline)

---

## 3. OVERDUE_HINT (Error Prevention)

**Type:** Text (Virtual column)

**Expression:**
```
IF(
  AND(
    NOT(ISBLANK([DUE_DATE])),
    [DUE_DATE] < TODAY(),
    IN([STATUS], LIST("NEW", "ASSIGNED", "IN_PROGRESS", "WAITING"))
  ),
  "Quá hạn",
  ""
)
```

**Display:** TASK_DETAIL, TASK_LIST (as column or badge)

---

## 4. RESULT_NOTE_WARNING (Conditional)

**Type:** Text (Virtual column)

**Expression:**
```
IF(
  AND([STATUS] = "DONE", ISBLANK([RESULT_NOTE])),
  "Cần bổ sung ghi chú kết quả",
  ""
)
```

**Display:** TASK_DETAIL when DONE and RESULT_NOTE blank (prompt for edit)

---

## 5. AppSheet Setup

| Column            | Table    | Type    | Formula |
|-------------------|----------|---------|---------|
| CHECKLIST_TOTAL   | TASK_MAIN| Integer | `COUNT(SELECT(TASK_CHECKLIST[ID], [TASK_ID] = [_THISROW].[ID]))` |
| CHECKLIST_DONE    | TASK_MAIN| Integer | `COUNT(SELECT(TASK_CHECKLIST[ID], AND([TASK_ID] = [_THISROW].[ID], [IS_DONE] = TRUE)))` |
| NEXT_ACTION_HINT  | TASK_MAIN| Text    | SWITCH expression above |
| CHECKLIST_HINT    | TASK_MAIN| Text    | IF expression above |
| OVERDUE_HINT      | TASK_MAIN| Text    | IF expression above |
| RESULT_NOTE_WARNING | TASK_MAIN| Text  | IF expression above |

---

## 6. Row Highlighting (Optional)

For TASK_LIST table:

**Row style / Background color:**
```
IF(
  AND(NOT(ISBLANK([DUE_DATE])), [DUE_DATE] < TODAY(), IN([STATUS], LIST("NEW", "ASSIGNED", "IN_PROGRESS", "WAITING"))),
  "Light red or orange",
  "Default"
)
```

**Note:** AppSheet row style may use different syntax; check AppSheet docs for conditional formatting.

---

## 7. SORT_PRIORITY Virtual Column

**Type:** Number (Virtual column)

**Expression:**
```
SWITCH(
  [STATUS],
  "IN_PROGRESS", 1000,
  "NEW",         2000,
  "WAITING",     3000,
  "ASSIGNED",    4000,
  "DONE",        8000,
  "CANCELLED",   9000,
  "ARCHIVED",    9900,
  9500
)
+
IF(
  AND(
    ISNOTBLANK([DUE_DATE]),
    IN([STATUS], LIST("NEW", "ASSIGNED", "IN_PROGRESS", "WAITING"))
  ),
  TOTALHOURS(TODAY() - [DUE_DATE]) / 24,
  0
)
```

**Purpose:** Sort key cho TASK_LIST view. Nhóm status theo weight (1000-9900), tiebreaker là DUE_DATE urgency (chỉ áp dụng cho active tasks).

**Sort config trong AppSheet View Options:**
1. SORT_PRIORITY → Ascending
2. DUE_DATE → Ascending

**Lưu ý:** IS_STARRED và IS_PINNED KHÔNG dùng trong View Options sort nữa. Thay vào đó dùng `40_STAR_PIN_SERVICE.js` để write IS_STARRED/IS_PINNED, và SORT_PRIORITY tự encode ưu tiên qua status weight.
