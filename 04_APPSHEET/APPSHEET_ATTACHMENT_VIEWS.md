# AppSheet Attachment Views — Inline List Columns

Quick reference for inline attachment list columns. See APPSHEET_INLINE_ATTACHMENT_UX.md for full design.

---

## HO_SO_FILE_INLINE (under HO_SO_DETAIL)

| Column | Show | Notes |
|--------|------|-------|
| FILE_GROUP | Yes | CCCD, GPLX, DANG_KY_XE, HOP_DONG, KHAC |
| FILE_NAME | Yes | Display label |
| FILE_URL | Yes | File link/preview; Type = File |
| NOTE | Yes | Optional |
| ID, HO_SO_ID, DRIVE_FILE_ID, STATUS, CREATED_* | No | Hidden |

**Filter:** `[HO_SO_ID] = [HO_SO_MASTER].[ID]`

---

## TASK_ATTACHMENT_INLINE (under TASK_DETAIL)

| Column | Show | Notes |
|--------|------|-------|
| ATTACHMENT_TYPE | Yes | DRAFT, RESULT, SOP, REFERENCE, OTHER |
| TITLE | Yes | Display label |
| FILE_URL | Yes | File link/preview; Type = File |
| NOTE | Yes | Optional |
| ID, TASK_ID, DRIVE_FILE_ID, CREATED_* | No | Hidden |

**Filter:** `[TASK_ID] = [TASK_MAIN].[ID]`

---

## FIN_ATTACHMENT_INLINE (under FIN_DETAIL)

| Column | Show | Notes |
|--------|------|-------|
| ATTACHMENT_TYPE | Yes | INVOICE, RECEIPT, CONTRACT, PROOF, OTHER |
| TITLE | Yes | Display label |
| FILE_URL | Yes | File link/preview; Type = File |
| NOTE | Yes | Optional |
| ID, FINANCE_ID, DRIVE_FILE_ID, CREATED_* | No | Hidden |

**Filter:** `[FINANCE_ID] = [FINANCE_TRANSACTION].[ID]`

---

## View Map Alignment

| View | Parent View | Child Table |
|------|-------------|-------------|
| HO_SO_FILE_INLINE | HO_SO_DETAIL | HO_SO_FILE |
| TASK_ATTACHMENT_INLINE | TASK_DETAIL | TASK_ATTACHMENT |
| FIN_ATTACHMENT_INLINE | FIN_DETAIL | FINANCE_ATTACHMENT |

See APPSHEET_VIEW_MAP_MASTER.md.
