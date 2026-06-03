/**
 * PHASE_DATA_REL_01 — static checks for task key contract.
 * Run: node 09_AUDIT/scripts/taskKeyContractPhase01Checks.mjs
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const repoRoot = join(import.meta.dirname, '..', '..');

function walk(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === 'dist' || name === '.git' || name === 'phase_tmp_archive') continue;
    const p = join(dir, name);
    try {
      const st = statSync(p);
      if (st.isDirectory()) walk(p, acc);
      else acc.push(p);
    } catch {
      /* skip */
    }
  }
  return acc;
}

function read(rel) {
  return readFileSync(join(repoRoot, rel), 'utf8');
}

const checks = [];
const push = (id, pass, detail) => checks.push({ id, pass, detail });

const contract = read('03_SHARED/TASK_KEY_CONTRACT.md');
const gasSchema = read('gas-runtime-api/31_TaskDbSchemaMap.js');
const gasService = read('gas-runtime-api/40_TaskDbService.js');
const bootstrapAudit = read('05_GAS_RUNTIME/90_BOOTSTRAP_AUDIT_SCHEMA.js');
const taskMainSchema = read('01_SCHEMA/TASK_MAIN_SCHEMA.md');

push('CONTRACT_DOC', contract.includes('TASK_KEY_CONTRACT') && contract.includes('There is **no** physical column'));
push('GAS_TASK_MAIN_NO_TASK_ID_COL', !gasSchema.match(/TASK_MAIN:\s*\[[^\]]*'TASK_ID'/));
push('GAS_MAP_TASKID_FROM_ID', gasService.includes('taskId: String(rec.ID'));
push('BOOTSTRAP_FK_PARENT_ID', bootstrapAudit.includes("parentKey: 'ID'"));

const codeRoots = ['gas-runtime-api', 'workers/api/src', 'apps/workboard/src', '05_GAS_RUNTIME'].map((r) =>
  join(repoRoot, r),
);
let badTaskMainTaskId = 0;
for (const root of codeRoots) {
  try {
    for (const abs of walk(root)) {
      if (!/\.(js|ts|tsx)$/.test(abs)) continue;
      const text = readFileSync(abs, 'utf8');
      if (/TASK_MAIN\.TASK_ID\b/.test(text) && !/no TASK_MAIN\.TASK_ID|not TASK_MAIN\.TASK_ID/.test(text)) {
        badTaskMainTaskId++;
      }
    }
  } catch {
    /* missing path */
  }
}
push('NO_TASK_MAIN_DOT_TASK_ID_IN_RUNTIME_CODE', badTaskMainTaskId === 0, `hits=${badTaskMainTaskId}`);
push('SCHEMA_KEY_SECTION', taskMainSchema.includes('Key contract (locked)'));

const failed = checks.filter((c) => !c.pass);
const result = failed.length ? 'FAIL' : 'GO_WITH_WARNINGS';
console.log(JSON.stringify({ suite: 'PHASE_DATA_REL_01_TASK_KEY_CONTRACT', result, checks, warnings: ['Deferred: bulk update of legacy 06_DATABASE/TASK_SCHEMA.md phrasing'] }, null, 2));
process.exit(failed.length ? 1 : 0);
