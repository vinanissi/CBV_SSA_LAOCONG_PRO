# HO_SO Module — Audit, Redesign & Standardization (PRO)

**Scope:** the entire HO_SO domain (HTX) in this repository — GAS runtime files, gateway, webhook bindings, seed/migration/bootstrap, tests, docs.
**Author:** System Architect (GAS + CBV Framework).
**Status:** Design reference + phased action plan. Code changes proceed only after §8 is approved.

**Sources reviewed**

- `05_GAS_RUNTIME/10_HOSO_CONSTANTS.js`, `10_HOSO_CONFIG.js`, `10_HOSO_UTILS.js`, `10_HOSO_VALIDATION.js`, `10_HOSO_REPOSITORY.js`, `10_HOSO_SERVICE.js`, `10_HOSO_WRAPPERS.js`, `10_HOSO_SEED.js`, `10_HOSO_BOOTSTRAP.js`, `10_HOSO_MENU.js`, `10_HOSO_MIGRATION.js`, `10_HOSO_AUDIT_REPAIR.js`, `10_HOSO_TEST.js`
- `05_GAS_RUNTIME/60_HOSO_API_GATEWAY.js`, `99_APPSHEET_WEBHOOK.js`, `03_SHARED_PENDING_FEEDBACK.js`, `04_CORE_EVENT_*.js`
- Governing specs: `00_OVERVIEW/NAMING_CONVENTIONS.md`, `CBV_EVENT_DRIVEN_ARCHITECTURE.md`, `EVENT_DRIVEN_MIGRATION_PLAN.md`, `.cursor/rules/cbv-naming-conventions.mdc`
- Domain specs: `02_MODULES/HO_SO/DATA_MODEL.md`, `HO_SO_MODULE_PRO.md`, `SERVICE_CONTRACT.md`, `SERVICE_MAP.md`

---

## 1. Executive summary

| Area | Finding |
|---|---|
| **Naming canonicalization** | **Zero** of the ten canonical identifiers mandated by `NAMING_CONVENTIONS.md §8.1` (`hosoCreate`, `hosoUpdate`, `hosoSetStatus`, `hosoSoftDelete`, `hosoFileAdd`, `hosoRelationAdd`, `hosoRunTests`, `hosoAudit`, `hosoSeedDemo`, `hosoFullDeploy`) exist in code yet. The module still ships the aliases the doc says must become deprecation wrappers. |
| **`HoSo`/`Hoso` drift** | Mixed casing inside a single file: `createHoSo` vs `createHoso`, `changeHosoStatus` vs `setHoSoStatus`, `addHosoFile` vs `attachHoSoFile`, `addHosoRelation` vs `createHoSoRelation`. |
| **Layering** | `10_HOSO_SERVICE.js` calls **9 low-level shared I/O primitives directly** (`_findById`, `_appendRecord`, `_rows(_sheet(...))`) instead of going through `hosoRepo*` — breaks §3 ROLE contract ("một file chỉ chứa một ROLE"). |
| **Duplicate paths** | `addHosoFile` vs `attachHoSoFile` (two near-identical writers to `HO_SO_FILE`); `addHosoRelation` vs `createHoSoRelation` (two relation writers with different required fields); `closeHoso` vs `changeHosoStatus(id,'CLOSED',…)`; `hosoGenerateHoSoCode` vs `hosoRepoAllocateHoSoCode`. |
| **Event emission** | Only `HO_SO_CREATED` + `HO_SO_STATUS_CHANGED` emit. `updateHoso`, `addHosoFile`/`attachHoSoFile`, `addHosoRelation`/`createHoSoRelation`, `removeHosoFile`, `removeHosoRelation`, `softDeleteHoso`, `closeHoso` **do not emit** — blocks W3 in the event-driven plan. |
| **Gateway PRO-data bugs** | `_api_getActiveHtxList_` (line 392), `_api_getHoSoListForSearch_` (line 432) and `_api_getDashboard_` (line 449) still read the **legacy column `HO_SO_TYPE`** instead of resolving `HO_SO_TYPE_ID` → `MASTER_CODE.CODE`. On migrated PRO rows these return **empty/wrong** results. |
| **Gateway validation drift** | `_api_changeHoSoStatus_` re-implements transition validation with its own error format (third source, alongside service `hosoValidateStatusTransition` and future `RULE_DEF` rules). |
| **Gateway payload mismatch** | `_api_addHoSoRelation_` asserts `payload.HO_SO_ID` but the service (`addHosoRelation`) requires `FROM_HO_SO_ID` → the assertion passes, then the service throws with a different message. |
| **Wrapper map out-of-sync** | `05_GAS_RUNTIME/FUNCTION_WRAPPER_MAP.md` still references non-existent files (`99_DEBUG_TEST_HOSO.js` for `auditHoSoModule`, `99_DEBUG_SAMPLE_DATA.js` for `seedHoSoDemo`). |
| **Soft-delete semantics** | `softDeleteHoso` flips `IS_DELETED=true` but leaves `STATUS='ACTIVE'` → `auditHosoDataQuality` flags this as `SOFT_DEL_ACTIVE`. Rule unclear: two orthogonal concepts (`STATUS` vs `IS_DELETED`) are not documented in a single place. |
| **Full deploy footgun** | `runHosoFullDeployment` runs `migrateHosoLegacyToPro_` **every time** with no dry-run flag — re-running after new legacy rows arrive will silently mutate data. |
| **Private helper convention** | `_hosoLoaded` (audit file) starts with `_` — §4.4 forbids leading `_` on helpers defined at file scope; convention is trailing `_`. |
| **Log-entry dependency** | `hosoAppendLogEntry` calls `hosoValidateOptionalRefUser(ACTOR_ID)` inside the log writer → if actor resolution returns a stale user id, the **whole action throws** and the mutation rolls back only partially (row already appended if log is second). Order fragility. |

**Bottom line:** the module is feature-complete for pilot but **not standardized**. The governing naming doc is ratified only on paper; no canonical identifiers have been introduced. The gateway has PRO-data regressions (legacy-column reads). The service layer is leaking into the repository role. These are fixable in one non-breaking phase (§8 — Phase A).

---

## 2. Current inventory — file map with concrete role violations

| File | Declared ROLE (§3) | Actual content | Verdict |
|---|---|---|---|
| `10_HOSO_CONSTANTS.js` | `CONSTANTS` | Enum group names, status transitions, polymorphic table whitelist | ✅ clean |
| `10_HOSO_CONFIG.js` | `CONFIG` | `hosoGetTableNames()` — 8 lines | ✅ thin but fine |
| `10_HOSO_UTILS.js` | `UTILS` | Pure helpers + deprecated `hosoGenerateHoSoCode` delegator | ⚠ contains one deprecated shim that should move or die |
| `10_HOSO_VALIDATION.js` | `VALIDATION` | Assertions — but `hosoResolveActorId` reads `USER_DIRECTORY` via repo → I/O in validation role | ⚠ `hosoResolveActorId` belongs in a shared "identity/actor" helper (not validation) |
| `10_HOSO_REPOSITORY.js` | `REPOSITORY` | Sheet CRUD via `hosoRepo*` — good | ✅ clean |
| `10_HOSO_SERVICE.js` | `SERVICE` | Business logic — **but** 9 direct calls to `_findById`/`_appendRecord`/`_rows(_sheet(...))` in `attachHoSoFile`, `checkHoSoCompleteness`, `getExpiringDocs`, `generateHoSoReport` | ❌ layering broken — §3 "không trộn service + repository" |
| `10_HOSO_WRAPPERS.js` | `WRAPPERS` | `run*` / `hoso*Impl` wrappers bound to menu/contract names | ⚠ wraps legacy names; no canonical `hoso*` public API |
| `10_HOSO_SEED.js` | `SEED` | Master-code seed + demo seed | ✅ clean |
| `10_HOSO_BOOTSTRAP.js` | `BOOTSTRAP` | `ensureHosoSheets_`, `runHosoFullDeployment` | ⚠ full-deploy hardcodes migration step |
| `10_HOSO_MENU.js` | `MENU` | Spreadsheet UI alerts | ✅ clean |
| `10_HOSO_MIGRATION.js` | `MIGRATION` | Legacy → PRO column fill | ✅ clean; idempotent guard is good |
| `10_HOSO_AUDIT_REPAIR.js` | `AUDIT_REPAIR` | Audit + repair | ⚠ `_hosoLoaded` uses leading-underscore convention (should be `hosoAuditLoaded_`) |
| `10_HOSO_TEST.js` | `TEST` | Smoke + integration tests | ⚠ write test does not clean up its test rows |
| `60_HOSO_API_GATEWAY.js` | `API_GATEWAY` | HTTP dispatcher | ❌ 3 legacy-column bugs, 1 validation-duplication, 1 payload-schema mismatch |
| `99_APPSHEET_WEBHOOK.js` (HO_SO registrations) | — | 3 hoso* registerAction blocks | ✅ clean |

---

## 3. Evidence — high-severity bugs

### 3.1 Gateway reads legacy `HO_SO_TYPE` column instead of resolving `HO_SO_TYPE_ID`

```392:394:05_GAS_RUNTIME/60_HOSO_API_GATEWAY.js
      if (String(r.HO_SO_TYPE || '') !== 'HTX') return false;
```

```427:434:05_GAS_RUNTIME/60_HOSO_API_GATEWAY.js
    var results = rows.map(function(r) {
      return {
        id: r.ID,
        label: r.NAME,
        code: r.HO_SO_CODE || r.CODE,
        type: r.HO_SO_TYPE
      };
    });
```

```446:453:05_GAS_RUNTIME/60_HOSO_API_GATEWAY.js
    var byType = {};
    var byStatus = {};
    active.forEach(function(r) {
      var t = r.HO_SO_TYPE || 'KHAC';
      byType[t] = (byType[t] || 0) + 1;
      var s = r.STATUS || 'UNKNOWN';
      byStatus[s] = (byStatus[s] || 0) + 1;
    });
```

`DATA_MODEL.md` line 3 is explicit: *"Loại hồ sơ chỉ qua `HO_SO_TYPE_ID` → MASTER_CODE. Không cột text HO_SO_TYPE trên sheet"*. After `migrateHosoLegacyToPro_`, these three endpoints return empty/garbage for rows whose legacy `HO_SO_TYPE` has been blanked or was never populated.

### 3.2 Service breaks repository boundary

```454:493:05_GAS_RUNTIME/10_HOSO_SERVICE.js
function attachHoSoFile(hoSoId, fileMeta) {
  ...
  var hoSo = typeof _findById === 'function' ? _findById(CBV_CONFIG.SHEETS.HO_SO_MASTER, hoSoId) : null;
  ...
  _appendRecord(CBV_CONFIG.SHEETS.HO_SO_FILE, record);
```

Same pattern in `checkHoSoCompleteness` (554, 559–564, 569), `getExpiringDocs` (602), `generateHoSoReport` (617, 621, 625). These calls must be routed through `hosoRepo*` (see §5.3 for the expanded repository API).

### 3.3 Duplicate write path — `addHosoFile` vs `attachHoSoFile`

Both append to `HO_SO_FILE` but differ on:

| Concern | `addHosoFile` | `attachHoSoFile` |
|---|---|---|
| Enforces `FILE_URL` or `DRIVE_FILE_ID` | ❌ no | ✅ yes |
| Enum-validates `DOC_TYPE` | ❌ no | ✅ yes |
| Uses repository | ✅ `hosoRepoAppend` | ❌ direct `_appendRecord` |
| Log ACTION_TYPE | `ADD_FILE` | `ADD_FILE` |
| AppSheet contract? | no — gateway `addHoSoFile` payload | yes — legacy |
| Lovable gateway binds to | ✅ `addHosoFile` | no |

Service callers today: gateway uses `addHosoFile` (279); tests use `addHosoFile` (128); nothing routes to `attachHoSoFile` from inside the module. It is kept only for an older API surface.

### 3.4 Duplicate relation writer — `addHosoRelation` vs `createHoSoRelation`

| Concern | `addHosoRelation` | `createHoSoRelation` |
|---|---|---|
| Required | `FROM_HO_SO_ID`, `RELATED_TABLE`, `RELATED_RECORD_ID`, `RELATION_TYPE` | `FROM_HO_SO_ID`, `TO_HO_SO_ID`, `RELATION_TYPE` |
| Polymorphic target | ✅ validated via `hosoValidateRelationTarget` | optional (no target validation) |
| Derives `TO_HO_SO_ID` when table=`HO_SO` | ✅ | ⚠ but caller must supply it explicitly |
| Gateway binds to | ✅ `addHosoRelation` | no |

`createHoSoRelation` is only reachable via direct function call inside the module. It exists as a stricter "FROM → TO" writer. Today it is dead from any external surface.

### 3.5 Gateway assertion vs service schema mismatch

```293:302:05_GAS_RUNTIME/60_HOSO_API_GATEWAY.js
function _api_addHoSoRelation_(payload) {
  try {
    payload = payload || {};
    cbvAssert(payload.HO_SO_ID, 'HO_SO_ID required');
    cbvAssert(payload.RELATED_TABLE, 'RELATED_TABLE required');
    ...
    return addHosoRelation(payload);
```

Service (`addHosoRelation`) requires `FROM_HO_SO_ID`, not `HO_SO_ID`. Caller sending `{HO_SO_ID: 'x', ...}` will pass the gateway assert, then the service throws `"FROM_HO_SO_ID required"`. Confusing error contract.

### 3.6 Gateway re-implements transition validation

```189:207:05_GAS_RUNTIME/60_HOSO_API_GATEWAY.js
    if (currentStatus !== newStatus) {
      var allowed = HOSO_STATUS_TRANSITIONS[currentStatus];
      if (!allowed) allowed = [];
      if (allowed.indexOf(newStatus) === -1) {
        return {
          ok: false,
          message: 'Invalid transition: ' + currentStatus + ' -> ' + newStatus + '. Allowed: [' + allowed.join(', ') + ']'
        };
      }
    }
    var res = changeHosoStatus(payload.id, newStatus, payload.note || '');
```

`changeHosoStatus` already calls `hosoValidateStatusTransition(...)`. The gateway pre-check returns a different error format (`ok:false, message:…`) from the service error (thrown `Error` translated to `ok:false, message: e.message`). Two sources of truth, two shapes.

---

## 4. Redesign — target architecture

### 4.1 File map (unchanged file set; intent tightened)

```
05_GAS_RUNTIME/
  10_HOSO_CONSTANTS.js     ← enum groups, status transitions, polymorphic whitelist (no change)
  10_HOSO_CONFIG.js        ← sheet registry + default options (unchanged)
  10_HOSO_UTILS.js         ← pure helpers (remove deprecated hosoGenerateHoSoCode)
  10_HOSO_VALIDATION.js    ← assertions only — move hosoResolveActorId → new shared actor helper
  10_HOSO_REPOSITORY.js    ← CRUD only — expand API so service never touches _findById/_rows
  10_HOSO_SERVICE.js       ← business logic — ALL canonical public names live here
  10_HOSO_EVENTS.js  (NEW) ← thin emit helpers — one function per event type (see §4.5)
  10_HOSO_WRAPPERS.js      ← alias/deprecation wrappers only (shrinks after Phase C)
  10_HOSO_SEED.js          ← unchanged
  10_HOSO_BOOTSTRAP.js     ← runHosoFullDeployment opts.includeMigration=false by default
  10_HOSO_MENU.js          ← unchanged
  10_HOSO_MIGRATION.js     ← unchanged (already clean)
  10_HOSO_AUDIT_REPAIR.js  ← rename _hosoLoaded → hosoAuditLoaded_ (private suffix)
  10_HOSO_TEST.js          ← add teardown for write tests; add negative transition tests
  60_HOSO_API_GATEWAY.js   ← fix legacy HO_SO_TYPE reads; strip duplicate transition check
  03_SHARED_ACTOR.js  (NEW, optional)  ← hosts cbvResolveActorId (moved from HO_SO validation)
```

**Rationale for `10_HOSO_EVENTS.js`:** today emit code is inlined into service with `typeof CBV_CORE_EVENT_TYPE_* !== 'undefined' ? ... : 'HO_SO_*'`. A dedicated events file converts this to one named helper per event (`hosoEmitCreated_`, `hosoEmitStatusChanged_`, `hosoEmitFileAdded_`, `hosoEmitRelationAdded_`, `hosoEmitUpdated_`, `hosoEmitRemoved_`). Future rule-engine migration (W1) only touches this one file.

### 4.2 Canonical public API (service layer)

This is the **sole** public surface of HO_SO. Every entry returns `cbvResponse(ok, code, message, data, errors)`.

| Canonical | Signature | `code` returned | Replaces |
|---|---|---|---|
| `hosoCreate(data)` | `{HO_SO_TYPE_ID, TITLE|DISPLAY_NAME, HTX_ID?, ...}` → response | `HOSO_CREATED` | `createHoSo`, `createHoso` |
| `hosoUpdate(id, patch)` | STATUS / ID / HO_SO_CODE / PENDING_ACTION rejected | `HOSO_UPDATED` | `updateHoso` |
| `hosoSetStatus(id, newStatus, note?)` | runs transition + enum check | `HOSO_STATUS_CHANGED` \| `HOSO_STATUS_UNCHANGED` | `changeHosoStatus`, `setHoSoStatus`, `closeHoso`* |
| `hosoSoftDelete(id, note?)` | IS_DELETED=true + log ARCHIVE | `HOSO_SOFT_DELETED` | `softDeleteHoso` |
| `hosoFileAdd(data)` | FILE_URL or DRIVE_FILE_ID required; DOC_TYPE enum-validated; polymorphic `LINKED_RELATION_ID` optional | `HOSO_FILE_ADDED` | `addHosoFile`, `attachHoSoFile` |
| `hosoFileRemove(fileId, note?)` | soft: `STATUS=ARCHIVED` on `HO_SO_FILE` | `HOSO_FILE_REMOVED` | `removeHosoFile` |
| `hosoRelationAdd(data)` | FROM required; TO inferred if `RELATED_TABLE=HO_SO`; polymorphic target enforced | `HOSO_RELATION_ADDED` | `addHosoRelation`, `createHoSoRelation` |
| `hosoRelationRemove(id, note?)` | soft: `IS_DELETED=true` | `HOSO_RELATION_REMOVED` | `removeHosoRelation` |
| `hosoGetById(id)` | returns row (no response envelope; repository-shape helper) | — | `getHosoById` |
| `hosoListFiles(hosoId)` | active + non-archived | — | `getHosoFiles` |
| `hosoListRelations(hosoId)` | active | — | `getHosoRelations` |
| `hosoListLogs(hosoId)` | active | — | `getHosoLogs` |
| `hosoQueryExpiring(days)` | `HO_SO_MASTER` where END_DATE within days | — | `getExpiringHoso` |
| `hosoQueryExpired()` | master-level OR file-level | — | `getExpiredHoso` |
| `hosoCheckCompleteness(hosoId)` | vs `DOC_REQUIREMENT` by type code | `HOSO_COMPLETENESS_CHECK` | `checkHoSoCompleteness` |
| `hosoQueryExpiringDocs(days)` | `HO_SO_FILE.EXPIRY_DATE` | `HOSO_EXPIRING_DOCS` | `getExpiringDocs` |
| `hosoGenerateReport(hosoId)` | composite report | `HOSO_REPORT` | `generateHoSoReport` |
| `hosoRunTests(opts?)` | internal test harness | — | `runHosoTests`, `runHoSoTests`, `runHosoTestsImpl` |
| `hosoAudit()` | schema + refs + enums + DQ | — | `hosoRunAudit`, `auditHoSoModule` |
| `hosoSeedDemo()` | idempotent demo data | — | `seedHoSoDemo`, `seedHosoDemoData_` |
| `hosoFullDeploy(opts?)` | `{includeMigration: boolean = false}` | — | `runHosoFullDeployment`, `hosoRunFullDeploymentMenu` |

\* `hosoSetStatus(id,'CLOSED',note)` replaces the dedicated `closeHoso(id,note)`. Log `ACTION_TYPE` becomes just `CHANGE_STATUS`; removed `CLOSE` from `HO_SO_ACTION_TYPE` enum or keep as alias (decision below in §8.4 Q1).

### 4.3 Private / internal contract

- Private helpers use **trailing** underscore (`hosoAuditLoaded_`, `hosoEmitCreated_`, `seedHosoDemoData_`). Leading underscore reserved **only** for file-scope gateway helpers bound to HTTP routes (`_api_*_`, `_gatewayDoPost_`, `_webhookDoPost_`) — these are already project-wide convention in `99_APPSHEET_WEBHOOK.js` and `60_HOSO_API_GATEWAY.js` and are not renamed.
- Rename `_hosoLoaded` → `hosoAuditLoaded_` (one breaking edit, fully internal to `10_HOSO_AUDIT_REPAIR.js`).

### 4.4 Layering contract (enforced via code review)

| Layer | May call | Must not call |
|---|---|---|
| `10_HOSO_CONSTANTS.js` | nothing | anything |
| `10_HOSO_UTILS.js` | `00_CORE_UTILS` | `SpreadsheetApp.*`, `_sheet`, repo |
| `10_HOSO_VALIDATION.js` | utils, enum asserts, shared repo for ref-checks | direct sheet I/O |
| `10_HOSO_REPOSITORY.js` | `03_SHARED_REPOSITORY` (`_sheet`/`_rows`/`_findById`/`_appendRecord`/`_updateRow`), `00_CORE_CONFIG` | business logic, `cbvResponse`, events, validation |
| `10_HOSO_SERVICE.js` | `hosoRepo*`, `hoso*` validation, `10_HOSO_EVENTS` | `_findById`, `_appendRecord`, `_rows`, `_sheet` (grep-enforced) |
| `10_HOSO_EVENTS.js` | `cbvTryEmitCoreEvent_`, event-type constants | sheet I/O |
| `60_HOSO_API_GATEWAY.js` | canonical service names, repo for read-only projections | validation logic duplication |

**Grep CI** (even as a manual check first): `rg '\b_findById\b|\b_appendRecord\b|\b_updateRow\b|\b_rows\b|\b_sheet\b' 05_GAS_RUNTIME/10_HOSO_SERVICE.js` must return 0 matches after Phase A.

### 4.5 Event catalog for HO_SO (closes W3 gap)

| Service entry | EVENT_TYPE emitted | Payload shape |
|---|---|---|
| `hosoCreate` | `HO_SO_CREATED` | `{STATUS, HO_SO_TYPE_ID, HO_SO_CODE, HTX_ID}` |
| `hosoUpdate` | `HO_SO_UPDATED` (new) | `{fieldsChanged: string[], before, after}` |
| `hosoSetStatus` | `HO_SO_STATUS_CHANGED` | `{previousStatus, newStatus, note}` |
| `hosoSoftDelete` | `HO_SO_SOFT_DELETED` (new) | `{previousStatus}` |
| `hosoFileAdd` | `HO_SO_FILE_ADDED` (new) | `{fileId, FILE_GROUP, DOC_TYPE}` |
| `hosoFileRemove` | `HO_SO_FILE_REMOVED` (new) | `{fileId}` |
| `hosoRelationAdd` | `HO_SO_RELATION_ADDED` (new) | `{relationId, RELATED_TABLE, RELATION_TYPE}` |
| `hosoRelationRemove` | `HO_SO_RELATION_REMOVED` (new) | `{relationId}` |

Add corresponding constants to `04_CORE_EVENT_TYPES.js`. Emit helpers live in `10_HOSO_EVENTS.js` — one function per type so rule engine (W2) can refactor in isolation.

### 4.6 Transition ownership (W1 overlay strategy — recommended)

For HO_SO we pick the **"validator = source, RULE_DEF = overlay for alerts only"** convention:

1. `HOSO_STATUS_TRANSITIONS` in `10_HOSO_CONSTANTS.js` stays the single source of legal transitions.
2. Gateway drops its duplicated pre-check — it just calls the service and relays thrown errors.
3. `RULE_DEF` rows listening on `HO_SO_STATUS_CHANGED` are restricted to `SEND_ALERT` / `NOOP` today, so they cannot conflict with the validator.
4. When the rule engine grows an authoritative `UPDATE_STATUS` action (plan P7), **the validator rows become generated from a manifest** and the two sources stay aligned by tooling, not by hand.

### 4.7 HTX root row — invariant

The HTX root row rule is already well-defined by `hosoValidateHtxIdForHoSoType`:

- Row with `MASTER_CODE.CODE = HTX` must have **blank** `HTX_ID`.
- All other rows with a known type code must have a non-blank `HTX_ID` referencing a row that is itself HTX.

This is enforced on create/update; redesign keeps it. Add a **one-time audit probe** in `auditHosoDataQuality`: for each non-HTX row, verify `HTX_ID` resolves and the target is HTX. Today this goes unchecked unless someone re-saves the row.

### 4.8 Soft-delete semantics (canonical rule)

Two orthogonal flags, both kept:

| Concern | Field | Semantics |
|---|---|---|
| Workflow state | `STATUS` | NEW → IN_REVIEW → ACTIVE → EXPIRED / CLOSED / ARCHIVED |
| Persistence visibility | `IS_DELETED` | `true` = row hidden from all listings but **not** physically deleted; workflow `STATUS` is **frozen** at its current value |

`hosoSoftDelete` sets `IS_DELETED=true`, **leaves STATUS alone**, emits `HO_SO_SOFT_DELETED`. The existing audit finding `SOFT_DEL_ACTIVE` is **demoted from LOW to INFO** (or removed) — it is not an anomaly under this contract. Documented in `SERVICE_CONTRACT.md`.

---

## 5. Redesign details

### 5.1 Validation reorganization

`hosoResolveActorId` reads `USER_DIRECTORY` — that is I/O, not validation. Move it to a new `03_SHARED_ACTOR.js` file as `cbvResolveActorId` (cross-module helper — finance will want the same thing). Keep a thin alias `hosoResolveActorId` marked `@deprecated use cbvResolveActorId` in validation file for two releases.

### 5.2 Log-writer robustness

`hosoAppendLogEntry` currently throws if `hosoValidateOptionalRefUser(ACTOR_ID)` fails:

```31:35:05_GAS_RUNTIME/10_HOSO_SERVICE.js
  if (rec.ACTOR_ID) hosoValidateOptionalRefUser(rec.ACTOR_ID);
  hosoRepoAppend(CBV_CONFIG.SHEETS.HO_SO_UPDATE_LOG, rec);
}
```

Change to: if `ACTOR_ID` doesn't resolve, **blank it + append log anyway** (do not block the mutation). Audit catches orphan `ACTOR_ID` later. This matches TASK/FINANCE behavior.

### 5.3 Repository expansion (so service has nothing else to call)

Add to `10_HOSO_REPOSITORY.js`:

| New function | Purpose |
|---|---|
| `hosoRepoFindDocRequirementByTypeCode(code)` | used by `hosoCheckCompleteness` |
| `hosoRepoListFilesWithExpiryWithin(days)` | used by `hosoQueryExpiringDocs` |
| `hosoRepoAppendFile(record)` / `hosoRepoUpdateFile(rowNumber, patch)` | named wrappers so service never writes `CBV_CONFIG.SHEETS.HO_SO_FILE` directly |
| `hosoRepoAppendRelation(record)` / `hosoRepoUpdateRelation(rowNumber, patch)` | same for relations |
| `hosoRepoAppendLog(record)` | same for `HO_SO_UPDATE_LOG` |

Service calls the named wrappers; `hosoRepoAppend(name, rec)` remains for ad-hoc but is no longer used from service.

### 5.4 Gateway fixes

1. Replace every `r.HO_SO_TYPE === 'HTX'` / `r.HO_SO_TYPE || 'KHAC'` with a resolver:

```js
function _hosoResolveTypeCode_(row) {
  var tid = String(row && row.HO_SO_TYPE_ID || '').trim();
  if (!tid) return '';
  var mc = typeof _findById === 'function' ? _findById(CBV_CONFIG.SHEETS.MASTER_CODE, tid) : null;
  return mc ? String(mc.CODE || '').trim() : '';
}
```

Memoize by `tid` inside one request (gateway call) to avoid N×MASTER_CODE scans on dashboards.

2. `_api_changeHoSoStatus_` drops its own transition check; calls service; translates thrown errors via a single try/catch helper.
3. `_api_addHoSoRelation_` renames assertion from `HO_SO_ID` → `FROM_HO_SO_ID` to match the service contract (or accepts both and maps, for backward compat).
4. Add missing actions: `removeHoSoFile`, `removeHoSoRelation`, `softDeleteHoSo`, `getHoSoCompleteness`, `getHoSoExpiringDocs`, `generateHoSoReport`.
5. **Contract preservation**: keep `getHoSoXe`, `getHoSoLaiXe`, etc. as thin type-filtered wrappers (Lovable contract lives outside our repo) but route their implementation through the canonical resolver.

### 5.5 Bootstrap / full deploy

```js
function hosoFullDeploy(opts) {
  opts = opts || {};
  var includeMigration = opts.includeMigration === true;
  ...
  if (includeMigration) push('migrateHosoLegacyToPro', migrateHosoLegacyToPro_);
  else report.steps.push({ name: 'migrateHosoLegacyToPro', ok: true, skipped: true, reason: 'opts.includeMigration=false' });
}
```

Menu wrappers (`menuHosoFullDeploy`) explicitly prompt the user via `ui.alert` before setting `includeMigration=true`.

### 5.6 Tests

- Write tests must teardown: collect every `cbvMakeId` they produce, and in `finally` run a service-level `hosoSoftDelete` on each HO_SO; then physically remove test rows if a `CBV_TEST_CLEAN_HARD` script property is set.
- Add three negative cases: bad transition, HTX self-reference, orphan `HTX_ID` reference.

---

## 6. Deprecation matrix (alias → canonical)

| Current identifier | Canonical | Treatment | Phase |
|---|---|---|---|
| `createHoSo` / `createHoso` | `hosoCreate` | Both become thin wrappers with `@deprecated use hosoCreate` | A |
| `updateHoso` | `hosoUpdate` | wrapper | A |
| `changeHosoStatus` | `hosoSetStatus` | wrapper | A |
| `setHoSoStatus` | `hosoSetStatus` | wrapper | A |
| `closeHoso` | `hosoSetStatus(id,'CLOSED',note)` | wrapper; log `ACTION_TYPE` becomes `CHANGE_STATUS` (CLOSE removed in B) | A → B |
| `softDeleteHoso` | `hosoSoftDelete` | wrapper | A |
| `addHosoFile` | `hosoFileAdd` | wrapper; canonical requires URL or DRIVE_FILE_ID + enum DOC_TYPE | A |
| `attachHoSoFile` | `hosoFileAdd` | wrapper | A |
| `removeHosoFile` | `hosoFileRemove` | wrapper | A |
| `addHosoRelation` | `hosoRelationAdd` | wrapper; polymorphic target required | A |
| `createHoSoRelation` | `hosoRelationAdd` (`RELATED_TABLE='HO_SO'` case) | wrapper | A |
| `removeHosoRelation` | `hosoRelationRemove` | wrapper | A |
| `runHosoTests` / `runHoSoTests` / `runHosoTestsImpl` | `hosoRunTests` | wrapper | A |
| `hosoRunAudit` / `auditHoSoModule` / `auditHoSoModuleImpl` | `hosoAudit` | wrapper | A |
| `testHoSoRelations` / `testHoSoRelationsImpl` | — | **remove** (hollow self-delegation) | B |
| `seedHoSoDemo` / `seedHoSoDemoImpl` | `hosoSeedDemo` | wrapper; `seedHosoDemoData_` stays private | A |
| `runHosoFullDeployment` / `hosoRunFullDeploymentMenu` / `hosoRunFullDeploymentMenuImpl` | `hosoFullDeploy` | wrapper | A |
| `getHosoById`, `getHosoFiles`, `getHosoRelations`, `getHosoLogs`, `getExpiringHoso`, `getExpiredHoso`, `checkHoSoCompleteness`, `getExpiringDocs`, `generateHoSoReport` | `hosoGetById`, `hosoListFiles`, `hosoListRelations`, `hosoListLogs`, `hosoQueryExpiring`, `hosoQueryExpired`, `hosoCheckCompleteness`, `hosoQueryExpiringDocs`, `hosoGenerateReport` | wrappers | A |
| `hosoGenerateHoSoCode` | `hosoRepoAllocateHoSoCode` | already marked `@deprecated`; remove in B | B |
| `_hosoLoaded` | `hosoAuditLoaded_` | rename | A |
| `hosoResolveActorId` | `cbvResolveActorId` (new in `03_SHARED_ACTOR.js`) | wrapper in validation | A |

**Menu bindings (`menuAuditHoSo`, `menuSeedHoSoDemo`, `menuTestHoSoRelations`, `menuHosoFullDeploy`)** — allowed aliases per convention §4.2(2); they are UI labels. Updated internals to call canonical.

**AppSheet `registerAction` names (`hosoActivate`, `hosoClose`, `hosoArchive`)** — allowed aliases per §4.2(3); they are client contract. Their handlers are updated to call `hosoSetStatus`.

**Lovable gateway actions (`getHoSoXe`, `createHoSoLaiXe`, `updateHoSoXe`, etc.)** — allowed aliases per §4.2(3); the public payload shape is frozen. Internals updated.

---

## 7. Data-quality & audit upgrades

Add four new probes to `auditHosoDataQuality`:

| Code | Severity | Detects |
|---|---|---|
| `HTX_ID_ORPHAN` | HIGH | non-HTX row whose `HTX_ID` does not resolve to a `HO_SO_MASTER` row |
| `HTX_ID_NOT_HTX` | HIGH | `HTX_ID` resolves but target is not itself an HTX-type row |
| `LEGACY_TYPE_SET` | LOW | row has `HO_SO_TYPE` populated but `HO_SO_TYPE_ID` blank (migration not run for this row) |
| `DOC_REQUIREMENT_UNCOVERED` | MEDIUM | HTX-typed row with `DOC_REQUIREMENT` expected but no matching `HO_SO_FILE` — already computed by `hosoCheckCompleteness`; hoist into audit |

Add one repair:

- `repairHosoClearLegacyType_`: sets `HO_SO_TYPE=''` after verifying `HO_SO_TYPE_ID` is populated and resolves (`phase B` only; dry-run flag required).

---

## 8. Standardization plan — 3 phases

### 8.1 Phase A — non-breaking canonicalization (1 PR)

Objective: introduce every canonical name, fix the high-severity bugs, enforce the layering boundary. **Zero behavior change for existing callers.**

1. Create `10_HOSO_EVENTS.js` with one emit helper per event type in §4.5. Add new event-type constants to `04_CORE_EVENT_TYPES.js`.
2. In `10_HOSO_REPOSITORY.js`, add the named wrappers listed in §5.3.
3. In `10_HOSO_SERVICE.js`, write canonical `hoso*` functions (§4.2). Each existing alias becomes a one-line wrapper with `@deprecated use <canonical>`. Remove all `_findById`/`_appendRecord`/`_rows(_sheet(...))` from this file (grep proves clean).
4. Merge `addHosoFile` and `attachHoSoFile` into `hosoFileAdd` (union of validations: URL-or-drive required; DOC_TYPE enum-validated; FILE_GROUP falls back to DOC_TYPE, then `KHAC`).
5. Merge `addHosoRelation` and `createHoSoRelation` into `hosoRelationAdd` (union: polymorphic target + optional FROM/TO; if `RELATED_TABLE='HO_SO'`, auto-populate `TO_HO_SO_ID`).
6. Replace `closeHoso` internals with `hosoSetStatus(id,'CLOSED',note)`. Log `ACTION_TYPE` temporarily stays `CLOSE` to preserve log-reader expectations; flip to `CHANGE_STATUS` in Phase B.
7. Gateway fixes (§5.4): resolver for `HO_SO_TYPE`, drop duplicate transition check, correct `_api_addHoSoRelation_` assertion, add missing endpoints. No payload-shape changes on existing endpoints.
8. Rename `_hosoLoaded` → `hosoAuditLoaded_`.
9. Harden `hosoAppendLogEntry` (§5.2).
10. Update `FUNCTION_WRAPPER_MAP.md` — the HO_SO rows are factually wrong; rewrite against the table in §6.
11. Update `.cursor/rules/cbv-naming-conventions.mdc` status note: "HO_SO canonical names implemented ✅ Phase A — 2026-04-21".
12. Docs: update `02_MODULES/HO_SO/SERVICE_CONTRACT.md` and `SERVICE_MAP.md` to list canonical names.

**Exit criteria**

- `rg '\b_findById\b|\b_appendRecord\b|\b_updateRow\b|\b_rows\b|\b_sheet\b' 05_GAS_RUNTIME/10_HOSO_SERVICE.js` returns **0**.
- All 10 canonical names are reachable + return `cbvResponse`.
- `runHosoTests` passes incl. 3 new negative cases.
- Gateway smoke test (`smokeTestHoSoGateway`) still green; dashboard + HTX list return non-empty on seeded data.

### 8.2 Phase B — caller migration (2-4 PRs, low risk)

Objective: shift internal and menu callers to canonical names; remove hollow wrappers.

1. Replace every internal call (inside `05_GAS_RUNTIME/`) to alias names with canonical, file-by-file (start with `10_HOSO_TEST.js`, `10_HOSO_BOOTSTRAP.js`, `60_HOSO_API_GATEWAY.js`, then `10_HOSO_MENU.js`).
2. Remove `testHoSoRelations` / `testHoSoRelationsImpl` (hollow delegation).
3. Remove `hosoGenerateHoSoCode` (already deprecated).
4. Flip log `ACTION_TYPE` from `CLOSE` to `CHANGE_STATUS` (idempotent — only affects new rows).
5. Add write-test teardown + the 3 new audit probes in §7.

**Exit criteria**

- `rg 'createHoSo\b|createHoso\b|updateHoso\b|changeHosoStatus\b|setHoSoStatus\b|addHosoFile\b|attachHoSoFile\b|addHosoRelation\b|createHoSoRelation\b|closeHoso\b' 05_GAS_RUNTIME/` returns **0** matches **outside** `10_HOSO_WRAPPERS.js` and `10_HOSO_SERVICE.js` (wrapper definitions themselves).
- `FUNCTION_WRAPPER_MAP.md` lists the remaining wrappers with release target for removal.

### 8.3 Phase C — wrapper removal (1 PR, coordinate with AppSheet / Lovable owners)

Objective: delete deprecation wrappers.

1. Confirm 2 consecutive releases with zero caller in `05_GAS_RUNTIME/` (Phase B exit check).
2. Confirm AppSheet client code (`04_APPSHEET/`) and Lovable frontend no longer call deprecated names directly — they should only talk via gateway action strings (those remain unchanged).
3. Delete the wrapper definitions; keep only the three allowed-alias categories (menu bindings, AppSheet action handlers, Lovable gateway action strings).
4. Bump version tag (major, per convention §8.2 Phase C).

### 8.4 Decisions required before Phase A

| # | Question | Options | Recommended |
|---|---|---|---|
| Q1 | Keep `CLOSE` in `HO_SO_ACTION_TYPE` enum? | (a) keep forever, (b) deprecate → `CHANGE_STATUS`, (c) remove immediately | (b) — flip in Phase B |
| Q2 | Create `03_SHARED_ACTOR.js`? | (a) yes, move `hosoResolveActorId`, (b) keep in HO_SO validation with rename only | (a) — finance will want the same helper |
| Q3 | Event-type names: `HO_SO_FILE_ADDED` vs `HOSO_FILE_ADDED`? | (a) keep schema-style `HO_SO_*`, (b) code-style `HOSO_*` | (a) — matches §5 of naming doc: schema-style used in event identifiers (`CBV_CORE_EVENT_TYPE_HO_SO_CREATED` already follows this) |
| Q4 | Phase A scope: include merging `addHosoFile`+`attachHoSoFile` or defer to Phase B? | (a) merge now, (b) defer (just add canonical, leave aliases untouched) | (a) — the two diverge on validation; merging removes a class of bugs |
| Q5 | Write-tests teardown: opt-in via Script Property or default-on? | (a) default-on, (b) opt-in via `CBV_HOSO_TEST_TEARDOWN=true` | (b) — protects existing test rows until reviewers confirm |
| Q6 | Gateway legacy-field reads (`_api_getHoSoListForSearch_` returns `type: r.HO_SO_TYPE`): rename output key? | (a) keep key `type`, resolve value; (b) rename to `hoSoTypeCode`; (c) both | (a) — Lovable contract; value fixes the bug, key stays stable |

---

## 9. Risks & mitigations

| Risk | Likelihood | Mitigation |
|---|---|---|
| Merging `addHosoFile`+`attachHoSoFile` breaks an undocumented caller | M | Phase A keeps both names as wrappers; integration surface is internal (only gateway + tests call them) |
| New events fire too broadly once rule engine activates | M | Emit helpers live in dedicated file; rule engine rollout gated per-event (`ENABLED=FALSE` initial `RULE_DEF` rows) |
| `CORRELATION_ID` not propagated from new service entries | L | `cbvTryEmitCoreEvent_` already reads `CBV_REQUEST_CORRELATION_ID_` — preserved by all emit helpers |
| Legacy HO_SO rows with bad `HTX_ID` surface as new HIGH findings and alarm operators | M | Ship new audit probes as MEDIUM initially; bump to HIGH after one release of clean data |
| Rename `_hosoLoaded` breaks a user-written audit repair script | L | Rename is inside a single file; unreleased outside the module |

---

## 10. Deliverables checklist (for the executing PR)

### Phase A PR — branch `hoso/standardize-phase-a`

- [ ] `05_GAS_RUNTIME/10_HOSO_EVENTS.js` (new)
- [ ] `05_GAS_RUNTIME/04_CORE_EVENT_TYPES.js` — add 6 new HO_SO event type constants
- [ ] `05_GAS_RUNTIME/10_HOSO_REPOSITORY.js` — add named wrappers (§5.3)
- [ ] `05_GAS_RUNTIME/10_HOSO_SERVICE.js` — canonical names + deprecation wrappers + zero raw-repo calls
- [ ] `05_GAS_RUNTIME/10_HOSO_WRAPPERS.js` — rewritten against Phase A canonical list
- [ ] `05_GAS_RUNTIME/10_HOSO_AUDIT_REPAIR.js` — `_hosoLoaded` → `hosoAuditLoaded_`
- [ ] `05_GAS_RUNTIME/10_HOSO_BOOTSTRAP.js` — `hosoFullDeploy(opts)` with `includeMigration: false` default
- [ ] `05_GAS_RUNTIME/10_HOSO_VALIDATION.js` — `hosoAppendLogEntry` hardening (actor resolution failure ≠ action failure)
- [ ] `05_GAS_RUNTIME/60_HOSO_API_GATEWAY.js` — type-code resolver, drop transition duplicate, add missing endpoints, fix `_api_addHoSoRelation_` payload contract
- [ ] `05_GAS_RUNTIME/10_HOSO_TEST.js` — 3 new negative cases, opt-in teardown
- [ ] `03_SHARED_ACTOR.js` (optional per Q2) — `cbvResolveActorId`
- [ ] `05_GAS_RUNTIME/FUNCTION_WRAPPER_MAP.md` — rewrite HO_SO rows
- [ ] `02_MODULES/HO_SO/SERVICE_CONTRACT.md` — list canonical API
- [ ] `02_MODULES/HO_SO/SERVICE_MAP.md` — update canonical → repository mappings
- [ ] `.cursor/rules/cbv-naming-conventions.mdc` — status line
- [ ] `CHANGELOG.md` — entry "HO_SO Phase A standardization"

### Phase B PR — branch `hoso/standardize-phase-b`

- [ ] Internal caller migration (file-by-file)
- [ ] Remove `testHoSoRelations*`, `hosoGenerateHoSoCode`
- [ ] Log `ACTION_TYPE` `CLOSE` → `CHANGE_STATUS`
- [ ] Write-test teardown default-on
- [ ] 3 new audit probes in §7
- [ ] `FUNCTION_WRAPPER_MAP.md` — mark wrappers pending removal

### Phase C PR — branch `hoso/standardize-phase-c`

- [ ] Delete deprecation wrappers (keep allowed-alias categories)
- [ ] Version bump (major)
- [ ] `FUNCTION_WRAPPER_MAP.md` — move deleted wrappers to `REMOVED`

---

## 11. Changelog

| Date | Change |
|---|---|
| 2026-04-21 | Initial audit + redesign + 3-phase standardization plan. |
