# PHASE_DSR_05B_WHITELIST_SYNC_GUARD — Handoff

**Result:** GO_WITH_WARNINGS  
**Date:** 2026-06-01

---

## What changed

DSR manual sync apply now uses an explicit **whitelist** and **forbidden patterns**. Full workbook sync is forbidden by policy (`DSR_DECISION_001`). Only sheets in `SYNC_WHITELIST` that do not match `SYNC_FORBIDDEN_PATTERNS` can be cleared and written on DESTINATION.

---

## Why full workbook sync is forbidden

SOURCE and DESTINATION schemas diverged. Syncing every SOURCE sheet could clear/overwrite destination-only runtime tabs, governance sheets, AppSheet helpers, dashboards, and master data (`USER_DIRECTORY`, `MASTER_CODE`, etc.).

---

## How whitelist sync works

1. Operator runs menus 4 → 5 → 6 (connection, backup, diff) as before.
2. Sets `SYNC_ALLOWED=TRUE` only when ready.
3. Menu **7. Manual Sync Apply** validates guards including:
   - `FULL_WORKBOOK_SYNC=FORBIDDEN`
   - `WHITELIST_SYNC_REQUIRED=TRUE`
   - Non-empty `SYNC_WHITELIST`
4. Apply plan includes **only** whitelisted SOURCE sheets that exist.
5. Other SOURCE sheets: **SKIP** (log + audit, no write).
6. Forbidden pattern matches: **BLOCK** (log + audit, no write).
7. DESTINATION-only sheets are never deleted.

---

## Configure `SYNC_WHITELIST`

In `SYNC_CONFIG`, key `SYNC_WHITELIST` — **one sheet name per line** (recommended):

```text
TASK_MAIN
TASK_CHECKLIST
TASK_ATTACHMENT
TASK_UPDATE_LOG
FINANCE_TRANSACTION
FINANCE_LOG
DOC_REQUIREMENT
RULE_DEF
```

Adjust to your approved business tabs only. Empty whitelist **blocks** all sync.

---

## Configure `SYNC_FORBIDDEN_PATTERNS`

In `SYNC_CONFIG`, key `SYNC_FORBIDDEN_PATTERNS` — one pattern per line. `*` matches any suffix (e.g. `CBV_*` blocks `CBV_MENU`). Defaults include master/governance/runtime patterns — see `SYNC_GUARD_CONTRACT.md`.

---

## Verify guard behavior

1. Run **🧪 CBV Test Console → DSR Test Console → 6. Test Sync Guard Dry-run** (includes whitelist logic checks).
2. Run diff preview — SYNC_PLAN `MESSAGE` should note `WHITELISTED`, `NOT_WHITELISTED`, or `FORBIDDEN`.
3. With `SYNC_ALLOWED=FALSE`, menu 7 must not write (GUARD_BLOCKED).
4. Confirm non-whitelisted SOURCE tabs are unchanged on DESTINATION after a test apply (staging only).

---

## What not to do

- Do not set `FULL_WORKBOOK_SYNC` to anything other than `FORBIDDEN`.
- Do not clear `SYNC_WHITELIST` to “sync everything”.
- Do not add runtime/master sheets to the whitelist.
- Do not skip backup or diff guards.
- Do not run sync on production without staging validation.

---

## Known warnings

- Deploy `84_DATA_SYNC_RUNTIME_WHITELIST_SYNC_GUARD.js` via clasp before menu 7 in production.
- Existing hosts: run **Bootstrap DSR Foundation** or ensure four new config keys exist.

---

## Next phase recommendation

**PHASE_DSR_08_OPERATOR_UX_POLISH** — dashboard labels, operator messaging, and guard UX around whitelist status.
