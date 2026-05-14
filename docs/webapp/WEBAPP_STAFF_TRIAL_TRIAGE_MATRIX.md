# WebApp Staff Trial — Triage matrix (Severity × FEEDBACK_TYPE)

**Phase:** 97 — Staff Trial Execution / Feedback Capture  
**Runtime tham chiếu:** `CbvWebAppStaffTrial_getTriageMatrix()` trong `998J_WEBAPP_STAFF_TRIAL_RUNTIME.js`

**Nguyên tắc:** không tự động sửa lỗi; không tự động leo thang; quyết định GO / NO_GO do người; ma trận chỉ **gợi ý** hướng xử lý.

---

## 1. Ma trận tóm tắt (Severity × loại phản hồi)

| SEVERITY ↓ \ FEEDBACK_TYPE → | NAVIGATION | MOBILE_UI | COPY_CONFUSION | DATA_CONFUSION | PERFORMANCE | ACCESS | SAFETY | OTHER |
|------------------------------|-------------|-----------|----------------|-----------------|-------------|--------|--------|-------|
| **CRITICAL** | **→ NO_GO** (mặc định) | **→ NO_GO** nếu chặn thao tác | Hiếm; thường **GO_WITH_WARNINGS** nếu không chặn an toàn | Phân biệt data vs UX — có thể **NO_GO** nếu hiểu sai dữ liệu rủi ro | **GO_WITH_WARNINGS** / **NO_GO** nếu không dùng được | **→ NO_GO** | **→ NO_GO** | **NEEDS_MORE_TRIAL** |
| **HIGH** | **GO_WITH_WARNINGS** / **NO_GO** nếu nhiều người | Tương tự | **GO_WITH_WARNINGS** | **NEEDS_FIX** / thử lại | **GO_WITH_WARNINGS** | **NO_GO** nếu chặn truy cập | **NO_GO** | **NEEDS_MORE_TRIAL** |
| **MEDIUM** | **GO_WITH_WARNINGS** | **GO_WITH_WARNINGS** | **GO_WITH_WARNINGS** | **NEEDS_MORE_TRIAL** | **GO_WITH_WARNINGS** | **GO_WITH_WARNINGS** | **GO_WITH_WARNINGS** | **NEEDS_MORE_TRIAL** |
| **LOW** | **GO** / ghi backlog | **GO** / ghi backlog | **GO_WITH_WARNINGS** | **GO** / ghi backlog | **GO** | **GO** | **GO** nếu không sai sót an toàn | **GO** |

---

## 2. Quy tắc diễn giải (bắt buộc đọc)

1. **CRITICAL** kết hợp **NAVIGATION**, **ACCESS**, hoặc **SAFETY** → mặc định coi là **NO_GO** cho đến khi có mitigation đã xác minh (thủ công).
2. **HIGH** trên **MOBILE_UI** hoặc **NAVIGATION** ảnh hưởng **nhiều người** / nhiều thiết bị → nghiêng **NO_GO** hoặc **GO_WITH_WARNINGS** với waiver rõ ràng.
3. **COPY_CONFUSION** mức **LOW** / **MEDIUM** → thường **GO_WITH_WARNINGS** (sửa copy / tài liệu; không đụng business runtime).
4. **DATA_CONFUSION** → bắt buộc phân biệt: lỗi nguồn dữ liệu vs hiển thị UX; không kết luận tự động; có thể **NEEDS_MORE_TRIAL** hoặc **NEEDS_FIX**.
5. Không dùng ma trận để **tự động** gán trạng thái triage trên sheet (Phase 97 ưu tiên ghi nhận + review thủ công).

---

## 3. DECISION enum (cột `DECISION` trên sheet)

| Giá trị | Khi dùng (gợi ý) |
|---------|-------------------|
| `GO` | Pilot được chấp nhận chạy tiếp không waiver nặng. |
| `GO_WITH_WARNINGS` | Chấp nhận có điều kiện; có danh sách waiver. |
| `NO_GO` | Dừng mở rộng trial cho đến khi xử lý blocker. |
| `NEEDS_FIX` | Cần sửa kỹ thuật/copy trước khi trial tiếp. |
| `NEEDS_MORE_TRIAL` | Cần thêm phiên thử hoặc làm rõ yêu cầu. |

---

## 4. Liên kết

- Schema cột: `WEBAPP_UAT_FEEDBACK_SCHEMA.md`  
- Runbook: `WEBAPP_STAFF_TRIAL_RUNBOOK_VI.md`  
- AI handoff: `WEBAPP_PHASE_97_AI_HANDOFF.md`
