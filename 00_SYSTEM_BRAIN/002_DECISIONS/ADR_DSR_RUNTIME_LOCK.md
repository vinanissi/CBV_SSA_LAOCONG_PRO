# ADR — DSR Runtime Lock

**Status:** LOCKED  
**Date:** 2026-06-01  
**Tag:** `v1.0.0-dsr-runtime-lock`  
**Commit:** `f27e779e4d8f54c0af07c309b5e7a2e931920087`

---

## DSR Runtime Locked

**Version:** `v1.0.0-dsr-runtime-lock`

---

## Protected Scope

| Phase | Description |
|-------|-------------|
| `PHASE_DSR_01` | Foundation |
| `PHASE_DSR_02` | Connection Check |
| `PHASE_DSR_03` | Backup Runtime |
| `PHASE_DSR_04` | Diff Preview |
| `PHASE_DSR_05` | Manual Sync Apply |
| `PHASE_DSR_05B` | Whitelist Sync Guard |
| `PHASE_DSR_05C` | Selective Sync Apply |
| `PHASE_DSR_06` | Runtime Report |
| `PHASE_DSR_07` | Test Console |

---

## Modification Policy

**Bug Fix Only**

---

## Forbidden

- Architecture rewrite
- Sync logic rewrite
- Authority removal
- Contract removal
- Whitelist removal
- Selective sync removal

---

## Locked policies

```text
FULL_WORKBOOK_SYNC = FORBIDDEN
WHITELIST_SYNC_REQUIRED = TRUE
SELECTIVE_SYNC_REQUIRED = TRUE
ALLOW_SYNC_ALL_WHITELIST = FALSE
```

---

*Recovery point for CBV_DATA_SYNC_RUNTIME v1. Roll forward via new ADR addendum + phase charter only.*
