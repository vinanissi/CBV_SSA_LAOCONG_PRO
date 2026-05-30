# PHASE_UI_CBV_WORK_INBOX_V3_IMAGE_B_LAYOUT_FIX_RIGHT_CONTEXT

**Suite:** `apps/workboard/src/modules/task/inbox/focusRuntimeLayoutFixChecks.ts`  
**Runner:** `runFocusRuntimeLayoutFixChecks()`

## Commands

```bash
cd apps/workboard
npm run typecheck
npm run build
```

Static checks load `?raw` sources and require a Vite context (e.g. dev import from workboard). After build, verify manually on `/inbox` with focus runtime flags enabled.

## Required check IDs

- `UI_NO_LEGACY_CONTEXT_PANEL`
- `UI_RIGHT_CONTEXT_TABS_OUTER_LEVEL`
- `UI_WORKSPACE_HAS_EXACTLY_THREE_REGIONS`
- `UI_NO_NESTED_RIGHT_TABS_IN_MAIN`
- `UI_NO_NESTED_SCROLL_LAYOUT`
- `UI_1366x768_FOCUS_VISIBLE`

## Manual acceptance (1366×768)

- [ ] No panel titled **Ngữ cảnh vận hành** with placeholder SLA text on the far right
- [ ] Exactly three horizontal regions: left sidebar (~230px) | focus workspace (flex) | right tabs (~380px)
- [ ] Tabs **Chi tiết / Timeline / Handoff / Tài liệu** in outer right column only
- [ ] Primary **Bắt đầu xử lý** and **Việc tiếp theo** visible or nearly visible without deep nested scroll
