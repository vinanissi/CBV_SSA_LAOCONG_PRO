#!/usr/bin/env node
/**
 * PHASE_DATA_REL_14 — verify migration inventory scripts exist and sample fixture runs.
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..', '..');

const checks = [];
const warnings = [];

function push(id, pass, detail) {
  checks.push({ id, pass, detail });
}

const required = [
  '09_AUDIT/scripts/runMigrationInventory.mjs',
  '09_AUDIT/scripts/migrationInventoryUserRefs.mjs',
  '09_AUDIT/scripts/migrationInventoryFinance.mjs',
  '09_AUDIT/scripts/migrationInventoryHosoRelation.mjs',
  '09_AUDIT/scripts/lib/parseSheetCsv.mjs',
  '09_AUDIT/templates/migration-inventory/EXPORT_MANIFEST.md',
  '09_AUDIT/fixtures/migration-inventory-sample/TASK_MAIN.csv',
];

for (const rel of required) {
  push(`EXISTS_${rel.split('/').pop()}`, existsSync(join(repoRoot, rel)));
}

const runner = join(__dirname, 'runMigrationInventory.mjs');
const fixture = join(repoRoot, '09_AUDIT/fixtures/migration-inventory-sample');
const run = spawnSync(process.execPath, [runner, '--input-dir', fixture], {
  cwd: repoRoot,
  encoding: 'utf8',
  maxBuffer: 8 * 1024 * 1024,
});

let parsed = null;
try {
  const jsonStart = (run.stdout || '').indexOf('{');
  parsed = JSON.parse(run.stdout.slice(jsonStart));
} catch (e) {
  push('FIXTURE_RUN_PARSED', false, String(e));
}

if (parsed) {
  push('FIXTURE_RUN_OK', parsed.csvResult === 'GO');
  push(
    'FIXTURE_USER_USR_LOCAL',
    parsed.csvInventories?.userRefs?.summary?.usrLocalHits >= 2,
    `hits=${parsed.csvInventories?.userRefs?.summary?.usrLocalHits}`,
  );
  push(
    'FIXTURE_FINANCE_VP54',
    parsed.csvInventories?.finance?.vp54RowCount === 1,
    `vp54=${parsed.csvInventories?.finance?.vp54RowCount}`,
  );
  push(
    'FIXTURE_FINANCE_LOG_ORPHAN',
    parsed.csvInventories?.finance?.financeLogOrphanCount === 1,
  );
  push(
    'FIXTURE_HOSO_TYPED_GRAPH',
    parsed.csvInventories?.hosoRelation?.typedGraphOnlyCount >= 1,
  );
  push('RUNNER_READ_ONLY', parsed.readOnly === true);
}

const runnerSrc = readFileSync(runner, 'utf8');
if (/appendRow|setValue|SpreadsheetApp/.test(runnerSrc)) {
  warnings.push('Unexpected sheet write API in inventory runner');
} else {
  push('NO_SHEET_WRITE_API', true);
}

const failed = checks.filter((c) => !c.pass);
const result = failed.length ? 'NO_GO' : warnings.length ? 'GO_WITH_WARNINGS' : 'GO';

console.log(JSON.stringify({ suite: 'PHASE_DATA_REL_14_MIGRATION_INVENTORY', result, checks, warnings }, null, 2));
process.exit(failed.length ? 1 : 0);
