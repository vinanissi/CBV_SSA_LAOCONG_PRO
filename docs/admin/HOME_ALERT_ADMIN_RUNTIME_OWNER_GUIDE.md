# HOME_ALERT — Admin / Runtime Owner Guide

**Audience:** Admin AppSheet + Runtime Owner GAS (người chịu trách nhiệm clasp / scriptId /
spreadsheet vận hành).  
**Phase reference:** DOCS-A (sau Phase 82/83/84).

> ⚠️ Mọi thao tác trong tài liệu này có khả năng phá vỡ dữ liệu vận hành thật nếu làm sai. Luôn
> **manual-first**, kiểm tra test console trước, **không cài AppSheet Bot**, không thêm trigger nếu
> chưa có ký phê duyệt rõ.

---

## 1. Vai trò admin / runtime owner

- Quản lý spreadsheet bound với HOME_ALERT runtime.
- Quản lý `scriptId` và `.clasp.json`.
- Push GAS (clasp push) sau khi review code.
- Chạy `HomeAlert_bootstrap()` sau migration / phase mới.
- Quản lý các bảng admin: `HOME_ALERT_SLA_POLICY`, `HOME_ALERT_AUTOMATION_CONFIG`.
- Cài / gỡ trigger safe automation (Phase 84) — **chỉ khi** có ký phê duyệt vận hành.
- Audit, recovery, rollback.
- Owner của các tài liệu trong `docs/` (không phải operator/supervisor).

---

## 2. Deploy GAS (clasp push)

### 2.1 Kiểm tra `.clasp.json`

- File: `D:\Workspace\projects\CBV_SSA_LAOCONG_PRO\.clasp.json`.
- Trường bắt buộc:
  - `scriptId`: KHÔNG đổi trừ khi tạo môi trường mới.
  - `rootDir`: `05_GAS_RUNTIME`.
  - `filePushOrder`: phải chứa, theo đúng thứ tự:
    - `80_HOME_ALERT_RUNTIME.js`
    - `81_HOME_ALERT_SLA_POLICY_RUNTIME.js`
    - `82_HOME_ALERT_SAFE_AUTOMATION_RUNTIME.js`
  - Đặt **sau** `90_BOOTSTRAP_REPAIR.js` (đã chốt từ Phase 83).
- Nếu thiếu → bổ sung trước khi push (đã có tiền lệ Phase 83 sửa `.clasp.json`).

### 2.2 Push

```
clasp push
```

- Kỳ vọng: không có lỗi syntax, không thiếu file trong push order.
- Sau push, kiểm tra Apps Script editor có đủ file `80_*`, `81_*`, `82_*`.

### 2.3 Kiểm tra `scriptId`

- Mở spreadsheet → Extensions → Apps Script. Script ID phải khớp `.clasp.json`.
- Nếu sai → KHÔNG push tiếp; xác minh đúng môi trường (sandbox vs production).

---

## 3. Bootstrap

Sau mỗi lần đổi schema (Phase 82/83/84) hoặc khi cài lần đầu:

```js
HomeAlert_bootstrap();
```

Việc bootstrap (xem `05_GAS_RUNTIME/80_HOME_ALERT_RUNTIME.js`):

- Bảo đảm header manifest cho `HOME_ALERT` đủ cột.
- `HomeAlertSlaPolicy_ensureSheet_` + seed (Phase 83).
- `HomeAlertSlaMetrics_ensureSheet_`.
- `HomeAlertSafeAutomation_ensureSheets_` + `HomeAlertSafeAutomation_seedDefaults` (Phase 84).
- `HomeAlertDailyOperationalSnapshot_ensureSheet_`.
- **KHÔNG** cài trigger (Phase 84 cấm install từ bootstrap).

Quy tắc:
- Append-only: không xoá header cũ. Nếu bootstrap warning vì cột thiếu → kiểm tra manifest schema.
- Sau bootstrap: chạy `HomeAlertUx_TestConsole_run` để xác minh không vi phạm operator contract.

---

## 4. Test console (manual)

Mở Apps Script editor → chạy từng test console (hoặc qua menu `🧪 CBV Test Console`):

| Phase | Function | Kỳ vọng |
|-------|----------|---------|
| 82 | `HomeAlertSlaEscalation_TestConsole_run()` | ≥ GO_WITH_WARNINGS |
| 83 | `HomeAlertSlaPolicy_TestConsole_run()` | GO (đã GO trên prod) |
| 84 | `HomeAlertSafeAutomation_TestConsole_run()` | GO hoặc GO_WITH_WARNINGS có giải thích |

Sau khi chạy, dùng `*_showReport()` / `*_copyAiHandoff()` để lưu output cho phase log.

Báo cáo: cập nhật `00_SYSTEM_BRAIN/000_REPORTS/*` cho phase tương ứng (append-only — không sửa lịch sử).

---

## 5. Safe automation (Phase 84)

### 5.1 Cài trigger

Chỉ chạy khi:
- Phase 84 test console = GO trên môi trường thật.
- Có ký phê duyệt vận hành (Supervisor + Admin).
- Đã giải thích cho team rằng cron chỉ chạy `HomeAlertSafeAutomation_runDue` (KHÔNG auto-assign /
  resolve / escalate).

Chạy:

```js
HomeAlertSafeAutomation_installSafeTriggers();
```

Kết quả: 1 clock trigger (mặc định 10 phút) gọi `HomeAlertSafeAutomation_runDue`. Trigger này đọc
`HOME_ALERT_AUTOMATION_CONFIG` để biết nên run cái gì + bao lâu.

### 5.2 Gỡ trigger

Khi cần dừng (sự cố, đổi môi trường, audit):

```js
HomeAlertSafeAutomation_removeSafeTriggers();
```

Sau gỡ: chạy lại test console để xác nhận `runDue` không còn trigger.

### 5.3 Run thủ công

Manual: `HomeAlertSafeAutomation_runDue()` chạy 1 lần đúng các automation due.  
Đơn lẻ: `HomeAlertSafeAutomation_runOne('HOME_ALERT_REFRESH')` (hoặc code khác trong allowlist).

Allowlist (Phase 84, **không mở rộng** nếu không có phase mới):

- `HomeAlert_refresh`
- `HomeAlertSlaMetrics_refresh`
- `HomeAlert_detectStuckItems` (luôn forced `apply: false` từ runner)
- `HomeAlertDailyOperationalSnapshot_generate`
- `HomeAlertSafeAutomation_healthCheck`

---

## 6. Khi nào được bật trigger

- Phase 84 đã GO trên môi trường production.
- Supervisor + Admin xác nhận team đã hiểu cron.
- `HOME_ALERT_AUTOMATION_CONFIG` đã được rà soát: `ALLOW_TRIGGER_INSTALL` của các config cần
  schedule = TRUE, `SAFE_MODE` = TRUE, `ENABLED` = TRUE, function nằm trong allowlist.
- Không có lệnh tạm dừng vận hành (sự cố, audit nội bộ).

---

## 7. Khi nào phải tắt trigger

- Có sự cố vận hành (alert sai hàng loạt, BREACHED bất thường, snapshot ghi rỗng).
- Đang migration / đổi spreadsheet.
- Đang audit nội bộ (cần giữ state đứng yên).
- `HOME_ALERT_AUTOMATION_RUN_LOG` ghi FAIL nhiều lần cho 1 `AUTOMATION_CODE`.
- AppSheet đang test thay đổi UX lớn (tránh xung đột với operator).

---

## 8. Rollback thủ công

Quy tắc: **No destructive migration**. Rollback bằng cách:

1. Tắt trigger bằng `HomeAlertSafeAutomation_removeSafeTriggers()`.
2. Trong `HOME_ALERT_AUTOMATION_CONFIG`, set `ENABLED = FALSE` cho automation lỗi.
3. Nếu cần rollback code:
   - `git revert <commit>` (KHÔNG `git reset --hard` trên branch production).
   - `clasp push` lại.
   - Bootstrap nếu cần.
4. Nếu đã ghi sai vào `HOME_ALERT` (do operator hoặc automation):
   - KHÔNG xoá hàng. Dùng action GAS (`HomeAlert_resolveAlert` / `markBlocked` / `markWaiting`) để
     correct status + ghi note "manual correction".
   - Audit qua `logAdminAudit` đã có sẵn trong runtime.

---

## 9. Recovery khi sheet lỗi

Tình huống thường gặp:

| Triệu chứng | Nguyên nhân có thể | Hành động |
|-------------|--------------------|-----------|
| Sheet `HOME_ALERT` thiếu cột | Quên bootstrap | `HomeAlert_bootstrap()` |
| Header đổi tên ngẫu nhiên | User edit nhầm sheet | Đổi tên lại đúng manifest; chạy bootstrap |
| `HOME_ALERT_SLA_POLICY` mất hàng default | Bị xoá thủ công | Chạy `HomeAlertSlaPolicy_seedDefaults()` |
| `HOME_ALERT_AUTOMATION_CONFIG` mất hàng | Bị xoá thủ công | Chạy `HomeAlertSafeAutomation_seedDefaults` |
| Số liệu metrics không cập nhật | `HomeAlertSlaMetrics_refresh` lỗi | Đọc `HOME_ALERT_AUTOMATION_RUN_LOG` lọc `AUTOMATION_CODE = SLA_METRICS_REFRESH` |
| Daily snapshot trùng ngày | Bị duplicate `SNAPSHOT_DATE` | KHÔNG xoá; chạy `HomeAlertDailyOperationalSnapshot_generate()` để upsert lại |

Nguyên tắc: **không xoá hàng lịch sử**. Mọi hàng metrics/log/snapshot là dấu vết.

---

## 10. Recovery khi AppSheet lỗi

| Triệu chứng | Hành động |
|-------------|-----------|
| Deck hiển thị sai trường (thấy DISPLAY_/DESKTOP_) | Mở AppSheet editor → Views → đổi binding sang `OPERATOR_*` (xem `APPSHEET_HOME_ALERT_INSTALL_GUIDE.md` §8) |
| Slice trả 0 hàng | Test formula tách rời (Editor → Data → Slices → "Test"); so với `APPSHEET_HOME_ALERT_FORMULA_REFERENCE.md` |
| Security filter chặn cả admin | Tạm sửa filter → `OR(USERROLE() = "Admin", ...)`; deploy thử |
| Action không gọi GAS | Kiểm tra webhook URL còn sống không (`99_APPSHEET_WEBHOOK.js`); kiểm tra `Authorization` header / token |
| App có Bot bị bật | Vào Automation → Disable mọi Bot/Process; phase này CẤM bot |
| App ghi sai data | Đổi mode bảng sang "Updates only" / "Read-only" và rà soát Edit form |

Nếu AppSheet bị rối → tạo bản copy (Editor → Manage → Author → Copy App) để test, không sửa trực
tiếp app vận hành.

---

## 11. Audit / report / handoff

Mỗi phase phải để lại 3 file (append-only):

- `00_SYSTEM_BRAIN/000_PROMPTS/NNN_*.md`
- `00_SYSTEM_BRAIN/000_REPORTS/NNN_*.md`
- `00_SYSTEM_BRAIN/001_HANDOFF/NNN_*.md`

Quy tắc:

- KHÔNG overwrite file cũ.
- Số thứ tự tăng dần theo phase.
- Mỗi report bắt buộc có: FILES CREATED, FILES UPDATED, WARNINGS, ERRORS, NEXT STEP, PRODUCTION
  READINESS, AI HANDOFF SUMMARY, GIT STATUS.
- Audit hành động vận hành lớn (escalation thật, policy change, trigger install/remove): ghi vào
  `ADMIN_AUDIT` qua `logAdminAudit(...)` đã có trong runtime.

---

## 12. Không được làm

- ❌ Auto assign (mọi assignment phải do người bấm `Claim` / `Assign`).
- ❌ Auto resolve (kể cả khi nguồn đã hết, runtime chỉ auto-clear theo `IS_ACTIVE` flag, không tự
  ghi `RESOLVED` cho alert đã được người vận hành nhận).
- ❌ Auto close hàng loạt.
- ❌ Auto escalation thật (chỉ `suggestEscalations` để gợi ý; quyết định đẩy do người).
- ❌ AppSheet Bot, Event-driven Bot, Process, Task.
- ❌ Destructive migration (xoá cột/hàng cũ, đổi tên cột vận hành mà không có phase migration
  riêng).
- ❌ Mở rộng allowlist Phase 84 thêm function "auto*" hoặc "force*".
- ❌ Sửa `OPERATOR_*` contract (đổi tên, gộp, bỏ) nếu không có phase UX riêng.
- ❌ Chia sẻ `scriptId` của production cho môi trường khác.

---

## 13. Tham chiếu nhanh

| Cần làm | Function / file |
|---------|-----------------|
| Cài đặt schema | `HomeAlert_bootstrap()` |
| Refresh alert | `HomeAlert_refresh()` |
| SLA enrichment | tự động trong `HomeAlert_enrichDesktopUxFields_` |
| SLA policy CRUD | `HomeAlertSlaPolicy_upsertPolicy`, `_deactivatePolicy`, `_listActivePolicies` |
| Recompute SLA | `HomeAlertSlaPolicy_recomputeAllAlerts()` |
| Metrics | `HomeAlertSlaMetrics_refresh()` |
| Daily snapshot | `HomeAlertDailyOperationalSnapshot_generate()` |
| Safe automation list | `HomeAlertSafeAutomation_listConfigs()` |
| Safe automation run one | `HomeAlertSafeAutomation_runOne(CODE)` |
| Safe automation run due | `HomeAlertSafeAutomation_runDue()` |
| Safe automation install trigger | `HomeAlertSafeAutomation_installSafeTriggers()` (có điều kiện) |
| Safe automation remove trigger | `HomeAlertSafeAutomation_removeSafeTriggers()` |
| Validate forbidden config | `HomeAlertSafeAutomation_validateNoForbiddenAutomation_()` |

Mã nguồn: `05_GAS_RUNTIME/80_HOME_ALERT_RUNTIME.js`,
`05_GAS_RUNTIME/81_HOME_ALERT_SLA_POLICY_RUNTIME.js`,
`05_GAS_RUNTIME/82_HOME_ALERT_SAFE_AUTOMATION_RUNTIME.js`.
