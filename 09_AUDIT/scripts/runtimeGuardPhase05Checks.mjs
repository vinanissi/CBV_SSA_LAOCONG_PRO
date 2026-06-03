#!/usr/bin/env node
/**
 * PHASE_DATA_REL_05 — runtime write-path guard static verification.
 */
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..', '..');

const checks = [];
const warnings = [];

function push(id, pass, detail) {
  checks.push({ id, pass, detail: detail || undefined });
}

function read(rel) {
  return readFileSync(join(repoRoot, rel), 'utf8');
}

const taskSvc = read('05_GAS_RUNTIME/20_TASK_SERVICE.js');
push('TASK_CREATE_ASSERT_OWNER', /createTask[\s\S]*assertActiveUserId\(data\.OWNER_ID/.test(taskSvc));
push('TASK_CREATE_ASSERT_DON_VI', /createTask[\s\S]*assertActiveDonViId/.test(taskSvc));
push('CHECKLIST_DONE_ASSERT_USER', /markChecklistDone[\s\S]*assertActiveUserId\(actorId/.test(taskSvc));

const finSvc = read('05_GAS_RUNTIME/30_FINANCE_SERVICE.js');
push('FIN_CREATE_DON_VI_GUARD', /financeAssertOptionalDonViId_/.test(finSvc) && /createTransaction[\s\S]*financeAssertOptionalDonViId_/.test(finSvc));
push('FIN_UPDATE_DON_VI_GUARD', /updateDraftTransaction[\s\S]*financeAssertOptionalDonViId_/.test(finSvc));
push('LOG_FINANCE_PARENT_GUARD', /function logFinance[\s\S]*_findById\(CBV_CONFIG\.SHEETS\.FINANCE_TRANSACTION/.test(finSvc));
push('FIN_CONFIRM_USER_GUARD', /CONFIRMED_BY[\s\S]*financeAssertOptionalActiveUserId_/.test(finSvc));

const hosoSvc = read('05_GAS_RUNTIME/10_HOSO_SERVICE.js');
push('HOSO_ADD_RELATION_TARGET', /function addHosoRelation[\s\S]*hosoValidateRelationTarget/.test(hosoSvc));
push('HOSO_CREATE_RELATION_TARGET', /function createHoSoRelation[\s\S]*hosoValidateRelationTarget/.test(hosoSvc));
push('HOSO_CREATE_CTX_MASTER', /function createHoSoRelation[\s\S]*hosoRepoFindMasterById\(ctx\)/.test(hosoSvc));

const report = read('09_AUDIT/PHASE_DATA_REL_05_RUNTIME_GUARD_AUDIT_REPORT.md');
push('REPORT_EXISTS', report.includes('PHASE_DATA_REL_05'));

var logFn = taskSvc.match(/function _addTaskUpdateLog\([\s\S]*?\n\}/);
if (!logFn || !/assertActiveUserId/.test(logFn[0])) {
  warnings.push('TASK_UPDATE_LOG ACTOR_ID: email/system fallback by design (PHASE 02)');
}

const failed = checks.filter((c) => !c.pass);
const result = failed.length === 0 ? (warnings.length ? 'GO_WITH_WARNINGS' : 'GO') : 'NO_GO';

console.log(JSON.stringify({ suite: 'PHASE_DATA_REL_05_RUNTIME_GUARD', result, checks, warnings }, null, 2));
process.exit(result === 'NO_GO' ? 1 : 0);
