/**
 * CBV — minimal cross-module utilities (load before Core V2 utils).
 * Provides cbvNow / cbvUser / cbvMakeId used by 01_CBV_CORE_V2_UTILS.js and runtime.
 */

function cbvNow() {
  return new Date();
}

function cbvUser() {
  try {
    return Session.getActiveUser().getEmail() || 'system';
  } catch (e) {
    return 'system';
  }
}

function cbvMakeId(prefix) {
  var p = prefix || 'ID';
  var tz = Session.getScriptTimeZone() || 'Asia/Ho_Chi_Minh';
  var d = Utilities.formatDate(new Date(), tz, 'yyyyMMdd');
  var r = Utilities.getUuid().replace(/-/g, '').slice(0, 8).toUpperCase();
  return p + '_' + d + '_' + r;
}
