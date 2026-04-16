# DB AUDIT REPORT v2 — Re-audit (Phase 6)

**Generated:** 2026-04-16  
**Baseline:** `06_DATABASE/AUDIT_REPORT.md` (v1, cùng ngày)  
**Scope:** Xác minh lại 6 RISK (RISK-001 … RISK-006) sau các fix; cập nhật scorecard; không chỉnh sửa code trong lần audit này ngoài file báo cáo này.

**Phương pháp:**

| Bước | Kết quả |
|------|---------|
| `python 99_TOOLS/sync_schema_manifest_from_bootstrap.py --verify` | **OK** — `manifest matches GAS + ENUM seed + operational; CBV_CONFIG covered.` |
| Đối chiếu `schema_manifest.json` ↔ `90_BOOTSTRAP_SCHEMA.js` | Theo tool: **khớp** (thứ tự bảng/cột theo bootstrap + operational). |
| Đọc mẫu GAS / JSON notes / DATA_MODEL / checklist | Xem mục RISK bên dưới. |

---

## 1. Trạng thái từng RISK (so với v1)

| ID | v1 | v2 | Ghi chú ngắn |
|----|----|----|----------------|
| **RISK-001** | 🔴 manifest ↔ GAS drift | **FIXED** | `--verify` pass; `TASK_MAIN` có `SHARED_WITH`, `IS_PRIVATE`, `PENDING_ACTION`; `TASK_ATTACHMENT` / `FINANCE_*` / `HO_SO_FILE` đồng bộ nguồn bootstrap. |
| **RISK-002** | 🔴 5 sheet thiếu manifest | **FIXED** | `ENUM_DICTIONARY`, `FINANCE_LOG`, `FINANCE_ATTACHMENT`, `DOC_REQUIREMENT` nằm trong body manifest; `SYSTEM_HEALTH_LOG` trong `_operational_tables` + `OPERATIONAL_TABLE_ORDER` (kèm mô tả nguồn header GAS). |
| **RISK-003** | 🟡 `createTask` thiếu TASK PRO | **FIXED** | `05_GAS_RUNTIME/20_TASK_SERVICE.js`: `_taskProFieldsFromCreatePayload` → `createTask` gán `SHARED_WITH`, `IS_PRIVATE`, `PENDING_ACTION`; có `taskSelfTestCreateProDefaults`. |
| **RISK-004** | 🟡 polymorphic FK | **FIXED** | `06_DATABASE/schema_column_notes.json` → `_polymorphic_fk` gồm `RELATED_ENTITY_TYPE` / cặp ID cho HO_SO, TASK, FINANCE; thêm `RELATED_TABLE`/`RELATED_RECORD_ID`, `ENTITY_TYPE`/`ENTITY_ID` (admin). `assertValidRelatedEntityType` trong `03_RELATED_ENTITY_HELPER.js`; được dùng trên luồng chính (`10_HOSO_SERVICE.js`, `20_TASK_SERVICE.js`, `30_FINANCE_SERVICE.js`). *Lưu ý:* Google Sheets vẫn không có FK cứng; không phải mọi chỗ đều resolve `getRelatedEntity` trước mọi write — đúng thiết kế tầng sheet. |
| **RISK-005** | 🟢 thiếu DATA_MODEL TASK/FINANCE | **FIXED** | `02_MODULES/TASK/DATA_MODEL.md`, `02_MODULES/FINANCE/DATA_MODEL.md` tồn tại, mô tả field-level và tham chiếu manifest/bootstrap. |
| **RISK-006** | 🟢 AppSheet khó audit | **FIXED** | `04_APPSHEET/APPSHEET_READINESS_CHECKLIST.md` tồn tại (checklist tái kiểm định kỳ). |

**Tóm tắt:** **6 / 6** RISK ở trạng thái **FIXED** (theo tiêu chí Phase 6).

---

## 2. Scorecard v2 (so với v1 §7)

Phương pháp giữ **ước lượng audit** như v1 (không chạy full test tự động). Tổng số bảng có mảng cột trong `schema_manifest.json`: **18** (không tính `_meta` / `_operational_tables` block nội dung cột).

| Hạng mục | v1 (tham chiếu) | v2 | Ghi chú |
|----------|------------------|-----|---------|
| Bảng có đủ audit fields (CREATED/UPDATED + IS_DELETED nơi cần) | ~79% * (14 bảng) | **~67%** * (18 bảng) | Nhiều bảng cấu hình / append-only / immutable (`DOC_REQUIREMENT`, `ENUM_DICTIONARY`, `FINANCE_LOG`, `HO_SO_FILE`, `FINANCE_ATTACHMENT`, …) **by design** không có đủ bộ ba; tỉ lệ % giảm nhẹ khi đưa thêm bảng “không full audit” vào manifest — **chất lượng nguồn sự thật** tốt hơn v1 (không còn “thiếu trong manifest”). |
| FK document đầy đủ | ~67% * | **~85%** * | `_polymorphic_fk` + `FINANCE`/`TASK` DATA_MODEL; `FIN_ID` → `FINANCE_TRANSACTION` được mô tả trong DATA_MODEL FINANCE. |
| Enum dùng MASTER_CODE | ~50% * | **~55%** * | Vẫn phụ thuộc `ENUM_DICTIONARY`; `_master_code_enum_gaps` (ví dụ `VEHICLE_TYPE`, `DON_VI_TYPE`) ghi nhận seed chưa append — chờ quyết định nghiệp vụ. |
| GAS write có validation | ~70% * | **~85%** * | Đồng bộ manifest; `createTask` PRO defaults; polymorphic type assert trên service chính. `_appendRecord` / `_updateRow` vẫn generic — by design. |
| GAS write có error handling | ~65% * | **~68%** * | Gateway/API vẫn tốt hơn tầng service; không đổi kiến trúc trong re-audit. |

\* Tỉ lệ mang tính ước lượng.

**Đánh giá tổng thể:** v1 **🟡** → v2 **🟢** — **Một nguồn machine-readable** (`schema_manifest.json` verify khớp `90_BOOTSTRAP_SCHEMA.js` + operational) đã đạt; các RISK critical/warning trong v1 đã được đóng trong repo. Điểm cần theo dõi (không hạ cấp mức tổng thể trong báo cáo này): seed `MASTER_CODE` cho nhóm trong `_master_code_enum_gaps`, và kỷ luật không gọi primitive repository trực tiếp bỏ qua validation.

---

## 3. PARTIAL / OPEN

Theo tiêu chí Phase 6, **không còn** mục **PARTIAL** / **OPEN** cho RISK-001 … RISK-006.

**Việc nên làm tiếp (ngoài phạm vi “đóng RISK”):**

1. **Seed MASTER_CODE:** Khi approve, append `02_SEED/seed_master_code.tsv` (hoặc tương đương) cho các nhóm trong `_master_code_enum_gaps` để khớp hoàn toàn ý “enum → MASTER_CODE” trên các cột đã khai báo.
2. **AppSheet:** Chạy checklist trong `APPSHEET_READINESS_CHECKLIST.md` trên môi trường thật sau mỗi đợt đổi schema.
3. **CI / kỷ luật:** Giữ `sync_schema_manifest_from_bootstrap.py --verify` trong pipeline hoặc pre-commit để không tái diễn RISK-001.

---

## 4. So khớp lệnh verify (log)

```
OK: manifest matches GAS + ENUM seed + operational; CBV_CONFIG covered.
```

---

*End of report v2.*
