# Checklist Runtime v1 — Operator UAT

**Audience:** Operator (not developer)  
**Runtime:** Checklist Runtime v1  
**Environment:** Work Inbox focus mode (`npm run dev` with `.env.local` proxy)  
**UAT status:** BROWSER_UAT RERUN **GO_WITH_WARNINGS** 2026-06-02 (post `PHASE_CHECKLIST_WORKER_CONNECTIVITY_FIX`)

Instructions: Use `.env.local` with empty `VITE_CBV_API_BASE_URL` so Vite proxies `/api` to Worker. Record Pass / Fail / N/A per row.

| # | Step | Pass / Fail / N/A | Evidence Reference | Notes |
|---|------|-------------------|--------------------|-------|
| UAT-01 | Create Task | **Pass** | `phase_tmp/browser_uat_screenshots_rerun/uat01-create-task.png` | Create-task UI reachable; list loads after login |
| UAT-02 | Create Checklist (add step) | **Fail** | `phase_tmp/browser_uat_screenshots_rerun/uat02-create-checklist.png` | Automation did not confirm new row; API shows 3+ items on `TASK-mpwr16qj-CNBT` |
| UAT-03 | Open Checklist | **Pass** | `.../uat03-open-checklist.png` | `[aria-label="Checklist việc"]` visible |
| UAT-04 | Tick Checklist Items | **Fail** | `.../uat04-tick.png` | Toggle not clicked in run 3; progress later showed 1/4 — manual toggle advised |
| UAT-05 | Add Comment | **Pass** | `.../uat05-comment.png` | Phản hồi tab + textarea used |
| UAT-06 | Add Attachment | **Pass** | `.../uat06-attachment.png` | Tài liệu panel visible |
| UAT-07 | Copy Link | **Fail** | `.../uat07-copy-link.png` | Copy control not found in collapsed/compact layout during automation |
| UAT-08 | Deep Link (`?step=`) | **Fail** | `.../uat08-deep-link.png` | URL retains `step=TCL-mpwr1eup-48KU`; row highlight not asserted in automation |
| UAT-09 | Focus Mode | **Pass** | `.../uat09-focus.png` | **Tập trung bước** → **Thoát tập trung** visible |
| UAT-10 | Compact Mode | **Pass** | `.../uat10-compact.png` | **Thu gọn tất cả** applied |
| UAT-11 | Progress Runtime | **Pass** | `.../uat11-progress.png` | `Tiến độ checklist 1/4, 25%` |
| UAT-12 | Navigation (prev/next step) | **Pass** | `.../uat12-nav.png` | **Bước trước** / **Bước sau** present |
| UAT-13 | Persistence (reload) | **Pass** | `.../uat13-persistence.png` | Checklist survived reload |
| UAT-14 | Dual Pane | **Pass** | `.../uat14-dual-pane.png` | Dual-pane elements detected (`dual elements=2`) |
| UAT-15 | Refresh | **Pass** | `.../uat15-refresh.png` | Second reload OK |

**Connectivity prechecks (browser, same-origin proxy)**

| Check | Result | Notes |
|-------|--------|-------|
| `GET /api/health` | **Pass** | `gasReachable: true` |
| `GET /api/runtime/connectivity` | **Pass** | `taskDbConfigured: true` |
| No `TypeError: Failed to fetch` | **Pass** | After `.env.local` overrides committed `.env` |
| OPTIONS (Worker direct) | **Pass** | 204, Allow-Origin matches request port |

**Sign-off**

| Field | Value |
|-------|-------|
| Test actor | `admin` (Playwright automation), human operator sign-off pending |
| Date | `2026-06-02` |
| Runtime URL | `http://localhost:5178/inbox/TASK-mpwr16qj-CNBT?step=TCL-mpwr1eup-48KU` |
| Worker API base | same-origin `/api` (Vite proxy → `127.0.0.1:8787`) |
| Evidence JSON | `phase_tmp/browser_uat_results_rerun.json` |
| Overall result | **GO_WITH_WARNINGS** |

**Promotion:** Connectivity blocker **resolved**. Do **not** promote to `PRODUCTION_LOCK` until UAT-02/04/07/08 are human-signed or repaired. Recommend `PHASE_CHECKLIST_RUNTIME_LOCK` only after operator confirms copy-link + deep-link + toggle on their machine.

**Prior run (pre-connectivity-fix):** FAIL — see `phase_tmp/browser_uat_results.json` and screenshots under `phase_tmp/browser_uat_screenshots/`.
