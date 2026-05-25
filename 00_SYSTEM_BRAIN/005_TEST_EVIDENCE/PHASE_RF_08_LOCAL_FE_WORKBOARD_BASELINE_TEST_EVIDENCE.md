# PHASE_RF_08 — Local FE Workboard Baseline — Test Evidence

## Environment

| Field | Value |
|-------|-------|
| **Branch** | `phase/from-v2.4.1-TASK-FIN-runtime-freeze` |
| **Path** | `apps/workboard/` |
| **Date** | 2026-05-25 |
| **Node** | local (npm install 140 packages) |

---

## Install result

```
npm install
added 139 packages, audited 140 packages
found 0 vulnerabilities
```

**Verdict:** PASS

---

## Typecheck result

```
npm run typecheck
> tsc --noEmit
(exit 0)
```

**Verdict:** PASS

---

## Build result

```
npm run build
> tsc --noEmit && vite build
✓ 71 modules transformed.
dist/index.html                   0.43 kB
dist/assets/index-D8fu8h0l.css   14.47 kB
dist/assets/index-D-AS7sOL.js   271.44 kB
✓ built in ~11s
```

**Verdict:** PASS

---

## Routes available

| Route | Component | Data source |
|-------|-----------|-------------|
| `/` | HomePage | mockApi.getTodaySummary |
| `/tasks` | TasksPage | mockApi.getTasks |
| `/tasks/:taskId` | TasksPage + detail | mockApi.getTaskDetail |
| `/finance` | FinancePage | mockApi.getFinanceItems |
| `/hoso` | HoSoPage | mockApi.getHoSoItems |
| `/coordination` | CoordinationPage | mockApi.getCoordination |
| `/observation` | ObservationPage | mockApi.getObservation |
| `/plugins` | PluginsPage | mockApi.getPlugins |
| `/search?q=` | SearchPage | mockApi.search |

---

## Manual smoke (local dev)

| Check | Expected | Status |
|-------|----------|--------|
| App loads without API URL | Demo user + today board | PASS (by design) |
| Top bar search | Navigates to `/search` | PASS |
| Task select | Right detail panel | PASS (xl viewport) |
| Finance/HoSo cards | “Chỉ xem trong phiên bản này” | PASS |
| Quick bar Upload | Disabled “Sắp mở” | PASS |
| No fetch to googleapis/sheets | — | PASS (mock only) |

---

## Known warnings

- No Cloudflare Worker — `VITE_CBV_API_BASE_URL` unused in RF_08
- No Playwright/Vitest suite
- Right detail panel hidden below `xl` breakpoint
- Demo data labeled “Dữ liệu demo — phiên bản local”

---

## Overall verdict

**GO_WITH_WARNINGS**
