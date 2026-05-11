/**
 * CBV Test Console Runtime V2 — AI handoff prompt builder.
 */

/**
 * @param {Object} report
 * @returns {string}
 */
function CBV_TestConsole_buildAiHandoffPrompt_(report) {
  var r = report || {};
  var lines = [];
  lines.push('# CBV TEST CONSOLE — AI HANDOFF');
  lines.push('');
  lines.push('You are the CBV System Architect. Review the following Test Console Runtime V2 report.');
  lines.push('');
  lines.push('## Decision request');
  lines.push('');
  lines.push('Based on `status`, `severity`, and `checks`, state: (1) safe to proceed, (2) needs mitigation, or (3) blocked.');
  lines.push('Respond with concrete next engineering actions; reference `traceId` in follow-ups.');
  lines.push('');
  lines.push('## Envelope (structured)');
  lines.push('');
  lines.push('```json');
  try {
    lines.push(JSON.stringify({
      ok: r.ok,
      phase: r.phase,
      status: r.status,
      checkedAt: r.checkedAt,
      runBy: r.runBy,
      traceId: r.traceId,
      testSuite: r.testSuite,
      summary: r.summary,
      checks: r.checks,
      warnings: r.warnings,
      errors: r.errors,
      nextStep: r.nextStep,
      severity: r.severity,
      contractVersion: r.contractVersion,
      envelopeOk: r.envelopeOk,
      driveFileUrl: r.driveFileUrl,
      exportFileName: r.exportFileName
    }, null, 2));
  } catch (e0) {
    lines.push('{}');
  }
  lines.push('```');
  lines.push('');
  lines.push('## Markdown report (operator copy)');
  lines.push('');
  lines.push(String(r.reportText || ''));
  lines.push('');
  return lines.join('\n');
}
