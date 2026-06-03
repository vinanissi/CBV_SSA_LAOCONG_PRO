/**
 * PHASE_CHECKLIST_14 — validate multi-user sync runtime readiness.
 */

function validateChecklistMultiUserSyncRuntime(options) {
  options = options || {};
  var traceId = typeof clBridgeTraceId_ === 'function' ? clBridgeTraceId_(options, options.traceId) : 'sync-val';
  var result = {
    ok: true,
    status: 'GO',
    checkedAt: typeof clBridgeNowIso_ === 'function' ? clBridgeNowIso_() : new Date().toISOString(),
    traceId: traceId,
    sync: {
      readItems: typeof clBridgeReadChecklistItems_ === 'function',
      readFeedback: typeof clBridgeReadFeedback_ === 'function',
      readAttachments: typeof clBridgeReadAttachmentMetadata_ === 'function',
      readLinks: typeof clBridgeReadLinks_ === 'function',
      readHistory: typeof clBridgeReadHistory_ === 'function',
      readLayout: typeof clBridgeReadLayoutState_ === 'function',
    },
    bridge: { dispatch: typeof clBridgeDispatch_ === 'function' },
    warnings: [],
    errors: [],
    nextStep: 'PHASE_CHECKLIST_15_OPERATOR_UAT',
  };

  if (!result.sync.readItems) {
    result.ok = false;
    result.errors.push('clBridgeReadChecklistItems_ missing');
  }
  if (!result.sync.readLayout) {
    result.warnings.push('readLayoutState not loaded');
  }
  if (result.errors.length) {
    result.status = 'FAIL';
    result.ok = false;
  } else if (result.warnings.length) {
    result.status = 'GO_WITH_WARNINGS';
  }
  return result;
}
