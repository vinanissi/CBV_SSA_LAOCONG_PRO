# CBV PRO Menu Guide

## A. Tổng quan (Overview)

### Mục đích

Menu **🚀 CBV PRO** là giao diện admin chính để vận hành hệ thống CBV. Mục tiêu:

- **Quy trình hàng ngày trước** — Thao tác thường dùng nhất đặt đầu tiên.
- **Phân nhóm rõ ràng** — Audit, Bootstrap, Repair, Module riêng biệt.
- **An toàn** — Chỉ đọc trước; thao tác ghi được tách riêng (Repair Zone).

### Triết lý

1. **Audit trước, Repair sau** — Luôn kiểm tra trước khi sửa.
2. **Một chạm khi có thể** — Triển khai đầy đủ (`runFullDeployment`) cho môi trường mới.
3. **Log là bạn** — SYSTEM_HEALTH_LOG và ADMIN_AUDIT_LOG để theo dõi.

---

## B. Cấu trúc Menu

### 1. 📅 Daily Admin Flow (Quy trình hàng ngày)

| Mục | Handler | Mục đích | Khi nào dùng |
|-----|---------|----------|--------------|
| ✔ Kiểm tra sức khỏe | menuDailyHealthCheck | Chạy selfAuditBootstrap, xem HEALTH, BOOTSTRAP_SAFE, APPSHEET_READY | **Mỗi sáng** hoặc sau khi cập nhật |
| ✔ Xác minh AppSheet | menuVerifyAppSheetReadiness | Kiểm tra AppSheet sẵn sàng | Trước khi dùng AppSheet |
| 📄 Mở SYSTEM_HEALTH_LOG | menuOpenHealthLog | Mở sheet log sức khỏe | Xem lịch sử kiểm tra |
| 📄 Mở ADMIN_AUDIT_LOG | menuOpenAuditLog | Mở sheet audit | Xem lịch sử audit |
| 🔎 Chạy Audit nhanh | menuQuickAuditRun | Audit nhanh, không ghi log | Kiểm tra nhanh |
| 📖 Hướng dẫn Admin hàng ngày | showDailyAdminGuide | Hiển thị hướng dẫn inline | Khi cần nhắc quy trình |

**Thứ tự khuyến nghị sáng:** Kiểm tra sức khỏe → Xem log → Xác minh AppSheet.

---

### 2. 🏗️ Bootstrap & Init

| Mục | Handler | Mục đích | Khi nào dùng |
|-----|---------|----------|--------------|
| ▶ Triển khai đầy đủ | menuRunFullDeployment | Schema + seed + validate + test + report | **Môi trường mới**, sau thay đổi lớn |
| 📐 Đảm bảo schema | menuEnsureSchemas | Tạo sheet, thêm cột thiếu | Thiếu sheet/cột |
| 🌱 Gieo tất cả dữ liệu | menuSeedAllData | Gieo DON_VI, USER, ENUM, MASTER_CODE | Thiếu dữ liệu mẫu |
| 🔒 Bảo vệ sheet nhạy cảm | menuProtectSensitiveSheets | Bảo vệ sheet | Sau khi setup xong |
| ⏰ Cài đặt Triggers | menuInstallTriggers | Cài dailyHealthCheck | Muốn chạy health check tự động |
| ⏹ Gỡ Triggers | menuRemoveTriggers | Gỡ tất cả trigger CBV | Debug, tạm tắt |

---

### 3. 🔎 Audit & Health

| Mục | Handler | Mục đích | Khi nào dùng |
|-----|---------|----------|--------------|
| 🩺 Self Audit | menuSelfAuditBootstrap | Audit đầy đủ, ghi log | Kiểm tra chi tiết |
| ✅ Xác minh AppSheet | menuVerifyAppSheet | Giống Daily Admin | — |
| 📐 Kiểm tra Schema | menuTestSchemaIntegrity | Kiểm tra sheet/cột | Lỗi schema |
| 📊 Kiểm tra Enum | menuValidateEnums | Validate ENUM_DICTIONARY | Lỗi enum |
| 🔗 Kiểm tra Ref | menuValidateRefs | Validate foreign key | Lỗi ref orphan |
| 🏢 Kiểm tra DON_VI | menuValidateDonViHierarchy | Validate DON_VI hierarchy | Lỗi DON_VI |
| 🧪 Chạy tất cả test | menuRunAllTests | Chạy regression test | Trước deploy |
| 📋 Báo cáo triển khai | menuGenerateDeploymentReport | Chạy deployment + ghi report | Tạo báo cáo |

**Nguyên tắc:** Tất cả Audit **chỉ đọc**; không thay đổi dữ liệu.

---

### 4. 🗂️ Master Data

| Mục | Handler | Mục đích | Khi nào dùng |
|-----|---------|----------|--------------|
| 📊 Gieo ENUM_DICTIONARY | menuSeedEnumDictionary | Gieo enum | Thiếu enum |
| 🏢 Gieo DON_VI | menuSeedDonVi | Gieo DON_VI | Thiếu org |
| 📑 Gieo MASTER_CODE | menuSeedMasterCode | Gieo MASTER_CODE (TASK_TYPE) | Thiếu master code |
| 👤 Gieo USER_DIRECTORY | menuSeedUserDirectory | Gieo user | Thiếu user |
| 📋 Xây Slice Spec | menuBuildSliceSpec | Xây slice spec | Phát triển Task |
| 📋 Báo cáo Enum | menuBuildEnumSpecReport | Báo cáo enum | Kiểm tra enum |

---

### 5. ✅ Task Module

| Mục | Handler | Mục đích | Khi nào dùng |
|-----|---------|----------|--------------|
| 🔎 Audit Task | menuAuditTaskModule | Audit task module | Lỗi task |
| 🌱 Gieo Task Demo | menuSeedTaskDemo | Gieo dữ liệu mẫu task | Demo, test |
| 🧪 Test Task Workflow | menuTestTaskWorkflow | Test workflow task | Phát triển |
| 📋 Test Field Policy | menuTestTaskFieldPolicy | Test field policy | Phát triển |
| ➕ Tạo mẫu Task | menuCreateSampleTaskRows | Tạo task mẫu | Demo |

---

### 6. 📁 Hồ sơ Module

| Mục | Handler | Mục đích | Khi nào dùng |
|-----|---------|----------|--------------|
| 🔎 Audit Hồ sơ | menuAuditHoSo | Audit hồ sơ | Lỗi hồ sơ |
| 🌱 Gieo Hồ sơ Demo | menuSeedHoSoDemo | Gieo demo hồ sơ | Demo |
| 🧪 Test Quan hệ Hồ sơ | menuTestHoSoRelations | Test quan hệ hồ sơ | Phát triển |

---

### 7. 💰 Tài chính Module

| Mục | Handler | Mục đích | Khi nào dùng |
|-----|---------|----------|--------------|
| 🔎 Audit Tài chính | menuAuditFinance | Audit tài chính | Lỗi tài chính |
| 🌱 Gieo Tài chính Demo | menuSeedFinanceDemo | Gieo demo tài chính | Demo |
| 🧪 Test DON_VI mapping | menuTestFinanceDonViMapping | Test mapping DON_VI | Phát triển |

---

### 8. 🧰 Schema Tools

| Mục | Handler | Mục đích | Khi nào dùng |
|-----|---------|----------|--------------|
| 📋 Dump tất cả Schema | menuDumpAllSheetSchemas | Liệt kê schema tất cả sheet | Debug schema |
| ⚠ Kiểm tra lệch Schema | menuAuditSchemaMismatch | Tìm lệch schema | Lỗi cột thiếu |
| 📋 Schema Profile đầy đủ | menuDumpFullSchemaProfile | Giống Dump Schema | — |

---

### 9. 🛠️ Repair Zone (Nguy hiểm)

| Mục | Handler | Mục đích | Khi nào dùng |
|-----|---------|----------|--------------|
| ⚠ Sửa toàn hệ thống | menuRepairWholeSystemSafely | repairSchemaAndData — schema + data | **Đã xác định nguyên nhân, đã backup** |
| ⚠ Sửa Schema | menuRepairSchemaSafely | Thêm cột thiếu | Thiếu cột |
| ⚠ Sửa Enum | menuRepairEnumSafely | Sửa enum thiếu/trùng | Lỗi enum |
| ⚠ Sửa Ref | menuRepairRefSafely | Chỉ hướng dẫn | Dùng Sửa toàn hệ thống |
| ⚠ Áp dụng Schema cuối | menuEnforceFinalSchemaSafely | Chuẩn hóa schema | Sau migrate |

**Lưu ý:** Luôn **backup** trước khi Repair. Chạy **Audit** sau Repair để xác nhận.

---

### 10. ⚙️ Dev / Admin

| Mục | Handler | Mục đích | Khi nào dùng |
|-----|---------|----------|--------------|
| 📄 Mở SYSTEM_HEALTH_LOG | menuOpenSystemHealthLog | Mở log | Xem log |
| 📄 Mở ADMIN_AUDIT_LOG | menuOpenAdminAuditLog | Mở audit log | Xem audit |
| 🔍 Báo cáo hàm thiếu | showMissingFunctionReport | Liệt kê Impl thiếu | Debug load |
| 🔗 Kiểm tra Menu | verifyMenuBindings | Kiểm tra binding menu | Debug menu |
| 📖 Hướng dẫn Admin | showDailyAdminGuide | Hướng dẫn | Nhắc quy trình |

---

## C. Hướng dẫn vận hành hàng ngày

### Buổi sáng (Morning Routine)

1. **Kiểm tra sức khỏe** — Daily Admin Flow → ✔ Kiểm tra sức khỏe  
   - Xem SYSTEM_HEALTH (PASS/WARN/FAIL), BOOTSTRAP_SAFE, APPSHEET_READY.
2. **Xác minh AppSheet** — Nếu dùng AppSheet  
   - Đảm bảo PASS hoặc WARN (không FAIL).
3. **Xem log** — Mở SYSTEM_HEALTH_LOG hoặc ADMIN_AUDIT_LOG  
   - Kiểm tra lỗi đêm trước (nếu có trigger).

**Ví dụ kết quả PASS:**
```
Sức khỏe hệ thống: PASS
BOOTSTRAP_SAFE: true
APPSHEET_READY: true
```

**Ví dụ kết quả WARN:**
```
Sức khỏe hệ thống: WARN
BOOTSTRAP_SAFE: true
APPSHEET_READY: true
Critical: 0, High: 0, Medium: 2, Low: 1
```

---

### Khi có cảnh báo (When Warning Appears)

1. **Vào Audit** — 🔎 Audit & Health → 🩺 Self Audit  
2. Xem `mustFixNow`, `warnings`, `top10Issues`.  
3. Nếu **WARN** — Xem chi tiết, sửa thủ công nếu cần.  
4. Nếu **FAIL** — Vào Repair Zone **chỉ khi** đã xác định nguyên nhân và đã backup.

**Nguyên tắc:** Audit trước → Xác định → Backup → Repair.

---

### Khi triển khai (When Deploying)

1. **Bootstrap** — 🏗️ Bootstrap & Init → ▶ Triển khai đầy đủ  
2. **Hoặc từng bước:** Đảm bảo schema → Gieo dữ liệu → Kiểm tra Enum/Ref/DON_VI → Chạy test.  
3. **Verify** — Xác minh AppSheet, kiểm tra báo cáo triển khai.

---

### Khi debug (When Debugging)

1. **Schema Tools** — Dump Schema, Kiểm tra lệch Schema.  
2. **Logs** — SYSTEM_HEALTH_LOG, ADMIN_AUDIT_LOG.  
3. **Audit** — Self Audit, Audit từng module (Task, Hồ sơ, Tài chính).

---

## D. Hành động An toàn vs Nguy hiểm

### ✅ AN TOÀN (Safe)

| Hành động | Lý do |
|-----------|-------|
| Kiểm tra sức khỏe | Chỉ đọc |
| Xác minh AppSheet | Chỉ đọc |
| Mở log | Chỉ đọc |
| Chạy Audit nhanh | Chỉ đọc |
| Self Audit, Kiểm tra Enum/Ref/DON_VI | Chỉ đọc |
| Chạy tất cả test | Chỉ đọc |
| Dump Schema | Chỉ đọc |
| Báo cáo hàm thiếu, Kiểm tra Menu | Chỉ đọc |

### ⚠️ NGUY HIỂM (Dangerous)

| Hành động | Rủi ro | Yêu cầu |
|-----------|--------|---------|
| Triển khai đầy đủ | Ghi schema, seed, log | Hiểu flow; môi trường đúng |
| Đảm bảo schema | Tạo sheet, thêm cột | — |
| Gieo dữ liệu | Insert data | Backup nếu có data quan trọng |
| Sửa toàn hệ thống | Sửa schema + data | **Backup**; đã xác định nguyên nhân |
| Sửa Schema | Thêm cột | Backup |
| Sửa Enum | Sửa enum | Backup |
| Áp dụng Schema cuối | Chuẩn hóa schema | Backup |

---

## E. Các tình huống thường gặp

### 1. Hệ thống lỗi (System Broken)

**Triệu chứng:** Audit FAIL, AppSheet không ready.

**Bước:**
1. Chạy Self Audit → xem `mustFixNow`.
2. Backup sheet quan trọng.
3. Repair Zone → Sửa toàn hệ thống (hoặc Sửa Schema / Sửa Enum tùy lỗi).
4. Chạy Self Audit lại → xác nhận PASS/WARN.

---

### 2. Setup môi trường mới (New Environment)

**Bước:**
1. Mở Google Sheet mới, copy Apps Script project.
2. Menu → Triển khai đầy đủ.
3. Nếu PASS → Xong. Nếu WARN/FAIL → xem report, sửa.
4. Cài Triggers nếu cần daily check.
5. Xác minh AppSheet.

---

### 3. Enum lệch (Enum Mismatch)

**Triệu chứng:** Kiểm tra Enum báo lỗi; bảng dùng enum không có trong ENUM_DICTIONARY.

**Bước:**
1. Audit & Health → Kiểm tra Enum (xem findings).
2. Sửa thủ công ENUM_DICTIONARY hoặc Repair Zone → Sửa Enum.
3. Chạy Kiểm tra Enum lại.

---

### 4. Ref hỏng (Ref Broken)

**Triệu chứng:** Kiểm tra Ref báo orphan, ref không tồn tại.

**Bước:**
1. Audit & Health → Kiểm tra Ref (xem findings).
2. Sửa thủ công dữ liệu ref hoặc Repair Zone → Sửa toàn hệ thống.
3. Chạy Kiểm tra Ref lại.

---

### 5. Thiếu dữ liệu (Missing Data)

**Triệu chứng:** DON_VI trống, USER_DIRECTORY trống, MASTER_CODE trống.

**Bước:**
1. Master Data → Gieo từng loại (DON_VI, USER_DIRECTORY, MASTER_CODE).
2. Hoặc Bootstrap & Init → Gieo tất cả dữ liệu.
3. Audit lại để xác nhận.

---

## F. DO / DON'T

### DO ✅

- Chạy Kiểm tra sức khỏe mỗi ngày.
- Audit trước khi Repair.
- Backup trước khi Repair.
- Xem log khi có lỗi.
- Dùng Triển khai đầy đủ cho môi trường mới.
- Kiểm tra báo cáo triển khai sau khi deploy.

### DON'T ❌

- **Không** Repair khi chưa xác định nguyên nhân.
- **Không** bỏ qua Audit trước Repair.
- **Không** dùng MASTER_CODE cho USER hay DON_VI (kiến trúc cũ hybrid).
- **Không** bind menu trực tiếp vào Impl (chỉ qua wrapper/menu*).
- **Không** thay đổi schema thủ công khi đã có repair tool — dùng Repair Zone.

---

## G. Kiến trúc Final (Non-Hybrid)

Menu tuân theo **Final Non-Hybrid Architecture**:

| Bảng | Vai trò | Ghi chú |
|------|---------|---------|
| USER_DIRECTORY | Bảng user duy nhất | Users global, không phụ thuộc HTX |
| DON_VI | Bảng tổ chức duy nhất | Không nằm trong MASTER_CODE |
| MASTER_CODE | Dữ liệu master tĩnh | TASK_TYPE, v.v. Không chứa USER/DON_VI |
| ENUM_DICTIONARY | Định nghĩa enum | — |

**Không dùng:** HTX-based user, MASTER_CODE làm USER/DON_VI, schema hybrid.
