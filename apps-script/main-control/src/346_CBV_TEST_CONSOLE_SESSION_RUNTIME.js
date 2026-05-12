/**
 * CBV Test Console Phase G — Runtime Session Layer.
 */

var CBV_TC_SESSION_SHEET_NAME_ = 'CBV_TC_RUNTIME_SESSION';
var CBV_TC_ACTIVE_SESSION_PROP_ = 'CBV_TC_ACTIVE_SESSION_JSON';
var CBV_TC_SESSION_HEADERS_ = ['CREATED_AT', 'SESSION_ID', 'TRACE_ID', 'ACTION', 'STATE', 'SUITE_CODE', 'RUN_BY', 'LOCK_ID', 'STATUS', 'GUIDANCE_JSON', 'NOTE'];

function CBV_TestConsole_Runtime_now_() {
  return typeof CBV_TestConsole_isoNow_ === 'function' ? CBV_TestConsole_isoNow_() : new Date().toISOString();
}

function CBV_TestConsole_Runtime_user_() {
  return typeof CBV_TestConsole_runBy_ === 'function' ? CBV_TestConsole_runBy_() : 'UNKNOWN';
}

function CBV_TestConsole_Runtime_uuid_(prefix) {
  try {
    return String(prefix || 'ID') + '_' + Utilities.getUuid().replace(/-/g, '').slice(0, 12).toUpperCase();
  } catch (e) {
    return String(prefix || 'ID') + '_' + String(new Date().getTime());
  }
}

function CBV_TestConsole_Runtime_safeJson_(obj) {
  try {
    return JSON.stringify(obj == null ? {} : obj);
  } catch (e) {
    return '{}';
  }
}

function CBV_TestConsole_Runtime_getDb_() {
  var opened = typeof MC_Obs_openModuleDb_ === 'function' ? MC_Obs_openModuleDb_() : { ok: false };
  return opened && opened.ok ? opened.ss : null;
}

function CBV_TestConsole_Runtime_getOrCreateSheet_(name, headers) {
  var ss = CBV_TestConsole_Runtime_getDb_();
  if (!ss) return null;
  var sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  if (sh.getLastRow() < 1) {
    sh.getRange(1, 1, 1, headers.length).setValues([headers]);
    try {
      sh.setFrozenRows(1);
    } catch (e0) {
      /* ignore */
    }
  } else {
    var first = sh.getRange(1, 1, 1, Math.max(sh.getLastColumn(), 1)).getValues()[0];
    var map = {};
    var i;
    for (i = 0; i < first.length; i++) map[String(first[i] || '').trim()] = true;
    for (i = 0; i < headers.length; i++) {
      if (!map[headers[i]]) sh.getRange(1, sh.getLastColumn() + 1).setValue(headers[i]);
    }
  }
  return sh;
}

function CBV_TestConsole_Runtime_appendByHeaders_(sh, headers, row) {
  if (!sh) return false;
  var values = [];
  var i;
  for (i = 0; i < headers.length; i++) values.push(row[headers[i]] != null ? row[headers[i]] : '');
  sh.appendRow(values);
  return true;
}

function CBV_TestConsole_Session_saveActive_(session) {
  PropertiesService.getUserProperties().setProperty(CBV_TC_ACTIVE_SESSION_PROP_, CBV_TestConsole_Runtime_safeJson_(session || {}));
}

function CBV_TestConsole_Session_getActive_() {
  try {
    var raw = String(PropertiesService.getUserProperties().getProperty(CBV_TC_ACTIVE_SESSION_PROP_) || '');
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function CBV_TestConsole_Session_clearActive_() {
  try {
    PropertiesService.getUserProperties().deleteProperty(CBV_TC_ACTIVE_SESSION_PROP_);
  } catch (e) {
    /* ignore */
  }
}

function CBV_TestConsole_Session_appendLog_(session, action, note, guidance) {
  var s = session || {};
  var sh = CBV_TestConsole_Runtime_getOrCreateSheet_(CBV_TC_SESSION_SHEET_NAME_, CBV_TC_SESSION_HEADERS_);
  return CBV_TestConsole_Runtime_appendByHeaders_(sh, CBV_TC_SESSION_HEADERS_, {
    CREATED_AT: CBV_TestConsole_Runtime_now_(),
    SESSION_ID: String(s.sessionId || ''),
    TRACE_ID: String(s.traceId || ''),
    ACTION: String(action || ''),
    STATE: String(s.state || ''),
    SUITE_CODE: String(s.suiteCode || ''),
    RUN_BY: String(s.runBy || CBV_TestConsole_Runtime_user_()),
    LOCK_ID: String(s.lockId || ''),
    STATUS: String(s.status || 'ACTIVE'),
    GUIDANCE_JSON: CBV_TestConsole_Runtime_safeJson_(guidance || s.guidance || {}),
    NOTE: String(note || '')
  });
}

function CBV_TestConsole_Session_start_(payload) {
  var p = payload || {};
  var session = {
    sessionId: CBV_TestConsole_Runtime_uuid_('TCSES'),
    traceId: typeof CBV_TestConsole_newTraceId_ === 'function' ? CBV_TestConsole_newTraceId_() : CBV_TestConsole_Runtime_uuid_('TRACE'),
    state: 'SESSION_OPEN',
    suiteCode: String(p.suiteCode || '').trim().toUpperCase(),
    runBy: CBV_TestConsole_Runtime_user_(),
    startedAt: CBV_TestConsole_Runtime_now_(),
    status: 'ACTIVE',
    lockId: '',
    lastReport: null,
    guidance: {}
  };
  session.guidance = typeof CBV_TestConsole_Guidance_buildForSession_ === 'function' ? CBV_TestConsole_Guidance_buildForSession_(session, null) : {};
  CBV_TestConsole_Session_saveActive_(session);
  CBV_TestConsole_Session_appendLog_(session, 'START', 'Session opened', session.guidance);
  if (typeof CBV_TestConsole_Timeline_append_ === 'function') CBV_TestConsole_Timeline_append_(session, 'SESSION_STARTED', '', session.state, 'Session opened', {});
  return session;
}

function CBV_TestConsole_Session_close_(payload) {
  var p = payload || {};
  var session = CBV_TestConsole_Session_getActive_();
  if (!session) return { ok: false, message: 'No active session', session: null };
  var fromState = session.state || '';
  session.state = 'CLOSED';
  session.status = 'CLOSED';
  session.closedAt = CBV_TestConsole_Runtime_now_();
  CBV_TestConsole_Session_appendLog_(session, 'CLOSE', String(p.reason || 'Closed by operator'), session.guidance || {});
  if (typeof CBV_TestConsole_Timeline_append_ === 'function') CBV_TestConsole_Timeline_append_(session, 'SESSION_CLOSED', fromState, session.state, String(p.reason || 'Closed by operator'), {});
  CBV_TestConsole_Session_clearActive_();
  return { ok: true, message: 'Session closed', session: session };
}

function CBV_TestConsole_Session_update_(patch, action, note) {
  var session = CBV_TestConsole_Session_getActive_() || CBV_TestConsole_Session_start_({});
  var p = patch || {};
  var k;
  for (k in p) {
    if (Object.prototype.hasOwnProperty.call(p, k)) session[k] = p[k];
  }
  session.updatedAt = CBV_TestConsole_Runtime_now_();
  CBV_TestConsole_Session_saveActive_(session);
  CBV_TestConsole_Session_appendLog_(session, action || 'UPDATE', note || '', session.guidance || {});
  return session;
}
