# 033 — Phase 94 WebApp UI Foundation Freeze / UAT Hardening — Handoff

For: the next AI or engineer running the WebApp pilot UAT and planning Phase 95.

---

## Phase 94 scope

- **Freeze the WebApp UI contract** at pilot tier across Phase 90 – 93 surfaces.
- **Lock down** route paths, modes, FE state vocabulary, safety footer phrases, responsive + a11y baseline.
- **No new feature, no new mutation, no production claim.**
- Add CBV_TCS_V1 Test Console for the freeze: `🧪 CBV Test Console → Phase 94 — UI Freeze / UAT`.

## Frozen route list

| Route | Owner | Mode | Status | Page | Renderer |
|-------|-------|------|--------|------|----------|
| `/workspace` | WebApp | READ_FIRST | PILOT | Home Workspace | `CbvWebAppPilotRenderer_renderHome` |
| `/home-alert/my-queue` | WebApp + AppSheet lightweight shell | READ_FIRST | PILOT | My Queue | `CbvWebAppPilotRenderer_renderQueue` |
| `/home-alert/sla` | WebApp | READ_FIRST | PILOT | SLA Dashboard | `CbvWebAppPilotRenderer_renderSla` |
| `/home-alert/timeline` | WebApp | READ_FIRST | PILOT | Timeline | `CbvWebAppTimelineKanban_renderTimeline` |
| `/home-alert/kanban` | WebApp | READ_FIRST | PILOT | Kanban | `CbvWebAppTimelineKanban_renderKanban` |
| `/runtime/health` | WebApp | READ_FIRST | PILOT | Runtime Health | `CbvWebAppObservability_renderRuntimeHealth` |
| `/reports` | WebApp | READ_FIRST | PILOT | Report Viewer | `CbvWebAppObservability_renderReportViewer` |
| `/admin/reference` | WebApp | READ_FIRST | PILOT | Admin Reference Viewer | `CbvWebAppAdminRef_renderReferenceViewer` |

Plus `?action=ping` (READ_ONLY) handled by `999_WEBAPP_DOGET_DISPATCHER_FINAL`.

## Frozen UI semantics

- **Page shell:** title + route chip + READ_FIRST badge + safety footer.
- **Nav (8 items):** Workspace · My Queue · SLA · Timeline · Kanban · Runtime · Reports · Admin Reference.
- **Card primitives:** `cbv-card`, `cbv-muted`, `cbv-badge` / `.ok` / `.warn` / `.crit`, `<pre class="cbv-pre">`.
- **FE state vocabulary (frozen):** `loading | empty | warning | error | partial | ready`.
- **Cards never contain mutation buttons** (no Save / Edit / Delete / Toggle / Assign / Resolve / Escalate / drag-drop save).
- **Status badges combine text + colour** — never colour only.

## Safety footer standard

Base 4 phrases on every operational route footer:

- `No auto assign`
- `No auto resolve`
- `No auto escalate`
- `No production claim`

Timeline + Kanban also include `No drag-drop save`.

Per-page add-ons are allowed (Phase 92 adds `No auto-heal`, Phase 93 adds `Secrets masked`, etc.), but the base 4 must appear verbatim.

## UAT checklist (high-level)

`docs/webapp/WEBAPP_UAT_MASTER_CHECKLIST.md` — 11 blocks: preconditions, Test Console, route smoke, data visibility, warning states, no-mutation UI, responsive, accessibility, report/audit, governance, pass/warn/fail criteria + sign-off.

`docs/webapp/WEBAPP_ROUTE_SMOKE_TEST_MATRIX.md` — per-route URL + expected handler + expected page title + required footer phrases + expected no-write behaviour.

## Known limitations

- Apps Script cannot read `.clasp.json` at runtime → the Phase 94 validator surfaces a `WARNING` for "999 last" instead of `OK`. This is by design; verified locally and documented in `CLASP_PUSH_ORDER.md`.
- Apps Script cannot inspect local repo files → doc presence is asserted out-of-band (PR review) rather than at runtime, surfaced as `WARNING` only.
- Three `*_COMPONENTS.html` partials remain by design (Phase 90/92/93). Consolidation is deferred to a future polish phase.
- State mapper names differ across phases (`renderState_` / `__mapState_` / `_mapState_`). Intentional after Phase 91.1 hotfix; will unify in a later polish phase.
- HTML Service iframe / CSP constraints limit advanced layout. Pilot baseline acknowledges this.

## No-mutation rule (Phase 94)

- Phase 94 namespace is `CbvWebAppUiFreeze_*`.
- `CbvWebAppUiFreeze_validate()` scans for verb-at-start mutation names in this namespace using the same pattern as Phase 91.1 / 92 / 93:
  `set | update | create | delete | save | mutate | assign | escalate | resolve | complete | toggle | enable | disable | grant | revoke | provision | deprovision | edit | reset | rotate | heal | repair`.
- Allowlist: `_get*`, `_validate`, `_render*` (none yet in this phase), private helpers (`__*`), Test Console (`*TestConsole_*`).
- The Phase 94 Test Console (`998C`) exposes this through `NO_WRITE_MUTATION` and prohibits write/mutation/auto-heal/drag-drop-save recommendations in the handoff text.

## Masking / secrets rule (carry-over)

Carry-over from Phase 93. Phase 94 does **not** introduce any new data binding, so no new masking rule is needed. The validator still asserts secrets / tokens / API keys are not surfaced anywhere in WebApp UI (verified per Phase 93 secret-column scanner).

## Pilot tag

After UAT sign-off, optional pilot tag: `v2.4.11-webapp-ui-foundation-freeze`.  
**No production tag.** Production sign-off only after Phase 95 staff trial **and** an explicit production decision file in `00_SYSTEM_BRAIN/002_DECISIONS/`.

## Recommended next phase

**Phase 95 — WebApp Pilot UAT Runbook / Staff Trial.**

Focus areas for Phase 95:

1. Author the staff trial runbook (operator script, supervisor script, admin script).
2. Define the cohort, the duration, the data-collection approach (forms, surveys, Test Console JSON archives).
3. Document expected user feedback channels (no in-WebApp feedback widget — operators report via existing channels).
4. Define exit criteria for graduating from pilot → production-candidate.
5. Record a successor decision file when graduation criteria are met.

Until Phase 95 completes, **do not** claim production readiness for any WebApp route.

## Safety summary (must persist in future phases)

- Read-first only.
- No mutation buttons / no writeback / no drag-drop save.
- Safety footer phrases verbatim on every operational route.
- FE state vocabulary unchanged.
- Route freeze matrix unchanged.
- Secrets / tokens / API keys masked.
- `999_WEBAPP_DOGET_DISPATCHER_FINAL.js` absolute last in `.clasp.json` filePushOrder.
- No production claim.
