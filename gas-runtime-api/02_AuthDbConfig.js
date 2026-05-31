/**
 * PHASE_AUTH_01 — USER_DIRECTORY login config.
 */
var CBV_AUTH_DB_CONFIG = {
  SHEET: 'USER_DIRECTORY',
  DEFAULT_PASSWORD: '1234',
  LOGIN_LOG_SHEET: 'USER_LOGIN_LOG',
  SCRIPT_PROP_TOKEN_KEY: 'GAS_TASK_API_TOKEN',
};

var CBV_AUTH_DB_ACTIONS = [
  'authLogin',
  'authMe',
  'authLogout',
  'getUserDirectory',
];
