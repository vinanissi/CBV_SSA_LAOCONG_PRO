# HOME_ALERT — Operational Deployment Runbook

**Audience:** Admin / Runtime Owner triển khai HOME_ALERT lên production thật.  
**Phase reference:** DOCS-A.  
**Tag baseline khuyến nghị:** `v2.4.4-HOME-ALERT-SAFE-AUTOMATION` (Phase 82 GO_WITH_WARNINGS, Phase
83 GO, Phase 84 chờ test prod).

> Đọc trước:
> - `docs/admin/HOME_ALERT_ADMIN_RUNTIME_OWNER_GUIDE.md`
> - `docs/appsheet/APPSHEET_HOME_ALERT_INSTALL_GUIDE.md`
> - `docs/training/HOME_ALERT_OPERATOR_MANUAL.md`
> - `docs/training/HOME_ALERT_SUPERVISOR_MANUAL.md`

---

## 1. Pre-deployment checklist

- [ ] Có lệnh / phê duyệt vận hành (text/email) đồng ý go-live.
- [ ] Đã xác định môi trường production (Google Sheet ID + AppSheet App ID).
- [ ] Đã có ≥ 1 supervisor + ≥ 1 admin chịu trách nhiệm theo dõi tuần đầu.
- [ ] Đã có ≥ 1 operator pilot và backup.
- [ ] Đã set lịch họp daily 5 phút trong tuần đầu go-live.
- [ ] Đã backup spreadsheet (File → Make a copy) trước khi push code mới.

---

## 2. Git state checklist

- [ ] `git status` clean trên branch `phase/from-v2.4.1-TASK-FIN` (hoặc branch release tương đương).
- [ ] `git log` cho thấy ít nhất các commit phase:
   - Phase 82 (`9cab275`)
   - Phase 83 (`5c0b67c`)
   - Phase 84 (`23f0ad9`)
- [ ] Tag tương ứng đã tồn tại:
   - `v2.4.2-HOME-ALERT-SLA-ESCALATION`
   - `v2.4.3-HOME-ALERT-SLA-POLICY`
   - `v2.4.4-HOME-ALERT-SAFE-AUTOMATION`
- [ ] DOCS-A đã merged hoặc đang trên branch deploy.
- [ ] Nếu deploy từ branch không phải `main` / `master`: ghi rõ branch trong handoff.

---

## 3. GAS deploy checklist

- [ ] `.clasp.json` đúng `scriptId` cho môi trường target.
- [ ] `filePushOrder` chứa `80_HOME_ALERT_RUNTIME.js`, `81_HOME_ALERT_SLA_POLICY_RUNTIME.js`,
      `82_HOME_ALERT_SAFE_AUTOMATION_RUNTIME.js` sau `90_BOOTSTRAP_REPAIR.js`.
- [ ] `clasp push` không lỗi.
- [ ] Apps Script editor (Extensions → Apps Script) hiển thị đủ 3 file trên.
- [ ] Menu `🧪 CBV Test Console` xuất hiện sau khi mở lại spreadsheet (`onOpen`).

---

## 4. Bootstrap checklist

Chạy 1 lần trong Apps Script editor (`Run` → `HomeAlert_bootstrap`):

- [ ] Không có exception.
- [ ] Sheets sau tồn tại với header manifest đúng:
   - `HOME_ALERT`
   - `HOME_ALERT_SLA_POLICY` + seed default (≥ 5 hàng)
   - `HOME_ALERT_SLA_METRICS` (có thể trống)
   - `HOME_ALERT_AUTOMATION_CONFIG` + seed default (≥ 5 hàng, mọi hàng `SAFE_MODE=TRUE`,
     `ALLOW_TRIGGER_INSTALL=FALSE`)
   - `HOME_ALERT_AUTOMATION_RUN_LOG`
   - `HOME_ALERT_DAILY_SNAPSHOT`
   - `HOME_ALERT_WORKLOAD`
- [ ] `ADMIN_AUDIT` ghi 1 record `HOME_ALERT_BOOTSTRAP`.

---

## 5. AppSheet setup checklist

Theo `APPSHEET_HOME_ALERT_INSTALL_GUIDE.md`:

- [ ] Add 6 bảng (+ `TASK_MAIN` nếu cần link).
- [ ] Set key column đúng.
- [ ] Tạo 9 slice.
- [ ] Tạo 9 view; deck operator group/sort theo `OPERATOR_DASHBOARD_GROUP`/`OPERATOR_DASHBOARD_SORT`.
- [ ] Bind `OPERATOR_PRIMARY_TEXT`/`OPERATOR_SECONDARY_TEXT`/`OPERATOR_META_TEXT`/`OPERATOR_NEXT_ACTION`
      cho deck/detail.
- [ ] 6 format rule active.
- [ ] 8 action active, đều gọi GAS webhook (KHÔNG bot).
- [ ] Security filter active trên `HOME_ALERT` + admin tables.
- [ ] Verify bằng 3 user thật: 1 operator, 1 supervisor, 1 admin → mỗi role thấy đúng phạm vi.

---

## 6. Test console checklist

Trong Apps Script editor:

- [ ] `HomeAlertSlaEscalation_TestConsole_run()` → severity ≤ GO_WITH_WARNINGS, không FAIL.
- [ ] `HomeAlertSlaPolicy_TestConsole_run()` → GO.
- [ ] `HomeAlertSafeAutomation_TestConsole_run()` → GO hoặc GO_WITH_WARNINGS có giải thích.
- [ ] Lưu output (text + json) làm bằng chứng test:
   - Đính kèm vào báo cáo deploy.
   - Hoặc copy vào ghi chú trong `00_SYSTEM_BRAIN/000_REPORTS/`.

Không "fake GO": nếu test FAIL → dừng deploy, fix trước.

---

## 7. Pilot rollout checklist

- [ ] Chọn 1 nhóm 2–3 operator pilot.
- [ ] Pilot dùng AppSheet HOME_ALERT trên thiết bị thật (mobile + desktop) 1–2 ngày.
- [ ] Pilot ghi nhận:
   - Đúng alert vào My Queue không?
   - `OPERATOR_PRIMARY_TEXT` / `_NEXT_ACTION` đọc được không?
   - Format rule SLA_BREACHED / OVERDUE / DUE_SOON đúng màu không?
   - Action Claim/Resolve/Mark Waiting/Block/Escalate gọi GAS thành công không?
- [ ] Pilot phản hồi → admin fix nhỏ nếu cần (không phá schema; chỉ chỉnh AppSheet config).
- [ ] Pilot OK → mở rộng cho cả team.

---

## 8. Training checklist

- [ ] Mỗi operator đọc `HOME_ALERT_OPERATOR_MANUAL.md` (signed/ack).
- [ ] Mỗi supervisor đọc `HOME_ALERT_SUPERVISOR_MANUAL.md`.
- [ ] Admin đọc `HOME_ALERT_ADMIN_RUNTIME_OWNER_GUIDE.md` + runbook này.
- [ ] Có 1 buổi demo 30–45' cho operator (live demo trên app).
- [ ] Operator hiểu rõ Khi nào Claim / Mark Waiting / Block / Resolve / Escalate.
- [ ] Operator biết quy trình cuối ngày + checklist 5'.

---

## 9. Go-live checklist

Ngày go-live:

- [ ] Admin chạy `HomeAlert_refresh()` 1 lần để có alert thật.
- [ ] Admin chạy `HomeAlertSlaMetrics_refresh()`.
- [ ] Admin chạy `HomeAlertDailyOperationalSnapshot_generate()`.
- [ ] Supervisor mở `HOME_ALERT_OPERATOR_DASHBOARD` → xác nhận count hợp lý.
- [ ] Operator đăng nhập, kiểm tra `My Queue` (kể cả trường hợp 0 alert).
- [ ] Trigger safe automation **vẫn TẮT** trong ngày đầu (manual-first).
- [ ] Họp 5 phút cuối ngày: tổng kết, ghi vấn đề (nếu có) vào ghi chú deploy.

---

## 10. First-week monitoring checklist

Mỗi ngày trong 7 ngày đầu:

- [ ] Admin chạy `HomeAlert_refresh()` 2–3 lần (sáng / trưa / cuối ngày), manual.
- [ ] Admin chạy `HomeAlertSlaMetrics_refresh()` 1 lần mỗi sáng và cuối ngày.
- [ ] Admin chạy `HomeAlertDailyOperationalSnapshot_generate()` cuối ngày.
- [ ] Supervisor review snapshot mỗi sáng (snapshot hôm trước).
- [ ] Kiểm tra `HOME_ALERT_AUTOMATION_RUN_LOG` rỗng (vì chưa bật trigger) — bình thường.
- [ ] Daily 5' meeting: số alert active, BREACHED, escalation mới.
- [ ] Cuối tuần: cân nhắc bật trigger nếu đã quen quy trình + Phase 84 GO trên thật (xem
      `HOME_ALERT_ADMIN_RUNTIME_OWNER_GUIDE.md` §6).

Khi bật trigger:

- [ ] Có ký phê duyệt (Supervisor + Admin).
- [ ] Chạy `HomeAlertSafeAutomation_installSafeTriggers()`.
- [ ] Kiểm tra `ScriptApp.getProjectTriggers()` đúng 1 trigger `HomeAlertSafeAutomation_runDue`.
- [ ] Theo dõi `HOME_ALERT_AUTOMATION_RUN_LOG` 2 chu kỳ đầu — đảm bảo `STATUS = OK` cho các code
      đã ENABLED.

---

## 11. Rollback checklist

Khi xảy ra sự cố vận hành (alert sai hàng loạt, format hỏng, GAS lỗi):

- [ ] Tắt trigger ngay: `HomeAlertSafeAutomation_removeSafeTriggers()`.
- [ ] Set `ENABLED = FALSE` cho automation lỗi trong `HOME_ALERT_AUTOMATION_CONFIG`.
- [ ] Thông báo team operator dừng action liên quan.
- [ ] Nếu lỗi từ AppSheet → mở backup app copy (xem
      `HOME_ALERT_ADMIN_RUNTIME_OWNER_GUIDE.md` §10).
- [ ] Nếu lỗi từ code → `git revert` commit nghi vấn → `clasp push` → bootstrap.
- [ ] Nếu lỗi từ sheet → KHÔNG xoá hàng; correct status qua action GAS; ghi note "manual correction".
- [ ] Sau khi ổn định: ghi sự cố vào `00_SYSTEM_BRAIN/000_REPORTS/` (file mới — append-only).

---

## 12. Acceptance criteria

Deploy được coi là **chấp nhận** khi đồng thời:

- [ ] Phase 82 test ≥ GO_WITH_WARNINGS trên production.
- [ ] Phase 83 test = GO trên production.
- [ ] Phase 84 test = GO hoặc GO_WITH_WARNINGS có giải thích (kèm bằng chứng).
- [ ] AppSheet operator dashboard usable: deck đúng `OPERATOR_*`, format rule đúng SLA, action gọi
      GAS thành công.
- [ ] Ít nhất 1 operator pilot test thành công (claim → mark waiting → resolve 1 alert thật, hoặc
      đối với alert giả test).
- [ ] Báo cáo deploy (file mới trong `00_SYSTEM_BRAIN/000_REPORTS/`) đã ghi: kết quả test, ai làm
      pilot, kết quả pilot, trạng thái trigger.

Nếu thiếu bất kỳ tiêu chí nào → KHÔNG đánh dấu GO; ghi GO_WITH_WARNINGS + danh sách thiếu.
