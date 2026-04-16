/**
 * CBV Sheet Protection - Protects sensitive sheets from casual direct editing.
 * Run protectSensitiveSheets() after initAll() during deployment.
 *
 * Protected sheets: TASK_CHECKLIST, TASK_UPDATE_LOG, ENUM_DICTIONARY, USER_DIRECTORY, MASTER_CODE
 *
 * WHAT IT DOES:
 * - Protects entire sheet; only script owner (Session.getEffectiveUser()) can edit via Sheets UI
 * - GAS scripts run as owner, so append/update from service continues to work
 * - Blocks direct edits by other users who have "Edit" on the spreadsheet
 *
 * WHAT IT DOES NOT:
 * - Does not enforce identity in GAS (script runs as owner; no per-user validation)
 * - Does not protect against AppSheet writes (AppSheet uses owner connection)
 * - Does not protect against API access with owner credentials
 * - For older spreadsheets (pre-2017), use Data > Protect sheets manually
 *
 * LIMITATIONS:
 * - Google Sheets protection is UI-level; determined users with owner creds can bypass
 * - Admin must run this as spreadsheet owner; addEditor() for additional admins if needed
 */

/**
 * Protects sensitive sheets. Restricts editing to script owner only.
 * Idempotent: re-running updates existing protections.
 * @returns {{ ok: boolean, protected: string[], skipped: string[], errors: string[] }}
 */
function protectSensitiveSheets() {
  var ss = SpreadsheetApp.getActive();
  var me = Session.getEffectiveUser();
  var result = { ok: true, protected: [], skipped: [], errors: [] };
  var names = [
    CBV_CONFIG.SHEETS.TASK_CHECKLIST,
    CBV_CONFIG.SHEETS.TASK_UPDATE_LOG,
    CBV_CONFIG.SHEETS.ENUM_DICTIONARY,
    CBV_CONFIG.SHEETS.USER_DIRECTORY,
    CBV_CONFIG.SHEETS.MASTER_CODE
  ];

  names.forEach(function (name) {
    try {
      var sheet = ss.getSheetByName(name);
      if (!sheet) {
        result.skipped.push(name + ' (sheet not found)');
        return;
      }

      var existing = sheet.getProtections(SpreadsheetApp.ProtectionType.SHEET);
      var protection;
      if (existing.length > 0) {
        protection = existing[0];
      } else {
        protection = sheet.protect().setDescription('CBV protected - GAS/service only');
      }

      protection.addEditor(me);
      if (protection.canDomainEdit()) {
        protection.setDomainEdit(false);
      }
      result.protected.push(name);
    } catch (e) {
      result.errors.push(name + ': ' + (e.message || String(e)));
      result.ok = false;
    }
  });

  Logger.log('protectSensitiveSheets: ' + JSON.stringify(result, null, 2));
  return result;
}
