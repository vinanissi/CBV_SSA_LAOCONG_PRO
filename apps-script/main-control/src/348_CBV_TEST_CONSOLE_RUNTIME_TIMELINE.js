/**
 * CBV Test Console Phase G — Runtime Timeline.
 */

var CBV_TC_TIMELINE_SHEET_NAME_ = 'CBV_TC_RUNTIME_TIMELINE';
var CBV_TC_TIMELINE_HEADERS_ = ['CREATED_AT', 'EVENT_ID', 'SESSION_ID', 'TRACE_ID', 'EVENT_TYPE', 'FROM_STATE', 'TO_STATE', 'ACTOR', 'MESSAGE', 'PAYLOAD_JSON'];

function CBV_TestConsole_Timeline_append_(session, eventType, fromState, toState, message, payload) {
  var s = session || {};
  var sh = CBV_TestConsole_Runtime_getOrCreateSheet_(CBV_TC_TIMELINE_SHEET_NAME_, CBV_TC_TIMELINE_HEADERS_);
  return CBV_TestConsole_Runtime_appendByHeaders_(sh, CBV_TC_TIMELINE_HEADERS_, {
    CREATED_AT: CBV_TestConsole_Runtime_now_(),
    EVENT_ID: CBV_TestConsole_Runtime_uuid_('TCEVT'),
    SESSION_ID: String(s.sessionId || ''),
    TRACE_ID: String(s.traceId || ''),
    EVENT_TYPE: String(eventType || ''),
    FROM_STATE: String(fromState || ''),
    TO_STATE: String(toState || ''),
    ACTOR: CBV_TestConsole_Runtime_user_(),
    MESSAGE: String(message || ''),
    PAYLOAD_JSON: CBV_TestConsole_Runtime_safeJson_(payload || {})
  });
}

function CBV_TestConsole_Timeline_listRecent_(limit, sessionId) {
  var n = parseInt(limit, 10);
  if (!isFinite(n) || n <= 0) n = 30;
  if (n > 200) n = 200;
  var sh = CBV_TestConsole_Runtime_getOrCreateSheet_(CBV_TC_TIMELINE_SHEET_NAME_, CBV_TC_TIMELINE_HEADERS_);
  if (!sh || sh.getLastRow() < 2) return [];
  var last = sh.getLastRow();
  var start = Math.max(2, last - Math.max(n * 3, n) + 1);
  var values = sh.getRange(start, 1, last - start + 1, CBV_TC_TIMELINE_HEADERS_.length).getValues();
  var want = String(sessionId || '').trim();
  var out = [];
  var i;
  for (i = values.length - 1; i >= 0; i--) {
    var row = values[i];
    var obj = {
      createdAt: String(row[0] || ''),
      eventId: String(row[1] || ''),
      sessionId: String(row[2] || ''),
      traceId: String(row[3] || ''),
      eventType: String(row[4] || ''),
      fromState: String(row[5] || ''),
      toState: String(row[6] || ''),
      actor: String(row[7] || ''),
      message: String(row[8] || ''),
      payloadJson: String(row[9] || '{}')
    };
    if (want && obj.sessionId !== want) continue;
    out.push(obj);
    if (out.length >= n) break;
  }
  return out;
}
