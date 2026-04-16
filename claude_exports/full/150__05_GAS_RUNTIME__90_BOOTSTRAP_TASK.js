/**
 * CBV Task Bootstrap - Ensures TASK sheets exist with correct headers.
 * Idempotent. Uses schema_manifest / 90_BOOTSTRAP_SCHEMA.
 * Dependencies: 00_CORE_CONFIG, 90_BOOTSTRAP_SCHEMA, 90_BOOTSTRAP_INIT
 */

/**
 * Ensures TASK_MAIN, TASK_CHECKLIST, TASK_ATTACHMENT, TASK_UPDATE_LOG exist with correct headers.
 * @returns {Object} { ok, created: string[], updated: string[], errors: string[] }
 */
function taskBootstrapSheets() {
  var result = { ok: true, created: [], updated: [], errors: [] };
  var names = ['TASK_MAIN', 'TASK_CHECKLIST', 'TASK_ATTACHMENT', 'TASK_UPDATE_LOG'];

  for (var i = 0; i < names.length; i++) {
    var name = names[i];
    try {
      var r = typeof ensureSheetExists === 'function' ? ensureSheetExists(name) : null;
      if (!r) {
        result.errors.push(name + ': ensureSheetExists not available');
        continue;
      }
      if (r.created) result.created.push(name);

      var sheet = r.sheet;
      var headers = typeof getSchemaHeaders === 'function' ? getSchemaHeaders(name) : null;
      if (!headers) {
        result.errors.push(name + ': getSchemaHeaders not available');
        continue;
      }

      var report = typeof ensureHeadersMatchOrReport === 'function' ? ensureHeadersMatchOrReport(sheet, headers) : null;
      if (!report) continue;
      if (report.match) continue;

      if (report.canExtend && report.missingCount > 0) {
        if (typeof _writeHeaders === 'function') {
          _writeHeaders(sheet, headers);
          result.updated.push(name);
        } else {
          result.errors.push(name + ': headers incomplete, _writeHeaders not available');
        }
      } else if (!report.match && report.mismatchReason) {
        result.errors.push(name + ': ' + (report.mismatchReason || 'header mismatch'));
      }
    } catch (e) {
      result.ok = false;
      result.errors.push(name + ': ' + String(e.message || e));
    }
  }

  if (result.errors.length > 0) result.ok = false;
  return result;
}
