# GAP_AND_NEXT_PHASE_PLAN.md

---

## 1. Bổ sung để repo “vận hành thật” end-to-end

- **Ràng buộc spreadsheet–script:** bảng checklist per-environment (dev/staging/prod scriptId + spreadsheetId) — lưu ngoài code hoặc CONFIG tracked.
- **TASK clasp T0:** `.clasp.json` thật, `clasp push` xanh, TASK_OBS bootstrap xong (theo `docs/TASK_MODULE_CURRENT_STATE_AND_ROADMAP.md`).
- **Đồng bộ test với schema PRO:** cập nhật `07_TEST/CBV_TEST_RUNNER.js` (cột `TASK_MAIN` gồm `SHARED_WITH`, `IS_PRIVATE`) và ma trận test liên quan.
- **Runbook operator một trang:** liên kết `OPERATOR_DEPLOY_AND_RUN_ORDER.md` + menu OBS + bước rollback.

---

## 2. Dọn trước production (không destructive — chỉ quy trình & tài liệu)

- **Drift monolith vs clasp:** quy ước “một nguồn sửa” hoặc nhãn folder mirror chỉ đọc.
- **Thu hẹp menu nguy hiểm:** Repair zone chỉ admin; ghi rõ trong SOP.
- **Xác minh** không còn secret trong remote URL (PAT) trên máy dev — ngoài phạm vi repo nhưng P0 vận hành.

---

## 3. Phase nên triển khai tiếp (theo thứ tự logic)

1. **T0 — TASK binding + OBS xanh** (đã có tài liệu — không nhảy phase).
2. **T1 — Test Console chuẩn:** menu `🧪 CBV Test Console` (add-only), gọi lại các runner hiện có.
3. **T2 — Report contract v1:** áp dụng cho MC_OBS + một domain (TASK) làm pilot.
4. **T3 — INVOICE_MEMBER** chỉ khi có baseline code vào repo (hiện chưa).

---

## 4. Ưu tiên P0 / P1 / P2

| Mức | Việc |
|-----|------|
| **P0** | Ngăn chạy clasp TASK trên spreadsheet production trước khi có checklist; xử lý PAT remote (môi trường dev). |
| **P0** | Đồng bộ kiểm thử TASK với cột PRO (`SHARED_WITH`, `IS_PRIVATE`). |
| **P1** | Hoàn thành T0 TASK theo roadmap. |
| **P1** | Menu Test Console tách khỏi CBV PRO (ít nhất thin-wrapper menu mới). |
| **P2** | Contract JSON đầy đủ (GO / GO_WITH_WARNINGS / FAIL, `traceId`, `envelopeOk`). |
| **P2** | Spreadsheet staging riêng cho Level-6 migration experiments. |

---

## 5. Việc Cursor có thể tự làm (add-only, không phá prod)

- Sinh menu `🧪 CBV Test Console` chỉ **delegate** tới hàm có sẵn (không đổi logic nghiệp vụ).
- Cập nhật `07_TEST/CBV_TEST_RUNNER.js` + tài liệu ma trận test để thêm cột manifest.
- Sinh template report JSON + hàm wrapper ghi một sheet `CBV_TEST_REPORT` append-only (file mới trong clasp hoặc doc-only prototype).
- Bổ sung `docs/` hoặc `00_SYSTEM_BRAIN` checklist nghiệm thu (user cho phép doc — đã yêu cầu report trong RUN folder only; các thay đổi ngoài RUN **không** làm trừ khi user yêu cầu — **kế hoạch này chỉ liệt kê khả năng**).

---

## 6. Việc cần bác / operator xác nhận

- ScriptId + spreadsheetId **chính thức** cho từng môi trường.
- Có hay không duy trì **monolith** `05_GAS_RUNTIME` làm deploy chính trong 6 tháng tới.
- Vị trí thực tế của **INVOICE_MEMBER** (repo ngoài hay tên khác).
- Ngưỡng chấp nhận **GO_WITH_WARNINGS** cho go-live HTX cụ thể.

---

## 7. Kết luận

Repo **đủ** để vận hành **theo mô hình monolith + AppSheet** đã quen; **chưa đủ** để coi là “observability + test enterprise” đầy đủ theo checklist phân tích. Bước tiếp theo an toàn nhất: **T0 TASK** + **sửa drift test/schema**.
