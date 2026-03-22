/**
 * CBV Task Validation - Enforces task model rules.
 * HTX_ID → active HTX; OWNER_ID/REPORTER_ID → active users; STATUS transitions; checklist completion.
 * Dependencies: 02_USER_SERVICE, 01_ENUM_SERVICE, 03_SHARED_VALIDATION, 20_TASK_REPOSITORY
 */

/** Valid STATUS transitions. NEW→DONE blocked. */
var TASK_VALID_TRANSITIONS = {
  NEW: ['ASSIGNED', 'CANCELLED'],
  ASSIGNED: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['WAITING', 'DONE', 'CANCELLED'],
  WAITING: ['IN_PROGRESS', 'CANCELLED'],
  DONE: ['ARCHIVED'],
  CANCELLED: ['ARCHIVED'],
  ARCHIVED: []
};

/** UPDATE_TYPE enum values for TASK_UPDATE_LOG. */
var TASK_UPDATE_TYPES = ['NOTE', 'QUESTION', 'ANSWER', 'STATUS_CHANGE'];

/**
 * Asserts HTX_ID points to an active HTX (HO_SO_MASTER, HO_SO_TYPE=HTX, IS_DELETED=false).
 * @param {string} htxId
 * @param {string} fieldName
 */
function assertActiveHtxId(htxId, fieldName) {
  ensureRequired(htxId, fieldName || 'HTX_ID');
  var htx = typeof taskFindHtxById === 'function' ? taskFindHtxById(htxId) : null;
  if (!htx) throw new Error('Invalid ' + (fieldName || 'HTX_ID') + ': must reference an active HTX');
  if (String(htx.IS_DELETED) === 'true' || htx.IS_DELETED === true) {
    throw new Error('HTX is deleted: ' + htxId);
  }
}

/**
 * @param {string} from - Current STATUS
 * @param {string} to - Target STATUS
 * @returns {boolean}
 */
function validateTaskTransition(from, to) {
  var allowed = TASK_VALID_TRANSITIONS[from];
  if (!allowed) return false;
  return allowed.indexOf(to) !== -1;
}

/**
 * Blocks modification to ARCHIVED tasks.
 * @param {string} taskId
 */
function ensureTaskEditable(taskId) {
  var task = typeof taskFindById === 'function' ? taskFindById(taskId) : null;
  cbvAssert(task, 'Task not found');
  cbvAssert(String(task.STATUS) !== 'ARCHIVED', 'Cannot edit ARCHIVED task');
}

/**
 * Blocks DONE if required checklist items are incomplete.
 * @param {string} taskId
 */
function ensureTaskCanComplete(taskId) {
  var items = typeof taskGetChecklistItems === 'function' ? taskGetChecklistItems(taskId) : [];
  var pendingRequired = items.filter(function(r) {
    var req = String(r.IS_REQUIRED) === 'true' || r.IS_REQUIRED === true;
    if (!req) return false;
    var done = String(r.IS_DONE) === 'true' || r.IS_DONE === true;
    return !done;
  });
  cbvAssert(pendingRequired.length === 0, 'Required checklist items are not completed');
}

/**
 * Validates UPDATE_TYPE for log entries.
 * @param {string} updateType
 */
function assertValidUpdateType(updateType) {
  cbvAssert(TASK_UPDATE_TYPES.indexOf(updateType) !== -1, 'Invalid UPDATE_TYPE: ' + updateType);
}
