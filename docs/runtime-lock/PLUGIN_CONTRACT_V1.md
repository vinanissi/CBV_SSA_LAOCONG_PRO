# CBV Plugin Contract v1 (Frozen)

Source: `05_GAS_RUNTIME/999R_RF05_PLUGIN_RUNTIME.js`

## Registry plugins (v1 lock)

| pluginId | Module | Status |
|----------|--------|--------|
| `cbv-plugin-task` | TASK | ACTIVE |
| `cbv-plugin-finance` | FINANCE | ACTIVE_READONLY |
| `cbv-plugin-ho-so` | HO_SO | ACTIVE_READONLY |

## Allowed plugin status

`ACTIVE`, `ACTIVE_READONLY`, `PARTIAL`, `STUB`, `NOT_CONFIGURED`, `DISABLED`, `ERROR`

## Capability status

- **ACTIVE** — runtime verified (read path works)
- **PARTIAL** — read partial (e.g. file count only)
- **STUB / NOT_CONFIGURED** — not implemented; must not fake ACTIVE
- Write capabilities: **EXECUTION_LOCKED** or **NOT_CONFIGURED**

## Quick action execution modes

`READ_ONLY`, `NAVIGATE`, `EXECUTION_LOCKED`, `MANUAL_CONFIRM_REQUIRED`, `NOT_CONFIGURED`

**Rule:** `autoExecute` must be `false` for all registered actions.

## Validation

`CBV_PluginRegistry_validateDescriptor(plugin)` — required fields, no autoExecute, STUB plugin must not claim ACTIVE capabilities incorrectly.

## Finance/HO_SO v1 lock

- Read: FINANCE_TRANSACTION, HO_SO_MASTER (+ attachments/files index)
- Search: RF_06 adapters wired into RF_02 unified search
- Write: blocked from WebApp (confirm payment, approve hồ sơ)
