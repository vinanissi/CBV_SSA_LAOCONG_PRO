/**
 * PHASE_89 — WebApp Operational Workspace Skeleton (config)
 *
 * WebApp-led hybrid: Sheets/GAS runtime is source of truth, WebApp is operational workspace.
 * This phase is read-first only. No destructive writes. No auto assign/resolve/escalate.
 */

var CBV_WEBAPP_WS_PHASE_ID = 'PHASE_89_WEBAPP_OPERATIONAL_WORKSPACE_SKELETON';
var CBV_WEBAPP_WS_CONTRACT_VERSION = 'CBV_WEBAPP_WS_V1';

var CBV_WEBAPP_WS_MODES = { READ_FIRST: 'READ_FIRST' };

var CBV_WEBAPP_WS_PAGE_TYPES = {
  HOME: 'HOME',
  QUEUE: 'QUEUE',
  SLA: 'SLA',
  PLACEHOLDER: 'PLACEHOLDER'
};

var CBV_WEBAPP_WS_SAFETY_PHRASES = [
  'No auto assign',
  'No auto resolve',
  'No auto escalate',
  'No AppSheet Bot',
  'No production claim'
];

/** Default sheet names (override later via CBV_CONFIG if needed). */
var CBV_WEBAPP_WS_SHEETS = {
  HOME_ALERT: 'HOME_ALERT',
  SYSTEM_HEALTH_LOG: 'SYSTEM_HEALTH_LOG'
};

/**
 * Canonical WebApp deployment URL (must end with /exec).
 * Override at runtime: Script Properties `CBV_WEBAPP_BASE_URL` (see 998H_WEBAPP_ROUTE_URL_HELPER.js).
 */
var CBV_WEBAPP_CANONICAL_EXEC_URL_DEFAULT =
  'https://script.google.com/macros/s/AKfycbxJNx9Vw6NBRmSZx0ds7-sNAeyGo6VKTfO8PUDpcz8e7kq1o3W0eUWRP78zPfRlKXBUPA/exec';

function CbvWebAppWorkspace__actor_() {
  return (typeof cbvUser === 'function') ? cbvUser() : '';
}

function CbvWebAppWorkspace__now_() {
  return (typeof cbvNow === 'function') ? cbvNow() : new Date();
}

function CbvWebAppWorkspace__traceId_() {
  return (typeof Utilities !== 'undefined' && Utilities.getUuid) ? ('WS89_' + Utilities.getUuid()) : ('WS89_' + new Date().getTime());
}

