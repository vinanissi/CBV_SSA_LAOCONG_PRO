/**
 * Phase 79 — Admin dashboard service.
 */

function TASK_FE_Admin_open() {
  var html = HtmlService.createTemplateFromFile('79_TASK_FE_ADMIN_DASHBOARD')
    .evaluate()
    .setWidth(1000)
    .setHeight(780);
  SpreadsheetApp.getUi().showModalDialog(html, 'CBV TASK — Admin Dashboard');
}

/**
 * @returns {{ ok: boolean, code: string, message: string, data: Object, errors: Array }}
 */
function TASK_FE_Admin_getDashboardSnapshot() {
  var vm = TASK_FE_Admin_buildBottleneckModel_();
  return TASK_FE_response_(true, 'TASK_FE_ADMIN_OK', 'OK', vm, []);
}

/**
 * @returns {Object}
 */
function TASK_FE_Admin_buildBottleneckModel_() {
  var probe = TASK_FE_probeDb_();
  var rows = [];
  if (probe.hasTaskMain && !probe.mockMode) rows = TASK_FE_sheetToObjects_(TASK_FE_getSheet_('TASK_MAIN'));
  else rows = TASK_FE_Home_mockTasks_();

  var overdue = [];
  var stuck = [];
  var waitingApproval = [];
  var waitingClient = [];
  var byOwner = {};

  var i;
  for (i = 0; i < rows.length; i++) {
    var t = rows[i];
    var id = String(t.ID || '').trim();
    if (!id) continue;
    var label = TASK_FE_mapStatusToLabel_(t);
    var owner = String(t.OWNER_ID || 'UNKNOWN');
    byOwner[owner] = (byOwner[owner] || 0) + 1;
    if (label === 'Quá hạn') overdue.push({ id: id, title: t.TITLE, ownerId: owner, statusLabel: label });
    if (label === 'Bị kẹt') stuck.push({ id: id, title: t.TITLE, ownerId: owner, statusLabel: label });
    if (label === 'Đang chờ admin duyệt') waitingApproval.push({ id: id, title: t.TITLE, ownerId: owner });
    if (label === 'Đang chờ khách phản hồi') waitingClient.push({ id: id, title: t.TITLE, ownerId: owner });
  }

  var overload = [];
  for (var k in byOwner) {
    if (!Object.prototype.hasOwnProperty.call(byOwner, k)) continue;
    if (byOwner[k] >= 8) overload.push({ ownerId: k, openCount: byOwner[k] });
  }

  var workflowWarnings = [];
  if (waitingApproval.length > 10) workflowWarnings.push('Hàng chờ admin lớn — rà soát quy trình duyệt.');
  if (overdue.length > 0) workflowWarnings.push('Có việc quá hạn — ưu tiên điều phối lại.');
  if (stuck.length > 3) workflowWarnings.push('Nhiều việc bị kẹt — kiểm tra phụ thuộc và phân công.');

  return {
    generatedAt: typeof CBV_TestConsole_isoNow_ === 'function' ? CBV_TestConsole_isoNow_() : new Date().toISOString(),
    mockMode: probe.mockMode,
    warnings: probe.warnings || [],
    counts: {
      overdue: overdue.length,
      stuck: stuck.length,
      waitingApproval: waitingApproval.length,
      waitingClient: waitingClient.length
    },
    lists: {
      overdue: overdue.slice(0, 80),
      stuck: stuck.slice(0, 80),
      waitingApproval: waitingApproval.slice(0, 80),
      waitingClient: waitingClient.slice(0, 80),
      overload: overload
    },
    workflowWarnings: workflowWarnings,
    guidance: 'Đây là tổng quan vận hành — không thay thế báo cáo quản trị chính thức.'
  };
}
