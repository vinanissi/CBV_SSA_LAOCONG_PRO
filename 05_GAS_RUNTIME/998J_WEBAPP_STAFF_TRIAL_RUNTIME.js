/**
 * PHASE_97 — WebApp Staff Trial Execution / Feedback Capture — Runtime
 *
 * Append-only feedback sheet `CBV_WEBAPP_UAT_FEEDBACK` (pilot / trial only).
 * `CbvWebAppStaffTrial_createFeedback` writes **feedback rows only** — never TASK_MAIN or business tables.
 *
 * Standard: CBV Operational Ecosystem V1 · read-first WebApp; no production claim;
 * no auto assign / resolve / escalate; manual triage preferred.
 */

var CBV_WEBAPP_STAFF_TRIAL_PHASE_ID = 'PHASE_97_STAFF_TRIAL_FEEDBACK_CAPTURE';
var CBV_WEBAPP_STAFF_TRIAL_CONTRACT_VERSION = 'CBV_TCS_V1';

var CBV_WEBAPP_STAFF_TRIAL_SHEET_NAME = 'CBV_WEBAPP_UAT_FEEDBACK';

var CBV_WEBAPP_STAFF_TRIAL_HEADERS = [
  'FEEDBACK_ID',
  'CREATED_AT',
  'CREATED_BY',
  'ROLE',
  'TRIAL_SESSION_ID',
  'ROUTE',
  'DEVICE_TYPE',
  'SCREEN_SIZE',
  'TASK_CONTEXT',
  'FEEDBACK_TYPE',
  'SEVERITY',
  'TITLE',
  'DESCRIPTION',
  'EXPECTED_BEHAVIOR',
  'ACTUAL_BEHAVIOR',
  'REPRO_STEPS',
  'SCREENSHOT_URL',
  'STATUS',
  'TRIAGE_OWNER',
  'TRIAGE_NOTE',
  'DECISION',
  'RELATED_TRACE_ID',
  'IS_DELETED'
];

var CBV_WEBAPP_STAFF_TRIAL_ROLES = ['Admin', 'Supervisor', 'Operator'];

var CBV_WEBAPP_STAFF_TRIAL_FEEDBACK_TYPES = [
  'NAVIGATION',
  'MOBILE_UI',
  'COPY_CONFUSION',
  'DATA_CONFUSION',
  'PERFORMANCE',
  'ACCESS',
  'SAFETY',
  'OTHER'
];

var CBV_WEBAPP_STAFF_TRIAL_SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

var CBV_WEBAPP_STAFF_TRIAL_STATUS = [
  'NEW',
  'TRIAGED',
  'ACCEPTED',
  'DEFERRED',
  'REJECTED',
  'RESOLVED_MANUAL'
];

var CBV_WEBAPP_STAFF_TRIAL_DECISIONS = [
  'GO',
  'GO_WITH_WARNINGS',
  'NO_GO',
  'NEEDS_FIX',
  'NEEDS_MORE_TRIAL'
];

var CBV_WEBAPP_STAFF_TRIAL_FROZEN_ROUTES = [
  '/workspace',
  '/workspace/role-home',
  '/workspace/today',
  '/workspace/guided',
  '/home-alert/my-queue',
  '/home-alert/sla',
  '/home-alert/timeline',
  '/home-alert/kanban',
  '/runtime/health',
  '/reports',
  '/admin/reference'
];

var CBV_WEBAPP_STAFF_TRIAL_SUPPORT_ROUTES = ['?action=ping'];

function CbvWebAppStaffTrial__out_(ok, data, warnings, errors) {
  return {
    ok: ok === true,
    data: data || null,
    warnings: warnings || [],
    errors: errors || [],
    checkedAt: (typeof CbvWebAppWorkspace__now_ === 'function') ? CbvWebAppWorkspace__now_() : new Date()
  };
}

function CbvWebAppStaffTrial__getSpreadsheet_() {
  try {
    if (typeof SpreadsheetApp !== 'undefined' && SpreadsheetApp.getActiveSpreadsheet) {
      return SpreadsheetApp.getActiveSpreadsheet();
    }
  } catch (e) { /* ignore */ }
  return null;
}

function CbvWebAppStaffTrial__normKey_(k) {
  return String(k || '').replace(/[^a-z0-9]/gi, '').toUpperCase();
}

function CbvWebAppStaffTrial__payloadMap_(payload) {
  var map = {};
  if (!payload || typeof payload !== 'object') return map;
  var keys = Object.keys(payload);
  for (var i = 0; i < keys.length; i++) {
    var nk = CbvWebAppStaffTrial__normKey_(keys[i]);
    map[nk] = payload[keys[i]];
  }
  return map;
}

function CbvWebAppStaffTrial__pick_(map, headerName) {
  var nk = CbvWebAppStaffTrial__normKey_(headerName);
  if (map[nk] !== undefined && map[nk] !== null) return map[nk];
  return '';
}

function CbvWebAppStaffTrial__newFeedbackId_() {
  var t = new Date().getTime();
  return 'FB-' + t + '-' + Math.floor(Math.random() * 9000 + 1000);
}

function CbvWebAppStaffTrial__isoNow_() {
  try {
    return (typeof CbvWebAppWorkspace__now_ === 'function')
      ? String(CbvWebAppWorkspace__now_())
      : new Date().toISOString();
  } catch (e) {
    return new Date().toISOString();
  }
}

/**
 * Creates the feedback sheet and header row if missing. Does not delete rows.
 * If row 1 exists but headers mismatch, returns error (manual fix required).
 */
function CbvWebAppStaffTrial_ensureSchema() {
  var warnings = [];
  var errors = [];
  try {
    var ss = CbvWebAppStaffTrial__getSpreadsheet_();
    if (!ss) return CbvWebAppStaffTrial__out_(false, null, warnings, ['No active spreadsheet (bind script to a Google Sheet).']);

    var sh = ss.getSheetByName(CBV_WEBAPP_STAFF_TRIAL_SHEET_NAME);
    var created = false;
    if (!sh) {
      sh = ss.insertSheet(CBV_WEBAPP_STAFF_TRIAL_SHEET_NAME);
      created = true;
    }

    var lastCol = sh.getLastColumn();
    var hdrRange = sh.getRange(1, 1, 1, Math.max(CBV_WEBAPP_STAFF_TRIAL_HEADERS.length, lastCol || 1));
    var hdrRow = hdrRange.getValues()[0];
    var firstCell = hdrRow[0] ? String(hdrRow[0]).trim() : '';

    if (!firstCell) {
      sh.getRange(1, 1, 1, CBV_WEBAPP_STAFF_TRIAL_HEADERS.length).setValues([CBV_WEBAPP_STAFF_TRIAL_HEADERS]);
      return CbvWebAppStaffTrial__out_(true, { sheetName: CBV_WEBAPP_STAFF_TRIAL_SHEET_NAME, created: created, headerWritten: true }, warnings, errors);
    }

    var mismatch = false;
    for (var c = 0; c < CBV_WEBAPP_STAFF_TRIAL_HEADERS.length; c++) {
      if (String(hdrRow[c] || '').trim() !== CBV_WEBAPP_STAFF_TRIAL_HEADERS[c]) {
        mismatch = true;
        break;
      }
    }
    if (mismatch) {
      errors.push('Header row does not match Phase 97 contract. Do not overwrite data: fix row 1 manually or archive the sheet.');
      return CbvWebAppStaffTrial__out_(false, { sheetName: CBV_WEBAPP_STAFF_TRIAL_SHEET_NAME, created: created }, warnings, errors);
    }

    return CbvWebAppStaffTrial__out_(true, { sheetName: CBV_WEBAPP_STAFF_TRIAL_SHEET_NAME, created: created, headerWritten: false }, warnings, errors);
  } catch (e) {
    return CbvWebAppStaffTrial__out_(false, null, warnings, [e && e.message ? e.message : String(e)]);
  }
}

function CbvWebAppStaffTrial_getRunbook() {
  var md = [
    '# Staff Trial Runbook (VI) — Phase 97',
    '',
    '**Mục tiêu:** Cho Admin / Supervisor / Operator dùng thử WebApp pilot an toàn, ghi nhận phản hồi append-only, phân loại mức độ, phục vụ quyết định GO / GO_WITH_WARNINGS / NO_GO.',
    '',
    '**Canonical WebApp:** dùng URL `/exec` + `?route=` (Phase 96.1). Không chia sẻ link `googleusercontent.com` làm link chính thức.',
    '',
    '## Vai trò',
    '- **Admin:** workspace, runtime health, reports, admin reference, ping.',
    '- **Supervisor:** workspace, SLA, timeline, kanban.',
    '- **Operator:** workspace, my-queue (desktop + tablet + mobile).',
    '',
    '## 8 route vận hành (frozen)',
    '- `/workspace`',
    '- `/home-alert/my-queue`',
    '- `/home-alert/sla`',
    '- `/home-alert/timeline`',
    '- `/home-alert/kanban`',
    '- `/runtime/health`',
    '- `/reports`',
    '- `/admin/reference`',
    '',
    '**Hỗ trợ:** `?action=ping`',
    '',
    '## Checklist nhanh',
    '- Navigation: mỗi route mở được; URL vẫn trên `script.google.com/macros/.../exec` với `?route=` (không lạc sang host iframe).',
    '- Mobile: chữ đọc được, không che nút chính.',
    '- Safety footer: đủ các câu cấm theo Phase 94 (giao việc / hoàn tất / leo thang tự động; không tuyên bố production; timeline/kanban: không kéo-thả lưu).',
    '',
    '## Ghi feedback',
    '- Chỉ ghi vào sheet `CBV_WEBAPP_UAT_FEEDBACK` qua menu / API `CbvWebAppStaffTrial_createFeedback` (không sửa TASK_MAIN).',
    '- Append-only: không xóa dòng; cập nhật trạng thái sau này nếu có phase riêng với guard.',
    '',
    '## GO / GO_WITH_WARNINGS / NO_GO (tóm tắt)',
    '- **NO_GO:** CRITICAL navigation/access/safety; hoặc nhiều HIGH navigation/mobile ảnh hưởng hàng loạt.',
    '- **GO_WITH_WARNINGS:** copy confusion LOW/MEDIUM; cần waiver rõ ràng cho HIGH có mitigation.',
    '- **GO:** không CRITICAL chặn pilot; không vi phạm read-first.',
    '',
    '**Không** xác nhận production-ready. Pilot / staff trial only.',
    '',
    'Chi tiết: `docs/webapp/WEBAPP_STAFF_TRIAL_RUNBOOK_VI.md`.'
  ].join('\n');

  return CbvWebAppStaffTrial__out_(true, { markdownVi: md, docPath: 'docs/webapp/WEBAPP_STAFF_TRIAL_RUNBOOK_VI.md' }, [], []);
}

function CbvWebAppStaffTrial_getFeedbackSchema() {
  var fields = CBV_WEBAPP_STAFF_TRIAL_HEADERS.map(function (h) {
    return { name: h, required: ['ROLE', 'ROUTE', 'FEEDBACK_TYPE', 'SEVERITY', 'TITLE'].indexOf(h) >= 0 };
  });
  return CbvWebAppStaffTrial__out_(true, {
    sheetName: CBV_WEBAPP_STAFF_TRIAL_SHEET_NAME,
    headers: CBV_WEBAPP_STAFF_TRIAL_HEADERS.slice(),
    fields: fields,
    enums: {
      ROLE: CBV_WEBAPP_STAFF_TRIAL_ROLES.slice(),
      FEEDBACK_TYPE: CBV_WEBAPP_STAFF_TRIAL_FEEDBACK_TYPES.slice(),
      SEVERITY: CBV_WEBAPP_STAFF_TRIAL_SEVERITIES.slice(),
      STATUS: CBV_WEBAPP_STAFF_TRIAL_STATUS.slice(),
      DECISION: CBV_WEBAPP_STAFF_TRIAL_DECISIONS.slice()
    },
    allowedRoutes: CBV_WEBAPP_STAFF_TRIAL_FROZEN_ROUTES.concat(CBV_WEBAPP_STAFF_TRIAL_SUPPORT_ROUTES),
    appendOnly: true
  }, [], []);
}

function CbvWebAppStaffTrial_getTriageMatrix() {
  var rows = [
    { severity: 'CRITICAL', feedbackType: 'NAVIGATION|ACCESS|SAFETY', typicalDecision: 'NO_GO', note: 'Chặn pilot; xử lý thủ công trước khi tiếp tục.' },
    { severity: 'HIGH', feedbackType: 'MOBILE_UI|NAVIGATION', typicalDecision: 'GO_WITH_WARNINGS hoặc NO_GO', note: 'Nếu nhiều người gặp / hàng loạt thiết bị → nghiêng NO_GO.' },
    { severity: 'MEDIUM', feedbackType: 'COPY_CONFUSION', typicalDecision: 'GO_WITH_WARNINGS', note: 'Ưu tiên sửa copy / hướng dẫn; không tự động sửa runtime.' },
    { severity: 'LOW', feedbackType: 'COPY_CONFUSION', typicalDecision: 'GO_WITH_WARNINGS', note: 'Ghi backlog; không chặn pilot nếu không lan rộng.' },
    { severity: '*', feedbackType: 'DATA_CONFUSION', typicalDecision: 'NEEDS_FIX hoặc NEEDS_MORE_TRIAL', note: 'Phân biệt lỗi dữ liệu nguồn vs hiển thị UX; không auto escalate.' },
    { severity: 'MEDIUM', feedbackType: 'PERFORMANCE', typicalDecision: 'GO_WITH_WARNINGS', note: 'Đo lại sau deploy; không auto-heal.' },
    { severity: '*', feedbackType: 'OTHER', typicalDecision: 'NEEDS_MORE_TRIAL', note: 'Review thủ công.' }
  ];
  return CbvWebAppStaffTrial__out_(true, { matrix: rows, docPath: 'docs/webapp/WEBAPP_STAFF_TRIAL_TRIAGE_MATRIX.md' }, [], []);
}

/**
 * Append one feedback row. Does not mutate business data.
 * Required payload keys: ROLE, ROUTE, FEEDBACK_TYPE, SEVERITY, TITLE (case-insensitive keys allowed).
 */
function CbvWebAppStaffTrial_createFeedback(payload) {
  var warnings = [];
  try {
    var ensured = CbvWebAppStaffTrial_ensureSchema();
    if (!ensured.ok) return CbvWebAppStaffTrial__out_(false, null, ensured.warnings || [], ensured.errors || ['ensureSchema failed']);

    var map = CbvWebAppStaffTrial__payloadMap_(payload || {});
    var role = String(CbvWebAppStaffTrial__pick_(map, 'ROLE')).trim();
    var route = String(CbvWebAppStaffTrial__pick_(map, 'ROUTE')).trim();
    var fbType = String(CbvWebAppStaffTrial__pick_(map, 'FEEDBACK_TYPE')).trim().toUpperCase().replace(/\s+/g, '_');
    var sev = String(CbvWebAppStaffTrial__pick_(map, 'SEVERITY')).trim().toUpperCase();
    var title = String(CbvWebAppStaffTrial__pick_(map, 'TITLE')).trim();

    var errors = [];
    if (!role) errors.push('ROLE required');
    if (!route) errors.push('ROUTE required');
    if (!fbType) errors.push('FEEDBACK_TYPE required');
    if (!sev) errors.push('SEVERITY required');
    if (!title) errors.push('TITLE required');
    if (CBV_WEBAPP_STAFF_TRIAL_ROLES.indexOf(role) < 0) errors.push('ROLE must be one of: ' + CBV_WEBAPP_STAFF_TRIAL_ROLES.join(', '));
    var routeOk = CBV_WEBAPP_STAFF_TRIAL_FROZEN_ROUTES.indexOf(route) >= 0 || CBV_WEBAPP_STAFF_TRIAL_SUPPORT_ROUTES.indexOf(route) >= 0;
    if (!routeOk) errors.push('ROUTE must be a frozen operational route or ?action=ping');
    if (CBV_WEBAPP_STAFF_TRIAL_FEEDBACK_TYPES.indexOf(fbType) < 0) errors.push('FEEDBACK_TYPE must be one of: ' + CBV_WEBAPP_STAFF_TRIAL_FEEDBACK_TYPES.join(', '));
    if (CBV_WEBAPP_STAFF_TRIAL_SEVERITIES.indexOf(sev) < 0) errors.push('SEVERITY must be one of: ' + CBV_WEBAPP_STAFF_TRIAL_SEVERITIES.join(', '));
    if (errors.length) return CbvWebAppStaffTrial__out_(false, null, warnings, errors);

    var ss = CbvWebAppStaffTrial__getSpreadsheet_();
    var sh = ss.getSheetByName(CBV_WEBAPP_STAFF_TRIAL_SHEET_NAME);
    if (!sh) return CbvWebAppStaffTrial__out_(false, null, warnings, ['Feedback sheet missing after ensureSchema.']);

    var createdBy = String(CbvWebAppStaffTrial__pick_(map, 'CREATED_BY')).trim();
    if (!createdBy) {
      try {
        if (typeof Session !== 'undefined' && Session.getActiveUser) {
          createdBy = Session.getActiveUser().getEmail() || '';
        }
      } catch (eU) { /* ignore */ }
    }
    if (!createdBy) createdBy = '(unknown)';

    var status = String(CbvWebAppStaffTrial__pick_(map, 'STATUS')).trim().toUpperCase() || 'NEW';
    if (CBV_WEBAPP_STAFF_TRIAL_STATUS.indexOf(status) < 0) status = 'NEW';

    var decision = String(CbvWebAppStaffTrial__pick_(map, 'DECISION')).trim().toUpperCase().replace(/\s+/g, '_');
    if (decision && CBV_WEBAPP_STAFF_TRIAL_DECISIONS.indexOf(decision) < 0) {
      warnings.push('DECISION not in enum — stored as blank.');
      decision = '';
    }

    var rowObj = {
      FEEDBACK_ID: CbvWebAppStaffTrial__newFeedbackId_(),
      CREATED_AT: CbvWebAppStaffTrial__isoNow_(),
      CREATED_BY: createdBy,
      ROLE: role,
      TRIAL_SESSION_ID: String(CbvWebAppStaffTrial__pick_(map, 'TRIAL_SESSION_ID')).trim(),
      ROUTE: route,
      DEVICE_TYPE: String(CbvWebAppStaffTrial__pick_(map, 'DEVICE_TYPE')).trim(),
      SCREEN_SIZE: String(CbvWebAppStaffTrial__pick_(map, 'SCREEN_SIZE')).trim(),
      TASK_CONTEXT: String(CbvWebAppStaffTrial__pick_(map, 'TASK_CONTEXT')).trim(),
      FEEDBACK_TYPE: fbType,
      SEVERITY: sev,
      TITLE: title,
      DESCRIPTION: String(CbvWebAppStaffTrial__pick_(map, 'DESCRIPTION')).trim(),
      EXPECTED_BEHAVIOR: String(CbvWebAppStaffTrial__pick_(map, 'EXPECTED_BEHAVIOR')).trim(),
      ACTUAL_BEHAVIOR: String(CbvWebAppStaffTrial__pick_(map, 'ACTUAL_BEHAVIOR')).trim(),
      REPRO_STEPS: String(CbvWebAppStaffTrial__pick_(map, 'REPRO_STEPS')).trim(),
      SCREENSHOT_URL: String(CbvWebAppStaffTrial__pick_(map, 'SCREENSHOT_URL')).trim(),
      STATUS: status,
      TRIAGE_OWNER: String(CbvWebAppStaffTrial__pick_(map, 'TRIAGE_OWNER')).trim(),
      TRIAGE_NOTE: String(CbvWebAppStaffTrial__pick_(map, 'TRIAGE_NOTE')).trim(),
      DECISION: decision,
      RELATED_TRACE_ID: String(CbvWebAppStaffTrial__pick_(map, 'RELATED_TRACE_ID')).trim(),
      IS_DELETED: String(CbvWebAppStaffTrial__pick_(map, 'IS_DELETED')).trim() || 'FALSE'
    };

    var outRow = CBV_WEBAPP_STAFF_TRIAL_HEADERS.map(function (h) { return rowObj[h] !== undefined ? rowObj[h] : ''; });
    sh.appendRow(outRow);

    return CbvWebAppStaffTrial__out_(true, { feedbackId: rowObj.FEEDBACK_ID, rowNumber: sh.getLastRow() }, warnings, []);
  } catch (e) {
    return CbvWebAppStaffTrial__out_(false, null, warnings, [e && e.message ? e.message : String(e)]);
  }
}

/** Read most recent feedback rows (newest first); limit default 20, max 200. */
function CbvWebAppStaffTrial_listRecentFeedback(limit) {
  var lim = parseInt(limit, 10);
  if (!(lim > 0)) lim = 20;
  if (lim > 200) lim = 200;
  try {
    var ss = CbvWebAppStaffTrial__getSpreadsheet_();
    if (!ss) return CbvWebAppStaffTrial__out_(false, { rows: [] }, [], ['No active spreadsheet.']);
    var sh = ss.getSheetByName(CBV_WEBAPP_STAFF_TRIAL_SHEET_NAME);
    if (!sh) return CbvWebAppStaffTrial__out_(true, { rows: [], note: 'Sheet not created yet — run CbvWebAppStaffTrial_ensureSchema().' }, ['Sheet missing'], []);

    var lr = sh.getLastRow();
    if (lr < 2) return CbvWebAppStaffTrial__out_(true, { rows: [] }, [], []);

    var start = Math.max(2, lr - lim + 1);
    var num = lr - start + 1;
    var values = sh.getRange(start, 1, lr, CBV_WEBAPP_STAFF_TRIAL_HEADERS.length).getValues();
    var rows = [];
    for (var i = values.length - 1; i >= 0; i--) {
      var obj = {};
      for (var c = 0; c < CBV_WEBAPP_STAFF_TRIAL_HEADERS.length; c++) {
        obj[CBV_WEBAPP_STAFF_TRIAL_HEADERS[c]] = values[i][c];
      }
      rows.push(obj);
    }
    return CbvWebAppStaffTrial__out_(true, { rows: rows, window: { fromRow: start, toRow: lr } }, [], []);
  } catch (e) {
    return CbvWebAppStaffTrial__out_(false, null, [], [e && e.message ? e.message : String(e)]);
  }
}

function CbvWebAppStaffTrial_buildHandoffPrompt(opt) {
  var o = opt || {};
  var baseUrl = '';
  try {
    if (typeof CbvWebAppRouteUrl_getBaseUrl === 'function') baseUrl = CbvWebAppRouteUrl_getBaseUrl();
  } catch (eB) { baseUrl = '(CbvWebAppRouteUrl_getBaseUrl unavailable)'; }

  var trialStatus = o.trialStatus || '(fill after trial — GO | GO_WITH_WARNINGS | NO_GO)';
  var reportSummary = o.reportSummary || '(paste CbvWebAppStaffTrial_TestConsole_run summary)';
  var feedbackSummary = o.feedbackSummary || '(counts by SEVERITY / FEEDBACK_TYPE from sheet CBV_WEBAPP_UAT_FEEDBACK)';
  var criticalHigh = o.criticalHigh || '(list CRITICAL / HIGH titles + FEEDBACK_ID)';

  return [
    '=== CBV — Phase 97 Staff Trial / AI Handoff ===',
    '',
    'Repo: https://github.com/vinanissi/CBV_SSA_LAOCONG_PRO',
    'Branch: phase/from-v2.4.1-TASK-FIN',
    'Phase: PHASE_97_STAFF_TRIAL_FEEDBACK_CAPTURE',
    '',
    'Canonical WebApp base (/exec):',
    baseUrl,
    '',
    'Trial status (human): ' + trialStatus,
    'Last Test Console summary: ' + reportSummary,
    'Feedback sheet summary: ' + feedbackSummary,
    'CRITICAL / HIGH issues: ' + criticalHigh,
    '',
    'Rules for the assistant:',
    '- WebApp is read-first pilot; **not** certified for production operations.',
    '- **No** redesign; **no** phase jump if last health check was FAIL (fix Phase 97 / trial blockers first).',
    '- Frozen routes must stay: /workspace, /home-alert/my-queue, /home-alert/sla, /home-alert/timeline, /home-alert/kanban, /runtime/health, /reports, /admin/reference.',
    '- Do **not** propose auto assign, auto resolve, auto escalate, or WebApp writeback.',
    '- Phase 96.1 canonical URL behaviour must remain intact.',
    '',
    'Proposed next step (human fills):',
    o.nextStep || '(e.g. triage DEFERRED items, copy fixes to 998F, schedule re-trial…)'
  ].join('\n');
}

function CbvWebAppStaffTrial_validate() {
  var warnings = [];
  var errors = [];

  var detail = {
    sheetPresent: false,
    headerOk: false,
    enumsOk: true,
    frozenRoutesOk: false,
    routeHelperOk: false,
    routeBuildOk: false,
    dispatcher999Note: 'Verify locally: 999_WEBAPP_DOGET_DISPATCHER_FINAL.js is last in .clasp.json filePushOrder.',
    noMutationExposed: true,
    mutationProbe: [],
    mutationAllowlist: []
  };

  if (typeof CbvWebAppRouteUrl_getBaseUrl !== 'function' || typeof CbvWebAppRouteUrl_build !== 'function') {
    errors.push('Phase 96.1 route URL helper missing (998H).');
  } else {
    detail.routeHelperOk = true;
    try {
      var u = CbvWebAppRouteUrl_build('/workspace');
      detail.routeBuildOk = u.indexOf('?route=') >= 0 && u.indexOf('googleusercontent.com') < 0;
      if (!detail.routeBuildOk) errors.push('CbvWebAppRouteUrl_build(/workspace) invalid for canonical policy.');
    } catch (e1) {
      errors.push('CbvWebAppRouteUrl_build probe: ' + (e1 && e1.message ? e1.message : String(e1)));
    }
  }

  var expPaths = CBV_WEBAPP_STAFF_TRIAL_FROZEN_ROUTES.slice().sort().join('|');
  try {
    if (typeof CbvWebAppWorkspace_routeRegistry === 'function') {
      var reg = CbvWebAppWorkspace_routeRegistry() || [];
      var paths = reg.map(function (r) { return r.route; }).filter(function (p) {
        return CBV_WEBAPP_STAFF_TRIAL_FROZEN_ROUTES.indexOf(p) >= 0;
      }).sort().join('|');
      detail.frozenRoutesOk = paths === expPaths;
      if (!detail.frozenRoutesOk) warnings.push('Route registry operational paths differ from frozen Phase 94 set (expected: ' + expPaths + ').');
    } else {
      warnings.push('CbvWebAppWorkspace_routeRegistry not loaded — frozen route check skipped.');
      detail.frozenRoutesOk = true;
    }
  } catch (e2) {
    warnings.push('Frozen route check: ' + (e2 && e2.message ? e2.message : String(e2)));
  }

  try {
    var ss = CbvWebAppStaffTrial__getSpreadsheet_();
    if (!ss) {
      warnings.push('No active spreadsheet — sheet presence / header checks skipped.');
    } else {
      var sh = ss.getSheetByName(CBV_WEBAPP_STAFF_TRIAL_SHEET_NAME);
      if (sh) {
        detail.sheetPresent = true;
        var hdr = sh.getRange(1, 1, 1, CBV_WEBAPP_STAFF_TRIAL_HEADERS.length).getValues()[0];
        var ok = true;
        for (var c = 0; c < CBV_WEBAPP_STAFF_TRIAL_HEADERS.length; c++) {
          if (String(hdr[c] || '').trim() !== CBV_WEBAPP_STAFF_TRIAL_HEADERS[c]) ok = false;
        }
        detail.headerOk = ok;
        if (!ok) errors.push('Feedback sheet headers mismatch Phase 97 contract.');
      } else {
        warnings.push('Sheet ' + CBV_WEBAPP_STAFF_TRIAL_SHEET_NAME + ' not found — run CbvWebAppStaffTrial_ensureSchema() from the bound spreadsheet.');
      }
    }
  } catch (e3) {
    warnings.push('Sheet probe: ' + (e3 && e3.message ? e3.message : String(e3)));
  }

  var schema = CbvWebAppStaffTrial_getFeedbackSchema();
  if (!schema.ok || !schema.data || !schema.data.enums) {
    errors.push('getFeedbackSchema malformed.');
    detail.enumsOk = false;
  }

  // -------- Mutation probe (Phase 97 namespace) --------
  detail.mutationAllowlist = [
    'CbvWebAppStaffTrial_ensureSchema',
    'CbvWebAppStaffTrial_getRunbook',
    'CbvWebAppStaffTrial_getFeedbackSchema',
    'CbvWebAppStaffTrial_getTriageMatrix',
    'CbvWebAppStaffTrial_createFeedback',
    'CbvWebAppStaffTrial_listRecentFeedback',
    'CbvWebAppStaffTrial_buildHandoffPrompt',
    'CbvWebAppStaffTrial_validate'
  ];
  var allowPatterns = [/^CbvWebAppStaffTrial__/, /^CbvWebAppStaffTrial_TestConsole_/];
  var verbRe = /^(set|update|delete|save|mutate|assign|escalate|resolve|complete|toggle|enable|disable|grant|revoke|provision|deprovision|edit|reset|rotate|heal|repair)[A-Z]/;

  function isMutationName(name) {
    if (typeof name !== 'string') return false;
    if (name.indexOf('CbvWebAppStaffTrial_') !== 0) return false;
    if (detail.mutationAllowlist.indexOf(name) >= 0) return false;
    for (var i = 0; i < allowPatterns.length; i++) {
      if (allowPatterns[i].test(name)) return false;
    }
    var action = name.replace(/^CbvWebAppStaffTrial_/, '').replace(/^_+/, '');
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
    warnings.push('StaffTrial mutation probe skipped: ' + (eProbe && eProbe.message ? eProbe.message : String(eProbe)));
  }
  if (!detail.noMutationExposed) {
    errors.push('Phase 97 namespace exposes mutation-like functions: ' + detail.mutationProbe.join(', '));
  }

  return CbvWebAppStaffTrial__out_(errors.length === 0, detail, warnings, errors);
}
