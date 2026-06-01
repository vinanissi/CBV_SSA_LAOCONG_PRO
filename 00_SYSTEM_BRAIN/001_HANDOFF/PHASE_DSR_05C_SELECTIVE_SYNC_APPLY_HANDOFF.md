# PHASE_DSR_05C_SELECTIVE_SYNC_APPLY — Handoff

**Result:** GO_WITH_WARNINGS  
**Date:** 2026-06-01

---

## What changed

DSR now requires **per-sheet operator approval** before DESTINATION writes. Whitelist alone is insufficient (`DSR_DECISION_002`).

---

## Why selective sync is required

Whitelisted tabs may still differ in row counts/headers. Syncing every whitelist sheet risks unintentional overwrites.

---

## How to build selective sync plan

1. Complete menus 4 → 5 → 6 (connection, backup, diff).
2. **Menu 9 — Build Selective Sync Plan** — appends candidate rows to `SYNC_SELECTION` (no business writes).

---

## How operator approves sheets

1. **Menu 11 — Open Sync Selection** (or open `SYNC_SELECTION` tab).
2. For each sheet to sync, on the **latest row** for that sheet name:
   - Set `OPERATOR_DECISION` = `APPROVE`
   - Set `APPLY_STATUS` = `READY_TO_APPLY`
   - Optionally set `APPROVED_BY` / `APPROVED_AT`
3. Use `SKIP`, `HOLD`, or `BLOCK` to exclude sheets.

**WHITELISTED ≠ SELECTED.**

---

## How Manual Selective Sync Apply works

**Menu 10** — after guards pass, syncs only sheets with latest selection `APPROVE` + `READY_TO_APPLY`, whitelisted, not forbidden. Appends result rows to `SYNC_SELECTION`; does not clear history.

---

## How legacy Manual Sync Apply is blocked

**Menu 7** returns `SELECTIVE_SYNC_REQUIRED` when config flag is `TRUE` (default). Use menu 10 instead.

---

## Verify guard behavior

- Test Console → Sync Guard Dry-run (includes selective logic checks).
- Menu 7 should refuse; menu 9 should append rows only; menu 10 should skip unapproved sheets.

---

## What not to do

- Do not set `ALLOW_SYNC_ALL_WHITELIST=TRUE`.
- Do not expect menu 7 to sync all whitelist sheets.
- Do not approve forbidden or non-whitelist sheet names.

---

## Known warnings

- Deploy new GAS files via clasp.
- Run Bootstrap if `SYNC_SELECTION` tab missing.

---

## Next phase

**PHASE_DSR_08_OPERATOR_UX_POLISH**
