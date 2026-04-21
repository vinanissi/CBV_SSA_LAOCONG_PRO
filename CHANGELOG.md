# CHANGELOG

## 2026-04-21 — HO_SO Phase C (delete deprecated wrappers + canonical-only gate)

**Breaking for anyone still using the legacy HO_SO names inside this repo.** External contracts (AppSheet webhook actions, Lovable gateway `action` strings such as `createHoSo`/`generateHoSoReport`, sheet schemas) are unchanged.

### Removed — deprecated wrappers (defined in Phase A, intended as migration bridge)
- `10_HOSO_SERVICE.js` — the entire "DEPRECATED WRAPPERS" block (22 aliases): `createHoSo`, `createHoso`, `updateHoso`, `changeHosoStatus`, `setHoSoStatus`, `closeHoso`, `softDeleteHoso`, `addHosoFile`, `attachHoSoFile`, `removeHosoFile`, `addHosoRelation`, `createHoSoRelation`, `removeHosoRelation`, `getHosoById`, `getHosoFiles`, `getHosoRelations`, `getHosoLogs`, `getExpiringHoso`, `getExpiredHoso`, `checkHoSoCompleteness`, `getExpiringDocs`, `generateHoSoReport`.
- `10_HOSO_WRAPPERS.js` — legacy entry aliases removed: `runHosoTests`, `runHoSoTests`, `runHosoSmokeTest`, `hosoRunAudit`, `hosoRunAuditImpl`, `auditHoSoModule`, `auditHoSoModuleImpl`, `seedHoSoDemo`, `seedHoSoDemoImpl`, `hosoRunFullDeploymentMenu`, `hosoRunFullDeploymentMenuImpl`, `runHosoFullDeployment`. File now contains only canonical: `hosoRunTests`, `hosoRunSmokeTest`, `hosoAudit`, `hosoSeedDemo`, `hosoFullDeploy`, `testHoSoRelations`/`testHoSoRelationsImpl`.
- `10_HOSO_AUDIT_REPAIR.js` — `_hosoLoaded` alias removed (use `hosoAuditLoaded_`).

### Changed — final Phase-B residual call-site cleanup (found by Phase C audit)
- `10_HOSO_MENU.js` — `menuAuditHoSoImpl` now calls `hosoRunTests()` (was `runHosoTestsImpl`); `menuSeedHoSoDemoImpl` now calls `hosoSeedDemo()` (was `seedHoSoDemoImpl`); `menuHosoFullDeployImpl` now calls `hosoFullDeploy({includeMigration:false})` (was `hosoRunFullDeploymentMenuImpl`).
- `90_BOOTSTRAP_MENU_HELPERS.js` — `showMissingFunctionReport.requiredImpl` registry updated: `runHoSoTests` → `hosoRunTests`, `checkHoSoCompleteness` → `hosoCheckCompleteness`, `getExpiringDocs` → `hosoQueryExpiringDocs`, `generateHoSoReport` → `hosoGenerateReport`.

### Added — regression gate
- `10_HOSO_AUDIT_REPAIR.js::auditHosoCanonicalOnly_()` — runtime probe that asserts none of the 33 removed identifiers are redeclared in the global scope. If any `typeof <legacy_name> === 'function'` passes, emits a HIGH finding with code `HOSO_LEGACY_ALIAS_REDECLARED`.
- `10_HOSO_WRAPPERS.js::hosoAudit()` — now includes the canonical-only probe in its aggregated result (`{canonical: {...}}`).
- `10_HOSO_TEST.js::runHosoSmokeTestImpl` — adds a `'auditHosoCanonicalOnly_'` step so every smoke run surfaces an accidental re-alias immediately.

### Grep gate (recommended CI / pre-commit hook)
```bash
rg -n "\b(createHoSo|createHoso|updateHoso|changeHosoStatus|setHoSoStatus|closeHoso|softDeleteHoso|addHosoFile|attachHoSoFile|removeHosoFile|addHosoRelation|createHoSoRelation|removeHosoRelation|getHosoById|getHosoFiles|getHosoRelations|getHosoLogs|getExpiringHoso|getExpiredHoso|checkHoSoCompleteness|getExpiringDocs|generateHoSoReport|runHoSoTests|runHosoTests|runHosoSmokeTest|hosoRunAudit|hosoRunAuditImpl|auditHoSoModule|auditHoSoModuleImpl|seedHoSoDemo|seedHoSoDemoImpl|hosoRunFullDeploymentMenu|hosoRunFullDeploymentMenuImpl|runHosoFullDeployment|_hosoLoaded)\s*\(" 05_GAS_RUNTIME/ --glob '*.js'
```
After Phase C, this command MUST return zero matches across `05_GAS_RUNTIME/*.js` (wrapper definitions no longer exist; the canonical-only gate catches any re-introduction at runtime).

### Verified
- Final grep across `05_GAS_RUNTIME/*.js` → zero matches on the 33-identifier blocklist.
- Lint clean on all touched files: `10_HOSO_SERVICE.js`, `10_HOSO_WRAPPERS.js`, `10_HOSO_AUDIT_REPAIR.js`, `10_HOSO_TEST.js`, `10_HOSO_MENU.js`, `90_BOOTSTRAP_MENU_HELPERS.js`.

### Migration note for downstream consumers
If an external Google Apps Script project has `.gs` calling `createHoSo`, `changeHosoStatus`, etc., they will break with `ReferenceError`. Rebind to canonical names:

| Old identifier | New identifier |
|---|---|
| `createHoSo` / `createHoso` | `hosoCreate` |
| `updateHoso` | `hosoUpdate` |
| `changeHosoStatus` / `setHoSoStatus` / `closeHoso(id,note)` | `hosoSetStatus` (pass `'CLOSED'` for close) |
| `softDeleteHoso` | `hosoSoftDelete` |
| `addHosoFile` / `attachHoSoFile` | `hosoFileAdd` |
| `removeHosoFile` | `hosoFileRemove` |
| `addHosoRelation` / `createHoSoRelation` | `hosoRelationAdd` |
| `removeHosoRelation` | `hosoRelationRemove` |
| `getHosoById` | `hosoGetById` |
| `getHosoFiles` / `getHosoRelations` / `getHosoLogs` | `hosoListFiles` / `hosoListRelations` / `hosoListLogs` |
| `getExpiringHoso` / `getExpiredHoso` | `hosoQueryExpiring` / `hosoQueryExpired` |
| `checkHoSoCompleteness` | `hosoCheckCompleteness` |
| `getExpiringDocs` | `hosoQueryExpiringDocs` |
| `generateHoSoReport` | `hosoGenerateReport` |
| `runHoSoTests` / `runHosoTests` | `hosoRunTests` |
| `runHosoSmokeTest` | `hosoRunSmokeTest` |
| `auditHoSoModule` / `auditHoSoModuleImpl` / `hosoRunAudit` / `hosoRunAuditImpl` | `hosoAudit` |
| `seedHoSoDemo` / `seedHoSoDemoImpl` | `hosoSeedDemo` |
| `runHosoFullDeployment` / `hosoRunFullDeploymentMenu` / `hosoRunFullDeploymentMenuImpl` | `hosoFullDeploy({includeMigration:false})` |
| `_hosoLoaded` | `hosoAuditLoaded_` |

External API contract strings (AppSheet webhook action keys, Lovable gateway `action: 'createHoSo'` etc.) are **unchanged**.

## 2026-04-21 — HO_SO Phase B (internal caller migration to canonical API)

**Non-breaking.** Legacy `@deprecated` wrappers are still defined in `10_HOSO_SERVICE.js`, `10_HOSO_WRAPPERS.js`, `10_HOSO_AUDIT_REPAIR.js`. External AppSheet/Lovable payload contracts unchanged.

### Changed — call sites migrated (legacy name → canonical name)
- `60_HOSO_API_GATEWAY.js`
  - `_api_createHoSo_`: `createHoSo(data)` → `hosoCreate(data)`.
  - `_api_updateHoSo_`: `updateHoso(id, patch)` → `hosoUpdate(id, patch)`.
- `99_APPSHEET_WEBHOOK.js` (all 3 HO_SO pending actions now call the canonical service directly)
  - `hosoActivate` handler: `changeHosoStatus(id,'ACTIVE',note)` → `hosoSetStatus(id,'ACTIVE',note)`.
  - `hosoClose` handler: `changeHosoStatus(id,'CLOSED',note)` → `hosoSetStatus(id,'CLOSED',note)`.
  - `hosoArchive` handler: `changeHosoStatus(id,'ARCHIVED',note)` → `hosoSetStatus(id,'ARCHIVED',note)`.
- `10_HOSO_SEED.js`
  - `ensureHosoDemoHtxRoot_`: `createHoSo(...)` → `hosoCreate(...)`.
  - `seedHosoDemoData_`: `createHoSo(...)` → `hosoCreate(...)`.
- `99_DEBUG_TEST_RUNNER.js`
  - `runAllModuleTests`: `runHoSoTests()` → `hosoRunTests()`.
- `03_SHARED_PENDING_FEEDBACK.js`
  - `PENDING_ADAPTER_HOSO.findById`: `getHosoById(id)` → `hosoGetById(id)`.

### Verified
- Gate A (no caller uses legacy names): `rg '\b(createHoSo|createHoso|updateHoso|changeHosoStatus|setHoSoStatus|closeHoso|softDeleteHoso|addHosoFile|attachHoSoFile|addHosoRelation|createHoSoRelation|removeHosoFile|removeHosoRelation|getHosoById|getHosoFiles|getHosoRelations|getHosoLogs|getExpiringHoso|getExpiredHoso|checkHoSoCompleteness|getExpiringDocs|generateHoSoReport|runHoSoTests|seedHoSoDemo|runHosoFullDeployment|_hosoLoaded)\(' 05_GAS_RUNTIME` → matches ONLY wrapper DEFINITIONS in `10_HOSO_SERVICE.js`, `10_HOSO_WRAPPERS.js`, `10_HOSO_AUDIT_REPAIR.js`. Zero external call sites remain.
- Gate B (canonical targets exist): `hosoCreate`, `hosoUpdate`, `hosoSetStatus`, `hosoGetById`, `hosoRunTests` all defined.
- Lint: zero errors on `60_HOSO_API_GATEWAY.js`, `99_APPSHEET_WEBHOOK.js`, `10_HOSO_SEED.js`, `99_DEBUG_TEST_RUNNER.js`, `03_SHARED_PENDING_FEEDBACK.js`.

### Scope NOT in Phase B (deferred to Phase C)
- Removing `@deprecated` wrappers in `10_HOSO_SERVICE.js`, `10_HOSO_WRAPPERS.js`, `10_HOSO_AUDIT_REPAIR.js`.
- Adding a CI lint rule that fails if any legacy HO_SO name reappears in a call site.
- `PENDING_ADAPTER_HOSO.updatePending` still calls `_updateRow(HO_SO_MASTER, row, patch)` — this is a pending-framework primitive toggle (not an HO_SO business mutation) and is out of scope for the HO_SO canonical service migration. If/when we introduce `hosoUpdatePending(id, patch)` as a dedicated canonical, the adapter will move then.

## 2026-04-21 — HO_SO Phase A (canonicalize + event-driven alignment)

**Non-breaking.** All legacy function names continue to work as `@deprecated` wrappers; AppSheet webhook, Lovable gateway, menu, and triggers are untouched.

### Added
- `05_GAS_RUNTIME/10_HOSO_EVENTS.js` — single source of HO_SO event emits (`hosoEmitCreated_`, `hosoEmitUpdated_`, `hosoEmitStatusChanged_`, `hosoEmitClosed_`, `hosoEmitSoftDeleted_`, `hosoEmitFileAdded_`, `hosoEmitFileRemoved_`, `hosoEmitRelationAdded_`, `hosoEmitRelationRemoved_`).
- `04_CORE_EVENT_TYPES.js` — 7 new event constants: `HO_SO_UPDATED`, `HO_SO_CLOSED`, `HO_SO_DELETED`, `HO_SO_FILE_ADDED`, `HO_SO_FILE_REMOVED`, `HO_SO_RELATION_ADDED`, `HO_SO_RELATION_REMOVED`.
- `10_HOSO_REPOSITORY.js` — named writers (`hosoRepoAppendMaster/File/Relation/Log`, `hosoRepoUpdateMaster/File/Relation`), `hosoRepoFindMasterCodeById`, `hosoRepoMasterCodeIndexForHoSoType` (memoized), `hosoRepoListMastersByTypeId/ByHtxId`.
- `10_HOSO_AUDIT_REPAIR.js` — `auditHosoHtxIntegrity()` probe (HTX_SELF_REF, HTX_MISSING, HTX_ORPHAN, HTX_WRONG_TYPE, HTX_DELETED); renamed `_hosoLoaded` → `hosoAuditLoaded_`.
- `10_HOSO_TEST.js` — 3 negative tests (bad-transition, HTX self-reference, orphan HTX_ID); opt-in teardown via script property `CBV_HOSO_TEST_TEARDOWN=true`.
- `60_HOSO_API_GATEWAY.js` — new endpoints: `removeHoSoFile`, `removeHoSoRelation`, `softDeleteHoSo`, `getHoSoCompleteness`, `getHoSoExpiringDocs`, `generateHoSoReport`.

### Changed
- `10_HOSO_SERVICE.js` — full rewrite. Canonical API: `hosoCreate/hosoUpdate/hosoSetStatus/hosoSoftDelete/hosoFileAdd/hosoFileRemove/hosoRelationAdd/hosoRelationRemove/hosoGetById/hosoListFiles/hosoListRelations/hosoListLogs/hosoQueryExpiring/hosoQueryExpired/hosoQueryExpiringDocs/hosoCheckCompleteness/hosoGenerateReport`. All legacy names (createHoSo/createHoso/updateHoso/changeHosoStatus/setHoSoStatus/closeHoso/softDeleteHoso/addHosoFile/attachHoSoFile/addHosoRelation/createHoSoRelation/removeHosoFile/removeHosoRelation/getHoso*/getExpiring*/getExpired*/checkHoSoCompleteness/getExpiringDocs/generateHoSoReport) are `@deprecated` wrappers.
- `10_HOSO_SERVICE.js` — merged `addHosoFile`+`attachHoSoFile` into `hosoFileAdd`; merged `addHosoRelation`+`createHoSoRelation` into `hosoRelationAdd`; `closeHoso` reroutes to `hosoSetStatus(id,'CLOSED',note)`.
- `10_HOSO_SERVICE.js` — zero direct sheet primitives. Grep gate: `rg '_findById|_appendRecord|_rows\(|_sheet\(' 10_HOSO_SERVICE.js` returns only the reminder comment.
- `10_HOSO_SERVICE.js` — event emission coverage (was 2 events) now complete: CREATED, UPDATED, STATUS_CHANGED, CLOSED, DELETED, FILE_ADDED, FILE_REMOVED, RELATION_ADDED, RELATION_REMOVED.
- `10_HOSO_SERVICE.js` — `hosoAppendLogEntry` no longer throws on bad ACTOR_ID; resolves via `hosoResolveActorIdSafe_` and blanks on failure.
- `10_HOSO_BOOTSTRAP.js` — new `hosoFullDeployImpl(opts)` with safe defaults `{includeMigration:false, includeDemoSeed:false, includeSmokeTest:true}`. Legacy `runHosoFullDeployment` delegates via wrapper.
- `10_HOSO_WRAPPERS.js` — canonical entrypoints `hosoRunTests`, `hosoRunSmokeTest`, `hosoAudit`, `hosoSeedDemo`, `hosoFullDeploy`; legacy `runHo*`, `audit*Impl`, `seed*Impl` kept as `@deprecated` wrappers.
- `60_HOSO_API_GATEWAY.js` — **BUG FIX**: `_api_getActiveHtxList_`, `_api_getHoSoListForSearch_`, `_api_getDashboard_` now resolve type via `_hosoResolveTypeCode_(row)` → `HO_SO_TYPE_ID → MASTER_CODE.CODE` (was reading legacy `HO_SO_TYPE` column). Transition validation removed from gateway (now single source in service).
- `60_HOSO_API_GATEWAY.js` — `_api_addHoSoRelation_` accepts either legacy `HO_SO_ID` or canonical `FROM_HO_SO_ID`.
- `.clasp.json` / `CLASP_PUSH_ORDER.md` — register `10_HOSO_EVENTS.js` between validation and service.
- `FUNCTION_WRAPPER_MAP.md` — new HO_SO canonical section + migration plan A/B/C.

### Migration plan
- **Phase A (this change)** — canonical exists, legacy wraps, no caller changes required.
- **Phase B** — migrate internal call sites to canonical names.
- **Phase C** — remove `@deprecated` wrappers; enforce canonical via CI grep gate.

### Constraints honored
- DO NOT break AppSheet webhook ✓ (`PENDING_ADAPTER_HOSO` / `taskStart` / `hosoActivate` unchanged).
- DO NOT remove alias yet ✓ (all legacy names still work).
- DO NOT change sheet schema ✓.
- MUST keep idempotent seed ✓ (default `includeMigration=false`, `includeDemoSeed=false`).

## laocong-pro-1.0.0

- **Docs & manifests:** Tham chiếu runtime GAS thống nhất sang `*.js` (cùng `clasp` / `build_manifest.json`, tài liệu, audit, `claude_exports`, rule Cursor, snapshot trong `claude/` / `07_TEST`). Đổi tên file snapshot `claude_exports/**` và `07_TEST/*.gs` → `*.js`.

- **[FEATURE] Pending Action Registry** — Refactor `withTaskFeedback` thành generic `withPendingFeedback` + `ACTION_REGISTRY`; đăng ký 3 Finance actions (`finConfirm` / `finCancel` / `finArchive`); router webhook dispatch tự động qua `getRegisteredAction`.

- Khóa lại full tài liệu meta
- Bổ sung business spec sâu cho HO_SO / TASK_CENTER / FINANCE
- Bổ sung AppSheet build mapping master
- Bổ sung GAS runtime chuẩn service/repository/log/validation
- Bổ sung schema CSV và sample data generator
- Bổ sung audit checklist và manifest builder
