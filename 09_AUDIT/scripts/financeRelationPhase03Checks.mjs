#!/usr/bin/env node
/**
 * PHASE_DATA_REL_03 — finance FK contract static checks (no workbook).
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

const finSchema = read('01_SCHEMA/FINANCE_TRANSACTION_SCHEMA.md');
push('FIN_SCHEMA_DON_VI_REF', finSchema.includes('DON_VI_ID') && finSchema.includes('DON_VI'));

const finSvc = read('05_GAS_RUNTIME/30_FINANCE_SERVICE.js');
push('FIN_CREATE_USES_CbvMakeId', finSvc.includes("cbvMakeId('FIN')"));
const hasDonViGuard = /assertActiveDonViId/.test(finSvc);
push(
  'FIN_CREATE_DON_VI_GUARD_GAP_DOCUMENTED',
  !hasDonViGuard,
  hasDonViGuard ? 'unexpected guard present' : 'deferred to PHASE 05',
);
if (!hasDonViGuard) {
  warnings.push('createTransaction does not call assertActiveDonViId — deferred to PHASE 05');
}

const logFinanceBlock = finSvc.slice(finSvc.indexOf('function logFinance'));
const logHasParentCheck = logFinanceBlock.includes(
  '_findById(CBV_CONFIG.SHEETS.FINANCE_TRANSACTION, finId)',
);
push(
  'LOG_FINANCE_PARENT_GUARD_GAP_DOCUMENTED',
  !logHasParentCheck,
  logHasParentCheck ? 'guard already present' : 'deferred to PHASE 05',
);

const taskSvc = read('05_GAS_RUNTIME/20_TASK_SERVICE.js');
push('TASK_CREATE_HAS_DON_VI_GUARD', taskSvc.includes('assertActiveDonViId'));

const plan = read('09_AUDIT/PHASE_DATA_REL_03_FINANCE_RELATION_REPAIR_PLAN.md');
push('PLAN_DOC', plan.includes('VP54') && plan.includes('FIN_20260418'));

const audit = read('09_AUDIT/DATA_RELATIONSHIP_AUDIT_REPORT_20260603.md');
const planHasVp54 = plan.includes('VP54');
push(
  'VP54_DOCUMENTED_IN_AUDIT',
  audit.includes('VP54') && planHasVp54,
  'workbook-only code; not in GAS seed',
);

const failed = checks.filter((c) => !c.pass);
const result = failed.length === 0 ? (warnings.length ? 'GO_WITH_WARNINGS' : 'GO') : 'NO_GO';

const out = { suite: 'PHASE_DATA_REL_03_FINANCE_RELATION', result, checks, warnings };
console.log(JSON.stringify(out, null, 2));
process.exit(result === 'NO_GO' ? 1 : 0);
