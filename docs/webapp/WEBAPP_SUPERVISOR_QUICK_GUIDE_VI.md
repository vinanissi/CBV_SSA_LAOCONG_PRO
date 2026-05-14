# WebApp — Hướng nhanh giám sát (Supervisor)

**Độ dài:** ~1 trang · **Phase:** 96

## Liên kết (`WEBAPP_URL` = bản `/exec`)

Chi tiết: **`WEBAPP_LINKS_AND_ROUTES_VI.md`**.

| Việc cần làm | Route |
|--------------|--------|
| Theo dõi SLA / quá hạn | `?route=/home-alert/sla` |
| Phân bổ theo trạng thái (Kanban chỉ xem) | `?route=/home-alert/kanban` |
| Diễn biến theo thời gian | `?route=/home-alert/timeline` |
| Tổng quan đầu ca | `?route=/workspace` |
| Báo cáo kiểm thử / health (nếu được cấp) | `?route=/reports` |

## Cách dùng ngắn

1. Vào **SLA / Quá hạn** để lọc việc trễ, mức độ cảnh báo.  
2. Vào **Bảng trạng thái** để thấy nhóm theo `STATUS` — chú ý việc **chưa giao**, **quá hạn**, **bị chặn** (nhãn trên thẻ + màu).  
3. Vào **Dòng thời gian** khi cần hiểu trình tự cập nhật gần đây.  
4. Dùng **Báo cáo** để đối chiếu kết quả Test Console / health log (read-only).

## Giới hạn pilot

- **Không** tự giao việc / tự hoàn tất / tự leo thang từ WebApp.  
- **Không** kéo-thả thẻ Kanban để lưu — không có writeback.
