# PHASE DOCS-A — OPERATIONAL_DEPLOYMENT_AND_APPSHEET_RUNTIME_GUIDE (Prompt — Append-Only)

**Date:** 2026-05-12  
**Repo:** D:\Workspace\projects\CBV_SSA_LAOCONG_PRO  
**GitHub:** https://github.com/vinanissi/CBV_SSA_LAOCONG_PRO  
**Branch:** phase/from-v2.4.1-TASK-FIN  
**Reference standard:** CBV Operational Ecosystem Standard V1  
**Tag (recommended):** `v2.4.5-HOME-ALERT-DEPLOYMENT-DOCS`

---

## Mục tiêu

Dừng phát triển core runtime lớn. Chuyển sang **tài liệu triển khai thật** cho nhân sự sử dụng
HOME_ALERT / SLA / Escalation / Safe Automation Runtime.

Hệ đã đủ runtime sau Phase 82 (SLA + Escalation), Phase 83 (SLA Policy Registry) và Phase 84
(Safe Automation Runtime). Phase DOCS-A bổ sung tài liệu triển khai AppSheet + hướng dẫn vận hành
cho operator / supervisor / admin / runtime owner.

---

## Nguyên tắc bắt buộc

- Runtime-first
- Memory-first
- Append-only
- Manual-first → Auto-later
- Human-in-the-loop
- No destructive migration
- No overwrite report/prompt/handoff cũ
- No fake GO
- Không tiếp tục thêm core automation lớn trong phase này
- Phase này ưu tiên tài liệu triển khai, vận hành, đào tạo

---

## Phạm vi triển khai

### A. Tạo cấu trúc tài liệu

```
docs/
  operations/
  appsheet/
  training/
  admin/
  HOME_ALERT_DEPLOYMENT_DOCS_INDEX.md
```

### B. Tài liệu phải tạo

1. `docs/appsheet/APPSHEET_HOME_ALERT_INSTALL_GUIDE.md` — Hướng dẫn cài AppSheet
2. `docs/training/HOME_ALERT_OPERATOR_MANUAL.md` — Hướng dẫn vận hành cho operator
3. `docs/training/HOME_ALERT_SUPERVISOR_MANUAL.md` — Hướng dẫn cho supervisor
4. `docs/admin/HOME_ALERT_ADMIN_RUNTIME_OWNER_GUIDE.md` — Hướng dẫn admin / runtime owner
5. `docs/operations/HOME_ALERT_OPERATIONAL_DEPLOYMENT_RUNBOOK.md` — Runbook triển khai thật
6. `docs/appsheet/APPSHEET_HOME_ALERT_FORMULA_REFERENCE.md` — Reference formula AppSheet
7. `docs/HOME_ALERT_DEPLOYMENT_DOCS_INDEX.md` — Index tài liệu deployment
8. `docs/{operations,appsheet,training,admin}/README.md` — Index từng nhóm

### C. Brain artifacts (append-only)

- `00_SYSTEM_BRAIN/000_PROMPTS/012_PHASE_DOCS_A_OPERATIONAL_DEPLOYMENT_AND_APPSHEET_RUNTIME_GUIDE_PROMPT.md` (file này)
- `00_SYSTEM_BRAIN/000_REPORTS/012_PHASE_DOCS_A_OPERATIONAL_DEPLOYMENT_AND_APPSHEET_RUNTIME_GUIDE_REPORT.md`
- `00_SYSTEM_BRAIN/001_HANDOFF/012_PHASE_DOCS_A_OPERATIONAL_DEPLOYMENT_AND_APPSHEET_RUNTIME_GUIDE_HANDOFF.md`

---

## Ràng buộc đặc biệt

- Không sửa runtime code nếu không cần.
- Không đổi `scriptId`.
- Không đổi `.clasp.json` nếu không cần.
- Không thêm trigger.
- Không thêm AppSheet Bot.
- Không auto assign / auto resolve / auto escalate.
- Không xóa report/handoff/prompt cũ.
- Không làm lệch `OPERATOR_*` contract.
- Không tiếp tục Phase 85 / AI / Queue Intelligence trong phase này.

---

## Acceptance criteria

- Phase 82 test ≥ GO_WITH_WARNINGS (đã đạt trên GAS)
- Phase 83 test = GO (đã đạt trên GAS)
- Phase 84 test = GO hoặc GO_WITH_WARNINGS có giải thích (chờ GAS test)
- AppSheet operator dashboard có thể cài đặt theo `APPSHEET_HOME_ALERT_INSTALL_GUIDE.md`
- Ít nhất 1 operator pilot test thành công sau khi đọc `HOME_ALERT_OPERATOR_MANUAL.md`

---

## Git plan

- Commit:
  `docs(home-alert): add operational deployment and appsheet guide`
- Tag (nếu phù hợp):
  `v2.4.5-HOME-ALERT-DEPLOYMENT-DOCS`
- Push nếu credential sẵn; nếu push fail do auth → ghi rõ trong report, không coi là docs fail.

---

## Bối cảnh phase trước (snapshot)

- **Phase 80A–F** đã chốt HOME_ALERT sheet-driven runtime + Operator UX `OPERATOR_*` contract.
- **Phase 81** đã thêm operational assignment runtime (claim / assign / waiting / blocked).
- **Phase 82** đã thêm SLA + Escalation runtime → GO_WITH_WARNINGS trên GAS.
- **Phase 83** đã thêm SLA Policy Registry + Metrics → GO trên GAS (tag `v2.4.3-HOME-ALERT-SLA-POLICY`).
- **Phase 84** đã thêm Safe Automation Runtime (config / run log / daily snapshot) → tag `v2.4.4-HOME-ALERT-SAFE-AUTOMATION`, chờ GAS runtime test thật.

Phase DOCS-A KHÔNG thêm core automation; chỉ tài liệu.
