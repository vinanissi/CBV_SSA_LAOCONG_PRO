/**
 * CBV Core V2 — PermissionGuard V1 (ADMIN/DEV, TEST/MENU system fallback).
 * Dependencies: 00_CORE_UTILS.js, 00_CORE_CONFIG.js, 02_CBV_CORE_V2_SHEETS.js
 */

/**
 * @param {Object} command normalized
 * @returns {{ allowed: boolean, reason: string }}
 */
function cbvCoreV2PermissionGuard_(command) {
  var source = String(command.source || '').toUpperCase();
  var requestBy = String(command.requestBy || '').trim().toLowerCase();

  if (source === 'TEST' || source === 'MENU') {
    if (!requestBy || requestBy === 'system') {
      return { allowed: true, reason: 'SYSTEM_FALLBACK_TEST_MENU' };
    }
  }

  try {
    if (typeof isAdminUser === 'function' && isAdminUser()) {
      return { allowed: true, reason: 'ADMIN_WHITELIST' };
    }
  } catch (e) {
    /* ignore */
  }

  var email = '';
  try {
    email = String(cbvUser() || '').trim().toLowerCase();
  } catch (e2) {
    email = '';
  }

  if (!email || email === 'system') {
    if (source === 'TEST' || source === 'MENU') {
      return { allowed: true, reason: 'SYSTEM_FALLBACK_NO_USER' };
    }
    return { allowed: false, reason: 'NO_ACTOR_FOR_SOURCE' };
  }

  var sheetName = CBV_CONFIG && CBV_CONFIG.SHEETS ? CBV_CONFIG.SHEETS.USER_DIRECTORY : 'USER_DIRECTORY';
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    if (source === 'TEST' || source === 'MENU') {
      return { allowed: true, reason: 'USER_DIRECTORY_MISSING_FALLBACK_TEST_MENU' };
    }
    return { allowed: false, reason: 'USER_DIRECTORY_NOT_FOUND' };
  }

  var map = cbvCoreV2ReadHeaderMap_(sheet);
  var emailCol = map['EMAIL'];
  var roleCol = map['ROLE'];
  if (!emailCol || !roleCol) {
    if (source === 'TEST' || source === 'MENU') {
      return { allowed: true, reason: 'USER_DIRECTORY_SCHEMA_INCOMPLETE_FALLBACK' };
    }
    return { allowed: false, reason: 'USER_DIRECTORY_MISSING_COLUMNS' };
  }

  var last = sheet.getLastRow();
  if (last < 2) {
    if (source === 'TEST' || source === 'MENU') {
      return { allowed: true, reason: 'USER_DIRECTORY_EMPTY_FALLBACK' };
    }
    return { allowed: false, reason: 'USER_NOT_IN_DIRECTORY' };
  }

  var emails = sheet.getRange(2, emailCol, last, emailCol).getValues();
  var roles = sheet.getRange(2, roleCol, last, roleCol).getValues();
  var i;
  for (i = 0; i < emails.length; i++) {
    var em = String(emails[i][0] || '').trim().toLowerCase();
    if (em === email) {
      var role = String(roles[i][0] || '').trim().toUpperCase();
      if (role === 'ADMIN' || role === 'DEV') {
        return { allowed: true, reason: 'ROLE_' + role };
      }
      return { allowed: false, reason: 'ROLE_NOT_PRIVILEGED:' + role };
    }
  }

  if (source === 'TEST' || source === 'MENU') {
    return { allowed: true, reason: 'USER_NOT_LISTED_FALLBACK_TEST_MENU' };
  }
  return { allowed: false, reason: 'USER_NOT_IN_DIRECTORY' };
}
