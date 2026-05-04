/**
 * CBV — minimal cross-module utilities (load before Core V2 utils).
 * Canonical names `cbvNow` / `cbvUser` / `cbvMakeId` are provided by `005_CBV_CORE_RUNTIME_BRIDGE.js`.
 */

function cbvNow_local() {
  return new Date();
}

function cbvUser_local() {
  try {
    return Session.getActiveUser().getEmail() || 'system';
  } catch (e) {
    return 'system';
  }
}

function cbvMakeId_local(prefix) {
  var p = prefix || 'ID';
  var tz = Session.getScriptTimeZone() || 'Asia/Ho_Chi_Minh';
  var d = Utilities.formatDate(new Date(), tz, 'yyyyMMdd');
  var r = Utilities.getUuid().replace(/-/g, '').slice(0, 8).toUpperCase();
  return p + '_' + d + '_' + r;
}
