# CBV Deployment Package

One-click deployment for the CBV system. Idempotent, safe, production-ready.

## Quick Start

1. Open the CBV spreadsheet
2. **CBV_SSA** → **Full Deployment (One-Click)**
3. Confirm verdict: PASS / WARNING / FAIL

## Files

| File | Purpose |
|------|---------|
| [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) | How to run, interpret results, what to do on FAIL |
| [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) | Pre/post deployment verification checklist |
| [DEPLOYMENT_REPORT_SAMPLE.md](DEPLOYMENT_REPORT_SAMPLE.md) | Sample report structures |

## GAS Modules

| File | Purpose |
|------|---------|
| `98_deployment_bootstrap.js` | `runFullDeployment()` orchestrator |
| `98_schema_manager.js` | `ensureAllSchemas()` — sheets + columns |
| `98_seed_manager.js` | `seedAllData()` — DON_VI, ENUM, MASTER_CODE |
| `98_validation_engine.js` | `validateAllEnums()`, `validateAllRefs()`, `validateDonViHierarchy()` |
| `98_audit_logger.js` | `generateDeploymentReport()` — writes to ADMIN_AUDIT_LOG |

## Flow

```
runFullDeployment()
  → ensureAllSchemas()
  → seedAllData()
  → validateAllEnums()
  → validateAllRefs()
  → validateDonViHierarchy()
  → runAllSystemTests()
  → generateDeploymentReport()
  → return { ok, verdict, report, mustFix }
```
