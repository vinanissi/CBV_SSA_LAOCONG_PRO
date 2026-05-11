# RUNTIME_AND_TEST_CONSOLE_AUDIT.md

**Tiêu chí tham chiếu:** yêu cầu “🧪 CBV Test Console” tách khỏi menu nghiệp vụ; report contract đầy đủ; append-only; AI handoff; traceId; status GO / GO_WITH_WARNINGS / FAIL.

---

## 1. Menu test hiện có

| Menu / nhóm | Vị trí | Ghi chú |
|---------------|--------|---------|
| **CBV PRO** | `05_GAS_RUNTIME/90_BOOTSTRAP_MENU.js` | Nhánh Developer, Audit, Tasks, Repair — **trộn** vận hành + test. |
| **MAIN_CONTROL OBS** | `307_MC_OBS_MENU.js` | `🛡️ MAIN_CONTROL OBS` → con `🧪 Health`, `🧪 Self-Test`, smoke, schema — **tách phần lớn OBS** nhưng không phải tên “CBV Test Console”. |
| **CBV Core V2 / Level 6** | `95_*`, `140_*` | Test hardening / core. |
| **HO_SO V2** | `121_HO_SO_V2_MENU.js` | Test/smoke theo domain. |
| **Chạy Test Hệ Thống** | Mô tả trong `07_TEST/README.md` (menu **CBV_SSA**) | Phụ thuộc triển khai spreadsheet — **CHƯA_XÁC_MINH** trong mã đã grep toàn repo có chuỗi đó hay không. |

**Kết luận:** **Chưa** có menu top-level đúng tên **“🧪 CBV Test Console”** bắt buộc trong yêu cầu phân tích; test **chưa** tách hết khỏi menu nghiệp vụ (đặc biệt monolith CBV PRO).

---

## 2. Report sheet hiện có

- **MC_OBS:** nhiều sheet (test run, result, finding, audit sample, AI export, event trace, …) — writer `302_MC_OBS_WRITER.js`, schema `300_MC_OBS_SCHEMA.js`.
- **ADMIN_AUDIT_LOG / SYSTEM_HEALTH_LOG** — theo bootstrap monolith.
- **Không thấy** mỗi major domain (TASK, HO_SO, FINANCE) đều có **một** sheet report append-only riêng theo contract JSON thống nhất — chủ yếu tập trung **MAIN_CONTROL OBS**.

---

## 3. Tách Test Runtime khỏi Business Runtime

| Khía cạnh | Kết quả |
|-----------|---------|
| **Project clasp** | Đã tách theo **artifact** (main-control / hoso / task / finance / core-lib). |
| **Thực thi / spreadsheet** | Thường **cùng** spreadsheet hoặc cùng tenant — ranh giới vận hành phụ thuộc operator; **chưa** có policy repo-level bắt buộc “test spreadsheet riêng”. |
| **Code path** | OBS sample data **giới hạn** OBS sheets — tốt; vẫn có menu repair/bootstrap gần test. |

**Kết luận:** Tách **một phần** (OBS add-only); **chưa** tách hoàn toàn theo nghĩa vận hành + menu.

---

## 4. Append-only report

- **Có** cho MC_OBS (append row theo header map, thiết kế no-throw trong docs OBS).
- Domain TASK/HO_SO/FINANCE: audit append thông qua `ADMIN_AUDIT_LOG` / service — **không** đồng nhất với “report suite” JSON.

---

## 5. AI handoff prompt

- **Có:** package `00_SYSTEM_BRAIN/AI_HANDOFF_PACKAGE/`, export `305_MC_OBS_AI_EXPORT.js`.
- **Chưa:** dialog/prompt riêng **chuẩn hóa theo từng domain** (TASK vs HO_SO) ngoài pattern OBS/MC.

---

## 6. Envelope chuẩn

- `MC_Obs_stdResponse_` trong OBS (ok, code, message, data, errors) — **có** envelope nội bộ OBS.
- **Không** thấy `envelopeOk` / `contractVersion` **thống nhất** trên mọi runner và webhook response (webhook dùng trace biến cục bộ).

---

## 7. traceId

- **Có** trong monolith webhook/gateway: lấy từ `correlationId` | `requestId` | `traceId`.
- **MC_OBS test runner:** dùng `RUN_ID`, `CORRELATION_ID` trên một số payload — **không** đồng nhất tên `traceId` toàn hệ.

---

## 8. status GO / GO_WITH_WARNINGS / FAIL

- **MC_OBS:** STATUS kiểu OK/WARN trên hàng; self-test có đếm PASS/WARN/FAIL — **gần** nhưng **không** khớp bộ ba GO / GO_WITH_WARNINGS / FAIL theo contract đề xuất.
- **CBV_TEST_RUNNER (07_TEST):** assert pass/fail — không có envelope GO.

---

## 9. Nguy cơ test lẫn production

| Rủi ro | Mức |
|--------|-----|
| Cùng spreadsheet, menu repair + generate sample gần test | Trung bình — OBS sample có prefix TEST_ nhưng operator vẫn có thể nhầm sheet. |
| TASK clasp chưa bind — dev thử trên prod sheet | Cao nếu không quy trình. |
| Monolith menu “Repair zone” | Cao nếu user không phân quyền. |

---

## 10. Tổng kết audit layer

| Tiêu chí | Đạt? |
|-----------|------|
| Test Console JS riêng theo domain | **Một phần** |
| Report dialog / AI handoff riêng từng domain | **Một phần** (tập trung MC_OBS) |
| Report sheet append-only riêng từng domain | **Chưa** |
| Menu 🧪 CBV Test Console tách biệt | **Chưa** |
| Contract đầy đủ (traceId, envelopeOk, GO/…) | **Chưa** |

**Verdict layer:** **FAIL** so với checklist lý tưởng đầy đủ; **GO_WITH_WARNINGS** so với thực tế vận hành MAIN_CONTROL OBS (đã có nền tốt).
