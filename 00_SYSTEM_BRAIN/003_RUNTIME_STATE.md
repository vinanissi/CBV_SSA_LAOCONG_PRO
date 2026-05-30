# CBV Runtime State

**Status:** NOT_WIRED  
**Maintainer:** Operator  
**Last Updated:** 2026-05-30

---

## Runtime Flags

| Runtime | Status | Notes |
|--------|--------|-------|
| FE | UNKNOWN | Not maintained in this file yet |
| Worker | UNKNOWN | Not maintained in this file yet |
| GAS | UNKNOWN | Not maintained in this file yet |
| DB / Google Sheet | UNKNOWN | Not maintained in this file yet |
| AppSheet | UNKNOWN | Not maintained in this file yet |

---

## Rule

This file is **operator-maintained**.

- Agents may **read** this file but must **not invent** runtime status.
- If status is `NOT_WIRED` or cells remain `UNKNOWN`, reports must state **`RUNTIME_STATE: NOT_WIRED`** (or per-flag UNKNOWN).
- Do not claim deploy PASS without operator update or verified test evidence.

---

## How to wire (operator)

1. Set **Status** at top to `WIRED` when actively maintained.
2. Update table rows with `LIVE` / `STAGING` / `MOCK` / `BLOCKED` and dated notes.
3. Set **Last Updated** to change date.

---

*Append-only updates preferred; amend rows, do not delete history sections.*
