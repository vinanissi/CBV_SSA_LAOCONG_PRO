/**
 * PHASE_RF_02 — Permission Runtime v1
 *
 * Target roles: ADMIN, MANAGER, STAFF, FINANCE, HO_SO, VIEW_ONLY
 * Maps legacy USER_DIRECTORY roles without changing production ENUM.
 * Safe fallback: VIEW_ONLY when unknown.
 */

var CBV_PERMISSION_PHASE_ID = 'PHASE_RF_02_PERMISSION_RUNTIME_V1';
var CBV_PERMISSION_CONTRACT_VERSION = 'CBV_PERMISSION_V1';

var CBV_PERMISSION_TARGET_ROLES = ['ADMIN', 'MANAGER', 'STAFF', 'FINANCE', 'HO_SO', 'VIEW_ONLY'];

var CBV_PERMISSION_LEGACY_ROLE_MAP = {
  ADMIN: 'ADMIN',
  OPERATOR: 'STAFF',
  ACCOUNTANT: 'FINANCE',
  VIEWER: 'VIEW_ONLY'
};

var CBV_PERMISSION_ACTIONS = {
  WORKBOARD_ACCESS: 'WORKBOARD_ACCESS',
  TASK_VIEW: 'TASK_VIEW',
  TASK_LIST: 'TASK_LIST',
  TASK_DETAIL: 'TASK_DETAIL',
  TASK_CREATE: 'TASK_CREATE',
  TASK_ASSIGN: 'TASK_ASSIGN',
  TASK_STATUS_UPDATE: 'TASK_STATUS_UPDATE',
  SEARCH_RUN: 'SEARCH_RUN',
  NOTIFICATION_VIEW: 'NOTIFICATION_VIEW',
  FILE_VIEW: 'FILE_VIEW',
  FILE_UPLOAD_STUB: 'FILE_UPLOAD_STUB',
  COORDINATION_VIEW: 'COORDINATION_VIEW',
  COORDINATION_TEAM_VIEW: 'COORDINATION_TEAM_VIEW',
  COORDINATION_ASSIGN: 'COORDINATION_ASSIGN',
  OBSERVATION_VIEW: 'OBSERVATION_VIEW',
  OBSERVATION_AUDIT_VIEW: 'OBSERVATION_AUDIT_VIEW',
  OBSERVATION_ALERT_VIEW: 'OBSERVATION_ALERT_VIEW',
  TASK_SEARCH: 'TASK_SEARCH',
  TASK_TIMELINE_VIEW: 'TASK_TIMELINE_VIEW',
  TASK_FILE_VIEW: 'TASK_FILE_VIEW',
  FINANCE_VIEW: 'FINANCE_VIEW',
  FINANCE_SEARCH: 'FINANCE_SEARCH',
  FINANCE_CONFIRM_PAYMENT: 'FINANCE_CONFIRM_PAYMENT',
  FINANCE_FILE_VIEW: 'FINANCE_FILE_VIEW',
  HO_SO_VIEW: 'HO_SO_VIEW',
  HO_SO_SEARCH: 'HO_SO_SEARCH',
  HO_SO_FILE_VIEW: 'HO_SO_FILE_VIEW',
  HO_SO_APPROVAL: 'HO_SO_APPROVAL',
  PLUGIN_VIEW: 'PLUGIN_VIEW',
  PLUGIN_ADMIN: 'PLUGIN_ADMIN',
  PLUGIN_OBSERVATION_VIEW: 'PLUGIN_OBSERVATION_VIEW'
};

var CBV_PERMISSION_ROLE_MATRIX = {
  ADMIN: {
    WORKBOARD_ACCESS: true,
    TASK_VIEW: true,
    TASK_LIST: true,
    TASK_DETAIL: true,
    TASK_CREATE: true,
    TASK_ASSIGN: true,
    TASK_STATUS_UPDATE: true,
    SEARCH_RUN: true,
    NOTIFICATION_VIEW: true,
    FILE_VIEW: true,
    FILE_UPLOAD_STUB: true,
    COORDINATION_VIEW: true,
    COORDINATION_TEAM_VIEW: true,
    COORDINATION_ASSIGN: true,
    OBSERVATION_VIEW: true,
    OBSERVATION_AUDIT_VIEW: true,
    OBSERVATION_ALERT_VIEW: true,
    TASK_SEARCH: true,
    TASK_TIMELINE_VIEW: true,
    TASK_FILE_VIEW: true,
    FINANCE_VIEW: true,
    FINANCE_SEARCH: true,
    FINANCE_CONFIRM_PAYMENT: true,
    FINANCE_FILE_VIEW: true,
    HO_SO_VIEW: true,
    HO_SO_SEARCH: true,
    HO_SO_FILE_VIEW: true,
    HO_SO_APPROVAL: true,
    PLUGIN_VIEW: true,
    PLUGIN_ADMIN: true,
    PLUGIN_OBSERVATION_VIEW: true
  },
  MANAGER: {
    WORKBOARD_ACCESS: true,
    TASK_VIEW: true,
    TASK_LIST: true,
    TASK_DETAIL: true,
    TASK_CREATE: true,
    TASK_ASSIGN: true,
    TASK_STATUS_UPDATE: true,
    SEARCH_RUN: true,
    NOTIFICATION_VIEW: true,
    FILE_VIEW: true,
    FILE_UPLOAD_STUB: true,
    COORDINATION_VIEW: true,
    COORDINATION_TEAM_VIEW: true,
    COORDINATION_ASSIGN: true,
    OBSERVATION_VIEW: true,
    OBSERVATION_AUDIT_VIEW: true,
    OBSERVATION_ALERT_VIEW: true,
    TASK_SEARCH: true,
    TASK_TIMELINE_VIEW: true,
    TASK_FILE_VIEW: true,
    FINANCE_VIEW: true,
    FINANCE_SEARCH: true,
    FINANCE_CONFIRM_PAYMENT: true,
    FINANCE_FILE_VIEW: true,
    HO_SO_VIEW: true,
    HO_SO_SEARCH: true,
    HO_SO_FILE_VIEW: true,
    HO_SO_APPROVAL: true,
    PLUGIN_VIEW: true,
    PLUGIN_ADMIN: false,
    PLUGIN_OBSERVATION_VIEW: true
  },
  STAFF: {
    WORKBOARD_ACCESS: true,
    TASK_VIEW: true,
    TASK_LIST: true,
    TASK_DETAIL: true,
    TASK_CREATE: true,
    TASK_ASSIGN: false,
    TASK_STATUS_UPDATE: true,
    SEARCH_RUN: true,
    NOTIFICATION_VIEW: true,
    FILE_VIEW: true,
    FILE_UPLOAD_STUB: true,
    COORDINATION_VIEW: true,
    COORDINATION_TEAM_VIEW: false,
    COORDINATION_ASSIGN: false,
    OBSERVATION_VIEW: true,
    OBSERVATION_AUDIT_VIEW: false,
    OBSERVATION_ALERT_VIEW: true,
    TASK_SEARCH: true,
    TASK_TIMELINE_VIEW: true,
    TASK_FILE_VIEW: true,
    FINANCE_VIEW: false,
    FINANCE_SEARCH: false,
    FINANCE_CONFIRM_PAYMENT: false,
    FINANCE_FILE_VIEW: false,
    HO_SO_VIEW: false,
    HO_SO_SEARCH: false,
    HO_SO_FILE_VIEW: false,
    HO_SO_APPROVAL: false,
    PLUGIN_VIEW: true,
    PLUGIN_ADMIN: false,
    PLUGIN_OBSERVATION_VIEW: false
  },
  FINANCE: {
    WORKBOARD_ACCESS: true,
    TASK_VIEW: true,
    TASK_LIST: true,
    TASK_DETAIL: true,
    TASK_CREATE: false,
    TASK_ASSIGN: false,
    TASK_STATUS_UPDATE: false,
    SEARCH_RUN: true,
    NOTIFICATION_VIEW: true,
    FILE_VIEW: true,
    FILE_UPLOAD_STUB: false,
    COORDINATION_VIEW: true,
    COORDINATION_TEAM_VIEW: false,
    COORDINATION_ASSIGN: false,
    OBSERVATION_VIEW: true,
    OBSERVATION_AUDIT_VIEW: false,
    OBSERVATION_ALERT_VIEW: true,
    TASK_SEARCH: true,
    TASK_TIMELINE_VIEW: true,
    TASK_FILE_VIEW: true,
    FINANCE_VIEW: true,
    FINANCE_SEARCH: true,
    FINANCE_CONFIRM_PAYMENT: true,
    FINANCE_FILE_VIEW: true,
    HO_SO_VIEW: false,
    HO_SO_SEARCH: false,
    HO_SO_FILE_VIEW: false,
    HO_SO_APPROVAL: false,
    PLUGIN_VIEW: true,
    PLUGIN_ADMIN: false,
    PLUGIN_OBSERVATION_VIEW: true
  },
  HO_SO: {
    WORKBOARD_ACCESS: true,
    TASK_VIEW: true,
    TASK_LIST: true,
    TASK_DETAIL: true,
    TASK_CREATE: true,
    TASK_ASSIGN: false,
    TASK_STATUS_UPDATE: true,
    SEARCH_RUN: true,
    NOTIFICATION_VIEW: true,
    FILE_VIEW: true,
    FILE_UPLOAD_STUB: true,
    COORDINATION_VIEW: true,
    COORDINATION_TEAM_VIEW: false,
    COORDINATION_ASSIGN: false,
    OBSERVATION_VIEW: true,
    OBSERVATION_AUDIT_VIEW: false,
    OBSERVATION_ALERT_VIEW: true,
    TASK_SEARCH: true,
    TASK_TIMELINE_VIEW: true,
    TASK_FILE_VIEW: true,
    FINANCE_VIEW: false,
    FINANCE_SEARCH: false,
    FINANCE_CONFIRM_PAYMENT: false,
    FINANCE_FILE_VIEW: false,
    HO_SO_VIEW: true,
    HO_SO_SEARCH: true,
    HO_SO_FILE_VIEW: true,
    HO_SO_APPROVAL: true,
    PLUGIN_VIEW: true,
    PLUGIN_ADMIN: false,
    PLUGIN_OBSERVATION_VIEW: true
  },
  VIEW_ONLY: {
    WORKBOARD_ACCESS: true,
    TASK_VIEW: true,
    TASK_LIST: true,
    TASK_DETAIL: true,
    TASK_CREATE: false,
    TASK_ASSIGN: false,
    TASK_STATUS_UPDATE: false,
    SEARCH_RUN: true,
    NOTIFICATION_VIEW: true,
    FILE_VIEW: true,
    FILE_UPLOAD_STUB: false,
    COORDINATION_VIEW: true,
    COORDINATION_TEAM_VIEW: false,
    COORDINATION_ASSIGN: false,
    OBSERVATION_VIEW: true,
    OBSERVATION_AUDIT_VIEW: false,
    OBSERVATION_ALERT_VIEW: true,
    TASK_SEARCH: true,
    TASK_TIMELINE_VIEW: true,
    TASK_FILE_VIEW: true,
    FINANCE_VIEW: true,
    FINANCE_SEARCH: true,
    FINANCE_CONFIRM_PAYMENT: false,
    FINANCE_FILE_VIEW: true,
    HO_SO_VIEW: true,
    HO_SO_SEARCH: true,
    HO_SO_FILE_VIEW: true,
    HO_SO_APPROVAL: false,
    PLUGIN_VIEW: true,
    PLUGIN_ADMIN: false,
    PLUGIN_OBSERVATION_VIEW: true
  }
};

function CBV_Permission__email_() {
  try {
    if (typeof Session !== 'undefined' && Session.getActiveUser) {
      return String(Session.getActiveUser().getEmail() || '').trim();
    }
  } catch (e) { /* anonymous / auth off */ }
  return '';
}

function CBV_Permission_resolveTargetRole(legacyRole) {
  var lr = String(legacyRole || '').trim().toUpperCase();
  if (!lr) return 'VIEW_ONLY';
  if (CBV_PERMISSION_TARGET_ROLES.indexOf(lr) >= 0) return lr;
  if (CBV_PERMISSION_LEGACY_ROLE_MAP[lr]) return CBV_PERMISSION_LEGACY_ROLE_MAP[lr];
  return 'VIEW_ONLY';
}

/**
 * @returns {Object} userContext
 */
function CBV_Permission_getCurrentUserContext() {
  var email = CBV_Permission__email_();
  var userId = null;
  var legacyRole = '';
  var displayName = '';
  var warnings = [];

  if (email && typeof mapCurrentUserEmailToInternalId === 'function') {
    try {
      userId = mapCurrentUserEmailToInternalId();
    } catch (e0) {
      warnings.push('mapCurrentUserEmailToInternalId: ' + (e0 && e0.message ? e0.message : String(e0)));
    }
  }
  if (userId && typeof getUserRole === 'function') {
    legacyRole = getUserRole(userId) || '';
  }
  if (!legacyRole && email) {
    try {
      if (typeof assertAdminAuthority === 'function') {
        assertAdminAuthority();
        legacyRole = 'ADMIN';
      }
    } catch (eAdmin) {
      legacyRole = legacyRole || '';
    }
  }
  if (userId && typeof getUserDisplay === 'function') {
    displayName = getUserDisplay(userId) || '';
  }
  if (!displayName && email) displayName = email.split('@')[0];

  var role = CBV_Permission_resolveTargetRole(legacyRole);
  if (!email) warnings.push('NO_ACTIVE_USER_EMAIL — fallback VIEW_ONLY');

  return {
    ok: true,
    email: email,
    userId: userId,
    legacyRole: legacyRole,
    role: role,
    displayName: displayName,
    warnings: warnings,
    phase: CBV_PERMISSION_PHASE_ID,
    contractVersion: CBV_PERMISSION_CONTRACT_VERSION
  };
}

/**
 * @param {Object} userContext
 * @param {string} action
 * @param {Object} [resource]
 * @returns {boolean}
 */
function CBV_Permission_can(userContext, action, resource) {
  var ctx = userContext || CBV_Permission_getCurrentUserContext();
  var act = String(action || '').trim();
  var role = CBV_Permission_resolveTargetRole(ctx.role || ctx.legacyRole);
  var matrix = CBV_PERMISSION_ROLE_MATRIX[role] || CBV_PERMISSION_ROLE_MATRIX.VIEW_ONLY;
  if (!matrix[act]) return false;

  if (act === CBV_PERMISSION_ACTIONS.TASK_VIEW || act === CBV_PERMISSION_ACTIONS.TASK_DETAIL) {
    if (resource && resource.taskRow && typeof canUserSeeTask === 'function') {
      try {
        return canUserSeeTask(resource.taskRow, ctx.userId || ctx.email, ctx.legacyRole || role) === true;
      } catch (eVis) {
        return matrix[act] === true;
      }
    }
  }
  if (act === CBV_PERMISSION_ACTIONS.COORDINATION_ASSIGN) {
    return matrix[act] === true && CBV_Permission_can(ctx, CBV_PERMISSION_ACTIONS.TASK_ASSIGN, resource);
  }
  return matrix[act] === true;
}

/**
 * @param {Object} userContext
 * @param {Object[]} actions — [{ code, label, href?, disabledReason? }]
 * @returns {Object[]} visible actions with allowed flag
 */
function CBV_Permission_filterActions(userContext, actions) {
  var ctx = userContext || CBV_Permission_getCurrentUserContext();
  var list = actions || [];
  var out = [];
  for (var i = 0; i < list.length; i++) {
    var a = list[i] || {};
    var code = String(a.code || a.action || '').trim();
    var allowed = CBV_Permission_can(ctx, code, a.resource || null);
    if (allowed) {
      out.push({
        code: code,
        label: a.label || code,
        href: a.href || '',
        allowed: true,
        stub: a.stub === true
      });
    }
  }
  return out;
}

/**
 * Server-side gate — throws if not allowed.
 */
function CBV_Permission_assertCan(userContext, action, resource) {
  if (!CBV_Permission_can(userContext, action, resource)) {
    var ctx = userContext || CBV_Permission_getCurrentUserContext();
    throw new Error('Permission denied: ' + String(action) + ' for role ' + String(ctx.role || 'VIEW_ONLY'));
  }
}
