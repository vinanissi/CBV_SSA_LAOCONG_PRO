# WebApp — Liên kết chính thức và route (tiếng Việt)

**Phase:** 96 — Vietnamese UX  
**Chuẩn:** CBV Operational Ecosystem V1 · WebApp read-first (Phase 94 freeze)

## URL WebApp chính thức (luôn dùng bản `/exec`)

```
https://script.google.com/a/macros/htxdientu.com/s/AKfycbxJNx9Vw6NBRmSZx0ds7-sNAeyGo6VKTfO8PUDpcz8e7kq1o3W0eUWRP78zPfRlKXBUPA/exec
```

Gọi là **`WEBAPP_URL`** trong các tài liệu dưới đây.

### Cảnh báo — không dùng URL `googleusercontent.com`

Sau khi mở WebApp, trình duyệt có thể chuyển sang URL dạng `script.googleusercontent.com/macros/.../userCodeAppPanel`. **Đó không phải link chia sẻ chính thức.** Khi gửi cho nhân sự, hướng dẫn training, hoặc ghi vào tài liệu vận hành, luôn dùng URL `/exec` ở trên (kèm `?route=` nếu cần deep link).

## Bảng route (đường dẫn không đổi — Phase 94)

| Mục đích (VI) | `?route=` | Vai trò chủ yếu |
|---------------|-----------|-----------------|
| Trang chủ | `WEBAPP_URL?route=/workspace` | Operator, Supervisor, Admin |
| Việc của tôi | `WEBAPP_URL?route=/home-alert/my-queue` | Operator |
| SLA / Quá hạn | `WEBAPP_URL?route=/home-alert/sla` | Supervisor, Operator (đọc) |
| Dòng thời gian | `WEBAPP_URL?route=/home-alert/timeline` | Supervisor |
| Bảng trạng thái | `WEBAPP_URL?route=/home-alert/kanban` | Supervisor |
| Sức khỏe hệ thống | `WEBAPP_URL?route=/runtime/health` | Admin |
| Báo cáo vận hành | `WEBAPP_URL?route=/reports` | Admin |
| Quản trị tham chiếu | `WEBAPP_URL?route=/admin/reference` | Admin |

**Hỗ trợ:** `WEBAPP_URL?action=ping` — kiểm tra nhanh dispatcher (read-only).

## An toàn (mọi route vận hành)

Footer tiếng Việt (ý chính): không tự động giao việc · không tự động hoàn tất · không tự động leo thang · chưa xác nhận production.  
Dòng thời gian và Bảng trạng thái thêm: **không kéo-thả để lưu thay đổi.**  
Sức khỏe hệ thống và Báo cáo thêm cảnh báo **không tự động phục hồi (auto-heal)**.

## Runtime GAS

Dictionary và link máy: `05_GAS_RUNTIME/998F_WEBAPP_VI_UX_COPY.js` — `CbvWebAppVi_getWebAppLinks()`.
