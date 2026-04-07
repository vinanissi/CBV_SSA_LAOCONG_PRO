# AUDIT REPORT — IS_STARRED / IS_PINNED (CBV)

**Ngày audit (repo):** static code review + checklist đối chiếu mã nguồn `05_GAS_RUNTIME/`.  
**Smoke test F1–F7:** chạy thủ công trong Google Apps Script Editor sau `clasp push`.

---

## PHẦN A — Schema (`90_BOOTSTRAP_SCHEMA.gs`)

| Check | Kết quả |
|-------|---------|
| TASK_MAIN: `IS_DELETED` → `IS_STARRED` → `IS_PINNED` → `PENDING_ACTION` | **PASS** |
| HO_SO_MASTER: sau `IS_DELETED` có `IS_STARRED`, `IS_PINNED` trước block PRO | **PASS** |
| FINANCE_TRANSACTION: `IS_DELETED` → `IS_STARRED` → `IS_PINNED` (cuối mảng) | **PASS** |
| Không sửa bảng khác ngoài 3 bảng trên (chỉ thêm 2 tên cột trong manifest) | **PASS** |
| Không có `IS_STARRED` / `IS_PINNED` trước `IS_DELETED` | **PASS** |

**Ghi chú:** `repairAddStarPinColumns()` **append cột ở cuối sheet**; thứ tự cột vật lý trên Google Sheet có thể khác thứ tự trong `CBV_SCHEMA_MANIFEST` cho HO_SO (đã biết từ thiết kế repair). Manifest vẫn đúng thứ tự logic: `IS_DELETED` → star → pin.

---

## PHẦN B — `40_STAR_PIN_SERVICE.gs`

| Check | Kết quả |
|-------|---------|
| File tồn tại | **PASS** |
| `STAR_PIN_ALLOWED_SHEETS` = 3 sheet qua `CBV_CONFIG.SHEETS.*` | **PASS** |
| `setStarred`, `setPinned`, `_assertStarPinAllowed` | **PASS** |
| Không có function khác (chỉ `var` + 3 function) | **PASS** |
| `_findById`, `_updateRow`, `_invalidateRowsCache`; không `getRange` trong service | **PASS** |
| NOT_FOUND → `{ ok: false, error: 'NOT_FOUND', id }` | **PASS** |
| `try/catch` → `{ ok: false, error }`; không throw ra caller | **PASS** |
| Không hardcode `'TASK_MAIN'` / `'HO_SO_MASTER'` / `'FINANCE_TRANSACTION'` trong setStar/setPin | **PASS** |
| `_assertStarPinAllowed`: `cbvAssert` + `sheetName` non-blank + message có tên sheet | **PASS** |

---

## PHẦN C — Repair (`90_BOOTSTRAP_REPAIR.gs`)

| Check | Kết quả |
|-------|---------|
| `repairAddStarPinColumns()` ở **cuối file** (sau `repairResidualInvalidRecords`) | **PASS** |
| 3 targets qua `CBV_CONFIG.SHEETS.*` | **PASS** |
| Idempotent: `headers.indexOf(col) !== -1` → skip | **PASS** |
| Backfill `false` khi `lastRow > 1` | **PASS** |
| `_invalidateRowsCache` sau khi thêm cột (khi `added.length > 0`) | **PASS** |
| Return `{ ok, appended, skipped, errors }` | **PASS** |
| try/catch theo sheet | **PASS** |
| Không `clear` / `deleteRows` / `deleteColumn` | **PASS** |

### `repairSchemaAndData()`

| Check | Kết quả |
|-------|---------|
| Gọi `repairAddStarPinColumns()` | **PASS** |
| Lỗi nối vào `combined.errors` | **PASS** |
| Logic repair cũ giữ nguyên | **PASS** |

---

## PHẦN D — Safety & GAS

| Check | Kết quả |
|-------|---------|
| `90_BOOTSTRAP_REPAIR.gs` parse, không import/export | **PASS** |
| `40_STAR_PIN_SERVICE.gs`: `var`, `function`, không async/Promise | **PASS** |

---

## PHẦN E — Dependency (`.clasp.json` `filePushOrder`)

| Check | Kết quả |
|-------|---------|
| `40_STAR_PIN_SERVICE.gs` sau `03_*` và `40_DISPLAY_MAPPING_SERVICE.gs`, trước `90_BOOTSTRAP_INIT` | **PASS** |

---

## PHẦN F — Smoke test (manual — Editor)

| Bước | Trạng thái |
|------|------------|
| F1–F2 `repairAddStarPinColumns` lần 1 / 2 | **Chạy trên spreadsheet thật** |
| F3 kiểm tra sheet | **Chạy trên spreadsheet thật** |
| F4–F6 `setStarred` | **Chạy trên spreadsheet thật** |
| F7 `repairSchemaAndData` | **Chạy trên spreadsheet thật** |

---

## PHẦN G — Tổng kết

| Phần | Kết quả |
|------|---------|
| A. Schema manifest | **PASS** (static) |
| B. Service file | **PASS** (static) |
| C. Repair function | **PASS** (static) |
| D. Safety check | **PASS** (static) |
| E. Dependency | **PASS** (static) |
| F. Smoke test | **PENDING** (chạy trong GAS sau deploy) |

**Deploy AppSheet:** chỉ sau khi F1–F7 PASS trên môi trường thật.

---

## Lỗi checklist “hay gặp” — trạng thái mã hiện tại

| Lỗi | Trạng thái |
|-----|------------|
| Backfill sai nhiều cột | **Đã fix:** `Sheet.getRange(r,c,nRows,nCols)` — dùng `getRange(2, nextCol, lastRow - 1, 1)` cho đúng **một cột** (không dùng `(2, nextCol, lastRow, nextCol)` vì tham số 3–4 là *số hàng / số cột*, không phải ô cuối) |
| Idempotent | **OK:** skip nếu header đã có |
| NOT_FOUND | **OK:** return trước `_updateRow` |
