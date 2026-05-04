/**
 * CBV Core V2 — bootstrap (ensure sheets + headers + registry seed).
 */

/**
 * @returns {Object}
 */
function CBV_CoreV2_bootstrap() {
  var report = {
    ok: true,
    code: 'CORE_V2_BOOTSTRAP_OK',
    message: 'Core V2 bootstrap completed',
    data: {
      sheets: [],
      registrySeeded: true
    },
    error: null
  };

  try {
    var pairs = [
      ['MODULE_REGISTRY', 'MODULE_REGISTRY'],
      ['COMMAND_LOG', 'COMMAND_LOG'],
      ['EVENT_QUEUE', 'EVENT_QUEUE'],
      ['EVENT_LOG', 'EVENT_LOG'],
      ['AUDIT_LOG', 'AUDIT_LOG'],
      ['IDEMPOTENCY', 'IDEMPOTENCY'],
      ['SYSTEM_HEALTH', 'SYSTEM_HEALTH'],
      ['CONFIG_REGISTRY', 'CONFIG_REGISTRY']
    ];
    var i;
    for (i = 0; i < pairs.length; i++) {
      var er = cbvCoreV2EnsureCoreSheet_(pairs[i][0], pairs[i][1]);
      report.data.sheets.push({
        name: CBV_CORE_V2.SHEETS[pairs[i][0]],
        created: er.created,
        appendedHeaders: er.appendedHeaders || []
      });
    }
    cbvCoreV2RegistrySeed_();
  } catch (e) {
    var n = cbvCoreV2NormalizeError_(e);
    report.ok = false;
    report.code = n.code;
    report.message = n.message;
    report.error = { code: n.code, message: n.message };
  }

  return report;
}
