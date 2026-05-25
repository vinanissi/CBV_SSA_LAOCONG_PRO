/**
 * PHASE_RF_06 — Finance + HO_SO Plugin Activation Renderer
 */

function CbvRf06__esc_(s) {
  return String(s != null ? s : '').replace(/</g, '&lt;').replace(/"/g, '&quot;');
}

function CbvRf06__href_(path, params) {
  if (typeof CBV_Rf06__href_ === 'function') return CBV_Rf06__href_(path, params);
  return path;
}

function CbvRf06Finance_buildNav_(activeRoute) {
  var ar = String(activeRoute || '');
  var tabs = [
    { route: '/workspace/plugins/finance', label: 'Tổng quan' },
    { route: '/workspace/plugins/finance/items', label: 'Danh sách' },
    { route: '/workspace/plugins/finance/alerts', label: 'Cảnh báo' },
    { route: '/workspace/plugins/finance/search', label: 'Tìm' },
    { route: '/workspace/plugins', label: '← Module' }
  ];
  var out = '<nav class="cbv-rf06-nav cbv-thumb-zone" style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px">';
  for (var i = 0; i < tabs.length; i++) {
    var t = tabs[i];
    var active = ar === t.route ? ' cbv-action-active' : '';
    out += '<a class="cbv-btn-operational cbv-action-xl cbv-busy-link' + active + '" href="' + CbvRf06__esc_(CbvRf06__href_(t.route)) + '">' + CbvRf06__esc_(t.label) + '</a>';
  }
  out += '</nav>';
  return out;
}

function CbvRf06HoSo_buildNav_(activeRoute) {
  var ar = String(activeRoute || '');
  var tabs = [
    { route: '/workspace/plugins/ho-so', label: 'Tổng quan' },
    { route: '/workspace/plugins/ho-so/items', label: 'Danh sách' },
    { route: '/workspace/plugins/ho-so/alerts', label: 'Cảnh báo' },
    { route: '/workspace/plugins/ho-so/search', label: 'Tìm' },
    { route: '/workspace/plugins', label: '← Module' }
  ];
  var out = '<nav class="cbv-rf06-nav cbv-thumb-zone" style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px">';
  for (var i = 0; i < tabs.length; i++) {
    var t = tabs[i];
    var active = ar === t.route ? ' cbv-action-active' : '';
    out += '<a class="cbv-btn-operational cbv-action-xl cbv-busy-link' + active + '" href="' + CbvRf06__esc_(CbvRf06__href_(t.route)) + '">' + CbvRf06__esc_(t.label) + '</a>';
  }
  out += '</nav>';
  return out;
}

function CbvRf06__wrapFinance_(inner, route, ctx) {
  var body = '<div class="cbv-rf06-finance"><h2 style="margin-top:0">Tài chính</h2>' + CbvRf06Finance_buildNav_(route) + inner + '</div>';
  if (typeof CbvRf02Workboard_wrapBody_ === 'function') return CbvRf02Workboard_wrapBody_(body, route, ctx);
  return body;
}

function CbvRf06__wrapHoSo_(inner, route, ctx) {
  var body = '<div class="cbv-rf06-hoso"><h2 style="margin-top:0">Hồ sơ</h2>' + CbvRf06HoSo_buildNav_(route) + inner + '</div>';
  if (typeof CbvRf02Workboard_wrapBody_ === 'function') return CbvRf02Workboard_wrapBody_(body, route, ctx);
  return body;
}

function CbvRf06__empty_(title, msg) {
  return '<div class="cbv-rf06-state cbv-workboard-empty-state cbv-card"><p><strong>' + CbvRf06__esc_(title) + '</strong></p><p class="cbv-muted">' + CbvRf06__esc_(msg) + '</p></div>';
}

function CbvRf06__card_(label, count) {
  return '<div class="cbv-rf06-card cbv-card" style="display:inline-block;min-width:120px;margin:0 8px 8px 0;padding:12px"><div style="font-size:22px;font-weight:700">' + count + '</div><div class="cbv-muted">' + CbvRf06__esc_(label) + '</div></div>';
}

function CbvRf06Finance_renderWorkboard_(params) {
  var ctx = CBV_Permission_getCurrentUserContext();
  var env = CBV_Rf06Finance_getWorkboardModel_(ctx);
  if (!env.ok) {
    return { title: 'Finance', bodyHtml: CbvRf06__wrapFinance_(CbvRf06__empty_('Không có quyền', (env.errors || []).join('; ')), '/workspace/plugins/finance', ctx) };
  }
  var c = env.data.cards || {};
  var cards = CbvRf06__card_('Cần thu', c.receivable || 0) +
    CbvRf06__card_('Cần chi', c.payable || 0) +
    CbvRf06__card_('Chờ XN', c.waitingConfirmation || 0) +
    CbvRf06__card_('Thiếu CT', c.missingDocument || 0);
  var list = (env.data.items || []).map(function (x) {
    return '<div class="cbv-card" style="margin-bottom:8px"><strong>' + CbvRf06__esc_(x.title) + '</strong> · ' + CbvRf06__esc_(x.status) + ' · ' + (x.amount != null ? x.amount : '—') + '</div>';
  }).join('') || CbvRf06__empty_('Trống', 'Không có giao dịch trên sheet.');
  var actions = '<p class="cbv-muted">Xác nhận thanh toán = EXECUTION_LOCKED · không auto-execute</p>';
  return { title: 'Finance Workboard', bodyHtml: CbvRf06__wrapFinance_(cards + list + actions, '/workspace/plugins/finance', ctx) };
}

function CbvRf06Finance_renderItems_(params) {
  var ctx = CBV_Permission_getCurrentUserContext();
  var env = CBV_Rf06Finance_getProjection_(ctx, { limit: 50 });
  if (!env.ok) {
    return { title: 'Finance Items', bodyHtml: CbvRf06__wrapFinance_(CbvRf06__empty_('Lỗi', (env.errors || []).join('; ')), '/workspace/plugins/finance/items', ctx) };
  }
  var inner = (env.data.items || []).map(function (x) {
    return '<article class="cbv-rf06-fin-row cbv-card" style="margin-bottom:8px"><strong>' + CbvRf06__esc_(x.financeId) + '</strong> · ' + CbvRf06__esc_(x.title) +
      '<p class="cbv-muted">' + CbvRf06__esc_(x.type) + ' · ' + CbvRf06__esc_(x.status) + ' · ' + (x.amount != null ? x.amount : '—') + ' · files:' + x.fileCount + '</p></article>';
  }).join('') || CbvRf06__empty_('Trống', 'FINANCE_TRANSACTION trống hoặc không đọc được.');
  return { title: 'Finance Items', bodyHtml: CbvRf06__wrapFinance_(inner, '/workspace/plugins/finance/items', ctx) };
}

function CbvRf06Finance_renderAlerts_(params) {
  var ctx = CBV_Permission_getCurrentUserContext();
  var env = CBV_Rf06Finance_getAlerts_(ctx);
  if (!env.ok) {
    return { title: 'Finance Alerts', bodyHtml: CbvRf06__wrapFinance_(CbvRf06__empty_('Lỗi', (env.errors || []).join('; ')), '/workspace/plugins/finance/alerts', ctx) };
  }
  var alerts = (env.data && env.data.alerts) ? env.data.alerts : [];
  var inner = alerts.length ? alerts.map(function (a) {
    return '<div class="cbv-card" style="margin-bottom:8px;border-left:4px solid #e67e22"><strong>' + CbvRf06__esc_(a.title) + '</strong><p>' + CbvRf06__esc_(a.message) + '</p><p class="cbv-muted">' + CbvRf06__esc_(a.nextStep) + '</p></div>';
  }).join('') : CbvRf06__empty_('Không có cảnh báo', 'Dữ liệu ổn hoặc sheet trống.');
  inner += '<p class="cbv-muted">autoResolve=false · autoEscalate=false</p>';
  return { title: 'Finance Alerts', bodyHtml: CbvRf06__wrapFinance_(inner, '/workspace/plugins/finance/alerts', ctx) };
}

function CbvRf06Finance_renderSearch_(params) {
  var ctx = CBV_Permission_getCurrentUserContext();
  var q = String((params && (params.q || params.keyword)) || '').trim();
  var inner = '<form method="get" action="' + CbvRf06__esc_(CbvRf06__href_('/workspace/plugins/finance/search')) + '">' +
    '<input name="q" value="' + CbvRf06__esc_(q) + '" placeholder="Tìm financeId, title..." style="width:100%;padding:10px;margin-bottom:8px" />' +
    '<button type="submit" class="cbv-btn-operational cbv-action-xl">Tìm</button></form>';
  if (q.length >= 2 || q.indexOf('_') >= 0 || q.indexOf('-') >= 0) {
    var items = CBV_Rf06Finance_search_(ctx, q);
    inner += items.length ? items.map(function (it) {
      return '<a class="cbv-card cbv-busy-link" style="display:block;margin-top:8px;padding:10px;text-decoration:none;color:inherit" href="' + CbvRf06__esc_(it.href) + '"><strong>' + CbvRf06__esc_(it.title) + '</strong><p class="cbv-muted">' + CbvRf06__esc_(it.subtitle) + '</p></a>';
    }).join('') : CbvRf06__empty_('Không có kết quả', 'Thử từ khóa khác.');
  } else if (q) {
    inner += CbvRf06__empty_('Query ngắn', 'Nhập ít nhất 2 ký tự.');
  }
  return { title: 'Finance Search', bodyHtml: CbvRf06__wrapFinance_(inner, '/workspace/plugins/finance/search', ctx) };
}

function CbvRf06HoSo_renderWorkboard_(params) {
  var ctx = CBV_Permission_getCurrentUserContext();
  var env = CBV_Rf06HoSo_getWorkboardModel_(ctx);
  if (!env.ok) {
    return { title: 'Hồ sơ', bodyHtml: CbvRf06__wrapHoSo_(CbvRf06__empty_('Không có quyền', (env.errors || []).join('; ')), '/workspace/plugins/ho-so', ctx) };
  }
  var c = env.data.cards || {};
  var cards = CbvRf06__card_('Thiếu GT', c.missingDocument || 0) +
    CbvRf06__card_('Review', c.needReview || 0) +
    CbvRf06__card_('Sắp HH', c.expiredSoon || 0) +
    CbvRf06__card_('Hết hạn', c.expired || 0);
  var list = (env.data.items || []).map(function (x) {
    return '<div class="cbv-card" style="margin-bottom:8px"><strong>' + CbvRf06__esc_(x.personName) + '</strong> · ' + CbvRf06__esc_(x.status) + ' · ' + x.documentCompleteness + '%</div>';
  }).join('') || CbvRf06__empty_('Trống', 'HO_SO_MASTER trống hoặc không đọc được.');
  return { title: 'HO_SO Workboard', bodyHtml: CbvRf06__wrapHoSo_(cards + list, '/workspace/plugins/ho-so', ctx) };
}

function CbvRf06HoSo_renderItems_(params) {
  var ctx = CBV_Permission_getCurrentUserContext();
  var env = CBV_Rf06HoSo_getProjection_(ctx, { limit: 50 });
  if (!env.ok) {
    return { title: 'Hồ sơ Items', bodyHtml: CbvRf06__wrapHoSo_(CbvRf06__empty_('Lỗi', (env.errors || []).join('; ')), '/workspace/plugins/ho-so/items', ctx) };
  }
  var inner = (env.data.items || []).map(function (x) {
    return '<article class="cbv-rf06-hs-row cbv-card" style="margin-bottom:8px"><strong>' + CbvRf06__esc_(x.personName) + '</strong> · ' + CbvRf06__esc_(x.status) +
      '<p class="cbv-muted">' + CbvRf06__esc_(x.phone || '—') + ' · ' + CbvRf06__esc_(x.vehiclePlate || '—') + ' · thiếu: ' + CbvRf06__esc_((x.missingDocuments || []).join(', ') || '—') + '</p></article>';
  }).join('') || CbvRf06__empty_('Trống', 'HO_SO_MASTER trống.');
  return { title: 'Hồ sơ Items', bodyHtml: CbvRf06__wrapHoSo_(inner, '/workspace/plugins/ho-so/items', ctx) };
}

function CbvRf06HoSo_renderAlerts_(params) {
  var ctx = CBV_Permission_getCurrentUserContext();
  var env = CBV_Rf06HoSo_getAlerts_(ctx);
  if (!env.ok) {
    return { title: 'Hồ sơ Alerts', bodyHtml: CbvRf06__wrapHoSo_(CbvRf06__empty_('Lỗi', (env.errors || []).join('; ')), '/workspace/plugins/ho-so/alerts', ctx) };
  }
  var alerts = (env.data && env.data.alerts) ? env.data.alerts : [];
  var inner = alerts.length ? alerts.map(function (a) {
    return '<div class="cbv-card" style="margin-bottom:8px;border-left:4px solid #e67e22"><strong>' + CbvRf06__esc_(a.title) + '</strong><p>' + CbvRf06__esc_(a.message) + '</p></div>';
  }).join('') : CbvRf06__empty_('Không có cảnh báo', 'Dữ liệu ổn hoặc sheet trống.');
  inner += '<p class="cbv-muted">autoResolve=false · autoEscalate=false</p>';
  return { title: 'Hồ sơ Alerts', bodyHtml: CbvRf06__wrapHoSo_(inner, '/workspace/plugins/ho-so/alerts', ctx) };
}

function CbvRf06HoSo_renderSearch_(params) {
  var ctx = CBV_Permission_getCurrentUserContext();
  var q = String((params && (params.q || params.keyword)) || '').trim();
  var inner = '<form method="get" action="' + CbvRf06__esc_(CbvRf06__href_('/workspace/plugins/ho-so/search')) + '">' +
    '<input name="q" value="' + CbvRf06__esc_(q) + '" placeholder="Tên, SĐT, biển số..." style="width:100%;padding:10px;margin-bottom:8px" />' +
    '<button type="submit" class="cbv-btn-operational cbv-action-xl">Tìm</button></form>';
  if (q.length >= 2 || q.indexOf('_') >= 0 || q.indexOf('-') >= 0) {
    var items = CBV_Rf06HoSo_search_(ctx, q);
    inner += items.length ? items.map(function (it) {
      return '<a class="cbv-card cbv-busy-link" style="display:block;margin-top:8px;padding:10px;text-decoration:none;color:inherit" href="' + CbvRf06__esc_(it.href) + '"><strong>' + CbvRf06__esc_(it.title) + '</strong><p class="cbv-muted">' + CbvRf06__esc_(it.subtitle) + '</p></a>';
    }).join('') : CbvRf06__empty_('Không có kết quả', 'Thử từ khóa khác.');
  } else if (q) {
    inner += CbvRf06__empty_('Query ngắn', 'Nhập ít nhất 2 ký tự.');
  }
  return { title: 'Hồ sơ Search', bodyHtml: CbvRf06__wrapHoSo_(inner, '/workspace/plugins/ho-so/search', ctx) };
}

function CbvRf06_renderPageByType_(pageType, params) {
  var pt = String(pageType || '');
  if (pt === CBV_WEBAPP_WS_PAGE_TYPES.RF05_PLUGIN_FINANCE || pt === CBV_WEBAPP_WS_PAGE_TYPES.RF06_FINANCE_WORKBOARD) {
    return CbvRf06Finance_renderWorkboard_(params);
  }
  if (pt === CBV_WEBAPP_WS_PAGE_TYPES.RF06_FINANCE_ITEMS) return CbvRf06Finance_renderItems_(params);
  if (pt === CBV_WEBAPP_WS_PAGE_TYPES.RF06_FINANCE_ALERTS) return CbvRf06Finance_renderAlerts_(params);
  if (pt === CBV_WEBAPP_WS_PAGE_TYPES.RF06_FINANCE_SEARCH) return CbvRf06Finance_renderSearch_(params);
  if (pt === CBV_WEBAPP_WS_PAGE_TYPES.RF05_PLUGIN_HO_SO || pt === CBV_WEBAPP_WS_PAGE_TYPES.RF06_HO_SO_WORKBOARD) {
    return CbvRf06HoSo_renderWorkboard_(params);
  }
  if (pt === CBV_WEBAPP_WS_PAGE_TYPES.RF06_HO_SO_ITEMS) return CbvRf06HoSo_renderItems_(params);
  if (pt === CBV_WEBAPP_WS_PAGE_TYPES.RF06_HO_SO_ALERTS) return CbvRf06HoSo_renderAlerts_(params);
  if (pt === CBV_WEBAPP_WS_PAGE_TYPES.RF06_HO_SO_SEARCH) return CbvRf06HoSo_renderSearch_(params);
  return { title: 'RF06', bodyHtml: CbvRf06__empty_('Unknown', pt) };
}
