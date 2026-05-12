/**
 * Phase 79 — Home / Today Workspace service.
 */

function TASK_FE_Home_open() {
  var html = HtmlService.createTemplateFromFile('79_TASK_FE_HOME_WORKSPACE')
    .evaluate()
    .setWidth(980)
    .setHeight(760);
  SpreadsheetApp.getUi().showModalDialog(html, 'CBV TASK — Hôm nay');
}

/**
 * @returns {{ ok: boolean, code: string, message: string, data: Object, errors: Array }}
 */
function TASK_FE_Home_getSnapshot() {
  var probe = TASK_FE_probeDb_();
  var vm = TASK_FE_Home_buildViewModel_();
  var ok = true;
  var code = 'TASK_FE_HOME_OK';
  if (probe.mockMode) {
    code = 'TASK_FE_HOME_MOCK';
    ok = true;
  }
  return TASK_FE_response_(ok, code, probe.mockMode ? 'Mock preview — chưa có TASK_MAIN thật hoặc sheet trống.' : 'OK', vm, []);
}

/**
 * @returns {Object} view model for FE
 */
function TASK_FE_Home_buildViewModel_() {
  var probe = TASK_FE_probeDb_();
  var warnings = (probe.warnings || []).slice();
  var rows = [];
  if (probe.hasTaskMain && !probe.mockMode) {
    rows = TASK_FE_sheetToObjects_(TASK_FE_getSheet_('TASK_MAIN'));
  } else {
    rows = TASK_FE_Home_mockTasks_();
    warnings.push('Đang dùng dữ liệu minh hoạ — không thay thế TASK thật.');
  }

  var today = [];
  var overdue = [];
  var waiting = [];
  var adminQueue = [];
  var i;
  for (i = 0; i < rows.length; i++) {
    var t = rows[i];
    var id = String(t.ID || '').trim();
    if (!id) continue;
    var stRaw = String(t.STATUS || '').trim();
    var label = TASK_FE_mapStatusToLabel_(t);
    var item = {
      id: id,
      title: String(t.TITLE || 'Không tiêu đề'),
      statusLabel: label,
      ownerId: String(t.OWNER_ID || ''),
      due: t.DUE_DATE instanceof Date ? t.DUE_DATE.toISOString().slice(0, 10) : String(t.DUE_DATE || ''),
      nextHint: TASK_FE_Home_nextHint_(t)
    };
    if (label === 'Quá hạn') overdue.push(item);
    if (stRaw === 'WAITING') {
      if (TASK_FE_Home_needsAdmin_(t) || label === 'Đang chờ admin duyệt') adminQueue.push(item);
      else waiting.push(item);
    }
    if (
      ['NEW', 'ASSIGNED', 'IN_PROGRESS', 'WAITING'].indexOf(stRaw) !== -1 ||
      label === 'Quá hạn' ||
      label === 'Cần bổ sung thông tin'
    ) {
      today.push(item);
    }
  }

  var focusCandidate = '';
  if (overdue.length) focusCandidate = overdue[0].id;
  else if (waiting.length) focusCandidate = waiting[0].id;
  else if (today.length) focusCandidate = today[0].id;

  return {
    generatedAt: typeof CBV_TestConsole_isoNow_ === 'function' ? CBV_TestConsole_isoNow_() : new Date().toISOString(),
    mockMode: probe.mockMode,
    warnings: warnings,
    sections: {
      today: today.slice(0, 50),
      overdue: overdue.slice(0, 50),
      waitingResponse: waiting.slice(0, 50),
      adminAttention: adminQueue.slice(0, 50)
    },
    focusTaskId: focusCandidate,
    guidance: TASK_FE_Home_guidanceText_(overdue.length, waiting.length, today.length, probe.mockMode)
  };
}

/**
 * @param {Object} row
 * @returns {boolean}
 */
function TASK_FE_Home_needsAdmin_(row) {
  var pend = String(row.PENDING_ACTION || '').toUpperCase();
  return pend.indexOf('ADMIN') !== -1 || pend.indexOf('APPROVAL') !== -1;
}

/**
 * @param {Object} row
 * @returns {string}
 */
function TASK_FE_Home_nextHint_(row) {
  var st = String(row.STATUS || '');
  if (st === 'NEW' || st === 'ASSIGNED') return 'Bước tiếp theo: nhận việc và bắt đầu xử lý.';
  if (st === 'IN_PROGRESS') return 'Bước tiếp theo: xử lý theo checklist, cập nhật trạng thái khi có tiến độ.';
  if (st === 'WAITING') return 'Bước tiếp theo: theo dõi phản hồi từ khách / admin và xử lý khi có thông tin.';
  return 'Bước tiếp theo: mở Focus Task để thao tác an toàn qua nút hành động.';
}

/**
 * @param {number} od
 * @param {number} wt
 * @param {number} td
 * @param {boolean} mock
 * @returns {string}
 */
function TASK_FE_Home_guidanceText_(od, wt, td, mock) {
  if (mock) return 'Chưa đọc được TASK_MAIN — bạn đang xem giao diện minh hoạ. Khi bind đúng spreadsheet TASK, danh sách sẽ là dữ liệu thật.';
  if (od > 0) return 'Ưu tiên: xử lý các việc quá hạn trước, sau đó các việc đang chờ phản hồi.';
  if (wt > 0) return 'Có việc đang chờ phản hồi — kiểm tra tin nhắn/ghi chú và nhắc bên liên quan nếu cần.';
  if (td > 0) return 'Danh sách việc trong ngày đã sẵn sàng — chọn một việc để Focus.';
  return 'Không có việc mở trong bộ lọc hôm nay — có thể đã xử lý xong hoặc cần điều chỉnh bộ lọc ở phase sau.';
}

/**
 * @returns {Array<Object>}
 */
function TASK_FE_Home_mockTasks_() {
  return [
    {
      ID: 'TASK_DEMO_1',
      TITLE: 'Minh hoạ: Kiểm tra hồ sơ HTX',
      STATUS: 'IN_PROGRESS',
      OWNER_ID: 'USER_DEMO',
      DUE_DATE: '',
      PENDING_ACTION: ''
    },
    {
      ID: 'TASK_DEMO_2',
      TITLE: 'Minh hoạ: Chờ khách bổ sung giấy tờ',
      STATUS: 'WAITING',
      OWNER_ID: 'USER_DEMO',
      DUE_DATE: '',
      PENDING_ACTION: ''
    },
    {
      ID: 'TASK_DEMO_3',
      TITLE: 'Minh hoạ: Chờ admin duyệt',
      STATUS: 'WAITING',
      OWNER_ID: 'USER_DEMO',
      DUE_DATE: '',
      PENDING_ACTION: 'ADMIN_APPROVAL'
    }
  ];
}
