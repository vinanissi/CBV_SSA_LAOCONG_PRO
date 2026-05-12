/**
 * CBV Test Console WebApp FE — entry, routing, and menu launchers.
 */

var CBV_TEST_CONSOLE_WEBAPP_APP_CODE_ = 'TEST_CONSOLE';
var CBV_TEST_CONSOLE_WEBAPP_TEMPLATE_ = '345_CBV_TEST_CONSOLE_WEBAPP_FE';

/**
 * @param {Object} e
 * @returns {boolean}
 */
function CBV_TestConsole_shouldServeWebApp_(e) {
  var p = (e && e.parameter) || {};
  var app = String(p.app || p.ui || '').trim().toUpperCase();
  var action = String(p.action || '').trim().toLowerCase();
  return app === CBV_TEST_CONSOLE_WEBAPP_APP_CODE_ || app === 'CBV_TEST_CONSOLE' || action === 'test_console_ui';
}

/**
 * @param {*} obj
 * @returns {string}
 */
function CBV_TestConsole_WebApp_jsonForTemplate_(obj) {
  try {
    return JSON.stringify(obj == null ? {} : obj).replace(/</g, '\\u003c');
  } catch (e) {
    return '{}';
  }
}

/**
 * @param {Object} e
 * @returns {GoogleAppsScript.HTML.HtmlOutput}
 */
function CBV_TestConsole_serveWebApp_(e) {
  var t = HtmlService.createTemplateFromFile(CBV_TEST_CONSOLE_WEBAPP_TEMPLATE_);
  t.bootstrapJson = CBV_TestConsole_WebApp_jsonForTemplate_({
    app: CBV_TEST_CONSOLE_WEBAPP_APP_CODE_,
    servedAt: typeof CBV_TestConsole_isoNow_ === 'function' ? CBV_TestConsole_isoNow_() : new Date().toISOString(),
    params: (e && e.parameter) || {}
  });
  return t.evaluate().setTitle('CBV Test Console').setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * @returns {string}
 */
function CBV_TestConsole_WebApp_getBaseUrl_() {
  try {
    if (typeof MC_getMainWebAppUrl_ === 'function') {
      var u0 = String(MC_getMainWebAppUrl_() || '').trim();
      if (u0) return u0;
    }
  } catch (e0) {
    /* ignore */
  }
  try {
    var svc = ScriptApp.getService();
    if (svc) {
      var u1 = String(svc.getUrl() || '').trim();
      if (u1) return u1;
    }
  } catch (e1) {
    /* ignore */
  }
  return '';
}

/**
 * @returns {string}
 */
function CBV_TestConsole_WebApp_getUrl_() {
  var base = CBV_TestConsole_WebApp_getBaseUrl_();
  if (!base) return '';
  var sep = base.indexOf('?') >= 0 ? '&' : '?';
  return base + sep + 'app=' + encodeURIComponent(CBV_TEST_CONSOLE_WEBAPP_APP_CODE_);
}

function CBV_TestConsole_WebApp_menuOpen() {
  var ui = SpreadsheetApp.getUi();
  var url = CBV_TestConsole_WebApp_getUrl_();
  if (!url) {
    ui.alert('CBV Test Console WebApp', 'WebApp URL is not available. Deploy the script as WebApp or set CBV_MAIN_CONTROL_WEBAPP_URL.', ui.ButtonSet.OK);
    return;
  }
  var html =
    '<!doctype html><html><head><base target="_top"><style>body{font-family:Arial,sans-serif;padding:14px}a{font-weight:600}</style></head><body>' +
    '<h3>CBV Test Console WebApp</h3><p>Open the standalone WebApp frontend:</p>' +
    '<p><a href="' +
    String(url).replace(/&/g, '&amp;').replace(/"/g, '&quot;') +
    '" target="_blank" rel="noopener">Open CBV Test Console WebApp</a></p>' +
    '<p style="color:#666;font-size:12px">The Sheet menu is only a launcher/bootstrap/health surface.</p>' +
    '</body></html>';
  ui.showModalDialog(HtmlService.createHtmlOutput(html).setWidth(420).setHeight(220), 'CBV Test Console WebApp');
}

function CBV_TestConsole_WebApp_menuBootstrap() {
  var ui = SpreadsheetApp.getUi();
  try {
    var res = cbvTestConsoleWebAppBootstrap();
    ui.alert('CBV Test Console WebApp Bootstrap', JSON.stringify(res, null, 2), ui.ButtonSet.OK);
  } catch (e) {
    ui.alert('CBV Test Console WebApp Bootstrap', String(e && e.message ? e.message : e), ui.ButtonSet.OK);
  }
}

function CBV_TestConsole_WebApp_menuHealthCheck() {
  var ui = SpreadsheetApp.getUi();
  try {
    var res = cbvTestConsoleWebAppHealthCheck();
    ui.alert('CBV Test Console WebApp Health', JSON.stringify(res, null, 2), ui.ButtonSet.OK);
  } catch (e) {
    ui.alert('CBV Test Console WebApp Health', String(e && e.message ? e.message : e), ui.ButtonSet.OK);
  }
}

function CBV_TestConsole_WebApp_menuSelfTest() {
  var ui = SpreadsheetApp.getUi();
  try {
    var res = cbvTestConsoleWebAppSelfTest({ runSafeSuite: false });
    ui.alert('CBV Test Console WebApp Self-Test', JSON.stringify(res, null, 2), ui.ButtonSet.OK);
  } catch (e) {
    ui.alert('CBV Test Console WebApp Self-Test', String(e && e.message ? e.message : e), ui.ButtonSet.OK);
  }
}
