#!/usr/bin/env node
/**
 * PHASE_CLEAN_REPO_CLOSEOUT — verify closeout artifacts and extended audit suite.
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..', '..');
const checks = [];

function push(id, pass, detail) {
  checks.push({ id, pass, detail });
}

const suiteSrc = readFileSync(join(__dirname, 'runDataRelAuditSuite.mjs'), 'utf8');
push('SUITE_INCLUDES_10', suiteSrc.includes('workerEnvelopePhase10Checks.mjs'));
push('SUITE_INCLUDES_14', suiteSrc.includes('migrationInventoryPhase14Checks.mjs'));
push('CLOSEOUT_RUNNER', existsSync(join(__dirname, 'runCleanRepoCloseout.mjs')));
push(
  'CLOSEOUT_REPORT',
  existsSync(join(repoRoot, '09_AUDIT/PHASE_CLEAN_REPO_CLOSEOUT_REPORT.md')),
);
push(
  'AUTHORITY_INDEX_PHASE_15',
  readFileSync(join(repoRoot, '03_SHARED/DATA_REL_AUTHORITY_INDEX.md'), 'utf8').includes('runCleanRepoCloseout'),
);

const failed = checks.filter((c) => !c.pass);
const result = failed.length ? 'NO_GO' : 'GO';
console.log(JSON.stringify({ suite: 'PHASE_CLEAN_REPO_CLOSEOUT', result, checks }, null, 2));
process.exit(failed.length ? 1 : 0);
