# HOME_ALERT — Official Display Column Standard (Phase 80F)

Tham chiếu: **CBV Operational Ecosystem Standard V1** — runtime-first, GAS/Sheet là nguồn sự thật cho cột hiển thị, AppSheet chỉ bind cột vật lý (không Virtual Column, không Bot, không formula phức tạp).

Sau các phase **80C** (DISPLAY/CARD/UX), **80D** (DESKTOP), **80E** (OPERATOR + ATTENTION/ACTION/OWNER), phase **80F** chốt **một chuẩn hiển thị duy nhất** cho **Operator View**. Cột legacy **không xóa, không đổi tên**; chỉ **không dùng** trên view operator.

Runtime GAS: `HomeAlert_getOfficialOperatorDisplayConfig_()`, `HomeAlert_validateOperatorDisplayPolicy_()`, test `HomeAlertDisplayStandard_TestConsole_run()`.

---

## A. Official Operator Display Columns (Deck / list)

| Vai trò AppSheet | Cột Sheet (chuẩn cuối) |
|------------------|------------------------|
| **Primary header** | `OPERATOR_PRIMARY_TEXT` |
| **Secondary header** | `OPERATOR_SECONDARY_TEXT` |
| **Summary column** | `OPERATOR_META_TEXT` |
| **Next action** (detail / inline) | `OPERATOR_NEXT_ACTION` |
| **Group by** | `ATTENTION_LABEL` |
| **Sort by** | `DESKTOP_SORT` **DESC** *(chỉ sort backend — không Show trên operator UI)* |

**Không** dùng `DISPLAY_*`, `CARD_*`, `UX_*`, `DESKTOP_*` (trừ `DESKTOP_SORT` cho Sort by) trên operator-facing Deck/List.

---

## B. Operator Detail Columns

Các cột được phép **Show? = ON** trên **ALERT_Detail** (operator):

1. `OPERATOR_PRIMARY_TEXT`
2. `OPERATOR_SECONDARY_TEXT`
3. `OPERATOR_META_TEXT`
4. `OPERATOR_NEXT_ACTION`
5. `ATTENTION_LABEL`
6. `ATTENTION_REASON`
7. `ACTION_FOCUS`
8. `ACTION_HINT`
9. `OWNER_LABEL`
10. `STATUS`
11. `DUE_AT`
12. `NOTE`

---

## C. Backend-only Columns (operator: Show? = OFF; Admin Debug: OK)

Dùng cho **sắp xếp**, **dedupe**, **trace**, **payload** — **không** hiển thị text cho operator:

- `DESKTOP_SORT` — **chỉ** cấu hình **Sort by** DESC; không dùng làm header/summary/label.
- `CARD_SORT`
- `SORT_KEY`
- `SOURCE_HASH`
- `TRACE_ID`
- `ACTION_PAYLOAD_JSON`
- `ALERT_FINGERPRINT` *(nếu sheet có)*
- `ALERT_GROUP_KEY` *(nếu sheet có)*

**Không** dùng `CARD_SORT` / `SORT_KEY` trong bất kỳ vùng hiển thị operator (chỉ sort backend nếu policy cho phép; chuẩn 80F/80E: sort chính = `DESKTOP_SORT`).

---

## D. Legacy Display Columns

| Nhóm | Ví dụ | Policy |
|------|-------|--------|
| `DISPLAY_*` | `DISPLAY_TITLE`, `DISPLAY_SUBTITLE`, … | Giữ cho **backward compatibility** và **Admin Debug only**. |
| `CARD_*` | `CARD_GROUP`, `CARD_SORT`, … | Giữ; **không** dùng trên operator-facing views (trừ policy nội bộ sort — vẫn ẩn UI). |
| `UX_*` | `UX_VISIBLE`, `UX_GROUP_ORDER`, … | Giữ; Admin Debug / automation readiness. |
| `DESKTOP_*` | `DESKTOP_TITLE`, `DESKTOP_SUBTITLE`, … | Giữ; **legacy** so với operator chuẩn 80F; Admin Debug được xem đầy đủ. |

Legacy columns **must not** bind vào Primary/Secondary/Summary/Group của operator Deck sau khi adopt chuẩn 80F.

---

## E. Admin Debug Columns

View **HOME_ALERT_ADMIN_DEBUG** (hoặc tương đương) được phép xem:

- Toàn bộ **raw** (`ALERT_ID`, `ALERT_CODE`, `RELATED_*`, …).
- **Legacy**: `DISPLAY_*`, `CARD_*`, `UX_*`, `DESKTOP_*`.
- **Enrichment**: `ATTENTION_*`, `ACTION_*` (metadata), `OWNER_*`, `OPERATOR_*`.
- **Backend / sort**: `SORT_KEY`, `DESKTOP_SORT`, `CARD_SORT`, `TRACE_ID`, `SOURCE_HASH`, `ACTION_PAYLOAD_JSON`, `LAST_ACTION`, v.v.

Operator role **không** được quyền view Admin Debug.

---

## Summary

| Layer | Operator AppSheet | Admin Debug |
|-------|-------------------|-------------|
| Chuẩn hiển thị | §A + §B | §E |
| Sort | `DESKTOP_SORT` DESC only (hidden) | Có thể xem cột sort |
| Legacy 80C–80D | §D — không dùng | §D + raw |

Tài liệu AppSheet triển khai: `HOME_ALERT_APPSHEET_SETUP.md`, `HOME_ALERT_DESKTOP_WORKSPACE.md`.
