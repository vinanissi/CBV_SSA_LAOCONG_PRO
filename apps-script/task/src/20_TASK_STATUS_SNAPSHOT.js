/**
 * Snapshot STATUS TASK_MAIN (Document/Script Properties) để phát hiện đổi trạng thái từ sheet/AppSheet
 * mà không qua 20_TASK_SERVICE — emit TASK_STATUS_CHANGED vào EVENT_QUEUE.
 * Phụ thuộc: CBV_CONFIG, 04_CORE_EVENT_QUEUE (cbvTryEmitCoreEvent_), SpreadsheetApp.
 */

/**
 * @returns {{ props: GoogleAppsScript.Properties.Properties, key: string }|null}
 */
function _cbvTaskStatusSnapshotStorage_() {
  try {
    return { props: PropertiesService.getDocumentProperties(), key: 'cbv_task_status_snapshot_v1' };
  } catch (e) {
    var sid = (typeof CBV_CONFIG !== 'undefined' && CBV_CONFIG.SPREADSHEET_ID) ? String(CBV_CONFIG.SPREADSHEET_ID) : '';
    if (!sid) return null;
    return { props: PropertiesService.getScriptProperties(), key: 'cbv_task_status_snapshot_v1_' + sid };
  }
}

/**
 * Gọi sau mọi thay đổi STATUS qua GAS để taskSyncMinutely không emit trùng.
 * @param {string} taskId
 * @param {string} status
 */
function cbvTaskStatusSnapshotSet_(taskId, status) {
  if (!taskId) return;
  var store = _cbvTaskStatusSnapshotStorage_();
  if (!store) return;
  try {
    var raw = store.props.getProperty(store.key) || '{}';
    var map = {};
    try {
      map = JSON.parse(raw);
    } catch (e2) {
      map = {};
    }
    map[String(taskId)] = String(status || '').trim();
    store.props.setProperty(store.key, JSON.stringify(map));
  } catch (e) {
    Logger.log('[cbvTaskStatusSnapshotSet_] ' + (e && e.message ? e.message : e));
  }
}

/**
 * So sánh TASK_MAIN.STATUS với snapshot; nếu khác → TASK_STATUS_CHANGED (payload note: sheet_sync).
 * Lần đầu thấy taskId: chỉ ghi snapshot, không emit.
 */
function cbvTaskStatusSnapshotSyncFromSheet_() {
  if (typeof cbvTryEmitCoreEvent_ !== 'function') return;
  var store = _cbvTaskStatusSnapshotStorage_();
  if (!store) return;
  var ss = SpreadsheetApp.getActive();
  if (!ss) return;
  var sheetName = (typeof CBV_CONFIG !== 'undefined' && CBV_CONFIG.SHEETS && CBV_CONFIG.SHEETS.TASK_MAIN)
    ? CBV_CONFIG.SHEETS.TASK_MAIN : 'TASK_MAIN';
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet || sheet.getLastRow() < 2) return;

  var lastRow = sheet.getLastRow();
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var idIdx = headers.indexOf('ID');
  var statusIdx = headers.indexOf('STATUS');
  if (idIdx === -1 || statusIdx === -1) return;

  var raw = store.props.getProperty(store.key) || '{}';
  var map = {};
  try {
    map = JSON.parse(raw);
  } catch (e) {
    map = {};
  }

  var rows = sheet.getRange(2, 1, lastRow, headers.length).getValues();
  var seen = {};
  var eventType = (typeof CBV_CORE_EVENT_TYPE_TASK_STATUS_CHANGED !== 'undefined')
    ? CBV_CORE_EVENT_TYPE_TASK_STATUS_CHANGED : 'TASK_STATUS_CHANGED';
  var emitted = 0;

  rows.forEach(function(row) {
    var id = String(row[idIdx] || '').trim();
    var st = String(row[statusIdx] || '').trim();
    if (!id) return;
    seen[id] = true;
    if (map[id] === undefined) {
      map[id] = st;
      return;
    }
    if (map[id] !== st) {
      cbvTryEmitCoreEvent_({
        eventType: eventType,
        sourceModule: 'TASK',
        refId: id,
        entityType: 'TASK_MAIN',
        payload: { previousStatus: map[id], newStatus: st, note: 'sheet_sync' }
      });
      map[id] = st;
      emitted++;
    }
  });

  Object.keys(map).forEach(function(k) {
    if (!seen[k]) delete map[k];
  });

  try {
    store.props.setProperty(store.key, JSON.stringify(map));
  } catch (e2) {
    Logger.log('[cbvTaskStatusSnapshotSyncFromSheet_] save: ' + (e2 && e2.message ? e2.message : e2));
  }
  if (emitted > 0) Logger.log('[taskSync] TASK_STATUS_CHANGED sheet_sync: ' + emitted);
}
