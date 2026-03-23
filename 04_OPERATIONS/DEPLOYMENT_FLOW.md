# CBV PRO Deployment Flow

## A. Triết lý triển khai (Deployment Philosophy)

### Nguyên tắc

| Nguyên tắc | Mô tả |
|------------|-------|
| **Idempotent** | Chạy nhiều lần cho cùng kết quả. Không tạo trùng sheet/cột/trigger. |
| **Safe** | Chỉ thêm, không xóa. Append-only cho log. |
| **Repeatable** | Có thể chạy lại bất kỳ lúc nào. |
| **Non-destructive** | Không ghi đè dữ liệu hiện có; chỉ thêm thiếu. |

### Kiến trúc áp dụng

- **USER_DIRECTORY** — Bảng user duy nhất.
- **DON_VI** — Bảng tổ chức duy nhất.
- **MASTER_CODE** — Dữ liệu master tĩnh (TASK_TYPE, …).
- **ENUM_DICTIONARY** — Định nghĩa enum.

**Không dùng:** Schema hybrid, MASTER_CODE làm USER/DON_VI, HTX-based user.

---

## B. Luồng triển khai một chạm (One-Click Deployment)

### Hàm chính

```
runFullDeployment()  → wrapper
runFullDeploymentImpl(options)  → logic
```

**Gọi từ menu:** 🏗️ Bootstrap & Init → ▶ Triển khai đầy đủ

### Options

| Option | Mặc định | Mô tả |
|--------|----------|-------|
| skipSeed | false | Bỏ qua gieo dữ liệu |
| skipTests | false | Bỏ qua chạy test |
| dryRun | false | true = không ghi report vào ADMIN_AUDIT_LOG |

---

### Từng bước thực thi

| Bước | Hàm | Mô tả |
|------|-----|-------|
| 1 | ensureAllSchemasImpl | Tạo sheet thiếu, thêm cột thiếu. Không xóa. |
| 2 | seedAllDataImpl | Gieo DON_VI, USER_DIRECTORY, ENUM_DICTIONARY, MASTER_CODE. Chỉ insert thiếu. |
| 3 | validateAllEnumsImpl | Kiểm tra ENUM_DICTIONARY và usage. Đếm HIGH/MEDIUM findings. |
| 4 | validateAllRefsImpl | Kiểm tra foreign key. Đếm HIGH/MEDIUM findings. |
| 5 | validateDonViHierarchyImpl | Kiểm tra DON_VI hierarchy (no cycle, ≥1 root). Đếm findings. |
| 6 | runAllSystemTestsImpl | Chạy regression test. Schema, seed, enum, ref, DON_VI, workflow, field policy, AppSheet, migration. |
| 7 | (Determine verdict) | HIGH > 0 → FAIL; MEDIUM > 0 hoặc warnings → WARNING; else PASS. |
| 8 | generateDeploymentReportImpl | Ghi report vào ADMIN_AUDIT_LOG (trừ khi dryRun). |

---

### Ví dụ output

**PASS:**
```json
{
  "ok": true,
  "verdict": "PASS",
  "report": {
    "runId": "DEP_xxx",
    "verdict": "PASS",
    "summary": {
      "high": 0,
      "medium": 0,
      "verdict": "PASS",
      "schemaOk": true,
      "seedOk": true,
      "enumOk": true,
      "refOk": true,
      "hierarchyOk": true,
      "testsOk": true
    },
    "mustFix": []
  },
  "mustFix": []
}
```

**WARNING:**
```json
{
  "ok": false,
  "verdict": "WARNING",
  "report": {
    "verdict": "WARNING",
    "summary": {
      "high": 0,
      "medium": 2,
      "enumOk": true,
      "refOk": true,
      ...
    },
    "warnings": ["Seed: Some seeds failed"]
  },
  "mustFix": []
}
```

**FAIL:**
```json
{
  "ok": false,
  "verdict": "FAIL",
  "report": {
    "verdict": "FAIL",
    "summary": {
      "high": 3,
      "medium": 1,
      ...
    },
    "mustFix": [
      "TASK_MAIN: Missing required enum TASK_STATUS",
      "DON_VI: Orphan DON_VI_ID in row 5"
    ]
  },
  "mustFix": ["...", "..."]
}
```

---

## C. Trạng thái triển khai (Deployment States)

### PASS

| Ý nghĩa | Hành động |
|---------|-----------|
| Tất cả bước OK, không có HIGH, không MEDIUM | **Sẵn sàng production.** Có thể dùng AppSheet, chạy trigger. |

**Ví dụ message:** `Deployment: PASS`

---

### WARNING

| Ý nghĩa | Hành động |
|---------|-----------|
| Có MEDIUM hoặc warnings; không có HIGH | **Dùng được** nhưng nên xem chi tiết. Sửa MEDIUM nếu có thể. |

**Ví dụ message:** `Deployment: WARNING — Cần xem: 2 MEDIUM, 1 warning`

**Hành động gợi ý:**
1. Xem `report.warnings`, `report.summary`.
2. Chạy Audit tương ứng (Enum, Ref, DON_VI).
3. Sửa thủ công hoặc Repair nếu cần.
4. Chạy lại triển khai để xác nhận PASS.

---

### FAIL

| Ý nghĩa | Hành động |
|---------|-----------|
| Có ít nhất 1 HIGH finding | **Không sẵn sàng.** Phải sửa `mustFix` trước khi dùng production. |

**Ví dụ message:** `Deployment: FAIL — Cần sửa: 3`

**Hành động bắt buộc:**
1. Đọc `mustFix` — danh sách lỗi cần sửa.
2. Chạy Self Audit → xem chi tiết findings.
3. Sửa: thủ công hoặc Repair Zone (schema, enum, ref).
4. Chạy lại triển khai cho đến khi PASS hoặc WARNING chấp nhận được.

---

## D. Checklist triển khai an toàn (Safe Deployment Checklist)

### Trước (Before)

| Kiểm tra | Cách kiểm tra |
|----------|---------------|
| Schema sẵn sàng | Có sheet USER_DIRECTORY, DON_VI, MASTER_CODE, ENUM_DICTIONARY, TASK_MAIN, … |
| Enum sẵn sàng | ENUM_DICTIONARY có đủ group/value |
| Seed sẵn sàng | Có thể gieo DON_VI, MASTER_CODE; USER_DIRECTORY tùy hệ thống |
| Backup | Copy sheet quan trọng nếu môi trường production |

**Ví dụ:** Chạy `selfAuditBootstrap` trước. Nếu FAIL → sửa trước khi triển khai đầy đủ.

---

### Trong (During)

| Hành động | Ghi chú |
|-----------|---------|
| Chạy triển khai | Menu → Triển khai đầy đủ |
| Theo dõi | Xem popup kết quả |
| Nếu lỗi | Đừng chạy Repair ngay; ghi lại mustFix, phân tích trước |

---

### Sau (After)

| Kiểm tra | Hành động |
|----------|-----------|
| Xem report | ADMIN_AUDIT_LOG — dòng mới DEPLOYMENT_RUN |
| Xác minh AppSheet | Menu → Xác minh AppSheet |
| Chạy Audit | Self Audit → xác nhận PASS/WARN |
| Test | Chạy tất cả test (nếu chưa chạy trong deployment) |

---

## E. Chiến lược Rollback (nếu cần)

CBV deployment **không xóa dữ liệu**; nên rollback chủ yếu là **hoàn tác thay đổi thủ công** hoặc **khôi phục từ backup**.

### Khi nào cần rollback

- Deployment ghi sai dữ liệu (hiếm — logic chỉ append/insert thiếu).
- Schema bị sửa sai bởi Repair.
- Cần khôi phục từ backup trước deployment.

### Cách rollback

| Tình huống | Cách làm |
|------------|----------|
| Lỗi schema (thêm cột sai) | Xóa cột thủ công; hoặc restore sheet từ backup |
| Lỗi seed (insert sai) | Xóa hàng thừa thủ công; hoặc restore sheet |
| Lỗi nghiêm trọng | Restore toàn bộ spreadsheet từ backup (File → Version history) |

**Lưu ý:** Không có lệnh "rollback deployment" tự động. Luôn **backup** trước khi triển khai lần đầu lên môi trường mới.

---

## F. Vận hành liên tục (Continuous Operation)

### Hàng ngày (Daily)

| Hành động | Cách thực hiện |
|-----------|----------------|
| Kiểm tra sức khỏe | Daily Admin Flow → Kiểm tra sức khỏe |
| Xem log | Mở SYSTEM_HEALTH_LOG, ADMIN_AUDIT_LOG |
| Trigger | Nếu có `dailyHealthCheck` trigger → chạy tự động mỗi ngày |

---

### Hàng tuần (Weekly)

| Hành động | Cách thực hiện |
|-----------|----------------|
| Self Audit đầy đủ | Audit & Health → Self Audit |
| Kiểm tra Enum/Ref/DON_VI | Audit & Health → Kiểm tra từng loại |
| Chạy test | Audit & Health → Chạy tất cả test |

---

### Hàng tháng (Monthly)

| Hành động | Cách thực hiện |
|-----------|----------------|
| Xem ADMIN_AUDIT_LOG | Đảm bảo không có FAIL lặp lại |
| Dọn log (nếu cần) | Archive hoặc xóa bớt dòng cũ trong SYSTEM_HEALTH_LOG |
| Review schema | Schema Tools → Dump Schema; so sánh với spec |

---

## G. Ví dụ kịch bản thực tế

### Kịch bản 1: Môi trường mới — lần đầu triển khai

```
1. Tạo Google Sheet mới
2. Copy/import Apps Script project (clasp, copy)
3. Menu → Triển khai đầy đủ
4. Nếu PASS → Cài Triggers, Xác minh AppSheet
5. Nếu FAIL → Xem mustFix, sửa (thường là thiếu sheet/seed), chạy lại
```

---

### Kịch bản 2: Thêm cột mới vào TASK_MAIN

```
1. Cập nhật schema trong code (98_schema_manager, 90_BOOTSTRAP_*)
2. Deploy code (clasp push)
3. Menu → Đảm bảo schema (hoặc Triển khai đầy đủ)
4. Kiểm tra Schema → xác nhận cột mới
```

---

### Kịch bản 3: Enum mới — thêm vào ENUM_DICTIONARY

```
1. Sửa 01_ENUM_SEED hoặc seed thủ công
2. Menu → Gieo ENUM_DICTIONARY (hoặc Triển khai đầy đủ với seed)
3. Kiểm tra Enum → xác nhận
```

---

### Kịch bản 4: Deployment FAIL — có mustFix

```
Ví dụ mustFix:
- "TASK_MAIN.DON_VI_ID: Orphan reference row 3"
- "ENUM_DICTIONARY: Missing group TASK_STATUS"

Bước:
1. Self Audit → xem findings chi tiết
2. Sửa: điền DON_VI_ID đúng; thêm enum TASK_STATUS
3. Hoặc Repair Zone → Sửa toàn hệ thống (đã backup)
4. Chạy lại Triển khai đầy đủ
```

---

## H. DO / DON'T

### DO ✅

- Chạy triển khai đầy đủ cho môi trường mới.
- Backup trước khi deploy lên production.
- Xem report sau mỗi lần triển khai.
- Sửa mustFix trước khi coi là xong.
- Dùng dryRun nếu muốn test mà không ghi log.

### DON'T ❌

- **Không** bỏ qua FAIL — phải sửa.
- **Không** dùng Repair khi chưa hiểu nguyên nhân.
- **Không** xóa sheet/column thủ công nếu đã có tool chuẩn.
- **Không** nhầm kiến trúc cũ (hybrid, MASTER_CODE = DON_VI).
