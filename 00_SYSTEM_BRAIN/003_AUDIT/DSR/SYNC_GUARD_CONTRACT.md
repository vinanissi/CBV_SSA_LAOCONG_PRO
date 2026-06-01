# DSR Sync Guard Contract

**Module:** CBV_DATA_SYNC_RUNTIME v1  
**Phases:** `PHASE_DSR_05`, `PHASE_DSR_05B_WHITELIST_SYNC_GUARD`, `PHASE_DSR_05C_SELECTIVE_SYNC_APPLY`  
**Status:** **ACTIVE**

---

## Purpose

Define mandatory preconditions before **any** SOURCE → DESTINATION business sheet write (manual sync apply).

---

## Policy

| Policy | Value | Decision |
|--------|--------|----------|
| `FULL_WORKBOOK_SYNC` | **FORBIDDEN** | DSR_DECISION_001 |
| `WHITELIST_SYNC_REQUIRED` | **TRUE** | DSR_DECISION_001 |
| `SELECTIVE_SYNC_REQUIRED` | **TRUE** | DSR_DECISION_002 |
| `ALLOW_SYNC_ALL_WHITELIST` | **FALSE** | DSR_DECISION_002 |

**Rule:** `WHITELISTED` does **not** mean `SELECTED`. Whitelisted sheets are not automatically synced.

---

## Guard formula

Sync apply is permitted only when **all** conditions are true:

| Guard | Requirement |
|-------|-------------|
| `MANUAL_OPERATOR_ACTION` | Function invoked from operator menu — not trigger/scheduler |
| `SYNC_ALLOWED` | `SYNC_CONFIG.SYNC_ALLOWED` = `TRUE` |
| `SOURCE_SPREADSHEET_ID` | Non-empty, valid, openable |
| `DESTINATION_SPREADSHEET_ID` | Non-empty, valid, openable |
| `SYNC_MODE` | `ONE_WAY_SOURCE_TO_DESTINATION` |
| `SAFETY_MODE` | `BACKUP_BEFORE_WRITE` |
| `LATEST_BACKUP_EXISTS` | `BACKUP_CREATED` in `SYNC_BACKUP_INDEX` |
| `LATEST_DIFF_STATUS` | `LAST_DIFF_RESULT` = `READY_FOR_SYNC` |
| `FULL_WORKBOOK_SYNC_FORBIDDEN` | `FULL_WORKBOOK_SYNC` = `FORBIDDEN` |
| `WHITELIST_SYNC_REQUIRED` | `TRUE` |
| `SYNC_WHITELIST_NON_EMPTY` | Parsed whitelist has ≥1 sheet |
| `SELECTIVE_SYNC_REQUIRED` | `TRUE` |
| `ALLOW_SYNC_ALL_WHITELIST_FALSE` | `ALLOW_SYNC_ALL_WHITELIST` = `FALSE` |
| `SYNC_SELECTION_EXISTS` | Selection sheet present (`SYNC_SELECTION_SHEET`) |
| Per-sheet | In `SYNC_WHITELIST` |
| Per-sheet | Not matching `SYNC_FORBIDDEN_PATTERNS` |
| Per-sheet | `OPERATOR_DECISION` = `APPROVE` (latest row per sheet) |
| Per-sheet | `APPLY_STATUS` = `READY_TO_APPLY` |

Legacy menu **7. Manual Sync Apply** must **refuse** when `SELECTIVE_SYNC_REQUIRED=TRUE` and direct operator to **10. Manual Selective Sync Apply**.

---

## SYNC_SELECTION sheet

Append-only operator decisions. Latest row per `SHEET_NAME` wins (`SELECTED_AT` / `APPROVED_AT`).

| Column | Purpose |
|--------|---------|
| `RUN_ID`, `SELECTED_AT`, `SHEET_NAME` | Identity |
| `IN_WHITELIST`, `FORBIDDEN`, `DIFF_STATUS` | Context |
| `OPERATOR_DECISION` | `APPROVE`, `SKIP`, `HOLD`, `BLOCK` |
| `APPROVED_BY`, `APPROVED_AT` | Operator audit |
| `APPLY_STATUS` | `PENDING`, `READY_TO_APPLY`, `APPLIED`, `SKIPPED`, `BLOCKED`, `FAILED` |
| `MESSAGE`, `DETAIL_JSON` | Traceability |

Only `APPROVE` + `READY_TO_APPLY` may be written to DESTINATION.

---

## Config keys

| Key | Required value |
|-----|----------------|
| `SELECTIVE_SYNC_REQUIRED` | `TRUE` |
| `SYNC_SELECTION_SHEET` | `SYNC_SELECTION` |
| `ALLOW_SYNC_ALL_WHITELIST` | `FALSE` |
| `FULL_WORKBOOK_SYNC` | `FORBIDDEN` |
| `WHITELIST_SYNC_REQUIRED` | `TRUE` |
| `SYNC_WHITELIST` | Newline-separated sheet names |
| `SYNC_FORBIDDEN_PATTERNS` | Newline-separated patterns |

List format: newline-separated in `SYNC_CONFIG` (comma/semicolon/JSON array optional).

---

## On guard failure

```text
DO NOT SYNC
DO NOT CLEAR DESTINATION
DO NOT WRITE DESTINATION
LOG / AUDIT / REPORT
```

---

## Implementation

- Selective: `05_GAS_RUNTIME/84_DATA_SYNC_RUNTIME_SELECTIVE_SYNC_APPLY.js`
- Whitelist: `84_DATA_SYNC_RUNTIME_WHITELIST_SYNC_GUARD.js`
- Legacy apply (blocked when selective on): `84_DATA_SYNC_RUNTIME_MANUAL_SYNC_APPLY.js`
- Menu 9–11: build plan, selective apply, open selection

---

*Contract append-only. Amend via ADR addendum.*
