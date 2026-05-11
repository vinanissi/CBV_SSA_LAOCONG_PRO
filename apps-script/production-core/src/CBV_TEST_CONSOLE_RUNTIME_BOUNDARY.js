/**
 * CBV Operational Verification — runtime boundary enforcement (Phase D).
 *
 * Manual-first: destructive / production-mutation paths require ScriptProperties unlock
 * documented in operator runbooks (never auto-bypass).
 */

var CBV_TEST_CONSOLE_PROP_DESTRUCTIVE_UNLOCK_ = 'CBV_TC_DESTRUCTIVE_UNLOCK';
var CBV_TEST_CONSOLE_PROP_PROD_MUTATION_UNLOCK_ = 'CBV_TC_PRODUCTION_MUTATION_UNLOCK';
var CBV_TEST_CONSOLE_PROP_ADMIN_TRACE_ = 'CBV_TC_ADMIN_TRACE_ID';

/**
 * @param {Object|null} suite registry row
 * @param {string} [traceIdHint] optional trace to match admin trace property
 * @returns {{
 *   allowed: boolean,
 *   reasons: string[],
 *   runtimeSafe: boolean,
 *   requiresUnlock: boolean,
 *   requiresAdminTrace: boolean
 * }}
 */
function CBV_TestConsole_enforceRuntimeBoundary_(suite, traceIdHint) {
  var reasons = [];
  var requiresUnlock = false;
  var requiresAdminTrace = false;

  if (!suite) {
    return {
      allowed: false,
      reasons: ['NO_SUITE'],
      runtimeSafe: false,
      requiresUnlock: false,
      requiresAdminTrace: false
    };
  }

  var props = PropertiesService.getScriptProperties();
  var du = '';
  var pu = '';
  var adminTrace = '';
  try {
    du = String(props.getProperty(CBV_TEST_CONSOLE_PROP_DESTRUCTIVE_UNLOCK_) || '').trim();
  } catch (e0) {
    du = '';
  }
  try {
    pu = String(props.getProperty(CBV_TEST_CONSOLE_PROP_PROD_MUTATION_UNLOCK_) || '').trim();
  } catch (e1) {
    pu = '';
  }
  try {
    adminTrace = String(props.getProperty(CBV_TEST_CONSOLE_PROP_ADMIN_TRACE_) || '').trim();
  } catch (e2) {
    adminTrace = '';
  }

  if (suite.destructive) {
    requiresUnlock = true;
    if (du !== 'I_UNDERSTAND') {
      reasons.push('DESTRUCTIVE_BLOCKED: set ' + CBV_TEST_CONSOLE_PROP_DESTRUCTIVE_UNLOCK_ + '=I_UNDERSTAND');
      return {
        allowed: false,
        reasons: reasons,
        runtimeSafe: false,
        requiresUnlock: requiresUnlock,
        requiresAdminTrace: requiresAdminTrace
      };
    }
    if (adminTrace) {
      requiresAdminTrace = true;
      var tid = String(traceIdHint || '').trim();
      if (!tid || adminTrace !== tid) {
        reasons.push('DESTRUCTIVE_REQUIRES_ADMIN_TRACE_MATCH:' + CBV_TEST_CONSOLE_PROP_ADMIN_TRACE_);
        return {
          allowed: false,
          reasons: reasons,
          runtimeSafe: false,
          requiresUnlock: requiresUnlock,
          requiresAdminTrace: requiresAdminTrace
        };
      }
    }
  }

  if (suite.productionSafe === false) {
    requiresUnlock = true;
    if (pu !== 'I_UNDERSTAND') {
      reasons.push('PRODUCTION_MUTATION_BLOCKED: set ' + CBV_TEST_CONSOLE_PROP_PROD_MUTATION_UNLOCK_ + '=I_UNDERSTAND');
      return {
        allowed: false,
        reasons: reasons,
        runtimeSafe: false,
        requiresUnlock: requiresUnlock,
        requiresAdminTrace: requiresAdminTrace
      };
    }
    if (adminTrace) {
      requiresAdminTrace = true;
      var tid2 = String(traceIdHint || '').trim();
      if (!tid2 || adminTrace !== tid2) {
        reasons.push('PRODUCTION_MUTATION_REQUIRES_ADMIN_TRACE_MATCH');
        return {
          allowed: false,
          reasons: reasons,
          runtimeSafe: false,
          requiresUnlock: requiresUnlock,
          requiresAdminTrace: requiresAdminTrace
        };
      }
    }
  }

  return {
    allowed: true,
    reasons: [],
    runtimeSafe: true,
    requiresUnlock: false,
    requiresAdminTrace: false
  };
}

/**
 * @returns {{ ok: boolean, message: string }}
 */
function CBV_TestConsole_runtimeBoundarySelfTest_() {
  var s = { destructive: true, productionSafe: true };
  var b = CBV_TestConsole_enforceRuntimeBoundary_(s, '');
  if (b.allowed) return { ok: false, message: 'expected destructive block without unlock' };
  var s2 = { destructive: false, productionSafe: true };
  var b2 = CBV_TestConsole_enforceRuntimeBoundary_(s2, '');
  if (!b2.allowed) return { ok: false, message: 'expected safe suite allowed' };
  return { ok: true, message: 'runtime boundary self-test OK' };
}
