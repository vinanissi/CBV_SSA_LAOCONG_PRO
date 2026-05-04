/**
 * CONFIG V2_2 — menu + entrypoints import V1 → CONFIG DB.
 * Dependencies: 199, 200
 */

/**
 * @param {string} sourceSpreadsheetId — ID Google Sheet (file .xlsx sau khi upload lên Drive vẫn là Spreadsheet).
 * @returns {Object}
 */
function CBV_ConfigV22Import_dryRun(sourceSpreadsheetId) {
  return cbvConfigV22ImportRun_(sourceSpreadsheetId, { dryRun: true });
}

/**
 * @param {string} sourceSpreadsheetId
 * @returns {Object}
 */
function CBV_ConfigV22Import_apply(sourceSpreadsheetId) {
  return cbvConfigV22ImportRun_(sourceSpreadsheetId, { dryRun: false });
}

/**
 * @returns {Object}
 */
function CBV_ConfigV22Import_verify() {
  return cbvConfigV22ImportVerifyImpl_();
}

function Config_menuV22ImportDryRun() {
  try {
    var ui = SpreadsheetApp.getUi();
    var r = ui.prompt('Import V1 → CONFIG V2_2 (Dry Run)', 'Nhập sourceSpreadsheetId (Google Sheet ID):', ui.ButtonSet.OK_CANCEL);
    if (r.getSelectedButton() !== ui.Button.OK) return;
    var id = String(r.getResponseText() || '').trim();
    var out = CBV_ConfigV22Import_dryRun(id);
    ui.alert('CONFIG V2_2 Import — Dry Run', cbvCoreV2SafeStringify_(out), ui.ButtonSet.OK);
  } catch (e) {
    SpreadsheetApp.getUi().alert('Dry Run', String(e && e.message ? e.message : e), SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

function Config_menuV22ImportApply() {
  try {
    var ui = SpreadsheetApp.getUi();
    var r = ui.prompt('Import V1 → CONFIG V2_2 (Apply)', 'Nhập sourceSpreadsheetId (Google Sheet ID):', ui.ButtonSet.OK_CANCEL);
    if (r.getSelectedButton() !== ui.Button.OK) return;
    var id = String(r.getResponseText() || '').trim();
    var out = CBV_ConfigV22Import_apply(id);
    ui.alert('CONFIG V2_2 Import — Apply', cbvCoreV2SafeStringify_(out), ui.ButtonSet.OK);
  } catch (e) {
    SpreadsheetApp.getUi().alert('Apply', String(e && e.message ? e.message : e), SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

function Config_menuV22ImportVerify() {
  try {
    var ui = SpreadsheetApp.getUi();
    var out = CBV_ConfigV22Import_verify();
    ui.alert('CONFIG V2_2 Import — Verify', cbvCoreV2SafeStringify_(out), ui.ButtonSet.OK);
  } catch (e) {
    SpreadsheetApp.getUi().alert('Verify', String(e && e.message ? e.message : e), SpreadsheetApp.getUi().ButtonSet.OK);
  }
}
