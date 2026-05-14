# WebApp — Hướng nhanh nhân viên vận hành (Operator)

**Độ dài:** 1 trang · **Phase:** 96

## URL và luồng chính

Xem **`WEBAPP_LINKS_AND_ROUTES_VI.md`** để lấy `WEBAPP_URL` chính thức (`/exec`).

1. Mở **Trang chủ:** `?route=/workspace` — tổng quan trong ngày.  
2. Mở **Việc của tôi:** `?route=/home-alert/my-queue` — đọc thẻ việc, trạng thái, phụ trách.  
3. Nếu cần xem quá hạn ở mức dashboard: **SLA / Quá hạn** — `?route=/home-alert/sla` (chỉ xem).  
4. Nếu cần bối cảnh thời gian: **Dòng thời gian** — `?route=/home-alert/timeline` (chỉ xem).

## Nên làm

- Đọc footer an toàn tiếng Việt trước khi lan truyền link nội bộ.  
- Mọi **ghi dữ liệu** (nhận việc, đổi trạng thái, hoàn tất…) thực hiện trên **AppSheet** (hoặc quy trình hiện hành), không qua WebApp pilot.  
- Ghi phản hồi khó hiểu theo `WEBAPP_UAT_FEEDBACK_SCHEMA.md`.

## Không nên

- Không kỳ vọng nút **Lưu / Giao / Hoàn tất / Leo thang** trên WebApp — pilot **chỉ xem**.  
- Không chia sẻ URL `googleusercontent.com` làm link chính thức.
