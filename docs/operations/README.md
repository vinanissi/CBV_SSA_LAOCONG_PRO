# docs/operations — Operational Deployment

Tài liệu vận hành triển khai HOME_ALERT lên môi trường thật.

## Files

| File | Mục đích | Audience |
|------|----------|----------|
| `HOME_ALERT_OPERATIONAL_DEPLOYMENT_RUNBOOK.md` | Runbook đầy đủ pre-deploy → go-live → first week | Admin / Runtime Owner |

## Đọc theo thứ tự

1. `../admin/HOME_ALERT_ADMIN_RUNTIME_OWNER_GUIDE.md` (hiểu vai trò + giới hạn)
2. `../appsheet/APPSHEET_HOME_ALERT_INSTALL_GUIDE.md` (cài AppSheet)
3. `HOME_ALERT_OPERATIONAL_DEPLOYMENT_RUNBOOK.md` (deploy)
4. `../training/HOME_ALERT_OPERATOR_MANUAL.md` + `HOME_ALERT_SUPERVISOR_MANUAL.md` (training)

## Phase context

- Phase 82 — SLA + Escalation: GO_WITH_WARNINGS trên GAS.
- Phase 83 — SLA Policy Registry: GO trên GAS.
- Phase 84 — Safe Automation Runtime: chờ GAS test prod.
- DOCS-A — tài liệu (file này thuộc DOCS-A, append-only).
