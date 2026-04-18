# Checklist diff — đồng bộ tài liệu GAS (`05_GAS_RUNTIME`)

**Nguồn đối chiếu:** `.clasp.json` → `filePushOrder`, và code trong `90_BOOTSTRAP_MENU_WRAPPERS.js`, `95_TASK_SYSTEM_BOOTSTRAP.js`, `00_CORE_CONFIG.js`.

**Quy ước:** `[ ]` = chưa làm · `[x]` = đã làm (cập nhật khi merge).

---

## 1. `WRAPPER_ARCHITECTURE_AUDIT.md`

| # | Hành động cụ thể |
|---|------------------|
| [x] | **§1 `buildActiveSlicesSpec`:** Xóa mô tả CRITICAL / đệ quy. Thay bằng: wrapper gọi `callIfExists_('buildActiveSlicesSpecImpl')`; impl ở `95_TASK_SYSTEM_BOOTSTRAP.js`. Cập nhật số dòng (hiện ~211). |
| [x] | **§1 `ensureSeedUserDirectory`:** Xóa `ensureSeedUserDirectoryImpl`. Ghi: wrapper gọi `seedUserDirectory` (`90_BOOTSTRAP_USER_SEED.js`). |
| [x] | **§1 `testFieldPolicyReadiness`:** Ghi: wrapper gọi `testFieldPolicyReadinessImpl` (`97_TASK_SYSTEM_TEST_RUNNER.js`), không còn self-reference cùng tên. |
| [x] | **§2 `repairSchemaAndData`:** Sửa dòng “No wrapper repairWholeSystemSafely” → **có** `repairWholeSystemSafely()` trong `90_BOOTSTRAP_MENU_WRAPPERS.js` (gọi `repairSchemaAndData`). |
| [x] | **§3 Duplicate paths:** Cập nhật bảng: (a) `menuRepairSchemaSafely` → `repairSchemaSafely()`; (b) `menuEnforceFinalSchemaSafely` → `callIfExists_('enforceFinalSchemaSafely')` (đã gọi impl path, không qua `ensureAllSchemas()`); (c) `menuRepairWholeSystemSafely` → `repairWholeSystemSafely()`; (d) Build slice spec: bỏ hàng CRITICAL, ghi `menuBuildSliceSpec` → `buildActiveSlicesSpec` → `buildActiveSlicesSpecImpl`. |
| [x] | **§5–6 Summary / Recommended fixes:** Xóa hoặc chuyển sang mục “Đã xử lý trong code”; chỉ giữ gợi ý còn mở (vd. tinh gọn fallback `auditSchemaMismatch`). |

---

## 2. `FUNCTION_WRAPPER_MAP.md`

| # | Hành động cụ thể |
|---|------------------|
| [x] | **Dòng `buildActiveSlicesSpec`:** Cột Impl đổi từ `buildActiveSlicesSpec` → **`buildActiveSlicesSpecImpl`**; Notes: “Impl suffix — 95”. |
| [x] | **Dòng `testFieldPolicyReadiness`:** Cột Impl đổi thành **`testFieldPolicyReadinessImpl`**; module `97_TASK_SYSTEM_TEST_RUNNER.js`. |

---

## 3. `DEPENDENCY_MAP.md`

| # | Hành động cụ thể |
|---|------------------|
| [ ] | **Thêm disclaimer** đầu file: bảng dưới là **tóm tắt kiến trúc** hoặc **đồng bộ với `.clasp.json`** — hoặc chọn một là source of truth. |
| [ ] | **Chèn các file thiếu** (theo thứ tự `.clasp.json`), gồm tối thiểu: `03_RELATED_ENTITY_HELPER.js`, toàn bộ `10_HOSO_*`, `11_PHUONG_TIEN_*`, `10_HOSO_WRAPPERS.js`, `21_MASTER_DATA_HELPER.js`, `90_BOOTSTRAP_ON_EDIT.js`, `45_SHARED_WITH_SERVICE.js`, `40_STAR_PIN_SERVICE.js`, `95_TASK_SYSTEM_BOOTSTRAP.js`, `96_TASK_SYSTEM_AUDIT_REPAIR.js`, `97_TASK_SYSTEM_*`, `99_MIGRATION_CLEAN_PRO.js`, `98_*.js` (schema/seed/validation/audit/deployment), `99_APPSHEET_WEBHOOK.js`, `60_HOSO_API_GATEWAY.js`, `61_UNIFIED_ROUTER.js`, `90_BOOTSTRAP_MENU_HELPERS.js`, `90_BOOTSTRAP_MENU_WRAPPERS.js`, `10_HOSO_MENU.js` — kèm cột Depends on ngắn gọn. |
| [ ] | **Đánh lại số thứ tự** cột `#` cho khớp push order (hoặc bỏ cột # cố định, dùng tên file làm khóa). |
| [ ] | **Cross-module:** Rà lại câu “10/20/30 không gọi nhau” nếu đã có router/gateway — chỉnh cho đúng kiến trúc hiện tại. |

---

## 4. `CLASP_PUSH_ORDER.md`

| # | Hành động cụ thể |
|---|------------------|
| [ ] | **Bảng “Documented filePushOrder”:** Bổ sung **toàn bộ** file có trong `.clasp.json` sau entry 46 (`99_DEBUG_SAMPLE_DATA.js`): ví dụ `99_APPSHEET_WEBHOOK.js`, `60_HOSO_API_GATEWAY.js`, `61_UNIFIED_ROUTER.js`, `90_BOOTSTRAP_MENU_HELPERS.js`, `90_BOOTSTRAP_MENU_WRAPPERS.js`, `10_HOSO_MENU.js`, và toàn bộ khối file xuất hiện **trước** `20_TASK_*` trong JSON (HoSo split, v.v.). |
| [ ] | **Mục “Exact filePushOrder (matches .clasp.json)”:** Thay excerpt bằng script/instruction: `đọc .clasp.json` hoặc paste full ordered list — tránh drift. |
| [ ] | **Key rules #9:** Sửa “BOOTSTRAP_MENU last” → **các handler menu** (`90_BOOTSTRAP_MENU.js`, `10_HOSO_MENU.js`) load **sau** helpers/wrappers; trigger/install cuối cùng như hiện tại. |

---

## 5. `BOOTSTRAP_DEPLOY.md`

| # | Hành động cụ thể |
|---|------------------|
| [ ] | **File Tree (GAS):** Thay glob rút gọn bằng: (1) trỏ rõ `90_BOOTSTRAP_AUDIT_SCHEMA.js` (có trong DEPENDENCY_MAP + clasp); (2) liệt kê hoặc trỏ `CLASP_PUSH_ORDER.md` / `.clasp.json` làm danh sách đầy đủ. |
| [ ] | **Cân nhắc:** Ghi chú các file `98_*`, `95/96/97_*` nếu team dùng doc này cho onboarding — optional. |

---

## 6. `BOOTSTRAP_AUDIT_REPORT.md`

| # | Hành động cụ thể |
|---|------------------|
| [ ] | **§7 file list:** Bổ sung `90_BOOTSTRAP_MENU_HELPERS`, `90_BOOTSTRAP_MENU_WRAPPERS`, `98_*`, `95/96/97_*` nếu audit “layer separation” vẫn dùng — hoặc thu hẹp phạm vi câu trả lời “PASS” chỉ cho các file được liệt kê. |
| [ ] | **“Final deployment order”:** Giữ nguyên nếu vẫn đúng quy trình; thêm 1 dòng “sau khi clasp push đầy đủ theo `.clasp.json`”. |

---

## 7. `DATA_SYNC_MODULE_DESIGN.md`

| # | Hành động cụ thể |
|---|------------------|
| [ ] | **§3.3 (sau `validateSyncPlan`):** Chốt một policy — **khuyến nghị:** `buildDataSyncReport` nếu phát hiện plan chưa validate (flag internal hoặc gọi trước `validateSyncPlan`) → **`throw`** với code cố định ví dụ `PLAN_NOT_VALIDATED` và message rõ. |
| [ ] | **§4.6 + §9 I-3:** Gán owner file cho timezone / `date_iso` — **khuyến nghị:** `DATA_SYNC_TRANSFORM.js` (khi tạo module) hoặc file engine đã chốt tên; ghi một dòng “single owner”. |
| [ ] | **§6.1 + §10 checklist:** Giữ checklist `[ ]` cho `SYSTEM_ACTOR_ID` cho đến khi `00_CORE_CONFIG.js` có field — sau khi thêm code, tick và cập nhật bảng §11. |

---

## 8. `WRAPPER_MIGRATION_NOTE.md`

| # | Hành động cụ thể |
|---|------------------|
| [ ] | Thêm hàng **`buildActiveSlicesSpec` → `buildActiveSlicesSpecImpl`** nếu bảng migration chưa có (đồng bộ `FUNCTION_WRAPPER_MAP`). |

---

## 9. `GAS_BOOTSTRAP_SPEC_LAOCONG_PRO.md` · `GAS_REFACTOR_PLAN.md` · `USER_ROLE_PERMISSION_SPEC.md`

| # | Hành động cụ thể |
|---|------------------|
| [ ] | Rà **mỗi chỗ** nói “xem CLASP_PUSH_ORDER / DEPENDENCY_MAP là exact sequence” — thêm câu: **source of truth = `.clasp.json`**, doc phải mirror hoặc chỉ mô tả layer. |
| [ ] | `USER_ROLE_PERMISSION_SPEC.md`: chỉ chỉnh nếu có mâu thuẫn với `SYSTEM_ACTOR_ID` / audit actor — optional. |

---

## 10. Không cần sửa (đã nhất quán hoặc chỉ informational)

| File | Ghi chú |
|------|---------|
| `BOOTSTRAP_AUDIT_REPORT.md` § “Final deployment order” vs `BOOTSTRAP_DEPLOY.md` § “Final deployment order” | Cùng thứ tự `initAll` → `selfAuditBootstrap` → `installTriggers` — **OK**. |
| `.clasp.json` | Đã có `99_APPSHEET_WEBHOOK.js` — vấn đề là **doc** không liệt kê, không phải thiếu push. |

---

## Tóm tắt ưu tiên thực hiện doc

1. **Đã cập nhật trong repo (lần chỉnh này):** `WRAPPER_ARCHITECTURE_AUDIT.md` (toàn bộ mục lỗi đã fix trong code), một phần `FUNCTION_WRAPPER_MAP.md`.  
2. **Làm tiếp:** `DEPENDENCY_MAP.md` + `CLASP_PUSH_ORDER.md` (drift với `.clasp.json` là lớn nhất).  
3. **Spec:** `DATA_SYNC_MODULE_DESIGN.md` (policy + owner timezone).  
4. **Nhẹ:** `BOOTSTRAP_DEPLOY.md` file tree, các cross-ref trong `GAS_*`.
