# CBV PRO Function Wrapper Map

## A. Mục đích (Purpose)

### Kiến trúc Wrapper + Impl

Hệ thống CBV sử dụng **Wrapper + Impl** để:

1. **An toàn khi gọi từ Menu** — Wrapper kiểm tra Impl tồn tại, hiển thị thông báo rõ ràng nếu thiếu.
2. **Không lỗi thầm** — Menu không bao giờ chết im; luôn có phản hồi (alert, log).
3. **Dễ bảo trì** — Logic thật nằm trong Impl; wrapper chỉ route và UI.
4. **Tách biệt rõ ràng** — Wrapper = entry point; Impl = business logic.

### Quy tắc

- **Wrapper**: Tên đơn giản, gọi trực tiếp từ menu hoặc `menu*` handler.
- **Impl**: Hậu tố `*Impl`, chứa logic thực thi.
- **Helper**: Không phải wrapper, phục vụ chung (vd: `callIfExists_`, `openSheetByName_`).

---

## B. Bảng Wrapper Mapping

### System / Bootstrap

| Wrapper | Impl | Module/File | Status | Description |
|---------|------|-------------|--------|-------------|
| runFullDeployment | runFullDeploymentImpl | 98_deployment_bootstrap.gs | Implemented | Triển khai một chạm đầy đủ |
| ensureAllSchemas | ensureAllSchemasImpl | 98_schema_manager.gs | Implemented | Đảm bảo tất cả sheet và cột |
| seedAllData | seedAllDataImpl | 98_seed_manager.gs | Implemented | Gieo DON_VI, USER, ENUM, MASTER_CODE |
| installTriggers | installTriggersImpl | 90_BOOTSTRAP_INSTALL.gs | Implemented | Cài trigger dailyHealthCheck |
| removeCbvTriggers | removeCbvTriggersImpl | 90_BOOTSTRAP_INSTALL.gs | Implemented | Gỡ tất cả trigger CBV |
| (initAll) | initAll | 90_BOOTSTRAP_INIT.gs | Implemented | Gọi qua runSafeMenuStep_, không wrapper |
| (protectSensitiveSheets) | protectSensitiveSheets | 90_BOOTSTRAP_PROTECTION.gs | Implemented | Gọi qua runSafeMenuStep_ |

### Audit

| Wrapper | Impl | Module/File | Status | Description |
|---------|------|-------------|--------|-------------|
| selfAuditBootstrap | selfAuditBootstrapImpl | 90_BOOTSTRAP_AUDIT.gs | Implemented | Audit bootstrap đầy đủ |
| verifyAppSheetReadiness | verifyAppSheetReadinessImpl | 50_APPSHEET_VERIFY.gs | Implemented | Xác minh sẵn sàng AppSheet |
| testSchemaIntegrity | testSchemaIntegrity | 97_TASK_SYSTEM_TEST_RUNNER.gs | Implemented | Kiểm tra schema |
| validateAllEnums | validateAllEnumsImpl | 98_validation_engine.gs | Implemented | Validate ENUM_DICTIONARY |
| validateAllRefs | validateAllRefsImpl | 98_validation_engine.gs | Implemented | Validate ref integrity |
| validateDonViHierarchy | validateDonViHierarchyImpl | 98_validation_engine.gs | Implemented | Validate DON_VI hierarchy |
| runAllSystemTests | runAllSystemTestsImpl | 97_TASK_SYSTEM_TEST_RUNNER.gs | Implemented | Chạy tất cả test |
| generateDeploymentReport | runFullDeploymentImpl + generateDeploymentReportImpl | 98_*, 98_audit_logger | Implemented | Chạy deployment + ghi report |

### Repair

| Wrapper | Impl | Module/File | Status | Description |
|---------|------|-------------|--------|-------------|
| repairTaskSystemSafely | repairTaskSystemSafelyImpl | 95_TASK_SYSTEM_BOOTSTRAP.gs | Implemented | Sửa task system (cột, schema) |
| repairSchemaSafely | repairSchemaColumns, repairSchemaAndData | 90_BOOTSTRAP_REPAIR.gs | Implemented | Thêm cột thiếu, sửa schema |
| repairEnumSafely | runSafeRepair | 01_ENUM_SYNC_SERVICE.gs | Implemented | Sửa enum thiếu/trùng |
| repairRefSafely | (informational) | — | Stub | Chỉ hướng dẫn; dùng Sửa toàn hệ thống |
| enforceFinalSchemaSafely | repairSchemaColumns, ensureAllSchemasImpl | 90_BOOTSTRAP_REPAIR, 98_schema | Implemented | Áp dụng schema cuối |

### Master Data

| Wrapper | Impl | Module/File | Status | Description |
|---------|------|-------------|--------|-------------|
| ensureSeedEnumDictionary | seedEnumDictionary | 01_ENUM_SEED.gs | Implemented | Gieo ENUM_DICTIONARY |
| ensureSeedDonVi | ensureSeedDonVi | 95_TASK_SYSTEM_BOOTSTRAP.gs | Implemented | Gieo DON_VI |
| ensureSeedMasterCode | ensureSeedTaskType | 95_TASK_SYSTEM_BOOTSTRAP.gs | Implemented | Gieo MASTER_CODE (TASK_TYPE) |
| ensureSeedUserDirectory | seedUserDirectory | 90_BOOTSTRAP_USER_SEED.gs | Implemented | Gieo USER_DIRECTORY (optional) |
| buildActiveSlicesSpec | buildActiveSlicesSpecImpl (95) | 95_TASK_SYSTEM_BOOTSTRAP.gs | **⚠ Known Issue** | Xây slice spec — xem mục Known Issues |
| buildEnumSpecReport | auditEnumConsistency, enumHealthCheck | 01_ENUM_AUDIT | Implemented | Báo cáo enum |

### Task

| Wrapper | Impl | Module/File | Status | Description |
|---------|------|-------------|--------|-------------|
| auditTaskModule | selfAuditTaskSystemFull, selfAuditTaskSystem | 95, 96 | Implemented | Audit task module |
| seedTaskDemo | seedGoldenDataset | 99_DEBUG_SAMPLE_DATA.gs | Implemented | Gieo dữ liệu mẫu Task |
| testTaskWorkflowRules | runTaskSystemTests, runAllSystemTestsImpl | 97 | Implemented | Test workflow Task |
| testFieldPolicyReadiness | testFieldPolicyReadiness, runTaskSystemTests | 97 | Implemented | Test field policy |
| createSampleTaskRows | seedTaskDemo | — | Implemented | Ủy quyền seedTaskDemo |

### HoSo

| Wrapper | Impl | Module/File | Status | Description |
|---------|------|-------------|--------|-------------|
| auditHoSoModule | runHoSoTests | 99_DEBUG_TEST_HOSO.gs | Implemented | Audit hồ sơ |
| seedHoSoDemo | seedGoldenDataset | 99_DEBUG_SAMPLE_DATA.gs | Implemented | Gieo demo hồ sơ |
| testHoSoRelations | auditHoSoModule | — | Implemented | Ủy quyền auditHoSoModule |

### Finance

| Wrapper | Impl | Module/File | Status | Description |
|---------|------|-------------|--------|-------------|
| auditFinanceModule | runFinanceTests | 99_DEBUG_TEST_FINANCE.gs | Implemented | Audit tài chính |
| seedFinanceDemo | seedGoldenDataset | 99_DEBUG_SAMPLE_DATA.gs | Implemented | Gieo demo tài chính |
| testFinanceDonViMapping | auditFinanceModule | — | Implemented | Ủy quyền auditFinanceModule |

### Schema Tools

| Wrapper | Impl | Module/File | Status | Description |
|---------|------|-------------|--------|-------------|
| dumpAllSheetSchemas | getRequiredSheetNames, getSchemaHeaders | 90_BOOTSTRAP_SCHEMA.gs | Implemented | Dump schema tất cả sheet |
| auditSchemaMismatch | selfAuditBootstrapImpl | 90_BOOTSTRAP_AUDIT.gs | Implemented | Kiểm tra lệch schema |
| dumpSchemaProfileFull | dumpAllSheetSchemas | — | Implemented | Ủy quyền dumpAllSheetSchemas |

### Admin

| Wrapper/Helper | Impl | Module/File | Status | Description |
|----------------|------|-------------|--------|-------------|
| openSystemHealthLogSheet | openSheetByName_ | 90_BOOTSTRAP_MENU_HELPERS.gs | Implemented | Mở SYSTEM_HEALTH_LOG |
| openAdminAuditLogSheet | openSheetByName_ | 90_BOOTSTRAP_MENU_HELPERS.gs | Implemented | Mở ADMIN_AUDIT_LOG |
| showMissingFunctionReport | — | 90_BOOTSTRAP_MENU_HELPERS.gs | Implemented | Báo cáo hàm Impl thiếu |
| verifyMenuBindings | — | 90_BOOTSTRAP_MENU_HELPERS.gs | Implemented | Kiểm tra binding menu |
| showDailyAdminGuide | — | 90_BOOTSTRAP_MENU_HELPERS.gs | Implemented | Hướng dẫn admin hàng ngày |

---

## C. Categorization Summary

| Category | Wrapper Count | Implemented | Stub | Known Issue |
|----------|---------------|-------------|------|-------------|
| System/Bootstrap | 7 | 7 | 0 | 0 |
| Audit | 8 | 8 | 0 | 0 |
| Repair | 5 | 4 | 1 | 0 |
| Master Data | 6 | 5 | 0 | 1 |
| Task | 5 | 5 | 0 | 0 |
| HoSo | 3 | 3 | 0 | 0 |
| Finance | 3 | 3 | 0 | 0 |
| Schema Tools | 3 | 3 | 0 | 0 |
| Admin | 5 | 5 | 0 | 0 |

---

## D. Detection Rules

### Phát hiện Impl thiếu (Missing Impl)

1. Chạy menu **Dev / Admin → Báo cáo hàm thiếu** (`showMissingFunctionReport`).
2. Kiểm tra danh sách Impl trong `90_BOOTSTRAP_MENU_HELPERS.gs` → `requiredImpl`.
3. Nếu wrapper gọi `callIfExists_('xyzImpl')` và `xyzImpl` không tồn tại → wrapper sẽ báo "chưa được tải".

### Phát hiện Impl không dùng (Unused Impl)

1. Grep tất cả `*Impl` trong codebase.
2. Đối chiếu với bảng Wrapper Mapping — mỗi Impl phải có ít nhất một wrapper hoặc gọi trực tiếp từ Impl khác (vd: `runFullDeploymentImpl` gọi `ensureAllSchemasImpl`).

### Phát hiện mapping hỏng (Broken Mapping)

- **Wrapper gọi chính nó** → Recursion. Ví dụ: `buildActiveSlicesSpec` gọi `callIfExists_('buildActiveSlicesSpec')` khi wrapper đã ghi đè impl.
- **Menu handler không qua wrapper** → Menu gọi trực tiếp impl, bypass layer.
- **Fallback sai** → Wrapper fallback sang hàm đã bị ghi đè (vd: ensureAllSchemas khi ensureAllSchemas là wrapper).

---

## E. Maintenance Rules

### Thêm hàm mới

1. **Tạo Impl** (`xyzImpl`) trong file logic phù hợp.
2. **Tạo Wrapper** (`xyz`) trong `90_BOOTSTRAP_MENU_WRAPPERS.gs`:
   - Gọi `callIfExists_('xyzImpl', ...)`
   - Nếu null → `SpreadsheetApp.getUi().alert('xyzImpl chưa được tải')`; return
   - Nếu có kết quả → hiển thị UI phù hợp
3. **Tạo menu handler** `menuXyz` gọi `xyz()` (wrapper).
4. **Thêm vào menu** trong `90_BOOTSTRAP_MENU.gs` → `addItem('Label', 'menuXyz')`.
5. **Cập nhật** `showMissingFunctionReport` nếu cần.

### Quy ước đặt tên

| Loại | Quy ước | Ví dụ |
|------|---------|-------|
| Wrapper | Tên đơn giản, camelCase | runFullDeployment, selfAuditBootstrap |
| Impl | Hậu tố Impl | runFullDeploymentImpl |
| Menu handler | Tiền tố menu | menuRunFullDeployment |
| Helper | Hậu tố _ | callIfExists_, openSheetByName_ |

### Safe Patterns

- Wrapper **luôn** kiểm tra Impl trước khi gọi.
- Wrapper **không** gọi trực tiếp logic; chỉ gọi Impl.
- Menu **luôn** bind tới `menu*` hoặc wrapper; **không** bind trực tiếp Impl.
- Helper `callIfExists_(fnName, ...args)` dùng để gọi động; tránh eval trực tiếp fn nếu có thể.

---

## F. Known Issues

| Wrapper | Vấn đề | Trạng thái |
|---------|--------|------------|
| buildActiveSlicesSpec | Wrapper gọi `callIfExists_('buildActiveSlicesSpec')` — vì wrapper ghi đè impl từ 95, gây recursion. | Cần rename 95's buildActiveSlicesSpec → buildActiveSlicesSpecImpl |
| ensureSeedUserDirectory | Tham chiếu ensureSeedUserDirectoryImpl không tồn tại; fallback seedUserDirectory. | Chấp nhận được; fallback hoạt động |

---

## G. Kiến trúc cuối cùng (Final Architecture)

**Không hybrid.** Các bảng chuẩn:

- **USER_DIRECTORY** — Bảng user duy nhất. Users global.
- **DON_VI** — Bảng tổ chức duy nhất. Không nằm trong MASTER_CODE.
- **MASTER_CODE** — Chỉ dữ liệu master tĩnh/bán tĩnh (TASK_TYPE, …). Không chứa DON_VI hay USER.
- **ENUM_DICTIONARY** — Định nghĩa enum.

**Không dùng:** HTX-based user, MASTER_CODE làm USER/DON_VI, schema hybrid.
