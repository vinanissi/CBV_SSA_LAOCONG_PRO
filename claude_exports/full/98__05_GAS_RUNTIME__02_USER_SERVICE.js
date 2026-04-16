/**
 * CBV User Service - User identity, lookup, and validation.
 * Users live in USER_DIRECTORY (dedicated operational user layer).
 * Dependencies: 00_CORE_CONFIG, 00_CORE_UTILS
 */

var _userCache = null;

var CBV_USER_ROLES = ['ADMIN', 'OPERATOR', 'ACCOUNTANT', 'VIEWER'];

/**
 * Loads user rows from USER_DIRECTORY. Excludes deleted unless includeDeleted=true.
 * @param {boolean} includeDeleted - If true, include IS_DELETED rows (for uniqueness validation)
 * @returns {Object[]} [{ id, code, name, email, role, displayText, status }]
 */
function _loadUserRows(includeDeleted) {
  var sheet = SpreadsheetApp.getActive().getSheetByName(CBV_CONFIG.SHEETS.USER_DIRECTORY);
  if (!sheet || sheet.getLastRow() < 2) return [];
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var idIdx = headers.indexOf('ID');
  var codeIdx = headers.indexOf('USER_CODE');
  var nameIdx = headers.indexOf('FULL_NAME');
  var displayIdx = headers.indexOf('DISPLAY_NAME');
  var emailIdx = headers.indexOf('EMAIL');
  var roleIdx = headers.indexOf('ROLE');
  var statusIdx = headers.indexOf('STATUS');
  var deletedIdx = headers.indexOf('IS_DELETED');
  if (idIdx === -1 || codeIdx === -1 || statusIdx === -1) return [];
  var useCache = !includeDeleted && _userCache;
  if (useCache) return _userCache;
  var rows = sheet.getRange(2, 1, sheet.getLastRow(), headers.length).getValues();
  var users = [];
  rows.forEach(function(row) {
    var deleted = deletedIdx >= 0 && (row[deletedIdx] === true || String(row[deletedIdx]) === 'true');
    if (deleted && !includeDeleted) return;
    var status = String(row[statusIdx] || '').trim();
    users.push({
      id: String(row[idIdx] || '').trim(),
      code: String(row[codeIdx] || '').trim(),
      name: nameIdx >= 0 ? String(row[nameIdx] || '').trim() : '',
      email: emailIdx >= 0 ? String(row[emailIdx] || '').trim().toLowerCase() : '',
      role: roleIdx >= 0 ? String(row[roleIdx] || '').trim() : '',
      displayText: displayIdx >= 0 ? String(row[displayIdx] || '').trim() : '',
      status: status
    });
  });
  if (!includeDeleted) _userCache = users;
  return users;
}

/**
 * Clears user cache. Call after USER_DIRECTORY edits.
 */
function clearUserCache() {
  _userCache = null;
}

/**
 * @returns {Object[]} All non-deleted users (any status)
 */
function getUsers() {
  return _loadUserRows(false);
}

/**
 * Returns all users including soft-deleted. Use for uniqueness validation only.
 * @returns {Object[]} All users (any status, including deleted)
 */
function getUsersIncludingDeleted() {
  return _loadUserRows(true);
}

/**
 * @returns {Object[]} Active users (STATUS=ACTIVE)
 */
function getActiveUsers() {
  return _loadUserRows(false).filter(function(u) { return u.status === 'ACTIVE'; });
}

/**
 * @param {string} email - User email (case-insensitive)
 * @returns {Object|null} User row or null
 */
function getUserByEmail(email) {
  if (!email) return null;
  var e = String(email).trim().toLowerCase();
  var users = _loadUserRows(false);
  return users.find(function(u) { return u.email === e; }) || null;
}

/**
 * @param {string} userId - USER_DIRECTORY.ID, USER_CODE, or email (for legacy compat)
 * @returns {Object|null} User row or null
 */
function getUserById(userId) {
  if (!userId) return null;
  var id = String(userId).trim();
  var users = _loadUserRows(false);
  var byId = users.find(function(u) { return u.id === id || u.code === id; });
  if (byId) return byId;
  return getUserByEmail(id) || null;
}

/**
 * @param {string} userId - USER_DIRECTORY.ID or USER_CODE
 * @returns {string} Display name or empty
 */
function getUserDisplay(userId) {
  var u = getUserById(userId);
  if (!u) return '';
  return (u.displayText || u.name || u.code || '').trim();
}

/**
 * @param {string} userId - USER_DIRECTORY.ID or USER_CODE
 * @returns {string} Role (ADMIN|OPERATOR|VIEWER) or empty
 */
function getUserRole(userId) {
  var u = getUserById(userId);
  return u ? u.role : '';
}

/**
 * Asserts userId is a valid user (exists, not deleted). Any status allowed.
 * Use for validating refs in historical data.
 * @param {string} userId
 * @param {string} fieldName - for error message
 */
function assertValidUserId(userId, fieldName) {
  var u = getUserById(userId);
  if (!u) throw new Error('Invalid ' + (fieldName || 'user') + ': ' + userId);
}

/**
 * Asserts userId is a valid ACTIVE user (exists, not deleted, STATUS=ACTIVE).
 * Use for new task assignment, finance confirmation, dropdown selection.
 * @param {string} userId
 * @param {string} fieldName - for error message
 */
function assertActiveUserId(userId, fieldName) {
  var u = getUserById(userId);
  if (!u) throw new Error('Invalid ' + (fieldName || 'user') + ': ' + userId);
  if (u.status !== 'ACTIVE') throw new Error('User is not active: ' + userId);
}

/**
 * Asserts user has one of the required roles. Throws if not.
 * @param {string} userId
 * @param {string|string[]} requiredRoleOrList - e.g. 'ADMIN' or ['ADMIN','OPERATOR']
 */
function assertRoleAllowed(userId, requiredRoleOrList) {
  var role = getUserRole(userId);
  var allowed = Array.isArray(requiredRoleOrList) ? requiredRoleOrList : [requiredRoleOrList];
  if (allowed.indexOf(role) === -1) {
    throw new Error('Role not allowed. Required: ' + allowed.join(' or ') + ', got: ' + role);
  }
}

/**
 * Builds a map of user ID -> display string for dropdowns and ref display.
 * Uses DISPLAY_NAME or FULL_NAME (if DISPLAY_NAME empty) or USER_CODE.
 * Only includes non-deleted users.
 * @returns {Object} { id: displayString }
 */
function buildUserDisplayMap() {
  var users = getUsers();
  var map = {};
  users.forEach(function(u) {
    var display = (u.displayText || u.name || u.code || '').trim();
    if (u.id && display) map[u.id] = display;
  });
  return map;
}

/**
 * Maps current signed-in email to internal user ID (USER_DIRECTORY.ID).
 * Use for defaulting REPORTER_ID when creating tasks.
 * @returns {string|null} User ID or null if not found
 */
function mapCurrentUserEmailToInternalId() {
  var email = cbvUser();
  if (!email || String(email).toLowerCase() === 'system') return null;
  var u = getUserByEmail(email);
  return u ? u.id : null;
}
