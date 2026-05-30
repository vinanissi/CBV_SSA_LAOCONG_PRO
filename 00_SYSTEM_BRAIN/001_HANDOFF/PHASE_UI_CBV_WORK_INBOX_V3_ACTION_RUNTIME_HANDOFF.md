# PHASE_UI_CBV_WORK_INBOX_V3_ACTION_RUNTIME — Handoff

**Status:** GO_WITH_WARNINGS  
**Next operator:** Verify on `/inbox` with live Worker + GAS task API.

---

## What shipped

- **Action runtime** under `apps/workboard/src/modules/task/inbox/actionRuntime/`
- **RCLA context** under `apps/workboard/src/runtime/rcla/`
- Focus panel entry: `WorkInboxFocusActionHost` (replaces direct `WorkInboxFocusRuntime` when `user` + refresh callbacks provided from `TasksPage`)

---

## Run checks

```bash
cd apps/workboard
npm run build
npx tsx -e "import { runWorkInboxActionRuntimeChecks } from './src/modules/task/inbox/actionRuntime/workInboxActionRuntimeChecks.ts'; console.log(runWorkInboxActionRuntimeChecks());"
```

---

## Manual verification (minimum)

1. Open `/inbox` → Focus Runtime default.
2. Select task **NEW** → **▶ Bắt đầu xử lý** → status `IN_PROGRESS`, toast, timeline tab shows comment.
3. **⏸ Tạm dừng** → pick reason → `ON_HOLD` or `WAITING`, toast.
4. **⇄ Chuyển giao** → recipient + comment → assignee updates.
5. **⋯ Thao tác khác** → Sao chép link works; other items toast *Chức năng đang chuẩn bị*.
6. **‹ Trước / Sau ›** and **Xem tiếp →** load different tasks (detail panel refreshes).
7. Right panel: **Gọi điện** / **Nhắn tin** with/without phone; **Tạo lịch hẹn** adds timeline line.

---

## Env / flags

| Variable | Effect |
|----------|--------|
| `VITE_CBV_WORK_INBOX_FOCUS_RUNTIME` | Focus Runtime layout |
| `VITE_CBV_WORK_INBOX_FOCUS_RUNTIME_DEFAULT` | Focus-first on `/inbox` |
| `VITE_CBV_API_BASE_URL` | Worker API for mutations |

---

## Known warnings

- Guide / Mẫu biểu mẫu → placeholder toast (by design this phase).
- `003_RUNTIME_STATE.md` → `NOT_WIRED` (no deploy state machine).

---

## Docs

| Artifact |
|----------|
| `00_SYSTEM_BRAIN/000_REPORTS/PHASE_UI_CBV_WORK_INBOX_V3_ACTION_RUNTIME_REPORT.md` |
| `00_SYSTEM_BRAIN/005_TEST_EVIDENCE/PHASE_UI_CBV_WORK_INBOX_V3_ACTION_RUNTIME_TEST_EVIDENCE.md` |
