# Workboard UI Plan — Operational Workboard FE

**Phase:** PHASE_RF_01_MODULAR_OPERATIONAL_WORKSPACE_BASELINE  
**Branch:** `phase/from-v2.4.1-TASK-FIN-runtime-freeze`

---

## 1. Triết lý FE

| Nguyên tắc | Ý nghĩa vận hành |
|------------|------------------|
| **Mobile-first** | Nhân sự dùng điện thoại ngoài hiện trường; layout một cột ưu tiên |
| **Action-first** | Mỗi màn hình có 1–2 hành động chính rõ ràng; ít chữ giải thích |
| **One-hand operation** | Nút lớn, thumb zone; bottom nav cho điều hướng chính |
| **Dễ đào tạo** | Thuật ngữ tiếng Việt nghiệp vụ; không jargon kỹ thuật |
| **Không overload** | Không dashboard 20 widget; không menu sâu 4 cấp |
| **Permission-gated UI** | Không có quyền → không hiện action (ẩn, không disable mơ hồ) |

Tham chiếu UX hiện có: `docs/webapp/WEBAPP_UI_FOUNDATION_STANDARD.md`, `998F_WEBAPP_VI_UX_COPY.js`, Milestone 06 workboard.

---

## 2. Layout tổng thể

```
┌──────────────────────────────┐
│ Header                       │
│ Search / Notification / User │
├──────────────┬───────────────┤
│ Sidebar      │ Main Content  │
│ (desktop)    │               │
│              │ Workboard     │
│ Trang chủ    │ Timeline      │
│ Công việc    │ Actions       │
│ Hồ sơ        │ Detail        │
│ Tài chính    │               │
│ Thông báo    │               │
└──────────────┴───────────────┘

Mobile: Sidebar → bottom nav (5 tab)
Desktop: Sidebar cố định + main scroll
```

### 2.1 Header (persistent)

| Thành phần | Hành vi |
|------------|---------|
| Logo / tên HTX | Tap → Trang chủ |
| Search icon | Mở ô tìm kiếm toàn cục |
| Notification bell | Badge số; tap → Thông báo |
| User avatar | Role label; logout / profile (read-only) |

### 2.2 Navigation

| Tab / Sidebar | Route (concept) | Icon + label VI |
|---------------|-----------------|-------------------|
| Trang chủ | `/workspace` | 🏠 Trang chủ |
| Công việc | `/workspace/workboard` | 📋 Công việc |
| Hồ sơ | `/workspace/hoso` | 📁 Hồ sơ |
| Tài chính | `/workspace/finance` | 💰 Tài chính |
| Thông báo | `/workspace/notifications` | 🔔 Thông báo |

Tìm kiếm: overlay toàn màn hoặc `/workspace/search?q=`.

---

## 3. Trang chính — mô tả màn hình

### 3.1 Trang chủ

**Mục đích:** Snapshot hôm nay — việc cần làm ngay.

| Block | Nội dung |
|-------|----------|
| Chào + vai trò | "Xin chào, [Tên] — [Vai trò]" |
| Quick stats | Số việc quá hạn, chờ duyệt, thông báo mới (tap → drill-down) |
| Quick actions | Tạo task, Tạo hồ sơ, Upload giấy tờ (theo quyền) |
| Việc ưu tiên | Top 3–5 task cards |
| Link AppSheet | "Mở AppSheet" nếu cấu hình (fallback mobile CRUD) |

**Empty state:** "Hôm nay không có việc gấp" + nút "Tạo việc mới".

### 3.2 Công việc (Workboard)

**Mục đích:** Queue vận hành hằng ngày.

| Nhóm (group) | Mô tả |
|--------------|-------|
| Việc của tôi | OWNER_ID / ASSIGNED = current user |
| Việc chờ xử lý | NEW, ASSIGNED chưa nhận |
| Việc quá hạn | Due date < today, chưa DONE |
| Việc chờ duyệt | WAITING + approval flag |

Mỗi card: tiêu đề, trạng thái badge, ưu tiên, due date, 1 primary action.

Tap card → Task detail (timeline + actions).

**Filter bar:** trạng thái, ưu tiên, quá hạn, nhân sự (MANAGER+).

**Empty state:** "Không có việc trong nhóm này" + gợi ý chuyển tab.

### 3.3 Hồ sơ

**Mục đích:** Tra cứu và xử lý hồ sơ xã viên / xe / giấy tờ.

| View | Nội dung |
|------|----------|
| Danh sách | Filter: loại hồ sơ, trạng thái, người phụ trách |
| Detail | Thông tin chính, file list, expiry warnings |
| Related | Task và finance liên quan |

**Quick actions:** Tạo hồ sơ, Upload giấy tờ (CCCD/GPLX/đăng kiểm).

**Empty state:** "Chưa có hồ sơ — tạo mới hoặc tìm kiếm".

### 3.4 Tài chính

**Mục đích:** Theo dõi thu/chi và chứng từ.

| Queue | Nội dung |
|-------|----------|
| Khoản cần thu | Draft/pending receivable |
| Khoản cần chi | Draft/pending payable |
| Chứng từ thiếu | Missing evidence |
| Chờ xác nhận | Awaiting FINANCE/ADMIN confirm |

**Quick actions:** Xác nhận thu chi, Đính kèm chứng từ.

Role FINANCE thấy đầy đủ; STAFF chỉ thấy liên quan mình.

### 3.5 Thông báo

**Mục đích:** Notification center tập trung.

| Loại cảnh báo | Nguồn |
|---------------|-------|
| Task quá hạn | HOME_ALERT / SLA |
| Task bị trả lại | Status transition |
| Thiếu hồ sơ | HO_SO expiry / missing file |
| Khoản chưa xử lý | Finance queue |

Mỗi item: icon, title, thời gian, tap → deep link module.

**Empty state:** "Không có thông báo mới".

### 3.6 Tìm kiếm

**Mục đích:** Operational search một ô.

| Input | Gợi ý placeholder |
|-------|-------------------|
| Query | "Tên, SĐT, biển số, mã hồ sơ, mã việc…" |

Kết quả phân nhóm: Task · Hồ sơ · Tài chính · File.

Tap result → detail tương ứng.

---

## 4. Task Detail (sub-page)

| Section | Nội dung |
|---------|----------|
| Header | Title, status, priority, assignee |
| Timeline | Append-only: ai làm, lúc nào, sửa gì, upload gì |
| Actions | Giao việc, chuyển xử lý, gửi duyệt, hoàn thành (theo quyền) |
| Files | Preview PDF/ảnh; Drive link |
| Related | HO_SO / Finance link |

AppSheet deep link (nếu cấu hình): "Sửa trên AppSheet" — không bắt buộc.

---

## 5. Quick Actions (global)

| Action | Quyền tối thiểu | Module |
|--------|-----------------|--------|
| Tạo task | STAFF | TASK |
| Tạo hồ sơ | HO_SO, STAFF* | HO_SO |
| Upload giấy tờ | STAFF | FILE |
| Gửi duyệt | STAFF (owner) | TASK |
| Xác nhận thu chi | FINANCE | FINANCE |
| Giao việc | MANAGER | TASK |

*STAFF: chỉ hồ sơ thuộc phạm vi được giao.

FAB hoặc header "+" trên mobile; sidebar quick panel trên desktop.

---

## 6. State patterns

### 6.1 Loading

- Skeleton cards (3 rows) thay vì spinner toàn màn
- Label: "Đang tải…" — không hiện stack trace

### 6.2 Empty

- Illustration đơn giản (optional)
- 1 câu tiếng Việt rõ ràng
- 1 CTA chính (nếu có quyền)

### 6.3 Error

| Loại | UX |
|------|-----|
| Network | "Không kết nối được — thử lại" + nút Retry |
| Permission | "Bạn không có quyền xem nội dung này" — không leak data |
| Not found | "Không tìm thấy — có thể đã bị xóa hoặc bạn không có quyền" |
| Server | "Hệ thống đang bận — liên hệ quản trị nếu lặp lại" |

Không hiện mã lỗi kỹ thuật cho nhân sự vận hành.

---

## 7. UX cho nhân sự không rành kỹ thuật

1. **Thuật ngữ nghiệp vụ** — "Việc", "Hồ sơ", "Thu/chi", không "DTO", "API", "sync".
2. **Màu trạng thái cố định** — đỏ quá hạn, vàng chờ, xanh xong (theo UI contract).
3. **Xác nhận trước hành động quan trọng** — xác nhận thu chi, hủy task.
4. **Không auto** — mọi chuyển trạng thái cần tap rõ ràng.
5. **Training mode** — tooltip ngắn lần đầu (optional, tắt được).
6. **AppSheet fallback** — link rõ khi thao tác phức tạp hơn trên mobile native.

---

## 8. Phase RF_01 scope

Tài liệu UI plan only. Implementation theo **Mốc 1 Workboard Core** trong `ROADMAP.md`.

Trang đã có code (workboard MVP) là baseline; các trang HO_SO/Tài chính/Search unified là **planned**.
