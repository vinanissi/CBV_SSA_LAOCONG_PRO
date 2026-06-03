#!/usr/bin/env node
/**
 * PHASE_DATA_REL_09 / 15 — runs data-relationship static audit scripts (01–05 + clean-repo 10–14).
 * Usage: node 09_AUDIT/scripts/runDataRelAuditSuite.mjs
 * Exit 1 if any child suite result === NO_GO or FAIL.
 */
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..', '..');

const SUITES = [
  { phase: '01', label: 'TASK_KEY_CONTRACT', script: 'taskKeyContractPhase01Checks.mjs' },
  { phase: '02', label: 'USER_REFERENCE', script: 'userReferencePhase02Checks.mjs' },
  { phase: '03', label: 'FINANCE_RELATION', script: 'financeRelationPhase03Checks.mjs' },
  { phase: '04', label: 'HO_SO_RELATION', script: 'hosoRelationPhase04Checks.mjs' },
  { phase: '05', label: 'RUNTIME_GUARD', script: 'runtimeGuardPhase05Checks.mjs' },
  { phase: '10', label: 'WORKER_ENVELOPE', script: 'workerEnvelopePhase10Checks.mjs' },
  { phase: '11', label: 'GAS_WRITE_GUARD_COVERAGE', script: 'gasWriteGuardCoveragePhase11Checks.mjs' },
  { phase: '12', label: 'SCHEMA_AUTHORITY_DOC', script: 'schemaAuthorityPhase12Checks.mjs' },
  { phase: '13', label: 'FRONTEND_DATA_CONTRACT', script: 'frontendDataContractPhase13Checks.mjs' },
  { phase: '14', label: 'MIGRATION_INVENTORY', script: 'migrationInventoryPhase14Checks.mjs' },
];

const suiteResults = [];
let hasNoGo = false;
let hasParseError = false;

for (const spec of SUITES) {
  const scriptPath = join(__dirname, spec.script);
  const run = spawnSync(process.execPath, [scriptPath], {
    cwd: repoRoot,
    encoding: 'utf8',
    maxBuffer: 10 * 1024 * 1024,
  });

  let parsed = null;
  const stdout = (run.stdout || '').trim();
  try {
    const jsonStart = stdout.indexOf('{');
    const jsonText = jsonStart >= 0 ? stdout.slice(jsonStart) : stdout;
    parsed = jsonText ? JSON.parse(jsonText) : null;
  } catch (e) {
    hasParseError = true;
    hasNoGo = true;
    parsed = { parseError: String(e), stdoutPreview: stdout.slice(0, 400) };
  }

  const result = parsed?.result ?? (run.status === 0 ? 'UNKNOWN_OK' : 'NO_GO');
  const passResults = new Set(['GO', 'GO_WITH_WARNINGS']);
  if (result === 'NO_GO' || result === 'FAIL') hasNoGo = true;
  else if (run.status !== 0 && !passResults.has(result)) hasNoGo = true;

  const failedChecks = Array.isArray(parsed?.checks)
    ? parsed.checks.filter((c) => c.pass === false).map((c) => c.id)
    : [];

  suiteResults.push({
    phase: spec.phase,
    label: spec.label,
    script: spec.script,
    exitCode: run.status ?? 1,
    suite: parsed?.suite ?? spec.label,
    result,
    failedChecks,
    warningCount: Array.isArray(parsed?.warnings) ? parsed.warnings.length : 0,
    checkCount: Array.isArray(parsed?.checks) ? parsed.checks.length : 0,
    warnings: parsed?.warnings,
    stderr: run.stderr?.trim() || undefined,
    ...(parsed?.parseError ? { parseError: parsed.parseError } : {}),
  });
}

const overall = hasParseError || hasNoGo
  ? 'NO_GO'
  : suiteResults.some((s) => s.result === 'GO_WITH_WARNINGS')
    ? 'GO_WITH_WARNINGS'
    : 'GO';

const out = {
  suite: 'PHASE_DATA_REL_AUDIT_SUITE',
  phase: '09+15',
  suiteCount: suiteResults.length,
  runAt: new Date().toISOString(),
  overall,
  repoRoot,
  suites: suiteResults,
};

console.log(JSON.stringify(out, null, 2));
process.exit(overall === 'NO_GO' ? 1 : 0);
