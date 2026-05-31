# PHASE_GAS_RUNTIME_API_FILE_LOAD_ORDER_REFACTOR — Handoff

**Status:** GO_WITH_WARNINGS

---

## Shipped

- All 36 `gas-runtime-api/*.js` files renamed to `00_`–`99_` load-order prefixes (see report mapping table).
- `Code.js` → `90_DoGetDoPost.js` — `doGet` / `doPost` unchanged.
- ADR: `00_SYSTEM_BRAIN/002_DECISIONS/ADR_GAS_FILE_LOAD_ORDER.md`
- Workboard GAS path checks updated (8 files under `apps/workboard/src/modules/task/`).

## Not done (by design)

- No `clasp push` / no new Web App deployment version.
- Historical reports/prompts not backfilled with new filenames.

---

## Operator verify

```powershell
cd gas-runtime-api
clasp status
# Expect 36 numbered .js files + appsscript.json

cd ..\apps\workboard
npm run build
npx tsx -e "import { runWorkInboxOperationalRuntimeChecks } from './src/modules/task/inbox/operationalRuntime/workInboxOperationalRuntimeChecks.ts'; console.log(runWorkInboxOperationalRuntimeChecks());"
```

Optional GAS editor smoke (after push):

```javascript
// Apps Script editor — run any test console, e.g.:
CBV_TCS_GS_03_runAll();
```

Health curl (after deploy):

```bash
curl "YOUR_GAS_URL?action=health"
```

---

## Deploy (when ready)

```powershell
cd gas-runtime-api
clasp push
```

Apps Script → **Deploy → Manage deployments → Edit → New version → Deploy**

**Warning:** Remote project will delete old file names and add new ones on push. No logic change expected, but operator should run one health + one task-db POST smoke after deploy.

---

## Do not regress

- Clasp `fileExtension: "js"` and standalone Web App config in `appsscript.json`.
- Load order: configs (00–04) before services (40–48) before API (60–62) before entry (90).
- Append-only audit/timeline behavior unchanged.

---

## Next step

| Action | Owner |
|--------|-------|
| `clasp push` + new deployment | Operator |
| Post-deploy smoke: `?action=health`, POST `getTaskWorkspaceSnapshot` | Operator |
| Ratify ADR if load-order policy accepted | Tech lead |

**Gate:** GO for merge locally; GO_WITH_WARNINGS for production until clasp push confirmed.
