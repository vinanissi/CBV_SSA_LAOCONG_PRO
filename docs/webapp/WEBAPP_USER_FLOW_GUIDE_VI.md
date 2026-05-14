# WebApp — Hướng dẫn luồng sử dụng (tiếng Việt)

**Phase:** 96 · **Repo:** `CBV_SSA_LAOCONG_PRO` · **Route contract:** Phase 94 (đường dẫn tiếng Anh, nhãn UI tiếng Việt)

Liên kết nhanh: **`WEBAPP_LINKS_AND_ROUTES_VI.md`**

---

## 1. Luồng nhân viên vận hành (Operator)

1. Mở **Trang chủ** (`/workspace`) — xem tổng quan việc trong ngày.  
2. Vào **Việc của tôi** (`/home-alert/my-queue`) — đọc thẻ việc, trạng thái, phụ trách.  
3. Nếu cần theo dõi mức quá hạn tổng thể: mở **SLA / Quá hạn** (`/home-alert/sla`) — chỉ xem.  
4. Nếu cần bối cảnh thời gian: mở **Dòng thời gian** (`/home-alert/timeline`) — chỉ xem.  
5. **Không** nhầm WebApp với màn hình thao tác: pilot **chỉ xem**; cập nhật dữ liệu vẫn qua **AppSheet** (hoặc quy trình hiện hành).  
6. Ghi phản hồi nếu thấy khó hiểu (schema: `WEBAPP_UAT_FEEDBACK_SCHEMA.md`).

---

## 2. Luồng giám sát (Supervisor)

1. Mở **SLA / Quá hạn** (`/home-alert/sla`).  
2. Mở **Bảng trạng thái** (`/home-alert/kanban`).  
3. Kiểm tra việc **quá hạn**, **chưa giao**, **bị chặn** (nhãn + màu, không chỉ màu).  
4. Mở **Dòng thời gian** (`/home-alert/timeline`) để hiểu diễn biến.  
5. Dùng **Báo cáo** (`/reports`) nếu cần đối chiếu kết quả test / health (read-only).  
6. **Không** kỳ vọng WebApp tự giao việc / tự xử lý / tự leo thang.

---

## 3. Luồng quản trị (Admin)

1. Mở **Sức khỏe hệ thống** (`/runtime/health`).  
2. Mở **Báo cáo vận hành** (`/reports`).  
3. Mở **Quản trị tham chiếu** (`/admin/reference`).  
4. Kiểm tra cảnh báo, dữ liệu thiếu, báo cáo lỗi; bí mật phải luôn ở dạng ẩn.  
5. **Không** sửa trực tiếp từ WebApp — chỉnh cấu hình theo quy trình Sheets/GAS đã ban hành.  
6. Ghi nhận lỗi vào **UAT feedback** khi cần.

---

## 4. Nguyên tắc dùng chung

| Lớp | Vai trò |
|-----|--------|
| **WebApp** | Màn hình theo dõi và điều phối (read-first pilot). |
| **AppSheet** | Shell thao tác nhẹ / mobile cho nghiệp vụ hàng ngày. |
| **Google Sheets + GAS** | Runtime và nguồn dữ liệu. |

Khi **chưa có phase mutation**, không thực hiện thao tác ghi từ WebApp.

---

## Tài liệu liên quan

- `WEBAPP_OPERATOR_QUICK_GUIDE_VI.md` · `WEBAPP_SUPERVISOR_QUICK_GUIDE_VI.md` · `WEBAPP_ADMIN_QUICK_GUIDE_VI.md`  
- `WEBAPP_VI_LABEL_DICTIONARY.md` · `WEBAPP_UAT_VIETNAMESE_COPY_CHECKLIST.md`  
- `PHASE_96_WEBAPP_VIETNAMESE_UX_REFACTOR_USER_FLOW_GUIDE.md`
