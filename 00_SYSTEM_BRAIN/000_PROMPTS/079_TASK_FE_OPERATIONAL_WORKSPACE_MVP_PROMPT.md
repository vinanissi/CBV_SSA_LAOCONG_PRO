# Phase 79 — TASK FE Operational Workspace MVP (archived prompt)

Archived specification summary (full operator brief was provided in Phase 79 chat).

## Mục tiêu

1. Home / Today Workspace  
2. Focus Task Screen  
3. Task Detail / Timeline  
4. Admin Dashboard  
5. Runtime Health / Test Console (tách menu 🧪)

## Nguyên tắc

- Memory-first, runtime-first, append-only.  
- Không fake PRODUCTION READY.  
- FE chỉ `google.script.run` → service; không business logic phức tạp trong HTML.  
- Test runtime tách menu vận hành (`📌 CBV TASK Workspace` vs `🧪 CBV Test Console`).  
- Report contract CBV (envelope `ok`, `phase`, `status` ∈ {GO, GO_WITH_WARNINGS, FAIL}, `checks[]` với `code`, `ok`, `severity`, `message`, `detail`, …).  
- Không migration phá huỷ; không xoá audit.

## Implementation map

| Khu vực | File chính |
| -------- | ----------- |
| Menu vận hành | `79_TASK_FE_MENU.js` → `buildTaskFeWorkspaceMenu_()` |
| Home | `79_TASK_FE_HOME_SERVICE.js`, `79_TASK_FE_HOME_WORKSPACE.html` |
| Focus | `79_TASK_FE_FOCUS_SERVICE.js`, `79_TASK_FE_FOCUS_TASK.html` |
| Detail / Timeline | `79_TASK_FE_TIMELINE_SERVICE.js`, `79_TASK_FE_TASK_DETAIL.html` |
| Admin | `79_TASK_FE_ADMIN_SERVICE.js`, `79_TASK_FE_ADMIN_DASHBOARD.html` |
| Test + dialogs | `79_TASK_FE_TEST_CONSOLE.js`, `79_TASK_FE_TEST_*_DIALOG.html` |
| Shared | `79_TASK_FE_COMMON.js` |
| Hook test menu | `CBV_TEST_CONSOLE_MENU.js` (chỉ thêm item, không trộn menu vận hành) |

## onOpen

Spreadsheet bound phải gọi `buildTaskFeWorkspaceMenu_()` (ví dụ từ `onOpen` của project deploy production-core). Repo `main-control` không được sửa trong phase này.

## Readiness

MVP / pilot only — xem `00_SYSTEM_BRAIN/000_REPORTS/079_TASK_FE_OPERATIONAL_WORKSPACE_MVP_REPORT.md`.
