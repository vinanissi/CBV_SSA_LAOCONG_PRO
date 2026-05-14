# Report — Phase 96 — WebApp Vietnamese UX / User Flow Guide

**Date:** 2026-05-14  
**Phase ID:** `PHASE_96_WEBAPP_VIETNAMESE_UX_REFACTOR_USER_FLOW_GUIDE`  
**Contract:** `CBV_TCS_V1` (Test Console Phase 96)

## 1. Files created

| Path |
|------|
| `05_GAS_RUNTIME/998F_WEBAPP_VI_UX_COPY.js` |
| `05_GAS_RUNTIME/998G_WEBAPP_VI_UX_TEST_CONSOLE.js` |
| `docs/webapp/PHASE_96_WEBAPP_VIETNAMESE_UX_REFACTOR_USER_FLOW_GUIDE.md` |
| `docs/webapp/WEBAPP_VI_LABEL_DICTIONARY.md` |
| `docs/webapp/WEBAPP_USER_FLOW_GUIDE_VI.md` |
| `docs/webapp/WEBAPP_OPERATOR_QUICK_GUIDE_VI.md` |
| `docs/webapp/WEBAPP_SUPERVISOR_QUICK_GUIDE_VI.md` |
| `docs/webapp/WEBAPP_ADMIN_QUICK_GUIDE_VI.md` |
| `docs/webapp/WEBAPP_LINKS_AND_ROUTES_VI.md` |
| `docs/webapp/WEBAPP_UAT_VIETNAMESE_COPY_CHECKLIST.md` |
| `00_SYSTEM_BRAIN/000_PROMPTS/035_PHASE_96_WEBAPP_VIETNAMESE_UX_REFACTOR_USER_FLOW_GUIDE_PROMPT.md` |
| `00_SYSTEM_BRAIN/000_REPORTS/035_PHASE_96_WEBAPP_VIETNAMESE_UX_REFACTOR_USER_FLOW_GUIDE_REPORT.md` |
| `00_SYSTEM_BRAIN/001_HANDOFF/035_PHASE_96_WEBAPP_VIETNAMESE_UX_REFACTOR_USER_FLOW_GUIDE_HANDOFF.md` |

## 2. Files updated

- `.clasp.json` — `998F`, `998G` before `96_WEBAPP_DOGET_DISPATCHER.js`, `999` last  
- `05_GAS_RUNTIME/94_WEBAPP_WORKSPACE_RENDERER.js`, `html/WEBAPP_WORKSPACE_SHELL.html` (prior thread)  
- `05_GAS_RUNTIME/98_WEBAPP_WORKSPACE_PILOT_RENDERER.js`  
- `05_GAS_RUNTIME/992_WEBAPP_TIMELINE_KANBAN_RENDERER.js`  
- `05_GAS_RUNTIME/995_WEBAPP_OBSERVABILITY_RENDERER.js`  
- `05_GAS_RUNTIME/998_WEBAPP_ADMIN_REFERENCE_RENDERER.js`  
- `05_GAS_RUNTIME/998D_WEBAPP_UAT_RUNBOOK.js` — `CbvWebAppUat_getUserFlowViPointers()` + validate advisory  
- `05_GAS_RUNTIME/90_BOOTSTRAP_MENU.js`, `90_BOOTSTRAP_MENU_WRAPPERS.js`  
- `05_GAS_RUNTIME/CLASP_PUSH_ORDER.md`  
- `docs/HOME_ALERT_DEPLOYMENT_DOCS_INDEX.md` — Phase 96 block; corrected Phase 95 “next” away from erroneous mutation-phase naming  

## 3. Labels localized

Navigation, page titles, read-first copy, safety footer (VI), pilot home/queue/sla strings, timeline/kanban observability/admin reference headings and common field labels — sourced from `998F` with English fallback when helpers are absent.

## 4. Route links updated

Canonical `/exec` URL centralized in `998F` and documented in `WEBAPP_LINKS_AND_ROUTES_VI.md` + deployment index. **Route paths unchanged.**

## 5. User flows added

- `WEBAPP_USER_FLOW_GUIDE_VI.md` (operator / supervisor / admin + principles)  
- Quick guides per role  
- Runtime: `CbvWebAppVi_getUserFlowGuide(role)` + `CbvWebAppUat_getUserFlowViPointers()`

## 6. Test console added

Menu: **Phase 96 — Vietnamese UX** — run health check, show dictionary/links/guides, handoff, copy report (`998G`).

## 7–9. Test results (local / GAS / route copy)

| Check | Result |
|-------|--------|
| `node --check` on touched `.js` (incl. `992` after `__inlineKanban_` fix) | **PASS** (2026-05-14) |
| `schema_manifest.json` JSON parse | **PASS** |
| GAS spreadsheet Test Console Phase 96 | **Pending** — chạy sau khi deploy version mới trên Apps Script |
| Manual `?route=` smoke | **Pending** — dùng link trong `WEBAPP_LINKS_AND_ROUTES_VI.md` |

## 10. Warnings

- Staff copy audit pending — expect **GO_WITH_WARNINGS** until feedback.  
- Mixed EN technical tokens (`STATUS`, sheet codes) remain by design.  
- Phase 95 `CbvWebAppUat_getGoNoGoCriteria` text still mentions an older “Phase 96” mutation naming in `nextStepOnGo*` — **docs index** corrected; runtime criteria file unchanged to avoid scope creep.

## 11. Next step

- **Phase 97** — Staff trial execution / feedback capture.  
- Optional pilot tag `v2.4.13-webapp-vietnamese-ux` only after Test Console GO or GO_WITH_WARNINGS + manual route verification.

## 12–13. Readiness

- **Pilot (Vietnamese UX):** GO_WITH_WARNINGS (pending staff feedback).  
- **Production:** NOT YET.

## 14. Git commands (reference)

```bash
git status --short
git add .clasp.json 05_GAS_RUNTIME/998F_WEBAPP_VI_UX_COPY.js 05_GAS_RUNTIME/998G_WEBAPP_VI_UX_TEST_CONSOLE.js …
git commit -m "feat(webapp): localize workspace UX to Vietnamese"
git push origin phase/from-v2.4.1-TASK-FIN
clasp push --force
```

## 15. Commit hash

- `da30f19` — `feat(webapp): localize workspace UX to Vietnamese`  
- `fe7e7fb` — `docs(brain): backfill Phase 96 report commit hash`  
- `5136104` — `docs(brain): note Phase 96 clasp push success in report` (report text refresh)  
- `a4ef6f8` — `docs(brain): finalize Phase 96 report test and deploy results`

## 16–18. Push / clasp / deploy

| Step | Result (2026-05-14) |
|------|---------------------|
| `git push origin phase/from-v2.4.1-TASK-FIN` | **Success** (đã đẩy `da30f19`, `fe7e7fb`, `5136104`) |
| `clasp push --force` | **Success** — `exit_code: 0`, ~62s; `998F` / `998G` included in pushed file list |
| Apps Script **Manage deployments → New version** | **Manual** — tạo version mới và trỏ Web deployment tới version chứa Phase 96 |
