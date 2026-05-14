# WebApp — Hướng nhanh quản trị (Admin)

**Độ dài:** ~1 trang · **Phase:** 96

## Liên kết (`WEBAPP_URL` chuẩn `/exec`)

Xem **`WEBAPP_LINKS_AND_ROUTES_VI.md`**.

| Màn hình | Route |
|----------|--------|
| Sức khỏe hệ thống (per-phase cards) | `?route=/runtime/health` |
| Báo cáo vận hành / test reports | `?route=/reports` |
| Quản trị tham chiếu (governance read-only) | `?route=/admin/reference` |
| Kiểm tra dispatcher | `?action=ping` |

## Việc cần làm

1. **Sức khỏe hệ thống:** đọc `overall`, severity, thẻ phase; xử lý cảnh báo theo quy trình Sheets/GAS (không bấm “heal” trong WebApp — không có).  
2. **Báo cáo:** xác nhận có/không dữ liệu `CBV_TEST_REPORTS`; đọc summary gần nhất.  
3. **Quản trị tham chiếu:** đối chiếu sheet có/không, enum, user/role (email đã ẩn), feature flag, route registry — **không** sửa từ WebApp.

## Cấm

- Không chỉnh sửa / xóa / bật tắt / đổi quyền từ WebApp.  
- Không dùng URL `googleusercontent.com` làm link tài liệu chính thức.
