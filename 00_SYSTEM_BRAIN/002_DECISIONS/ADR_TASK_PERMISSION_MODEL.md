# ADR — TASK Permission Model (View Scope)

- **ID**: ADR_TASK_PERMISSION_MODEL
- **Date**: 2026-05-29
- **Status**: PROPOSED (audit-only; chưa triển khai)
- **Context phase**: `PHASE_TASK_PERMISSION_01_AUDIT_ONLY`
- **Related**: `00_SYSTEM_BRAIN/000_REPORTS/PHASE_TASK_PERMISSION_AUDIT_REPORT.md`, `.cursor/rules/task-main-pro-production-baseline.mdc`

## Context

Module TASK/WORKSPACE cần phân quyền "được xem việc" theo `ROLE + VIEW_SCOPE + DON_VI_ID + TEAM_ID + ASSIGNED_TO + OWNER_ID + CREATED_BY + WATCHERS`. Hiện trạng (audit):

- Model nhìn hiện tại chỉ 3 mức: **ADMIN (all) / public (`IS_PRIVATE=false`) / private (owner/reporter/shared)**.
- WebApp snapshot (`getTaskWorkspaceSnapshot`) trả **all** TASK_MAIN, không lọc theo user (CRITICAL).
- AppSheet Security Filter PRO đã thiết kế (IS_PRIVATE/SHARED_WITH) nhưng chưa xác nhận deploy.
- `ROLE_PERMISSION_MATRIX` (sheet) tồn tại nhưng runtime không đọc; quyền hard-code trong code.
- `TASK_MAIN` thiếu `TEAM_ID`/`ASSIGNED_TEAM`; `USER_DIRECTORY` thiếu `VIEW_SCOPE`; có sẵn `SUPERVISOR_ID`, `DON_VI_ID`, `TEAM_ID`, `IS_ADMIN`, capability flags.

## Decision

Áp dụng mô hình **ROLE + VIEW_SCOPE driven, data-config qua `ROLE_PERMISSION_MATRIX`, áp dụng bằng một engine `canViewTask` duy nhất**, triển khai theo **5 level an toàn** (audit → schema append → shadow → controlled WebApp → AppSheet), điều khiển bằng `FEATURE_FLAG`. Không hard-code theo ADMIN/OPERATOR/USER.

### Mô hình logic xem (target)
- **ADMIN / VIEW_SCOPE=ALL**: tất cả.
- **MANAGER**: `DON_VI_ID` mình ∪ `TEAM_ID` mình ∪ tạo ∪ phụ trách (`OWNER_ID`) ∪ reporter.
- **OPERATOR/STAFF**: được giao (`OWNER_ID`) ∪ `ASSIGNED_TEAM`/`TEAM_ID` mình ∪ watcher (`SHARED_WITH`) ∪ queue chung (nếu matrix cho phép).
- **USER**: tạo ∪ phụ trách ∪ được giao.
- **VIEWER/AUDITOR**: chỉ task không `IS_PRIVATE` và không `IS_CONFIDENTIAL`, theo scope cấp; không mutate.
- **INACTIVE** (`STATUS≠ACTIVE`/`IS_DELETED`): không thấy gì.

### Nguyên tắc kiến trúc
1. **TASK_MAIN là canonical**; `TASKS` (RF_12) coi là deprecated; `HOME_ALERT` chỉ là projection.
2. **Append-only**: chỉ thêm cột ở cuối (`VIEW_SCOPE`, `CAN_VIEW_*`, `TEAM_ID`, `ASSIGNED_TEAM`, `IS_CONFIDENTIAL`); không đổi tên/xoá; map nghĩa cột hiện có (OWNER_ID=assignee, SHARED_WITH=watchers, IS_PRIVATE=visibility, SUPERVISOR_ID=manager).
3. **Một engine quyền duy nhất** dùng chung WebApp + (mirror) AppSheet; đọc cấu hình từ `ROLE_PERMISSION_MATRIX` thay vì hard-code.
4. **Tách quyền xem vs quyền thao tác**: view-scope cho đọc; CAN_CREATE/UPDATE/ASSIGN/APPROVE/DELETE cho mutate (đã có cột).
5. **Manual-first → Auto-later**, **shadow trước khi enforce**, **FEATURE_FLAG mặc định an toàn**.
6. **Audit**: log permission-check/xem task vào `CBV_AUDIT_LOG`/`API_AUDIT_LOG` (append-only).

## Alternatives considered

- **A. Giữ nguyên model public/private 3 mức**: đơn giản nhưng không đáp ứng MANAGER/OPERATOR/AUDITOR theo scope; vẫn rò rỉ ở WebApp snapshot. ❌
- **B. Hard-code thêm role/scope trong code runtime**: nhanh nhưng lệch giữa AppSheet/WebApp, khó cấu hình, vi phạm "không hard-code". ❌
- **C (chosen). Matrix-config + VIEW_SCOPE + engine chung, rollout theo level/flag**: an toàn, cấu hình được, không phá luồng cũ. ✅
- **D. Enforce strict ngay ở production**: rủi ro ẩn nhầm việc đang vận hành. ❌

## Consequences

**Tích cực**: quyền cấu hình qua sheet; nhất quán 2 kênh; rollout có kiểm soát + rollback bằng flag; tái dùng `canUserSeeTask`/cột sẵn có; không phá AppSheet/runtime.

**Tiêu cực / nợ kỹ thuật**:
- Cần append cột + cập nhật `90_BOOTSTRAP_SCHEMA.js` & `90_BOOTSTRAP_AUDIT_SCHEMA.js`.
- Phải đồng bộ logic engine ↔ AppSheet expression (2 nơi diễn đạt cùng luật).
- Snapshot thêm bước lọc → cân nhắc hiệu năng (cache theo actor).
- Phải map bộ role mục tiêu (`operator/user/auditor`) ↔ role runtime (`STAFF/VIEW_ONLY`).
- Trùng nghĩa `TASKS`↔`TASK_MAIN` cần quyết định riêng (ngoài ADR này).

## Rollback
Tắt `FEATURE_FLAG` → runtime cũ. Cột append để nguyên (no-op). Không đổi AppSheet filter khi chưa verify. Revert commit nếu có code.

## Follow-ups
- ADR riêng cho việc hợp nhất/deprecate `TASKS` sheet.
- Quyết định có nâng `IS_PRIVATE` (boolean) lên `VISIBILITY` (enum) hay giữ song song.
