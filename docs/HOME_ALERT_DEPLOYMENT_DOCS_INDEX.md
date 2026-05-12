# HOME_ALERT — Deployment Docs Index

**Phase:** DOCS-A — `OPERATIONAL_DEPLOYMENT_AND_APPSHEET_RUNTIME_GUIDE`  
**Date:** 2026-05-12  
**Status:** DOCS_READY (chờ thực thi deploy trên prod để chuyển sang DOCS_VALIDATED)  
**Repo:** `D:\Workspace\projects\CBV_SSA_LAOCONG_PRO`  
**Branch:** `phase/from-v2.4.1-TASK-FIN`  
**Reference:** CBV Operational Ecosystem Standard V1

---

## File cho ai

| File | Audience chính | Audience phụ |
|------|----------------|--------------|
| `appsheet/APPSHEET_HOME_ALERT_INSTALL_GUIDE.md` | Admin AppSheet | Admin / Runtime Owner |
| `appsheet/APPSHEET_HOME_ALERT_FORMULA_REFERENCE.md` | Admin AppSheet | Supervisor (đọc hiểu) |
| `training/HOME_ALERT_OPERATOR_MANUAL.md` | Operator | Supervisor |
| `training/HOME_ALERT_SUPERVISOR_MANUAL.md` | Supervisor / Team Lead | Admin |
| `admin/HOME_ALERT_ADMIN_RUNTIME_OWNER_GUIDE.md` | Admin / Runtime Owner | Supervisor (read-only) |
| `operations/HOME_ALERT_OPERATIONAL_DEPLOYMENT_RUNBOOK.md` | Admin / Runtime Owner | Supervisor (phối hợp go-live) |

---

## Thứ tự đọc (lần đầu)

1. `admin/HOME_ALERT_ADMIN_RUNTIME_OWNER_GUIDE.md` — hiểu vai trò + cấm.
2. `appsheet/APPSHEET_HOME_ALERT_INSTALL_GUIDE.md` — cấu trúc tables/slices/views/actions.
3. `appsheet/APPSHEET_HOME_ALERT_FORMULA_REFERENCE.md` — công thức cụ thể.
4. `operations/HOME_ALERT_OPERATIONAL_DEPLOYMENT_RUNBOOK.md` — runbook deploy.
5. `training/HOME_ALERT_OPERATOR_MANUAL.md` — đào tạo operator.
6. `training/HOME_ALERT_SUPERVISOR_MANUAL.md` — đào tạo supervisor.

---

## Thứ tự triển khai (deploy lần đầu)

| Bước | File guide chính | Trách nhiệm |
|------|------------------|-------------|
| 1. Pre-deploy + git state | `operations/...RUNBOOK.md` §1–§2 | Admin |
| 2. GAS deploy + bootstrap | `admin/...OWNER_GUIDE.md` §2–§3, `operations/...RUNBOOK.md` §3–§4 | Admin |
| 3. Test console (82/83/84) | `admin/...OWNER_GUIDE.md` §4, `operations/...RUNBOOK.md` §6 | Admin |
| 4. AppSheet setup | `appsheet/...INSTALL_GUIDE.md` + `appsheet/...FORMULA_REFERENCE.md` | Admin AppSheet |
| 5. Pilot rollout | `operations/...RUNBOOK.md` §7 | Admin + Supervisor + Pilot operators |
| 6. Training | `training/OPERATOR_MANUAL.md` + `training/SUPERVISOR_MANUAL.md` | Supervisor |
| 7. Go-live | `operations/...RUNBOOK.md` §9 | Tất cả |
| 8. First-week monitoring | `operations/...RUNBOOK.md` §10 | Admin + Supervisor |
| 9. Cân nhắc bật safe trigger | `admin/...OWNER_GUIDE.md` §5–§6 | Admin (có phê duyệt) |
| 10. Rollback (nếu cần) | `operations/...RUNBOOK.md` §11 | Admin |

---

## Trạng thái phase docs

| Mục | Trạng thái |
|-----|-----------|
| Doc files cần | Đủ 6 file chính + 4 README folder + index này |
| Brain artifacts | Prompt + Report + Handoff (012_*) trong `00_SYSTEM_BRAIN/` |
| Code changes | KHÔNG (DOCS-A không sửa runtime) |
| Schema changes | KHÔNG |
| Trigger changes | KHÔNG |
| AppSheet changes | KHÔNG (chỉ tài liệu, admin sẽ tự áp dụng) |

---

## Liên kết phase trước

- Phase 82 — SLA + Escalation Runtime: report `00_SYSTEM_BRAIN/000_REPORTS/009_*`, handoff
  `00_SYSTEM_BRAIN/001_HANDOFF/009_*`.
- Phase 83 — SLA Policy Registry: report `010_*`, handoff `010_*`.
- Phase 84 — Safe Automation Runtime: report `011_*`, handoff `011_*`.
- DOCS-A — file này + `012_*` prompt/report/handoff.

---

## Ràng buộc (không được vi phạm khi đọc / áp dụng)

- Manual-first → Auto-later.
- No destructive migration.
- No overwrite report/handoff/prompt cũ.
- No fake GO.
- Không thêm core automation lớn trong DOCS-A.
- Không thay đổi `OPERATOR_*` contract.
- Không thêm AppSheet Bot.
- Không tự ý mở rộng allowlist Phase 84.
