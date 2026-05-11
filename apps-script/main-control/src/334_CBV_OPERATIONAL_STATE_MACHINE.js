/**
 * CBV Operational Workflow Runtime — state machine (Phase E).
 */

var CBV_OPERATIONAL_STATES = {
  DRAFT: 'DRAFT',
  TESTING: 'TESTING',
  VERIFIED: 'VERIFIED',
  REVIEW_REQUIRED: 'REVIEW_REQUIRED',
  GOVERNANCE_BLOCKED: 'GOVERNANCE_BLOCKED',
  READY_FOR_DEPLOY: 'READY_FOR_DEPLOY',
  DEPLOYED: 'DEPLOYED',
  INCIDENT: 'INCIDENT',
  ROLLBACK_REQUIRED: 'ROLLBACK_REQUIRED',
  ROLLED_BACK: 'ROLLED_BACK',
  ARCHIVED: 'ARCHIVED'
};

/**
 * Allowed forward / operational transitions (manual-first; no hidden edges).
 * @type {Object<string, string[]>}
 */
var CBV_OPERATIONAL_TRANSITIONS = {
  DRAFT: ['TESTING'],
  TESTING: ['VERIFIED', 'REVIEW_REQUIRED', 'INCIDENT', 'DRAFT'],
  VERIFIED: ['READY_FOR_DEPLOY', 'REVIEW_REQUIRED', 'INCIDENT', 'TESTING'],
  REVIEW_REQUIRED: ['VERIFIED', 'TESTING', 'DRAFT', 'GOVERNANCE_BLOCKED'],
  GOVERNANCE_BLOCKED: ['REVIEW_REQUIRED', 'TESTING'],
  READY_FOR_DEPLOY: ['DEPLOYED', 'GOVERNANCE_BLOCKED', 'REVIEW_REQUIRED'],
  DEPLOYED: ['INCIDENT', 'ROLLBACK_REQUIRED', 'ARCHIVED'],
  INCIDENT: ['REVIEW_REQUIRED', 'ROLLED_BACK', 'DRAFT'],
  ROLLBACK_REQUIRED: ['ROLLED_BACK', 'REVIEW_REQUIRED', 'DEPLOYED'],
  ROLLED_BACK: ['ARCHIVED', 'INCIDENT'],
  ARCHIVED: []
};

/**
 * @param {string} fromState
 * @param {string} toState
 * @returns {boolean}
 */
function CBV_OperationalStateMachine_isLegalTransition_(fromState, toState) {
  var from = String(fromState || '').trim().toUpperCase();
  var to = String(toState || '').trim().toUpperCase();
  if (!from || !to) return false;
  var list = CBV_OPERATIONAL_TRANSITIONS[from];
  if (!list || !list.length) return false;
  var i;
  for (i = 0; i < list.length; i++) {
    if (String(list[i]).toUpperCase() === to) return true;
  }
  return false;
}

/**
 * @returns {{ ok: boolean, message: string, data?: Object }}
 */
function CBV_OperationalStateMachine_selfTest_() {
  if (!CBV_OperationalStateMachine_isLegalTransition_('DRAFT', 'TESTING')) return { ok: false, message: 'DRAFT→TESTING should be legal' };
  if (CBV_OperationalStateMachine_isLegalTransition_('DRAFT', 'DEPLOYED')) return { ok: false, message: 'DRAFT→DEPLOYED must be illegal' };
  if (!CBV_OperationalStateMachine_isLegalTransition_('VERIFIED', 'READY_FOR_DEPLOY')) return { ok: false, message: 'VERIFIED→READY_FOR_DEPLOY should be legal' };
  if (CBV_OperationalStateMachine_isLegalTransition_('READY_FOR_DEPLOY', 'DEPLOYED') === false) return { ok: false, message: 'READY→DEPLOYED should be legal' };
  return { ok: true, message: 'state machine self-test OK' };
}
