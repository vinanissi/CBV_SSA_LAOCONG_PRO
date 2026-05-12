# PHASE REF-A — OPERATIONAL_REFERENCE_LAYER_DESIGN

**Repo:** `CBV_SSA_LAOCONG_PRO`  
**Standard:** CBV Operational Ecosystem Standard V1  
**Principles:** Runtime-first, memory-first, append-only, manual-first → auto-later, human-in-the-loop, no destructive migration, no fake GO, no triggers in this phase, no Phase 85 / AI / queue intelligence.

## Objective

Standardize the operational **reference / identity / governance** layer for four core sheets plus new governance sheets:

- `ENUM_DICTIONARY` — valid values (not real ENV)
- `USER_DIRECTORY` — who is who
- `MASTER_CODE` — module / action / queue / policy codes
- `DON_VI` — org / unit
- **New:** `TEAM_DIRECTORY`, `ROLE_PERMISSION_MATRIX`, `FEATURE_FLAG`, `SYSTEM_REGISTRY`

**Explicit non-goals:** Do not store real secrets or ENV configuration in these sheets (future `CBV_ENV_*`). No AppSheet Bot, no auto assign/resolve/escalate.

## Deliverables (implementation)

1. **Schema (add-only):** `90_BOOTSTRAP_SCHEMA.js`, `06_DATABASE/schema_manifest.json`, `90_BOOTSTRAP_AUDIT_SCHEMA.js`, `00_CORE_CONFIG.js`, `01_ENUM_SEED.js` headers, `03_SHARED_ROW_READER.js` meaningful fields.
2. **Runtime:** `05_GAS_RUNTIME/83_OPERATIONAL_REFERENCE_RUNTIME.js` — `CbvRef_*` API + `CbvRef_TestConsole_run()`.
3. **Bootstrap:** `HomeAlert_bootstrap()` calls `CbvRef_ensureSheets()` + `CbvRef_seedDefaults()`; `.clasp.json` push order after `82_*`.
4. **Test Console:** Menu `REF-A — Operational Reference Layer` → `menuCbvTestConsoleOperationalReferenceRefA()` → `CbvRef_TestConsole_run()`.
5. **Docs:** `docs/operations/OPERATIONAL_REFERENCE_LAYER_DESIGN.md`
6. **Append-only artifacts:** Report `000_REPORTS/013_*`, handoff `001_HANDOFF/013_*`

## Report contract

Test console report must satisfy `CBV_TEST_CONSOLE_V1` envelope (`ok`, `phase`, `status`, `checkedAt`, `runBy`, `traceId`, `testSuite`, `summary`, `checks`, `warnings`, `errors`, `nextStep`, `severity`, `reportText`, `reportJson`, `contractVersion`, `envelopeOk`).
