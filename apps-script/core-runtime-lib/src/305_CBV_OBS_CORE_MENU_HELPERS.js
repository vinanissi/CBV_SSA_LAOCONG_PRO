/**
 * CBV_OBS_CORE — Menu Helpers (B1 minimal foundation).
 *
 * Requirements:
 * - Generic, no module assumptions.
 * - If no UI context: return WARN response, no throw.
 * - Alerts are short; no long JSON dumps.
 *
 * Public:
 * - CBV_Obs_openSheet(config, sheetType)
 * - CBV_Obs_showAlert(title, message)
 * - CBV_Obs_showResultAlert(title, result)
 * - CBV_Obs_formatSummaryForAlert(result)
 * - CBV_Obs_freezeAndResizeSheet(sheet)
 */

function CBV_Obs_openSheet(config, sheetType) {
  try {
    var norm = CBV_Obs_normalizeConfig(config);
    if (!norm.ok) return norm;
    var c = norm.data.config;

    var opened = CBV_Obs_openDb_(c);
    if (!opened.ok) return opened;
    var ss = opened.data.ss;

    var t = String(sheetType || '').trim();
    var name = CBV_Obs_getSheetName_(c, t);
    var sh = null;
    try { sh = ss.getSheetByName(name); } catch (e0) { sh = null; }
    if (!sh) return CBV_Obs_stdResponse_(false, 'CBV_OBS_OPEN_SHEET_MISSING', 'Sheet not found: ' + name, { sheetType: t, sheetName: name }, { message: 'Sheet missing', stack: '' });

    try {
      // Activate only if this spreadsheet is the active one (cannot force open a different spreadsheet tab).
      var active = SpreadsheetApp.getActiveSpreadsheet();
      if (active && String(active.getId()) === String(ss.getId())) {
        ss.setActiveSheet(sh);
        SpreadsheetApp.flush();
      }
    } catch (e1) {
      /* ignore */
    }

    try { CBV_Obs_freezeAndResizeSheet(sh); } catch (e2) { /* ignore */ }

    return CBV_Obs_stdResponse_(true, 'CBV_OBS_OPEN_SHEET_OK', 'OK', { sheetType: t, sheetName: name, url: ss.getUrl() }, null);
  } catch (e) {
    return CBV_Obs_stdResponse_(false, 'CBV_OBS_OPEN_SHEET_EXCEPTION', String(e && e.message ? e.message : e), {}, { message: String(e && e.message ? e.message : e), stack: String(e && e.stack ? e.stack : '') });
  }
}

function CBV_Obs_showAlert(title, message) {
  try {
    var ui = CBV_Obs_getUi_();
    if (!ui) return CBV_Obs_stdResponse_(true, 'CBV_OBS_UI_UNAVAILABLE', 'UI not available (skipped)', { skipped: true }, null);
    ui.alert(String(title || 'CBV OBS'), String(message || ''), ui.ButtonSet.OK);
    return CBV_Obs_stdResponse_(true, 'CBV_OBS_ALERT_OK', 'OK', {}, null);
  } catch (e) {
    return CBV_Obs_stdResponse_(true, 'CBV_OBS_ALERT_WARN', 'Alert failed (non-blocking)', { error: String(e && e.message ? e.message : e) }, null);
  }
}

function CBV_Obs_showResultAlert(title, result) {
  try {
    var ui = CBV_Obs_getUi_();
    if (!ui) return CBV_Obs_stdResponse_(true, 'CBV_OBS_UI_UNAVAILABLE', 'UI not available (skipped)', { skipped: true }, null);
    ui.alert(String(title || 'Result'), CBV_Obs_formatSummaryForAlert(result), ui.ButtonSet.OK);
    return CBV_Obs_stdResponse_(true, 'CBV_OBS_RESULT_ALERT_OK', 'OK', {}, null);
  } catch (e) {
    return CBV_Obs_stdResponse_(true, 'CBV_OBS_RESULT_ALERT_WARN', 'Alert failed (non-blocking)', { error: String(e && e.message ? e.message : e) }, null);
  }
}

function CBV_Obs_formatSummaryForAlert(result) {
  try {
    var r = result || {};
    var lines = [];
    lines.push('ok=' + String(!!r.ok));
    lines.push('code=' + String(r.code || ''));
    lines.push('message=' + String(r.message || ''));

    // Support common test summary shape: { data: { counts: {passed,warned,failed,blocked} } }
    var c = r && r.data && r.data.counts ? r.data.counts : null;
    if (c) {
      lines.push('');
      lines.push('PASS: ' + String(c.passed || 0));
      lines.push('WARN: ' + String(c.warned || 0));
      lines.push('ERROR: ' + String(c.failed || 0));
      lines.push('BLOCKER: ' + String(c.blocked || 0));
    }
    return lines.join('\n');
  } catch (e) {
    return 'Result available. Open OBS sheets for details.';
  }
}

function CBV_Obs_freezeAndResizeSheet(sheet) {
  try {
    if (!sheet) return;
    try {
      if (sheet.getFrozenRows() < 1) sheet.setFrozenRows(1);
    } catch (e0) {
      /* ignore */
    }
    try {
      // Light auto-resize only first few columns to avoid heavy operations.
      sheet.autoResizeColumns(1, Math.min(10, sheet.getLastColumn() || 10));
    } catch (e1) {
      /* ignore */
    }
  } catch (e) {
    /* ignore */
  }
}

// ---------------- private ----------------

function CBV_Obs_getUi_() {
  try {
    if (typeof SpreadsheetApp === 'undefined') return null;
    return SpreadsheetApp.getUi();
  } catch (e) {
    return null;
  }
}

