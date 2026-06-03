#!/usr/bin/env node
/**
 * PHASE_DATA_REL_02 — static user-reference drift discovery (no workbook access).
 */
import { readFileSync, readdirSync, statSync } from 'fs';
import { dirname, join, relative } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..', '..');

const DRIFT_IDS = [
  'USR-LOCAL-STAFF',
  'USR-LOCAL-MGR',
  'USR-LOCAL-FIN',
  'USR-LOCAL-HS',
  'USR-LOCAL-ADMIN',
  'USR-LOCAL-USER',
  'USR-LOCAL-VIEW',
  'UAT_OPERATOR',
];

const checks = [];
const warnings = [];

function push(id, pass, detail) {
  checks.push({ id, pass, detail: detail || undefined });
}

function walk(dir, out = []) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const name of entries) {
    const p = join(dir, name);
    if (name === 'node_modules' || name === '.git' || name === 'phase_tmp_archive') continue;
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

function read(rel) {
  return readFileSync(join(repoRoot, rel), 'utf8');
}

// Contract docs mention USER_DIRECTORY as canonical
const mapping = read('03_SHARED/USER_TASK_FINANCE_MAPPING.md');
push(
  'MAPPING_DOC_USER_DIRECTORY',
  mapping.includes('USER_DIRECTORY.ID') && mapping.includes('ACTOR_ID'),
);

const userStd = read('03_SHARED/USER_RUNTIME_STANDARD.md');
push('USER_STD_ASSERT_ACTIVE', userStd.includes('assertActiveUserId'));

const taskSvc = read('05_GAS_RUNTIME/20_TASK_SERVICE.js');
push(
  'GAS_TASK_ASSERT_OWNER',
  taskSvc.includes('assertActiveUserId(data.OWNER_ID') || taskSvc.includes("assertActiveUserId(data.OWNER_ID, 'OWNER_ID')"),
);

const userSvc = read('05_GAS_RUNTIME/02_USER_SERVICE.js');
push(
  'GAS_MAP_USER_SKIPS_SYSTEM',
  /mapCurrentUserEmailToInternalId[\s\S]*system/.test(userSvc),
);

const plan = read('09_AUDIT/PHASE_DATA_REL_02_USER_REFERENCE_CLEANUP_PLAN.md');
push('PLAN_DOC', plan.includes('UD_SYSTEM') && plan.includes('USR-LOCAL-STAFF'));

// Drift id hits in runtime code paths (informational)
const scanRoots = ['apps/workboard/src', 'workers/api/src', '05_GAS_RUNTIME', 'gas-runtime-api'].map((r) =>
  join(repoRoot, r),
);
const driftHits = [];
for (const root of scanRoots) {
  for (const abs of walk(root)) {
    if (!/\.(js|ts|tsx)$/.test(abs)) continue;
    const rel = relative(repoRoot, abs).replace(/\\/g, '/');
    const text = readFileSync(abs, 'utf8');
    for (const id of DRIFT_IDS) {
      if (text.includes(id)) driftHits.push({ file: rel, id });
    }
  }
}

const prodGasHits = driftHits.filter(
  (h) => h.file.startsWith('05_GAS_RUNTIME/') && !h.file.includes('99_DEBUG'),
);
push(
  'NO_DRIFT_IDS_IN_GAS_PRODUCTION_PATHS',
  prodGasHits.length === 0,
  prodGasHits.length ? JSON.stringify(prodGasHits.slice(0, 8)) : 'ok',
);

const feWorkerHits = driftHits.filter(
  (h) => h.file.startsWith('apps/workboard/') || h.file.startsWith('workers/api/'),
);
if (feWorkerHits.length > 0) {
  warnings.push(
    `Expected local/UAT ids in dev surfaces (${feWorkerHits.length} hits); block prod sheet writes via GAS assert`,
  );
}
push('DRIFT_SCAN_RAN', true, `total_hits=${driftHits.length} fe_worker=${feWorkerHits.length}`);

const failed = checks.filter((c) => !c.pass);
const result = failed.length === 0 ? (warnings.length ? 'GO_WITH_WARNINGS' : 'GO') : 'NO_GO';

const out = { suite: 'PHASE_DATA_REL_02_USER_REFERENCE', result, checks, warnings };
console.log(JSON.stringify(out, null, 2));
process.exit(failed.length ? 1 : 0);
