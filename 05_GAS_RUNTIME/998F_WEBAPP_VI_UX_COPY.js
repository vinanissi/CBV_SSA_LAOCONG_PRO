/**
 * PHASE_96 — WebApp Vietnamese UX copy (read-first localization layer)
 *
 * Centralized UI strings for internal operators. Route paths are NOT translated.
 * No mutation. No write actions. No production claim.
 *
 * Phase 96.1 — nav and doc links use CbvWebAppRouteUrl_build (998H) for absolute ?route= URLs.
 */

var CBV_WEBAPP_VI_PHASE_ID = 'PHASE_96_WEBAPP_VIETNAMESE_UX_REFACTOR_USER_FLOW_GUIDE';
var CBV_WEBAPP_VI_CONTRACT_VERSION = 'CBV_TCS_V1';

/** Canonical WebApp URL (/exec). Runtime: prefer CbvWebAppRouteUrl_getBaseUrl() when 998H is loaded. */
var CBV_WEBAPP_VI_CANONICAL_EXEC_URL =
  'https://script.google.com/macros/s/AKfycbxJNx9Vw6NBRmSZx0ds7-sNAeyGo6VKTfO8PUDpcz8e7kq1o3W0eUWRP78zPfRlKXBUPA/exec';

var CBV_WEBAPP_VI_LABELS = {
  nav_workspace: 'Trang chủ',
  nav_my_queue: 'Việc của tôi',
  nav_sla: 'SLA / Quá hạn',
  nav_timeline: 'Dòng thời gian',
  nav_kanban: 'Bảng trạng thái',
  nav_runtime: 'Sức khỏe hệ thống',
  nav_reports: 'Báo cáo',
  nav_admin_ref: 'Quản trị tham chiếu',
  nav_role_home: 'Theo vai trò',
  nav_today_ops: 'Hôm nay',
  nav_guided: 'Hướng dẫn',
  nav_staff_tasks: 'Việc NV',
  nav_daily: 'Daily',
  nav_focus: 'Focus',
  nav_sop: 'SOP dẫn bước',
  nav_workboard: 'Báo việc',
  nav_staff_feedback: 'Phản hồi',
  read_first_badge: 'READ_FIRST',
  read_first_explain: 'Chỉ xem / Không ghi dữ liệu',
  read_only_short: 'Chỉ đọc',
  read_first_dashboard_line: 'Màn hình chỉ xem để theo dõi vận hành, chưa cho thao tác ghi dữ liệu.',
  no_auto_assign: 'Không tự động giao việc',
  no_auto_resolve: 'Không tự động hoàn tất',
  no_auto_escalate: 'Không tự động leo thang',
  no_production_claim: 'Chưa xác nhận production',
  no_drag_drop_save: 'Không kéo-thả để lưu thay đổi',
  no_auto_heal: 'Không tự động phục hồi (auto-heal)',
  checked_at: 'Cập nhật lúc',
  route_chip: 'Luồng',
  status: 'Trạng thái',
  assigned_to: 'Phụ trách',
  unassigned: 'Chưa giao',
  breached: 'Quá hạn',
  escalated: 'Đã leo thang',
  blocked: 'Đang bị chặn',
  resolved_today: 'Đã xử lý hôm nay',
  open_my_queue: 'Mở việc của tôi',
  open_sla: 'Mở SLA',
  warnings_title: 'Cảnh báo',
  warning_badge: 'CẢNH BÁO',
  not_found_title: 'Không tìm thấy',
  not_found_body: 'Luồng không hợp lệ.',
  data_not_available: 'Không tải được dữ liệu (chỉ xem).',
  no_items: 'Không có mục nào.',
  no_rows: 'Không có dòng dữ liệu.',
  empty_check_warnings: 'Trống (hoặc thiếu sheet). Xem phần cảnh báo.',
  next_badge: 'Tiếp theo',
  user_label: 'Người dùng',
  count_label: 'Số lượng',
  updated_label: 'Cập nhật',
  timeline_link: 'Dòng thời gian',
  kanban_link: 'Bảng trạng thái',
  runtime_link: 'Sức khỏe hệ thống',
  appsheet_primary: 'AppSheet là kênh thao tác chính ban đầu',
  counts_by_sla: 'Đếm theo SLA_STATUS',
  counts_by_breach: 'Đếm theo mức quá hạn',
  breached_top: 'Quá hạn (một phần)',
  no_breached: 'Không có mục quá hạn (hoặc thiếu cột).',
  resolved_count: 'Đã xử lý (đếm)',
  home_pilot_title: 'Trang vận hành hôm nay',
  queue_pilot_title: 'Việc cần xử lý của tôi',
  queue_subtitle: 'Thẻ chỉ xem. Không có nút nhận/hoàn tất/leo thang.',
  sla_pilot_title: 'Theo dõi SLA / Quá hạn',
  sla_subtitle: 'Widget chỉ xem. Không tự động hoàn tất/leo thang.',
  home_dashboard_state: 'Bảng điều khiển trang chủ',
  my_queue_state: 'Việc của tôi',
  sla_state: 'SLA',
  timeline_page_title: 'Dòng thời gian xử lý',
  kanban_page_title: 'Bảng trạng thái xử lý',
  runtime_health_title: 'Sức khỏe hệ thống',
  reports_title: 'Báo cáo vận hành',
  admin_ref_title: 'Quản trị tham chiếu',
  timeline_read_first_h3: 'Dòng thời gian (chỉ xem)',
  timeline_sort_hint: 'Sắp xếp: UPDATED_AT giảm dần · Không chỉnh sửa / không nút ghi.',
  kanban_read_first_h3: 'Bảng trạng thái (chỉ xem)',
  kanban_group_hint: 'Nhóm theo trạng thái · Thẻ chỉ xem · Không kéo-thả để lưu.',
  runtime_health_h3: 'Sức khỏe hệ thống (chỉ xem)',
  runtime_health_sub: 'Lớp quan sát vận hành · Không tự động phục hồi.',
  reports_h3: 'Báo cáo vận hành (chỉ xem)',
  governance_h3: 'Tổng quan quản trị',
  when_label: 'Thời điểm',
  severity_label: 'Mức độ',
  run_by_label: 'Người chạy',
  trace_label: 'Trace',
  last_label: 'Lần cuối',
  source_label: 'Nguồn',
  overall_label: 'Tổng thể',
  rows_label: 'Số dòng',
  present: 'CÓ',
  missing: 'THIẾU',
  read_first_governance: 'Quản trị chỉ xem.',
  admin_safety_extra: 'Không chỉnh sửa · Không bật/tắt · Không xóa · Không bật/tắt feature flag · Không đổi quyền · Ẩn bí mật · Chưa xác nhận production',
  showing_partial: 'Đang hiển thị dữ liệu chỉ xem kèm cảnh báo.',
  placeholder_timeline: 'Dòng thời gian (xem trước)',
  placeholder_kanban: 'Bảng trạng thái (xem trước)',
  placeholder_runtime: 'Sức khỏe hệ thống (placeholder)',
  placeholder_reports: 'Báo cáo (placeholder)',
  placeholder_admin: 'Quản trị tham chiếu (placeholder)',
  phase91_not_loaded: 'Renderer Phase 91 chưa tải.',
  phase92_not_loaded: 'Renderer Phase 92 chưa tải.',
  phase93_not_loaded: 'Renderer Phase 93 chưa tải.',
  read_first_preview: 'Chỉ xem trước. Không ghi dữ liệu.',
  fallback_renderer_failed: 'Renderer lỗi; hiển thị fallback chỉ xem.',
  no_mutations: 'Không có thao tác ghi.',
  no_delete_edit_report: 'Không xóa / không sửa báo cáo.',
  rules_footer_shell: 'Không tự động giao việc · Không tự động hoàn tất · Không tự động leo thang · Chưa xác nhận production',
  phase_health_cards_h3: 'Thẻ sức khỏe theo phase',
  route_summary_h3: 'Tóm tắt luồng (route)',
  report_summary_h3: 'Tóm tắt báo cáo',
  test_console_summary_h3: 'Tóm tắt Test Console',
  tc_loaded: 'đã tải',
  tc_with_report: 'có báo cáo lưu',
  no_phase_cards: 'Chưa có thẻ phase.',
  route_registry_missing_em: 'thiếu registry route',
  total_short: 'Tổng',
  read_first_short: 'chỉ xem',
  by_mode_short: 'theo mode',
  by_page_type_short: 'theo pageType',
  in_memory_short: 'bộ nhớ',
  report_viewer_sources: 'Nguồn: CBV_TEST_REPORTS (sheet, nếu có) · SYSTEM_HEALTH_LOG · PropertiesService (bộ nhớ) · Chỉ đọc.',
  no_reports_visible: 'Chưa thấy báo cáo. Chạy Test Console theo phase để sinh dữ liệu, hoặc đợi sheet CBV_TEST_REPORTS xuất hiện.',
  cbv_test_reports_missing_em: 'Thiếu CBV_TEST_REPORTS (chỉ cảnh báo)',
  governance_summary_h3: 'Tổng quan quản trị (governance)',
  admin_ref_viewer_h3: 'Trình xem tham chiếu quản trị (chỉ xem)',
  admin_ref_viewer_sub: 'Lớp quản trị vận hành · tóm tắt sheet + thống kê · Không sửa / không bật-tắt / không xóa · Ẩn bí mật.',
  enum_dictionary_h3: 'Từ điển Enum',
  users_roles_teams_h3: 'Người dùng / Vai trò / Đội nhóm',
  feature_flags_h3: 'Cờ tính năng',
  system_registry_h3: 'Đăng ký hệ thống',
  ui_contract_registry_h3: 'Đăng ký UI Contract',
  route_registry_h3: 'Đăng ký route',
  sample_label: 'Mẫu',
  rows_short: 'dòng',
  perms_short: 'quyền',
  owner_short: 'owner',
  modules_short: 'module',
  enabled_short: 'BẬT',
  disabled_short: 'TẮT',
  no_enum_rows: 'Không thấy dòng enum. Kiểm tra cảnh báo.',
  no_feature_flag_rows: 'Không thấy dòng feature flag.',
  no_system_registry_rows: 'Không thấy dòng system registry.',
  ui_contract_unavailable: 'Không tải được đăng ký UI contract.',
  route_registry_unavailable: 'Không tải được đăng ký route.',
  emails_masked_note: 'email đã ẩn',
  no_toggle_buttons_note: 'không có nút bật/tắt',
  users_sample_masked_h4: 'Người dùng (mẫu, đã ẩn)',
  roles_h4: 'Vai trò',
  name_field_short: 'tên',
  role_field_short: 'vai trò',
  team_field_short: 'đội',
  status_field_short: 'trạng thái',
  pilot_ready_badge: 'SẴN SÀNG PILOT',
  pending_badge: 'CHỜ',
  yes_short: 'có',
  no_short: 'không',
  page_type_short: 'pageType',
  role_required_short: 'vai trò yêu cầu',
  pilot_ready_short: 'pilot-ready',
  webapp_short: 'webApp',
  appsheet_short: 'appSheet',
  channel_short: 'kênh',
  type_short: 'loại',
  total_active_enums: 'tổng enum đang hoạt động',
  groups_short: 'nhóm',
  ff_enabled: 'đang bật',
  ff_disabled: 'đang tắt',
  users_count_short: 'người dùng',
  teams_count_short: 'đội',
  roles_count_short: 'vai trò',
  staff_task_title: 'Việc nhân viên',
  staff_task_detail_title: 'Chi tiết việc',
  staff_feedback_title: 'Phản hồi vận hành',
  staff_empty_state: 'Chưa có việc trong queue',
  staff_next_action: 'Bước tiếp',
  staff_quick_action: 'Thao tác nhanh',
  staff_sla: 'SLA',
  staff_priority: 'Ưu tiên',
  staff_blocked: 'Bị chặn',
  staff_pending: 'Đang xử lý',
  staff_feedback_stuck: 'Báo kẹt',
  staff_feedback_help: 'Cần hỗ trợ',
  staff_read_first_note: 'READ_FIRST — WebApp chỉ xem; ghi dữ liệu trên AppSheet theo quy trình.'
};

/** Primary staff/ops nav (Milestone 03 — no duplicate of secondary strip). */
var CBV_WEBAPP_VI_NAV_PRIMARY_PAIRS = [
  { route: '/workspace', key: 'nav_workspace' },
  { route: '/workspace/workboard', key: 'nav_workboard' },
  { route: '/workspace/daily', key: 'nav_daily' },
  { route: '/workspace/focus', key: 'nav_focus' },
  { route: '/workspace/staff/tasks', key: 'nav_staff_tasks' },
  { route: '/workspace/today', key: 'nav_today_ops' },
  { route: '/workspace/staff/feedback', key: 'nav_staff_feedback' }
];

/** Secondary quick links (admin/ops tools — distinct from primary). */
var CBV_WEBAPP_VI_NAV_SECONDARY_PAIRS = [
  { route: '/workspace/role-home', key: 'nav_role_home' },
  { route: '/workspace/guided', key: 'nav_guided' },
  { route: '/workspace/sop', key: 'nav_sop' },
  { route: '/home-alert/my-queue', key: 'nav_my_queue' },
  { route: '/home-alert/sla', key: 'nav_sla' },
  { route: '/home-alert/timeline', key: 'nav_timeline' },
  { route: '/home-alert/kanban', key: 'nav_kanban' },
  { route: '/runtime/health', key: 'nav_runtime' },
  { route: '/reports', key: 'nav_reports' },
  { route: '/admin/reference', key: 'nav_admin_ref' }
];

/** Single source for nav count + VI checks (Milestone 03 — primary + secondary). */
var CBV_WEBAPP_VI_NAV_PAIRS = CBV_WEBAPP_VI_NAV_PRIMARY_PAIRS.concat(CBV_WEBAPP_VI_NAV_SECONDARY_PAIRS);

var CBV_WEBAPP_VI_ROUTE_PAGE_TITLE = {
  '/workspace': 'Trang vận hành hôm nay',
  '/workspace/daily': 'Daily — Cần làm ngay',
  '/daily': 'Daily — Cần làm ngay',
  '/workspace/focus': 'Focus — Xử lý 1 task',
  '/focus': 'Focus — Xử lý 1 task',
  '/workspace/execution/task': 'Workspace — Thực thi task',
  '/execution/task': 'Thực thi task',
  '/workspace/role-home': 'Workspace — Theo vai trò',
  '/workspace/today': 'Workspace — Tổng quan hôm nay',
  '/workspace/workboard': 'Workspace — Báo việc',
  '/workboard': 'Báo việc',
  '/workspace/task-runtime': 'Workspace — Xử lý việc (runtime)',
  '/workspace/guided': 'Workspace — Hướng dẫn',
  '/workspace/sop': 'Workspace — SOP dẫn bước',
  '/sop': 'SOP dẫn bước',
  '/workspace/staff/tasks': 'Workspace — Việc nhân viên',
  '/staff/tasks': 'Nhân viên — Việc cần làm',
  '/workspace/staff/task-detail': 'Workspace — Chi tiết việc',
  '/staff/task-detail': 'Nhân viên — Chi tiết việc',
  '/workspace/staff/feedback': 'Workspace — Phản hồi',
  '/staff/feedback': 'Nhân viên — Phản hồi',
  '/home-alert/my-queue': 'Việc cần xử lý của tôi',
  '/home-alert/sla': 'Theo dõi SLA / Quá hạn',
  '/home-alert/timeline': 'Dòng thời gian xử lý',
  '/home-alert/kanban': 'Bảng trạng thái xử lý',
  '/runtime/health': 'Sức khỏe hệ thống',
  '/reports': 'Báo cáo vận hành',
  '/admin/reference': 'Quản trị tham chiếu'
};

function CbvWebAppVi_getLabel(key) {
  var k = String(key || '').trim();
  return CBV_WEBAPP_VI_LABELS[k] || '';
}

function CbvWebAppVi_getRouteLabel(route) {
  var r = String(route || '').trim();
  if (!r) return '';
  if (r.charAt(0) !== '/') r = '/' + r;
  return CBV_WEBAPP_VI_ROUTE_PAGE_TITLE[r] || r;
}

function CbvWebAppVi_getNavItems() {
  var pairs = CBV_WEBAPP_VI_NAV_PAIRS;
  var out = [];
  for (var i = 0; i < pairs.length; i++) {
    var p = pairs[i];
    var href = p.route;
    if (typeof CbvWebAppRouteUrl_build === 'function') {
      try {
        href = CbvWebAppRouteUrl_build(p.route);
      } catch (eB) {
        href = p.route;
      }
    }
    out.push({ href: href, label: CbvWebAppVi_getLabel(p.key), route: p.route });
  }
  return out;
}

function CbvWebAppVi__navBtn_(route, label, activeRoute, extraClass) {
  var href = route;
  if (typeof CbvWebAppRouteUrl_build === 'function') {
    try {
      href = CbvWebAppRouteUrl_build(route);
    } catch (eB) {
      href = route;
    }
  }
  var ar = String(activeRoute || '');
  var active = ar === route ? ' cbv-action-active' : '';
  var x = String(extraClass || '').trim();
  var dr = String(route || '').replace(/"/g, '&quot;');
  return '<a class="cbv-btn-operational cbv-busy-link' + active + (x ? ' ' + x : '') + '" data-route="' + dr + '" href="' +
    String(href).replace(/"/g, '&quot;') + '">' + String(label).replace(/</g, '&lt;') + '</a>';
}

function CbvWebAppVi_buildPrimaryNavHtml_(activeRoute) {
  var out = '<nav class="cbv-primary-nav cbv-nav-no-duplicate" aria-label="Primary navigation"><div class="cbv-global-action-bar cbv-mobile-stack" style="display:flex;flex-wrap:wrap;gap:10px;align-items:stretch">';
  for (var i = 0; i < CBV_WEBAPP_VI_NAV_PRIMARY_PAIRS.length; i++) {
    var p = CBV_WEBAPP_VI_NAV_PRIMARY_PAIRS[i];
    var lbl = CbvWebAppVi_getLabel(p.key);
    var extra = p.route === '/workspace/daily' ? 'cbv-staff-default-daily' : '';
    out += CbvWebAppVi__navBtn_(p.route, lbl || p.route, activeRoute, extra);
  }
  out += '</div></nav>';
  return out;
}

function CbvWebAppVi_buildSecondaryNavHtml_(activeRoute) {
  var out = '<div class="cbv-secondary-quick-links cbv-nav-no-duplicate" aria-label="Secondary quick links">' +
    '<div class="cbv-muted" style="font-size:12px;margin-bottom:6px">Liên kết phụ (không trùng menu chính)</div>' +
    '<div style="display:flex;flex-wrap:wrap;gap:8px">';
  for (var j = 0; j < CBV_WEBAPP_VI_NAV_SECONDARY_PAIRS.length; j++) {
    var q = CBV_WEBAPP_VI_NAV_SECONDARY_PAIRS[j];
    var href = q.route;
    if (typeof CbvWebAppRouteUrl_build === 'function') {
      try {
        href = CbvWebAppRouteUrl_build(q.route);
      } catch (e2) {
        href = q.route;
      }
    }
    var ar = String(activeRoute || '');
    var act = ar === q.route ? ' cbv-action-active' : '';
    var drQ = String(q.route || '').replace(/"/g, '&quot;');
    out += '<a class="cbv-link' + act + '" data-route="' + drQ + '" href="' + String(href).replace(/"/g, '&quot;') + '">' +
      String(CbvWebAppVi_getLabel(q.key) || q.route).replace(/</g, '&lt;') + '</a>';
  }
  out += '</div></div>';
  return out;
}

/**
 * Plain-text safety line for footers (Vietnamese). Timeline/Kanban append drag-drop rule.
 */
function CbvWebAppVi_getSafetyFooter(route) {
  var rt = String(route || '').trim();
  var parts = [
    CbvWebAppVi_getLabel('no_auto_assign'),
    CbvWebAppVi_getLabel('no_auto_resolve'),
    CbvWebAppVi_getLabel('no_auto_escalate'),
    CbvWebAppVi_getLabel('no_production_claim')
  ];
  if (rt === '/home-alert/timeline' || rt === '/home-alert/kanban') {
    parts.push(CbvWebAppVi_getLabel('no_drag_drop_save'));
  }
  if (rt === '/runtime/health' || rt === '/reports') {
    parts.push(CbvWebAppVi_getLabel('no_auto_heal'));
  }
  return parts.join(' · ');
}

/**
 * HTML fragment (inner) for standard safety card on operational routes.
 */
function CbvWebAppVi_getSafetyFooterHtml(route) {
  var line = CbvWebAppVi_getSafetyFooter(route);
  return '<div class="cbv-muted">Chỉ xem. An toàn: ' + line + '</div>';
}

function CbvWebAppVi_getShellI18n_() {
  return {
    routeChip: CbvWebAppVi_getLabel('route_chip'),
    checkedAt: CbvWebAppVi_getLabel('checked_at'),
    readFirstBadge: CbvWebAppVi_getLabel('read_first_badge'),
    readFirstTitle: CbvWebAppVi_getLabel('read_first_explain'),
    warningsBadge: CbvWebAppVi_getLabel('warning_badge'),
    rulesLine: CbvWebAppVi_getLabel('rules_footer_shell'),
    notFoundTitle: CbvWebAppVi_getLabel('not_found_title'),
    notFoundBody: CbvWebAppVi_getLabel('not_found_body')
  };
}

function CbvWebAppVi_getPilotPageI18n_(page) {
  var p = String(page || '').toLowerCase();
  var L = {};
  if (p === 'home') {
    L.pageTitle = CbvWebAppVi_getLabel('home_pilot_title');
    L.subtitle = CbvWebAppVi_getLabel('read_first_dashboard_line');
    L.cardMyQueue = CbvWebAppVi_getLabel('nav_my_queue');
    L.cardUnassigned = CbvWebAppVi_getLabel('unassigned');
    L.cardBreached = CbvWebAppVi_getLabel('breached');
    L.cardEscalated = CbvWebAppVi_getLabel('escalated');
    L.cardBlocked = CbvWebAppVi_getLabel('blocked');
    L.cardResolvedToday = CbvWebAppVi_getLabel('resolved_today');
    L.openMyQueue = CbvWebAppVi_getLabel('open_my_queue');
    L.openSla = CbvWebAppVi_getLabel('open_sla');
    L.linkTimeline = CbvWebAppVi_getLabel('timeline_link');
    L.linkKanban = CbvWebAppVi_getLabel('kanban_link');
    L.linkRuntime = CbvWebAppVi_getLabel('runtime_link');
    L.appsheetNote = CbvWebAppVi_getLabel('appsheet_primary');
    L.warningsTitle = CbvWebAppVi_getLabel('warnings_title');
  } else if (p === 'queue') {
    L.pageTitle = CbvWebAppVi_getLabel('queue_pilot_title');
    L.subtitle = CbvWebAppVi_getLabel('queue_subtitle');
    L.userLabel = CbvWebAppVi_getLabel('user_label');
    L.countLabel = CbvWebAppVi_getLabel('count_label');
    L.statusLabel = CbvWebAppVi_getLabel('status');
    L.nextBadge = CbvWebAppVi_getLabel('next_badge');
    L.updatedLabel = CbvWebAppVi_getLabel('updated_label');
    L.emptyHint = CbvWebAppVi_getLabel('empty_check_warnings');
    L.warningsTitle = CbvWebAppVi_getLabel('warnings_title');
  } else if (p === 'sla') {
    L.pageTitle = CbvWebAppVi_getLabel('sla_pilot_title');
    L.subtitle = CbvWebAppVi_getLabel('sla_subtitle');
    L.countsBySla = CbvWebAppVi_getLabel('counts_by_sla');
    L.countsByBreach = CbvWebAppVi_getLabel('counts_by_breach');
    L.breachedTop = CbvWebAppVi_getLabel('breached_top');
    L.noBreached = CbvWebAppVi_getLabel('no_breached');
    L.resolvedCount = CbvWebAppVi_getLabel('resolved_count');
    L.warningsTitle = CbvWebAppVi_getLabel('warnings_title');
  }
  return L;
}

function CbvWebAppVi_getWebAppLinks() {
  var base = (typeof CbvWebAppRouteUrl_getBaseUrl === 'function') ? CbvWebAppRouteUrl_getBaseUrl() : CBV_WEBAPP_VI_CANONICAL_EXEC_URL;
  function h(route) {
    if (typeof CbvWebAppRouteUrl_build === 'function') {
      try {
        return CbvWebAppRouteUrl_build(route);
      } catch (e1) { /* fall through */ }
    }
    return base + '?route=' + encodeURIComponent(route);
  }
  var routes = [
    { route: '/workspace', purpose: 'Trang vận hành tổng quan', owner: 'WebApp', href: h('/workspace') },
    { route: '/workspace/today', purpose: 'Tổng quan hôm nay (ưu tiên / SLA)', owner: 'WebApp', href: h('/workspace/today') },
    { route: '/workspace/workboard', purpose: 'Báo việc nhân viên (Mốc 06)', owner: 'WebApp', href: h('/workspace/workboard') },
    { route: '/workboard', purpose: 'Alias báo việc', owner: 'WebApp', href: h('/workboard') },
    { route: '/workspace/task-runtime', purpose: 'Runtime tương tác việc (Mốc 09)', owner: 'WebApp', href: h('/workspace/task-runtime') },
    { route: '/workspace/daily', purpose: 'Daily — cần làm ngay (task-first)', owner: 'WebApp', href: h('/workspace/daily') },
    { route: '/daily', purpose: 'Alias Daily (cùng màn hình /workspace/daily)', owner: 'WebApp', href: h('/daily') },
    { route: '/workspace/focus', purpose: 'Focus — xử lý tập trung 1 task (Mốc 04)', owner: 'WebApp', href: h('/workspace/focus') },
    { route: '/focus', purpose: 'Alias Focus', owner: 'WebApp', href: h('/focus') },
    { route: '/workspace/execution/task', purpose: 'Cockpit thực thi (alias task-detail + ?taskId=)', owner: 'WebApp', href: h('/workspace/execution/task') },
    { route: '/execution/task', purpose: 'Alias cockpit thực thi', owner: 'WebApp', href: h('/execution/task') },
    { route: '/workspace/role-home', purpose: 'Trang chủ theo vai trò', owner: 'WebApp', href: h('/workspace/role-home') },
    { route: '/workspace/guided', purpose: 'SOP inline / bước tiếp theo', owner: 'WebApp', href: h('/workspace/guided') },
    { route: '/home-alert/my-queue', purpose: 'Danh sách việc cá nhân', owner: 'WebApp + AppSheet', href: h('/home-alert/my-queue') },
    { route: '/home-alert/sla', purpose: 'Theo dõi SLA / quá hạn', owner: 'WebApp', href: h('/home-alert/sla') },
    { route: '/home-alert/timeline', purpose: 'Diễn biến theo thời gian', owner: 'WebApp', href: h('/home-alert/timeline') },
    { route: '/home-alert/kanban', purpose: 'Phân bổ theo trạng thái', owner: 'WebApp', href: h('/home-alert/kanban') },
    { route: '/runtime/health', purpose: 'Sức khỏe runtime & test console', owner: 'WebApp (ADMIN)', href: h('/runtime/health') },
    { route: '/reports', purpose: 'Xem báo cáo kiểm thử', owner: 'WebApp (ADMIN)', href: h('/reports') },
    { route: '/admin/reference', purpose: 'Tham chiếu cấu hình & quản trị', owner: 'WebApp (ADMIN)', href: h('/admin/reference') }
  ];
  return {
    canonicalExecUrl: base,
    routes: routes,
    pingUrl: base + '?action=ping',
    note: 'Không dùng URL googleusercontent.com làm link chính thức — luôn dùng URL /exec + ?route= (encodeURIComponent) từ 998H.'
  };
}

function CbvWebAppVi_getUserFlowGuide(role) {
  var r = String(role || '').trim().toLowerCase();
  if (r === 'operator') {
    return {
      role: 'operator',
      title: 'Luồng nhân viên vận hành',
      steps: [
        'Mở Trang chủ để xem tổng quan việc trong ngày.',
        'Vào Việc của tôi để đọc thẻ việc và trạng thái.',
        'Nếu cần theo dõi quá hạn, mở SLA / Quá hạn (chỉ xem).',
        'Nếu cần bối cảnh thời gian, mở Dòng thời gian (chỉ xem).',
        'WebApp hiện chỉ xem — mọi cập nhật dữ liệu vẫn qua AppSheet / quy trình hiện hành.',
        'Ghi phản hồi nếu thấy khó hiểu (theo WEBAPP_UAT_FEEDBACK_SCHEMA).'
      ]
    };
  }
  if (r === 'supervisor') {
    return {
      role: 'supervisor',
      title: 'Luồng giám sát',
      steps: [
        'Mở SLA / Quá hạn để theo dõi việc trễ và mức độ.',
        'Mở Bảng trạng thái để xem phân bổ theo STATUS.',
        'Kiểm tra việc quá hạn, việc chưa giao, việc bị chặn (chỉ xem).',
        'Mở Dòng thời gian để hiểu diễn biến gần đây.',
        'Dùng Báo cáo để xem kết quả test / health (nếu được cấp quyền).',
        'Không kỳ vọng WebApp tự giao việc / tự hoàn tất / tự leo thang.'
      ]
    };
  }
  if (r === 'admin') {
    return {
      role: 'admin',
      title: 'Luồng quản trị',
      steps: [
        'Mở Sức khỏe hệ thống để xem trạng thái runtime và cảnh báo.',
        'Mở Báo cáo vận hành để đọc báo cáo kiểm thử gần nhất.',
        'Mở Quản trị tham chiếu để đối chiếu cấu hình (dữ liệu nhạy cảm đã được ẩn).',
        'Không sửa trực tiếp từ WebApp — mọi chỉnh sửa theo quy trình Sheets/GAS riêng.',
        'Ghi nhận lỗi / cảnh báo vào UAT feedback khi cần.'
      ]
    };
  }
  return { role: 'all', title: 'Tổng quan', steps: ['Xem docs/webapp/WEBAPP_USER_FLOW_GUIDE_VI.md để biết chi tiết từng vai trò.'] };
}

function CbvWebAppVi__out_(ok, data, warnings, errors) {
  return {
    ok: ok === true,
    data: data || null,
    warnings: warnings || [],
    errors: errors || [],
    checkedAt: (typeof CbvWebAppWorkspace__now_ === 'function') ? CbvWebAppWorkspace__now_() : new Date()
  };
}

function CbvWebAppVi_validate() {
  var warnings = [];
  var errors = [];
  var detail = {
    labelKeyNames: Object.keys(CBV_WEBAPP_VI_LABELS),
    routeKeyNames: Object.keys(CBV_WEBAPP_VI_ROUTE_PAGE_TITLE),
    labelKeysCount: Object.keys(CBV_WEBAPP_VI_LABELS).length,
    routeKeysCount: Object.keys(CBV_WEBAPP_VI_ROUTE_PAGE_TITLE).length,
    canonicalOk: false,
    noMutationExposed: true,
    mutationProbe: [],
    mutationAllowlist: [],
    missingRoutes: [],
    missingLabels: [],
    navExpectedCount: CBV_WEBAPP_VI_NAV_PAIRS.length,
    navActualCount: 0
  };

  var canonRef = (typeof CbvWebAppRouteUrl_getBaseUrl === 'function') ? CbvWebAppRouteUrl_getBaseUrl() : CBV_WEBAPP_VI_CANONICAL_EXEC_URL;
  if (canonRef.indexOf('googleusercontent.com') >= 0) {
    errors.push('Canonical WebApp URL must not use googleusercontent.com');
  } else {
    detail.canonicalOk = true;
  }
  if (canonRef.indexOf('/exec') < 0) {
    warnings.push('Canonical URL should normally end with /exec');
  }
  if (canonRef.indexOf('https://script.google.com/macros/s/') !== 0) {
    warnings.push('Canonical URL should start with https://script.google.com/macros/s/ (Phase 96.1)');
  }

  var frozen = [
    '/workspace',
    '/workspace/daily',
    '/daily',
    '/workspace/focus',
    '/focus',
    '/workspace/execution/task',
    '/execution/task',
    '/workspace/role-home',
    '/workspace/today',
    '/workspace/workboard',
    '/workboard',
    '/workspace/task-runtime',
    '/workspace/guided',
    '/workspace/sop',
    '/workspace/staff/tasks',
    '/staff/tasks',
    '/workspace/staff/task-detail',
    '/staff/task-detail',
    '/workspace/staff/feedback',
    '/staff/feedback',
    '/home-alert/my-queue',
    '/home-alert/sla',
    '/home-alert/timeline',
    '/home-alert/kanban',
    '/runtime/health',
    '/reports',
    '/admin/reference',
    '/sop'
  ];
  for (var i = 0; i < frozen.length; i++) {
    if (!CBV_WEBAPP_VI_ROUTE_PAGE_TITLE[frozen[i]]) {
      detail.missingRoutes.push(frozen[i]);
      errors.push('Missing Vietnamese page title for route: ' + frozen[i]);
    }
  }

  var navItems = CbvWebAppVi_getNavItems();
  detail.navActualCount = navItems.length;
  if (navItems.length !== CBV_WEBAPP_VI_NAV_PAIRS.length) {
    errors.push('Nav must expose exactly ' + CBV_WEBAPP_VI_NAV_PAIRS.length + ' items (got ' + navItems.length + ')');
  }
  for (var nv = 0; nv < CBV_WEBAPP_VI_NAV_PAIRS.length; nv++) {
    var pr = CBV_WEBAPP_VI_NAV_PAIRS[nv];
    var lbl = CbvWebAppVi_getLabel(pr.key);
    if (!String(lbl || '').trim()) {
      detail.missingLabels.push(pr.key);
      errors.push('Missing Vietnamese label for nav key: ' + pr.key);
    }
  }

  var baseFooter = CbvWebAppVi_getSafetyFooter('/workspace');
  if (baseFooter.indexOf('Không tự động giao việc') < 0) errors.push('Safety footer base missing Vietnamese auto-assign phrase');
  var tkFooter = CbvWebAppVi_getSafetyFooter('/home-alert/timeline');
  if (tkFooter.indexOf('Không kéo-thả') < 0) {
    errors.push('Timeline safety footer missing drag-drop Vietnamese phrase');
  }

  // Mutation probe (Phase 96 namespace)
  detail.mutationAllowlist = [
    'CbvWebAppVi_getLabel',
    'CbvWebAppVi_getRouteLabel',
    'CbvWebAppVi_getNavItems',
    'CbvWebAppVi_getSafetyFooter',
    'CbvWebAppVi_getSafetyFooterHtml',
    'CbvWebAppVi_getWebAppLinks',
    'CbvWebAppVi_getUserFlowGuide',
    'CbvWebAppVi_validate'
  ];
  var allowPatterns = [/^CbvWebAppVi__/, /^CbvWebAppVi_TestConsole_/, /^CbvWebAppVi_get/];
  var verbRe = /^(set|update|create|delete|save|mutate|assign|escalate|resolve|complete|toggle|enable|disable|grant|revoke|provision|deprovision|edit|reset|rotate|heal|repair)[A-Z]/;

  function isMutationName(name) {
    if (typeof name !== 'string') return false;
    if (name.indexOf('CbvWebAppVi_') !== 0) return false;
    if (detail.mutationAllowlist.indexOf(name) >= 0) return false;
    for (var j = 0; j < allowPatterns.length; j++) {
      if (allowPatterns[j].test(name)) return false;
    }
    var action = name.replace(/^CbvWebAppVi_/, '').replace(/^_+/, '');
    return verbRe.test(action);
  }

  try {
    var globals = (typeof this !== 'undefined') ? this : {};
    var keys = Object.keys(globals || {});
    for (var k = 0; k < keys.length; k++) {
      var n = keys[k];
      if (isMutationName(n) && typeof globals[n] === 'function') {
        detail.noMutationExposed = false;
        detail.mutationProbe.push(n);
      }
    }
  } catch (eProbe) {
    warnings.push('Mutation probe skipped: ' + (eProbe && eProbe.message ? eProbe.message : String(eProbe)));
  }
  if (!detail.noMutationExposed) {
    errors.push('Phase 96 namespace exposes mutation-like functions: ' + detail.mutationProbe.join(', '));
  }

  return CbvWebAppVi__out_(errors.length === 0, detail, warnings, errors);
}
