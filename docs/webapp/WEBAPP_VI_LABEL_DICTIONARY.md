# WebApp — Từ điển nhãn VI (key ↔ English ↔ Tiếng Việt)

**Nguồn máy:** `05_GAS_RUNTIME/998F_WEBAPP_VI_UX_COPY.js` — `CbvWebAppVi_getLabel(key)`, `CbvWebAppVi_getRouteLabel(route)`.  
**Ghi chú:** Đường dẫn route **không** dịch; cột `route/page` chỉ mô tả màn hình đích.

## Điều hướng (nav)

| key | English (tham chiếu) | Vietnamese | note | route/page |
|-----|----------------------|------------|------|--------------|
| nav_workspace | Workspace | Trang chủ | Shell nav | `/workspace` |
| nav_my_queue | My Queue | Việc của tôi | Shell nav | `/home-alert/my-queue` |
| nav_sla | SLA | SLA / Quá hạn | Shell nav | `/home-alert/sla` |
| nav_timeline | Timeline | Dòng thời gian | Shell nav | `/home-alert/timeline` |
| nav_kanban | Kanban | Bảng trạng thái | Shell nav | `/home-alert/kanban` |
| nav_runtime | Runtime | Sức khỏe hệ thống | Shell nav | `/runtime/health` |
| nav_reports | Reports | Báo cáo | Shell nav | `/reports` |
| nav_admin_ref | Admin Reference | Quản trị tham chiếu | Shell nav | `/admin/reference` |

## Tiêu đề trang (route → title)

| route | English (tham chiếu) | Vietnamese |
|-------|----------------------|------------|
| `/workspace` | Home Workspace (pilot) | Trang vận hành hôm nay |
| `/home-alert/my-queue` | HOME_ALERT — My Queue | Việc cần xử lý của tôi |
| `/home-alert/sla` | HOME_ALERT — SLA Dashboard | Theo dõi SLA / Quá hạn |
| `/home-alert/timeline` | HOME_ALERT — Timeline | Dòng thời gian xử lý |
| `/home-alert/kanban` | HOME_ALERT — Kanban | Bảng trạng thái xử lý |
| `/runtime/health` | Runtime — Health | Sức khỏe hệ thống |
| `/reports` | Reports | Báo cáo vận hành |
| `/admin/reference` | Admin Reference Viewer | Quản trị tham chiếu |

## Read-first & an toàn chung

| key | English | Vietnamese | note |
|-----|---------|------------|------|
| read_first_badge | READ_FIRST | READ_FIRST | Badge kỹ thuật; kèm `read_first_explain` làm title/tooltip |
| read_first_explain | Read-only | Chỉ xem / Không ghi dữ liệu | |
| read_first_dashboard_line | Read-first dashboard… | Màn hình chỉ xem để theo dõi vận hành, chưa cho thao tác ghi dữ liệu. | Trang chủ |
| no_auto_assign | No auto assign | Không tự động giao việc | Footer |
| no_auto_resolve | No auto resolve | Không tự động hoàn tất | Footer |
| no_auto_escalate | No auto escalate | Không tự động leo thang | Footer |
| no_production_claim | No production claim | Chưa xác nhận production | Footer |
| no_drag_drop_save | No drag-drop save | Không kéo-thả để lưu thay đổi | Timeline/Kanban |
| no_auto_heal | No auto-heal | Không tự động phục hồi (auto-heal) | Runtime/Reports |
| rules_footer_shell | (EN safety line) | Không tự động giao việc · … · Chưa xác nhận production | Shell fallback |

## Trường dữ liệu / thẻ (common)

| key | English | Vietnamese | route/page |
|-----|---------|------------|--------------|
| checked_at | checkedAt | Cập nhật lúc | Shell, reports |
| route_chip | route | Luồng | Shell |
| status | status | Trạng thái | Queue, cards |
| assigned_to | assignedTo | Phụ trách | Queue |
| unassigned | unassigned | Chưa giao | Home/SLA |
| breached | breached | Quá hạn | Home/SLA |
| escalated | escalated | Đã leo thang | Home |
| blocked | blocked | Đang bị chặn | Home |
| resolved_today | resolvedToday | Đã xử lý hôm nay | Home |
| open_my_queue | openMyQueue | Mở việc của tôi | Home |
| open_sla | openSla | Mở SLA | Home |

## Đầy đủ key trong runtime

Toàn bộ map `CBV_WEBAPP_VI_LABELS` và `CBV_WEBAPP_VI_ROUTE_PAGE_TITLE` nằm trong `998F_WEBAPP_VI_UX_COPY.js` (mở rộng dần theo phase; không xóa key cũ để tránh lệch manifest UI).
