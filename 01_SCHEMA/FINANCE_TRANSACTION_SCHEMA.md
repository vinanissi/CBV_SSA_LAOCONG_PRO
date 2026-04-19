# FINANCE_TRANSACTION Schema (Final)

**Canonical source (Google Sheet row 1 + GAS):** `05_GAS_RUNTIME/90_BOOTSTRAP_SCHEMA.js` → `CBV_SCHEMA_MANIFEST.FINANCE_TRANSACTION`, mirrored in `06_DATABASE/schema_manifest.json`.

**Legacy note:** `00_OVERVIEW/CBV_FINAL_ARCHITECTURE.md` (high-level only).

## Purpose

Financial transactions. Unit attribution via DON_VI_ID.

---

## Columns (Canonical Order)

Export / CSV column order must match this table (same as sheet headers).

| # | Column | Type | Required | Notes |
|---|--------|------|----------|-------|
| 1 | ID | Text | Yes | Unique key |
| 2 | TRANS_CODE | Text | No | Display code |
| 3 | TRANS_DATE | Date | Yes | |
| 4 | TRANS_TYPE | Text | Yes | Enum `FINANCE_TYPE` |
| 5 | STATUS | Text | Yes | Enum `FINANCE_STATUS` |
| 6 | CATEGORY | Text | Yes | Enum `FIN_CATEGORY` (GAS `createTransaction` requires) |
| 7 | AMOUNT | Number | Yes | |
| 8 | DON_VI_ID | Text | No | Ref DON_VI (unit attribution) |
| 9 | COUNTERPARTY | Text | No | |
| 10 | PAYMENT_METHOD | Text | No | Enum |
| 11 | REFERENCE_NO | Text | No | |
| 12 | RELATED_ENTITY_TYPE | Text | No | Polymorphic |
| 13 | RELATED_ENTITY_ID | Text | No | Polymorphic |
| 14 | DESCRIPTION | Text | No | |
| 15 | EVIDENCE_URL | Text | No | |
| 16 | CONFIRMED_AT | Datetime | No | |
| 17 | CONFIRMED_BY | Text | No | Ref USER_DIRECTORY |
| 18 | CREATED_AT | Datetime | No | |
| 19 | CREATED_BY | Text | No | |
| 20 | UPDATED_AT | Datetime | No | |
| 21 | UPDATED_BY | Text | No | |
| 22 | IS_DELETED | Yes/No | Yes | Soft delete |
| 23 | IS_STARRED | Yes/No | Yes | UX (default false in GAS) |
| 24 | IS_PINNED | Yes/No | Yes | UX (default false in GAS) |
| 25 | PENDING_ACTION | Text | No | AppSheet/GAS pending CMD; default `''` |

---

## References

| Ref Field | Target | Notes |
|-----------|--------|-------|
| DON_VI_ID | DON_VI | Unit attribution |
| CONFIRMED_BY | USER_DIRECTORY | Who confirmed |
