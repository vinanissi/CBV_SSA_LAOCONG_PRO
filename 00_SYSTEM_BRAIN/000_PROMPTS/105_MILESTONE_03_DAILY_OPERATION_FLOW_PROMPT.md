# 105 — Milestone 03 Daily Operation Flow — PROMPT (append-only)

READ FIRST:

00_SYSTEM_BRAIN/000_RUNTIME_ENTRYPOINT.md

---

**Date:** 2026-05-14  
**Branch:** `phase/from-v2.4.1-TASK-FIN`  
**Standards:** CBV Operational Ecosystem Standard V1 · CBV_TCS_V1  

## Intent

Mốc 03 — chuyển WebApp staff sang **task-first / today-first / action-first**, route Daily (`/workspace/daily`, `/daily`), task card V2, nav gọn (primary + secondary), mobile markers, next-action engine read-only, Test Console + Drive bundle prefix `105_MILESTONE_03_DAILY_OPERATION_FLOW_*`, không phá Mốc 01/02.

## Implementation mapping (repo)

| Area | Artefacts |
|------|-----------|
| Runtime | `05_GAS_RUNTIME/998S_WEBAPP_DAILY_OPERATION_FLOW.js` |
| Test Console | `05_GAS_RUNTIME/998T_MILESTONE_03_DAILY_OPERATION_TEST_CONSOLE.js` — `CbvTcsMilestone03DailyOp_TestConsole_runFull` |
| HTML | `05_GAS_RUNTIME/html/WEBAPP_DAILY_OPERATION_HOME.html` |
| Routes / renderer | `92_WEBAPP_WORKSPACE_ROUTES.js`, `91_WEBAPP_WORKSPACE_CONFIG.js`, `94_WEBAPP_WORKSPACE_RENDERER.js` |
| VI / nav | `998F_WEBAPP_VI_UX_COPY.js` — primary + secondary nav builders |
| Shell | `html/WEBAPP_WORKSPACE_SHELL.html` — marker comment |
| Staff nav | `998Q_WEBAPP_STAFF_OPERATION_WORKSPACE.js` — bottom nav + Daily |
| Route URL frozen set | `998H_WEBAPP_ROUTE_URL_HELPER.js` |
| doGet supported list | `96_WEBAPP_DOGET_DISPATCHER.js`, `999_WEBAPP_DOGET_DISPATCHER_FINAL.js` |
| Menu | `90_BOOTSTRAP_MENU.js`, `90_BOOTSTRAP_MENU_WRAPPERS.js` |
| clasp order | `.clasp.json` — `998S` after `998Q`, `998T` after `998R` |

## Runtime verification (manual)

1. `clasp push`  
2. Sheet → **🧪 CBV Test Console** → **Run Milestone 03 Daily Operation Flow Test**  
3. Drive folder `1wQhgcq6An8YTu_6WD91p1nJLJ0gtChwG` — bundle `*_105_MILESTONE_03_DAILY_OPERATION_FLOW_*`  
4. Chỉ tag sau khi envelope GO / GO_WITH_WARNINGS + `envelopeOk=true`.

## Full directive

Chi tiết phase 301–307, checklist test, và constraints được thực thi theo bản directive đầy đủ gửi trong phiên Cursor (Milestone 03 — Daily Operation Flow).
