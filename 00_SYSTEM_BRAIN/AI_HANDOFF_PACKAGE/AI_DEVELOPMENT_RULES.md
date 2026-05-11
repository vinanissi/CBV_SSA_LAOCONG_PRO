# AI_DEVELOPMENT_RULES

Áp dụng khi AI hoặc kỹ sư chỉnh sửa repo `CBV_SSA_LAOCONG_PRO` và repo anh em CBV.

---

## 1. Quy tắc code

| # | Quy tắc |
|---|---------|
| 1 | File GAS: `NN_MODULE_ROLE.js`; hàm public: prefix module `hoso*`, `task*`, `finance*`, `cbv*`, … (chi tiết: `.cursor/rules/cbv-naming-conventions.mdc`, `00_OVERVIEW/NAMING_CONVENTIONS.md`). |
| 2 | Response chuẩn: `cbvResponse(ok, code, message, data, errors)` với `code` UPPER_SNAKE. |
| 3 | Không trộn `HoSo` / `Hoso` trong identifier; schema sheet giữ `HO_SO`. |
| 4 | Thay đổi schema: cập nhật manifest bootstrap + audit schema + field policy AppSheet tương ứng. |

---

## 2. Quy tắc test

| # | Quy tắc |
|---|---------|
| 1 | **Business runtime:** chỉ đổi hành vi sau khi có **TEST_REPORT** (menu smoke, `07_TEST`, hoặc checklist `09_AUDIT/`). |
| 2 | **Test runtime:** mock / `*TEST_MOCK*`, `99_DEBUG_*` — tách rõ khỏi luồng production menu nếu có thể. |
| 3 | Sau thay đổi TASK_MAIN liên quan visibility: chạy kịch bản security filter AppSheet (tài liệu `04_APPSHEET/`). |

---

## 3. Quy tắc đặt tên

- Const công khai: `MODULE_*` UPPER_SNAKE.
- Hàm private: hậu tố `_`.
- Không thêm deprecation wrapper HO_SO.

---

## 4. Quy tắc không phá production

| # | Quy tắc |
|---|---------|
| 1 | Không `clasp push` nhầm project; xác nhận `scriptId` trong `.clasp.json`. |
| 2 | Không xóa sheet / cột trên spreadsheet thật từ script trừ khi có runbook + backup. |
| 3 | Không force push git; không auto migrate DB thật. |
| 4 | Thay đổi runtime: ưu tiên **add-only** + rollback (feature flag, nhánh, copy sheet). |

---

## 5. Quy tắc tạo phase mới

1. Mở mục trong `NEXT_PHASE_BACKLOG.md` hoặc `09_AUDIT/*` tương ứng.
2. Ghi **PHASE_REPORT** khi chốt: mục tiêu, thay đổi file, rủi ro, rollback.
3. Nếu đụng contract AppSheet / webhook: cập nhật bảng binding trong `04_APPSHEET/`.

---

## 6. Quy tắc báo cáo sau mỗi lần sửa

- Cập nhật `CHANGELOG.md` hoặc `PHASE_REPORT.md` (hoặc file audit trong `09_AUDIT/`) với: **ngày**, **phạm vi**, **file chính**, **cách kiểm chứng**, **rủi ro còn lại**.
- Nếu chỉ tài liệu: ghi một dòng vào CHANGELOG repo hoặc `00_SYSTEM_BRAIN/phase-reports/` khi thư mục đó được tạo.
