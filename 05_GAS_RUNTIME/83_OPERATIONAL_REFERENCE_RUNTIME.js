/**
 * PHASE_REF_A — Operational reference layer (ENUM / USER / MASTER / DON_VI + governance sheets).
 *
 * Runtime-first, append-only seeds, no triggers, no automation side-effects.
 * Reference sheets hold identity/registry only — never real ENV secrets (use CBV_ENV_* later).
 */

var CBV_REF_PHASE_ID = 'PHASE_REF_A_OPERATIONAL_REFERENCE_LAYER';

/** Heuristic tokens that must not appear in reference-layer cell values */
var CBV_REF_FORBIDDEN_VALUE_SUBSTRINGS = [
  'PRIVATE KEY', 'BEGIN RSA', 'AIza', 'client_secret', 'xoxb-', 'slack_token',
  'CBV_ENV_', 'SECRET_KEY', 'password=', 'api_key=', 'Bearer eyJ'
];

var CBV_REF_ENUM_SEED_SPEC = [
  { g: 'SLA_STATUS', v: 'ON_TRACK', t: 'Đúng tiến độ' },
  { g: 'SLA_STATUS', v: 'DUE_SOON', t: 'Sắp đến hạn' },
  { g: 'SLA_STATUS', v: 'OVERDUE', t: 'Quá hạn' },
  { g: 'SLA_STATUS', v: 'BREACHED', t: 'Vi phạm SLA' },
  { g: 'ESCALATION_STATUS', v: 'NONE', t: 'Không' },
  { g: 'ESCALATION_STATUS', v: 'PENDING', t: 'Chờ xử lý' },
  { g: 'ESCALATION_STATUS', v: 'ESCALATED', t: 'Đã leo thang' },
  { g: 'ESCALATION_STATUS', v: 'CLEARED', t: 'Đã xử lý' },
  { g: 'ALERT_STATUS', v: 'OPEN', t: 'Mở' },
  { g: 'ALERT_STATUS', v: 'ACKNOWLEDGED', t: 'Đã nhận' },
  { g: 'ALERT_STATUS', v: 'RESOLVED', t: 'Đã đóng' },
  { g: 'QUEUE_STATUS', v: 'OPEN', t: 'Mở' },
  { g: 'QUEUE_STATUS', v: 'BLOCKED', t: 'Bị chặn' },
  { g: 'QUEUE_STATUS', v: 'WAITING', t: 'Chờ' },
  { g: 'AUTOMATION_STATUS', v: 'IDLE', t: 'Nghỉ' },
  { g: 'AUTOMATION_STATUS', v: 'RUNNING', t: 'Đang chạy' },
  { g: 'AUTOMATION_STATUS', v: 'SUCCESS', t: 'Thành công' },
  { g: 'AUTOMATION_STATUS', v: 'FAILED', t: 'Lỗi' },
  { g: 'SEVERITY', v: 'LOW', t: 'Thấp' },
  { g: 'SEVERITY', v: 'MEDIUM', t: 'Trung bình' },
  { g: 'SEVERITY', v: 'HIGH', t: 'Cao' },
  { g: 'SEVERITY', v: 'CRITICAL', t: 'Nghiêm trọng' },
  { g: 'PRIORITY', v: 'P1', t: 'Ưu tiên 1' },
  { g: 'PRIORITY', v: 'P2', t: 'Ưu tiên 2' },
  { g: 'PRIORITY', v: 'P3', t: 'Ưu tiên 3' },
  { g: 'ATTENTION_LEVEL', v: 'LOW', t: 'Thấp' },
  { g: 'ATTENTION_LEVEL', v: 'NORMAL', t: 'Bình thường' },
  { g: 'ATTENTION_LEVEL', v: 'HIGH', t: 'Cao' },
  { g: 'ROLE_CODE', v: 'ADMIN', t: 'Quản trị' },
  { g: 'ROLE_CODE', v: 'OPERATOR', t: 'Vận hành' },
  { g: 'ROLE_CODE', v: 'SUPERVISOR', t: 'Giám sát' },
  { g: 'ROLE_CODE', v: 'VIEWER', t: 'Chỉ xem' },
  { g: 'USER_STATUS', v: 'ACTIVE', t: 'Hoạt động' },
  { g: 'USER_STATUS', v: 'INACTIVE', t: 'Ngưng' },
  { g: 'USER_STATUS', v: 'SUSPENDED', t: 'Tạm khóa' },
  { g: 'DON_VI_TYPE', v: 'CONG_TY', t: 'Công ty' },
  { g: 'DON_VI_TYPE', v: 'HTX', t: 'HTX' },
  { g: 'DON_VI_TYPE', v: 'BO_PHAN', t: 'Bộ phận' },
  { g: 'DON_VI_STATUS', v: 'ACTIVE', t: 'Hoạt động' },
  { g: 'DON_VI_STATUS', v: 'INACTIVE', t: 'Ngưng' },
  { g: 'ENV_TYPE', v: 'DEV', t: 'Phát triển (enum only)' },
  { g: 'ENV_TYPE', v: 'STAGE', t: 'Tiền production (enum only)' },
  { g: 'ENV_TYPE', v: 'PROD', t: 'Production (enum only)' },
  { g: 'ENV_STATUS', v: 'HEALTHY', t: 'Khỏe (enum only)' },
  { g: 'ENV_STATUS', v: 'DEGRADED', t: 'Suy giảm (enum only)' },
  { g: 'ENV_STATUS', v: 'UNKNOWN', t: 'Chưa rõ (enum only)' },
  { g: 'DEPLOY_STATUS', v: 'NOT_STARTED', t: 'Chưa triển khai' },
  { g: 'DEPLOY_STATUS', v: 'IN_PROGRESS', t: 'Đang triển khai' },
  { g: 'DEPLOY_STATUS', v: 'COMPLETE', t: 'Hoàn tất' },
  { g: 'TRIGGER_STATUS', v: 'OFF', t: 'Tắt' },
  { g: 'TRIGGER_STATUS', v: 'ALLOWED', t: 'Được phép' },
  { g: 'TRIGGER_STATUS', v: 'INSTALLED', t: 'Đã cài' },
  { g: 'FEATURE_FLAG_STATUS', v: 'DRAFT', t: 'Nháp' },
  { g: 'FEATURE_FLAG_STATUS', v: 'ACTIVE', t: 'Đang dùng' },
  { g: 'FEATURE_FLAG_STATUS', v: 'DEPRECATED', t: 'Ngừng' },
  { g: 'AUTOMATION_TYPE', v: 'MANUAL', t: 'Thủ công' },
  { g: 'AUTOMATION_TYPE', v: 'CLOCK', t: 'Theo lịch' },
  { g: 'AUTOMATION_TYPE', v: 'WEBHOOK', t: 'Webhook' },
  { g: 'SAFE_MODE', v: 'ON', t: 'Bật an toàn' },
  { g: 'SAFE_MODE', v: 'OFF', t: 'Tắt an toàn' },
  { g: 'AI_REVIEW_STATUS', v: 'PENDING', t: 'Chờ duyệt' },
  { g: 'AI_REVIEW_STATUS', v: 'APPROVED', t: 'Đã duyệt' },
  { g: 'AI_REVIEW_STATUS', v: 'REJECTED', t: 'Từ chối' },
  { g: 'AI_REVIEW_STATUS', v: 'SKIPPED', t: 'Bỏ qua' }
];

var CBV_REF_MASTER_SEED_SPEC = [
  { grp: 'MODULE_CODE', code: 'HOME_ALERT', label: 'HOME_ALERT' },
  { grp: 'MODULE_CODE', code: 'TASK', label: 'TASK' },
  { grp: 'MODULE_CODE', code: 'FINANCE', label: 'FINANCE' },
  { grp: 'MODULE_CODE', code: 'HO_SO', label: 'HO_SO' },
  { grp: 'MODULE_CODE', code: 'MAIN_CONTROL', label: 'MAIN_CONTROL' },
  { grp: 'QUEUE_CODE', code: 'MY_QUEUE', label: 'My queue' },
  { grp: 'QUEUE_CODE', code: 'UNASSIGNED', label: 'Unassigned' },
  { grp: 'QUEUE_CODE', code: 'BLOCKED', label: 'Blocked' },
  { grp: 'QUEUE_CODE', code: 'ESCALATED', label: 'Escalated' },
  { grp: 'QUEUE_CODE', code: 'WAITING', label: 'Waiting' },
  { grp: 'ACTION_CODE', code: 'CLAIM', label: 'Claim' },
  { grp: 'ACTION_CODE', code: 'ASSIGN', label: 'Assign' },
  { grp: 'ACTION_CODE', code: 'MARK_WAITING', label: 'Mark waiting' },
  { grp: 'ACTION_CODE', code: 'BLOCK', label: 'Block' },
  { grp: 'ACTION_CODE', code: 'RESOLVE', label: 'Resolve' },
  { grp: 'ACTION_CODE', code: 'ESCALATE', label: 'Escalate' },
  { grp: 'ACTION_CODE', code: 'REFRESH_SNAPSHOT', label: 'Refresh snapshot' },
  { grp: 'ACTION_CODE', code: 'RUN_SAFE_AUTOMATION', label: 'Run safe automation' },
  { grp: 'AUTOMATION_CODE', code: 'HOME_ALERT_REFRESH', label: 'HOME_ALERT_REFRESH' },
  { grp: 'AUTOMATION_CODE', code: 'SLA_METRICS_REFRESH', label: 'SLA_METRICS_REFRESH' },
  { grp: 'AUTOMATION_CODE', code: 'STUCK_DETECTION_DRY_RUN', label: 'STUCK_DETECTION_DRY_RUN' },
  { grp: 'AUTOMATION_CODE', code: 'DAILY_OPERATIONAL_SNAPSHOT', label: 'DAILY_OPERATIONAL_SNAPSHOT' },
  { grp: 'AUTOMATION_CODE', code: 'RUNTIME_HEALTH_CHECK', label: 'RUNTIME_HEALTH_CHECK' },
  { grp: 'ALERT_CODE', code: 'GENERIC', label: 'Generic alert' },
  { grp: 'POLICY_CODE', code: 'GENERIC', label: 'Generic policy' },
  { grp: 'SLA_POLICY_CODE', code: 'GENERIC', label: 'Generic SLA policy' },
  { grp: 'ESCALATION_POLICY_CODE', code: 'GENERIC', label: 'Generic escalation policy' },
  { grp: 'VIEW_CODE', code: 'STUB', label: 'Placeholder view' },
  { grp: 'DASHBOARD_CODE', code: 'STUB', label: 'Placeholder dashboard' },
  { grp: 'WEBHOOK_CODE', code: 'STUB', label: 'Placeholder webhook' },
  { grp: 'API_CODE', code: 'STUB', label: 'Placeholder API' },
  { grp: 'TRIGGER_CODE', code: 'STUB', label: 'Placeholder trigger' }
];

var CBV_REF_FEATURE_SEED_SPEC = [
  { code: 'ENABLE_HOME_ALERT', name: 'Home alert', mod: 'HOME_ALERT' },
  { code: 'ENABLE_SLA', name: 'SLA', mod: 'HOME_ALERT' },
  { code: 'ENABLE_ESCALATION', name: 'Escalation', mod: 'HOME_ALERT' },
  { code: 'ENABLE_SAFE_AUTOMATION', name: 'Safe automation', mod: 'HOME_ALERT' },
  { code: 'ENABLE_APPSHEET_OPERATOR_DASHBOARD', name: 'Operator dashboard', mod: 'HOME_ALERT' },
  { code: 'ENABLE_AI_SUGGESTION', name: 'AI suggestion (off by default)', mod: 'GLOBAL' }
];

function CbvRef__sheetName_(logical) {
  if (typeof CBV_CONFIG !== 'undefined' && CBV_CONFIG.SHEETS && CBV_CONFIG.SHEETS[logical]) {
    return CBV_CONFIG.SHEETS[logical];
  }
  return logical;
}

function CbvRef_ensureSheets() {
  var ensured = [];
  var tables = [
    'ENUM_DICTIONARY', 'USER_DIRECTORY', 'MASTER_CODE', 'DON_VI',
    'TEAM_DIRECTORY', 'ROLE_PERMISSION_MATRIX', 'FEATURE_FLAG', 'SYSTEM_REGISTRY'
  ];
  tables.forEach(function(name) {
    if (typeof CBV_SCHEMA_MANIFEST === 'undefined' || !CBV_SCHEMA_MANIFEST[name] || typeof getSchemaHeaders !== 'function') return;
    var logical = name;
    var sheetName = CbvRef__sheetName_(logical);
    var ex = ensureSheetExists(sheetName);
    var sh = ex.sheet;
    var hdrs = getSchemaHeaders(logical);
    if (ex.created) {
      _writeHeaders(sh, hdrs);
      ensured.push(sheetName + ':created');
    } else if (typeof getMissingColumnsForAppend === 'function' && typeof appendMissingColumnsToSheet === 'function') {
      var cur = _headers(sh);
      var miss = getMissingColumnsForAppend(cur, hdrs);
      if (miss.length) {
        appendMissingColumnsToSheet(sh, miss);
        ensured.push(sheetName + ':+' + miss.length);
      }
    }
  });
  return { ok: true, ensured: ensured };
}

function CbvRef__enumKey_(group, code) {
  return String(group || '').trim() + '|' + String(code || '').trim();
}

function CbvRef__enumCodeFromRow_(r) {
  return String(r.ENUM_CODE || r.ENUM_VALUE || '').trim();
}

function CbvRef__appendEnumRow_(headers, spec) {
  var now = typeof cbvNow === 'function' ? cbvNow() : new Date();
  var user = typeof cbvUser === 'function' ? cbvUser() : 'system';
  var rec = {};
  headers.forEach(function(h) { rec[h] = ''; });
  if (headers.indexOf('ID') !== -1) rec.ID = typeof cbvMakeId === 'function' ? cbvMakeId('ENUM') : 'ENUM_' + String(now.getTime());
  if (headers.indexOf('ENUM_GROUP') !== -1) rec.ENUM_GROUP = spec.g;
  if (headers.indexOf('ENUM_VALUE') !== -1) rec.ENUM_VALUE = spec.v;
  if (headers.indexOf('ENUM_CODE') !== -1) rec.ENUM_CODE = spec.v;
  if (headers.indexOf('DISPLAY_TEXT') !== -1) rec.DISPLAY_TEXT = spec.t || spec.v;
  if (headers.indexOf('ENUM_LABEL') !== -1) rec.ENUM_LABEL = spec.t || spec.v;
  if (headers.indexOf('SORT_ORDER') !== -1) rec.SORT_ORDER = spec.sort != null ? spec.sort : '';
  if (headers.indexOf('IS_ACTIVE') !== -1) rec.IS_ACTIVE = true;
  if (headers.indexOf('IS_SYSTEM') !== -1) rec.IS_SYSTEM = true;
  if (headers.indexOf('IS_DELETED') !== -1) rec.IS_DELETED = false;
  if (headers.indexOf('CREATED_AT') !== -1) rec.CREATED_AT = now;
  if (headers.indexOf('CREATED_BY') !== -1) rec.CREATED_BY = user;
  if (headers.indexOf('UPDATED_AT') !== -1) rec.UPDATED_AT = now;
  if (headers.indexOf('UPDATED_BY') !== -1) rec.UPDATED_BY = user;
  _appendRecord(CbvRef__sheetName_('ENUM_DICTIONARY'), rec);
}

function CbvRef_seedEnumRefDefaults_() {
  var name = CbvRef__sheetName_('ENUM_DICTIONARY');
  var sh = SpreadsheetApp.getActive().getSheetByName(name);
  if (!sh) return { added: 0 };
  var headers = _headers(sh);
  if (headers.indexOf('ENUM_GROUP') === -1 || (headers.indexOf('ENUM_VALUE') === -1 && headers.indexOf('ENUM_CODE') === -1)) {
    return { added: 0 };
  }
  var rows = _rows(sh);
  var existing = {};
  rows.forEach(function(r) {
    var g = String(r.ENUM_GROUP || '').trim();
    var c = CbvRef__enumCodeFromRow_(r);
    if (g && c) existing[g + '|' + c] = true;
  });
  var added = 0;
  CBV_REF_ENUM_SEED_SPEC.forEach(function(spec) {
    var k = CbvRef__enumKey_(spec.g, spec.v);
    if (existing[k]) return;
    CbvRef__appendEnumRow_(headers, spec);
    existing[k] = true;
    added++;
  });
  if (added > 0 && typeof clearEnumCache === 'function') clearEnumCache();
  return { added: added };
}

function CbvRef__masterExists_(rows, grp, code) {
  var c = String(code || '').trim();
  var g = String(grp || '').trim();
  for (var i = 0; i < rows.length; i++) {
    var r = rows[i];
    if (String(r.MASTER_GROUP || '').trim() === g && String(r.CODE || '').trim() === c) return true;
  }
  return false;
}

function CbvRef_seedMasterRefDefaults_() {
  var name = CbvRef__sheetName_('MASTER_CODE');
  var sh = SpreadsheetApp.getActive().getSheetByName(name);
  if (!sh) return { added: 0 };
  var headers = _headers(sh);
  var rows = _rows(sh);
  var now = typeof cbvNow === 'function' ? cbvNow() : new Date();
  var user = typeof cbvUser === 'function' ? cbvUser() : 'system';
  var added = 0;
  CBV_REF_MASTER_SEED_SPEC.forEach(function(spec) {
    if (CbvRef__masterExists_(rows, spec.grp, spec.code)) return;
    var rec = {};
    headers.forEach(function(h) { rec[h] = ''; });
    if (headers.indexOf('ID') !== -1) rec.ID = typeof cbvMakeId === 'function' ? cbvMakeId('MC') : 'MC_' + String(now.getTime()) + '_' + added;
    if (headers.indexOf('MASTER_GROUP') !== -1) rec.MASTER_GROUP = spec.grp;
    if (headers.indexOf('CODE') !== -1) rec.CODE = spec.code;
    if (headers.indexOf('NAME') !== -1) rec.NAME = spec.label;
    if (headers.indexOf('DISPLAY_TEXT') !== -1) rec.DISPLAY_TEXT = spec.label;
    if (headers.indexOf('MASTER_LABEL') !== -1) rec.MASTER_LABEL = spec.label;
    if (headers.indexOf('MASTER_CODE') !== -1) rec.MASTER_CODE = spec.code;
    if (headers.indexOf('MASTER_ID') !== -1) rec.MASTER_ID = rec.ID;
    if (headers.indexOf('MODULE_CODE') !== -1) rec.MODULE_CODE = spec.grp === 'MODULE_CODE' ? spec.code : '';
    if (headers.indexOf('STATUS') !== -1) rec.STATUS = 'ACTIVE';
    if (headers.indexOf('IS_ACTIVE') !== -1) rec.IS_ACTIVE = true;
    if (headers.indexOf('IS_SYSTEM') !== -1) rec.IS_SYSTEM = true;
    if (headers.indexOf('SORT_ORDER') !== -1) rec.SORT_ORDER = added + 1;
    if (headers.indexOf('ALLOW_EDIT') !== -1) rec.ALLOW_EDIT = false;
    if (headers.indexOf('IS_DELETED') !== -1) rec.IS_DELETED = false;
    if (headers.indexOf('CREATED_AT') !== -1) rec.CREATED_AT = now;
    if (headers.indexOf('CREATED_BY') !== -1) rec.CREATED_BY = user;
    if (headers.indexOf('UPDATED_AT') !== -1) rec.UPDATED_AT = now;
    if (headers.indexOf('UPDATED_BY') !== -1) rec.UPDATED_BY = user;
    _appendRecord(name, rec);
    rows.push(rec);
    added++;
  });
  return { added: added };
}

function CbvRef__featureExists_(rows, code) {
  var c = String(code || '').trim();
  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i].FEATURE_CODE || '').trim() === c) return true;
  }
  return false;
}

function CbvRef_seedFeatureRefDefaults_() {
  var name = CbvRef__sheetName_('FEATURE_FLAG');
  var sh = SpreadsheetApp.getActive().getSheetByName(name);
  if (!sh) return { added: 0 };
  var headers = _headers(sh);
  var rows = _rows(sh);
  var now = typeof cbvNow === 'function' ? cbvNow() : new Date();
  var user = typeof cbvUser === 'function' ? cbvUser() : 'system';
  var added = 0;
  CBV_REF_FEATURE_SEED_SPEC.forEach(function(spec) {
    if (CbvRef__featureExists_(rows, spec.code)) return;
    var rec = {};
    headers.forEach(function(h) { rec[h] = ''; });
    if (headers.indexOf('FEATURE_ID') !== -1) rec.FEATURE_ID = typeof cbvMakeId === 'function' ? cbvMakeId('FF') : 'FF_' + String(now.getTime());
    if (headers.indexOf('FEATURE_CODE') !== -1) rec.FEATURE_CODE = spec.code;
    if (headers.indexOf('FEATURE_NAME') !== -1) rec.FEATURE_NAME = spec.name;
    if (headers.indexOf('MODULE_CODE') !== -1) rec.MODULE_CODE = spec.mod;
    if (headers.indexOf('ENABLED') !== -1) rec.ENABLED = spec.code === 'ENABLE_AI_SUGGESTION' ? false : true;
    if (headers.indexOf('STATUS') !== -1) rec.STATUS = 'ACTIVE';
    if (headers.indexOf('ROLLOUT_SCOPE') !== -1) rec.ROLLOUT_SCOPE = 'GLOBAL';
    if (headers.indexOf('IS_DELETED') !== -1) rec.IS_DELETED = false;
    if (headers.indexOf('CREATED_AT') !== -1) rec.CREATED_AT = now;
    if (headers.indexOf('CREATED_BY') !== -1) rec.CREATED_BY = user;
    if (headers.indexOf('UPDATED_AT') !== -1) rec.UPDATED_AT = now;
    if (headers.indexOf('UPDATED_BY') !== -1) rec.UPDATED_BY = user;
    _appendRecord(name, rec);
    rows.push(rec);
    added++;
  });
  return { added: added };
}

function CbvRef_seedPermissionMatrixDefaults_() {
  var name = CbvRef__sheetName_('ROLE_PERMISSION_MATRIX');
  var sh = SpreadsheetApp.getActive().getSheetByName(name);
  if (!sh) return { added: 0 };
  var headers = _headers(sh);
  var rows = _rows(sh);
  function exists(role, act, mod) {
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i];
      if (String(r.ROLE_CODE || '').trim() === role && String(r.ACTION_CODE || '').trim() === act && String(r.MODULE_CODE || '').trim() === mod) {
        return true;
      }
    }
    return false;
  }
  var now = typeof cbvNow === 'function' ? cbvNow() : new Date();
  var user = typeof cbvUser === 'function' ? cbvUser() : 'system';
  var seeds = [
    { role: 'ADMIN', act: 'CLAIM', mod: 'HOME_ALERT', ex: true },
    { role: 'ADMIN', act: 'ASSIGN', mod: 'HOME_ALERT', ex: true },
    { role: 'ADMIN', act: 'RESOLVE', mod: 'HOME_ALERT', ex: true },
    { role: 'OPERATOR', act: 'CLAIM', mod: 'HOME_ALERT', ex: true },
    { role: 'OPERATOR', act: 'MARK_WAITING', mod: 'HOME_ALERT', ex: true },
    { role: 'SUPERVISOR', act: 'ESCALATE', mod: 'HOME_ALERT', ex: true }
  ];
  var added = 0;
  seeds.forEach(function(s) {
    if (exists(s.role, s.act, s.mod)) return;
    var rec = {};
    headers.forEach(function(h) { rec[h] = ''; });
    if (headers.indexOf('PERMISSION_ID') !== -1) rec.PERMISSION_ID = typeof cbvMakeId === 'function' ? cbvMakeId('PM') : 'PM_' + String(now.getTime());
    rec.ROLE_CODE = s.role;
    rec.ACTION_CODE = s.act;
    rec.MODULE_CODE = s.mod;
    if (headers.indexOf('RESOURCE_TYPE') !== -1) rec.RESOURCE_TYPE = 'ALERT';
    if (headers.indexOf('CAN_VIEW') !== -1) rec.CAN_VIEW = true;
    if (headers.indexOf('CAN_EXECUTE') !== -1) rec.CAN_EXECUTE = s.ex;
    if (headers.indexOf('STATUS') !== -1) rec.STATUS = 'ACTIVE';
    if (headers.indexOf('IS_DELETED') !== -1) rec.IS_DELETED = false;
    if (headers.indexOf('CREATED_AT') !== -1) rec.CREATED_AT = now;
    if (headers.indexOf('CREATED_BY') !== -1) rec.CREATED_BY = user;
    if (headers.indexOf('UPDATED_AT') !== -1) rec.UPDATED_AT = now;
    if (headers.indexOf('UPDATED_BY') !== -1) rec.UPDATED_BY = user;
    _appendRecord(name, rec);
    rows.push(rec);
    added++;
  });
  return { added: added };
}

function CbvRef_seedSystemRegistryDefaults_() {
  var name = CbvRef__sheetName_('SYSTEM_REGISTRY');
  var sh = SpreadsheetApp.getActive().getSheetByName(name);
  if (!sh) return { added: 0 };
  var headers = _headers(sh);
  var rows = _rows(sh);
  function exists(type, code) {
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i];
      if (String(r.REGISTRY_TYPE || '').trim() === type && String(r.REGISTRY_CODE || '').trim() === code) return true;
    }
    return false;
  }
  var now = typeof cbvNow === 'function' ? cbvNow() : new Date();
  var user = typeof cbvUser === 'function' ? cbvUser() : 'system';
  var types = ['SHEET', 'MODULE', 'MENU', 'TEST_CONSOLE', 'WEBHOOK', 'TRIGGER', 'APPSHEET_VIEW', 'APPSHEET_ACTION'];
  var added = 0;
  types.forEach(function(t, idx) {
    var code = 'REG_' + t;
    if (exists(t, code)) return;
    var rec = {};
    headers.forEach(function(h) { rec[h] = ''; });
    if (headers.indexOf('REGISTRY_ID') !== -1) rec.REGISTRY_ID = typeof cbvMakeId === 'function' ? cbvMakeId('REG') : 'REG_' + String(now.getTime()) + '_' + idx;
    rec.REGISTRY_TYPE = t;
    rec.REGISTRY_CODE = code;
    if (headers.indexOf('MODULE_CODE') !== -1) rec.MODULE_CODE = 'GLOBAL';
    if (headers.indexOf('RESOURCE_TYPE') !== -1) rec.RESOURCE_TYPE = 'REFERENCE';
    if (headers.indexOf('RESOURCE_NAME') !== -1) rec.RESOURCE_NAME = t;
    if (headers.indexOf('RESOURCE_REF') !== -1) rec.RESOURCE_REF = 'ref:' + t;
    if (headers.indexOf('STATUS') !== -1) rec.STATUS = 'ACTIVE';
    if (headers.indexOf('IS_DELETED') !== -1) rec.IS_DELETED = false;
    if (headers.indexOf('CREATED_AT') !== -1) rec.CREATED_AT = now;
    if (headers.indexOf('CREATED_BY') !== -1) rec.CREATED_BY = user;
    if (headers.indexOf('UPDATED_AT') !== -1) rec.UPDATED_AT = now;
    if (headers.indexOf('UPDATED_BY') !== -1) rec.UPDATED_BY = user;
    _appendRecord(name, rec);
    rows.push(rec);
    added++;
  });
  return { added: added };
}

function CbvRef_seedDefaults() {
  CbvRef_ensureSheets();
  var e1 = CbvRef_seedEnumRefDefaults_();
  var e2 = typeof seedEnumDictionary === 'function' ? seedEnumDictionary() : null;
  var m = CbvRef_seedMasterRefDefaults_();
  var f = CbvRef_seedFeatureRefDefaults_();
  var p = CbvRef_seedPermissionMatrixDefaults_();
  var s = CbvRef_seedSystemRegistryDefaults_();
  return {
    ok: true,
    refEnumAdded: e1.added || 0,
    legacyEnumSeed: e2,
    masterAdded: m.added || 0,
    featureAdded: f.added || 0,
    permissionAdded: p.added || 0,
    registryAdded: s.added || 0
  };
}

function CbvRef__loadEnums_(enumGroup) {
  var name = CbvRef__sheetName_('ENUM_DICTIONARY');
  var sh = SpreadsheetApp.getActive().getSheetByName(name);
  if (!sh) return [];
  return _rows(sh).filter(function(r) {
    if (r.IS_DELETED === true || String(r.IS_DELETED).toUpperCase() === 'TRUE') return false;
    return String(r.ENUM_GROUP || '').trim() === String(enumGroup || '').trim();
  });
}

function CbvRef_getEnum(enumGroup, enumCode) {
  var c = String(enumCode || '').trim();
  var list = CbvRef__loadEnums_(enumGroup);
  for (var i = 0; i < list.length; i++) {
    if (CbvRef__enumCodeFromRow_(list[i]) === c) return list[i];
  }
  return null;
}

function CbvRef_listEnums(enumGroup) {
  return CbvRef__loadEnums_(enumGroup);
}

function CbvRef_getUserByEmail(email) {
  var em = String(email || '').trim().toLowerCase();
  if (!em) return null;
  var sh = SpreadsheetApp.getActive().getSheetByName(CbvRef__sheetName_('USER_DIRECTORY'));
  if (!sh) return null;
  var rows = _rows(sh);
  for (var i = 0; i < rows.length; i++) {
    var r = rows[i];
    if (r.IS_DELETED === true || String(r.IS_DELETED).toUpperCase() === 'TRUE') continue;
    var u = String(r.EMAIL || '').trim().toLowerCase();
    if (u && u === em) return r;
  }
  return null;
}

function CbvRef_getUserById(userId) {
  var id = String(userId || '').trim();
  if (!id) return null;
  var sh = SpreadsheetApp.getActive().getSheetByName(CbvRef__sheetName_('USER_DIRECTORY'));
  if (!sh) return null;
  var rows = _rows(sh);
  for (var i = 0; i < rows.length; i++) {
    var r = rows[i];
    if (r.IS_DELETED === true || String(r.IS_DELETED).toUpperCase() === 'TRUE') continue;
    if (String(r.ID || '').trim() === id) return r;
    if (String(r.USER_ID || '').trim() === id) return r;
  }
  return null;
}

function CbvRef__loadMaster_(masterGroup) {
  var name = CbvRef__sheetName_('MASTER_CODE');
  var sh = SpreadsheetApp.getActive().getSheetByName(name);
  if (!sh) return [];
  return _rows(sh).filter(function(r) {
    if (r.IS_DELETED === true || String(r.IS_DELETED).toUpperCase() === 'TRUE') return false;
    return String(r.MASTER_GROUP || '').trim() === String(masterGroup || '').trim();
  });
}

function CbvRef_getMasterCode(masterGroup, masterCode) {
  var c = String(masterCode || '').trim();
  var list = CbvRef__loadMaster_(masterGroup);
  for (var i = 0; i < list.length; i++) {
    var r = list[i];
    var code = String(r.CODE || r.MASTER_CODE || '').trim();
    if (code === c) return r;
  }
  return null;
}

function CbvRef_listMasterCodes(masterGroup) {
  return CbvRef__loadMaster_(masterGroup);
}

function CbvRef_getDonVi(donViIdOrCode) {
  var key = String(donViIdOrCode || '').trim();
  if (!key) return null;
  var name = typeof getDonViSheetName === 'function' ? getDonViSheetName() : CbvRef__sheetName_('DON_VI');
  var sh = SpreadsheetApp.getActive().getSheetByName(name);
  if (!sh) return null;
  var rows = _rows(sh);
  for (var i = 0; i < rows.length; i++) {
    var r = rows[i];
    if (r.IS_DELETED === true || String(r.IS_DELETED).toUpperCase() === 'TRUE') continue;
    if (String(r.ID || '').trim() === key) return r;
    if (String(r.DON_VI_ID || '').trim() === key) return r;
    if (String(r.CODE || '').trim() === key) return r;
    if (String(r.DON_VI_CODE || '').trim() === key) return r;
  }
  return null;
}

function CbvRef_getTeam(teamIdOrCode) {
  var key = String(teamIdOrCode || '').trim();
  if (!key) return null;
  var sh = SpreadsheetApp.getActive().getSheetByName(CbvRef__sheetName_('TEAM_DIRECTORY'));
  if (!sh) return null;
  var rows = _rows(sh);
  for (var i = 0; i < rows.length; i++) {
    var r = rows[i];
    if (r.IS_DELETED === true || String(r.IS_DELETED).toUpperCase() === 'TRUE') continue;
    if (String(r.TEAM_ID || '').trim() === key) return r;
    if (String(r.TEAM_CODE || '').trim() === key) return r;
  }
  return null;
}

function CbvRef_can(roleCode, actionCode, moduleCode) {
  var rc = String(roleCode || '').trim();
  var ac = String(actionCode || '').trim();
  var mc = String(moduleCode || '').trim();
  if (!rc || !ac || !mc) return false;
  if (rc === 'ADMIN') return true;
  var sh = SpreadsheetApp.getActive().getSheetByName(CbvRef__sheetName_('ROLE_PERMISSION_MATRIX'));
  if (!sh) return false;
  var rows = _rows(sh);
  for (var i = 0; i < rows.length; i++) {
    var r = rows[i];
    if (r.IS_DELETED === true || String(r.IS_DELETED).toUpperCase() === 'TRUE') continue;
    if (String(r.STATUS || '').trim() === 'INACTIVE') continue;
    if (String(r.ROLE_CODE || '').trim() !== rc) continue;
    if (String(r.ACTION_CODE || '').trim() !== ac) continue;
    if (String(r.MODULE_CODE || '').trim() !== mc) continue;
    var ex = r.CAN_EXECUTE === true || String(r.CAN_EXECUTE).toUpperCase() === 'TRUE';
    return ex;
  }
  return false;
}

function CbvRef_isFeatureEnabled(featureCode, moduleCode) {
  var fc = String(featureCode || '').trim();
  var mc = String(moduleCode || '').trim();
  if (!fc) return false;
  var sh = SpreadsheetApp.getActive().getSheetByName(CbvRef__sheetName_('FEATURE_FLAG'));
  if (!sh) return false;
  var rows = _rows(sh);
  for (var i = 0; i < rows.length; i++) {
    var r = rows[i];
    if (r.IS_DELETED === true || String(r.IS_DELETED).toUpperCase() === 'TRUE') continue;
    if (String(r.FEATURE_CODE || '').trim() !== fc) continue;
    if (mc && String(r.MODULE_CODE || '').trim() !== mc && String(r.MODULE_CODE || '').trim() !== 'GLOBAL') continue;
    var en = r.ENABLED === true || String(r.ENABLED).toUpperCase() === 'TRUE';
    var st = String(r.STATUS || '').trim().toUpperCase();
    return en && (st === '' || st === 'ACTIVE');
  }
  return false;
}

function CbvRef_healthCheck() {
  var checks = [];
  var ok = true;
  ['ENUM_DICTIONARY', 'USER_DIRECTORY', 'MASTER_CODE', 'DON_VI', 'TEAM_DIRECTORY', 'ROLE_PERMISSION_MATRIX', 'FEATURE_FLAG', 'SYSTEM_REGISTRY'].forEach(function(t) {
    var sh = SpreadsheetApp.getActive().getSheetByName(CbvRef__sheetName_(t));
    var present = !!sh;
    if (!present) ok = false;
    checks.push({ table: t, ok: present });
  });
  return { ok: ok, checks: checks };
}

function CbvRef__cellLooksLikeSecret_(v) {
  var s = String(v || '');
  if (!s) return false;
  var low = s.toLowerCase();
  for (var i = 0; i < CBV_REF_FORBIDDEN_VALUE_SUBSTRINGS.length; i++) {
    if (s.indexOf(CBV_REF_FORBIDDEN_VALUE_SUBSTRINGS[i]) !== -1) return true;
    if (low.indexOf(CBV_REF_FORBIDDEN_VALUE_SUBSTRINGS[i].toLowerCase()) !== -1) return true;
  }
  return false;
}

function CbvRef_validateReferenceIntegrity() {
  var warnings = [];
  var errors = [];
  var sheets = ['ENUM_DICTIONARY', 'USER_DIRECTORY', 'MASTER_CODE', 'DON_VI', 'TEAM_DIRECTORY', 'ROLE_PERMISSION_MATRIX', 'FEATURE_FLAG', 'SYSTEM_REGISTRY'];
  sheets.forEach(function(t) {
    var sh = SpreadsheetApp.getActive().getSheetByName(CbvRef__sheetName_(t));
    if (!sh) {
      errors.push('Missing sheet ' + t);
      return;
    }
    var rows = _rows(sh);
    rows.forEach(function(r) {
      Object.keys(r).forEach(function(k) {
        if (k === '_rowNumber') return;
        if (CbvRef__cellLooksLikeSecret_(r[k])) {
          warnings.push('Suspicious value in ' + t + ' row ' + (r._rowNumber || '?') + ' col ' + k);
        }
      });
    });
  });
  var td = SpreadsheetApp.getActive().getSheetByName(CbvRef__sheetName_('TEAM_DIRECTORY'));
  if (td) {
    _rows(td).forEach(function(r) {
      if (r.IS_DELETED === true || String(r.IS_DELETED).toUpperCase() === 'TRUE') return;
      var dv = String(r.DON_VI_ID || '').trim();
      if (dv && !CbvRef_getDonVi(dv)) warnings.push('TEAM_DIRECTORY orphan DON_VI_ID ' + dv);
    });
  }
  return { ok: errors.length === 0, errors: errors, warnings: warnings };
}

var __CBV_REF_TEST_CONSOLE_LAST_REPORT = null;

function CbvRef_validateEnvelope_(rep) {
  var need = ['ok', 'phase', 'status', 'checkedAt', 'runBy', 'traceId', 'testSuite', 'summary', 'checks', 'warnings', 'errors', 'nextStep', 'severity', 'reportText', 'reportJson', 'contractVersion', 'envelopeOk'];
  var missing = need.filter(function(k) { return rep[k] === undefined; });
  return { ok: missing.length === 0, missing: missing };
}

function CbvRef_TestConsole_run() {
  var traceId = typeof HomeAlert_newTraceId_ === 'function' ? HomeAlert_newTraceId_() : ('REF_' + new Date().getTime());
  var checks = [];
  var warnings = [];
  var errors = [];

  function addCheck(code, ok, severity, message, detail) {
    checks.push({ code: code, ok: ok, severity: severity, message: message, detail: detail });
    if (!ok && severity === 'ERROR') errors.push(message);
    if (!ok && severity === 'WARNING') warnings.push(message);
  }

  function needCols(sheetName, logicalName) {
    var cols = (typeof CBV_SCHEMA_MANIFEST !== 'undefined' && CBV_SCHEMA_MANIFEST[logicalName])
      ? CBV_SCHEMA_MANIFEST[logicalName] : [];
    try {
      var sh = SpreadsheetApp.getActive().getSheetByName(sheetName);
      if (!sh) {
        addCheck(logicalName + '_EXISTS', false, 'ERROR', 'Sheet missing: ' + sheetName, {});
        return;
      }
      var h = _headers(sh);
      var m = cols.filter(function(c) { return h.indexOf(c) === -1; });
      addCheck(logicalName + '_SCHEMA', m.length === 0, m.length ? 'ERROR' : 'OK', sheetName, { missing: m });
    } catch (e) {
      addCheck(logicalName + '_SCHEMA', false, 'ERROR', e.message || String(e), {});
    }
  }

  var trigBefore = 0;
  try {
    trigBefore = ScriptApp.getProjectTriggers().length;
  } catch (eT) {}

  try {
    var ens = CbvRef_ensureSheets();
    addCheck('ENSURE_SHEETS', !!ens && ens.ok, 'OK', 'CbvRef_ensureSheets', ens);
  } catch (e0) {
    addCheck('ENSURE_SHEETS', false, 'ERROR', e0.message || String(e0), {});
  }

  needCols(CbvRef__sheetName_('ENUM_DICTIONARY'), 'ENUM_DICTIONARY');
  needCols(CbvRef__sheetName_('USER_DIRECTORY'), 'USER_DIRECTORY');
  needCols(CbvRef__sheetName_('MASTER_CODE'), 'MASTER_CODE');
  needCols(typeof getDonViSheetName === 'function' ? getDonViSheetName() : 'DON_VI', 'DON_VI');
  needCols(CbvRef__sheetName_('TEAM_DIRECTORY'), 'TEAM_DIRECTORY');
  needCols(CbvRef__sheetName_('ROLE_PERMISSION_MATRIX'), 'ROLE_PERMISSION_MATRIX');
  needCols(CbvRef__sheetName_('FEATURE_FLAG'), 'FEATURE_FLAG');
  needCols(CbvRef__sheetName_('SYSTEM_REGISTRY'), 'SYSTEM_REGISTRY');

  var seedR = null;
  try {
    seedR = CbvRef_seedDefaults();
    addCheck('SEED_DEFAULTS', true, 'OK', 'CbvRef_seedDefaults', seedR);
  } catch (e1) {
    addCheck('SEED_DEFAULTS', false, 'ERROR', e1.message || String(e1), {});
  }

  var groups = ['ENV_TYPE', 'SLA_STATUS', 'ESCALATION_STATUS', 'ROLE_CODE'];
  var egOk = true;
  groups.forEach(function(g) {
    var list = CbvRef_listEnums(g);
    if (!list || list.length === 0) egOk = false;
  });
  addCheck('ENUM_DEFAULTS_SEEDED', egOk, egOk ? 'OK' : 'WARNING', 'REF enum groups populated', { groups: groups });

  addCheck('MASTER_DEFAULTS', !!CbvRef_getMasterCode('MODULE_CODE', 'HOME_ALERT'), 'OK', 'MODULE_CODE/HOME_ALERT', {});
  addCheck('FEATURE_DEFAULTS', CbvRef_isFeatureEnabled('ENABLE_HOME_ALERT', 'HOME_ALERT'), 'OK', 'ENABLE_HOME_ALERT', {});

  addCheck('RESOLVER_ENUM', !!CbvRef_getEnum('ENV_TYPE', 'DEV'), 'OK', 'CbvRef_getEnum', {});
  addCheck('RESOLVER_MASTER', !!CbvRef_getMasterCode('ACTION_CODE', 'CLAIM'), 'OK', 'CbvRef_getMasterCode', {});
  addCheck('RESOLVER_FEATURE', typeof CbvRef_isFeatureEnabled === 'function', 'OK', 'CbvRef_isFeatureEnabled', {});
  addCheck('RESOLVER_PERMISSION', CbvRef_can('ADMIN', 'CLAIM', 'HOME_ALERT'), 'OK', 'CbvRef_can ADMIN', {});
  addCheck('RESOLVER_PERMISSION_OP', CbvRef_can('OPERATOR', 'CLAIM', 'HOME_ALERT'), 'OK', 'CbvRef_can OPERATOR/CLAIM', {});

  var integ = null;
  try {
    integ = CbvRef_validateReferenceIntegrity();
    addCheck('REFERENCE_INTEGRITY', integ.ok, integ.warnings && integ.warnings.length ? 'WARNING' : 'OK', 'validateReferenceIntegrity', integ);
    if (integ.warnings && integ.warnings.length) warnings = warnings.concat(integ.warnings);
    if (integ.errors && integ.errors.length) errors = errors.concat(integ.errors);
    var susp = integ.warnings ? integ.warnings.filter(function(w) { return String(w).indexOf('Suspicious') === 0; }).length : 0;
    addCheck('NO_SECRET_LIKE_VALUES', susp === 0, susp ? 'WARNING' : 'OK', 'Heuristic scan (no API keys / CBV_ENV_ in cells)', { suspiciousCount: susp });
  } catch (e2) {
    integ = { ok: false, errors: [], warnings: [] };
    addCheck('REFERENCE_INTEGRITY', false, 'ERROR', e2.message || String(e2), {});
  }

  var hc = null;
  try {
    hc = CbvRef_healthCheck();
    addCheck('REF_HEALTH', !!hc && hc.ok, hc && hc.ok ? 'OK' : 'ERROR', 'CbvRef_healthCheck', hc);
    if (hc && !hc.ok) errors.push('CbvRef_healthCheck failed');
  } catch (e3) {
    addCheck('REF_HEALTH', false, 'ERROR', e3.message || String(e3), {});
  }

  addCheck('PHASE82_FN', typeof HomeAlert_checkSlaRuntime === 'function', 'OK', 'Phase82 present', {});
  addCheck('PHASE83_FN', typeof HomeAlertSlaPolicy_TestConsole_run === 'function', 'OK', 'Phase83 present', {});
  addCheck('PHASE84_FN', typeof HomeAlertSafeAutomation_TestConsole_run === 'function', 'OK', 'Phase84 present', {});

  var trigAfter = 0;
  try {
    trigAfter = ScriptApp.getProjectTriggers().length;
  } catch (eT2) {}
  addCheck('NO_NEW_TRIGGERS', trigAfter === trigBefore, trigAfter === trigBefore ? 'OK' : 'WARNING', 'Trigger count', { before: trigBefore, after: trigAfter });

  var status = errors.length > 0 ? 'FAIL' : (warnings.length > 0 ? 'GO_WITH_WARNINGS' : 'GO');
  var severity = errors.length > 0 ? 'CRITICAL' : (warnings.length > 0 ? 'WARNING' : 'OK');

  var report = {
    ok: status !== 'FAIL',
    phase: CBV_REF_PHASE_ID,
    status: status,
    severity: severity,
    checkedAt: typeof cbvNow === 'function' ? cbvNow() : new Date(),
    runBy: typeof HomeAlert_actorId_ === 'function' ? HomeAlert_actorId_() : (typeof cbvUser === 'function' ? cbvUser() : ''),
    traceId: traceId,
    testSuite: 'OPERATIONAL_REFERENCE_LAYER_REF_A',
    summary: 'Operational reference layer: ' + status + ' (' + severity + ')',
    checks: checks,
    warnings: warnings,
    errors: errors,
    nextStep: status === 'FAIL' ? 'Fix errors then rerun CbvRef_TestConsole_run().' : 'Populate real USER_DIRECTORY / TEAM_DIRECTORY; keep secrets in CBV_ENV_* (future phase).',
    reportText: '',
    reportJson: { seed: seedR, integrity: integ, health: hc },
    contractVersion: 'CBV_TEST_CONSOLE_V1',
    envelopeOk: false
  };

  var env = CbvRef_validateEnvelope_(report);
  report.envelopeOk = env.ok;
  checks.push({ code: 'REPORT_ENVELOPE', ok: env.ok, severity: env.ok ? 'OK' : 'WARNING', message: 'Final report contract', detail: env });
  if (!env.ok) {
    warnings.push('Envelope missing: ' + (env.missing || []).join(','));
    report.status = errors.length > 0 ? 'FAIL' : 'GO_WITH_WARNINGS';
    report.ok = errors.length === 0;
  }

  report.reportText = [
    '=== OPERATIONAL REFERENCE LAYER (REF-A) ===',
    'status=' + report.status,
    'envelopeOk=' + report.envelopeOk
  ].join('\n');

  __CBV_REF_TEST_CONSOLE_LAST_REPORT = report;
  Logger.log(report.reportText);
  return report;
}

function CbvRef_TestConsole_showReport() {
  var r = __CBV_REF_TEST_CONSOLE_LAST_REPORT;
  if (!r) return { ok: false, message: 'No report. Run CbvRef_TestConsole_run() first.' };
  Logger.log(r.reportText || JSON.stringify(r, null, 2));
  return r;
}
