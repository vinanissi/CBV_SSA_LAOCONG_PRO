/**
 * CBV Operational Workflow Runtime — transition engine + Phase E menus (Phase E).
 */

var CBV_OPERATIONAL_DEPLOY_UNLOCK_PROP_NAME_ = 'CBV_OPERATIONAL_DEPLOY_UNLOCK';
var CBV_OPERATIONAL_UI_BUNDLE_KEY_LOCAL_ = 'CBV_OPERATIONAL_WORKFLOW_UI_BUNDLE_V1';
var CBV_OPERATIONAL_VERIFICATION_BUNDLE_USER_KEY_LOCAL_ = 'CBV_TC_LAST_VERIFICATION_BUNDLE_V1';

/**
 * @param {Object} ctx
 * @returns {{
 *   ok: boolean,
 *   transitionAllowed: boolean,
 *   transitionRecorded: boolean,
 *   transitionId: string,
 *   warnings: string[],
 *   errors: string[]
 * }}
 */
function CBV_OperationalWorkflow_transitionState_(ctx) {
  var c = ctx || {};
  var from = String(c.fromState || '').trim().toUpperCase();
  var to = String(c.toState || '').trim().toUpperCase();
  var traceId = String(c.traceId || '').trim();
  var actor = String(c.requestedBy || '').trim();
  var validateOnly = !!c.validateOnly;
  var warnings = [];
  var errors = [];

  if (!traceId) {
    errors.push('MISSING_TRACE_ID');
    return {
      ok: false,
      transitionAllowed: false,
      transitionRecorded: false,
      transitionId: '',
      warnings: warnings,
      errors: errors
    };
  }
  if (!actor) {
    errors.push('MISSING_ACTOR');
    return {
      ok: false,
      transitionAllowed: false,
      transitionRecorded: false,
      transitionId: '',
      warnings: warnings,
      errors: errors
    };
  }

  if (!CBV_OperationalStateMachine_isLegalTransition_(from, to)) {
    errors.push('ILLEGAL_TRANSITION:' + from + '→' + to);
    return {
      ok: false,
      transitionAllowed: false,
      transitionRecorded: false,
      transitionId: '',
      warnings: warnings,
      errors: errors
    };
  }

  if (validateOnly) {
    return {
      ok: true,
      transitionAllowed: true,
      transitionRecorded: false,
      transitionId: '',
      warnings: warnings,
      errors: errors
    };
  }

  if (from === CBV_OPERATIONAL_STATES.READY_FOR_DEPLOY && to === CBV_OPERATIONAL_STATES.DEPLOYED) {
    var unlock = '';
    try {
      unlock = String(PropertiesService.getScriptProperties().getProperty(CBV_OPERATIONAL_DEPLOY_UNLOCK_PROP_NAME_) || '').trim();
    } catch (e0) {
      unlock = '';
    }
    if (unlock !== 'I_UNDERSTAND') {
      errors.push('DEPLOY_TRANSITION_BLOCKED:set ' + CBV_OPERATIONAL_DEPLOY_UNLOCK_PROP_NAME_ + '=I_UNDERSTAND');
      return {
        ok: false,
        transitionAllowed: false,
        transitionRecorded: false,
        transitionId: '',
        warnings: warnings,
        errors: errors
      };
    }
  }

  var tid = '';
  if (typeof CBV_OperationalTimeline_appendEvent_ === 'function') {
    var meta = {
      fromState: from,
      toState: to,
      objectType: String(c.objectType || ''),
      objectId: String(c.objectId || ''),
      reason: String(c.reason || '')
    };
    var tr = CBV_OperationalTimeline_appendEvent_({
      traceId: traceId,
      eventType: 'WORKFLOW_TRANSITION',
      actor: actor,
      action: 'STATE_CHANGE',
      objectType: String(c.objectType || 'WORKFLOW'),
      objectId: String(c.objectId || ''),
      metadata: meta
    });
    tid = tr && tr.eventId ? String(tr.eventId) : '';
    if (!tr || !tr.ok) warnings.push('TIMELINE_APPEND_WARN:' + String(tr && tr.warning ? tr.warning : ''));
  } else {
    warnings.push('TIMELINE_RUNTIME_MISSING');
  }

  return {
    ok: errors.length === 0,
    transitionAllowed: true,
    transitionRecorded: !!tid,
    transitionId: tid,
    warnings: warnings,
    errors: errors
  };
}

/**
 * @returns {Object}
 */
function CBV_OperationalWorkflow_buildViewerModel_() {
  var model = {
    version: typeof CBV_OPERATIONAL_RUNTIME_VERSION !== 'undefined' ? CBV_OPERATIONAL_RUNTIME_VERSION : 'E',
    states: typeof CBV_OPERATIONAL_STATES !== 'undefined' ? CBV_OPERATIONAL_STATES : {},
    transitions: typeof CBV_OPERATIONAL_TRANSITIONS !== 'undefined' ? CBV_OPERATIONAL_TRANSITIONS : {},
    timelineRows: [],
    verificationBundle: null
  };
  try {
    var raw = PropertiesService.getUserProperties().getProperty(CBV_OPERATIONAL_VERIFICATION_BUNDLE_USER_KEY_LOCAL_);
    if (raw) model.verificationBundle = JSON.parse(raw);
  } catch (e0) {
    model.verificationBundle = null;
  }
  try {
    var sh = typeof CBV_OperationalTimeline_getOrCreateSheet_ === 'function' ? CBV_OperationalTimeline_getOrCreateSheet_() : null;
    if (sh && sh.getLastRow() > 1) {
      var last = sh.getLastRow();
      var start = Math.max(2, last - 39);
      var nCol = Math.min(sh.getLastColumn(), CBV_OPERATIONAL_TIMELINE_HEADERS_.length);
      var vals = sh.getRange(start, 1, last, nCol).getValues();
      var i;
      for (i = 0; i < vals.length; i++) {
        model.timelineRows.push(vals[i]);
      }
    }
  } catch (e1) {
    model.timelineRows = [];
  }
  try {
    PropertiesService.getUserProperties().setProperty(CBV_OPERATIONAL_UI_BUNDLE_KEY_LOCAL_, JSON.stringify(model));
  } catch (e2) {
    /* ignore */
  }
  return model;
}

function CBV_OperationalWorkflow_menuRuntimeSelfTest() {
  var ui = SpreadsheetApp.getUi();
  try {
    var r = CBV_OperationalWorkflow_runtimeSelfTest_();
    ui.alert('Workflow runtime self-test', JSON.stringify(r, null, 2).slice(0, 15000), ui.ButtonSet.OK);
  } catch (e) {
    ui.alert('Workflow self-test', String(e && e.message ? e.message : e), ui.ButtonSet.OK);
  }
}

function CBV_OperationalWorkflow_menuShowTimeline() {
  var ui = SpreadsheetApp.getUi();
  try {
    var sh = CBV_OperationalTimeline_getOrCreateSheet_();
    if (!sh) {
      ui.alert('Timeline', 'Core DB unavailable.', ui.ButtonSet.OK);
      return;
    }
    var ss = sh.getParent();
    try {
      var active = SpreadsheetApp.getActiveSpreadsheet();
      if (active && String(active.getId()) === String(ss.getId())) {
        ss.setActiveSheet(sh);
        SpreadsheetApp.flush();
      }
    } catch (e0) {
      /* ignore */
    }
    ui.alert('Timeline', 'Sheet: ' + CBV_OPERATIONAL_TIMELINE_SHEET_ + '\n' + ss.getUrl(), ui.ButtonSet.OK);
  } catch (e) {
    ui.alert('Timeline', String(e && e.message ? e.message : e), ui.ButtonSet.OK);
  }
}

function CBV_OperationalWorkflow_menuShowIncidentDashboard() {
  var ui = SpreadsheetApp.getUi();
  try {
    var sh = CBV_OperationalIncident_getOrCreateSheet_();
    if (!sh) {
      ui.alert('Incidents', 'Core DB unavailable.', ui.ButtonSet.OK);
      return;
    }
    var ss = sh.getParent();
    try {
      var active = SpreadsheetApp.getActiveSpreadsheet();
      if (active && String(active.getId()) === String(ss.getId())) {
        ss.setActiveSheet(sh);
        SpreadsheetApp.flush();
      }
    } catch (e0) {
      /* ignore */
    }
    ui.alert('Incidents', 'Sheet: ' + CBV_OPERATIONAL_INCIDENTS_SHEET_ + '\n' + ss.getUrl(), ui.ButtonSet.OK);
  } catch (e) {
    ui.alert('Incidents', String(e && e.message ? e.message : e), ui.ButtonSet.OK);
  }
}

function CBV_OperationalWorkflow_menuShowApprovalQueue() {
  var ui = SpreadsheetApp.getUi();
  try {
    var sh = CBV_OperationalApproval_getOrCreateSheet_();
    if (!sh) {
      ui.alert('Approvals', 'Core DB unavailable.', ui.ButtonSet.OK);
      return;
    }
    var ss = sh.getParent();
    try {
      var active = SpreadsheetApp.getActiveSpreadsheet();
      if (active && String(active.getId()) === String(ss.getId())) {
        ss.setActiveSheet(sh);
        SpreadsheetApp.flush();
      }
    } catch (e0) {
      /* ignore */
    }
    ui.alert('Approvals', 'Sheet: ' + CBV_OPERATIONAL_APPROVALS_SHEET_ + '\n' + ss.getUrl(), ui.ButtonSet.OK);
  } catch (e) {
    ui.alert('Approvals', String(e && e.message ? e.message : e), ui.ButtonSet.OK);
  }
}

function CBV_OperationalWorkflow_menuShowWorkflowViewer() {
  try {
    var t = HtmlService.createTemplateFromFile('339_CBV_OPERATIONAL_WORKFLOW_VIEWER');
    var m = CBV_OperationalWorkflow_buildViewerModel_();
    try {
      t.modelJson = JSON.stringify(m).replace(/</g, '\\u003c');
    } catch (e0) {
      t.modelJson = '{}';
    }
    SpreadsheetApp.getUi().showModalDialog(t.evaluate().setWidth(980).setHeight(760), 'CBV Operational Workflow Viewer');
  } catch (e) {
    SpreadsheetApp.getUi().alert('Workflow viewer', String(e && e.message ? e.message : e), SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

function CBV_OperationalWorkflow_menuRunTransitionValidation() {
  var ui = SpreadsheetApp.getUi();
  try {
    var pr = ui.prompt('Transition validation', 'fromState,toState,objectId (comma-separated):', ui.ButtonSet.OK_CANCEL);
    if (pr.getSelectedButton() !== ui.Button.OK) return;
    var parts = String(pr.getResponseText() || '')
      .split(',')
      .map(function (x) {
        return String(x || '').trim();
      });
    var from = parts[0] || '';
    var to = parts[1] || '';
    var oid = parts[2] || 'NA';
    var tr = CBV_TestConsole_newTraceId_();
    var res = CBV_OperationalWorkflow_transitionState_({
      objectType: 'WORKFLOW',
      objectId: oid,
      fromState: from,
      toState: to,
      traceId: tr,
      requestedBy: CBV_TestConsole_runBy_(),
      reason: 'MENU_VALIDATE',
      validateOnly: true
    });
    ui.alert('Transition validation', JSON.stringify(res, null, 2), ui.ButtonSet.OK);
  } catch (e) {
    ui.alert('Transition validation', String(e && e.message ? e.message : e), ui.ButtonSet.OK);
  }
}

/**
 * @returns {{ ok: boolean, steps: Object[] }}
 */
function CBV_OperationalWorkflow_runtimeSelfTest_() {
  var steps = [];
  function step(name, ok, detail) {
    steps.push({ name: name, ok: !!ok, detail: detail || '' });
  }

  step('state_machine', CBV_OperationalStateMachine_selfTest_().ok, '334');
  step('timeline', CBV_OperationalTimeline_selfTest_().ok, '337');
  step('incident', CBV_OperationalIncident_selfTest_().ok, '335');
  step('approval', CBV_OperationalApproval_selfTest_().ok, '336');

  var tr = CBV_TestConsole_newTraceId_();
  var illegal = CBV_OperationalWorkflow_transitionState_({
    objectType: 'WORKFLOW',
    objectId: 't1',
    fromState: 'DRAFT',
    toState: 'DEPLOYED',
    traceId: tr,
    requestedBy: 'SYSTEM',
    reason: 'illegal test',
    validateOnly: true
  });
  step('illegal_transition_blocked', illegal.transitionAllowed === false, JSON.stringify(illegal.errors));

  var legal = CBV_OperationalWorkflow_transitionState_({
    objectType: 'WORKFLOW',
    objectId: 't2',
    fromState: 'DRAFT',
    toState: 'TESTING',
    traceId: CBV_TestConsole_newTraceId_(),
    requestedBy: 'SYSTEM',
    reason: 'legal validate',
    validateOnly: true
  });
  step('legal_validate', legal.ok && legal.transitionAllowed, JSON.stringify(legal.errors));

  var deployBlocked = CBV_OperationalWorkflow_transitionState_({
    objectType: 'WORKFLOW',
    objectId: 't3',
    fromState: 'READY_FOR_DEPLOY',
    toState: 'DEPLOYED',
    traceId: CBV_TestConsole_newTraceId_(),
    requestedBy: 'SYSTEM',
    reason: 'deploy without unlock',
    validateOnly: false
  });
  step('deploy_requires_unlock', deployBlocked.transitionAllowed === false, JSON.stringify(deployBlocked.errors));

  var deployValidateOnly = CBV_OperationalWorkflow_transitionState_({
    objectType: 'WORKFLOW',
    objectId: 't3b',
    fromState: 'READY_FOR_DEPLOY',
    toState: 'DEPLOYED',
    traceId: CBV_TestConsole_newTraceId_(),
    requestedBy: 'SYSTEM',
    reason: 'deploy validate-only (no unlock)',
    validateOnly: true
  });
  step('deploy_validate_only_skips_unlock', deployValidateOnly.ok && deployValidateOnly.transitionAllowed, JSON.stringify(deployValidateOnly.errors));

  var gov = typeof CBV_TestConsole_governanceRulesSelfTest_ === 'function' ? CBV_TestConsole_governanceRulesSelfTest_() : { ok: true };
  step('governance_enforcement', gov.ok, gov.message || '');

  var viewer = typeof CBV_OperationalWorkflow_viewerRenderSelfTest_ === 'function' ? CBV_OperationalWorkflow_viewerRenderSelfTest_() : { ok: true };
  step('viewer_render', viewer.ok, viewer.message || '');

  var okAll = true;
  var i;
  for (i = 0; i < steps.length; i++) {
    if (!steps[i].ok) okAll = false;
  }
  return { ok: okAll, steps: steps };
}

/**
 * @returns {{ ok: boolean, message: string }}
 */
function CBV_OperationalWorkflow_viewerRenderSelfTest_() {
  try {
    var t = HtmlService.createTemplateFromFile('339_CBV_OPERATIONAL_WORKFLOW_VIEWER');
    t.modelJson = JSON.stringify({ version: 'E', timelineRows: [], verificationBundle: null, states: {}, transitions: {} }).replace(/</g, '\\u003c');
    var html = t.evaluate().getContent();
    if (!html || html.length < 80) return { ok: false, message: 'viewer html short' };
    return { ok: true, message: 'workflow viewer render OK' };
  } catch (e) {
    return { ok: false, message: String(e && e.message ? e.message : e) };
  }
}
