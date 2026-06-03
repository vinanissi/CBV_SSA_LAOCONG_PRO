#!/usr/bin/env node
/**
 * PHASE_DATA_REL_11 — GAS write-path guard coverage inventory (static).
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..', '..');

const checks = [];
const warnings = [];
const coverage = [];

function push(id, pass, detail) {
  checks.push({ id, pass, detail });
}

function read(rel) {
  return readFileSync(join(repoRoot, rel), 'utf8');
}

function fnBlock(src, name) {
  const m = src.match(new RegExp(`function ${name}[\\s\\S]*?(?=\\nfunction |$)`));
  return m ? m[0] : '';
}

const taskSvc = read('05_GAS_RUNTIME/20_TASK_SERVICE.js');
const finSvc = read('05_GAS_RUNTIME/30_FINANCE_SERVICE.js');
const hosoSvc = read('05_GAS_RUNTIME/10_HOSO_SERVICE.js');
const hosoVal = read('05_GAS_RUNTIME/10_HOSO_VALIDATION.js');
const sharedSvc = read('05_GAS_RUNTIME/45_SHARED_WITH_SERVICE.js');

const inventory = [
  { domain: 'TASK', fn: 'createTask', file: '20_TASK_SERVICE.js', tier: 'FULL_ACTIVE' },
  { domain: 'TASK', fn: 'updateTask', file: '20_TASK_SERVICE.js', tier: 'FULL_ACTIVE' },
  { domain: 'TASK', fn: 'assignTask', file: '20_TASK_SERVICE.js', tier: 'FULL_ACTIVE' },
  { domain: 'TASK', fn: 'markChecklistDone', file: '20_TASK_SERVICE.js', tier: 'FULL_ACTIVE' },
  { domain: 'TASK', fn: 'addChecklistItem', file: '20_TASK_SERVICE.js', tier: 'PARENT_FK' },
  { domain: 'TASK', fn: 'addTaskAttachment', file: '20_TASK_SERVICE.js', tier: 'ENUM_PARENT' },
  { domain: 'TASK', fn: '_addTaskUpdateLog', file: '20_TASK_SERVICE.js', tier: 'DEFERRED_ACTOR' },
  { domain: 'FINANCE', fn: 'createTransaction', file: '30_FINANCE_SERVICE.js', tier: 'FULL_ACTIVE_OPTIONAL' },
  { domain: 'FINANCE', fn: 'updateDraftTransaction', file: '30_FINANCE_SERVICE.js', tier: 'FULL_ACTIVE_OPTIONAL' },
  { domain: 'FINANCE', fn: 'logFinance', file: '30_FINANCE_SERVICE.js', tier: 'PARENT_FK' },
  { domain: 'FINANCE', fn: 'setFinanceStatus', file: '30_FINANCE_SERVICE.js', tier: 'FULL_ACTIVE_OPTIONAL' },
  { domain: 'FINANCE', fn: 'createFinanceAttachment', file: '30_FINANCE_SERVICE.js', tier: 'PARENT_FK' },
  { domain: 'HO_SO', fn: 'createHoSo', file: '10_HOSO_SERVICE.js', tier: 'EXISTS_REF' },
  { domain: 'HO_SO', fn: 'updateHoso', file: '10_HOSO_SERVICE.js', tier: 'EXISTS_REF' },
  { domain: 'HO_SO', fn: 'addHosoRelation', file: '10_HOSO_SERVICE.js', tier: 'RELATION_PAIR_REQUIRED' },
  { domain: 'HO_SO', fn: 'createHoSoRelation', file: '10_HOSO_SERVICE.js', tier: 'RELATION_PAIR_SYMMETRIC' },
  { domain: 'SHARED', fn: 'shareTaskWith', file: '45_SHARED_WITH_SERVICE.js', tier: 'GAP_NO_USER_ASSERT' },
];

for (const row of inventory) {
  const src = row.domain === 'TASK' ? taskSvc : row.domain === 'FINANCE' ? finSvc : row.domain === 'HO_SO' ? hosoSvc : sharedSvc;
  const block = fnBlock(src, row.fn);
  coverage.push({ ...row, hasFunction: block.length > 0 });
}

push('TASK_CREATE_GUARDS', /function createTask[\s\S]*assertActiveUserId/.test(taskSvc));
push('TASK_UPDATE_GUARDS', /function updateTask[\s\S]*assertActiveDonViId/.test(taskSvc));
push('CHECKLIST_DONE_GUARD', /function markChecklistDone[\s\S]*assertActiveUserId\(actorId/.test(taskSvc));
push('CHECKLIST_ADD_TASK_FK', /function addChecklistItem[\s\S]*taskFindById/.test(taskSvc));

push('FIN_CREATE_DON_VI', /function createTransaction[\s\S]*financeAssertOptionalDonViId_/.test(finSvc));
push('FIN_LOG_PARENT', /function logFinance[\s\S]*FINANCE_TRANSACTION/.test(finSvc));
push('FIN_CONFIRM_USER', /function setFinanceStatus[\s\S]*financeAssertOptionalActiveUserId_/.test(finSvc));

push('HOSO_USER_EXISTS_ONLY', /function hosoValidateOptionalRefUser/.test(hosoVal) && !/function hosoValidateOptionalRefUser[\s\S]*assertActiveUserId/.test(hosoVal));
push('HOSO_DON_VI_EXISTS_ONLY', /function hosoValidateOptionalRefDonVi/.test(hosoVal));
push('HOSO_ADD_REL_BOTH_REQUIRED', /function addHosoRelation[\s\S]*ensureRequired\(data\.RELATED_TABLE/.test(hosoSvc));
push('HOSO_CREATE_PAIR_GUARD', /function createHoSoRelation[\s\S]*hosoAssertRelatedRecordPair_/.test(hosoSvc));

const shareBlock = fnBlock(sharedSvc, '_updateSharedWith');
const shareHasUserAssert = /assertActiveUserId/.test(shareBlock);
push('SHARED_WITH_USER_GUARD', shareHasUserAssert, 'shareTaskWith/unshareTaskWith should assert ACTIVE user (gap)');
if (!shareHasUserAssert) {
  warnings.push('SHARED_WITH: shareTaskWith does not call assertActiveUserId — defer to PHASE 02 migration + guard follow-up');
}

const taskLogBlock = fnBlock(taskSvc, '_addTaskUpdateLog');
if (taskLogBlock && !/assertActiveUserId/.test(taskLogBlock)) {
  warnings.push('TASK_UPDATE_LOG ACTOR_ID: email/system fallback by design (PHASE 02)');
}
const hosoLogAppend = /function hosoAppendLogEntry[\s\S]*hosoValidateOptionalRefUser/.test(hosoSvc);
if (hosoLogAppend) {
  warnings.push('HO_SO_UPDATE_LOG: ACTOR_ID uses exists-only user ref, not ACTIVE status');
}

const failed = checks.filter((c) => !c.pass);
// SHARED_WITH gap is intentional warning — suite GO_WITH_WARNINGS unless structural checks fail
const structuralFailed = failed.filter((c) => c.id !== 'SHARED_WITH_USER_GUARD');
const result =
  structuralFailed.length > 0 ? 'NO_GO' : warnings.length || failed.length ? 'GO_WITH_WARNINGS' : 'GO';

console.log(
  JSON.stringify(
    {
      suite: 'PHASE_GAS_WRITE_GUARD_COVERAGE',
      phase: '11',
      result,
      coverage,
      checks,
      warnings,
    },
    null,
    2,
  ),
);
process.exit(structuralFailed.length ? 1 : 0);
