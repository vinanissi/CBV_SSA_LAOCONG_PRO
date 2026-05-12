# PHASE DOCS-A — OPERATIONAL_DEPLOYMENT_AND_APPSHEET_RUNTIME_GUIDE — AI Handoff (Append-Only)

**Date:** 2026-05-12  
**Branch:** phase/from-v2.4.1-TASK-FIN  
**Reference:** CBV Operational Ecosystem Standard V1  
**Tag (recommended):** `v2.4.5-HOME-ALERT-DEPLOYMENT-DOCS`

---

## Phase purpose

Khép lại loạt Phase 80–84 (HOME_ALERT core runtime) bằng **bộ tài liệu triển khai thật** cho người
sử dụng / vận hành / quản trị. Không thêm core automation, không thay đổi schema, không sửa
runtime code, không thêm trigger, không AppSheet Bot. Phase này biến runtime đã có thành 1 hệ vận
hành có thể deploy ra production thật và có người trực tiếp sử dụng đúng cách.

## Docs created

| File | Audience chính |
|------|----------------|
| `docs/HOME_ALERT_DEPLOYMENT_DOCS_INDEX.md` | Tất cả (entry point) |
| `docs/appsheet/APPSHEET_HOME_ALERT_INSTALL_GUIDE.md` | Admin AppSheet |
| `docs/appsheet/APPSHEET_HOME_ALERT_FORMULA_REFERENCE.md` | Admin AppSheet |
| `docs/appsheet/README.md` | Admin AppSheet |
| `docs/training/HOME_ALERT_OPERATOR_MANUAL.md` | Operator |
| `docs/training/HOME_ALERT_SUPERVISOR_MANUAL.md` | Supervisor |
| `docs/training/README.md` | Operator + Supervisor |
| `docs/admin/HOME_ALERT_ADMIN_RUNTIME_OWNER_GUIDE.md` | Admin / Runtime Owner |
| `docs/admin/README.md` | Admin / Runtime Owner |
| `docs/operations/HOME_ALERT_OPERATIONAL_DEPLOYMENT_RUNBOOK.md` | Admin (+ Supervisor đối chiếu) |
| `docs/operations/README.md` | Admin |
| `00_SYSTEM_BRAIN/000_PROMPTS/012_PHASE_DOCS_A_OPERATIONAL_DEPLOYMENT_AND_APPSHEET_RUNTIME_GUIDE_PROMPT.md` | Brain (append-only) |
| `00_SYSTEM_BRAIN/000_REPORTS/012_PHASE_DOCS_A_OPERATIONAL_DEPLOYMENT_AND_APPSHEET_RUNTIME_GUIDE_REPORT.md` | Brain (append-only) |
| `00_SYSTEM_BRAIN/001_HANDOFF/012_PHASE_DOCS_A_OPERATIONAL_DEPLOYMENT_AND_APPSHEET_RUNTIME_GUIDE_HANDOFF.md` | Brain (file này) |

## Who should read what

| Vai trò | Đọc bắt buộc |
|--------|--------------|
| **Operator** | `docs/training/HOME_ALERT_OPERATOR_MANUAL.md` |
| **Supervisor / Team Lead** | Operator manual + `docs/training/HOME_ALERT_SUPERVISOR_MANUAL.md` |
| **Admin AppSheet** | `docs/appsheet/APPSHEET_HOME_ALERT_INSTALL_GUIDE.md` + `APPSHEET_HOME_ALERT_FORMULA_REFERENCE.md` + admin guide |
| **Admin / Runtime Owner GAS** | `docs/admin/HOME_ALERT_ADMIN_RUNTIME_OWNER_GUIDE.md` + `docs/operations/HOME_ALERT_OPERATIONAL_DEPLOYMENT_RUNBOOK.md` |
| **AI / Cursor (lần sau)** | File handoff này + 3 handoff Phase 82/83/84 |

Thứ tự đọc cho 1 đợt deploy mới: xem `docs/HOME_ALERT_DEPLOYMENT_DOCS_INDEX.md` §"Thứ tự đọc" và
§"Thứ tự triển khai".

## Deployment readiness

| Tiêu chí | Trạng thái sau DOCS-A |
|---------|------------------------|
| Runtime code | Đủ (Phase 82/83/84 đã đưa lên repo) |
| Schema manifest | Đủ (HOME_ALERT + 5 sheet phụ trợ) |
| Test console | Đủ (3 phase đều có) |
| Tài liệu admin / runtime owner | ✓ DOCS-A |
| Tài liệu AppSheet install + formula | ✓ DOCS-A |
| Tài liệu operator + supervisor | ✓ DOCS-A |
| Deployment runbook (pre-deploy → first-week) | ✓ DOCS-A |
| Phase 84 GO trên production thật | ⏳ Chờ admin chạy |
| Pilot operator | ⏳ Chờ rollout |
| Safe trigger bật / tắt theo phê duyệt | ⏳ Chờ ký |

## Remaining gaps

1. **Phase 84 production test** — chưa thực thi. Khi admin chạy `HomeAlertSafeAutomation_TestConsole_run()`
   trên prod, ghi kết quả vào file report mới (KHÔNG sửa file 011_* cũ).
2. **AppSheet end-to-end test** — DOCS-A chỉ là tài liệu. Khi admin apply trên app thật, cần ghi
   nhận:
   - User mapping (email vs USER_ID) đã chọn phương án nào.
   - Webhook GAS endpoint còn hoạt động không.
   - Pilot operator phản hồi gì.
3. **Acknowledged training** — chưa có cơ chế ghi nhận operator/supervisor đã đọc manual. Đề xuất:
   thêm 1 checklist riêng (Google Form / sheet riêng) — KHÔNG nhúng vào `HOME_ALERT` sheet.
4. **Multi-environment** — DOCS-A viết theo 1 spreadsheet bound. Nếu có sandbox + production, admin
   cần ghi 1 phụ lục riêng (tạo phase docs B sau).
5. **Báo cáo / notification channel** — Phase 84 cố tình không có notification thật. Nếu phát sinh
   nhu cầu, đó là phase riêng (notification design, vẫn read-only / opt-in).

## Next recommended phase

Ứng cử viên (sau khi DOCS-A đã pilot thật):

- **Phase DOCS-B** *(nếu cần)* — multi-environment guide + acknowledgement form.
- **Phase 85 candidate** *(KHÔNG thực hiện bây giờ)* — notification design, Queue Intelligence,
  AI suggestion engine. Cấm khởi động trước khi DOCS-A pilot hoàn tất + có yêu cầu chính thức.

## What AI / Cursor must not break next time

- **TASK_MAIN PRO baseline** (SHARED_WITH / IS_PRIVATE / security filter) — không liên quan trực
  tiếp DOCS-A nhưng vẫn là quy tắc nền (xem rule `task-main-pro-production-baseline`).
- **OPERATOR_* contract**:
  - `OPERATOR_PRIMARY_TEXT`, `OPERATOR_SECONDARY_TEXT`, `OPERATOR_META_TEXT`,
    `OPERATOR_NEXT_ACTION`, `OPERATOR_DASHBOARD_GROUP`, `OPERATOR_DASHBOARD_SORT` — không đổi tên,
    không bỏ, không thay bằng legacy `DISPLAY_*` / `CARD_*` / `UX_*` / `DESKTOP_*` trong operator
    deck.
- **Phase 82** SLA/escalation API + audit posture.
- **Phase 83** policy resolver / metrics — không xoá hàng lịch sử `HOME_ALERT_SLA_METRICS`.
- **Phase 84** safe automation:
  - KHÔNG mở rộng allowlist.
  - KHÔNG cài trigger từ bootstrap hoặc test console.
  - KHÔNG để `HomeAlert_detectStuckItems` chạy với `apply=true` từ automation runner.
  - Substring forbidden (`autoAssign`, `autoResolve`, `autoClose`, `autoEscalate`, `forceEscalate`,
    `delete`, `purge`, `destructive`) vẫn phải bị chặn.
- **Append-only brain artifacts:** KHÔNG overwrite các file prompt/report/handoff cũ (001–011).
  Tạo file mới với số thứ tự kế tiếp.
- **`.clasp.json` push order:** Giữ `80_HOME_ALERT_RUNTIME.js`, `81_HOME_ALERT_SLA_POLICY_RUNTIME.js`,
  `82_HOME_ALERT_SAFE_AUTOMATION_RUNTIME.js` sau `90_BOOTSTRAP_REPAIR.js`. Đừng xoá khỏi danh sách.
- **No destructive migration:** không xoá cột HOME_ALERT, không xoá hàng metrics / log / snapshot.
- **No fake GO:** mỗi phase mới phải dựa trên test console thật, không tự kết luận GO khi chưa chạy.
- **Tài liệu DOCS-A không phải runtime:** nếu cần sửa, hãy thêm phase docs mới (DOCS-B...) thay vì
  ghi đè DOCS-A. File hiện tại được coi là append-only baseline cho deployment.
