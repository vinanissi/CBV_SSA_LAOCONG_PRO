/**
 * CBV Operational Verification — governance rule engine (Phase D).
 */

var CBV_TEST_GOVERNANCE_RULES = [
  {
    ruleCode: 'NO_DELETEALLPROPERTIES',
    severity: 'CRITICAL',
    description: 'Script must not call deleteAllProperties in uncontrolled contexts.',
    detectFnName: 'CBV_TestConsole_govDetect_NO_DELETEALLPROPERTIES_',
    enabled: true
  },
  {
    ruleCode: 'NO_DELETE_SHEET',
    severity: 'CRITICAL',
    description: 'No deleteSheet / destructive sheet removal from verification runtime.',
    detectFnName: 'CBV_TestConsole_govDetect_NO_DELETE_SHEET_',
    enabled: true
  },
  {
    ruleCode: 'NO_CLEAR_SHEET',
    severity: 'ERROR',
    description: 'No clear() of entire data ranges from verification pipeline.',
    detectFnName: 'CBV_TestConsole_govDetect_NO_CLEAR_SHEET_',
    enabled: true
  },
  {
    ruleCode: 'NO_OVERWRITE_REPORT',
    severity: 'CRITICAL',
    description: 'Test console reports must remain append-only (no overwrite flags).',
    detectFnName: 'CBV_TestConsole_govDetect_NO_OVERWRITE_REPORT_',
    enabled: true
  },
  {
    ruleCode: 'NO_UNCONTROLLED_TRIGGER_INSTALL',
    severity: 'ERROR',
    description: 'No ClockTriggerBuilder / ScriptApp.newTrigger from test console paths.',
    detectFnName: 'CBV_TestConsole_govDetect_NO_UNCONTROLLED_TRIGGER_INSTALL_',
    enabled: true
  },
  {
    ruleCode: 'NO_AUTO_MIGRATION',
    severity: 'ERROR',
    description: 'No automatic migration execution from verification pipeline.',
    detectFnName: 'CBV_TestConsole_govDetect_NO_AUTO_MIGRATION_',
    enabled: true
  },
  {
    ruleCode: 'NO_RUNTIME_SCHEMA_REWRITE',
    severity: 'CRITICAL',
    description: 'No runtime schema rewrite from verification pipeline.',
    detectFnName: 'CBV_TestConsole_govDetect_NO_RUNTIME_SCHEMA_REWRITE_',
    enabled: true
  },
  {
    ruleCode: 'NO_DESTRUCTIVE_BATCH',
    severity: 'CRITICAL',
    description: 'Destructive suites must not run without boundary unlock.',
    detectFnName: 'CBV_TestConsole_govDetect_NO_DESTRUCTIVE_BATCH_',
    enabled: true
  },
  {
    ruleCode: 'NO_SILENT_PRODUCTION_MUTATION',
    severity: 'ERROR',
    description: 'Production-unsafe suites require explicit unlock + trace.',
    detectFnName: 'CBV_TestConsole_govDetect_NO_SILENT_PRODUCTION_MUTATION_',
    enabled: true
  }
];

function CBV_TestConsole_govDetect_NO_DELETEALLPROPERTIES_(ctx) {
  var t = CBV_TestConsole_govFlattenText_(ctx);
  var bad = /deleteAllProperties/i.test(t);
  return { violated: bad, detail: bad ? 'Forbidden token in context' : 'OK' };
}

function CBV_TestConsole_govDetect_NO_DELETE_SHEET_(ctx) {
  var t = CBV_TestConsole_govFlattenText_(ctx);
  var bad = /deleteSheet\s*\(/i.test(t);
  return { violated: bad, detail: bad ? 'deleteSheet pattern' : 'OK' };
}

function CBV_TestConsole_govDetect_NO_CLEAR_SHEET_(ctx) {
  var t = CBV_TestConsole_govFlattenText_(ctx);
  var bad = /\.clear\s*\(\s*\)/i.test(t) && /getRange\(\s*1\s*,\s*1\s*,\s*[^)]+\)/i.test(t);
  return { violated: !!bad, detail: bad ? 'suspicious clear range' : 'OK' };
}

function CBV_TestConsole_govDetect_NO_OVERWRITE_REPORT_(ctx) {
  var r = ctx && ctx.report ? ctx.report : {};
  if (r.reportOverwritten === true) return { violated: true, detail: 'reportOverwritten flag set' };
  return { violated: false, detail: 'OK' };
}

function CBV_TestConsole_govDetect_NO_UNCONTROLLED_TRIGGER_INSTALL_(ctx) {
  var t = CBV_TestConsole_govFlattenText_(ctx);
  var bad = /ClockTriggerBuilder|ScriptApp\.newTrigger/i.test(t);
  return { violated: bad, detail: bad ? 'trigger install token' : 'OK' };
}

function CBV_TestConsole_govDetect_NO_AUTO_MIGRATION_(ctx) {
  var t = CBV_TestConsole_govFlattenText_(ctx);
  var bad = /\bAUTO_MIGRATION\b|\brunMigration\s*\(/i.test(t);
  return { violated: bad, detail: bad ? 'migration token' : 'OK' };
}

function CBV_TestConsole_govDetect_NO_RUNTIME_SCHEMA_REWRITE_(ctx) {
  var t = CBV_TestConsole_govFlattenText_(ctx);
  var bad = /\bSCHEMA_REWRITE\b|rewriteSchema\s*\(/i.test(t);
  return { violated: bad, detail: bad ? 'schema rewrite token' : 'OK' };
}

function CBV_TestConsole_govDetect_NO_DESTRUCTIVE_BATCH_(ctx) {
  var suite = ctx && ctx.suite ? ctx.suite : null;
  var b = ctx && ctx.boundary ? ctx.boundary : null;
  if (suite && suite.destructive && b && b.allowed) return { violated: false, detail: 'destructive allowed after boundary' };
  if (suite && suite.destructive && (!b || !b.allowed)) return { violated: true, detail: 'destructive without boundary allow' };
  return { violated: false, detail: 'OK' };
}

function CBV_TestConsole_govDetect_NO_SILENT_PRODUCTION_MUTATION_(ctx) {
  var suite = ctx && ctx.suite ? ctx.suite : null;
  var b = ctx && ctx.boundary ? ctx.boundary : null;
  if (suite && suite.productionSafe === false && b && b.allowed) {
    return { violated: false, detail: 'production mutation allowed after boundary unlock' };
  }
  if (suite && suite.productionSafe === false && (!b || !b.allowed)) {
    return { violated: true, detail: 'productionSafe false without boundary unlock' };
  }
  return { violated: false, detail: 'OK' };
}

function CBV_TestConsole_govFlattenText_(ctx) {
  try {
    return JSON.stringify(ctx || {}).slice(0, 120000);
  } catch (e) {
    return '';
  }
}

/**
 * @param {Object} ctx { report?: Object, suite?: Object, boundary?: Object }
 * @returns {{ ok: boolean, results: Object[], violations: string[], governanceRulesChecked: number }}
 */
function CBV_TestConsole_runGovernanceRules_(ctx) {
  var results = [];
  var violations = [];
  var g = typeof globalThis !== 'undefined' ? globalThis : this;
  var i;
  for (i = 0; i < CBV_TEST_GOVERNANCE_RULES.length; i++) {
    var rule = CBV_TEST_GOVERNANCE_RULES[i];
    if (!rule || !rule.enabled) continue;
    var fnName = String(rule.detectFnName || '');
    var fn = null;
    try {
      fn = g[fnName];
    } catch (e0) {
      fn = null;
    }
    var det = { violated: false, detail: 'DETECTOR_MISSING' };
    if (typeof fn === 'function') {
      try {
        det = fn(ctx || {}) || det;
      } catch (e1) {
        det = { violated: true, detail: String(e1 && e1.message ? e1.message : e1) };
      }
    }
    var row = {
      ruleCode: String(rule.ruleCode || ''),
      severity: String(rule.severity || 'WARNING'),
      violated: !!det.violated,
      detail: String(det.detail != null ? det.detail : '')
    };
    results.push(row);
    if (row.violated) violations.push(row.ruleCode);
  }
  return {
    ok: violations.length === 0,
    results: results,
    violations: violations,
    governanceRulesChecked: results.length
  };
}

/**
 * @returns {{ ok: boolean, message: string }}
 */
function CBV_TestConsole_governanceRulesSelfTest_() {
  var ctx = { report: { reportOverwritten: false }, suite: { destructive: false, productionSafe: true }, boundary: { allowed: true } };
  var r = CBV_TestConsole_runGovernanceRules_(ctx);
  if (!r || !r.ok) return { ok: false, message: 'expected ok on clean ctx' };
  var ctx2 = { report: { reportOverwritten: true }, suite: { destructive: false, productionSafe: true }, boundary: { allowed: true } };
  var r2 = CBV_TestConsole_runGovernanceRules_(ctx2);
  if (!r2 || r2.ok) return { ok: false, message: 'expected violation on overwrite flag' };
  return { ok: true, message: 'governance rules self-test OK' };
}
