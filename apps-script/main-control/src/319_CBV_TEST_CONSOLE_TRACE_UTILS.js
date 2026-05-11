/**
 * CBV Test Console Runtime V2 — trace / clock helpers.
 */

var CBV_TEST_CONSOLE_DEFAULT_PHASE_ = 'TEST_CONSOLE_RUNTIME_V2';

/**
 * @returns {string}
 */
function CBV_TestConsole_isoNow_() {
  try {
    if (typeof MC_Obs_isoNowSafe_ === 'function') return MC_Obs_isoNowSafe_();
  } catch (e0) {
    /* ignore */
  }
  try {
    if (typeof MC_now_ === 'function') return MC_now_();
  } catch (e1) {
    /* ignore */
  }
  try {
    return new Date().toISOString();
  } catch (e2) {
    return String(new Date());
  }
}

/**
 * @returns {string}
 */
function CBV_TestConsole_runBy_() {
  try {
    if (typeof MC_Obs_actorSafe_ === 'function') return MC_Obs_actorSafe_();
  } catch (e0) {
    /* ignore */
  }
  try {
    var email = String(Session.getActiveUser().getEmail() || '').trim();
    if (email) return email;
  } catch (e1) {
    /* ignore */
  }
  return 'SYSTEM';
}

/**
 * @returns {string}
 */
function CBV_TestConsole_newTraceId_() {
  try {
    if (typeof MC_Obs_makeIdSafe_ === 'function') return MC_Obs_makeIdSafe_('TCV2');
  } catch (e0) {
    /* ignore */
  }
  return 'TCV2_' + String(new Date().getTime()) + '_' + Utilities.getUuid().replace(/-/g, '').slice(0, 8);
}
