# PHASE DOCS-A — OPERATIONAL_DEPLOYMENT_AND_APPSHEET_RUNTIME_GUIDE — Report (Append-Only)

**Date:** 2026-05-12  
**Branch:** phase/from-v2.4.1-TASK-FIN  
**Reference:** CBV Operational Ecosystem Standard V1  
**Tag (recommended):** `v2.4.5-HOME-ALERT-DEPLOYMENT-DOCS`  
**Phase scope:** Documentation only. KHÔNG sửa runtime code, KHÔNG đổi schema, KHÔNG đổi `.clasp.json`,
KHÔNG thêm trigger, KHÔNG AppSheet Bot.

---

## FILES CREATED

| Path | Mục đích |
|------|----------|
| `00_SYSTEM_BRAIN/000_PROMPTS/012_PHASE_DOCS_A_OPERATIONAL_DEPLOYMENT_AND_APPSHEET_RUNTIME_GUIDE_PROMPT.md` | Prompt phase DOCS-A (append-only) |
| `00_SYSTEM_BRAIN/000_REPORTS/012_PHASE_DOCS_A_OPERATIONAL_DEPLOYMENT_AND_APPSHEET_RUNTIME_GUIDE_REPORT.md` | Report này |
| `00_SYSTEM_BRAIN/001_HANDOFF/012_PHASE_DOCS_A_OPERATIONAL_DEPLOYMENT_AND_APPSHEET_RUNTIME_GUIDE_HANDOFF.md` | AI handoff cho phase kế tiếp |
| `docs/HOME_ALERT_DEPLOYMENT_DOCS_INDEX.md` | Index tổng tài liệu deployment |
| `docs/appsheet/APPSHEET_HOME_ALERT_INSTALL_GUIDE.md` | Hướng dẫn cài AppSheet |
| `docs/appsheet/APPSHEET_HOME_ALERT_FORMULA_REFERENCE.md` | Reference công thức AppSheet |
| `docs/appsheet/README.md` | Index folder appsheet |
| `docs/training/HOME_ALERT_OPERATOR_MANUAL.md` | Manual cho operator |
| `docs/training/HOME_ALERT_SUPERVISOR_MANUAL.md` | Manual cho supervisor |
| `docs/training/README.md` | Index folder training |
| `docs/admin/HOME_ALERT_ADMIN_RUNTIME_OWNER_GUIDE.md` | Guide cho admin / runtime owner |
| `docs/admin/README.md` | Index folder admin |
| `docs/operations/HOME_ALERT_OPERATIONAL_DEPLOYMENT_RUNBOOK.md` | Runbook deploy thật |
| `docs/operations/README.md` | Index folder operations |

Tổng: **14 file** (3 brain artifact + 1 index chính + 6 tài liệu chính + 4 README folder).

## FILES UPDATED

Không. DOCS-A KHÔNG cập nhật file runtime nào. KHÔNG chạm `.clasp.json`, KHÔNG chạm
`05_GAS_RUNTIME/*`, KHÔNG chạm `00_SYSTEM_BRAIN/*` cũ.

## DOC COVERAGE

| Vùng | File | Trạng thái |
|------|------|-----------|
| AppSheet install | `docs/appsheet/APPSHEET_HOME_ALERT_INSTALL_GUIDE.md` | ✓ 14 mục theo prompt (mục tiêu → checklist) |
| AppSheet formula | `docs/appsheet/APPSHEET_HOME_ALERT_FORMULA_REFERENCE.md` | ✓ slice / format / security / show_if / sort / locale / anti-pattern |
| Operator training | `docs/training/HOME_ALERT_OPERATOR_MANUAL.md` | ✓ 14 mục theo prompt |
| Supervisor training | `docs/training/HOME_ALERT_SUPERVISOR_MANUAL.md` | ✓ 11 mục theo prompt |
| Admin / runtime owner | `docs/admin/HOME_ALERT_ADMIN_RUNTIME_OWNER_GUIDE.md` | ✓ 12 mục theo prompt + tham chiếu nhanh |
| Deployment runbook | `docs/operations/HOME_ALERT_OPERATIONAL_DEPLOYMENT_RUNBOOK.md` | ✓ 12 mục checklist + acceptance |
| Index tổng | `docs/HOME_ALERT_DEPLOYMENT_DOCS_INDEX.md` | ✓ ai đọc gì / thứ tự đọc / thứ tự deploy / trạng thái |
| Index folder | 4× `README.md` | ✓ |

## APPSHEET SETUP COVERAGE

| Hạng mục yêu cầu prompt | Có trong docs |
|-------------------------|---------------|
| Mục tiêu app | INSTALL §1 |
| Source spreadsheet | INSTALL §2 |
| Tables cần add | INSTALL §3 |
| Column role/type | INSTALL §4 |
| Key columns | INSTALL §5 |
| Slices (9 slice) | INSTALL §6 + FORMULA §1 |
| Views (9 view) | INSTALL §7 + FORMULA §5 |
| Operator display mapping | INSTALL §8 + FORMULA §6 |
| Cấm legacy DISPLAY_*/CARD_*/UX_*/DESKTOP_* | INSTALL §9 + FORMULA §8 |
| Format rules (6 rule) | INSTALL §10 + FORMULA §2 |
| Actions (8 action) | INSTALL §11 + FORMULA §4 |
| Action policy (GAS, no Bot) | INSTALL §12 |
| Security filters | INSTALL §13 + FORMULA §3 |
| Checklist sau khi cài | INSTALL §14 |
| Locale note (Sheets `;` vs AppSheet `,`) | FORMULA §7 |

## TRAINING COVERAGE

| Hạng mục | Operator manual | Supervisor manual |
|---------|-----------------|-------------------|
| HOME_ALERT là gì | §1 | — |
| Queue là gì | §2 | — |
| My / Unassigned / Escalated / Blocked | §3 | §2 |
| SLA (ON_TRACK / DUE_SOON / OVERDUE / BREACHED) | §4 | §5 |
| Hành động hàng ngày | §5 | §2 |
| Claim / Mark Waiting / Block / Resolve / Escalate | §6–§10 | §3–§6 |
| Cấm | §11 | §10 |
| Cuối ngày | §12 | §11 |
| Checklist 5' đầu/cuối | §13–§14 | §11 |
| Daily snapshot | — | §7 |
| Policy adjustment | — | §8 |
| Khi nào can thiệp thủ công / báo admin | — | §9–§10 |

## ADMIN / RUNTIME COVERAGE

| Hạng mục | Section |
|---------|---------|
| Vai trò | ADMIN GUIDE §1 |
| Deploy GAS (clasp push, .clasp.json, scriptId) | §2 |
| Bootstrap (HomeAlert_bootstrap) | §3 |
| Test console (Phase 82/83/84) | §4 |
| Safe automation (install/remove/run) | §5 |
| Khi nào bật / tắt trigger | §6–§7 |
| Rollback thủ công | §8 |
| Recovery sheet | §9 |
| Recovery AppSheet | §10 |
| Audit / report / handoff | §11 |
| Cấm | §12 |
| Tham chiếu nhanh | §13 |

## WARNINGS

1. **Phase 84 chưa GO trên prod.** Phase 84 hiện đang chờ GAS runtime test thật trên môi trường
   production. DOCS-A đã đưa hướng dẫn nhưng cảnh báo trong `HOME_ALERT_OPERATIONAL_DEPLOYMENT_RUNBOOK.md` §12
   và `HOME_ALERT_ADMIN_RUNTIME_OWNER_GUIDE.md` §6 rằng chỉ bật trigger khi Phase 84 GO/GO_WITH_WARNINGS.
2. **Webhook GAS cho AppSheet action** dựa trên file đã có sẵn `05_GAS_RUNTIME/99_APPSHEET_WEBHOOK.js`.
   Admin cần kiểm tra endpoint còn hợp lệ với spreadsheet đích trước khi áp dụng action `Claim` /
   `Resolve` / v.v.
3. **User mapping email vs USER_ID.** `APPSHEET_HOME_ALERT_FORMULA_REFERENCE.md` §1 cho 2 phương án
   nhưng phụ thuộc cách bảng `USERS` của bạn lưu (email hay USER_ID). Admin chọn 1 phương án nhất quán.
4. **Tag `v2.4.5` đã tồn tại** trên repo (legacy, không phải HOME_ALERT). Tag DOCS-A đề nghị
   `v2.4.5-HOME-ALERT-DEPLOYMENT-DOCS` (khác suffix) — tránh conflict.
5. **Push có thể fail** nếu credential Git/HTTPS chưa cấu hình trên môi trường hiện tại. Ghi rõ
   trong mục GIT STATUS bên dưới.
6. **Không có hậu kiểm trên thiết bị thật** trong phase này. DOCS-A chỉ là tài liệu — admin phải
   tự xác minh các bước trong `HOME_ALERT_OPERATIONAL_DEPLOYMENT_RUNBOOK.md` khi deploy.

## ERRORS

Không. KHÔNG có lỗi syntax / lỗi build (phase docs-only).

## NEXT STEP

1. **Admin / Runtime Owner** đọc `docs/admin/HOME_ALERT_ADMIN_RUNTIME_OWNER_GUIDE.md`.
2. **Admin AppSheet** đọc `docs/appsheet/APPSHEET_HOME_ALERT_INSTALL_GUIDE.md` +
   `APPSHEET_HOME_ALERT_FORMULA_REFERENCE.md`, áp dụng từng bước.
3. **Admin** chạy `HomeAlertSafeAutomation_TestConsole_run()` trên production để chốt Phase 84
   GO / GO_WITH_WARNINGS thật, đính kèm output vào report deploy mới.
4. **Supervisor** đọc `docs/training/HOME_ALERT_SUPERVISOR_MANUAL.md` + train operator theo
   `HOME_ALERT_OPERATOR_MANUAL.md`.
5. Theo `docs/operations/HOME_ALERT_OPERATIONAL_DEPLOYMENT_RUNBOOK.md`:
   - Hoàn tất pre-deploy checklist (§1–§2).
   - Push GAS + bootstrap (§3–§4).
   - Pilot 1–2 operator (§7).
   - Go-live + first-week monitoring (§9–§10).
   - Cân nhắc bật safe trigger sau khi Phase 84 GO + ký phê duyệt (§10 + admin guide §5–§6).

## PRODUCTION READINESS

| Tiêu chí acceptance (theo prompt) | Trạng thái |
|----------------------------------|-----------|
| Phase 82 test ≥ GO_WITH_WARNINGS | ✅ Đã đạt trên GAS (Phase 82 report) |
| Phase 83 test = GO | ✅ Đã đạt trên GAS (Phase 83 report) |
| Phase 84 test = GO / GO_WITH_WARNINGS có giải thích | ⏳ Chờ admin chạy trên prod |
| AppSheet operator dashboard usable | ⏳ Chờ admin áp dụng INSTALL guide |
| Ít nhất 1 operator pilot test thành công | ⏳ Chờ pilot phase |

DOCS-A coi như **DOCS_READY** — tài liệu đủ để admin tự deploy. **DOCS_VALIDATED** sẽ đạt khi
admin/supervisor hoàn tất pilot và để lại report mới (phase tiếp theo) ghi nhận kết quả.

## AI HANDOFF SUMMARY

DOCS-A khép lại nhánh phát triển core HOME_ALERT trong loạt Phase 80–84 bằng **bộ tài liệu triển
khai thật**. Không có code change, không schema change, không trigger change. Tài liệu chia
4 nhóm:

- `docs/appsheet/` — cài AppSheet + reference công thức.
- `docs/training/` — operator + supervisor manual.
- `docs/admin/` — admin / runtime owner guide.
- `docs/operations/` — deployment runbook (checklist từ pre-deploy → first-week monitoring).
- `docs/HOME_ALERT_DEPLOYMENT_DOCS_INDEX.md` — index ai đọc gì + thứ tự deploy.

Phase tiếp theo KHÔNG được thêm core automation (Phase 85 / AI / Queue Intelligence) khi pilot chưa
xong. Tham khảo handoff `012_*_HANDOFF.md` cho ràng buộc.

## GIT STATUS

- **Branch:** `phase/from-v2.4.1-TASK-FIN`
- **Pre-commit `git status`:** untracked `00_SYSTEM_BRAIN/000_PROMPTS/012_*.md` + `docs/` (toàn bộ
  nhánh mới).
- **Commit / push / tag:** xem mục riêng trong handoff hoặc append-only update report nếu
  có thay đổi sau khi chạy git.

> Lưu ý: nếu push fail do auth thì KHÔNG coi là docs fail; ghi rõ ở handoff/commit log để admin tự
> push sau.

---

## COMMIT / PUSH / TAG STATUS (append)

- **Commit:** `d9ffd1c` — `docs(home-alert): add operational deployment and appsheet guide`
  - 14 file mới, 2150 insertions, 0 deletions.
  - Phạm vi: 11 file dưới `docs/` (6 tài liệu chính + 4 README folder + 1 index tổng) + 3 brain
    artifact `012_*` trong `00_SYSTEM_BRAIN/`.
- **Push:** Success → `origin/phase/from-v2.4.1-TASK-FIN` (e8b8478..d9ffd1c).
- **Tag:** `v2.4.5-HOME-ALERT-DEPLOYMENT-DOCS` (annotated) đã tạo và push lên origin.
- **Post-commit `git status`:** clean (chỉ còn các untracked / modified ngoài phạm vi DOCS-A nếu
  có).
- **Auth:** Không gặp lỗi auth ở phase này.
