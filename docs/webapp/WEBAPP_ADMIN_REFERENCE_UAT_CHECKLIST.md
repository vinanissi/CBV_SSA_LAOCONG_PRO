# WebApp Admin Reference — UAT Checklist (Phase 93)

UAT acceptance for the read-first governance viewer `/admin/reference`.

---

## 0. Preconditions

- Phase 92 already deployed (`/runtime/health`, `/reports` read-first).
- `clasp push --force` completed.
- Deployment refreshed (Apps Script → Deploy → Manage deployments → New version).

## 1. Health check (Test Console)

- [ ] `🧪 CBV Test Console → Phase 93 — Admin Reference → Run Admin Reference Health Check` returns `GO` or `GO_WITH_WARNINGS`.
- [ ] `envelopeOk = yes`.
- [ ] `NO_WRITE_MUTATION` check is `OK`.
- [ ] `ROUTE_ADMIN_REFERENCE_BRIDGE` is `OK` and `ROUTE_ADMIN_REFERENCE_REGISTERED` is `OK`.
- [ ] `ALL_READ_FIRST` is `OK` (every registered route is `READ_FIRST`).
- [ ] `FINAL_DOGET_DISPATCHER` is `OK` and `999_WEBAPP_DOGET_DISPATCHER_FINAL.js` is still last in `.clasp.json` filePushOrder.

## 2. Open route

- [ ] Visit `?route=/admin/reference`.
- [ ] The page renders Admin Reference Viewer (read-first) heading.
- [ ] No browser console error (HTML evaluates).

## 3. Governance cards

- [ ] Governance Summary card shows `status` + `severity` badges.
- [ ] Each required sheet (`ENUM_DICTIONARY`, `USER_DIRECTORY`, `MASTER_CODE`, `DON_VI`, `TEAM_DIRECTORY`, `ROLE_PERMISSION_MATRIX`, `FEATURE_FLAG`, `SYSTEM_REGISTRY`, `CBV_UI_CONTRACT`) is listed with `PRESENT` or `MISSING`.
- [ ] Missing sheets surface in the Warnings card but the page still renders.
- [ ] Totals line shows enums / users / teams / roles / feature flags / systems / UI contracts / routes.

## 4. Enum summary

- [ ] Total count + group count match expectations.
- [ ] Groups are sorted by descending count.
- [ ] `sampleValues` shows up to 5 readable values per group.
- [ ] No raw secret-looking strings present.

## 5. User/role/team summary

- [ ] Users sample lists masked emails (e.g. `o***x@domain`).
- [ ] Roles list shows permission count + modules.
- [ ] Teams count visible in the header.
- [ ] No full-email leak. No password / token visible anywhere.

## 6. Feature flag summary

- [ ] Count + enabled/disabled split visible.
- [ ] **No toggle / enable / disable buttons** are rendered.
- [ ] Owner emails are masked.

## 7. System registry summary

- [ ] Systems shown with status badge.
- [ ] If `SYSTEM_REGISTRY` has columns matching secret patterns, the warnings list mentions “values are masked”.
- [ ] No raw token / API key value rendered.

## 8. UI contract summary

- [ ] `byChannel` and `byScreenType` JSON-like summary visible.
- [ ] Sample contracts list `screenCode`, channel, screen type, module, web app route, AppSheet view.
- [ ] `PILOT_READY` / `PENDING` badge correct.

## 9. Route registry summary

- [ ] Total + read-first count visible.
- [ ] Sample routes list `route`, mode, pageType, required role, pilot-ready.
- [ ] `/admin/reference` appears in the listing with `mode = READ_FIRST`.

## 10. Safety

- [ ] No edit / toggle / delete buttons anywhere on the page.
- [ ] No “production ready” claim is shown.
- [ ] Safety footer reads: `No edit · No toggle · No delete · No feature flag toggle · No permission change · Secrets masked · No production claim.`
- [ ] Secrets / tokens / API keys never appear in plain text.

## 11. Test Console actions

- [ ] `Show Governance Summary` opens a dialog with envelope-shaped JSON.
- [ ] `Show Enum Summary` opens a dialog with `data.groups[]`.
- [ ] `Show User/Role Summary` masks emails.
- [ ] `Show UI Contract Summary` does not expose raw contract internals beyond the documented field set.
- [ ] `Show Route Registry Summary` lists registered routes.
- [ ] `Show AI Handoff Prompt` displays Phase 93 prompt with the required safety phrases.
- [ ] `Copy Latest Report` opens the modal copy dialog.

## 12. Acceptance

- Status: **GO_WITH_WARNINGS** acceptable for pilot.
- Production: **NOT YET**.
- Optional pilot tag after sign-off: `v2.4.10-webapp-admin-reference`.
