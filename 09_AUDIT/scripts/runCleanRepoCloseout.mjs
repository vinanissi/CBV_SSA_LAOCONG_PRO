#!/usr/bin/env node
/**
 * PHASE_CLEAN_REPO_CLOSEOUT — full verification matrix (read-only + typecheck).
 * Usage: node 09_AUDIT/scripts/runCleanRepoCloseout.mjs
 */
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..', '..');

function runNode(script, args = []) {
  const path = join(__dirname, script);
  const r = spawnSync(process.execPath, [path, ...args], {
    cwd: repoRoot,
    encoding: 'utf8',
    maxBuffer: 12 * 1024 * 1024,
    shell: false,
  });
  return { script, args, exitCode: r.status ?? 1, stdout: r.stdout || '', stderr: r.stderr || '' };
}

function runNpm(prefix, script) {
  const r = spawnSync('npm', ['run', script, '--prefix', prefix], {
    cwd: repoRoot,
    encoding: 'utf8',
    maxBuffer: 12 * 1024 * 1024,
    shell: true,
  });
  return { target: prefix, script, exitCode: r.status ?? 1, stderr: (r.stderr || '').slice(0, 500) };
}

function parseJsonStdout(stdout) {
  const i = stdout.indexOf('{');
  if (i < 0) return null;
  try {
    return JSON.parse(stdout.slice(i));
  } catch {
    return null;
  }
}

const steps = [];

const audit = runNode('runDataRelAuditSuite.mjs');
const auditJson = parseJsonStdout(audit.stdout);
steps.push({
  id: 'AUDIT_SUITE',
  exitCode: audit.exitCode,
  result: auditJson?.overall,
  suiteCount: auditJson?.suiteCount,
});

const migration = runNode('runMigrationInventory.mjs', [
  '--input-dir',
  join(repoRoot, '09_AUDIT/fixtures/migration-inventory-sample'),
]);
const migrationJson = parseJsonStdout(migration.stdout);
steps.push({
  id: 'MIGRATION_INVENTORY_FIXTURE',
  exitCode: migration.exitCode,
  csvResult: migrationJson?.csvResult,
});

for (const [prefix, script] of [
  ['workers/api', 'typecheck'],
  ['workers/api', 'test:permissions'],
  ['apps/workboard', 'typecheck'],
]) {
  const r = runNpm(prefix, script);
  steps.push({ id: `${prefix}:${script}`, ...r, pass: r.exitCode === 0 });
}

const buildFailed = steps.some((s) => s.exitCode !== 0 && s.id !== 'AUDIT_SUITE');
const auditFailed = audit.exitCode !== 0;

const overall =
  auditFailed || buildFailed
    ? 'NO_GO'
    : steps.some((s) => s.result === 'GO_WITH_WARNINGS') || auditJson?.overall === 'GO_WITH_WARNINGS'
      ? 'GO_WITH_WARNINGS'
      : 'GO';

const out = {
  suite: 'PHASE_CLEAN_REPO_CLOSEOUT',
  phase: '15',
  runAt: new Date().toISOString(),
  overall,
  readOnlyDataMutation: false,
  steps,
  auditSuite: auditJson,
  migrationSample: migrationJson
    ? {
        csvResult: migrationJson.csvResult,
        userSummary: migrationJson.csvInventories?.userRefs?.summary,
        financeSummary: migrationJson.csvInventories?.finance?.summary,
        hosoSummary: migrationJson.csvInventories?.hosoRelation?.summary,
      }
    : null,
  migrationBacklog: {
    userRefs: 'PLAN_ONLY — Phase 02',
    finance: 'PLAN_ONLY — Phase 03',
    hosoTypedGraph: 'PLAN_ONLY — Phase 04',
    sheetWritesBlocked: 'GAS assertActive* + finance/hoso guards (Phases 05–07)',
  },
};

console.log(JSON.stringify(out, null, 2));
process.exit(overall === 'NO_GO' ? 1 : 0);
