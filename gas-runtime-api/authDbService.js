/**
 * PHASE_AUTH_01 — USER_DIRECTORY auth service (existing sheet, no new DB).
 */

function authDbNowIso_() {
  return Utilities.formatDate(new Date(), CBV_TASK_DB_CONFIG.TIMEZONE, "yyyy-MM-dd'T'HH:mm:ss");
}

function authDbReadUserDirectory_() {
  var info = taskDbReadHeaders_(CBV_AUTH_DB_CONFIG.SHEET);
  if (!info.exists) return { info: info, rows: [] };
  var lastRow = info.sheet.getLastRow();
  if (lastRow < 2) return { info: info, rows: [] };
  var values = info.sheet.getRange(2, 1, lastRow, info.sheet.getLastColumn()).getValues();
  var rows = [];
  for (var i = 0; i < values.length; i++) {
    rows.push(taskDbRowToRecord_(info.headerMap, values[i]));
  }
  return { info: info, rows: rows };
}

function authDbIsTruthy_(val) {
  return val === true || String(val || '').toLowerCase() === 'true' || String(val || '').toLowerCase() === 'yes';
}

function authDbIsDeleted_(rec) {
  return authDbIsTruthy_(rec.IS_DELETED);
}

function authDbCanLogin_(rec) {
  if (authDbIsDeleted_(rec)) return false;
  if (String(rec.STATUS || '').toUpperCase() !== 'ACTIVE') return false;
  if (!authDbIsTruthy_(rec.ALLOW_LOGIN)) return false;
  return true;
}

function authDbNormalizeIdentifier_(value) {
  return String(value || '').trim().toLowerCase();
}

function authDbFindByIdentifier_(identifier) {
  var idNorm = authDbNormalizeIdentifier_(identifier);
  if (!idNorm) return null;
  var data = authDbReadUserDirectory_();
  for (var i = 0; i < data.rows.length; i++) {
    var rec = data.rows[i];
    if (authDbIsDeleted_(rec)) continue;
    var code = authDbNormalizeIdentifier_(rec.USER_CODE);
    var email = authDbNormalizeIdentifier_(rec.EMAIL);
    var display = authDbNormalizeIdentifier_(rec.DISPLAY_NAME);
    var full = authDbNormalizeIdentifier_(rec.FULL_NAME);
    var uid = authDbNormalizeIdentifier_(rec.ID);
    if (idNorm === code || idNorm === email || idNorm === display || idNorm === full || idNorm === uid) {
      return rec;
    }
  }
  return null;
}

function authDbVerifyPassword_(rec, password) {
  var pwd = String(password || '');
  var stored = rec.PASSWORD || rec.PASSWORD_HASH || rec.PASSWORD_PLAIN || '';
  if (!stored || String(stored).trim() === '') {
    return pwd === CBV_AUTH_DB_CONFIG.DEFAULT_PASSWORD;
  }
  return pwd === String(stored);
}

function authDbMustChangePassword_(rec, password) {
  var stored = rec.PASSWORD || rec.PASSWORD_HASH || rec.PASSWORD_PLAIN || '';
  if (!stored || String(stored).trim() === '') {
    return String(password) === CBV_AUTH_DB_CONFIG.DEFAULT_PASSWORD;
  }
  return false;
}

function authDbResolveRuntimeRole_(rec) {
  if (authDbIsTruthy_(rec.IS_ADMIN)) return 'ADMIN';
  if (authDbIsTruthy_(rec.IS_SUPERVISOR)) return 'MANAGER';
  var role = String(rec.ROLE || rec.ROLE_CODE || '').toUpperCase();
  var map = {
    ADMIN: 'ADMIN',
    MANAGER: 'MANAGER',
    SUPERVISOR: 'MANAGER',
    OPERATOR: 'STAFF',
    STAFF: 'STAFF',
    ACCOUNTANT: 'FINANCE',
    FINANCE: 'FINANCE',
    HO_SO: 'HO_SO',
    VIEWER: 'VIEW_ONLY',
    VIEW_ONLY: 'VIEW_ONLY',
  };
  return map[role] || 'VIEW_ONLY';
}

function authDbRolePermissions_(runtimeRole) {
  var matrix = {
    ADMIN: [
      'ADMIN_ALL', 'TASK_VIEW', 'TASK_CREATE', 'TASK_UPDATE', 'TASK_ASSIGN',
      'FINANCE_VIEW', 'HO_SO_VIEW', 'COORDINATION_VIEW', 'OBSERVATION_VIEW', 'PLUGIN_VIEW', 'SEARCH',
      'FINANCE_CONFIRM_PAYMENT', 'HO_SO_APPROVAL',
    ],
    MANAGER: [
      'TASK_VIEW', 'TASK_CREATE', 'TASK_UPDATE', 'TASK_ASSIGN',
      'FINANCE_VIEW', 'HO_SO_VIEW', 'COORDINATION_VIEW', 'OBSERVATION_VIEW', 'PLUGIN_VIEW', 'SEARCH',
      'HO_SO_APPROVAL',
    ],
    STAFF: ['TASK_VIEW', 'TASK_UPDATE_OWN', 'SEARCH'],
    FINANCE: ['TASK_VIEW', 'FINANCE_VIEW', 'SEARCH'],
    HO_SO: ['TASK_VIEW', 'HO_SO_VIEW', 'SEARCH'],
    VIEW_ONLY: ['TASK_VIEW', 'FINANCE_VIEW', 'HO_SO_VIEW', 'OBSERVATION_VIEW', 'PLUGIN_VIEW', 'SEARCH'],
  };
  return (matrix[runtimeRole] || matrix.VIEW_ONLY).slice();
}

function authDbBuildPermissions_(rec, runtimeRole) {
  var perms = authDbRolePermissions_(runtimeRole);
  if (authDbIsTruthy_(rec.CAN_ASSIGN) && perms.indexOf('TASK_ASSIGN') < 0) perms.push('TASK_ASSIGN');
  if (authDbIsTruthy_(rec.CAN_APPROVE) && perms.indexOf('HO_SO_APPROVAL') < 0) perms.push('HO_SO_APPROVAL');
  if (authDbIsTruthy_(rec.CAN_ESCALATE) && perms.indexOf('COORDINATION_VIEW') < 0) perms.push('COORDINATION_VIEW');
  if (authDbIsTruthy_(rec.CAN_RESOLVE) && perms.indexOf('TASK_UPDATE') < 0) perms.push('TASK_UPDATE');
  return perms;
}

function authDbMapUserProfile_(rec) {
  var runtimeRole = authDbResolveRuntimeRole_(rec);
  return {
    userId: String(rec.ID || rec.USER_CODE || ''),
    userCode: String(rec.USER_CODE || ''),
    displayName: String(rec.DISPLAY_NAME || rec.FULL_NAME || rec.USER_CODE || ''),
    email: String(rec.EMAIL || ''),
    role: runtimeRole,
    directoryRole: String(rec.ROLE || ''),
    permissions: authDbBuildPermissions_(rec, runtimeRole),
    status: String(rec.STATUS || ''),
    donViId: String(rec.DON_VI_ID || ''),
    source: 'USER_DIRECTORY',
  };
}

function authDbAppendLoginLog_(entry) {
  try {
    var sheetName = CBV_AUTH_DB_CONFIG.LOGIN_LOG_SHEET;
    var info = taskDbReadHeaders_(sheetName);
    if (!info.exists) {
      if (typeof taskDbAppendAudit_ === 'function') {
        taskDbAppendAudit_({
          traceId: entry.traceId || '',
          actor: entry.userId || entry.displayName || '',
          action: 'AUTH_LOGIN',
          status: entry.status || 'OK',
          detail: entry,
        });
      }
      return false;
    }
    var logId = 'LOGIN-' + Date.now().toString(36);
    var row = taskDbRecordToRow_(info.headerMap, info.headers, {
      ID: logId,
      USER_ID: entry.userId || '',
      DISPLAY_NAME: entry.displayName || '',
      ACTION: entry.action || 'LOGIN',
      STATUS: entry.status || 'OK',
      CREATED_AT: authDbNowIso_(),
      DETAIL_JSON: JSON.stringify(entry.detail || {}),
    });
    info.sheet.appendRow(row);
    return true;
  } catch (e) {
    return false;
  }
}

function authDbUpdateLastLogin_(rec) {
  try {
    var data = authDbReadUserDirectory_();
    if (!data.info.exists) return;
    var sheet = data.info.sheet;
    var idCol = data.info.headerMap['ID'];
    var lastLoginCol = data.info.headerMap['LAST_LOGIN_AT'];
    if (idCol === undefined || lastLoginCol === undefined) return;
    var targetId = String(rec.ID || '');
    for (var r = 2; r <= sheet.getLastRow(); r++) {
      var rowId = String(sheet.getRange(r, idCol + 1).getValue() || '');
      if (rowId === targetId) {
        sheet.getRange(r, lastLoginCol + 1).setValue(authDbNowIso_());
        break;
      }
    }
  } catch (e) {
    // non-blocking
  }
}

function CBV_AuthDb_login(payload) {
  var identifier = payload.identifier || payload.username || payload.email || payload.displayName;
  var password = payload.password;
  if (!identifier || !password) {
    return { ok: false, code: 'AUTH_MISSING_CREDENTIALS', message: 'identifier và password là bắt buộc' };
  }

  var rec = authDbFindByIdentifier_(identifier);
  if (!rec) {
    return { ok: false, code: 'AUTH_INVALID', message: 'Tài khoản không tồn tại' };
  }
  if (!authDbCanLogin_(rec)) {
    return { ok: false, code: 'AUTH_DISABLED', message: 'Tài khoản không được phép đăng nhập' };
  }
  if (!authDbVerifyPassword_(rec, password)) {
    authDbAppendLoginLog_({ userId: rec.ID, displayName: rec.DISPLAY_NAME, status: 'FAIL', action: 'LOGIN_FAIL', detail: { reason: 'bad_password' } });
    return { ok: false, code: 'AUTH_INVALID', message: 'Mật khẩu không đúng' };
  }

  var user = authDbMapUserProfile_(rec);
  var mustChangePassword = authDbMustChangePassword_(rec, password);
  authDbUpdateLastLogin_(rec);
  authDbAppendLoginLog_({
    userId: user.userId,
    displayName: user.displayName,
    status: 'OK',
    action: 'LOGIN',
    detail: { role: user.role, mustChangePassword: mustChangePassword },
  });

  return {
    ok: true,
    user: user,
    mustChangePassword: mustChangePassword,
  };
}

function CBV_AuthDb_me(payload) {
  var userId = payload.userId || payload.user_id;
  if (!userId) return { ok: false, code: 'AUTH_MISSING_USER', message: 'Thiếu userId' };
  var data = authDbReadUserDirectory_();
  for (var i = 0; i < data.rows.length; i++) {
    var rec = data.rows[i];
    if (String(rec.ID) === String(userId) || String(rec.USER_CODE) === String(userId)) {
      if (!authDbCanLogin_(rec)) {
        return { ok: false, code: 'AUTH_DISABLED', message: 'Tài khoản không còn hoạt động' };
      }
      return { ok: true, user: authDbMapUserProfile_(rec) };
    }
  }
  return { ok: false, code: 'AUTH_NOT_FOUND', message: 'Không tìm thấy user' };
}

function CBV_AuthDb_logout(payload) {
  authDbAppendLoginLog_({
    userId: payload.userId || '',
    displayName: payload.displayName || '',
    status: 'OK',
    action: 'LOGOUT',
    detail: {},
  });
  return { ok: true };
}

function CBV_AuthDb_getUserDirectory() {
  var data = authDbReadUserDirectory_();
  var users = [];
  for (var i = 0; i < data.rows.length; i++) {
    var rec = data.rows[i];
    if (!authDbCanLogin_(rec)) continue;
    users.push({
      userId: String(rec.ID || ''),
      userCode: String(rec.USER_CODE || ''),
      displayName: String(rec.DISPLAY_NAME || rec.FULL_NAME || ''),
      email: String(rec.EMAIL || ''),
      role: authDbResolveRuntimeRole_(rec),
      directoryRole: String(rec.ROLE || ''),
      donViId: String(rec.DON_VI_ID || ''),
    });
  }
  return { ok: true, users: users };
}

function CBV_AuthDb_isRegisteredAction(action) {
  return CBV_AUTH_DB_ACTIONS.indexOf(String(action || '').trim()) >= 0;
}

function CBV_AuthDb_getAllowedActions() {
  return CBV_AUTH_DB_ACTIONS.slice();
}

/** Canonical public handlers (AUTH_01A router) */
function CBV_Auth_login(payload, actor, traceId) {
  return CBV_AuthDb_login(payload || {});
}

function CBV_Auth_me(payload, actor, traceId) {
  return CBV_AuthDb_me(payload || {});
}

function CBV_Auth_logout(payload, actor, traceId) {
  return CBV_AuthDb_logout(payload || {});
}

function CBV_Auth_getUserDirectory(payload, actor, traceId) {
  return CBV_AuthDb_getUserDirectory();
}

function CBV_Auth_isRegisteredAction(action) {
  return CBV_AuthDb_isRegisteredAction(action);
}

function CBV_Auth_getAllowedActions() {
  return CBV_AuthDb_getAllowedActions();
}
