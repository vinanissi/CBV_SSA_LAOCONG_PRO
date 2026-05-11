# NEXT_PHASE_BACKLOG

Ưu tiên cho **CBV_SSA_LAOCONG_PRO** và hygiene workspace `D:\Workspace\projects`.

---

## P0 — Bắt buộc trước khi chạy thật / bàn giao

| ID | Việc | Ghi chú |
|----|------|---------|
| P0-1 | **Xoá PAT khỏi git remote** trên các máy clone; rotate token GitHub | Phát hiện từ inventory — rủi ro rò rỉ cao. |
| P0-2 | Xác nhận **scriptId** clasp đúng môi trường (dev/staging/prod) trước `clasp push` | Không có trong repo tài liệu này — CHƯA_XÁC_MINH từng sheet. |
| P0-3 | TASK OBS: đọc `docs/TASK_OBS_IMPLEMENTATION.md` + đối chiếu file `250_*`… trước merge | Tránh push runtime nửa chừng. |
| P0-4 | Sau mỗi đổi schema TASK_MAIN: checklist `04_APPSHEET/APPSHEET_READINESS_CHECKLIST.md` | Baseline production TASK. |

---

## P1 — Cải thiện vận hành

| ID | Việc | Ghi chú |
|----|------|---------|
| P1-1 | Giảm **drift** giữa `05_GAS_RUNTIME` và `apps-script/*/src` (quy trình copy hoặc build một chiều) | `MODULE_BOUNDARY.md` đã cảnh báo. |
| P1-2 | Chạy `tools/repo-audit/repo-audit.ps1` định kỳ; lưu báo cáo theo template | Add-only, không đụng dữ liệu. |
| P1-3 | Bổ sung `TEST_REPORT` thực tế (điền template `07_TEST/task_system_regression_report_template.md`) cho release | Hiện nhiều template chưa có bản điền. |

---

## P2 — Tối ưu / mở rộng

| ID | Việc | Ghi chú |
|----|------|---------|
| P2-1 | Gom repo LAB trùng đề tài dưới `projects` (không xóa — archive + README) | Chỉ khi có chủ trương; manual-first. |
| P2-2 | Contract API giữa **LAOCONG_VOS_PLATFORM** và GAS/Sheets | Kiến trúc liên repo — CHƯA_XÁC_MINH chi tiết. |
| P2-3 | `00_SYSTEM_BRAIN/phase-reports/` — lưu PHASE_REPORT theo chu kỳ | Thư mục đề xuất trong `REPO_DESIGN_RECOMMENDATION.md`. |
