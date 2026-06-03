#!/usr/bin/env node
/**
 * PHASE_DATA_REL_13 — frontend / worker data contract vs TASK_KEY + USER mapping.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

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
];

const checks = [];
const warnings = [];

function push(id, pass, detail) {
  checks.push({ id, pass, detail });
}

function read(rel) {
  return readFileSync(join(repoRoot, rel), 'utf8');
}

function walk(dir, out = []) {
  try {
    for (const name of readdirSync(dir)) {
      const p = join(dir, name);
      if (name === 'node_modules' || name === '.git') continue;
      const st = statSync(p);
      if (st.isDirectory()) walk(p, out);
      else if (/\.(ts|tsx)$/.test(name)) out.push(p);
    }
  } catch {
    /* skip */
  }
  return out;
}

const contracts = read('apps/workboard/src/api/contracts.ts');
const workInboxTypes = read('apps/workboard/src/modules/task/types/workInboxTypes.ts');
const adapter = read('apps/workboard/src/modules/task/adapters/workInboxAdapter.ts');
const taskCreateForm = read('apps/workboard/src/modules/task/TaskCreateForm.tsx');
const buildPayload = read('apps/workboard/src/modules/task/inbox/create/buildTaskCreationPayload.ts');
const checklistManifest = read('apps/workboard/src/modules/task/inbox/checklist/checklistSheetSchemaManifest.ts');
const userCtx = read('workers/api/src/auth/userContext.ts');
const taskWriteStore = read('workers/api/src/adapters/taskWriteStore.ts');
const authorityIndex = read('03_SHARED/DATA_REL_AUTHORITY_INDEX.md');

push(
  'CONTRACTS_TASKID_IS_MAIN_ID',
  contracts.includes('taskId = TASK_MAIN.ID') && contracts.includes('Child sheet column TASK_ID'),
);
push('WORK_INBOX_TYPES_DOC', workInboxTypes.includes('TaskCardModel') && workInboxTypes.includes('id: string'));

const idKeysMatch = adapter.match(/const ID_KEYS = \[([^\]]+)\]/);
const idKeys = idKeysMatch ? idKeysMatch[1] : '';
push(
  'ADAPTER_TASKID_FIRST',
  /^[\s\S]*'taskId'/.test(idKeys) && idKeys.indexOf("'taskId'") < idKeys.indexOf("'code'"),
  idKeys.trim(),
);
push('ADAPTER_TYPED_TASK_ITEM', adapter.includes('isTypedTaskItem') && adapter.includes('r.taskId'));

push('CREATE_PAYLOAD_OWNER_ID', buildPayload.includes('ownerId: resolvedOwnerId'));
push('CREATE_FORM_USR_LOCAL_OPTIONS', taskCreateForm.includes('USR-LOCAL-STAFF'));
push('WORKER_STUB_USR_LOCAL', userCtx.includes('USR-LOCAL-MGR') && userCtx.includes('LOCAL_STUB'));

push(
  'CHECKLIST_MANIFEST_CHILD_TASK_ID',
  checklistManifest.includes("'TASK_ID'") && !checklistManifest.includes('TASK_MAIN'),
);

let badMainTaskId = 0;
for (const rootRel of ['apps/workboard/src', 'workers/api/src']) {
  const root = join(repoRoot, rootRel);
  for (const abs of walk(root)) {
    const text = readFileSync(abs, 'utf8');
    if (/TASK_MAIN\.TASK_ID\b/.test(text)) badMainTaskId++;
  }
}
push('NO_TASK_MAIN_DOT_TASK_ID_FE_WORKER', badMainTaskId === 0, `hits=${badMainTaskId}`);

const driftFiles = [];
for (const rootRel of ['apps/workboard/src', 'workers/api/src']) {
  for (const abs of walk(join(repoRoot, rootRel))) {
    const rel = relative(repoRoot, abs).replace(/\\/g, '/');
    const text = readFileSync(abs, 'utf8');
    for (const id of DRIFT_IDS) {
      if (text.includes(id)) driftFiles.push({ file: rel, id });
    }
  }
}
const uniqueDriftFiles = [...new Set(driftFiles.map((d) => d.file))];
push('DRIFT_ID_SCAN', true, `files=${uniqueDriftFiles.length} hits=${driftFiles.length}`);
if (uniqueDriftFiles.length > 0) {
  warnings.push(
    `USR-LOCAL-* in ${uniqueDriftFiles.length} FE/worker files (dev stub); GAS assertActiveUserId blocks prod sheet writes`,
  );
}

if (taskCreateForm.includes('assignee:') && !taskCreateForm.includes('ownerId')) {
  warnings.push('TaskCreateForm uses legacy assignee field — Work Inbox create path uses ownerId (buildTaskCreationPayload)');
}

if (adapter.includes("'code'") && idKeys.includes("'code'")) {
  warnings.push('workInboxAdapter ID_KEYS includes code — fallback only when taskId/id/TASK_ID absent');
}

push('AUTHORITY_INDEX_EXISTS', existsSync(join(repoRoot, '03_SHARED/DATA_REL_AUTHORITY_INDEX.md')));
push('TASK_WRITE_STORE_LOCAL', taskWriteStore.includes('TASK-WR-'));

const failed = checks.filter((c) => !c.pass);
const result = failed.length ? 'NO_GO' : warnings.length ? 'GO_WITH_WARNINGS' : 'GO';

console.log(
  JSON.stringify(
    {
      suite: 'PHASE_DATA_REL_13_FRONTEND_DATA_CONTRACT',
      phase: '13',
      result,
      checks,
      warnings,
      driftFileSample: uniqueDriftFiles.slice(0, 12),
    },
    null,
    2,
  ),
);
process.exit(failed.length ? 1 : 0);
