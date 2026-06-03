# Phase Report — CHECKLIST_OPERATOR_BROWSER_UAT

| Field | Value |
|-------|-------|
| **Phase** | `PHASE_CHECKLIST_OPERATOR_BROWSER_UAT` |
| **Result** | **FAIL** |
| **Date** | 2026-06-02 |
| **RUNTIME_STATE** | NOT_WIRED |

---

## Runtime parameters

- RCLA version: `CBV-RCLA v1.1`
- Entrypoint: `00_SYSTEM_BRAIN/000_RUNTIME_ENTRYPOINT.md`
- Target phase: `PHASE_CHECKLIST_OPERATOR_BROWSER_UAT`

---

## Read-first documents loaded

1. `00_SYSTEM_BRAIN/000_RUNTIME_ENTRYPOINT.md`
2. `000_REPORTS/PHASE_CHECKLIST_09_SCHEMA_WEBAPP_BOOTSTRAP_REPORT.md`
3. `000_REPORTS/PHASE_GAS_RUNTIME_DEPLOY_SYNC_REPORT.md`
4. `001_HANDOFF/PHASE_CHECKLIST_09_SCHEMA_WEBAPP_BOOTSTRAP_HANDOFF.md`
5. `001_HANDOFF/PHASE_GAS_RUNTIME_DEPLOY_SYNC_HANDOFF.md`
6. `00_SYSTEM_BRAIN/CHECKLIST/CHECKLIST_SCHEMA_BOOTSTRAP_CONTRACT.md`
7. `00_SYSTEM_BRAIN/006_PHASES/PHASE_REGISTRY.md`

---

## UAT scope

Required browser operator flow UAT-01..UAT-15 for checklist runtime.

---

## Live runtime assets used

- Runtime URL (target): `http://localhost:5174/inbox/TASK-mpwr16qj-CNBT?step=TCL-mpwr1eup-48KU`
- Worker bridge target: `http://127.0.0.1:8787`
- Live Web App API: `https://script.google.com/macros/s/AKfycbxldVl0LeNYG5J4drQBCqwQRaYZxoZSC11vR6BtQun1ly2HAa_yefH_SHxg64f5kPA/exec`
- Operator/Test actor: `admin` (login), API actor `UAT_OPERATOR`

---

## Test execution summary

### Browser run

Automated browser run (Playwright) produced `phase_tmp/browser_uat_results.json` and screenshots.

Result highlights:

- `UAT-01..UAT-12`: FAIL
- `UAT-13..UAT-15`: partial pass
- `PERSIST-REFRESH`: FAIL
- Overall browser result: `FAIL`

Blocking symptom shown in UI while login testing:

- `Runtime TASK_MAIN chưa kết nối — kiểm tra Worker và GAS`

Browser fetch check from page context:

- `fetch('http://localhost:8787/health')` -> `TypeError: Failed to fetch`

### Live API sanity (outside browser)

- Web App `checklist.schema.validate` -> `GO`
- Web App `wiOpListChecklist` for `TASK-mpwr16qj-CNBT` -> data present (2 items, persisted)

=> Backend/runtime data path is healthy, but browser runtime path is blocked in this environment.

---

## Test case results (required flow)

| Flow | Result | Evidence |
|------|--------|----------|
| Create Task | FAIL (browser) | `browser_uat_results.json` UAT-01 |
| Create Checklist | FAIL (browser) | UAT-03/UAT-04 |
| Open Checklist | FAIL (browser) | UAT-01 screenshot |
| Tick Checklist Items | FAIL (browser) | UAT-04 |
| Add Comment | FAIL (browser) | UAT-08 |
| Add Attachment | FAIL (browser) | UAT-08 |
| Copy Link | FAIL (browser) | UAT-05/UAT-06 |
| Deep Link | FAIL (browser) | UAT-07 |
| Focus Mode | FAIL (browser) | UAT-09 |
| Compact Mode | FAIL (browser) | UAT-10 |
| Progress Visualization | FAIL (browser) | UAT-02 |
| Dual Pane | FAIL (browser) | UAT-11/UAT-12 |
| Persistence | FAIL (browser) | `PERSIST-REFRESH` |
| Refresh | FAIL (browser) | `PERSIST-REFRESH` |
| Navigation | FAIL (browser criteria unmet) | UAT-07/Navigation |

---

## Bugs found

1. **Blocking browser runtime connectivity** in this environment:
   - Browser cannot reach Worker API endpoint (`TypeError: Failed to fetch`), causing login/runtime data unavailability.
2. As a consequence, mandatory operator checklist runtime UI cannot be validated.

---

## Warnings / risks / assumptions

- Assumption tested: backend API itself healthy (confirmed via shell POST).
- Risk: environment-level browser networking issue can hide true runtime behavior.
- Limitation: no real operator interactive pass in this execution context.

---

## Runtime lock recommendation

- Keep `CONDITIONAL_LOCK`.
- Do **not** advance to `PHASE_CHECKLIST_RUNTIME_LOCK` promotion decision from this evidence.

---

## Final status

**FAIL**

Mandatory browser operator flow could not be completed; required checks failed.

---

## Next recommended phase

Re-run `PHASE_CHECKLIST_OPERATOR_BROWSER_UAT` in an operator machine/browser session where Workboard can reach Worker/GAS runtime, then reassess lock phase.

---

## Rerun — 2026-06-02 (post `PHASE_CHECKLIST_WORKER_CONNECTIVITY_FIX`)

| Field | Value |
|-------|-------|
| **Result** | **GO_WITH_WARNINGS** |
| **Runtime URL** | `http://localhost:5178/inbox/TASK-mpwr16qj-CNBT?step=TCL-mpwr1eup-48KU` |
| **Worker** | same-origin `/api` proxy → `127.0.0.1:8787` |
| **Config fix** | `.env.local` sets `VITE_CBV_API_BASE_URL=` to override committed `.env` direct `localhost:8787` |

### Connectivity precheck

| Check | Result |
|-------|--------|
| Browser `GET /api/health` | PASS |
| Browser `GET /api/runtime/connectivity` | PASS (`gasReachable: true`) |
| `TypeError: Failed to fetch` | **None** (connectivity fix confirmed) |
| OPTIONS Worker | PASS (curl 204) |
| Checklist API via proxy | PASS (3 items) |

### Browser UAT summary (Playwright)

| UAT | Result |
|-----|--------|
| UAT-01 Create Task | Pass |
| UAT-02 Create Checklist | Fail (automation) |
| UAT-03 Open Checklist | Pass |
| UAT-04 Tick Items | Fail (automation) |
| UAT-05 Comment | Pass |
| UAT-06 Attachment | Pass |
| UAT-07 Copy Link | Fail (automation) |
| UAT-08 Deep Link | Fail (partial URL OK) |
| UAT-09 Focus | Pass |
| UAT-10 Compact | Pass |
| UAT-11 Progress | Pass (1/4, 25%) |
| UAT-12 Navigation | Pass |
| UAT-13 Persistence | Pass |
| UAT-14 Dual Pane | Pass |
| UAT-15 Refresh | Pass |

Evidence: `phase_tmp/browser_uat_results_rerun.json`, `phase_tmp/browser_uat_screenshots_rerun/`.

### Console / network

- React Hooks order warnings in `FocusTaskWorkspace` (non-blocking).
- `net::ERR_ABORTED` on in-flight requests during navigation (expected).

### Runtime lock recommendation (rerun)

- Connectivity blocker **resolved**.
- Keep **CONDITIONAL_LOCK** until human sign-off on UAT-02/04/07/08.
- May **recommend** `PHASE_CHECKLIST_RUNTIME_LOCK` after operator confirms remaining rows — do not execute lock in this phase.

### Final status (rerun)

**GO_WITH_WARNINGS**
