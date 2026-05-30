# PHASE_UI_CBV_WORK_INBOX_V3_FINAL_FOCUS_RUNTIME_REDESIGN

**Suite:** `PHASE_UI_CBV_WORK_INBOX_V3_FINAL_FOCUS_RUNTIME_REDESIGN`  
**Standard:** CBV_TCS_V1  
**Domain:** `WEBAPP_FE`

## Checks (required)

| ID | Description |
|----|-------------|
| UI_FOCUS_RUNTIME_DEFAULT_RENDER | `/inbox` opens Focus Runtime by default |
| UI_COMPACT_SIDEBAR_RENDER | Inbox compact sidebar groups |
| UI_RIGHT_PANEL_TABS_SWITCH | Chi tiết / Timeline / Handoff / Tài liệu |
| UI_PREV_NEXT_TASK_NAVIGATION | Prev/next in focus queue |
| UI_BACK_TO_INBOX | Quay lại inbox |
| UI_PRIMARY_ACTION_HANDLER_BOUND | Bắt đầu xử lý → open handler |
| UI_SECONDARY_ACTION_SAFE_FALLBACK | Toast when secondary not bound |
| UI_NO_REPEATED_OPEN_BUTTONS_IN_FOCUS | No per-row Mở xử lý in focus |
| UI_BOTTOM_STATUS_BAR_RENDER | Footer clearance + anchor |
| UI_RESPONSIVE_1366_SAFE | Grid at laptop width |

## Run static suite (local)

```bash
cd apps/workboard
npx tsx -e "import { runFocusRuntimeRedesignChecks } from './src/modules/task/inbox/focusRuntimeRedesignChecks.ts'; console.log(runFocusRuntimeRedesignChecks());"
```

## Build verify

```bash
cd apps/workboard
npm run typecheck
npm run build
```

## Env kill-switches

| Variable | Default | Effect |
|----------|---------|--------|
| `VITE_CBV_WORK_INBOX_FOCUS_RUNTIME` | on | Final Focus Runtime layout |
| `VITE_CBV_WORK_INBOX_FOCUS_RUNTIME_DEFAULT` | on | List-first vs focus-first on `/inbox` |

Set to `false` or `0` to disable.

## Manual UI checklist

See report § Screenshot/manual verification.
