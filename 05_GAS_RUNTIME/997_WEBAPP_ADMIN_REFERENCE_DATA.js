/**
 * PHASE_93 — WebApp Admin Reference Viewer / Settings Read-First — Data
 *
 * Operational Governance Layer (read-first).
 *
 * Public functions:
 *   - CbvWebAppAdminRef_getGovernanceSummary()
 *   - CbvWebAppAdminRef_getEnumSummary(options)
 *   - CbvWebAppAdminRef_getUserRoleSummary(options)
 *   - CbvWebAppAdminRef_getFeatureFlagSummary(options)
 *   - CbvWebAppAdminRef_getSystemRegistrySummary(options)
 *   - CbvWebAppAdminRef_getUiContractSummary(options)
 *   - CbvWebAppAdminRef_getRouteRegistrySummary()
 *   - CbvWebAppAdminRef_validate()
 *
 * Read-first only. No create / update / delete / toggle / assign / escalate /
 * setRole / setPermission / enable / disable. Secrets / tokens / API keys /
 * private keys / passwords are never rendered — only column name + warning.
 */

var CBV_WEBAPP_ADMIN_REF_PHASE_ID = 'PHASE_93_WEBAPP_ADMIN_REFERENCE_VIEWER_SETTINGS_READ_FIRST';
var CBV_WEBAPP_ADMIN_REF_CONTRACT_VERSION = 'CBV_TCS_V1';

/**
 * Required reference sheets. Each entry is probed; if absent it surfaces as a
 * warning row in the governance summary — never an uncontrolled throw, and
 * never auto-created.
 */
var CBV_WEBAPP_ADMIN_REF_REQUIRED_SHEETS = [
  { code: 'ENUM_DICTIONARY', label: 'Enum Dictionary' },
  { code: 'USER_DIRECTORY', label: 'User Directory' },
  { code: 'MASTER_CODE', label: 'Master Code' },
  { code: 'DON_VI', label: 'Đơn vị / Organisation' },
  { code: 'TEAM_DIRECTORY', label: 'Team Directory' },
  { code: 'ROLE_PERMISSION_MATRIX', label: 'Role / Permission Matrix' },
  { code: 'FEATURE_FLAG', label: 'Feature Flag' },
  { code: 'SYSTEM_REGISTRY', label: 'System Registry' },
  { code: 'CBV_UI_CONTRACT', label: 'UI Contract Registry' }
];

/**
 * Column-name patterns that must never have their value surfaced. We render
 * only the column name + a warning that the value is masked.
 */
var CBV_WEBAPP_ADMIN_REF_SECRET_PATTERNS = [
  /SECRET/i, /TOKEN/i, /APIKEY/i, /API_KEY/i, /PRIVATE_KEY/i,
  /PASSWORD/i, /PASS_HASH/i, /CLIENT_SECRET/i, /WEBHOOK_SECRET/i,
  /BEARER/i, /^OAUTH$/i, /OAUTH_TOKEN/i
];

/* ------------------------------------------------------------------ */
/* Envelope + safe helpers                                             */
/* ------------------------------------------------------------------ */

function CbvWebAppAdminRef__out_(ok, data, warnings, errors) {
  return {
    ok: ok === true,
    data: data || null,
    warnings: warnings || [],
    errors: errors || [],
    checkedAt: (typeof CbvWebAppWorkspace__now_ === 'function') ? CbvWebAppWorkspace__now_() : new Date()
  };
}

function CbvWebAppAdminRef__sheetByName_(name) {
  try {
    if (typeof SpreadsheetApp === 'undefined') {
      return { ok: false, sheet: null, warning: 'SpreadsheetApp unavailable (non-GAS context).' };
    }
    var ss = SpreadsheetApp.getActive();
    var sh = ss ? ss.getSheetByName(String(name || '').trim()) : null;
    if (!sh) return { ok: false, sheet: null, warning: 'Missing sheet: ' + name };
    return { ok: true, sheet: sh, warning: '' };
  } catch (e) {
    return { ok: false, sheet: null, warning: 'Sheet access error: ' + (e && e.message ? e.message : String(e)) };
  }
}

function CbvWebAppAdminRef__rowCount_(sh) {
  try {
    var lr = sh.getLastRow();
    return lr > 1 ? lr - 1 : 0;
  } catch (e) {
    return 0;
  }
}

function CbvWebAppAdminRef__headers_(sh) {
  try {
    var lc = sh.getLastColumn();
    if (lc < 1) return [];
    return sh.getRange(1, 1, 1, lc).getValues()[0].map(function(h) { return String(h == null ? '' : h).trim(); });
  } catch (e) {
    return [];
  }
}

function CbvWebAppAdminRef__readRows_(sh, limit) {
  try {
    var lr = sh.getLastRow();
    if (lr < 2) return [];
    var lc = sh.getLastColumn();
    var headers = CbvWebAppAdminRef__headers_(sh);
    var n = Math.min(lr - 1, limit && limit > 0 ? limit : (lr - 1));
    var values = sh.getRange(2, 1, n, lc).getValues();
    var rows = [];
    for (var i = 0; i < values.length; i++) {
      var rec = {};
      for (var j = 0; j < headers.length; j++) rec[headers[j]] = values[i][j];
      rows.push(rec);
    }
    return rows;
  } catch (e) {
    return [];
  }
}

function CbvWebAppAdminRef__isSecretColumn_(name) {
  var s = String(name || '');
  for (var i = 0; i < CBV_WEBAPP_ADMIN_REF_SECRET_PATTERNS.length; i++) {
    if (CBV_WEBAPP_ADMIN_REF_SECRET_PATTERNS[i].test(s)) return true;
  }
  return false;
}

function CbvWebAppAdminRef__maskValue_() {
  return '[masked]';
}

function CbvWebAppAdminRef__maskEmail_(v) {
  var s = String(v == null ? '' : v).trim();
  if (!s) return '';
  var at = s.indexOf('@');
  if (at <= 0) return s;
  var local = s.substring(0, at);
  var dom = s.substring(at);
  if (local.length <= 2) return local.charAt(0) + '*' + dom;
  return local.charAt(0) + '***' + local.charAt(local.length - 1) + dom;
}

function CbvWebAppAdminRef__truthy_(v) {
  if (v == null) return false;
  if (typeof v === 'boolean') return v;
  var s = String(v).trim().toLowerCase();
  return s === 'true' || s === 'yes' || s === '1' || s === 'y' || s === 'on' || s === 'enabled';
}

function CbvWebAppAdminRef__scanRowForSecrets_(headers, row) {
  var flagged = [];
  for (var i = 0; i < headers.length; i++) {
    if (CbvWebAppAdminRef__isSecretColumn_(headers[i])) flagged.push(headers[i]);
  }
  return flagged;
}

/* ------------------------------------------------------------------ */
/* Governance summary                                                  */
/* ------------------------------------------------------------------ */

function CbvWebAppAdminRef_getGovernanceSummary() {
  var warnings = [];
  var errors = [];
  var sheets = [];
  var totals = {
    enums: 0, users: 0, roles: 0, teams: 0,
    featureFlags: 0, systems: 0, uiContracts: 0, routes: 0
  };

  CBV_WEBAPP_ADMIN_REF_REQUIRED_SHEETS.forEach(function(entry) {
    var got = CbvWebAppAdminRef__sheetByName_(entry.code);
    var rowCount = 0;
    if (got.ok) rowCount = CbvWebAppAdminRef__rowCount_(got.sheet);
    var severity = got.ok ? 'OK' : 'WARNING';
    var note = got.ok ? '' : got.warning;
    if (!got.ok) warnings.push('Reference sheet missing: ' + entry.code);

    sheets.push({
      code: entry.code,
      name: entry.label,
      exists: got.ok,
      rowCount: rowCount,
      severity: severity,
      note: note
    });

    if (entry.code === 'ENUM_DICTIONARY') totals.enums = rowCount;
    if (entry.code === 'USER_DIRECTORY') totals.users = rowCount;
    if (entry.code === 'TEAM_DIRECTORY') totals.teams = rowCount;
    if (entry.code === 'ROLE_PERMISSION_MATRIX') totals.roles = rowCount;
    if (entry.code === 'FEATURE_FLAG') totals.featureFlags = rowCount;
    if (entry.code === 'SYSTEM_REGISTRY') totals.systems = rowCount;
    if (entry.code === 'CBV_UI_CONTRACT') totals.uiContracts = rowCount;
  });

  // Route registry (live, no sheet)
  try {
    if (typeof CbvWebAppWorkspace_routeRegistry === 'function') {
      var reg = CbvWebAppWorkspace_routeRegistry() || [];
      totals.routes = reg.length;
    } else {
      warnings.push('CbvWebAppWorkspace_routeRegistry not available.');
    }
  } catch (eR) {
    warnings.push('Route registry error: ' + (eR && eR.message ? eR.message : String(eR)));
  }

  var missingCount = sheets.filter(function(s) { return !s.exists; }).length;
  var severity = missingCount === 0 ? 'OK' : 'WARNING';
  var status = missingCount === 0 ? 'GO' : 'GO_WITH_WARNINGS';

  return CbvWebAppAdminRef__out_(true, {
    status: status,
    severity: severity,
    sheets: sheets,
    totals: totals,
    warnings: warnings,
    errors: errors
  }, warnings, errors);
}

/* ------------------------------------------------------------------ */
/* Enum summary                                                        */
/* ------------------------------------------------------------------ */

function CbvWebAppAdminRef_getEnumSummary(options) {
  var warnings = [];
  var errors = [];
  var opts = options || {};
  var sampleSize = opts.sampleSize && opts.sampleSize > 0 ? opts.sampleSize : 5;

  var got = CbvWebAppAdminRef__sheetByName_('ENUM_DICTIONARY');
  if (!got.ok) {
    warnings.push(got.warning);
    return CbvWebAppAdminRef__out_(true, { count: 0, groups: [] }, warnings, errors);
  }

  var rows = CbvWebAppAdminRef__readRows_(got.sheet, 5000);
  var groupsMap = {};
  var totalActive = 0;

  rows.forEach(function(r) {
    var isActive = CbvWebAppAdminRef__truthy_(r.IS_ACTIVE);
    var isDeleted = CbvWebAppAdminRef__truthy_(r.IS_DELETED);
    if (!isActive || isDeleted) return;
    var t = String(r.ENUM_GROUP || r.ENUM_CODE || '(ungrouped)').trim() || '(ungrouped)';
    if (!groupsMap[t]) groupsMap[t] = { enumType: t, count: 0, sampleValues: [] };
    groupsMap[t].count++;
    var v = String(r.ENUM_VALUE || r.ENUM_LABEL || r.DISPLAY_TEXT || '').trim();
    if (v && groupsMap[t].sampleValues.length < sampleSize) {
      groupsMap[t].sampleValues.push(v);
    }
    totalActive++;
  });

  var groups = Object.keys(groupsMap).map(function(k) { return groupsMap[k]; });
  groups.sort(function(a, b) { return b.count - a.count; });

  return CbvWebAppAdminRef__out_(true, { count: totalActive, groups: groups }, warnings, errors);
}

/* ------------------------------------------------------------------ */
/* User / role summary (masked)                                        */
/* ------------------------------------------------------------------ */

function CbvWebAppAdminRef_getUserRoleSummary(options) {
  var warnings = [];
  var errors = [];
  var opts = options || {};
  var sampleSize = opts.sampleSize && opts.sampleSize > 0 ? opts.sampleSize : 25;

  var users = [];
  var roles = [];
  var usersCount = 0;
  var teamsCount = 0;
  var rolesCount = 0;

  var uGot = CbvWebAppAdminRef__sheetByName_('USER_DIRECTORY');
  if (!uGot.ok) {
    warnings.push(uGot.warning);
  } else {
    var uRows = CbvWebAppAdminRef__readRows_(uGot.sheet, 2000);
    usersCount = uRows.length;
    var n = Math.min(uRows.length, sampleSize);
    for (var i = 0; i < n; i++) {
      var r = uRows[i];
      users.push({
        email: CbvWebAppAdminRef__maskEmail_(r.EMAIL || r.USER_EMAIL || ''),
        displayName: String(r.DISPLAY_NAME || r.FULL_NAME || r.USER_NAME || '').trim(),
        role: String(r.ROLE_CODE || r.ROLE || '').trim(),
        teamCode: String(r.TEAM_CODE || r.TEAM_ID || '').trim(),
        status: String(r.USER_STATUS || r.STATUS || '').trim()
      });
    }
  }

  var tGot = CbvWebAppAdminRef__sheetByName_('TEAM_DIRECTORY');
  if (!tGot.ok) {
    warnings.push(tGot.warning);
  } else {
    teamsCount = CbvWebAppAdminRef__rowCount_(tGot.sheet);
  }

  var rGot = CbvWebAppAdminRef__sheetByName_('ROLE_PERMISSION_MATRIX');
  if (!rGot.ok) {
    warnings.push(rGot.warning);
  } else {
    var rRows = CbvWebAppAdminRef__readRows_(rGot.sheet, 1000);
    var roleMap = {};
    rRows.forEach(function(rp) {
      var rc = String(rp.ROLE_CODE || '').trim();
      if (!rc) return;
      if (!roleMap[rc]) {
        roleMap[rc] = {
          roleCode: rc,
          modules: {},
          permissions: 0
        };
      }
      roleMap[rc].permissions++;
      var mod = String(rp.MODULE_CODE || '').trim();
      if (mod) roleMap[rc].modules[mod] = (roleMap[rc].modules[mod] || 0) + 1;
    });
    roles = Object.keys(roleMap).map(function(k) {
      var x = roleMap[k];
      return {
        roleCode: x.roleCode,
        permissions: x.permissions,
        modules: Object.keys(x.modules)
      };
    });
    rolesCount = roles.length;
  }

  return CbvWebAppAdminRef__out_(true, {
    usersCount: usersCount,
    teamsCount: teamsCount,
    rolesCount: rolesCount,
    users: users,
    roles: roles
  }, warnings, errors);
}

/* ------------------------------------------------------------------ */
/* Feature flag summary                                                */
/* ------------------------------------------------------------------ */

function CbvWebAppAdminRef_getFeatureFlagSummary(options) {
  var warnings = [];
  var errors = [];
  var opts = options || {};
  var sampleSize = opts.sampleSize && opts.sampleSize > 0 ? opts.sampleSize : 50;

  var got = CbvWebAppAdminRef__sheetByName_('FEATURE_FLAG');
  if (!got.ok) {
    warnings.push(got.warning);
    return CbvWebAppAdminRef__out_(true, { count: 0, enabledCount: 0, disabledCount: 0, flags: [] }, warnings, errors);
  }

  var rows = CbvWebAppAdminRef__readRows_(got.sheet, 2000);
  var flags = [];
  var enabledCount = 0;
  var disabledCount = 0;

  for (var i = 0; i < rows.length; i++) {
    var r = rows[i];
    if (CbvWebAppAdminRef__truthy_(r.IS_DELETED)) continue;
    var enabled = CbvWebAppAdminRef__truthy_(r.ENABLED);
    if (enabled) enabledCount++; else disabledCount++;
    if (flags.length < sampleSize) {
      flags.push({
        featureCode: String(r.FEATURE_CODE || '').trim(),
        enabled: enabled,
        owner: CbvWebAppAdminRef__maskEmail_(r.OWNER_USER_ID || ''),
        note: String(r.NOTE || '').trim()
      });
    }
  }

  return CbvWebAppAdminRef__out_(true, {
    count: enabledCount + disabledCount,
    enabledCount: enabledCount,
    disabledCount: disabledCount,
    flags: flags
  }, warnings, errors);
}

/* ------------------------------------------------------------------ */
/* System registry summary                                             */
/* ------------------------------------------------------------------ */

function CbvWebAppAdminRef_getSystemRegistrySummary(options) {
  var warnings = [];
  var errors = [];
  var opts = options || {};
  var sampleSize = opts.sampleSize && opts.sampleSize > 0 ? opts.sampleSize : 50;

  var got = CbvWebAppAdminRef__sheetByName_('SYSTEM_REGISTRY');
  if (!got.ok) {
    warnings.push(got.warning);
    return CbvWebAppAdminRef__out_(true, { count: 0, systems: [] }, warnings, errors);
  }

  var headers = CbvWebAppAdminRef__headers_(got.sheet);
  var hasSecretColumn = headers.some(CbvWebAppAdminRef__isSecretColumn_);
  if (hasSecretColumn) {
    warnings.push('SYSTEM_REGISTRY has columns matching secret patterns — values masked.');
  }

  var rows = CbvWebAppAdminRef__readRows_(got.sheet, 2000);
  var systems = [];
  var count = 0;
  for (var i = 0; i < rows.length; i++) {
    var r = rows[i];
    if (CbvWebAppAdminRef__truthy_(r.IS_DELETED)) continue;
    count++;
    if (systems.length < sampleSize) {
      systems.push({
        systemCode: String(r.REGISTRY_CODE || r.SYSTEM_CODE || '').trim(),
        moduleCode: String(r.MODULE_CODE || '').trim(),
        status: String(r.STATUS || '').trim(),
        owner: CbvWebAppAdminRef__maskEmail_(r.OWNER_USER_ID || ''),
        note: String(r.NOTE || '').trim()
      });
    }
  }

  return CbvWebAppAdminRef__out_(true, { count: count, systems: systems }, warnings, errors);
}

/* ------------------------------------------------------------------ */
/* UI contract summary                                                 */
/* ------------------------------------------------------------------ */

function CbvWebAppAdminRef_getUiContractSummary(options) {
  var warnings = [];
  var errors = [];
  var opts = options || {};
  var sampleSize = opts.sampleSize && opts.sampleSize > 0 ? opts.sampleSize : 50;

  var contracts = [];
  var byChannel = {};
  var byScreenType = {};
  var pilotReadyCount = 0;
  var count = 0;

  try {
    if (typeof CbvUiContract_getAll === 'function') {
      var all = CbvUiContract_getAll() || [];
      count = all.length;
      for (var i = 0; i < all.length; i++) {
        var r = all[i];
        var ch = String(r.CHANNEL || '').trim().toUpperCase() || 'UNKNOWN';
        var st = String(r.SCREEN_TYPE || '').trim().toUpperCase() || 'UNKNOWN';
        byChannel[ch] = (byChannel[ch] || 0) + 1;
        byScreenType[st] = (byScreenType[st] || 0) + 1;
        var pilot = CbvWebAppAdminRef__truthy_(r.IS_PILOT_READY) || CbvWebAppAdminRef__truthy_(r.PILOT_READY);
        if (pilot) pilotReadyCount++;
        if (contracts.length < sampleSize) {
          contracts.push({
            screenCode: String(r.SCREEN_CODE || '').trim(),
            screenName: String(r.SCREEN_NAME || '').trim(),
            channel: ch,
            screenType: st,
            moduleCode: String(r.MODULE_CODE || '').trim(),
            webAppRoute: String(r.WEBAPP_ROUTE || '').trim(),
            appSheetView: String(r.APPSHEET_VIEW || '').trim(),
            isPilotReady: pilot
          });
        }
      }
    } else {
      warnings.push('CbvUiContract_getAll not available — UI contract registry not loaded.');
    }
  } catch (eUC) {
    warnings.push('UI contract read error: ' + (eUC && eUC.message ? eUC.message : String(eUC)));
  }

  return CbvWebAppAdminRef__out_(true, {
    count: count,
    byChannel: byChannel,
    byScreenType: byScreenType,
    pilotReadyCount: pilotReadyCount,
    contracts: contracts
  }, warnings, errors);
}

/* ------------------------------------------------------------------ */
/* Route registry summary                                              */
/* ------------------------------------------------------------------ */

function CbvWebAppAdminRef_getRouteRegistrySummary() {
  var warnings = [];
  var errors = [];
  var routes = [];
  var byMode = {};
  var byPageType = {};
  var readFirstCount = 0;
  var pilotReadyCount = 0;
  var count = 0;

  try {
    var reg = null;
    if (typeof CbvWebAppWorkspace_getRouteRegistry === 'function') {
      var resp = CbvWebAppWorkspace_getRouteRegistry();
      if (resp && resp.ok && resp.data && resp.data.routes) reg = resp.data.routes;
    }
    if (!reg && typeof CbvWebAppWorkspace_routeRegistry === 'function') {
      reg = CbvWebAppWorkspace_routeRegistry();
    }
    if (!reg) {
      warnings.push('CbvWebAppWorkspace_routeRegistry not available.');
    } else {
      count = reg.length;
      reg.forEach(function(r) {
        var mode = String(r.mode || 'UNKNOWN');
        var pt = String(r.pageType || 'UNKNOWN');
        byMode[mode] = (byMode[mode] || 0) + 1;
        byPageType[pt] = (byPageType[pt] || 0) + 1;
        if (mode === 'READ_FIRST') readFirstCount++;
        if (r.isPilotReady === true) pilotReadyCount++;
        routes.push({
          route: String(r.route || ''),
          title: String(r.title || ''),
          pageType: pt,
          mode: mode,
          requiredRole: String(r.requiredRole || ''),
          screenCode: String(r.screenCode || ''),
          isEnabled: r.isEnabled !== false,
          isPilotReady: r.isPilotReady === true
        });
      });
    }
  } catch (eRR) {
    warnings.push('Route registry error: ' + (eRR && eRR.message ? eRR.message : String(eRR)));
  }

  return CbvWebAppAdminRef__out_(true, {
    count: count,
    readFirstCount: readFirstCount,
    pilotReadyCount: pilotReadyCount,
    byMode: byMode,
    byPageType: byPageType,
    routes: routes
  }, warnings, errors);
}

/* ------------------------------------------------------------------ */
/* Validate                                                            */
/* ------------------------------------------------------------------ */

function CbvWebAppAdminRef_validate() {
  var warnings = [];
  var errors = [];

  var detail = {
    functions: {
      governance: typeof CbvWebAppAdminRef_getGovernanceSummary === 'function',
      enums: typeof CbvWebAppAdminRef_getEnumSummary === 'function',
      userRole: typeof CbvWebAppAdminRef_getUserRoleSummary === 'function',
      featureFlag: typeof CbvWebAppAdminRef_getFeatureFlagSummary === 'function',
      systemRegistry: typeof CbvWebAppAdminRef_getSystemRegistrySummary === 'function',
      uiContract: typeof CbvWebAppAdminRef_getUiContractSummary === 'function',
      routeRegistry: typeof CbvWebAppAdminRef_getRouteRegistrySummary === 'function'
    },
    renderer: {
      referenceViewer: typeof CbvWebAppAdminRef_renderReferenceViewer === 'function'
    },
    sheets: {},
    noMutationExposed: true,
    mutationProbe: [],
    mutationAllowlist: [],
    secretColumns: [],
    secretColumnLeaked: false
  };

  // Function presence
  Object.keys(detail.functions).forEach(function(k) {
    if (!detail.functions[k]) errors.push('CbvWebAppAdminRef_get' + k + 'Summary not defined.');
  });
  if (!detail.renderer.referenceViewer) warnings.push('CbvWebAppAdminRef_renderReferenceViewer not loaded yet (warning during partial deploys).');

  // Sheet probes
  CBV_WEBAPP_ADMIN_REF_REQUIRED_SHEETS.forEach(function(entry) {
    var got = CbvWebAppAdminRef__sheetByName_(entry.code);
    detail.sheets[entry.code] = got.ok;
    if (!got.ok) warnings.push('Reference sheet missing: ' + entry.code);
    if (got.ok) {
      var headers = CbvWebAppAdminRef__headers_(got.sheet);
      headers.forEach(function(h) {
        if (CbvWebAppAdminRef__isSecretColumn_(h)) detail.secretColumns.push(entry.code + '.' + h);
      });
    }
  });
  if (detail.secretColumns.length > 0) {
    warnings.push('Secret-pattern columns detected (values are masked, never rendered): ' + detail.secretColumns.join(', '));
  }

  // ---------------------------------------------------------------------
  // Mutation-name probe (Phase 93-scoped). Same pattern as Phase 91.1 / 92.
  // ---------------------------------------------------------------------
  detail.mutationAllowlist = [
    'CbvWebAppAdminRef_getGovernanceSummary',
    'CbvWebAppAdminRef_getEnumSummary',
    'CbvWebAppAdminRef_getUserRoleSummary',
    'CbvWebAppAdminRef_getFeatureFlagSummary',
    'CbvWebAppAdminRef_getSystemRegistrySummary',
    'CbvWebAppAdminRef_getUiContractSummary',
    'CbvWebAppAdminRef_getRouteRegistrySummary',
    'CbvWebAppAdminRef_validate',
    'CbvWebAppAdminRef_renderReferenceViewer',
    'CbvWebAppAdminRef_renderGovernanceSummary_',
    'CbvWebAppAdminRef_renderEnumSummary_',
    'CbvWebAppAdminRef_renderUserRoleSummary_',
    'CbvWebAppAdminRef_renderFeatureFlagSummary_',
    'CbvWebAppAdminRef_renderSystemRegistrySummary_',
    'CbvWebAppAdminRef_renderUiContractSummary_',
    'CbvWebAppAdminRef_renderRouteRegistrySummary_',
    'CbvWebAppAdminRef_renderState_'
  ];
  var allowPatterns = [
    /State_?$/,
    /^CbvWebAppAdminRef__/,
    /^CbvWebAppAdminRef_TestConsole_/,
    /^CbvWebAppAdminRef_render/
  ];
  // Operational mutation verbs at the START of the action portion. Includes
  // governance-specific verbs (toggle, enable, disable, grant, revoke, ...).
  var verbRe = /^(set|update|create|delete|save|mutate|assign|escalate|resolve|complete|toggle|enable|disable|grant|revoke|provision|deprovision|edit|reset|rotate)[A-Z]/;

  function isMutationName(name) {
    if (typeof name !== 'string') return false;
    if (name.indexOf('CbvWebAppAdminRef_') !== 0) return false;
    if (detail.mutationAllowlist.indexOf(name) >= 0) return false;
    for (var i = 0; i < allowPatterns.length; i++) {
      if (allowPatterns[i].test(name)) return false;
    }
    var action = name.replace(/^CbvWebAppAdminRef_/, '').replace(/^_+/, '');
    return verbRe.test(action);
  }

  try {
    var globals = (typeof this !== 'undefined') ? this : {};
    var keys = Object.keys(globals || {});
    for (var k = 0; k < keys.length; k++) {
      var n = keys[k];
      if (isMutationName(n) && typeof globals[n] === 'function') {
        detail.noMutationExposed = false;
        detail.mutationProbe.push(n);
      }
    }
  } catch (eProbe) {
    warnings.push('Mutation probe skipped: ' + (eProbe && eProbe.message ? eProbe.message : String(eProbe)));
  }
  if (!detail.noMutationExposed) {
    errors.push('Phase 93 namespace exposes mutation-like functions: ' + detail.mutationProbe.join(', '));
  }

  var ok = errors.length === 0;
  return CbvWebAppAdminRef__out_(ok, detail, warnings, errors);
}
