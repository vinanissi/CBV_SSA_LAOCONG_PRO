# WebApp — Checklist UAT cho bản copy tiếng Việt (Phase 96)

**Mục đích:** trước staff trial, xác nhận nhãn tiếng Việt không gây hiểu nhầm so với pilot read-only.

Đánh dấu [ ] khi hoàn thành từng mục.

## Nhãn và điều hướng

- [ ] Nhãn điều hướng 8 mục đọc được, nghĩa rõ (Trang chủ, Việc của tôi, SLA/Quá hạn, …).  
- [ ] Không còn nhãn tiếng Anh **chính** gây nhầm (Workspace, My Queue, …) trên shell pilot — trừ badge kỹ thuật `READ_FIRST` nếu vẫn hiển thị (phải có `title`/giải thích tiếng Việt).  
- [ ] Tiêu đề trang (page title) khớp `WEBAPP_VI_LABEL_DICTIONARY.md` / `CbvWebAppVi_getRouteLabel`.

## An toàn (footer)

- [ ] Footer tiếng Việt hiển thị đủ ý: không tự động giao việc · không tự động hoàn tất · không tự động leo thang · chưa xác nhận production.  
- [ ] Timeline + Kanban: thêm dòng **không kéo-thả để lưu thay đổi**.  
- [ ] Runtime health + Reports: có cảnh báo **không auto-heal** (tiếng Việt).  
- [ ] Admin Reference: có thêm dòng quản trị chỉ xem (theo `admin_safety_extra`).

## Thẻ và trạng thái

- [ ] Thẻ việc đọc được trên mobile (không tràn ngang nghiêm trọng).  
- [ ] Các nhãn: Trạng thái, Phụ trách, Chưa giao, Quá hạn, … dễ hiểu.  
- [ ] Không gợi ý nút ghi / mutation (không có nút Save/Assign/Resolve giả).

## Route và liên kết

- [ ] Mọi tài liệu nội bộ dùng URL **`/exec`** chuẩn; không dùng `googleusercontent.com` làm link chính.  
- [ ] Deep link `?route=` đúng 8 route freeze.

## Hiểu nhầm nghiệp vụ

- [ ] Nhân sự được briefing: WebApp = **chỉ xem**; thao tác nghiệp vụ = **AppSheet**.  
- [ ] Không có câu chữ “production ready” / “auto assign” mang nghĩa **khuyến nghị** bật tính năng (chỉ được dùng trong cảnh báo cấm).

---

**Kết quả:** GO / GO_WITH_WARNINGS / NO_GO — ghi vào biên bản trial theo `WEBAPP_PILOT_SIGNOFF_TEMPLATE.md`.
