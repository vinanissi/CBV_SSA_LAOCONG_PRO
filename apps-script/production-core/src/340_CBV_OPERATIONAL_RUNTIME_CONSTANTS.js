/**
 * CBV Operational Workflow Runtime — constants / runbook keys (Phase E).
 */

var CBV_OPERATIONAL_RUNTIME_VERSION = 'E.0.1';

/** ScriptProperties: must be exactly `I_UNDERSTAND` to allow READY_FOR_DEPLOY → DEPLOYED transition. */
var CBV_OPERATIONAL_PROP_DEPLOY_UNLOCK_ = 'CBV_OPERATIONAL_DEPLOY_UNLOCK';

/** UserProperties: optional UI bundle for workflow viewer (JSON string). */
var CBV_OPERATIONAL_UI_BUNDLE_KEY_ = 'CBV_OPERATIONAL_WORKFLOW_UI_BUNDLE_V1';

/** Same key as verification bundle (defined in 327) — duplicated to avoid load-order coupling. */
var CBV_OPERATIONAL_VERIFICATION_BUNDLE_USER_KEY_ = 'CBV_TC_LAST_VERIFICATION_BUNDLE_V1';
