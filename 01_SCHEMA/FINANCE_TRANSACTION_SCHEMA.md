# FINANCE_TRANSACTION Schema (Final)

**Source:** 00_OVERVIEW/CBV_FINAL_ARCHITECTURE.md

## Purpose

Financial transactions. Unit attribution via DON_VI_ID (not UNIT_ID).

---

## Columns (Canonical Order)

| # | Column | Type | Required | Notes |
|---|--------|------|----------|-------|
| 1 | ID | Text | Yes | Unique key |
| 2 | TRANS_CODE | Text | No | Display code |
| 3 | TRANS_DATE | Date | Yes | |
| 4 | TRANS_TYPE | Text | Yes | Enum |
| 5 | STATUS | Text | Yes | Enum |
| 6 | CATEGORY | Text | No | Enum |
| 7 | AMOUNT | Number | Yes | |
| 8 | DON_VI_ID | Text | No | Ref DON_VI (unit attribution) |
| 9 | COUNTERPARTY | Text | No | |
| 10 | PAYMENT_METHOD | Text | No | Enum |
| 11 | REFERENCE_NO | Text | No | |
| 12 | RELATED_ENTITY_TYPE | Text | No | Polymorphic |
| 13 | RELATED_ENTITY_ID | Text | No | Polymorphic |
| 14 | DESCRIPTION | Text | No | |
| 15 | EVIDENCE_URL | Text | No | |
| 16 | IS_STARRED | Yes/No | No | User highlight flag; AppSheet editable |
| 17 | IS_PINNED | Yes/No | No | Pin to top of lists; AppSheet editable |
| 18 | PENDING_ACTION | Text | No | CMD:finConfirm \| CMD:finCancel \| CMD:finArchive; GAS set; AppSheet readonly |
| 19 | CONFIRMED_AT | Datetime | No | |
| 20 | CONFIRMED_BY | Text | No | Ref USER_DIRECTORY |
| 21 | CREATED_AT | Datetime | No | |
| 22 | CREATED_BY | Text | No | |
| 23 | UPDATED_AT | Datetime | No | |
| 24 | UPDATED_BY | Text | No | |
| 25 | IS_DELETED | Yes/No | Yes | Soft delete |

---

## Removed

- UNIT_ID — use DON_VI_ID

---

## References

| Ref Field | Target | Notes |
|-----------|--------|-------|
| DON_VI_ID | DON_VI | Unit attribution |
| CONFIRMED_BY | USER_DIRECTORY | Who confirmed |
