# CBV PRO Wrapper Architecture Audit

## 1. Wrappers Without Impl (or Broken Impl Reference)

| Wrapper | Issue | Location |
|---------|-------|----------|
| **buildActiveSlicesSpec** | **CRITICAL: Infinite recursion** — Wrapper calls `callIfExists_('buildActiveSlicesSpec')` which resolves to itself after wrappers file overwrites 95's function. Load order: 95 loads first, then MENU_WRAPPERS overwrites the global. | 90_BOOTSTRAP_MENU_WRAPPERS.js:183 |
| **ensureSeedUserDirectory** | References `ensureSeedUserDirectoryImpl` which does not exist. Falls back to `seedUserDirectory`; the Impl name is a dead reference. | 90_BOOTSTRAP_MENU_WRAPPERS.js:174 |
| **testTaskWorkflowRules** | Returns result of `runTaskSystemTests` / `runAllSystemTestsImpl` — no dedicated Impl. Logic spread across 97; acceptable but inconsistent. | 90_BOOTSTRAP_MENU_WRAPPERS.js:218 |
| **testFieldPolicyReadiness** | References `testFieldPolicyReadiness` (same name) — potential self-reference if 97's version is ever shadowed. | 90_BOOTSTRAP_MENU_WRAPPERS.js:219 |
| **repairRefSafely** | Informational placeholder only; no Impl. Documented as placeholder. | 90_BOOTSTRAP_MENU_WRAPPERS.js |
| **repairSchemaSafely** | Wrapper exists and calls repairSchemaColumns/repairSchemaAndData (no *Impl). repairSchemaColumns and repairSchemaAndData are not renamed to *Impl. | Acceptable — calls existing logic |

---

## 2. Impl Without Wrapper

| Impl Function | Has Wrapper? | Notes |
|---------------|--------------|-------|
| **generateDeploymentReportImpl** | Yes (generateDeploymentReport) | Wrapper handles both: (report) → delegate to Impl; () → run deployment |
| **repairSchemaColumns** | Indirect (repairSchemaSafely, enforceFinalSchemaSafely) | No dedicated repairSchemaColumnsImpl; logic not renamed |
| **repairSchemaAndData** | Indirect (repairWholeSystemSafely via menu only) | No wrapper `repairWholeSystemSafely`; menu calls it directly |
| **runTaskSystemTests** | Indirect (testTaskWorkflowRules, menuTestTaskWorkflow) | runTaskSystemTests is a menu-style handler in 97, not Impl |
| **initAll** | No wrapper | Directly called by runSafeMenuStep_ in menuInitAll |
| **protectSensitiveSheets** | No wrapper | Directly called by runSafeMenuStep_ in menuProtectSensitiveSheets |
| **taskSystemProBootstrapAll** | Backward-compat only (runTaskSystemProBootstrap) | No PRO wrapper in required set |
| **repairTaskSystemSafelyFull** | Via repairTaskSystemSafelyImpl | Nested impl; OK |

---

## 3. Duplicate Execution Paths

| Action | Path A | Path B | Risk |
|--------|--------|--------|------|
| **Run all tests** | menuRunAllTests → runAllSystemTests (wrapper) → runAllSystemTestsImpl | menuTestTaskWorkflow → runSafeMenuStep_('runTaskSystemTests') → runTaskSystemTests (97) → runAllSystemTestsImpl | Two menu items reach same Impl; slight duplication |
| **Repair schema** | menuRepairSchemaSafely → inline callIfExists_(repairSchemaColumns \|\| repairSchemaAndData) | repairSchemaSafely (wrapper) → same callIfExists_ logic | Wrapper exists but menu does NOT use it; menu has duplicate inline logic |
| **Enforce final schema** | menuEnforceFinalSchemaSafely → callIfExists_('ensureAllSchemas') | enforceFinalSchemaSafely (wrapper) → callIfExists_('ensureAllSchemasImpl') | **Risky**: menuEnforceFinalSchemaSafely calls ensureAllSchemas (wrapper), which shows alert. enforceFinalSchemaSafely wrapper uses ensureAllSchemasImpl. Menu bypasses enforceFinalSchemaSafely and calls ensureAllSchemas directly — double alert possible |
| **Build slice spec** | menuBuildSliceSpec → callIfExists_('buildActiveSlicesSpec') → buildActiveSlicesSpec (wrapper) → **recursion** | — | **CRITICAL** |
| **Audit schema mismatch** | auditSchemaMismatch (wrapper) → selfAuditBootstrapImpl | Fallback: selfAuditBootstrap (wrapper) — redundant | auditSchemaMismatch line 281 falls back to selfAuditBootstrap; redundant since wrapper calls Impl |
| **Repair whole system** | menuRepairWholeSystemSafely → repairSchemaAndData directly | No wrapper repairWholeSystemSafely | Menu bypasses wrapper layer |

---

## 4. Risky Direct Menu Bindings

| Menu Item | Binds To | Risk |
|-----------|----------|------|
| Hướng dẫn Admin hàng ngày | **showDailyAdminGuide** | Direct binding. If function is renamed or given required params, menu breaks silently. Low risk — simple helper. |
| Báo cáo hàm thiếu | **showMissingFunctionReport** | Direct binding. Same as above. |
| Kiểm tra Menu | **verifyMenuBindings** | Direct binding. Same as above. |
| (All others) | menu* handlers | menu* intermediaries; safer. |

**Recommendation**: Direct bindings (showDailyAdminGuide, showMissingFunctionReport, verifyMenuBindings) are acceptable for pure helpers with no params. Document that these must remain parameter-less and globally available.

---

## 5. Summary of Critical Issues

1. **buildActiveSlicesSpec** — Infinite recursion. Wrapper overwrites 95's implementation and then calls itself via `callIfExists_('buildActiveSlicesSpec')`.
2. **menuEnforceFinalSchemaSafely** — Uses `ensureAllSchemas` (wrapper) instead of `enforceFinalSchemaSafely` wrapper or `ensureAllSchemasImpl`. Can cause duplicate alerts.
3. **menuRepairWholeSystemSafely** — No wrapper; menu handler calls repairSchemaAndData directly. Bypasses wrapper layer.
4. **menuRepairSchemaSafely** — Duplicates logic instead of calling repairSchemaSafely() wrapper.
5. **ensureSeedUserDirectory** — Dead reference to ensureSeedUserDirectoryImpl.

---

## 6. Recommended Fixes (for reference)

| Issue | Fix |
|-------|-----|
| buildActiveSlicesSpec recursion | Rename 95's buildActiveSlicesSpec → buildActiveSlicesSpecImpl; wrapper calls Impl |
| menuEnforceFinalSchemaSafely | Change to call enforceFinalSchemaSafely() (wrapper) or use ensureAllSchemasImpl directly |
| menuRepairWholeSystemSafely | Add repairWholeSystemSafely() wrapper; menu calls it |
| menuRepairSchemaSafely | Change to call repairSchemaSafely() (wrapper) |
| ensureSeedUserDirectory | Remove ensureSeedUserDirectoryImpl from call; use seedUserDirectory only |
