# ENUM Sync Rules — CBV_SSA_LAOCONG_PRO

## 1. Single Source of Truth

**RULE 1 — ENUM_DICTIONARY IS SINGLE SOURCE OF TRUTH**

- No hardcoded enum arrays should be used directly in business validation when the registry is available.
- All enum-controlled values must exist in ENUM_DICTIONARY.
- Use `getEnumValues()`, `getEnumDisplayMap()`, `getEnumRowMap()` from the enum sync engine.

## 2. Storage vs Display

**RULE 2 — ENUM_VALUE IS STORAGE**

- Business tables store `ENUM_VALUE` only.
- Never store `DISPLAY_TEXT` in business tables.

**RULE 3 — DISPLAY_TEXT IS UI**

- Human-readable UI text comes from `DISPLAY_TEXT`.
- AppSheet List/Choice fields use `DISPLAY_TEXT` for labels.

## 3. Registry Integrity

**RULE 4 — NO SILENT DUPLICATE ENUMS**

- Same `ENUM_GROUP` + `ENUM_VALUE` duplicate rows must be flagged.
- `validateEnumRegistry()` and `enumHealthCheck()` detect duplicates.
- Duplicates break AppSheet Valid_If logic.

**RULE 5 — ACTIVE ENUMS MUST BE COMPLETE**

- If `IS_ACTIVE = TRUE`, `DISPLAY_TEXT` should not be blank.
- `repairEnumSafely({ fillMissingDisplayText: true })` can fill blank DISPLAY_TEXT with ENUM_VALUE.

**RULE 6 — INACTIVE ENUMS STILL USED MUST BE FLAGGED**

- Do not silently allow inactive enums to continue unnoticed.
- `auditEnumUsageInBusinessTables()` reports `INACTIVE_ENUM_IN_USE`.

## 4. Safe Repair Rules

**Allowed (when explicitly enabled):**

- Create missing enum rows from ENUM_CONFIG
- Fill blank DISPLAY_TEXT = ENUM_VALUE
- Create ENUM_DICTIONARY sheet if missing and full schema known
- Add missing headers if safe append mode enabled

**Must NOT:**

- Delete duplicate enum rows
- Auto-edit business table enum values by guessing
- Merge duplicate enum rows silently
- Rename enum groups silently
- Deactivate active rows automatically unless explicit policy exists

## 5. Dry Run Default

- `repairEnumSafely()` and `runSafeRepair()` default to `dryRun: true`.
- Always run with `dryRun: true` first to review planned actions.

## 6. Integration Points

| Function | Role |
|----------|------|
| `initAll()` | Ensures enum registry, runs enum health check |
| `selfAuditBootstrap()` | Includes enum registry integrity + usage audit |
| `verifyAppSheetReadiness()` | Fails if critical enum issues exist |
| `runSafeRepair()` | Delegates to `repairEnumSafely()` |
