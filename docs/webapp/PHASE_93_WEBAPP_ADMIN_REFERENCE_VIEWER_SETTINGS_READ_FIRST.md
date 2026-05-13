# PHASE 93 — WebApp Admin Reference Viewer / Settings Read-First

**Status:** Operational Governance Layer (read-first).  
**Branch:** `phase/from-v2.4.1-TASK-FIN`  
**Repo:** `D:\Workspace\projects\CBV_SSA_LAOCONG_PRO`  
**Standard:** CBV Operational Ecosystem Standard V1 · CBV_TCS_V1.

---

## 1. Purpose

Promote `/admin/reference` from a Phase 89 placeholder into a real read-first governance page. It surfaces reference registries (enums, users, teams, roles, feature flags, system registry, UI contract, route registry) so admins can audit configuration **without** being able to change it from the WebApp.

This phase exists because Phase 92 already gives operators an observability surface (`/runtime/health` + `/reports`). Phase 93 adds the *governance surface* — “what is configured?” — while staying read-first.

## 2. Governance layer (concept)

| Layer | Examples | Mutation |
|-------|----------|----------|
| Pilot Pages (Phase 90/91) | Home, Queue, SLA, Timeline, Kanban | Read-first |
| Observability (Phase 92) | `/runtime/health`, `/reports` | Read-first |
| **Governance (Phase 93)** | `/admin/reference` | **Read-first** |
| AppSheet shell | Lightweight operator actions (manual-first) | Mutation lives elsewhere |
| Sheets (DB) | Source of truth | Mutated by services / scripts only |

The Governance Layer answers “*what does the system think the rules are?*” It never answers “*change the rules from this UI.*”

## 3. Scope (in)

- `/admin/reference` read-first viewer.
- Governance summary cards (sheet presence + row counts + totals).
- Enum dictionary summary (groups + samples).
- User / role / team summary (emails masked).
- Feature flag summary (count + sample, no toggles).
- System registry summary.
- UI contract summary (via `CbvUiContract_getAll()` if available).
- Route registry summary (via `CbvWebAppWorkspace_routeRegistry()` if available).
- Warnings when sheets / config are missing.
- CBV_TCS_V1 Test Console under `🧪 CBV Test Console → Phase 93 — Admin Reference`.

## 4. Out of scope

- Editing settings.
- Creating / updating / deleting users.
- Permission changes / role grants.
- Feature flag toggling.
- ENV-A / secrets / tokens / API keys exposure.
- AI runtime / queue intelligence.
- Production certification.

## 5. Safety rules

1. **No mutation.** Phase 93 code is scanned with a namespace-scoped “verb-at-start” validator (`set`, `update`, `create`, `delete`, `save`, `mutate`, `assign`, `escalate`, `resolve`, `complete`, `toggle`, `enable`, `disable`, `grant`, `revoke`, `provision`, `deprovision`, `edit`, `reset`, `rotate`). Render helpers (`*State_`, `*render*`, `*TestConsole_*`) are allow-listed.
2. **No edit / toggle / delete buttons** in the UI.
3. **Secrets masked.** Column names matching `SECRET`, `TOKEN`, `APIKEY`, `API_KEY`, `PRIVATE_KEY`, `PASSWORD`, `PASS_HASH`, `CLIENT_SECRET`, `WEBHOOK_SECRET`, `BEARER`, `OAUTH_TOKEN` are flagged; their **values are never rendered** — only column names and a warning.
4. **Missing reference sheets** → warning only, no auto-create, no uncontrolled throw.
5. **Emails masked** (e.g., `o***x@domain`) when shown in summary cards.
6. **No production claim**, no “production ready” phrasing.
7. **No auto assign / auto resolve / auto escalate.**
8. **999 dispatcher** (`999_WEBAPP_DOGET_DISPATCHER_FINAL.js`) remains absolute last in `.clasp.json` `filePushOrder`.

## 6. Routes affected

| Route | Before Phase 93 | After Phase 93 |
|-------|-----------------|----------------|
| `/admin/reference` | Phase 89 placeholder | Phase 93 read-first viewer via `CbvWebAppPilotRenderer_renderAdminReferencePlaceholder` → `CbvWebAppAdminRef_renderReferenceViewer()` |

If Phase 93 runtime fails to load, the placeholder falls back gracefully (`Phase 93 admin reference renderer not loaded.`).

## 7. Data flow

```
SpreadsheetApp → reference sheets (probe)
CbvUiContract_getAll() → UI contract summary
CbvWebAppWorkspace_routeRegistry() → route registry summary
       ↓
997_WEBAPP_ADMIN_REFERENCE_DATA.js (CbvWebAppAdminRef_get* + _validate)
       ↓
998_WEBAPP_ADMIN_REFERENCE_RENDERER.js (CbvWebAppAdminRef_renderReferenceViewer)
       ↓
WEBAPP_ADMIN_REFERENCE_VIEWER.html (template, read-first only)
```

## 8. Pilot / production readiness

- Admin Reference readiness: **GO_WITH_WARNINGS** until UAT (some optional reference sheets may be missing).
- Production readiness: **NOT YET** (manual-first; pilot tag only after UAT).
- Next: Phase 94 — WebApp UI Foundation Freeze / UAT Hardening.

## 9. References

- `00_SYSTEM_BRAIN/000_TEST_CONSOLE/CBV_TCS_V1/docs/CBV_TCS_V1_STANDARD.md`
- `docs/architecture/WEBAPP_LED_OPERATIONAL_WORKSPACE.md`
- `docs/webapp/PHASE_92_WEBAPP_RUNTIME_HEALTH_REPORT_VIEWER.md`
