# PHASE_UI_CBV_WORK_INBOX_V3_FOCUS_RUNTIME_POLISH_IMAGE_2

**Suite:** `PHASE_UI_CBV_WORK_INBOX_V3_FOCUS_RUNTIME_POLISH_IMAGE_2`  
**Standard:** CBV_TCS_V1 · Domain `WEBAPP_FE`

## Required checks

| ID | Description |
|----|-------------|
| UI_IMAGE2_LAYOUT_3_REGION_RENDER | App sidebar + main workspace + right tabs |
| UI_NO_DUPLICATED_LEFT_PANEL | No CompactSidebar inside focus main |
| UI_NO_DUPLICATED_RIGHT_PANEL | DetailPanel hidden on /inbox V3 |
| UI_SINGLE_MAIN_SIDEBAR_ONLY | OperatorMainSidebar only |
| UI_RIGHT_CONTEXT_TABS_ONLY | RightContextTabs with detail quick actions |
| UI_FOCUS_HEADER_RENDER | FOCUS MODE header |
| UI_QUICK_CONTEXT_BADGES_RENDER | Context badges row |
| UI_ACTION_BAR_BUTTONS_BOUND | Primary handler |
| UI_SECONDARY_ACTION_SAFE_FALLBACK | Toast fallback |
| UI_PREV_NEXT_TASK_NAVIGATION | Prev/next |
| UI_BACK_TO_INBOX | Back control |
| UI_BOTTOM_STATUS_BAR_RENDER | Footer anchor |
| UI_1366x768_NO_MAJOR_OVERFLOW | Two-column body |
| UI_LEGACY_HIDDEN_ON_INBOX | No legacy panel on /inbox |

## Run (Vite dev — `?raw` imports)

```bash
cd apps/workboard
npm run dev
# In browser console after load:
# import { runFocusRuntimePolishImage2Checks } from '/src/modules/task/inbox/focusRuntimePolishImage2Checks.ts'
```

## Build verify

```bash
npm run typecheck && npm run build
```
