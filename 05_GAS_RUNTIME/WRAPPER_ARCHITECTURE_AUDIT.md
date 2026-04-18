# CBV PRO Wrapper Architecture Audit

**Last reviewed:** Aligned with `90_BOOTSTRAP_MENU_WRAPPERS.js`, `95_TASK_SYSTEM_BOOTSTRAP.js`, `97_TASK_SYSTEM_TEST_RUNNER.js` (load order per `.clasp.json`).

---

## 1. Wrappers and Impl naming

| Wrapper | Status | Notes |
|---------|--------|--------|
| **buildActiveSlicesSpec** | OK | Wrapper calls `callIfExists_('buildActiveSlicesSpecImpl')`. Implementation: `buildActiveSlicesSpecImpl` in `95_TASK_SYSTEM_BOOTSTRAP.js`. |
| **ensureSeedUserDirectory** | OK | Wrapper calls `callIfExists_('seedUserDirectory')` (`90_BOOTSTRAP_USER_SEED.js`). |
| **testFieldPolicyReadiness** | OK | Wrapper calls `callIfExists_('testFieldPolicyReadinessImpl')` (`97_TASK_SYSTEM_TEST_RUNNER.js`). |
| **testTaskWorkflowRules** | Informational | Delegates to `runTaskSystemTests` / `runAllSystemTestsImpl` — no single `*Impl` name; acceptable. |
| **repairRefSafely** | Placeholder | Informational only; full ref repair via whole-system repair. |
| **repairSchemaSafely** | OK | Calls `repairSchemaColumns` / `repairSchemaAndData` (not renamed to `*Impl`; by design). |

---

## 2. Impl without dedicated `*Impl` suffix

| Function | Access | Notes |
|----------|--------|--------|
| **repairSchemaColumns** / **repairSchemaAndData** | Via `repairSchemaSafely`, `enforceFinalSchemaSafely`, `repairWholeSystemSafely` | `90_BOOTSTRAP_REPAIR.js` (and related). |
| **repairWholeSystemSafely** | Wrapper in `90_BOOTSTRAP_MENU_WRAPPERS.js` → `repairSchemaAndData` | Menu: `menuRepairWholeSystemSafely`. |
| **initAll** / **protectSensitiveSheets** | `runSafeMenuStep_` from menu | No menu-named wrapper required. |
| **taskSystemProBootstrapAll** | Back-compat `runTaskSystemProBootstrap` | Optional PRO wrapper. |

---

## 3. Duplicate execution paths (residual)

| Topic | Detail | Risk |
|-------|--------|------|
| **Run all tests** | Multiple menu paths can reach `runAllSystemTestsImpl` | Low — duplicate menu entries only. |
| **auditSchemaMismatch** | Uses `selfAuditBootstrapImpl` with fallback to `selfAuditBootstrap` (wrapper) | Low — redundant fallback; could simplify to Impl only. |
| **menuSeedUserDirectory** | Resolves `ensureSeedUserDirectory` or `seedUserDirectory` then shows its own alert | **Note:** `ensureSeedUserDirectory` wrapper already shows an alert; calling the wrapper from menu may duplicate UX — review if needed. |

**Resolved in code (do not regress):**

- **Enforce final schema:** `menuEnforceFinalSchemaSafely` → `callIfExists_('enforceFinalSchemaSafely')` (uses `repairSchemaColumns` / `ensureAllSchemasImpl`, not `ensureAllSchemas()` alert path).
- **Repair schema / whole system:** `menuRepairSchemaSafely` → `repairSchemaSafely()`; `menuRepairWholeSystemSafely` → `repairWholeSystemSafely()`.
- **Build slice spec:** `buildActiveSlicesSpec` → `buildActiveSlicesSpecImpl` (no self-recursion).

---

## 4. Risky direct menu bindings

| Menu item | Binds to | Risk |
|-----------|----------|------|
| Daily admin guide / missing fn report / verify menu | **showDailyAdminGuide**, **showMissingFunctionReport**, **verifyMenuBindings** | Low — must stay parameter-less globals. |
| Others | `menu*` handlers | Preferred pattern. |

---

## 5. Historical issues (fixed in code)

The following were previously documented as critical; **current codebase does not exhibit them:**

1. ~~`buildActiveSlicesSpec` infinite recursion~~ — fixed with `buildActiveSlicesSpecImpl`.
2. ~~`menuEnforceFinalSchemaSafely` calling `ensureAllSchemas`~~ — now uses `enforceFinalSchemaSafely`.
3. ~~Missing `repairWholeSystemSafely`~~ — present; menu uses it.
4. ~~`menuRepairSchemaSafely` duplicating inline repair~~ — now calls `repairSchemaSafely()`.
5. ~~`ensureSeedUserDirectoryImpl` dead reference~~ — wrapper uses `seedUserDirectory` only.

---

## 6. Optional cleanups

| Item | Suggestion |
|------|------------|
| `auditSchemaMismatch` | Drop fallback to `selfAuditBootstrap` if Impl is always loaded after audit file. |
| `menuSeedUserDirectory` | Call `seedUserDirectory` via one path only to avoid double alerts. |
| Docs | Keep `FUNCTION_WRAPPER_MAP.md` and this file in sync when adding wrappers. |
