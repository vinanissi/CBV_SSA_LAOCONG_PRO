# docs/admin — Admin / Runtime Owner

Tài liệu cho admin AppSheet + runtime owner GAS chịu trách nhiệm HOME_ALERT.

## Files

| File | Mục đích |
|------|----------|
| `HOME_ALERT_ADMIN_RUNTIME_OWNER_GUIDE.md` | Vai trò, deploy GAS, bootstrap, test console, safe automation, recovery, audit, danh sách cấm. |

## Đọc theo thứ tự

1. `HOME_ALERT_ADMIN_RUNTIME_OWNER_GUIDE.md` (file duy nhất).
2. Sau đó: `../operations/HOME_ALERT_OPERATIONAL_DEPLOYMENT_RUNBOOK.md` cho từng đợt go-live.
3. `../appsheet/APPSHEET_HOME_ALERT_INSTALL_GUIDE.md` + `APPSHEET_HOME_ALERT_FORMULA_REFERENCE.md`
   cho phần AppSheet.

## Cấm (tóm tắt)

- Không auto assign / auto resolve / auto close / auto escalate.
- Không AppSheet Bot.
- Không destructive migration.
- Không sửa `OPERATOR_*` contract.
- Không mở rộng allowlist Phase 84 mà không có phase mới.
